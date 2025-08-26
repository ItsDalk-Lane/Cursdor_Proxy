import { Plugin, Notice } from 'obsidian';
import { PluginSettings, DEFAULT_SETTINGS } from './settings/PluginSettings';
import { formScriptService } from './service/extend/FormScriptService';
import { formIntegrationService } from './service/command/FormIntegrationService';
import { applicationCommandService } from './service/command/ApplicationCommandService';
import { applicationFileViewService } from './service/file-view/ApplicationFileViewService';
import { ContextMenuService } from './service/context-menu/ContextMenuService';
import { FormStateManager } from './service/FormStateManager';
import { PluginSettingTab } from './settings/PluginSettingTab';
import './style/base.css'
import { FormFlowApi } from './api/FormFlowApi';
import { debugManager, DebugManager } from './utils/DebugManager';

// 导入新的核心架构组件
import { ServiceContainer, serviceContainer } from './core/ServiceContainer';
import { globalEventBus, FormFlowEvents } from './core/EventBus';
import { globalErrorHandler, ErrorType, ErrorSeverity } from './core/ErrorHandler';
import { globalPerformanceMonitor } from './core/PerformanceMonitor';

export default class FormPlugin extends Plugin {
	settings: PluginSettings = DEFAULT_SETTINGS;
	contextMenuService: ContextMenuService;
	formIntegrationService: any; // FormIntegrationService 实例
	api: FormFlowApi | null = null;
	debugManager = debugManager; // 调试管理器实例
	private serviceContainer: ServiceContainer;
	private performanceMetricId: string | null = null;
	private eventUnsubscribers: Array<() => void> = [];

	async onload() {
		// 开始性能监控
		this.performanceMetricId = globalPerformanceMonitor.startMetric('plugin-load', {
			pluginName: 'FormFlow',
			version: this.manifest.version
		});

		try {
			// 初始化服务容器
			this.serviceContainer = serviceContainer();
			this.initializeServices();

			// 加载设置
			await this.loadSettings();

			// 初始化API
			this.api = new FormFlowApi(this.app);
			
			// 初始化调试管理器
			debugManager.setDebugEnabled(this.settings.enableDebugLogging || false);
			
			// 初始化 FormStateManager 的调试模式
			const formStateManager = FormStateManager.getInstance('FormStateManager');
			formStateManager.setDebugMode(this.settings.enableDebugLogging || false);
			
			// 注册设置页面
			this.addSettingTab(new PluginSettingTab(this));
			
			// 初始化服务
			await this.initializePluginServices();
			
			// 设置事件监听器
			this.setupEventListeners();
			
			// 发布插件加载完成事件
			globalEventBus.emit(FormFlowEvents.PLUGIN_LOADED, {
				plugin: this,
				version: this.manifest.version
			}, 'FormPlugin');

		} catch (error) {
			globalErrorHandler.handleError({
				type: ErrorType.PLUGIN_API,
				severity: ErrorSeverity.CRITICAL,
				message: 'Plugin initialization failed',
				source: 'FormPlugin.onload',
				details: error
			});
			throw error;
		} finally {
			// 结束性能监控
			if (this.performanceMetricId) {
				globalPerformanceMonitor.endMetric(this.performanceMetricId);
				this.performanceMetricId = null;
			}
		}
		
		// 设置布局就绪回调
		this.setupLayoutReady();
	}
		
	/**
	 * 初始化服务容器和核心服务
	 */
	private initializeServices(): void {
		// 注册核心服务到容器
		this.serviceContainer.register('EventBus', () => globalEventBus);
		this.serviceContainer.register('ErrorHandler', () => globalErrorHandler);
		this.serviceContainer.register('PerformanceMonitor', () => globalPerformanceMonitor);
		this.serviceContainer.register('Plugin', () => this);
	}

	/**
	 * 初始化插件服务
	 */
	private async initializePluginServices(): Promise<void> {
		const metricId = globalPerformanceMonitor.startMetric('plugin-services-init');
		
		try {
			await applicationCommandService.initialize(this);
			await applicationFileViewService.initialize(this);
			await formIntegrationService.initialize(this);
			this.formIntegrationService = formIntegrationService;
			this.contextMenuService = new ContextMenuService(this);
			this.contextMenuService.initialize();
		} finally {
			globalPerformanceMonitor.endMetric(metricId);
		}
	}

	/**
	 * 设置事件监听器
	 */
	private setupEventListeners(): void {
		// 监听文件删除事件
		this.registerEvent(
			this.app.vault.on('delete', (file) => this.handleFileDelete(file))
		);
		
		// 监听文件修改事件
		this.registerEvent(
			this.app.vault.on('modify', (file) => this.handleFileModify(file))
		);
		
		// 监听性能警告事件
		const perfWarningUnsubscriber = globalEventBus.on(FormFlowEvents.PERFORMANCE_WARNING, (data) => {
			if (this.settings.enableDebugLogging) {
				console.warn('Performance warning:', data);
			}
		});
		
		this.eventUnsubscribers.push(perfWarningUnsubscriber);
	}

	/**
	 * 处理文件删除事件
	 */
	private async handleFileDelete(file: any): Promise<void> {
		await globalErrorHandler.safeExecute(
			async () => {
				debugManager.log("FormPlugin", `文件删除事件触发: ${file.path}`);
				const isFormFile = file.path.endsWith('.json') || file.path.endsWith('.cform');
				
				if (isFormFile) {
					const isRegistered = this.formIntegrationService.isEnable(file.path);
					
					if (isRegistered) {
						await this.formIntegrationService.unregister(file.path);
						debugManager.log("FormPlugin", `表单注销完成: ${file.path}`);
						
						// 发布文件删除事件
						globalEventBus.emit(FormFlowEvents.FILE_DELETED, {
							filePath: file.path,
							isFormFile: true,
							wasRegistered: true
						}, 'FormPlugin');
					}
				}
			},
			{
				type: ErrorType.FILE_SYSTEM,
				severity: ErrorSeverity.MEDIUM,
				message: 'Failed to handle file delete event',
				source: 'FormPlugin.handleFileDelete'
			}
		);
	}

	/**
	 * 处理文件修改事件
	 */
	private async handleFileModify(file: any): Promise<void> {
		await globalErrorHandler.safeExecute(
			async () => {
				debugManager.log("FormPlugin", `文件修改事件触发: ${file.path}`);
				const isFormFile = file.path.endsWith('.json') || file.path.endsWith('.cform');
				
				if (isFormFile) {
					const isRegistered = this.formIntegrationService.isEnable(file.path);
					
					if (this.settings.enableDebugLogging) {
						new Notice(`FormFlow: 检测到表单文件修改 ${file.path}`, 2000);
					}
					
					if (isRegistered) {
						await this.formIntegrationService.register(file.path);
						debugManager.log("FormPlugin", `表单重新注册完成: ${file.path}`);
					} else {
						this.contextMenuService.unregisterFormFieldsByPath(file.path);
						debugManager.log("FormPlugin", `未注册表单的右键菜单字段已移除: ${file.path}`);
					}
					
					// 发布文件更新事件
					globalEventBus.emit(FormFlowEvents.FILE_UPDATED, {
						filePath: file.path,
						isFormFile: true,
						isRegistered
					}, 'FormPlugin');
				}
			},
			{
				type: ErrorType.FILE_SYSTEM,
				severity: ErrorSeverity.MEDIUM,
				message: 'Failed to handle file modify event',
				source: 'FormPlugin.handleFileModify'
			}
		);
	}

	/**
	 * 在布局准备好后初始化
	 */
	private setupLayoutReady(): void {
		this.app.workspace.onLayoutReady(async () => {
			await globalErrorHandler.safeExecute(
				async () => {
					formIntegrationService.clearStale();
					formScriptService.initialize(this.app, this.settings.scriptFolder);
				},
				{
					type: ErrorType.PLUGIN_API,
					severity: ErrorSeverity.MEDIUM,
					message: 'Failed to initialize on layout ready',
					source: 'FormPlugin.onLayoutReady'
				}
			);
		});
	}

	onunload() {
		try {
			// 发布插件卸载事件
			globalEventBus.emit(FormFlowEvents.PLUGIN_UNLOADED, {
				plugin: this
			}, 'FormPlugin');

			// 清理事件监听器
			this.eventUnsubscribers.forEach(unsubscriber => {
				try {
					unsubscriber();
				} catch (error) {
					console.error('Error unsubscribing event listener:', error);
				}
			});
			this.eventUnsubscribers = [];

			// 清理服务
			formScriptService.unload();
			applicationCommandService.unload(this);
			applicationFileViewService.unload(this);
			if (this.contextMenuService) {
				this.contextMenuService.unload();
			}
			
			// 重置单例对象，防止内存泄漏和状态累积
			FormStateManager.resetInstance();
			DebugManager.resetInstance();
			
			// 清理服务容器
			if (this.serviceContainer) {
				this.serviceContainer.dispose();
			}
			
			// 清理全局组件（仅在插件完全卸载时）
			ServiceContainer.resetInstance();
			
			// 清理API引用
			this.api = null;
			
			console.log('[FormFlow] Plugin unloaded successfully');
		} catch (error) {
			console.error('[FormFlow] Error during plugin unload:', error);
		}
	}

	async loadSettings() {
		// 加载主插件设置
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);


	}

	async replaceSettings(value: Partial<PluginSettings>) {
		this.settings = Object.assign({}, this.settings, value);
		await this.saveSettings();
	}

	async saveSettings() {
		await this.saveData(this.settings);
		
		// 同步更新调试管理器状态
		debugManager.setDebugEnabled(this.settings.enableDebugLogging || false);
		
		// 同步更新 FormStateManager 的调试模式
		const formStateManager = FormStateManager.getInstance('FormStateManager');
		formStateManager.setDebugMode(this.settings.enableDebugLogging || false);
		
		formScriptService.refresh(this.settings.scriptFolder);
		formIntegrationService.initialize(this);
	}
}
