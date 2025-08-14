// 模型配置管理文件
// 用于存储和管理AI模型的配置信息

export interface ModelConfig {
    id: string;              // 唯一标识符
    displayName: string;     // 显示名称（用户自定义的外号）
    modelName: string;       // 实际的模型型号
    provider: string;        // AI提供商
    baseURL: string;         // 基础URL
    apiKey: string;          // API密钥
    maxContextTokens: number; // 最大上下文长度（单位：token）
    maxOutputTokens: number;  // 最大输出令牌数量（单位：token）
    isVerified: boolean;     // 是否已验证通过
    createdAt: number;       // 创建时间戳
    lastModified: number;    // 最后修改时间戳
}

// 预定义的AI提供商配置
export const PREDEFINED_PROVIDERS = {
    deepseek: {
        name: 'DeepSeek',
        defaultBaseURL: 'https://api.deepseek.com/v1',
        commonModels: ['deepseek-chat', 'deepseek-coder'],
        modelPlaceholder: '例如：deepseek-chat'
    },
    zhipu: {
        name: '智谱AI',
        defaultBaseURL: 'https://open.bigmodel.cn/api/paas/v4',
        commonModels: ['glm-4-plus', 'glm-4', 'glm-4-air', 'glm-4-flash'],
        modelPlaceholder: '例如：glm-4-plus'
    },
    qwen: {
        name: '通义千问',
        defaultBaseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        commonModels: ['qwen-plus', 'qwen-turbo', 'qwen-max', 'qwen-max-longcontext'],
        modelPlaceholder: '例如：qwen-plus'
    },
    openrouter: {
        name: 'OpenRouter',
        defaultBaseURL: 'https://openrouter.ai/api/v1',
        commonModels: ['anthropic/claude-3.5-sonnet', 'openai/gpt-4o', 'meta-llama/llama-3.1-405b-instruct'],
        modelPlaceholder: '例如：anthropic/claude-3.5-sonnet'
    },
    custom: {
        name: '自定义模型',
        defaultBaseURL: 'https://api.openai.com/v1',
        commonModels: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
        modelPlaceholder: '例如：gpt-4o'
    }
};

// 模型配置管理类
export class ModelConfigManager {
    private models: ModelConfig[] = [];
    private defaultModelId: string | null = null;

    constructor() {
        this.loadFromStorage();
        this.migrateOldConfigs(); // 迁移旧配置
    }

    // 从存储中加载模型配置
    private loadFromStorage(): void {
        try {
            const savedModels = localStorage.getItem('git-auto-commit-models');
            const savedDefaultModel = localStorage.getItem('git-auto-commit-default-model');
            
            if (savedModels) {
                this.models = JSON.parse(savedModels);
            }
            
            if (savedDefaultModel) {
                this.defaultModelId = savedDefaultModel;
            }
        } catch (error) {
            console.error('加载模型配置失败:', error);
            this.models = [];
            this.defaultModelId = null;
        }
    }

    // 保存到存储
    private saveToStorage(): void {
        try {
            localStorage.setItem('git-auto-commit-models', JSON.stringify(this.models));
            if (this.defaultModelId) {
                localStorage.setItem('git-auto-commit-default-model', this.defaultModelId);
            } else {
                localStorage.removeItem('git-auto-commit-default-model');
            }
        } catch (error) {
            console.error('保存模型配置失败:', error);
        }
    }

    // 迁移旧配置，为没有token参数的模型添加默认值
    private migrateOldConfigs(): void {
        let needsSave = false;
        
        for (const model of this.models) {
            if (typeof model.maxContextTokens === 'undefined') {
                model.maxContextTokens = 32000; // 默认32K上下文
                needsSave = true;
            }
            if (typeof model.maxOutputTokens === 'undefined') {
                model.maxOutputTokens = 4000; // 默认4K输出
                needsSave = true;
            }
        }
        
        if (needsSave) {
            console.log('Git Auto Commit - 迁移了', this.models.length, '个模型配置');
            this.saveToStorage();
        }
    }

    // 生成唯一ID
    private generateId(): string {
        return 'model_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // 添加新模型
    addModel(config: Omit<ModelConfig, 'id' | 'isVerified' | 'createdAt' | 'lastModified'>): string {
        const now = Date.now();
        const newModel: ModelConfig = {
            id: this.generateId(),
            ...config,
            isVerified: false,
            createdAt: now,
            lastModified: now
        };

        this.models.push(newModel);
        this.saveToStorage();
        return newModel.id;
    }

    // 更新模型配置
    updateModel(id: string, updates: Partial<Omit<ModelConfig, 'id' | 'createdAt'>>): boolean {
        const index = this.models.findIndex(model => model.id === id);
        if (index === -1) return false;

        this.models[index] = {
            ...this.models[index],
            ...updates,
            lastModified: Date.now()
        };

        this.saveToStorage();
        return true;
    }

    // 删除模型
    deleteModel(id: string): boolean {
        const index = this.models.findIndex(model => model.id === id);
        if (index === -1) return false;

        this.models.splice(index, 1);
        
        // 如果删除的是默认模型，清除默认设置
        if (this.defaultModelId === id) {
            this.defaultModelId = null;
        }

        this.saveToStorage();
        return true;
    }

    // 获取所有模型
    getAllModels(): ModelConfig[] {
        return [...this.models];
    }

    // 获取已验证的模型
    getVerifiedModels(): ModelConfig[] {
        return this.models.filter(model => model.isVerified);
    }

    // 根据ID获取模型
    getModelById(id: string): ModelConfig | null {
        return this.models.find(model => model.id === id) || null;
    }

    // 设置默认模型
    setDefaultModel(id: string): boolean {
        const model = this.getModelById(id);
        if (!model || !model.isVerified) return false;

        this.defaultModelId = id;
        this.saveToStorage();
        return true;
    }

    // 获取默认模型
    getDefaultModel(): ModelConfig | null {
        if (!this.defaultModelId) return null;
        return this.getModelById(this.defaultModelId);
    }

    // 获取默认模型ID
    getDefaultModelId(): string | null {
        return this.defaultModelId;
    }

    // 验证模型配置
    async verifyModel(id: string): Promise<{ success: boolean; error?: string }> {
        const model = this.getModelById(id);
        if (!model) {
            return { success: false, error: '模型不存在' };
        }

        try {
            const response = await this.testModelConnection(model);
            if (response.success) {
                this.updateModel(id, { isVerified: true });
                return { success: true };
            } else {
                this.updateModel(id, { isVerified: false });
                return { success: false, error: response.error };
            }
        } catch (error) {
            this.updateModel(id, { isVerified: false });
            return { success: false, error: error.message };
        }
    }

    // 直接测试模型配置（不添加到管理器）
    async testModelConfig(config: Omit<ModelConfig, 'id' | 'isVerified' | 'createdAt' | 'lastModified'>): Promise<{ success: boolean; error?: string }> {
        const tempModel: ModelConfig = {
            id: 'temp',
            ...config,
            isVerified: false,
            createdAt: Date.now(),
            lastModified: Date.now()
        };
        
        return this.testModelConnection(tempModel);
    }

    // 测试模型连接
    private async testModelConnection(model: ModelConfig): Promise<{ success: boolean; error?: string }> {
        try {
            const testMessage = '测试连接';
            const requestBody = {
                model: model.modelName,
                messages: [
                    {
                        role: 'user',
                        content: testMessage
                    }
                ],
                max_tokens: 10,
                temperature: 0.1
            };

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${model.apiKey}`
            };

            // 为不同提供商添加特殊头部
            if (model.provider === 'qwen') {
                headers['X-DashScope-SSE'] = 'disable';
            } else if (model.provider === 'openrouter') {
                headers['HTTP-Referer'] = 'https://obsidian.md';
                headers['X-Title'] = 'Obsidian Git Auto Commit';
            }

            const response = await fetch(`${model.baseURL}/chat/completions`, {
                method: 'POST',
                headers,
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                return { success: true };
            } else {
                const errorData = await response.json().catch(() => ({}));
                return { 
                    success: false, 
                    error: `HTTP ${response.status}: ${errorData.error?.message || response.statusText}` 
                };
            }
        } catch (error) {
            return { 
                success: false, 
                error: `连接失败: ${error.message}` 
            };
        }
    }

    // 清空所有模型配置
    clearAllModels(): void {
        this.models = [];
        this.defaultModelId = null;
        this.saveToStorage();
    }

    // 导出配置
    exportConfig(): string {
        return JSON.stringify({
            models: this.models,
            defaultModelId: this.defaultModelId,
            exportedAt: Date.now()
        }, null, 2);
    }

    // 导入配置
    importConfig(configJson: string): { success: boolean; error?: string; imported: number } {
        try {
            const config = JSON.parse(configJson);
            
            if (!config.models || !Array.isArray(config.models)) {
                return { success: false, error: '无效的配置格式', imported: 0 };
            }

            let imported = 0;
            for (const modelConfig of config.models) {
                if (this.isValidModelConfig(modelConfig)) {
                    this.addModel({
                        displayName: modelConfig.displayName,
                        modelName: modelConfig.modelName,
                        provider: modelConfig.provider,
                        baseURL: modelConfig.baseURL,
                        apiKey: modelConfig.apiKey,
                        maxContextTokens: modelConfig.maxContextTokens || 8000,
                        maxOutputTokens: modelConfig.maxOutputTokens || 4000
                    });
                    imported++;
                }
            }

            return { success: true, imported };
        } catch (error) {
            return { success: false, error: error.message, imported: 0 };
        }
    }

    // 验证模型配置格式
    private isValidModelConfig(config: any): boolean {
        return config &&
               typeof config.displayName === 'string' &&
               typeof config.modelName === 'string' &&
               typeof config.provider === 'string' &&
               typeof config.baseURL === 'string' &&
               typeof config.apiKey === 'string' &&
               (typeof config.maxContextTokens === 'number' || config.maxContextTokens === undefined) &&
               (typeof config.maxOutputTokens === 'number' || config.maxOutputTokens === undefined);
    }
}

// 创建全局实例
export const modelConfigManager = new ModelConfigManager();
