import { FormActionType } from "../enums/FormActionType";
import { IFormAction } from "./IFormAction";

export enum PromptSourceType {
    BUILTIN_TEMPLATE = "builtin_template",
    CUSTOM = "custom"
}

export interface AICallFormAction extends IFormAction {
    type: FormActionType.AI_CALL;
    promptSource: PromptSourceType;
    templateFile?: string; // 内置模板文件路径
    customPrompt?: string; // 自定义提示词内容
    outputVariableName: string; // 输出变量名
    modelFieldName?: string; // AI模型字段名（来自表单中的AI模型列表字段）
    templateFieldName?: string; // 模板列表字段名（来自表单中的模板列表字段）
}
