import { Plugin } from 'obsidian';
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

export default class FormPlugin extends Plugin {
	settings: PluginSettings = DEFAULT_SETTINGS;
	contextMenuService: ContextMenuService;
	formIntegrationService: any; // FormIntegrationService 实例
	api: FormFlowApi;

	async onload() {
		await this.loadSettings();
		this.api = new FormFlowApi(this.app);
		
		// 初始化 FormStateManager 的调试模式
		const formStateManager = FormStateManager.getInstance();
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
				if (this.settings?.enableDebugLogging) {
					console.log(`[FormFlow Debug] 文件删除事件触发: ${file.path}`);
					console.log(`[FormFlow Debug] 文件类型检查: 是否为JSON文件 = ${file.path.endsWith('.json')}`);
				}
				
				if (file.path.endsWith('.json')) {
					const isRegistered = this.formIntegrationService.isEnable(file.path);
					if (this.settings?.enableDebugLogging) {
						console.log(`[FormFlow Debug] 表单注册状态检查: ${file.path} 是否已注册 = ${isRegistered}`);
					}
					
					if (isRegistered) {
						if (this.settings?.enableDebugLogging) {
							console.log(`[FormFlow Debug] 开始清理已注册表单: ${file.path}`);
							// 记录清理前的右键菜单字段状态
							const registeredFields = this.contextMenuService.getRegisteredFields();
							console.log(`[FormFlow Debug] 清理前右键菜单注册字段数量: ${registeredFields.length}`);
							console.log(`[FormFlow Debug] 清理前注册字段详情:`, registeredFields);
						}
						
						try {
							await this.formIntegrationService.unregister(file.path);
							
							if (this.settings?.enableDebugLogging) {
								console.log(`[FormFlow Debug] 表单注销完成: ${file.path}`);
								// 记录清理后的右键菜单字段状态
								const remainingFields = this.contextMenuService.getRegisteredFields();
								console.log(`[FormFlow Debug] 清理后右键菜单注册字段数量: ${remainingFields.length}`);
								console.log(`[FormFlow Debug] 清理后注册字段详情:`, remainingFields);
							}
						} catch (error) {
							if (this.settings?.enableDebugLogging) {
								console.error(`[FormFlow Debug] 表单注销失败: ${file.path}`, error);
							}
						}
					}
				}
			})
		);

		// 监听文件修改事件，自动重新注册表单
		this.registerEvent(
			this.app.vault.on('modify', async (file) => {
				if (this.settings?.enableDebugLogging) {
					console.log(`[FormFlow Debug] 文件修改事件触发: ${file.path}`);
					console.log(`[FormFlow Debug] 文件类型检查: 是否为JSON文件 = ${file.path.endsWith('.json')}`);
				}
				
				if (file.path.endsWith('.json')) {
					const isRegistered = this.formIntegrationService.isEnable(file.path);
					if (this.settings?.enableDebugLogging) {
						console.log(`[FormFlow Debug] 表单注册状态检查: ${file.path} 是否已注册 = ${isRegistered}`);
					}
					
					if (isRegistered) {
						if (this.settings?.enableDebugLogging) {
							console.log(`[FormFlow Debug] 开始重新注册已修改的表单: ${file.path}`);
							// 记录重新注册前的右键菜单字段状态
							const registeredFieldsBefore = this.contextMenuService.getRegisteredFields();
							console.log(`[FormFlow Debug] 重新注册前右键菜单注册字段数量: ${registeredFieldsBefore.length}`);
							console.log(`[FormFlow Debug] 重新注册前注册字段详情:`, registeredFieldsBefore);
						}
						
						try {
							await this.formIntegrationService.register(file.path);
							
							if (this.settings?.enableDebugLogging) {
								console.log(`[FormFlow Debug] 表单重新注册完成: ${file.path}`);
								// 记录重新注册后的右键菜单字段状态
								const registeredFieldsAfter = this.contextMenuService.getRegisteredFields();
								console.log(`[FormFlow Debug] 重新注册后右键菜单注册字段数量: ${registeredFieldsAfter.length}`);
								console.log(`[FormFlow Debug] 重新注册后注册字段详情:`, registeredFieldsAfter);
							}
						} catch (error) {
							if (this.settings?.enableDebugLogging) {
								console.error(`[FormFlow Debug] 表单重新注册失败: ${file.path}`, error);
							}
						}
					}
				}
			})
		);
		
		this.app.workspace.onLayoutReady(async () => {
			formIntegrationService.clearStale();
			formScriptService.initialize(this.app, this.settings.scriptFolder);
		});
	}

	onunload() {
		formScriptService.unload();
		applicationCommandService.unload(this);
		applicationFileViewService.unload(this);
		if (this.contextMenuService) {
			this.contextMenuService.unload();
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
		formScriptService.refresh(this.settings.scriptFolder)
		formIntegrationService.initialize(this);
	}
}
