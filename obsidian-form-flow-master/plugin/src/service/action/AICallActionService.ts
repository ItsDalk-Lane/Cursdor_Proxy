import { Notice } from "obsidian";
import { AICallFormAction, PromptSourceType } from "../../model/action/AICallFormAction";
import { IFormAction } from "../../model/action/IFormAction";
import { FormActionType } from "../../model/enums/FormActionType";
import { ActionContext, ActionChain, IActionService } from "./IActionService";
import { AIApiClient, AIMessage } from "../ai/AIApiClient";
import { PromptTemplateService, VariableContext } from "../ai/PromptTemplateService";
import { AISettingsService } from "../ai/AISettingsService";
import { IAIModelConfig } from "../../model/ai/AIModelConfig";
import { FormFieldType } from "../../model/enums/FormFieldType";
import { AIModelListField } from "../../model/field/AIModelListField";
import { TemplateListField } from "../../model/field/TemplateListField";
import { debugManager } from "../../utils/DebugManager";

export default class AICallActionService implements IActionService {

    accept(action: IFormAction, context: ActionContext): boolean {
        return action.type === FormActionType.AI_CALL;
    }

    async run(action: IFormAction, context: ActionContext, chain: ActionChain): Promise<void> {
        const aiAction = action as AICallFormAction;
        
        try {

            
            // 获取AI模型
            const model = await AICallActionService.getSelectedModel(aiAction, context);
            if (!model) {
                debugManager.error('AICallAction', '未找到有效的AI模型');
                throw new Error('未找到有效的AI模型');
            }


            // 准备提示词
            const prompt = await AICallActionService.preparePrompt(aiAction, context);
            if (!prompt.trim()) {
                debugManager.error('AICallAction', '提示词内容为空');
                throw new Error('提示词内容为空');
            }


            // 准备消息
            const messages = await AICallActionService.prepareMessages(prompt, context);


            // 创建AI客户端并调用
            const client = AIApiClient.create(model);

            const response = await client.call({
                messages,
                maxTokens: model.maxOutputTokens
            });


            if (response.success && response.content) {
                // 存储结果到输出变量
                if (aiAction.outputVariableName) {
                    AICallActionService.storeOutputVariable(aiAction.outputVariableName, response.content, context);

                }

                new Notice(`AI调用成功，结果已存储到变量 ${aiAction.outputVariableName}`);
            } else {
                debugManager.error('AICallAction', 'AI调用失败', response.error);
                throw new Error(response.error || 'AI调用失败');
            }

        } catch (error) {
            debugManager.error('AICallAction', 'AI调用过程中发生错误', error);
            new Notice(`AI调用失败: ${error.message}`);
            throw error;
        }

        // 继续执行链中的下一个动作
        await chain.next(context);
    }
    
    /**
     * 执行AI调用动作
     */
    static async execute(action: AICallFormAction, context: ActionContext): Promise<void> {
        try {
            // 获取AI模型
            const model = await this.getSelectedModel(action, context);
            if (!model) {
                throw new Error('未找到有效的AI模型');
            }

            // 准备提示词
            const prompt = await this.preparePrompt(action, context);
            if (!prompt.trim()) {
                throw new Error('提示词内容为空');
            }

            // 准备消息
            const messages = await this.prepareMessages(prompt, context);

            // 创建AI客户端并调用
            const client = AIApiClient.create(model);
            const response = await client.call({
                messages,
                maxTokens: model.maxOutputTokens
            });

            if (response.success && response.content) {
                // 存储结果到输出变量
                if (action.outputVariableName) {
                    this.storeOutputVariable(action.outputVariableName, response.content, context);
                }

                new Notice(`AI调用成功，结果已存储到变量 ${action.outputVariableName}`);
            } else {
                throw new Error(response.error || 'AI调用失败');
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'AI调用过程中发生未知错误';
            new Notice(`AI调用失败: ${errorMessage}`);
            throw error;
        }
    }

    /**
     * 获取选择的AI模型
     */
    private static async getSelectedModel(action: AICallFormAction, context: ActionContext): Promise<IAIModelConfig | null> {
        const aiSettingsService = new AISettingsService(context.app);
        const aiSettings = await aiSettingsService.loadSettings();

        // 如果指定了模型字段名，从表单值中获取模型ID
        if (action.modelFieldName) {
            const modelField = context.config.fields.find(
                field => field.label === action.modelFieldName && field.type === FormFieldType.AI_MODEL_LIST
            ) as AIModelListField;

            if (modelField) {
                // 首先尝试从用户输入值中获取选择的模型
                const selectedModelId = context.state.idValues[modelField.id];
                if (selectedModelId) {
                    const model = aiSettings.models.find((m: IAIModelConfig) => m.id === selectedModelId);
                    if (model) {

                        return model;
                    }
                }

                // 如果用户没有选择，使用字段的默认模型
                if (modelField.selectedModelId) {
                    const model = aiSettings.models.find((m: IAIModelConfig) => m.id === modelField.selectedModelId);
                    if (model) {

                        return model;
                    }
                }

                // 如果字段设置了自动选择第一个模型
                if (modelField.autoSelectFirst && aiSettings.models.length > 0) {
                    const firstModel = aiSettings.models[0];

                    return firstModel;
                }
            }
        }

        // 如果没有指定模型字段或找不到模型，使用第一个可用的已验证模型
        const verifiedModel = aiSettings.models.find((m: IAIModelConfig) => m.verified);
        if (verifiedModel) {

            return verifiedModel;
        }

        // 最后尝试使用任何可用模型
        if (aiSettings.models.length > 0) {
            const firstAvailable = aiSettings.models[0];

            return firstAvailable;
        }

        debugManager.error('AICallAction', '没有找到任何可用的AI模型');
        return null;
    }

    /**
     * 准备提示词内容
     */
    private static async preparePrompt(action: AICallFormAction, context: ActionContext): Promise<string> {
        let promptContent = '';

        if (action.promptSource === PromptSourceType.BUILTIN_TEMPLATE) {
            // 检查是否有模板列表字段
            if (action.templateFieldName) {
                const templateField = context.config.fields.find(
                    field => field.label === action.templateFieldName && field.type === FormFieldType.TEMPLATE_LIST
                );

                if (templateField) {
                    // 从表单值中获取选择的模板文件
                    const selectedTemplateFile = context.state.idValues[templateField.id];
                    if (selectedTemplateFile) {
                        const aiSettingsService = new AISettingsService(context.app);
                        const aiSettings = await aiSettingsService.loadSettings();
                        const templateService = new PromptTemplateService(context.app, aiSettings.promptTemplateFolder);
                        promptContent = await templateService.loadTemplate(String(selectedTemplateFile));
                    } else {
                        throw new Error(`模板列表字段 "${action.templateFieldName}" 未选择模板文件`);
                    }
                } else {
                    throw new Error(`未找到模板列表字段: ${action.templateFieldName}`);
                }
            } else if (action.templateFile) {
                // 直接从指定的模板文件加载
                const aiSettingsService = new AISettingsService(context.app);
                const aiSettings = await aiSettingsService.loadSettings();
                const templateService = new PromptTemplateService(context.app, aiSettings.promptTemplateFolder);
                
                promptContent = await templateService.loadTemplate(action.templateFile);
            } else {
                throw new Error('内置模板模式下必须指定模板文件或模板列表字段');
            }
        } else if (action.promptSource === PromptSourceType.CUSTOM && action.customPrompt) {
            // 使用自定义提示词
            promptContent = action.customPrompt;
        } else {
            throw new Error('未配置有效的提示词来源');
        }

        // 使用FormTemplateProcessEngine来处理变量替换，确保与其他地方的处理一致
        const { FormTemplateProcessEngine } = await import('../engine/FormTemplateProcessEngine');
        const templateEngine = new FormTemplateProcessEngine();
        
        // 构建FormState对象
        const formState = {
            values: context.state.values, // 这是FormLabelValues，使用字段标签作为键
            idValues: context.state.idValues,
            outputVariables: context.state.outputVariables || {}
        };

        const processedContent = await templateEngine.process(promptContent, formState, context.app, context.config);
        return String(processedContent);
    }

    /**
     * 准备AI消息
     */
    private static async prepareMessages(userPrompt: string, context: ActionContext): Promise<AIMessage[]> {
        const messages: AIMessage[] = [];

        // 添加系统提示词（如果启用）
        const aiSettingsService = new AISettingsService(context.app);
        const aiSettings = await aiSettingsService.loadSettings();
        
        if (aiSettings.enableSystemPrompt && aiSettings.systemPrompt.trim()) {
            messages.push({
                role: 'system',
                content: aiSettings.systemPrompt
            });
        }

        // 添加用户提示词
        messages.push({
            role: 'user',
            content: userPrompt
        });

        return messages;
    }

    /**
     * 存储输出变量
     */
    private static storeOutputVariable(variableName: string, content: string, context: ActionContext): void {
        // 在上下文中存储输出变量，以便后续动作可以引用
        if (!context.state.outputVariables) {
            context.state.outputVariables = {};
        }
        context.state.outputVariables[variableName] = content;
    }

    /**
     * 获取已存在的输出变量
     */
    private static getOutputVariables(context: ActionContext): Record<string, any> {
        return context.state.outputVariables || {};
    }

    /**
     * 获取内置变量
     */
    private static getInternalVariables(context: ActionContext): Record<string, any> {
        const now = new Date();
        
        return {
            now: now.toISOString(),
            today: now.toISOString().split('T')[0],
            datetime: now.toLocaleString(),
            date: now.toLocaleDateString(),
            time: now.toLocaleTimeString(),
            // 可以添加更多内置变量
            clipboard: '', // 需要从剪贴板读取
            selection: '', // 需要从当前选择读取
        };
    }

    /**
     * 验证动作配置
     */
    static validate(action: AICallFormAction): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        // 检查输出变量名
        if (!action.outputVariableName || !action.outputVariableName.trim()) {
            errors.push('输出变量名不能为空');
        } else {
            // 检查变量名格式
            const validVariableName = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(action.outputVariableName);
            if (!validVariableName) {
                errors.push('输出变量名格式不正确，只能包含字母、数字和下划线，且不能以数字开头');
            }
        }

        // 检查提示词配置
        if (action.promptSource === PromptSourceType.BUILTIN_TEMPLATE) {
            // 检查是否配置了模板来源（模板字段或直接模板文件）
            if (!action.templateFieldName && (!action.templateFile || !action.templateFile.trim())) {
                errors.push('选择内置模板时必须指定模板文件或选择模板列表字段');
            }
        } else if (action.promptSource === PromptSourceType.CUSTOM) {
            if (!action.customPrompt || !action.customPrompt.trim()) {
                errors.push('选择自定义提示时必须输入提示词内容');
            }
        } else {
            errors.push('必须选择提示词来源');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }
}
