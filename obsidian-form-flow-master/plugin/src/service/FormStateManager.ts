import { FormConfig } from "src/model/FormConfig";
import { IFormField } from "src/model/field/IFormField";
import { BaseSingletonService } from "./BaseService";
import { DebugModule } from "src/utils/DebugConfig";

/**
 * 全局表单状态管理器
 * 用于追踪当前活动的表单和字段信息
 */
export class FormStateManager extends BaseSingletonService {
    private currentForm: FormConfig | null = null;

    /**
     * 构造函数
     * 说明：为了兼容基类 BaseSingletonService.getInstance 的 "this" 构造签名，
     * 必须提供 (serviceName: string, debugModule?: DebugModule) 的构造函数。
     * 这里默认将 debugModule 设置为 DebugModule.FORM_SERVICE，便于按模块控制日志输出。
     */
    constructor(serviceName: string, debugModule?: DebugModule) {
        super(serviceName, debugModule ?? DebugModule.FORM_SERVICE);
    }
    
    // 调试功能已由基类提供

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
     * 重置单例实例 - 用于插件重新加载时清理状态
     * 防止内存泄漏和状态累积
     */
    static resetInstance(): void {
        BaseSingletonService.clearInstance('FormStateManager');
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