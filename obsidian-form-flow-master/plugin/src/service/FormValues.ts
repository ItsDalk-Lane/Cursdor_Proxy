export type FormFieldId = string;
export type FormFieldLabel = string;

/**
 * 表单字段值的联合类型，涵盖所有可能的字段值类型
 */
export type FormFieldValue = 
    | string 
    | number 
    | boolean 
    | Date 
    | string[] 
    | number[] 
    | File[] 
    | null 
    | undefined;

/**
 * 基于字段ID的表单值映射
 * 使用更精确的类型定义替代any
 */
export class FormIdValues {
    [key: FormFieldId]: FormFieldValue;
}

/**
 * 基于字段标签的表单值映射
 * 使用更精确的类型定义替代any
 */
export class FormLabelValues {
    [key: FormFieldLabel]: FormFieldValue;
}

/**
 * 表单值变更回调函数类型
 */
export type FormValueChangeHandler = (fieldId: FormFieldId, value: FormFieldValue) => void;

/**
 * 表单验证结果类型
 */
export interface FormValidationResult {
    isValid: boolean;
    errors: Record<FormFieldId, string[]>;
}