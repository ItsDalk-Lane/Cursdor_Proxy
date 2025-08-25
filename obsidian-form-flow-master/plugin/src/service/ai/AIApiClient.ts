import { requestUrl, RequestUrlParam } from "obsidian";
import { IAIModelConfig, AIProvider } from "../../model/ai/AIModelConfig";
import { debugManager } from "../../utils/DebugManager";

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
            debugManager.log('AIApiClient', `开始调用AI模型: ${this.model.provider} - ${this.model.modelName}`);
            
            const requestBody = this.buildRequestBody(request);
            const headers = this.buildHeaders();
            const url = this.buildApiUrl();

            debugManager.log('AIApiClient', `请求URL: ${url}`);
            debugManager.log('AIApiClient', `请求体消息数量: ${request.messages.length}`);
            
            const requestParams: RequestUrlParam = {
                url,
                method: 'POST',
                headers,
                body: JSON.stringify(requestBody),
                throw: false
            };

            const response = await requestUrl(requestParams);
            
            debugManager.log('AIApiClient', `响应状态: ${response.status}`);
            debugManager.log('AIApiClient', `响应文本长度: ${response.text?.length || 0}`);

            if (response.status === 200) {
                debugManager.log('AIApiClient', 'AI调用成功，开始解析响应');
                
                // 安全解析JSON响应
                let responseData;
                try {
                    if (!response.text || response.text.trim() === '') {
                        debugManager.error('AIApiClient', '响应内容为空');
                        return {
                            success: false,
                            error: '服务器返回空响应'
                        };
                    }
                    
                    responseData = JSON.parse(response.text);
                    debugManager.log('AIApiClient', 'JSON解析成功');
                } catch (parseError) {
                    debugManager.error('AIApiClient', `JSON解析失败: ${parseError.message}`);
                    debugManager.log('AIApiClient', `响应文本前500字符: ${response.text?.substring(0, 500)}`);
                    return {
                        success: false,
                        error: `无法解析AI响应格式: ${parseError.message}`
                    };
                }
                
                return this.parseResponse(responseData);
            } else {
                // 安全解析错误响应
                let errorData;
                try {
                    if (response.text && response.text.trim() !== '') {
                        errorData = JSON.parse(response.text);
                    }
                } catch (parseError) {
                    debugManager.log('AIApiClient', `错误响应JSON解析失败: ${parseError.message}`);
                }
                
                const errorMessage = errorData?.error?.message || `HTTP ${response.status}: ${response.text}`;
                debugManager.error('AIApiClient', `AI调用失败: ${errorMessage}`);
                return {
                    success: false,
                    error: errorMessage
                };
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "AI调用失败";
            debugManager.error('AIApiClient', `AI调用异常: ${errorMessage}`, error);
            return {
                success: false,
                error: errorMessage
            };
        }
    }

    /**
     * 构建请求体
     */
    private buildRequestBody(request: AIRequest): any {
        debugManager.log('AIApiClient', `构建请求体，提供商: ${this.model.provider}`);
        
        // 针对不同提供商的特殊处理
        switch (this.model.provider) {
            case AIProvider.TONGYI:
                debugManager.log('AIApiClient', '构建通义千问请求体');
                // 通义千问使用compatible-mode端点，需要使用OpenAI兼容格式
                const tongyiBody = {
                    model: this.model.modelName,
                    messages: request.messages.map(msg => ({
                        role: msg.role,
                        content: msg.content
                    })),
                    max_tokens: Math.min(request.maxTokens || this.model.maxOutputTokens, this.model.maxOutputTokens),
                    temperature: request.temperature || this.model.advancedSettings?.temperature || 0.7,
                    top_p: request.topP || this.model.advancedSettings?.topP || 0.9,
                    stream: false
                };
                debugManager.log('AIApiClient', `通义千问请求体: ${JSON.stringify(tongyiBody, null, 2)}`);
                return tongyiBody;
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
                debugManager.log('AIApiClient', '构建Gemini请求体');
                // Gemini API 请求格式 - 需要正确处理角色映射
                const geminiContents = [];
                let systemInstruction = '';
                
                // 分离系统消息和其他消息
                for (const msg of request.messages) {
                    if (msg.role === 'system') {
                        systemInstruction = msg.content;
                    } else {
                        geminiContents.push({
                            role: msg.role === 'assistant' ? 'model' : 'user',
                            parts: [{
                                text: msg.content
                            }]
                        });
                    }
                }
                
                const geminiRequest: any = {
                    contents: geminiContents,
                    generationConfig: {
                        maxOutputTokens: Math.min(request.maxTokens || this.model.maxOutputTokens, this.model.maxOutputTokens),
                        temperature: request.temperature || this.model.advancedSettings?.temperature || 0.7,
                        topP: request.topP || this.model.advancedSettings?.topP || 0.9,
                        candidateCount: 1,
                        stopSequences: []
                    },
                    safetySettings: [
                        {
                            category: "HARM_CATEGORY_HARASSMENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_HATE_SPEECH",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        }
                    ]
                };
                
                // 如果有系统指令，添加到请求中
                if (systemInstruction) {
                    geminiRequest.systemInstruction = {
                        parts: [{
                            text: systemInstruction
                        }]
                    };
                }
                
                debugManager.log('AIApiClient', `Gemini请求体: ${JSON.stringify(geminiRequest, null, 2)}`);
                return geminiRequest;
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
                return `${baseUrl}v4/chat/completions`;
            case AIProvider.TONGYI:
                // 通义千问API端点修复 - 与验证服务保持一致的URL构建逻辑
                let cleanBaseUrl = baseUrl.replace(/\/$/, '');
                // 如果baseUrl包含/api，移除它，因为我们要使用完整的端点
                if (cleanBaseUrl.endsWith('/api')) {
                    cleanBaseUrl = cleanBaseUrl.replace(/\/api$/, '');
                }
                const tongyiUrl = `${cleanBaseUrl}/compatible-mode/v1/chat/completions`;
                debugManager.log('AIApiClient', `通义千问URL构建: ${tongyiUrl}`);
                return tongyiUrl;
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
            debugManager.log('AIApiClient', `开始解析响应，数据结构: ${JSON.stringify(Object.keys(data || {}), null, 2)}`);
            
            // Gemini 格式
            if (data.candidates && data.candidates.length > 0) {
                debugManager.log('AIApiClient', '检测到Gemini格式响应');
                const candidate = data.candidates[0];
                
                // 检查新格式：candidate.content.parts存在
                if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                    const content = candidate.content.parts[0].text || '';
                    debugManager.log('AIApiClient', `Gemini标准格式，内容长度: ${content.length}`);
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
                
                // 检查candidate.content存在但parts为空的情况（异常响应）
                if (candidate.content && candidate.content.role && !candidate.content.parts) {
                    debugManager.error('AIApiClient', `Gemini响应异常：content只有role字段，无parts数组。可能是API返回了空响应或发生了错误。`);
                    debugManager.error('AIApiClient', `完整candidate结构: ${JSON.stringify(candidate, null, 2)}`);
                    
                    // 检查是否有finishReason提供更多信息
                    const finishReason = candidate.finishReason || 'UNKNOWN';
                    let errorMessage = `Gemini API返回了空响应 (finishReason: ${finishReason})`;
                    let suggestions = [];
                    
                    if (finishReason === 'SAFETY') {
                        errorMessage = 'Gemini API因安全策略阻止了响应生成';
                        suggestions.push('请检查输入内容是否符合安全要求');
                        suggestions.push('尝试修改提示词，避免敏感内容');
                    } else if (finishReason === 'RECITATION') {
                        errorMessage = 'Gemini API因版权问题阻止了响应生成';
                        suggestions.push('请避免使用可能涉及版权的内容');
                    } else if (finishReason === 'OTHER') {
                        errorMessage = 'Gemini API因其他原因无法生成响应';
                        suggestions.push('请检查API密钥是否正确');
                        suggestions.push('请检查模型名称是否正确');
                    } else if (finishReason === 'STOP') {
                        errorMessage = 'Gemini API正常结束但返回了空内容';
                        suggestions.push('请尝试调整提示词，使其更加明确');
                        suggestions.push('请检查输入内容是否过于简短或模糊');
                        suggestions.push('请尝试增加maxOutputTokens参数');
                    }
                    
                    if (suggestions.length > 0) {
                        errorMessage += '。建议：' + suggestions.join('；');
                    }
                    
                    debugManager.error('AIApiClient', `错误详情: ${errorMessage}`);
                    
                    return {
                        success: false,
                        error: errorMessage
                    };
                }
                
                // 检查新格式：candidate直接包含text或者其他格式
                if (candidate.text) {
                    debugManager.log('AIApiClient', `Gemini简化格式，内容长度: ${candidate.text.length}`);
                    return {
                        success: true,
                        content: candidate.text,
                        usage: data.usageMetadata ? {
                            promptTokens: data.usageMetadata.promptTokenCount || 0,
                            completionTokens: data.usageMetadata.candidateTokenCount || 0,
                            totalTokens: (data.usageMetadata.promptTokenCount || 0) + (data.usageMetadata.candidateTokenCount || 0)
                        } : undefined
                    };
                }
                
                // 如果candidate存在但格式不匹配，记录详细信息并返回错误
                debugManager.error('AIApiClient', `Gemini响应格式异常，candidate结构: ${JSON.stringify(candidate, null, 2)}`);
                return {
                    success: false,
                    error: "Gemini API返回了无法识别的响应格式"
                };
            }

            // 标准OpenAI格式
            if (data.choices && data.choices.length > 0) {
                debugManager.log('AIApiClient', '检测到OpenAI格式响应');
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

            // 通义千问兼容模式格式（使用OpenAI格式）
            if (data.choices && data.choices.length > 0 && data.choices[0].message) {
                debugManager.log('AIApiClient', '检测到通义千问兼容模式响应');
                const choice = data.choices[0];
                return {
                    success: true,
                    content: choice.message.content || '',
                    usage: data.usage ? {
                        promptTokens: data.usage.prompt_tokens || 0,
                        completionTokens: data.usage.completion_tokens || 0,
                        totalTokens: data.usage.total_tokens || 0
                    } : undefined
                };
            }

            // 通义千问原生格式（备用）
            if (data.output && data.output.text) {
                debugManager.log('AIApiClient', '检测到通义千问原生格式响应');
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
                debugManager.log('AIApiClient', '检测到智谱格式响应');
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

            debugManager.error('AIApiClient', `无法识别的响应格式，完整数据: ${JSON.stringify(data, null, 2)}`);
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
