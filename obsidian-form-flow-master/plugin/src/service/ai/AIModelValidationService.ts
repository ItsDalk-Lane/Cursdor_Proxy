import { requestUrl, RequestUrlParam } from "obsidian";
import { IAIModelConfig, AIProvider } from "../../model/ai/AIModelConfig";

export interface AIModelValidationResult {
    success: boolean;
    message: string;
    capabilities: {
        reasoning: boolean;
        webSearch: boolean;
    };
}

export class AIModelValidationService {
    
    /**
     * 验证AI模型配置
     */
    static async validateModel(model: IAIModelConfig): Promise<AIModelValidationResult> {
        try {
            const response = await this.testModelConnection(model);
            
            if (response.success) {
                // 检测模型能力
                const capabilities = await this.detectCapabilities(model);
                
                return {
                    success: true,
                    message: "模型验证成功",
                    capabilities
                };
            } else {
                return {
                    success: false,
                    message: response.error || "模型验证失败",
                    capabilities: { reasoning: false, webSearch: false }
                };
            }
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : "验证过程中发生未知错误",
                capabilities: { reasoning: false, webSearch: false }
            };
        }
    }

    /**
     * 测试模型连接
     */
    private static async testModelConnection(model: IAIModelConfig): Promise<{ success: boolean; error?: string }> {
        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            };

            // 根据不同提供商设置认证头
            switch (model.provider) {
                case AIProvider.DEEPSEEK:
                case AIProvider.OPENROUTER:
                case AIProvider.CUSTOM:
                    headers['Authorization'] = `Bearer ${model.apiKey}`;
                    break;
                case AIProvider.ZHIPU:
                    headers['Authorization'] = `Bearer ${model.apiKey}`;
                    break;
                case AIProvider.TONGYI:
                    headers['Authorization'] = `Bearer ${model.apiKey}`;
                    break;
                case AIProvider.SILICONFLOW:
                    headers['Authorization'] = `Bearer ${model.apiKey}`;
                    break;
            }

            const requestBody = {
                model: model.modelName,
                messages: [
                    {
                        role: "user",
                        content: "Hello, this is a test message. Please respond with 'Test successful'."
                    }
                ],
                max_tokens: 50,
                temperature: 0.1
            };

            const url = this.buildApiUrl(model);
            
            const requestParams: RequestUrlParam = {
                url,
                method: 'POST',
                headers,
                body: JSON.stringify(requestBody),
                throw: false
            };

            const response = await requestUrl(requestParams);
            
            if (response.status === 200) {
                const data = response.json;
                if (data.choices && data.choices.length > 0) {
                    return { success: true };
                } else {
                    return { success: false, error: "API响应格式不正确" };
                }
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
                error: error instanceof Error ? error.message : "连接测试失败" 
            };
        }
    }

    /**
     * 检测模型能力
     */
    private static async detectCapabilities(model: IAIModelConfig): Promise<{ reasoning: boolean; webSearch: boolean }> {
        const capabilities = { reasoning: false, webSearch: false };

        try {
            // 测试推理能力
            capabilities.reasoning = await this.testReasoningCapability(model);
            
            // 测试网络搜索能力
            capabilities.webSearch = await this.testWebSearchCapability(model);
        } catch (error) {
            console.warn('检测模型能力时出错:', error);
        }

        return capabilities;
    }

    /**
     * 测试推理能力
     */
    private static async testReasoningCapability(model: IAIModelConfig): Promise<boolean> {
        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            };

            // 设置认证头
            switch (model.provider) {
                case AIProvider.DEEPSEEK:
                case AIProvider.OPENROUTER:
                case AIProvider.CUSTOM:
                case AIProvider.ZHIPU:
                case AIProvider.TONGYI:
                case AIProvider.SILICONFLOW:
                    headers['Authorization'] = `Bearer ${model.apiKey}`;
                    break;
            }

            const requestBody = {
                model: model.modelName,
                messages: [
                    {
                        role: "user",
                        content: "Please solve this step by step: If a store has 15 apples and sells 7, then buys 3 more, how many apples does it have? Please show your reasoning."
                    }
                ],
                max_tokens: 100,
                temperature: 0.1
            };

            const url = this.buildApiUrl(model);
            
            const requestParams: RequestUrlParam = {
                url,
                method: 'POST',
                headers,
                body: JSON.stringify(requestBody),
                throw: false
            };

            const response = await requestUrl(requestParams);
            
            if (response.status === 200) {
                const data = response.json;
                if (data.choices && data.choices.length > 0) {
                    const content = data.choices[0].message?.content || '';
                    // 检查是否包含推理步骤
                    return content.toLowerCase().includes('step') || 
                           content.includes('15') && content.includes('7') && content.includes('3');
                }
            }
        } catch (error) {
            console.warn('推理能力测试失败:', error);
        }

        return false;
    }

    /**
     * 测试网络搜索能力
     */
    private static async testWebSearchCapability(model: IAIModelConfig): Promise<boolean> {
        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            };

            // 设置认证头
            switch (model.provider) {
                case AIProvider.DEEPSEEK:
                case AIProvider.OPENROUTER:
                case AIProvider.CUSTOM:
                case AIProvider.ZHIPU:
                case AIProvider.TONGYI:
                case AIProvider.SILICONFLOW:
                    headers['Authorization'] = `Bearer ${model.apiKey}`;
                    break;
            }

            const requestBody = {
                model: model.modelName,
                messages: [
                    {
                        role: "user",
                        content: "What is the current date and time? Please provide the most recent information available."
                    }
                ],
                max_tokens: 100,
                temperature: 0.1
            };

            const url = this.buildApiUrl(model);
            
            const requestParams: RequestUrlParam = {
                url,
                method: 'POST',
                headers,
                body: JSON.stringify(requestBody),
                throw: false
            };

            const response = await requestUrl(requestParams);
            
            if (response.status === 200) {
                const data = response.json;
                if (data.choices && data.choices.length > 0) {
                    const content = data.choices[0].message?.content || '';
                    // 检查是否提供了当前日期信息
                    const currentYear = new Date().getFullYear();
                    return content.includes(currentYear.toString()) || 
                           content.toLowerCase().includes('current') ||
                           content.toLowerCase().includes('today');
                }
            }
        } catch (error) {
            console.warn('网络搜索能力测试失败:', error);
        }

        return false;
    }

    /**
     * 构建API URL
     */
    private static buildApiUrl(model: IAIModelConfig): string {
        let baseUrl = model.baseUrl;
        
        // 确保baseUrl以斜杠结尾
        if (!baseUrl.endsWith('/')) {
            baseUrl += '/';
        }

        // 根据不同提供商构建完整的API端点
        switch (model.provider) {
            case AIProvider.DEEPSEEK:
                return `${baseUrl}v1/chat/completions`;
            case AIProvider.ZHIPU:
                return `${baseUrl}v4/chat/completions`;
            case AIProvider.TONGYI:
                return `${baseUrl}v1/services/aigc/text-generation/generation`;
            case AIProvider.SILICONFLOW:
                return `${baseUrl}v1/chat/completions`;
            case AIProvider.OPENROUTER:
                return `${baseUrl}v1/chat/completions`;
            case AIProvider.CUSTOM:
                // 假设自定义模型使用标准的OpenAI格式
                return `${baseUrl}v1/chat/completions`;
            default:
                return `${baseUrl}v1/chat/completions`;
        }
    }
}
