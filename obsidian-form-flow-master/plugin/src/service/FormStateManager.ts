import { FormConfig } from "src/model/FormConfig";
import { IFormField } from "src/model/field/IFormField";
import { debugManager } from "../utils/DebugManager";

/**
 * 全局表单状态管理器
 * 用于追踪当前活动的表单和字段信息
 */
export class FormStateManager {
    private static instance: FormStateManager;
    private currentForm: FormConfig | null = null;
    private debugEnabled = false;

    /**
     * 获取单例实例
     */
    static getInstance(): FormStateManager {
        if (!FormStateManager.instance) {
            FormStateManager.instance = new FormStateManager();
        }
        return FormStateManager.instance;
    }

    /**
     * 设置调试模式
     */
    setDebugMode(enabled: boolean): void {
        this.debugEnabled = enabled;
    }

    /**
     * 调试日志输出
     */
    private debugLog(message: string, ...args: any[]): void {
        if (this.debugEnabled) {
            debugManager.log('FormStateManager', message, ...args);
        }
    }

    /**
     * 设置当前活动的表单
     */
    setCurrentForm(formConfig: FormConfig | null): void {
        this.debugLog("设置当前活动表单", formConfig?.id || "null");
        this.currentForm = formConfig;
    }

    /**
     * 获取当前活动的表单
     */
    getCurrentForm(): FormConfig | null {
        this.debugLog("获取当前活动表单", this.currentForm?.id || "null");
        return this.currentForm;
    }

    /**
     * 获取当前表单中支持右键提交的字段
     */
    getRightClickSubmitFields(): IFormField[] {
        this.debugLog("开始获取支持右键提交的字段");
        
        if (!this.currentForm) {
            this.debugLog("当前没有活动表单");
            return [];
        }

        if (!this.currentForm.fields || this.currentForm.fields.length === 0) {
            this.debugLog("当前表单没有字段");
            return [];
        }

        // 筛选出支持右键提交的字段
        const rightClickFields = this.currentForm.fields.filter(field => {
            const hasRightClickSubmit = field.rightClickSubmit === true;
            this.debugLog(`字段 '${field.label}' (${field.type}) - 右键提交: ${hasRightClickSubmit}`);
            return hasRightClickSubmit;
        });

        this.debugLog(`找到 ${rightClickFields.length} 个支持右键提交的字段`, rightClickFields.map(f => f.label));
        return rightClickFields;
    }

    /**
     * 检查是否有活动表单
     */
    hasActiveForm(): boolean {
        const hasForm = this.currentForm !== null;
        this.debugLog("检查是否有活动表单", hasForm);
        return hasForm;
    }

    /**
     * 清除当前表单状态
     */
    clearCurrentForm(): void {
        this.debugLog("清除当前表单状态");
        this.currentForm = null;
    }

    /**
     * 获取当前表单的基本信息
     */
    getCurrentFormInfo(): { id?: string; name?: string; fieldsCount: number } | null {
        if (!this.currentForm) {
            return null;
        }

        return {
            id: this.currentForm.id,
            name: this.currentForm.id, // FormConfig 没有 name 属性，使用 id 作为名称
            fieldsCount: this.currentForm.fields?.length || 0
        };
    }
}