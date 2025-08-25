import { requestUrl, RequestUrlParam } from "obsidian";
import { IAIModelConfig, AIProvider } from "../../model/ai/AIModelConfig";
import { debugManager } from "../../utils/DebugManager";

export interface AIModelValidationResult {
    success: boolean;
    message: string;
}

export class AIModelValidationService {
    
    /**
     * 验证AI模型配置
     */
    static async validateModel(model: IAIModelConfig): Promise<AIModelValidationResult> {
        debugManager.log('AIModelValidation', '=== 开始验证AI模型 ===');
        debugManager.logObject('AIModelValidation', '验证模型配置', {
            displayName: model.displayName,
            modelName: model.modelName,
            provider: model.provider,
            baseUrl: model.baseUrl,
            hasApiKey: !!model.apiKey,
            apiKeyLength: model.apiKey?.length || 0
        });
        
        try {
            const response = await this.testModelConnection(model);
            
            debugManager.logObject('AIModelValidation', '模型连接测试结果', response);
            
            if (response.success) {
                debugManager.log('AIModelValidation', '连接测试成功');
                
                const result = {
                    success: true,
                    message: "模型验证成功"
                };
                
                debugManager.log('AIModelValidation', '=== 验证成功 ===');
                return result;
            } else {
                const result = {
                    success: false,
                    message: response.error || "模型验证失败"
                };
                
                debugManager.logObject('AIModelValidation', '=== 验证失败 ===', result);
                return result;
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "验证过程中发生未知错误";
            debugManager.error('AIModelValidation', '验证过程异常', {
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined
            });
            
            const result = {
                success: false,
                message: errorMessage
            };
            
            debugManager.log('AIModelValidation', '=== 验证异常结束 ===');
            return result;
        }
    }

    /**
     * 测试模型连接
     */
    private static async testModelConnection(model: IAIModelConfig): Promise<{ success: boolean; error?: string }> {
        debugManager.log('AIModelValidation', '开始测试模型连接');
        
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
                case AIProvider.GEMINI:
                    // Gemini使用URL参数认证，不需要设置header
                    break;
            }
            
            debugManager.logObject('AIModelValidation', '请求头设置完成', {
                provider: model.provider,
                hasAuthHeader: !!headers['Authorization'],
                authHeaderPrefix: headers['Authorization']?.substring(0, 20) + '...'
            });

            // 根据不同提供商构建请求体
            let requestBody;
            if (model.provider === AIProvider.GEMINI) {
                requestBody = {
                    contents: [
                        {
                            role: "user",
                            parts: [{
                                text: "Hello, this is a test message. Please respond with 'Test successful'."
                            }]
                        }
                    ],
                    generationConfig: {
                        maxOutputTokens: 50,
                        temperature: 0.1
                    }
                };
            } else {
                requestBody = {
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
            }

            const url = this.buildApiUrl(model);
            
            debugManager.logObject('AIModelValidation', '请求参数构建完成', {
                url: url,
                method: 'POST',
                bodyKeys: Object.keys(requestBody),
                modelName: requestBody.model || 'Gemini模式'
            });
            
            const requestParams: RequestUrlParam = {
                url,
                method: 'POST',
                headers,
                body: JSON.stringify(requestBody),
                throw: false
            };

            debugManager.log('AIModelValidation', '发送API请求...');
            const response = await requestUrl(requestParams);
            
            debugManager.logObject('AIModelValidation', '收到API响应', {
                status: response.status,
                statusText: response.status >= 200 && response.status < 300 ? 'Success' : 'Error',
                responseTextLength: response.text?.length || 0,
                responseText: response.text?.substring(0, 200) + '...'
            });
            
            if (response.status === 200) {
                // 安全解析JSON响应
                let data;
                try {
                    if (!response.text || response.text.trim() === '') {
                        debugManager.log('AIModelValidation', '响应内容为空');
                    return { success: false, error: "API响应内容为空" };
                    }
                    
                    data = JSON.parse(response.text);
                    debugManager.logObject('AIModelValidation', 'JSON解析成功', {
                        hasData: !!data,
                        dataType: typeof data,
                        dataKeys: data && typeof data === 'object' ? Object.keys(data) : []
                    });
                } catch (parseError) {
                    debugManager.error('AIModelValidation', 'JSON解析失败', {
                        error: parseError instanceof Error ? parseError.message : 'Unknown parse error',
                        responseText: response.text?.substring(0, 500)
                    });
                    return { success: false, error: `JSON解析失败: ${parseError instanceof Error ? parseError.message : 'Unknown error'}` };
                }
                
                debugManager.logObject('AIModelValidation', '解析成功响应数据', {
                    provider: model.provider,
                    hasData: !!data,
                    dataKeys: data ? Object.keys(data) : []
                });
                
                // 处理Gemini响应格式
                if (model.provider === AIProvider.GEMINI) {
                    debugManager.logObject('AIModelValidation', 'Gemini响应检查', {
                        hasCandidates: !!(data.candidates),
                        candidatesLength: data.candidates?.length || 0
                    });
                    
                    if (data.candidates && data.candidates.length > 0) {
                        debugManager.log('AIModelValidation', 'Gemini连接测试成功');
                        return { success: true };
                    } else {
                        debugManager.log('AIModelValidation', 'Gemini响应格式错误');
                        return { success: false, error: "Gemini API响应格式不正确" };
                    }
                } else {
                    // 处理其他模型响应格式
                    debugManager.logObject('AIModelValidation', '标准API响应检查', {
                        hasChoices: !!(data.choices),
                        choicesLength: data.choices?.length || 0
                    });
                    
                    if (data.choices && data.choices.length > 0) {
                        debugManager.log('AIModelValidation', '标准API连接测试成功');
                        return { success: true };
                    } else {
                        debugManager.log('AIModelValidation', '标准API响应格式错误');
                        return { success: false, error: "API响应格式不正确" };
                    }
                }
            } else {
                // 安全解析错误响应
                let errorData;
                try {
                    if (response.text && response.text.trim() !== '') {
                        errorData = JSON.parse(response.text);
                    }
                } catch (parseError) {
                    debugManager.logObject('AIModelValidation', '错误响应JSON解析失败', {
                        parseError: parseError instanceof Error ? parseError.message : 'Unknown error',
                        responseText: response.text?.substring(0, 200)
                    });
                }
                
                const errorMessage = errorData?.error?.message || `HTTP ${response.status}: ${response.text}`;
                
                debugManager.logObject('AIModelValidation', 'API请求失败', {
                    status: response.status,
                    errorData: errorData,
                    errorMessage: errorMessage
                });
                
                return { 
                    success: false, 
                    error: errorMessage
                };
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "连接测试失败";
            
            debugManager.error('AIModelValidation', '连接测试异常', {
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined
            });
            
            return { 
                success: false, 
                error: errorMessage
            };
        }
    }







    /**
     * 构建API URL
     */
    private static buildApiUrl(model: IAIModelConfig): string {
        // 清理baseUrl，移除前后空格和特殊字符
        let baseUrl = model.baseUrl.trim();
        
        // 移除可能的反引号和其他特殊字符
        baseUrl = baseUrl.replace(/[`'"]/g, '');
        
        // 尝试URL解码，处理可能的编码问题
        try {
            // 可能存在双重编码，尝试多次解码
            let decodedUrl = decodeURIComponent(baseUrl);
            // 如果解码后的URL与原URL不同，可能需要再次解码
            if (decodedUrl !== baseUrl && decodedUrl.includes('%')) {
                try {
                    decodedUrl = decodeURIComponent(decodedUrl);
                    debugManager.log('AIModelValidation', 'URL构建 - 双重URL解码成功');
                } catch (secondDecodeError) {
                    debugManager.log('AIModelValidation', 'URL构建 - 双重URL解码失败');
                }
            }
            baseUrl = decodedUrl;
            debugManager.log('AIModelValidation', 'URL构建 - URL解码成功');
        } catch (decodeError) {
            debugManager.log('AIModelValidation', 'URL构建 - URL解码失败，使用原始URL: ' + decodeError);
        }
        
        // 移除可能的非打印字符和控制字符
        baseUrl = baseUrl.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
        
        // 确保URL格式正确
        if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
            debugManager.log('AIModelValidation', 'URL构建 - URL缺少协议，可能存在问题');
        }
        
        debugManager.log('AIModelValidation', 'URL构建 - 原始baseUrl: ' + model.baseUrl);
        debugManager.log('AIModelValidation', 'URL构建 - 清理后baseUrl: ' + baseUrl);
        
        // 确保baseUrl以斜杠结尾
        if (!baseUrl.endsWith('/')) {
            baseUrl += '/';
        }

        // 根据不同提供商构建完整的API端点
        let finalUrl: string;
        switch (model.provider) {
            case AIProvider.DEEPSEEK:
                finalUrl = `${baseUrl}v1/chat/completions`;
                break;
            case AIProvider.ZHIPU:
                finalUrl = `${baseUrl}v4/chat/completions`;
                break;
            case AIProvider.TONGYI:
                // 通义千问API端点修复 - 使用正确的端点
                // 移除baseUrl末尾的斜杠，然后构建正确的URL
                let cleanBaseUrl = baseUrl.replace(/\/$/, '');
                // 如果baseUrl包含/api，移除它，因为我们要使用完整的端点
                if (cleanBaseUrl.endsWith('/api')) {
                    cleanBaseUrl = cleanBaseUrl.replace(/\/api$/, '');
                }
                // 使用阿里云官方的完整端点
                finalUrl = `${cleanBaseUrl}/compatible-mode/v1/chat/completions`;
                debugManager.log('AIModelValidation', '通义千问最终URL构建: ' + finalUrl);
                break;
            case AIProvider.SILICONFLOW:
                finalUrl = `${baseUrl}v1/chat/completions`;
                break;
            case AIProvider.OPENROUTER:
                finalUrl = `${baseUrl}v1/chat/completions`;
                break;
            case AIProvider.GEMINI:
                // 对于Gemini API key，不进行任何清理，直接使用原始值
                // 避免因为清理导致API key损坏或长度变化
                const originalApiKey = model.apiKey;
                
                debugManager.log('AIModelValidation', '使用原始API key，长度: ' + originalApiKey.length);
                debugManager.log('AIModelValidation', 'API key前10个字符: ' + originalApiKey.substring(0, 10));
                
                finalUrl = `${baseUrl}models/${model.modelName}:generateContent?key=${originalApiKey}`;
                break;
            case AIProvider.CUSTOM:
                // 自定义模型URL构建 - 检查是否已包含路径
                let customUrl = baseUrl;
                // 如果baseUrl已经包含了完整的API路径，直接使用
                if (customUrl.includes('/chat/completions')) {
                    finalUrl = customUrl.replace(/\/$/, '');
                } else if (customUrl.includes('/v1/')) {
                    // 如果已经包含/v1/，只添加chat/completions
                    finalUrl = `${customUrl.replace(/\/$/, '')}/chat/completions`;
                } else {
                    // 标准的OpenAI格式
                    finalUrl = `${customUrl}v1/chat/completions`;
                }
                debugManager.log('AIModelValidation', '自定义模型最终URL构建: ' + finalUrl);
                break;
            default:
                finalUrl = `${baseUrl}v1/chat/completions`;
                break;
        }
        
        debugManager.log('AIModelValidation', 'URL构建 - 最终URL: ' + finalUrl);
        return finalUrl;
    }
}
