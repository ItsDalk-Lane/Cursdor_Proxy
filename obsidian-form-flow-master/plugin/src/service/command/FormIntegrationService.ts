import { App, TFile, MarkdownView } from "obsidian";
import { FormService } from "../FormService";
import { ContextMenuService } from "../context-menu/ContextMenuService";
import { FormConfig } from "src/model/FormConfig";
import FormPlugin from "src/main";

export class FormIntegrationService {

    plugin: FormPlugin;

    private PREFIX = "@CFORM";

    /**
     * 调试日志输出
     */
    private debugLog(message: string, ...args: any[]): void {
        if (this.plugin?.settings?.enableDebugLogging) {
            console.log(`[FormFlow Debug] FormIntegrationService: ${message}`, ...args);
        }
    }

    getId(filePath: string) {
        return `${this.PREFIX}_${filePath}`;
    }

    getShortcut(filePath: string, app: App) {
        // get the shortcut for the file entrypoint
        const entrypointId = this.getId(filePath);
        const commandId = "form:" + entrypointId;
        const hotkeyMap = app.hotkeyManager.customKeys;
        if (hotkeyMap && commandId in hotkeyMap) {
            const hotkeys = hotkeyMap[commandId] || [];
            return hotkeys.map(hotkey => {
                const modifiers = hotkey.modifiers || [];
                const key = hotkey.key;
                const allKey = [...modifiers, key].join("+");
                return allKey;
            })
        }

        const command = app.commands.findCommand(commandId);
        if (command) {
            const hotkeys = command.hotkeys || [];
            return hotkeys.map(hotkey => {
                const modifiers = hotkey.modifiers || [];
                const key = hotkey.key;
                const allKey = [...modifiers, key].join("+");
                return allKey;
            })
        }
        return [];
    }

    /**
     * Register the entry point for the form file.
     * @param plugin The FormPlugin instance.
     */
    async initialize(plugin: FormPlugin) {
        this.plugin = plugin;
        const settings = plugin.settings || {}
        const app = plugin.app;
        const entrypoints = settings.formIntegrations || {};
        const keys = Object.keys(entrypoints);
        for (const key of keys) {
            const file = app.vault.getAbstractFileByPath(key);
            if (!(file instanceof TFile)) {
                plugin.removeCommand(`${this.getId(key)}`);
            } else {
                const entrypoint = entrypoints[key];
                if (entrypoint.asCommand) {
                    plugin.addCommand({
                        id: `${this.getId(file.path)}`,
                        name: `@${file.basename}`,
                        icon: "file-spreadsheet",
                        callback: async () => {
                            await this.executeFormCommand(file, app);
                        }
                    });
                    
                    // 同时注册右键菜单字段
                    await this.registerContextMenuFields(file.path);
                }
            }
        }
    }

    isEnable(filePath: string) {
        const settings = this.plugin.settings || {};
        const enable = settings.formIntegrations[filePath]?.asCommand ?? false;
        return enable;
    }

    async register(filePath: string) {
        this.debugLog(`[FormIntegrationService] 开始注册表单: ${filePath}`);
        
        const app = this.plugin.app;
        const file = app.vault.getAbstractFileByPath(filePath);
        if (!(file instanceof TFile)) {
            this.debugLog(`[FormIntegrationService] 文件不存在: ${filePath}`);
            throw new Error(`File not found: ${filePath}`);
        }
        
        this.debugLog(`[FormIntegrationService] 文件存在，开始注册流程`);

        const settings = this.plugin.settings || {};
        const wasAlreadyRegistered = settings.formIntegrations && settings.formIntegrations[filePath];
        this.debugLog(`[FormIntegrationService] 表单之前是否已注册: ${!!wasAlreadyRegistered}`);
        
        const newSettings = {
            ...settings,
            formIntegrations: {
                ...settings.formIntegrations,
                [filePath]: {
                    ...settings.formIntegrations[filePath],
                    asCommand: true,
                },
            },
        }
        
        this.debugLog(`[FormIntegrationService] 更新插件设置`);
        this.plugin.replaceSettings(newSettings);
        
        this.debugLog(`[FormIntegrationService] 清理过期配置`);
        await this.clearStale();

        // 注册Obsidian命令
        const commandId = this.getId(filePath);
        this.debugLog(`[FormIntegrationService] 注册Obsidian命令: ${commandId}`);
        this.plugin.addCommand({
            id: commandId,
            name: `@${file.basename}`,
            icon: "file-spreadsheet",
            callback: async () => {
                await this.executeFormCommand(file, app);
            }
        });
        
        // 同时注册右键菜单字段
        this.debugLog(`[FormIntegrationService] 开始注册右键菜单字段`);
        await this.registerContextMenuFields(filePath);
        
        this.debugLog(`[FormIntegrationService] 表单注册完成: ${filePath}`);
    }
    
    /**
     * 执行表单命令，支持选中内容和文件内容处理
     * @param file 表单文件
     * @param app Obsidian应用实例
     */
    private async executeFormCommand(file: TFile, app: App, rightClickFieldId?: string): Promise<void> {
        try {
            // 读取表单配置
            const content = await app.vault.read(file);
            const formConfig: FormConfig = JSON.parse(content);
            
            // 获取当前活动的编辑器和视图
             const activeView = app.workspace.getActiveViewOfType(MarkdownView);
            if (!activeView) {
                // 没有活动的Markdown视图，直接打开表单
                new FormService().openForm(formConfig, app);
                return;
            }
            
            const editor = activeView.editor;
            const selectedText = editor.getSelection();
            
            // 如果指定了右键字段ID（来自右键菜单触发）
            if (rightClickFieldId) {
                const field = formConfig.fields?.find(f => f.id === rightClickFieldId);
                if (field) {
                    const formData = new Map<string, any>();
                    
                    if (selectedText) {
                        // 使用选中内容
                        formData.set(field.id, selectedText);
                    } else {
                        // 使用整个文件内容
                        const fileContent = activeView.data;
                        const extractedContent = this.extractMainContent(fileContent);
                        formData.set(field.id, extractedContent);
                    }
                    
                    // 强制直接执行表单
                    const formService = new FormService();
                    await formService.openFormWithData(formConfig, formData, app, true);
                    return;
                }
            }
            
            // 检查表单是否有支持右键提交的字段（命令面板和快捷键触发时）
            const rightClickFields = formConfig.fields?.filter(field => {
                const isTextType = field.type === 'text' || field.type === 'textarea';
                return isTextType && field.rightClickSubmit === true;
            }) || [];
            
            if (rightClickFields.length === 0) {
                // 没有支持右键提交的字段，直接打开表单
                new FormService().openForm(formConfig, app);
                return;
            }
            
            // 如果只有一个支持右键提交的字段，直接使用
            if (rightClickFields.length === 1) {
                const field = rightClickFields[0];
                const formData = new Map<string, any>();
                
                if (selectedText) {
                    // 使用选中内容
                    formData.set(field.id, selectedText);
                } else {
                    // 使用整个文件内容
                    const fileContent = activeView.data;
                    const extractedContent = this.extractMainContent(fileContent);
                    formData.set(field.id, extractedContent);
                }
                
                // 强制直接执行表单
                const formService = new FormService();
                await formService.openFormWithData(formConfig, formData, app, true);
                return;
            }
            
            // 多个字段时，直接打开表单界面让用户选择
            new FormService().openForm(formConfig, app);
            
        } catch (error) {
            console.error(`执行表单命令时发生错误:`, error);
            // 出错时回退到原始行为
            new FormService().open(file, app);
        }
    }
    
    /**
     * 提取正文内容，清除属性数据
     * @param content 文件内容
     * @returns 提取的正文内容
     */
    private extractMainContent(content: string): string {
        // 移除YAML前置数据
        let result = content.replace(/^---[\s\S]*?---\n?/, '');
        
        // 移除行内属性 [key:: value]
        result = result.replace(/\[\w+::[^\]]*\]/g, '');
        
        // 移除块属性 key:: value
        result = result.replace(/^\w+::\s*.*$/gm, '');
        
        // 清理多余的空行
        result = result.replace(/\n{3,}/g, '\n\n');
        
        return result.trim();
    }
    
    /**
     * 注册表单的右键菜单字段
     */
    public async registerContextMenuFields(filePath: string): Promise<void> {
        this.debugLog(`[FormIntegrationService] 开始注册右键菜单字段: ${filePath}`);
        
        const file = this.plugin.app.vault.getAbstractFileByPath(filePath);
        if (!(file instanceof TFile)) {
            this.debugLog(`[FormIntegrationService] 文件不存在或不是有效文件: ${filePath}`);
            console.warn(`文件不存在或不是有效文件: ${filePath}`);
            return;
        }
        
        this.debugLog(`[FormIntegrationService] 文件存在，开始读取表单配置`);
        
        try {
            // 读取表单配置
            const content = await this.plugin.app.vault.read(file);
            this.debugLog(`[FormIntegrationService] 成功读取文件内容，长度: ${content.length}`);
            
            const formConfig: FormConfig = JSON.parse(content);
            this.debugLog(`[FormIntegrationService] 成功解析表单配置，表单ID: ${formConfig.id}, 字段数量: ${formConfig.fields?.length || 0}`);
            
            // 获取右键菜单服务实例
            const contextMenuService = this.plugin.contextMenuService;
            if (contextMenuService) {
                this.debugLog(`[FormIntegrationService] ContextMenuService 实例存在，开始注册字段`);
                
                // 注册表单字段到右键菜单（传入文件路径）
                contextMenuService.registerFormFields(formConfig, file.basename, file.path);
                this.debugLog(`[FormIntegrationService] 已注册表单 "${file.basename}" 的右键菜单字段，文件路径: ${file.path}`);
            } else {
                this.debugLog(`[FormIntegrationService] ContextMenuService 实例不存在，无法注册右键菜单字段`);
                console.warn("ContextMenuService 实例不存在，无法注册右键菜单字段");
            }
        } catch (error) {
            this.debugLog(`[FormIntegrationService] 注册表单右键菜单字段时发生错误: ${error}`);
            console.error(`注册表单 "${file.basename}" 的右键菜单字段时发生错误:`, error);
        }
    }

    async unregister(filePath: string) {
        this.debugLog(`[FormIntegrationService] 开始注销表单: ${filePath}`);
        
        // 移除Obsidian命令
        const commandId = this.getId(filePath);
        this.debugLog(`[FormIntegrationService] 移除Obsidian命令: ${commandId}`);
        this.plugin.removeCommand(commandId);
        
        // 取消注册右键菜单字段
        this.debugLog(`[FormIntegrationService] 开始取消注册右键菜单字段`);
        await this.unregisterContextMenuFields(filePath);
        
        // 更新设置
        this.debugLog(`[FormIntegrationService] 更新插件设置，移除表单集成配置`);
        const settings = this.plugin.settings || {};
        const entrypoints = settings.formIntegrations || {};
        const hadEntry = filePath in entrypoints;
        this.debugLog(`[FormIntegrationService] 设置中是否存在该表单配置: ${hadEntry}`);
        
        delete entrypoints[filePath];
        this.plugin.replaceSettings({
            ...settings,
            formIntegrations: entrypoints
        });
        
        this.debugLog(`[FormIntegrationService] 开始清理过期配置`);
        await this.clearStale();
        
        this.debugLog(`[FormIntegrationService] 表单注销完成: ${filePath}`);
    }
    
    /**
     * 取消注册表单的右键菜单字段
     */
    public async unregisterContextMenuFields(filePath: string): Promise<void> {
        try {
            this.debugLog(`[FormIntegrationService] 开始取消注册右键菜单字段: ${filePath}`);
            
            // 获取右键菜单服务实例
            const contextMenuService = this.plugin.contextMenuService;
            if (!contextMenuService) {
                this.debugLog(`[FormIntegrationService] ContextMenuService 实例不存在，无法取消注册右键菜单字段`);
                console.warn("ContextMenuService 实例不存在，无法取消注册右键菜单字段");
                return;
            }
            
            this.debugLog(`[FormIntegrationService] ContextMenuService 实例存在，开始处理字段注销`);
            
            // 尝试从文件路径获取formId
            const file = this.plugin.app.vault.getAbstractFileByPath(filePath);
            this.debugLog(`[FormIntegrationService] 文件查找结果: ${file ? '文件存在' : '文件不存在'}`);
            
            if (file instanceof TFile) {
                try {
                    this.debugLog(`[FormIntegrationService] 文件存在，尝试读取配置获取formId`);
                    // 文件存在，读取配置获取formId
                    const content = await this.plugin.app.vault.read(file);
                    const formConfig: FormConfig = JSON.parse(content);
                    this.debugLog(`[FormIntegrationService] 成功解析表单配置，formId: ${formConfig.id}`);
                    
                    contextMenuService.unregisterFormFields(formConfig.id);
                    this.debugLog(`[FormIntegrationService] 已通过formId取消注册表单 "${file.basename}" 的右键菜单字段`);
                    return;
                } catch (readError) {
                    this.debugLog(`[FormIntegrationService] 读取表单文件失败: ${readError}`);
                    console.warn(`无法读取表单文件 "${filePath}"，尝试使用文件路径清理:`, readError);
                }
            }
            
            // 文件不存在或读取失败，使用文件路径进行清理
            this.debugLog(`[FormIntegrationService] 使用文件路径进行清理`);
            contextMenuService.unregisterFormFieldsByPath(filePath);
            this.debugLog(`[FormIntegrationService] 已通过文件路径取消注册表单 "${filePath}" 的右键菜单字段`);
            
        } catch (error) {
            this.debugLog(`[FormIntegrationService] 取消注册表单右键菜单字段时发生错误: ${error}`);
            console.error(`取消注册表单右键菜单字段时发生错误:`, error);
        }
    }

    /**
     * 执行右键菜单触发的表单命令
     * @param filePath 表单文件路径
     * @param fieldId 右键提交字段ID
     * @param app Obsidian应用实例
     */
    async executeRightClickCommand(filePath: string, fieldId: string, app: App): Promise<void> {
        try {
            const file = app.vault.getAbstractFileByPath(filePath);
            if (file instanceof TFile) {
                await this.executeFormCommand(file, app, fieldId);
            } else {
                console.error(`表单文件不存在: ${filePath}`);
            }
        } catch (error) {
            console.error(`执行右键菜单表单命令时发生错误:`, error);
        }
    }

    async clearStale() {
        const settings = this.plugin.settings || {}
        const app = this.plugin.app;
        const entrypoints = settings.formIntegrations || {};
        const keys = Object.keys(entrypoints);
        for (const key of keys) {
            const file = app.vault.getAbstractFileByPath(key);
            if (!(file instanceof TFile)) {
                delete entrypoints[key];
            }
        }
        this.plugin.replaceSettings({
            ...settings,
            formIntegrations: entrypoints
        });
    }
}

export const formIntegrationService = new FormIntegrationService();