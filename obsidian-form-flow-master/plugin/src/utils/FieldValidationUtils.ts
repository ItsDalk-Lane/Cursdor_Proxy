import { IFormField } from "src/model/field/IFormField";
import { FormFieldType } from "src/model/enums/FormFieldType";
import { debugManager } from "./DebugManager";

/**
 * 字段验证工具类
 * 提供表单字段相关的验证和检查功能
 */
export class FieldValidationUtils {
    
    /**
     * 检查字段是否有固定值
     * @param field 表单字段
     * @param context 调用上下文，用于调试日志
     * @returns 是否有固定值
     */
    static fieldHasFixedValue(field: IFormField, context: string = 'FieldValidationUtils'): boolean {
        debugManager.log(context, `=== DYNAMIC_DISPLAY_DEBUG: ${context}.fieldHasFixedValue ===`);
        debugManager.logObject(context, '字段信息:', {
            id: field.id,
            label: field.label,
            type: field.type,
            defaultValue: field.defaultValue
        });
        
        let hasFixedValue = false;
        
        switch (field.type) {
            case FormFieldType.TEXT:
            case FormFieldType.TEXTAREA:
            case FormFieldType.PASSWORD:
                hasFixedValue = !!(field.defaultValue && typeof field.defaultValue === 'string' && field.defaultValue.trim());
                debugManager.logObject(context, '文本类型字段固定值检查:', { hasFixedValue, defaultValue: field.defaultValue });
                break;
            
            case FormFieldType.NUMBER:
                hasFixedValue = field.defaultValue !== undefined && field.defaultValue !== null;
                debugManager.logObject(context, '数字类型字段固定值检查:', { hasFixedValue, defaultValue: field.defaultValue });
                break;
            
            case FormFieldType.CHECKBOX:
                hasFixedValue = field.defaultValue !== undefined;
                debugManager.logObject(context, '复选框类型字段固定值检查:', { hasFixedValue, defaultValue: field.defaultValue });
                break;
            
            case FormFieldType.RADIO:
            case FormFieldType.SELECT:
                hasFixedValue = !!(field.defaultValue && typeof field.defaultValue === 'string' && field.defaultValue.trim());
                debugManager.logObject(context, '选择类型字段固定值检查:', { hasFixedValue, defaultValue: field.defaultValue });
                break;
            
            case FormFieldType.DATE:
            case FormFieldType.TIME:
            case FormFieldType.DATETIME:
                hasFixedValue = !!(field.defaultValue && typeof field.defaultValue === 'string' && field.defaultValue.trim());
                debugManager.logObject(context, '日期时间类型字段固定值检查:', { hasFixedValue, defaultValue: field.defaultValue });
                break;
            
            case FormFieldType.FILE_LIST:
                hasFixedValue = !!(field.defaultValue && 
                    ((Array.isArray(field.defaultValue) && field.defaultValue.length > 0) ||
                     (typeof field.defaultValue === 'string' && field.defaultValue.trim())));
                debugManager.logObject(context, '文件列表类型字段固定值检查:', { hasFixedValue, defaultValue: field.defaultValue });
                break;
            
            case FormFieldType.AI_MODEL_LIST:
                // AI模型字段如果有预选择的模型ID、自动选择第一个或有默认值，则认为有固定值
                const aiField = field as any;
                hasFixedValue = !!(aiField.selectedModelId || aiField.autoSelectFirst || 
                    (field.defaultValue && typeof field.defaultValue === 'string' && field.defaultValue.trim()));
                debugManager.logObject(context, 'AI模型列表字段固定值检查:', {
                    fieldId: field.id,
                    fieldLabel: field.label,
                    selectedModelId: aiField.selectedModelId,
                    autoSelectFirst: aiField.autoSelectFirst,
                    hasFixedValue: hasFixedValue,
                    defaultValue: field.defaultValue
                });
                break;
            
            case FormFieldType.TEMPLATE_LIST:
                // 模板列表字段如果有预选择的模板文件、自动选择第一个或有默认值，则认为有固定值
                const templateField = field as any;
                hasFixedValue = !!(templateField.selectedTemplateFile || templateField.autoSelectFirst || 
                    (field.defaultValue && typeof field.defaultValue === 'string' && field.defaultValue.trim()));
                debugManager.logObject(context, '模板列表字段固定值检查:', {
                    fieldId: field.id,
                    fieldLabel: field.label,
                    selectedTemplateFile: templateField.selectedTemplateFile,
                    autoSelectFirst: templateField.autoSelectFirst,
                    hasFixedValue: hasFixedValue,
                    defaultValue: field.defaultValue
                });
                break;
            
            default:
                // 其他类型字段，检查是否有默认值
                hasFixedValue = !!(field.defaultValue !== undefined && field.defaultValue !== null && 
                    (typeof field.defaultValue !== 'string' || field.defaultValue.trim()));
                debugManager.logObject(context, '其他类型字段固定值检查:', { hasFixedValue, defaultValue: field.defaultValue });
                break;
        }
        
        debugManager.log(context, `字段 '${field.label}' (${field.type}) 最终固定值结果:`, hasFixedValue);
        debugManager.log(context, `=== DYNAMIC_DISPLAY_DEBUG: ${context}结束 ===\n`);
        
        return hasFixedValue;
    }
    
    /**
     * 检查预填充值是否为空
     * @param value 预填充值
     * @returns 是否为空
     */
    static isEmptyPrefilledValue(value: any): boolean {
        if (value === null || value === undefined) {
            return true;
        }
        
        if (typeof value === 'string') {
            return value.trim() === '';
        }
        
        if (Array.isArray(value)) {
            return value.length === 0;
        }
        
        if (typeof value === 'object') {
            return Object.keys(value).length === 0;
        }
        
        return false;
    }
    
    /**
     * 检查值是否为空（用于必填字段验证）
     * @param value 要检查的值
     * @returns 是否为空
     */
    static isEmptyValue(value: any): boolean {
        if (value === null || value === undefined) {
            return true;
        }
        
        if (typeof value === 'string') {
            return value.trim() === '';
        }
        
        if (Array.isArray(value)) {
            return value.length === 0;
        }
        
        if (typeof value === 'boolean') {
            return false; // 布尔值永远不为空
        }
        
        if (typeof value === 'number') {
            return isNaN(value);
        }
        
        return false;
    }
}