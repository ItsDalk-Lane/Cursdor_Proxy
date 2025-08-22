import React, { useCallback, useMemo } from "react";
import { PropertyValueSuggestInput } from "src/component/combobox/PropertyValueSuggestInput";
import { PasswordInput } from "src/component/password/PasswordInput";
import { FormFieldType } from "src/model/enums/FormFieldType";
import { IFormField } from "src/model/field/IFormField";
import { IPropertyValueField } from "src/model/field/IPropertyValueField";
import { ISelectField } from "src/model/field/ISelectField";
import { ITextAreaField } from "src/model/field/ITextAreaField";
import { FormFieldValue } from "src/service/FormValues";
import { Strings } from "src/utils/Strings";
import { FileListControl } from "./FileListControl";
import RadioControl from "./RadioControl";
import SelectControl from "./SelectControl";
import ToggleControl from "./ToggleControl";
import AIModelListControl from "./AIModelListControl";
import { TemplateListControl } from "./TemplateListControl";
import { ContextMenuService } from "src/service/context-menu/ContextMenuService";
import { debugManager } from "src/utils/DebugManager";
import "./CpsFormFieldControl.css";

/**
 * 表单字段控件组件属性接口
 */
interface CpsFormFieldControlProps {
    field: IFormField;
    value: FormFieldValue;
    // 修正：该组件对外仅暴露“值变化”回调（单参数），字段ID在父组件闭包中绑定
    onValueChange: (value: FormFieldValue) => void;
    autoFocus?: boolean;
}

/**
 * 表单字段控件组件 - 已优化性能
 * 使用React.memo和useCallback减少不必要的重新渲染
 * 添加调试信息追踪性能问题
 */
function CpsFormFieldControlComponent(props: CpsFormFieldControlProps) {
    const { value, field, autoFocus } = props;
    
    /**
     * 将 FormFieldValue 转换为字符串，用于 HTML 输入元素
     */
    const getStringValue = (val: FormFieldValue): string => {
        if (val === null || val === undefined) return "";
        if (typeof val === "boolean") return val.toString();
        if (typeof val === "number") return val.toString();
        if (val instanceof Date) return val.toISOString().split('T')[0]; // 日期格式化为 YYYY-MM-DD
        if (Array.isArray(val)) return val.join(", "); // 数组转换为逗号分隔的字符串
        return String(val);
    };
    
    const actualValue = getStringValue(value);
    const onValueChange = props.onValueChange;

    debugManager.log('CpsFormFieldControl', 'Component rendering', { 
        fieldId: field.id, 
        fieldType: field.type, 
        value: actualValue,
        autoFocus 
    });

    /**
     * 处理值变更（统一为单参数回调）
     * @param newValue 新的字段值
     */
    const handleValueChange = useCallback((newValue: FormFieldValue) => {
        debugManager.log('CpsFormFieldControl', 'Value changed', { 
            fieldId: field.id, 
            oldValue: value, 
            newValue 
        });
        // 修正：此处不再传入 field.id，避免父级接收到错误参数
        onValueChange(newValue);
    }, [onValueChange, value, field.id]);

    /**
     * 处理右键点击事件，为启用了右键提交功能的字段添加右键事件处理
     */
    const handleRightClick = useCallback(async (event: React.MouseEvent) => {
        if (!field.rightClickSubmit) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        try {
            debugManager.log('CpsFormFieldControl', 'Right click submit triggered', { fieldId: field.id });
            const contextMenuService = ContextMenuService.getInstance();
            if (contextMenuService) {
                // 暂时传递空字符串，等待与右键菜单集成
                // TODO: 这里应该从右键菜单获取实际内容
                await contextMenuService.addContentToField(field.id, '');
            }
        } catch (error) {
            debugManager.error('CpsFormFieldControl', '右键提交处理失败', error);
        }
    }, [field.rightClickSubmit, field.id]);

    /**
     * 获取字段的样式类名，为右键提交字段添加特殊标识
     * 使用useMemo优化性能
     */
    const fieldClassName = useMemo(() => {
        return field.rightClickSubmit ? 'form-field-right-click-enabled' : '';
    }, [field.rightClickSubmit]);

    if (field.type === FormFieldType.TEXTAREA) {
        const isTextArea = field as ITextAreaField;
        const rows = isTextArea.rows || 5;
        return (
            <textarea
                id={field.id}
                data-name={field.label}
                value={actualValue}
                rows={rows}
                required={field.required}
                onChange={(e) => handleValueChange(e.target.value)}
                onContextMenu={handleRightClick}
                className={fieldClassName}
                autoFocus={autoFocus}
            />
        );
    }
    if (field.type === FormFieldType.PASSWORD) {
        return (
            <PasswordInput
                value={actualValue}
                name={field.label}
                onChange={handleValueChange}
                required={field.required}
                onContextMenu={handleRightClick}
                className={fieldClassName}
                autoFocus={autoFocus}
            />
        );
    }
    if (field.type === FormFieldType.NUMBER) {
        return (
            <input
                id={field.id}
                data-name={field.label}
                type="number"
                step={"any"}
                value={actualValue}
                required={field.required}
                onChange={(e) => {
                    // 将字符串转换为 number，空字符串转换为 undefined，确保表单值类型正确
                    const raw = e.target.value;
                    /**
                     * 数字输入变更处理
                     * - 空字符串 -> undefined（便于必填校验和清空）
                     * - 其他 -> Number(raw)（可能为 NaN，由上层校验处理）
                     */
                    const parsed = Strings.isBlank(raw) ? undefined : Number(raw);
                    debugManager.log('CpsFormFieldControl', 'Number field parsed', { fieldId: field.id, raw, parsed });
                    handleValueChange(parsed as unknown as FormFieldValue);
                }}
                onContextMenu={handleRightClick}
                className={fieldClassName}
                autoFocus={autoFocus}
            />
        );
    }
    if (field.type === FormFieldType.DATE) {
        return (
            <input
                id={field.id}
                data-name={field.label}
                type="date"
                value={actualValue}
                max="9999-12-31"
                required={field.required}
                onChange={(e) => handleValueChange(e.target.value)}
                onContextMenu={handleRightClick}
                className={fieldClassName}
                autoFocus={autoFocus}
            />
        );
    }
    if (field.type === FormFieldType.DATETIME) {
        return (
            <input
                id={field.id}
                data-name={field.label}
                type="datetime-local"
                max="9999-12-31T23:59"
                value={actualValue}
                required={field.required}
                onChange={(e) => handleValueChange(e.target.value)}
                onContextMenu={handleRightClick}
                className={fieldClassName}
                autoFocus={autoFocus}
            />
        );
    }

    if (field.type === FormFieldType.TIME) {
        return (
            <input
                id={field.id}
                data-name={field.label}
                type="time"
                value={actualValue}
                required={field.required}
                onChange={(e) => handleValueChange(e.target.value)}
                onContextMenu={handleRightClick}
                className={fieldClassName}
                autoFocus={autoFocus}
            />
        );
    }

    if (field.type === FormFieldType.SELECT) {
        return (
            <SelectControl
                field={field as ISelectField}
                // 修正：保持原始值传递，便于多选场景传递 string[]
                value={value}
                onValueChange={handleValueChange}
                onContextMenu={handleRightClick}
                className={fieldClassName}
                autoFocus={autoFocus}
            />
        );
    }
    if (
        field.type === FormFieldType.TOGGLE ||
        field.type === FormFieldType.CHECKBOX
    ) {
        return (
            <ToggleControl
                id={field.id}
                // 修正：传递原始值，内部会做 Boolean 转换
                value={value}
                required={field.required}
                onValueChange={handleValueChange}
                autoFocus={autoFocus}
            />
        );
    }
    if (field.type === FormFieldType.RADIO) {
        // 类型检查：确保字段具有 options 属性
        const radioField = field as any;
        if (!radioField.options) {
            console.warn(`Radio field ${field.id} is missing options property`);
            return <div>Radio field configuration error: missing options</div>;
        }
        return (
            <RadioControl
                field={radioField}
                // 修正：传递原始值
                value={value}
                onValueChange={handleValueChange}
                autoFocus={autoFocus}
            />
        );
    }

    if (field.type === FormFieldType.FILE_LIST) {
        // 类型检查：确保字段类型匹配
        const fileListField = field as any;
        return (
            <FileListControl
                field={fileListField}
                // 修正：传递原始值
                value={value}
                onValueChange={handleValueChange}
                autoFocus={autoFocus}
            />
        );
    }

    if (field.type === FormFieldType.AI_MODEL_LIST) {
        // 类型检查：确保字段类型匹配
        const aiModelField = field as any;
        return (
            <AIModelListControl
                field={aiModelField}
                value={value}
                onValueChange={handleValueChange}
                autoFocus={autoFocus}
            />
        );
    }

    if (field.type === FormFieldType.TEMPLATE_LIST) {
        // 类型转换：TemplateListControl 期望 string 类型的 value
        const templateField = field as any;
        const stringValue = getStringValue(value);
        const handleTemplateChange = (newValue: string) => {
            handleValueChange(newValue);
        };
        return (
            <TemplateListControl
                field={templateField}
                value={stringValue}
                onChange={handleTemplateChange}
                autoFocus={autoFocus}
            />
        );
    }

    if (field.type === FormFieldType.PROPERTY_VALUE) {
        const propertyValueField = field as IPropertyValueField;
        const propertyName = Strings.defaultIfBlank(
            propertyValueField.propertyName,
            field.label
        );
        // 类型转换：PropertyValueSuggestInput 期望 string 类型的 value
        const stringValue = getStringValue(value);
        const handlePropertyChange = (newValue: string | string[] | null) => {
            handleValueChange(newValue);
        };
        return (
            <PropertyValueSuggestInput
                id={field.id}
                label={field.label}
                name={propertyName}
                value={stringValue}
                onChange={handlePropertyChange}
            />
        );
    }

    return (
        <input
            id={field.id}
            data-name={field.label}
            type="text"
            value={actualValue}
            required={field.required}
            onChange={(e) => handleValueChange(e.target.value)}
            onContextMenu={handleRightClick}
            className={fieldClassName}
            autoFocus={autoFocus}
        />
    );
}

const CpsFormFieldControlMemo = React.memo(CpsFormFieldControlComponent, (prevProps, nextProps) => {
    // 自定义比较函数：当字段和对应值发生变化时才重新渲染
    const isEqual = prevProps.field === nextProps.field && prevProps.value === nextProps.value;
    if (!isEqual) {
        debugManager.log('CpsFormFieldControl', 'Props changed, re-rendering', {
            fieldId: nextProps.field.id,
            prevValue: prevProps.value,
            nextValue: nextProps.value,
        });
    }
    return isEqual;
});

export { CpsFormFieldControlMemo as CpsFormFieldControl };
