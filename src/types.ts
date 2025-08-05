// AI 对话相关的类型定义

import { App } from 'obsidian';

export interface CommentItem {
    id: string;
    content: string;
    createdAt: number;
    updatedAt: number;
}

export interface HighlightInfo {
    id?: string;
    text: string;
    position?: number;
    paragraphOffset?: number;
    blockId?: string;
    paragraphId?: string;
    backgroundColor?: string;
    comments?: CommentItem[];
    createdAt?: number;
    updatedAt?: number;
    fileName?: string;
    filePath?: string;
    fileIcon?: string;
    isVirtual?: boolean;
    displayText?: string;
    timestamp?: number;
    fileType?: string;
    originalLength?: number;
    isCloze?: boolean;
    isGlobalSearch?: boolean;
    isFromCanvas?: boolean;
    canvasSource?: string;
}

export type AIProvider = 'openai' | 'anthropic' | 'gemini' | 'ollama' | 'deepseek' | 'siliconflow';
export type OpenAIModel = 'gpt-4o' | 'gpt-4o-mini';
export type AnthropicModel = 'claude-3-opus-20240229' | 'claude-3-sonnet-20240229' | 'claude-3-haiku-20240307' | 'claude-2' | 'claude-instant-1';

export interface AIModel {
    id: string;
    name: string;
    isCustom?: boolean;
}

export type DeepseekModel = AIModel;

export interface DeepseekModelState {
    selectedModel: DeepseekModel;
    apiKey: string;
}

export const DEFAULT_DEEPSEEK_MODELS: DeepseekModel[] = [
    { id: 'deepseek-chat', name: 'Deepseek Chat' },
    { id: 'deepseek-reasoner', name: 'Deepseek Reasoner' }
];

export type GeminiModel = AIModel;

export interface GeminiModelState {
    selectedModel: GeminiModel;
    apiKey: string;
}

export const DEFAULT_GEMINI_MODELS: GeminiModel[] = [
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
    { id: 'gemini-2.0-flash-lite-preview-02-05', name: 'Gemini 2.0 Flash Lite' }
];

export interface AISettings {
    provider: AIProvider;
    openai?: {
        apiKey: string;
        model: string;
        baseUrl?: string;
        isCustomModel?: boolean;
        lastCustomModel?: string;
    };
    siliconflow?: {
        apiKey: string;
        model: string;
        baseUrl?: string;
        isCustomModel?: boolean;
        lastCustomModel?: string;
    };
    anthropic?: {
        apiKey: string;
        model: string;
        availableModels?: string[];
        apiAddress?: string;
        isCustomModel?: boolean;
        lastCustomModel?: string;
    };
    ollama?: {
        host: string;
        model: string;
        availableModels?: string[];
    };
    gemini?: {
        apiKey: string;
        model: string;
        baseUrl?: string;
        isCustomModel?: boolean;
    };
    deepseek?: {
        apiKey: string;
        model: string;
        baseUrl?: string;
        isCustomModel?: boolean;
        lastCustomModel?: string;
    };
}

export interface SimpleMultiModel {
    id: string;
    provider: AIProvider;
    name: string;
    isActive: boolean;
    config: Record<string, unknown>;
}

export interface PluginSettings {
    ai: AISettings;
    contextOptions?: {
        strategy: 'paragraph' | 'section' | 'surrounding' | 'smart';
        surroundingLines?: number;
        includeTitle?: boolean;
        maxLength?: number;
    };
    // 多模型功能
    enableMultiModel?: boolean;
    multiModels?: SimpleMultiModel[];
    ui?: Record<string, unknown>;
}

export const DEFAULT_SILICONFLOW_MODELS: AIModel[] = [
    { id: 'deepseek-ai/DeepSeek-V3', name: 'DeepSeek V3', isCustom: false },
    { id: 'Qwen/Qwen2.5-7B-Instruct', name: 'Qwen2.5 7B', isCustom: false },
    { id: 'Qwen/Qwen2.5-14B-Instruct', name: 'Qwen2.5 14B', isCustom: false },
    { id: 'Pro/Qwen/Qwen2-7B-Instruct', name: 'Qwen2 7B', isCustom: false },
    { id: 'Pro/THUDM/glm-4-9b-chat', name: 'GLM-4 9B', isCustom: false },
    { id: 'google/gemma-2-9b-it', name: 'Gemma2 9B', isCustom: false },
];

export const DEFAULT_SETTINGS: PluginSettings = {
    ai: {
        provider: 'ollama',
        ollama: {
            host: 'http://localhost:11434',
            model: ''
        },
        gemini: {
            apiKey: '',
            model: 'gemini-pro',
            baseUrl: '',
            isCustomModel: false
        },
        openai: {
            apiKey: '',
            model: 'gpt-4o',
            baseUrl: ''
        },
        anthropic: {
            apiKey: '',
            model: 'claude-2',
            apiAddress: '',
            isCustomModel: false,
            lastCustomModel: ''
        },
        deepseek: {
            apiKey: '',
            model: 'deepseek-chat',
            baseUrl: ''
        },
        siliconflow: {
            apiKey: '',
            model: 'deepseek-ai/DeepSeek-V2.5',
            baseUrl: '',
            isCustomModel: false,
            lastCustomModel: ''
        }
    },
    contextOptions: {
        strategy: 'smart',
        includeTitle: true,
        maxLength: 2000,
        surroundingLines: 3
    },
    enableMultiModel: false,
    multiModels: []
};

export interface ChatViewState {
    chatHistory: { role: "user" | "assistant", content: string }[];
    draggedContents: HighlightInfo[];
    currentPreviewContainer: boolean;
}

// 增强的AI模型配置接口
export interface ModelConfig {
    apiKey?: string;
    baseUrl?: string;
    model?: string;
    host?: string;
    [key: string]: unknown;
}

export interface EnhancedAIModel {
    id: string;
    name: string;
    displayName: string;
    provider: AIProvider;
    isCustom: boolean;
    isActive: boolean;
    isEnabled: boolean;
    config: ModelConfig;
    metadata?: {
        description?: string;
        contextLength?: number;
        capabilities?: string[];
        createdAt?: number;
    };
    category: string;
}

// 插件类型定义
export interface HiNotePlugin {
    settings: PluginSettings;
    saveSettings(): Promise<void>;
    app: App; // Obsidian App instance
}