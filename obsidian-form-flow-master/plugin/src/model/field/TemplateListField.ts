import { FormFieldType } from "../enums/FormFieldType";
import { IFormField } from "./IFormField";

export interface TemplateListField extends IFormField {
    type: FormFieldType.TEMPLATE_LIST;
    enableCustomValue?: boolean;
    selectedTemplateFile?: string; // 预选择的模板文件路径
    placeholder?: string;
    autoSelectFirst?: boolean; // 是否自动选择第一个模板
    templateFolder?: string; // 模板文件夹路径，如果不指定则使用AI设置中的默认路径
}
