import { FormFieldType } from "../model/enums/FormFieldType";
import { IFormField } from "../model/field/IFormField";
import { ISelectField } from "../model/field/ISelectField";
import { AIModelListField } from "../model/field/AIModelListField";
import { TemplateListField } from "../model/field/TemplateListField";
import { isTimeFormField } from "./isTimeFormField";
import { DateTime } from "luxon";
import { BaseTimeField, TimeFieldDefaultValueType } from "../model/field/time/BaseTimeField";
import { Strings } from "./Strings";

export const OBSIDIAN_DATETIME_YAML_VALUE_FORMAT = "yyyy-MM-dd'T'HH:mm";

export function getFieldDefaultValue(
    curr: IFormField
): any {
    if (curr.type === FormFieldType.SELECT) {
        const selectField = curr as ISelectField;
        const options = selectField.options || [];
        const enableCustomValue = selectField.enableCustomValue === true;
        const values = options.map(o => {
            if (enableCustomValue) {
                return o.value;
            } else {
                return o.label;
            }
        });

        if (selectField.multiple) {
            const def = Array.isArray(selectField.defaultValue) ? selectField.defaultValue : [];
            return def.filter(v => values.includes(v));
        } else {
            if (selectField.defaultValue && values.includes(selectField.defaultValue)) {
                return selectField.defaultValue;
            }
            return undefined;
        }
    }

    if (isTimeFormField(curr.type)) {
        const field = curr as BaseTimeField;
        if (field.defaultValueType === TimeFieldDefaultValueType.CURRENT) {
            switch (field.type) {
                case FormFieldType.DATE:
                    return DateTime.now().toISODate();
                case FormFieldType.TIME:
                    return DateTime.now().toFormat("HH:mm");
                case FormFieldType.DATETIME:
                    return DateTime.now().toFormat(OBSIDIAN_DATETIME_YAML_VALUE_FORMAT);
            }
        } else {
            return field.defaultValue;
        }
    }

    if (curr.type === FormFieldType.CHECKBOX || curr.type === FormFieldType.TOGGLE) {
        if (Strings.isEmpty(curr.defaultValue)) {
            return false;
        }
        return curr.defaultValue ?? false;
    }

    // AI模型列表字段的默认值处理
    if (curr.type === FormFieldType.AI_MODEL_LIST) {
        const aiField = curr as AIModelListField;
        // 如果有预选择的模型ID，返回它
        if (aiField.selectedModelId) {
            return aiField.selectedModelId;
        }
        // 如果启用了自动选择第一个，这里返回undefined，实际选择在控件中处理
        return aiField.defaultValue;
    }

    // 模板列表字段的默认值处理
    if (curr.type === FormFieldType.TEMPLATE_LIST) {
        const templateField = curr as TemplateListField;
        // 如果有预选择的模板文件，返回它
        if (templateField.selectedTemplateFile) {
            return templateField.selectedTemplateFile;
        }
        // 如果启用了自动选择第一个，这里返回undefined，实际选择在控件中处理
        return templateField.defaultValue;
    }

    return curr.defaultValue;
}