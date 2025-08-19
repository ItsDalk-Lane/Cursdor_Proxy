export enum AIProvider {
    DEEPSEEK = "deepseek",
    ZHIPU = "zhipu", 
    TONGYI = "tongyi",
    SILICONFLOW = "siliconflow",
    OPENROUTER = "openrouter",
    CUSTOM = "custom"
}

export interface IAdvancedSettings {
    temperature: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
}

export interface IAIModelConfig {
    id: string;
    displayName: string;
    modelName: string;
    provider: AIProvider;
    baseUrl: string;
    apiKey: string; // 加密存储
    maxContextLength: number;
    maxOutputTokens: number;
    advancedSettings?: IAdvancedSettings;
    capabilities: {
        reasoning: boolean;
        webSearch: boolean;
    };
    verified: boolean;
    createdAt: number;
    updatedAt: number;
}

export const DEFAULT_ADVANCED_SETTINGS: IAdvancedSettings = {
    temperature: 0.7,
    topP: 0.9,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0
};

export const AI_PROVIDER_CONFIGS = {
    [AIProvider.DEEPSEEK]: {
        name: "DeepSeek",
        baseUrl: "https://api.deepseek.com",
        defaultModel: "deepseek-chat"
    },
    [AIProvider.ZHIPU]: {
        name: "智谱",
        baseUrl: "https://open.bigmodel.cn/api/paas",
        defaultModel: "glm-4"
    },
    [AIProvider.TONGYI]: {
        name: "通义千问",
        baseUrl: "https://dashscope.aliyuncs.com/api",
        defaultModel: "qwen-turbo"
    },
    [AIProvider.SILICONFLOW]: {
        name: "硅基流动",
        baseUrl: "https://api.siliconflow.cn",
        defaultModel: "deepseek-ai/deepseek-chat"
    },
    [AIProvider.OPENROUTER]: {
        name: "Openrouter",
        baseUrl: "https://openrouter.ai/api",
        defaultModel: "anthropic/claude-3-haiku"
    },
    [AIProvider.CUSTOM]: {
        name: "自定义模型",
        baseUrl: "",
        defaultModel: ""
    }
};
