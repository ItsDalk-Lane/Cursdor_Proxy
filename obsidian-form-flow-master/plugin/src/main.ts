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

export default class FormPlugin extends Plugin {
	settings: PluginSettings = DEFAULT_SETTINGS;
	contextMenuService: ContextMenuService;
	formIntegrationService: any; // FormIntegrationService 实例
	api: FormFlowApi | null = null;
	debugManager = debugManager; // 调试管理器实例

	async onload() {
		await this.loadSettings();
		this.api = new FormFlowApi(this.app);
		
		// 初始化调试管理器
		debugManager.setDebugEnabled(this.settings.enableDebugLogging || false);
		
		// 初始化 FormStateManager 的调试模式
		const formStateManager = FormStateManager.getInstance('FormStateManager');
		formStateManager.setDebugMode(this.settings.enableDebugLogging || false);
		
		this.addSettingTab(new PluginSettingTab(this));
		await applicationCommandService.initialize(this);
		await applicationFileViewService.initialize(this);
		await formIntegrationService.initialize(this);
		this.formIntegrationService = formIntegrationService;
		this.contextMenuService = new ContextMenuService(this);
		this.contextMenuService.initialize();
		
		// 监听文件删除事件，自动清理已注册的表单
		this.registerEvent(
			this.app.vault.on('delete', async (file) => {
				debugManager.log("FormPlugin", `文件删除事件触发: ${file.path}`);
				const isFormFile = file.path.endsWith('.json') || file.path.endsWith('.cform');
				debugManager.log("FormPlugin", `文件类型检查: 是否为表单文件 = ${isFormFile}`);
				
				
				if (isFormFile) {
					const isRegistered = this.formIntegrationService.isEnable(file.path);
					debugManager.log("FormPlugin", `表单注册状态检查: ${file.path} 是否已注册 = ${isRegistered}`);
					
					
					if (isRegistered) {
					debugManager.log("FormPlugin", `开始清理已注册表单: ${file.path}`);
					// 记录清理前的右键菜单字段状态
					const registeredFields = this.contextMenuService.getRegisteredFields();
					debugManager.log("FormPlugin", `清理前右键菜单注册字段数量: ${registeredFields.length}`);
					debugManager.log("FormPlugin", `清理前注册字段详情:`, registeredFields);
					
					try {
						await this.formIntegrationService.unregister(file.path);
						
						debugManager.log("FormPlugin", `表单注销完成: ${file.path}`);
						// 记录清理后的右键菜单字段状态
						const remainingFields = this.contextMenuService.getRegisteredFields();
						debugManager.log("FormPlugin", `清理后右键菜单注册字段数量: ${remainingFields.length}`);
						debugManager.log("FormPlugin", `清理后注册字段详情:`, remainingFields);
				} catch (error) {
					debugManager.error("FormPlugin", `表单注销失败: ${file.path}`, error);
				}
			}
			}
		})
	);

		// 监听文件修改事件，自动重新注册表单
		this.registerEvent(
			this.app.vault.on('modify', async (file) => {
				debugManager.log("FormPlugin", `文件修改事件触发: ${file.path}`);
				const isFormFile = file.path.endsWith('.json') || file.path.endsWith('.cform');
				debugManager.log("FormPlugin", `文件类型检查: 是否为表单文件 = ${isFormFile}`);
				
				if (isFormFile) {
					const isRegistered = this.formIntegrationService.isEnable(file.path);
					debugManager.log("FormPlugin", `表单注册状态检查: ${file.path} 是否已注册 = ${isRegistered}`);
					
					// 记录重新注册前的右键菜单字段状态
					const registeredFieldsBefore = this.contextMenuService.getRegisteredFields();
					debugManager.log("FormPlugin", `重新注册前右键菜单注册字段数量: ${registeredFieldsBefore.length}`);
					debugManager.log("FormPlugin", `重新注册前注册字段详情:`, registeredFieldsBefore);
					
					// 添加用户可见的通知，帮助确认实时更新是否工作
					if (this.settings.enableDebugLogging) {
						new Notice(`FormFlow: 检测到表单文件修改 ${file.path}`, 2000);
					}
					
					if (isRegistered) {
						debugManager.log("FormPlugin", `开始重新注册已修改的表单: ${file.path}`);
						try {
							await this.formIntegrationService.register(file.path);
							debugManager.log("FormPlugin", `表单重新注册完成: ${file.path}`);
							if (this.settings.enableDebugLogging) {
								new Notice(`FormFlow: 已注册表单重新注册完成`, 2000);
							}
						} catch (error) {
							debugManager.error("FormPlugin", `表单重新注册失败: ${file.path}`, error);
						}
					} else {
						// 表单未注册为命令，需要移除其右键菜单字段
						debugManager.log("FormPlugin", `表单未注册为命令，移除右键菜单字段: ${file.path}`);
						// 取消注册该表单的右键菜单字段
						this.contextMenuService.unregisterFormFieldsByPath(file.path);
						debugManager.log("FormPlugin", `未注册表单的右键菜单字段已移除: ${file.path}`);
						if (this.settings.enableDebugLogging) {
							new Notice(`FormFlow: 未注册表单的右键菜单字段已移除`, 2000);
						}
					}
					
					// 记录重新注册后的右键菜单字段状态
					const registeredFieldsAfter = this.contextMenuService.getRegisteredFields();
					debugManager.log("FormPlugin", `重新注册后右键菜单注册字段数量: ${registeredFieldsAfter.length}`);
					debugManager.log("FormPlugin", `重新注册后注册字段详情:`, registeredFieldsAfter);
				}
			})
		);
		
		this.app.workspace.onLayoutReady(async () => {
			formIntegrationService.clearStale();
			formScriptService.initialize(this.app, this.settings.scriptFolder);
		});
	}

	onunload() {
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
		
		// 清理API引用
		this.api = null;
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
