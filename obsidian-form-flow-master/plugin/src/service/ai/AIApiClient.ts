import { requestUrl, RequestUrlParam } from "obsidian";
import { IAIModelConfig, AIProvider } from "../../model/ai/AIModelConfig";

export interface AIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface AIRequest {
    messages: AIMessage[];
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
}

export interface AIResponse {
    success: boolean;
    content?: string;
    error?: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

export class AIApiClient {
    private model: IAIModelConfig;

    constructor(model: IAIModelConfig) {
        this.model = model;
    }

    /**
     * 调用AI模型
     */
    async call(request: AIRequest): Promise<AIResponse> {
        try {
            const requestBody = this.buildRequestBody(request);
            const headers = this.buildHeaders();
            const url = this.buildApiUrl();

            const requestParams: RequestUrlParam = {
                url,
                method: 'POST',
                headers,
                body: JSON.stringify(requestBody),
                throw: false
            };

            const response = await requestUrl(requestParams);

            if (response.status === 200) {
                return this.parseResponse(response.json);
            } else {
                const errorData = response.json;
                return {
                    success: false,
                    error: errorData?.error?.message || `HTTP ${response.status}: ${response.text}`
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "AI调用失败"
            };
        }
    }

    /**
     * 构建请求体
     */
    private buildRequestBody(request: AIRequest): any {
        // 针对不同提供商的特殊处理
        switch (this.model.provider) {
            case AIProvider.TONGYI:
                return {
                    model: this.model.modelName,
                    input: {
                        messages: request.messages
                    },
                    parameters: {
                        max_tokens: Math.min(request.maxTokens || this.model.maxOutputTokens, this.model.maxOutputTokens),
                        temperature: request.temperature || this.model.advancedSettings?.temperature || 0.7,
                        top_p: request.topP || this.model.advancedSettings?.topP || 0.9
                    }
                };
            case AIProvider.ZHIPU:
                return {
                    model: this.model.modelName,
                    messages: request.messages,
                    max_tokens: Math.min(request.maxTokens || this.model.maxOutputTokens, this.model.maxOutputTokens),
                    temperature: request.temperature || this.model.advancedSettings?.temperature || 0.7,
                    top_p: request.topP || this.model.advancedSettings?.topP || 0.9,
                    frequency_penalty: request.frequencyPenalty || this.model.advancedSettings?.frequencyPenalty || 0.0,
                    presence_penalty: request.presencePenalty || this.model.advancedSettings?.presencePenalty || 0.0,
                    stream: false
                };
            case AIProvider.GEMINI:
                // Gemini API 请求格式
                return {
                    contents: request.messages.map(msg => ({
                        role: msg.role === 'assistant' ? 'model' : msg.role,
                        parts: [{
                            text: msg.content
                        }]
                    })),
                    generationConfig: {
                        maxOutputTokens: Math.min(request.maxTokens || this.model.maxOutputTokens, this.model.maxOutputTokens),
                        temperature: request.temperature || this.model.advancedSettings?.temperature || 0.7,
                        topP: request.topP || this.model.advancedSettings?.topP || 0.9
                    }
                };
            default:
                return {
                    model: this.model.modelName,
                    messages: request.messages,
                    max_tokens: Math.min(request.maxTokens || this.model.maxOutputTokens, this.model.maxOutputTokens),
                    temperature: request.temperature || this.model.advancedSettings?.temperature || 0.7,
                    top_p: request.topP || this.model.advancedSettings?.topP || 0.9,
                    frequency_penalty: request.frequencyPenalty || this.model.advancedSettings?.frequencyPenalty || 0.0,
                    presence_penalty: request.presencePenalty || this.model.advancedSettings?.presencePenalty || 0.0
                };
        }
    }

    /**
     * 构建请求头
     */
    private buildHeaders(): Record<string, string> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };

        switch (this.model.provider) {
            case AIProvider.DEEPSEEK:
            case AIProvider.OPENROUTER:
            case AIProvider.SILICONFLOW:
            case AIProvider.CUSTOM:
                headers['Authorization'] = `Bearer ${this.model.apiKey}`;
                break;
            case AIProvider.ZHIPU:
                headers['Authorization'] = `Bearer ${this.model.apiKey}`;
                break;
            case AIProvider.TONGYI:
                headers['Authorization'] = `Bearer ${this.model.apiKey}`;
                headers['X-DashScope-SSE'] = 'disable';
                break;
            case AIProvider.GEMINI:
                // Gemini使用URL参数认证，不需要设置header
                break;
        }

        // OpenRouter 特殊处理
        if (this.model.provider === AIProvider.OPENROUTER) {
            headers['HTTP-Referer'] = 'https://obsidian.md';
            headers['X-Title'] = 'Obsidian Form Flow';
        }

        return headers;
    }

    /**
     * 构建API URL
     */
    private buildApiUrl(): string {
        let baseUrl = this.model.baseUrl;
        
        if (!baseUrl.endsWith('/')) {
            baseUrl += '/';
        }

        switch (this.model.provider) {
            case AIProvider.DEEPSEEK:
                return `${baseUrl}v1/chat/completions`;
            case AIProvider.ZHIPU:
                return `${baseUrl}/v4/chat/completions`;
            case AIProvider.TONGYI:
                return `${baseUrl}compatible-mode/v1/chat/completions`;
            case AIProvider.SILICONFLOW:
                return `${baseUrl}v1/chat/completions`;
            case AIProvider.OPENROUTER:
                return `${baseUrl}v1/chat/completions`;
            case AIProvider.GEMINI:
                return `${baseUrl}models/${this.model.modelName}:generateContent?key=${encodeURIComponent(this.model.apiKey)}`;
            case AIProvider.CUSTOM:
                return `${baseUrl}v1/chat/completions`;
            default:
                return `${baseUrl}v1/chat/completions`;
        }
    }

    /**
     * 解析响应
     */
    private parseResponse(data: any): AIResponse {
        try {
            // Gemini 格式
            if (data.candidates && data.candidates.length > 0) {
                const candidate = data.candidates[0];
                if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                    const content = candidate.content.parts[0].text || '';
                    return {
                        success: true,
                        content,
                        usage: data.usageMetadata ? {
                            promptTokens: data.usageMetadata.promptTokenCount || 0,
                            completionTokens: data.usageMetadata.candidateTokenCount || 0,
                            totalTokens: (data.usageMetadata.promptTokenCount || 0) + (data.usageMetadata.candidateTokenCount || 0)
                        } : undefined
                    };
                }
            }

            // 标准OpenAI格式
            if (data.choices && data.choices.length > 0) {
                const choice = data.choices[0];
                const content = choice.message?.content || choice.text || '';
                
                return {
                    success: true,
                    content,
                    usage: data.usage ? {
                        promptTokens: data.usage.prompt_tokens || 0,
                        completionTokens: data.usage.completion_tokens || 0,
                        totalTokens: data.usage.total_tokens || 0
                    } : undefined
                };
            }

            // 通义千问格式
            if (data.output && data.output.text) {
                return {
                    success: true,
                    content: data.output.text,
                    usage: data.usage ? {
                        promptTokens: data.usage.input_tokens || 0,
                        completionTokens: data.usage.output_tokens || 0,
                        totalTokens: (data.usage.input_tokens || 0) + (data.usage.output_tokens || 0)
                    } : undefined
                };
            }

            // 智谱格式
            if (data.data && data.data.choices && data.data.choices.length > 0) {
                const choice = data.data.choices[0];
                return {
                    success: true,
                    content: choice.message?.content || '',
                    usage: data.data.usage ? {
                        promptTokens: data.data.usage.prompt_tokens || 0,
                        completionTokens: data.data.usage.completion_tokens || 0,
                        totalTokens: data.data.usage.total_tokens || 0
                    } : undefined
                };
            }

            return {
                success: false,
                error: "无法解析AI响应格式"
            };
        } catch (error) {
            return {
                success: false,
                error: `响应解析失败: ${error instanceof Error ? error.message : '未知错误'}`
            };
        }
    }

    /**
     * 创建客户端实例
     */
    static create(model: IAIModelConfig): AIApiClient {
        return new AIApiClient(model);
    }
}
