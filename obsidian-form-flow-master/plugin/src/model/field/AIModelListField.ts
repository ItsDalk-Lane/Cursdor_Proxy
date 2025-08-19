import { FormFieldType } from "../enums/FormFieldType";
import { IFormField } from "./IFormField";

export interface AIModelListField extends IFormField {
    type: FormFieldType.AI_MODEL_LIST;
    enableCustomValue: boolean;
    selectedModelId?: string; // 预选择的模型ID
    placeholder?: string;
    showProvider?: boolean; // 是否显示提供商信息
    showCustomFields?: boolean; // 是否显示自定义字段
    autoSelectFirst?: boolean; // 是否自动选择第一个模型
}
