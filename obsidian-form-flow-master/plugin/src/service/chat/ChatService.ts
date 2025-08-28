import { App } from "obsidian";
import { AIApiClient, AIMessage, StreamCallback } from "../ai/AIApiClient";
import { IAIModelConfig } from "../../model/ai/AIModelConfig";
import { AISettingsService } from "../ai/AISettingsService";
import { PromptTemplateService, VariableContext } from "../ai/PromptTemplateService";
import { ConversationSaveConfig } from "../../model/action/AICallFormAction";
import { ConversationSaveService } from "../conversation/ConversationSaveService";
import { debugManager } from "../../utils/DebugManager";
import { ChatMessage } from "../../view/shared/chat/FloatingChatDialog";

/**
 * 流式响应回调接口
 */
export interface StreamResponseCallback {
    (chunk: string, isComplete: boolean): void;
}

/**
 * 对话配置接口
 */
export interface ChatConfig {
    modelId: string;
    promptTemplate?: string;
    systemPrompt?: string;
    maxTokens?: number;
    temperature?: number;
    saveConfig?: ConversationSaveConfig;
}

/**
 * 对话上下文接口
 */
export interface ChatContext {
    messages: ChatMessage[];
    config: ChatConfig;
    variableContext?: VariableContext;
}

/**
 * 聊天服务类
 * 处理AI流式调用和对话管理
 */
export class ChatService {
    private app: App;
    private conversationSaveService: ConversationSaveService;
    private activeChats: Map<string, ChatContext> = new Map();
    
    constructor(app: App) {
        this.app = app;
        this.conversationSaveService = new ConversationSaveService(app);
    }
    
    /**
     * 创建新的对话会话
     */
    public createSession(config: ChatConfig): string {
        const sessionId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        return this.createChatSession(sessionId, config);
    }

    /**
     * 创建新的对话会话（内部方法）
     */
    public createChatSession(sessionId: string, config: ChatConfig): string {
        const context: ChatContext = {
            messages: [],
            config,
            variableContext: {
                formValues: {},
                internalVariables: {
                    currentFile: this.app.workspace.getActiveFile()?.path || '',
                    currentTime: new Date().toISOString(),
                    userName: 'User'
                }
            }
        };
        
        this.activeChats.set(sessionId, context);
        debugManager.info('ChatService', `创建对话会话: ${sessionId}`);
        
        return sessionId;
    }
    
    /**
     * 获取对话会话
     */
    public getChatSession(sessionId: string): ChatContext | undefined {
        return this.activeChats.get(sessionId);
    }
    
    /**
     * 删除对话会话
     */
    public deleteSession(sessionId: string): boolean {
        return this.deleteChatSession(sessionId);
    }

    /**
     * 删除对话会话（内部方法）
     */
    public deleteChatSession(sessionId: string): boolean {
        const deleted = this.activeChats.delete(sessionId);
        if (deleted) {
            debugManager.info('ChatService', `删除对话会话: ${sessionId}`);
        }
        return deleted;
    }
    
    /**
     * 清除对话历史
     */
    public clearSession(sessionId: string): boolean {
        return this.clearChatHistory(sessionId);
    }

    /**
     * 清除对话历史（内部方法）
     */
    public clearChatHistory(sessionId: string): boolean {
        const context = this.activeChats.get(sessionId);
        if (context) {
            context.messages = [];
            debugManager.info('ChatService', `清除对话历史: ${sessionId}`);
            return true;
        }
        return false;
    }
    
    /**
     * 添加消息到对话
     */
    public async addMessage(sessionId: string, message: ChatMessage): Promise<boolean> {
        const context = this.activeChats.get(sessionId);
        if (context) {
            context.messages.push(message);
            debugManager.log('ChatService', `添加消息到会话 ${sessionId}`, message);
            
            // 触发自动保存
            await this.autoSaveConversation(sessionId);
            
            return true;
        }
        return false;
    }
    
    /**
     * 发送消息并获取AI响应
     */
    public async sendMessage(
        sessionId: string,
        userMessage: string,
        callback?: StreamResponseCallback
    ): Promise<ChatMessage> {
        const context = this.activeChats.get(sessionId);
        if (!context) {
            throw new Error(`对话会话不存在: ${sessionId}`);
        }
        
        debugManager.info('ChatService', `发送消息到会话 ${sessionId}`);
        
        // 添加用户消息
        const userChatMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: userMessage,
            timestamp: Date.now()
        };
        
        context.messages.push(userChatMessage);
        
        try {
            // 获取AI模型配置
            const model = await this.getModelConfig(context.config.modelId);
            if (!model) {
                throw new Error(`未找到AI模型: ${context.config.modelId}`);
            }
            
            // 准备AI消息
            const aiMessages = await this.prepareAIMessages(context);
            
            // 创建AI客户端
            const client = AIApiClient.create(model);
            
            // 调用AI API
            const response = await client.call({
                messages: aiMessages,
                maxTokens: context.config.maxTokens || model.maxOutputTokens,
                temperature: context.config.temperature
            });
            
            if (!response.success || !response.content) {
                throw new Error(response.error || 'AI调用失败');
            }
            
            // 创建AI响应消息
            const aiChatMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.content,
                timestamp: Date.now()
            };
            
            context.messages.push(aiChatMessage);
            
            // 如果有回调，直接调用完成回调
            if (callback) {
                callback(response.content, true);
            }
            
            debugManager.info('ChatService', `AI响应完成，会话 ${sessionId}`);
            
            return aiChatMessage;
            
        } catch (error) {
            debugManager.error('ChatService', `发送消息失败，会话 ${sessionId}`, error);
            throw error;
        }
    }
    
    /**
     * 流式发送消息（模拟实现）
     */
    public async sendMessageStream(
        sessionId: string,
        userMessage: string,
        callback: StreamResponseCallback
    ): Promise<ChatMessage> {
        const context = this.activeChats.get(sessionId);
        if (!context) {
            throw new Error(`对话会话不存在: ${sessionId}`);
        }
        
        debugManager.info('ChatService', `流式发送消息到会话 ${sessionId}`);
        
        // 添加用户消息
        const userChatMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: userMessage,
            timestamp: Date.now()
        };
        
        context.messages.push(userChatMessage);
        
        try {
            // 获取AI模型配置
            const model = await this.getModelConfig(context.config.modelId);
            if (!model) {
                throw new Error(`未找到AI模型: ${context.config.modelId}`);
            }
            
            // 准备AI消息
            const aiMessages = await this.prepareAIMessages(context);
            
            // 创建AI客户端
            const client = AIApiClient.create(model);
            
            let fullContent = '';
            
            // 创建流式回调适配器
            const streamCallback: StreamCallback = (chunk: string, isComplete: boolean) => {
                if (chunk) {
                    fullContent += chunk;
                }
                callback(chunk, isComplete);
            };
            
            // 调用AI API（流式）
            const response = await client.callStream({
                messages: aiMessages,
                maxTokens: context.config.maxTokens || model.maxOutputTokens,
                temperature: context.config.temperature,
                stream: true
            }, streamCallback);
            
            if (!response.success) {
                throw new Error(response.error || 'AI流式调用失败');
            }
            
            // 使用累积的内容作为最终内容
            const finalContent = fullContent || response.content || '';
            
            // 创建AI响应消息
            const aiChatMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: finalContent,
                timestamp: Date.now()
            };
            
            context.messages.push(aiChatMessage);
            
            debugManager.info('ChatService', `流式AI响应完成，会话 ${sessionId}`);
            
            return aiChatMessage;
            
        } catch (error) {
            debugManager.error('ChatService', `流式发送消息失败，会话 ${sessionId}`, error);
            
            // 调用错误回调
            // 错误处理，这里可以通过抛出异常来处理
            
            throw error;
        }
    }
    
    /**
     * 获取AI模型配置
     */
    private async getModelConfig(modelId: string): Promise<IAIModelConfig | null> {
        try {
            const aiSettingsService = new AISettingsService(this.app);
        const allModels = aiSettingsService.getModels();
        return allModels.find((model: IAIModelConfig) => model.id === modelId) || null;
        } catch (error) {
            debugManager.error('ChatService', '获取AI模型配置失败', error);
            return null;
        }
    }
    
    /**
     * 准备AI消息
     */
    private async prepareAIMessages(context: ChatContext): Promise<AIMessage[]> {
        const messages: AIMessage[] = [];
        
        // 添加系统提示词
        let systemPrompt = '';
        
        // 检查是否启用了用户系统提示
        const aiSettingsService = new AISettingsService(this.app);
        const settings = aiSettingsService.getSettings();
        const userSystemPrompt = settings.enableSystemPrompt ? settings.systemPrompt : '';
        if (userSystemPrompt) {
            systemPrompt = userSystemPrompt;
        }
        
        // 添加模板提示词
        if (context.config.promptTemplate) {
            try {
                const templateService = new PromptTemplateService(this.app, 'templates');
                const templateContent = await templateService.loadTemplate(context.config.promptTemplate);
                if (templateContent) {
                    const processedTemplate = templateService.processTemplate(
                        templateContent,
                        context.variableContext || { formValues: {} }
                    );
                    
                    if (userSystemPrompt) {
                        // 如果有用户系统提示，模板作为用户消息
                        systemPrompt = userSystemPrompt;
                        messages.push({
                            role: 'user',
                            content: processedTemplate
                        });
                    } else {
                        // 否则模板作为系统提示
                        systemPrompt = processedTemplate;
                    }
                }
            } catch (error) {
                debugManager.warn('ChatService', '处理提示词模板失败', error);
            }
        }
        
        // 添加自定义系统提示词
        if (context.config.systemPrompt) {
            if (systemPrompt) {
                systemPrompt += '\n\n' + context.config.systemPrompt;
            } else {
                systemPrompt = context.config.systemPrompt;
            }
        }
        
        // 添加系统消息
        if (systemPrompt) {
            messages.push({
                role: 'system',
                content: systemPrompt
            });
        }
        
        // 添加对话历史
        for (const message of context.messages) {
            messages.push({
                role: message.role === 'user' ? 'user' : 'assistant',
                content: message.content
            });
        }
        
        return messages;
    }
    
    /**
     * 模拟流式输出
     */

    
    /**
     * 获取对话历史
     */
    public getChatHistory(sessionId: string): ChatMessage[] {
        const context = this.activeChats.get(sessionId);
        return context ? [...context.messages] : [];
    }
    
    /**
     * 更新对话配置
     */
    public updateChatConfig(sessionId: string, config: Partial<ChatConfig>): boolean {
        const context = this.activeChats.get(sessionId);
        if (context) {
            context.config = { ...context.config, ...config };
            debugManager.info('ChatService', `更新对话配置，会话 ${sessionId}`);
            return true;
        }
        return false;
    }
    
    /**
     * 获取活跃会话数量
     */
    public getActiveSessionCount(): number {
        return this.activeChats.size;
    }
    
    /**
     * 获取所有活跃会话ID
     */
    public getActiveSessionIds(): string[] {
        return Array.from(this.activeChats.keys());
    }
    
    /**
     * 保存对话到文件
     * @param sessionId 会话ID
     */
    public async saveConversation(sessionId: string): Promise<void> {
        const context = this.activeChats.get(sessionId);
        if (!context) {
            debugManager.warn('ChatService', `会话不存在: ${sessionId}`);
            return;
        }

        if (!context.config.saveConfig) {
            debugManager.info('ChatService', `会话 ${sessionId} 未配置保存设置`);
            return;
        }

        try {
            await this.conversationSaveService.saveConversation(
                context.messages,
                context.config.saveConfig
            );
            debugManager.info('ChatService', `对话已保存，会话 ${sessionId}`);
        } catch (error) {
            debugManager.error('ChatService', '保存对话失败', error);
            throw error;
        }
    }

    /**
     * 自动保存对话（在添加新消息后）
     * @param sessionId 会话ID
     */
    private async autoSaveConversation(sessionId: string): Promise<void> {
        const context = this.activeChats.get(sessionId);
        if (!context || !context.config.saveConfig?.enabled) {
            return;
        }

        // 只有在有用户消息和AI回复时才自动保存
        if (context.messages.length >= 2) {
            try {
                await this.saveConversation(sessionId);
            } catch (error) {
                debugManager.error('ChatService', '自动保存失败', error);
                // 自动保存失败不应该影响正常对话流程
            }
        }
    }

    /**
     * 清理所有会话
     */
    public clearAllSessions(): void {
        this.activeChats.clear();
        debugManager.info('ChatService', '清理所有对话会话');
    }
}