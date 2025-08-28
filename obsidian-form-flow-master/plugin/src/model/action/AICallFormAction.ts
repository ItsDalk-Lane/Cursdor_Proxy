import { FormActionType } from "../enums/FormActionType";
import { IFormAction } from "./IFormAction";

/**
 * 提示词来源类型枚举
 */
export enum PromptSourceType {
    BUILTIN_TEMPLATE = "builtin_template",
    CUSTOM = "custom"
}

/**
 * AI输出模式枚举
 */
export enum AIOutputMode {
    VARIABLE = "variable",        // 存储到变量
    FLOATING_CHAT = "floating_chat" // 悬浮对话界面
}

/**
 * 对话保存配置接口
 */
export interface ConversationSaveConfig {
    enabled: boolean;           // 是否启用保存
    saveToCurrentFile: boolean; // 保存到当前文件
    targetFilePath?: string;    // 指定文件路径
}

/**
 * AI调用表单动作接口
 */
export interface AICallFormAction extends IFormAction {
    type: FormActionType.AI_CALL;
    promptSource: PromptSourceType;
    templateFile?: string; // 内置模板文件路径
    customPrompt?: string; // 自定义提示词内容
    outputVariableName?: string; // 输出变量名（输出模式为变量时必填）
    modelFieldName?: string; // AI模型字段名（来自表单中的AI模型列表字段）
    templateFieldName?: string; // 模板列表字段名（来自表单中的模板列表字段）
    
    // 新增的输出模式相关配置
    outputMode: AIOutputMode; // 输出模式
    conversationSave?: ConversationSaveConfig; // 对话保存配置（悬浮界面模式时使用）
}
