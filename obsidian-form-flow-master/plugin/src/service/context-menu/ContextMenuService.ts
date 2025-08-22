import { App, Editor, Menu, TFile } from "obsidian";
import FormPlugin from "src/main";
import { localInstance } from "src/i18n/locals";
import { FormField } from "src/model/field/IFormField";
import { IFormField } from "src/model/field/IFormField";
import { FormFieldType } from "src/model/enums/FormFieldType";
import { FormService } from "../FormService";
import { FormConfig } from "src/model/FormConfig";
import { debugManager } from "../../utils/DebugManager";
import { BaseService } from "../BaseService";
// 移除静态导入，改为动态导入以避免循环依赖
// import { FormIntegrationService } from "../FormIntegrationService";

/**
 * 右键菜单字段注册信息
 * 重构：移除formConfig副本，改为存储文件路径，执行时动态读取原始文件
 */
interface RegisteredField {
    formId: string;
    formName: string;
    fieldId: string;
    fieldLabel: string;
    fieldType: FormFieldType;
    formFilePath: string; // 存储表单文件路径而不是配置副本
}

/**
 * 右键菜单服务
 * 负责处理编辑器和文件的右键菜单功能
 * 新架构：表单注册为命令时同时注册右键菜单项
 */
export class ContextMenuService extends BaseService {
    private plugin: FormPlugin;
    private app: App;

    private static instance: ContextMenuService | null = null;
    private registeredFields: Map<string, RegisteredField> = new Map();

    constructor(plugin: FormPlugin) {
        super('ContextMenuService');
        this.plugin = plugin;
        this.app = plugin.app;

        ContextMenuService.instance = this;
    }

    /**
     * 获取ContextMenuService实例
     */
    static getInstance(): ContextMenuService | null {
        return ContextMenuService.instance;
    }

    /**
     * 初始化右键菜单服务
     */
    initialize() {
        this.debugLog("ContextMenuService: 初始化右键菜单服务");
        this.registerEditorMenu();
    }

    /**
     * 注册编辑器右键菜单
     */
    private registerEditorMenu() {
        this.debugLog("ContextMenuService: 注册编辑器右键菜单");
        
        this.plugin.registerEvent(
            this.app.workspace.on("editor-menu", (menu: Menu, editor: Editor, view) => {
                this.debugLog("ContextMenuService: 编辑器右键菜单被触发");
                this.handleEditorMenu(menu, editor, view);
            })
        );
    }

    /**
     * 处理编辑器右键菜单事件
     */
    private handleEditorMenu(menu: Menu, editor: Editor, view: any) {
        try {
            this.debugLog("ContextMenuService: 开始处理编辑器右键菜单");
            
            // 获取当前活动的表单和支持右键提交的字段
            const rightClickFields = this.getRightClickSubmitFields();
            
            if (rightClickFields.length === 0) {
                this.debugLog("ContextMenuService: 没有找到支持右键提交的字段");
                return;
            }

            this.debugLog(`ContextMenuService: 找到 ${rightClickFields.length} 个支持右键提交的字段`);

            // 获取选中的文本
            const selectedText = editor.getSelection();
            const hasSelection: boolean = !!(selectedText && selectedText.trim().length > 0);
            
            this.debugLog(`ContextMenuService: 选中文本: "${selectedText}", 是否有选中: ${hasSelection}`);

            // 添加字段菜单项（使用折叠结构）
            this.addFieldMenuItems(menu, editor, view, selectedText, hasSelection);

        } catch (error) {
            debugManager.error("ContextMenuService", "处理编辑器右键菜单时发生错误:", error);
        }
    }

    /**
     * 添加字段相关的菜单项（使用折叠结构）
     */
    private addFieldMenuItems(menu: Menu, editor: Editor, view: any, selectedText: string, hasSelection: boolean): void {
        const registeredFields = this.getRegisteredFields();
        
        if (registeredFields.length === 0) {
            this.debugLog("没有已注册的右键菜单字段");
            return;
        }
        
        this.debugLog(`添加 ${registeredFields.length} 个字段的菜单项`);
        
        // 创建折叠的表单字段子菜单
        menu.addItem((item) => {
            item.setTitle("表单字段");
            
            // 创建子菜单
            const submenu = item.setSubmenu();
            
            // 按表单分组显示字段
            const formGroups = new Map<string, RegisteredField[]>();
            registeredFields.forEach(field => {
                if (!formGroups.has(field.formId)) {
                    formGroups.set(field.formId, []);
                }
                formGroups.get(field.formId)!.push(field);
            });
            
            // 为每个表单组添加菜单项
            formGroups.forEach((fields, formId) => {
                const formName = fields[0].formName;
                
                if (fields.length === 1) {
                    // 如果表单只有一个字段，直接添加字段菜单
                    this.addSingleFieldMenuItems(submenu, fields[0], selectedText, hasSelection, view, editor);
                } else {
                    // 如果表单有多个字段，创建表单子菜单
                    submenu.addItem((formItem) => {
                        formItem.setTitle(formName);
                        
                        const formSubmenu = formItem.setSubmenu();
                        fields.forEach(field => {
                            this.addSingleFieldMenuItems(formSubmenu, field, selectedText, hasSelection, view, editor);
                        });
                    });
                }
            });
        });
    }
    
    /**
     * 添加单个字段的菜单项
     */
    private addSingleFieldMenuItems(menu: Menu, field: RegisteredField, selectedText: string, hasSelection: boolean, view: any, editor: Editor): void {
        this.debugLog(`添加字段菜单项: ${field.fieldLabel}`);
        
        // 根据是否有选中内容决定显示的选项和执行的操作
        menu.addItem((item) => {
            item.setTitle(field.fieldLabel)
                .onClick(async () => {
                    if (hasSelection) {
                        // 有选中内容时，使用选中内容执行表单
                        this.debugLog(`使用选中内容执行表单: ${field.fieldLabel}`);
                        await this.executeFormWithContent(field, selectedText);
                    } else {
                        // 没有选中内容时，使用整个文件内容执行表单
                        this.debugLog(`使用文件内容执行表单: ${field.fieldLabel}`);
                        await this.executeFormWithFileContent(field, view);
                    }
                });
        });
    }

    /**
     * 注册表单字段到右键菜单
     * 当表单注册为命令时调用
     * 重构：接收文件路径参数，避免存储表单配置副本
     */
    registerFormFields(formConfig: FormConfig, formName: string, formFilePath: string): void {
        this.debugLog(`[ContextMenuService] 开始注册表单字段到右键菜单: ${formName}`);
        this.debugLog(`[ContextMenuService] 表单ID: ${formConfig.id}, 文件路径: ${formFilePath}`);
        this.debugLog(`[ContextMenuService] 注册前已注册字段总数: ${this.registeredFields.size}`);
        
        // 清除该表单之前注册的字段
        this.debugLog(`[ContextMenuService] 清除表单 ${formConfig.id} 之前注册的字段`);
        this.unregisterFormFields(formConfig.id);
        
        // 检查表单是否有字段
        if (!formConfig.fields || formConfig.fields.length === 0) {
            this.debugLog(`表单 ${formName} 没有字段`);
            return;
        }
        
        this.debugLog(`表单 ${formName} 共有 ${formConfig.fields.length} 个字段`);
        
        // 筛选支持右键提交的文本类型字段
        const rightClickFields = formConfig.fields.filter(field => {
            const isTextType = this.isTextFieldType(field.type);
            const hasRightClickSubmit = field.rightClickSubmit === true;
            
            this.debugLog(`字段检查: ${field.label} (${field.type}) - 文本类型: ${isTextType}, 右键提交: ${hasRightClickSubmit}`);
            
            return isTextType && hasRightClickSubmit;
        });
        
        this.debugLog(`筛选后的右键提交字段数量: ${rightClickFields.length}`);
        
        // 注册每个字段
        rightClickFields.forEach(field => {
            const fieldKey = `${formConfig.id}_${field.id}`;
            const registeredField: RegisteredField = {
                formId: formConfig.id,
                formName: formName,
                fieldId: field.id,
                fieldLabel: field.label,
                fieldType: field.type,
                formFilePath: formFilePath // 存储文件路径而不是配置副本
            };
            
            this.registeredFields.set(fieldKey, registeredField);
            this.debugLog(`已注册字段: ${field.label} (${fieldKey}), 文件路径: ${formFilePath}`);
        });
        
        this.debugLog(`[ContextMenuService] 表单 ${formName} 共注册了 ${rightClickFields.length} 个右键菜单字段`);
        this.debugLog(`[ContextMenuService] 注册完成后已注册字段总数: ${this.registeredFields.size}`);
        this.debugLog(`[ContextMenuService] 当前所有已注册字段: ${JSON.stringify(Array.from(this.registeredFields.entries()).map(([key, field]) => ({
            key,
            formId: field.formId,
            formName: field.formName,
            fieldLabel: field.fieldLabel,
            formFilePath: field.formFilePath
        })), null, 2)}`);
    }
    
    /**
     * 取消注册表单字段
     */
    unregisterFormFields(formId: string): void {
        this.debugLog(`[ContextMenuService] 开始取消注册表单字段: ${formId}`);
        this.debugLog(`[ContextMenuService] 注销前已注册字段总数: ${this.registeredFields.size}`);
        
        const keysToRemove: string[] = [];
        const fieldsToRemove: RegisteredField[] = [];
        
        this.registeredFields.forEach((field, key) => {
            if (field.formId === formId) {
                keysToRemove.push(key);
                fieldsToRemove.push(field);
                this.debugLog(`[ContextMenuService] 找到需要移除的字段: ${key} (${field.fieldLabel})`);
            }
        });
        
        this.debugLog(`[ContextMenuService] 共找到 ${keysToRemove.length} 个需要移除的字段`);
        
        keysToRemove.forEach(key => {
            this.registeredFields.delete(key);
            this.debugLog(`[ContextMenuService] 已移除字段: ${key}`);
        });
        
        this.debugLog(`[ContextMenuService] 注销完成后已注册字段总数: ${this.registeredFields.size}`);
    }
    
    /**
     * 通过文件路径取消注册表单字段
     * 用于文件删除时的清理操作
     */
    unregisterFormFieldsByPath(filePath: string): void {
        this.debugLog(`[ContextMenuService] 开始通过文件路径取消注册表单字段: ${filePath}`);
        this.debugLog(`[ContextMenuService] 路径注销前已注册字段总数: ${this.registeredFields.size}`);
        
        const keysToRemove: string[] = [];
        const fieldsToRemove: RegisteredField[] = [];
        
        this.registeredFields.forEach((field, key) => {
            if (field.formFilePath === filePath) {
                keysToRemove.push(key);
                fieldsToRemove.push(field);
                this.debugLog(`[ContextMenuService] 找到匹配路径的字段: ${key} (表单: ${field.formName}, 字段: ${field.fieldLabel})`);
            }
        });
        
        this.debugLog(`[ContextMenuService] 共找到 ${keysToRemove.length} 个匹配路径的字段需要移除`);
        
        keysToRemove.forEach(key => {
            this.registeredFields.delete(key);
            this.debugLog(`[ContextMenuService] 已移除路径匹配字段: ${key}`);
        });
        
        this.debugLog(`[ContextMenuService] 路径注销完成后已注册字段总数: ${this.registeredFields.size}`);
        this.debugLog(`[ContextMenuService] 通过文件路径共移除了 ${keysToRemove.length} 个字段`);
    }
    
    /**
     * 检查字段类型是否为文本类型
     */
    private isTextFieldType(fieldType: FormFieldType): boolean {
        return fieldType === FormFieldType.TEXT || fieldType === FormFieldType.TEXTAREA;
    }
    
    /**
     * 获取所有已注册的右键菜单字段
     */
    getRegisteredFields(): RegisteredField[] {
        return Array.from(this.registeredFields.values());
    }
    
    /**
     * 获取当前支持右键提交的字段
     */
    private getRightClickSubmitFields(): IFormField[] {
        try {
            this.debugLog("ContextMenuService: 开始获取支持右键提交的字段");
            
            // 从已注册的字段中获取
            const registeredFields = this.getRegisteredFields();
            const rightClickFields: IFormField[] = registeredFields.map(field => ({
                id: field.fieldId,
                label: field.fieldLabel,
                type: field.fieldType,
                rightClickSubmit: true
            } as IFormField));
            
            this.debugLog(`ContextMenuService: 从已注册字段获取到 ${rightClickFields.length} 个右键提交字段`);
            
            return rightClickFields;
        } catch (error) {
            debugManager.error("ContextMenuService", "获取右键提交字段时发生错误:", error);
            return [];
        }
    }

    /**
     * 添加内容到指定字段
     */
    async addContentToField(fieldId: string, content: string): Promise<void> {
        try {
            this.debugLog(`ContextMenuService: 添加内容到字段 "${fieldId}": "${content}"`);
            
            // 暂时只是记录日志，等待与表单状态管理集成
            // TODO: 需要实现实际的字段值更新逻辑
            this.debugLog(`ContextMenuService: 暂时记录添加内容到字段 "${fieldId}" 的操作`);
            
        } catch (error) {
            debugManager.error("ContextMenuService", `添加内容到字段 "${fieldId}" 时发生错误:`, error);
        }
    }

    /**
     * 添加内容到已注册字段
     */
    private async addContentToRegisteredField(field: RegisteredField, content: string): Promise<void> {
        try {
            this.debugLog(`添加内容到已注册字段 "${field.fieldLabel}": "${content}"`);
            this.debugLog(`通过FormIntegrationService执行右键命令: ${field.formFilePath}`);
            
            // 使用FormIntegrationService执行右键命令
            await this.plugin.formIntegrationService.executeRightClickCommand(field.formFilePath, field.fieldId, this.app);
            
            this.debugLog(`表单 "${field.formName}" 执行成功`);
            
        } catch (error) {
            debugManager.error("ContextMenuService", `添加内容到已注册字段 "${field.fieldLabel}" 时发生错误:`, error);
        }
    }

    /**
     * 添加文件内容到指定字段
     */
    private addFileContentToField(fieldId: string, view: any) {
        try {
            this.debugLog(`ContextMenuService: 添加文件内容到字段 "${fieldId}"`);
            
            const file = view?.file as TFile;
            if (!file) {
                this.debugLog("ContextMenuService: 无法获取当前文件");
                return;
            }

            this.app.vault.read(file).then(content => {
                this.debugLog(`ContextMenuService: 读取文件内容成功，长度: ${content.length}`);
                this.addContentToField(fieldId, content);
            }).catch(error => {
                debugManager.error("ContextMenuService", "读取文件内容时发生错误:", error);
            });
            
        } catch (error) {
            debugManager.error("ContextMenuService", `添加文件内容到字段 "${fieldId}" 时发生错误:`, error);
        }
    }

    /**
     * 添加文件内容到已注册字段
     */
    private async addFileContentToRegisteredField(field: RegisteredField, view: any): Promise<void> {
        try {
            this.debugLog(`添加文件内容到已注册字段 "${field.fieldLabel}"`);
            this.debugLog(`通过FormIntegrationService执行右键命令: ${field.formFilePath}`);
            
            // 使用FormIntegrationService执行右键命令
            await this.plugin.formIntegrationService.executeRightClickCommand(field.formFilePath, field.fieldId, this.app);
            
            this.debugLog(`表单 "${field.formName}" 执行成功`);
            
        } catch (error) {
            debugManager.error("ContextMenuService", `添加文件内容到已注册字段 "${field.fieldLabel}" 时发生错误:`, error);
        }
    }
    
    /**
     * 使用指定内容执行表单
     * @param field 注册的字段信息
     * @param content 要填入字段的内容
     * 重构：动态读取原始表单文件，避免使用配置副本
     */
    private async executeFormWithContent(field: RegisteredField, content: string): Promise<void> {
        try {
            this.debugLog(`开始使用内容执行表单: ${field.formName}, 字段: ${field.fieldLabel}`);
            
            // 通过 FormIntegrationService 执行右键命令
            const formIntegrationService = (await import('../command/FormIntegrationService')).formIntegrationService;
            await formIntegrationService.executeRightClickCommand(field.formFilePath, field.fieldId, this.app);
            
        } catch (error) {
            debugManager.error("ContextMenuService", `执行表单时发生错误:`, error);
        }
    }

    /**
     * 使用文件内容执行表单
     * @param field 注册的字段信息
     * @param view 当前视图
     */
    private async executeFormWithFileContent(field: RegisteredField, view: any): Promise<void> {
        try {
            this.debugLog(`开始使用文件内容执行表单: ${field.formName}, 字段: ${field.fieldLabel}`);
            
            // 通过 FormIntegrationService 执行右键命令
            const formIntegrationService = (await import('../command/FormIntegrationService')).formIntegrationService;
            await formIntegrationService.executeRightClickCommand(field.formFilePath, field.fieldId, this.app);
            
        } catch (error) {
            debugManager.error("ContextMenuService", `执行表单时发生错误:`, error);
        }
    }

    /**
     * 输出调试日志
     * 重写基类方法以保持兼容性
     */
    protected debugLog(message: string) {
        this.forceDebugLog(message);
    }

    /**
     * 卸载服务
     */
    unload() {
        this.debugLog("ContextMenuService: 卸载右键菜单服务");
        // Obsidian会自动处理事件的注销
    }
}

// ContextMenuService 实例将在 main.ts 中创建和管理