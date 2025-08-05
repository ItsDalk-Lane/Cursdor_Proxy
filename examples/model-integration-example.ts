// 增强的模型管理系统示例
// 解决原系统只能设置单一提供商和固定模型列表的限制

export interface EnhancedAIModel {
    id: string;
    name: string;
    provider: string;
    isCustom: boolean;
    isActive: boolean;
    config: ModelConfig;
    metadata?: ModelMetadata;
}

export interface ModelConfig {
    apiKey?: string;
    baseUrl?: string;
    maxTokens?: number;
    temperature?: number;
    model?: string;
    customParams?: Record<string, string | number | boolean>;
}

export interface ModelMetadata {
    description?: string;
    capabilities?: string[];
    contextLength?: number;
    costPerToken?: number;
    lastUsed?: number;
    usageCount?: number;
}

export interface EnhancedAISettings {
    models: EnhancedAIModel[];
    activeModelId?: string;
    globalSettings: {
        defaultTemperature: number;
        defaultMaxTokens: number;
        enableModelSwitching: boolean;
        enableMultiProvider: boolean;
    };
}

export class EnhancedModelManager {
    private settings: EnhancedAISettings;
    private plugin: any;

    constructor(plugin: any) {
        this.plugin = plugin;
        this.settings = this.getDefaultSettings();
    }

    // 获取默认设置
    private getDefaultSettings(): EnhancedAISettings {
        return {
            models: [
                {
                    id: 'openai-gpt4',
                    name: 'GPT-4',
                    provider: 'openai',
                    isCustom: false,
                    isActive: false,
                    config: {
                        apiKey: '',
                        baseUrl: 'https://api.openai.com/v1',
                        maxTokens: 4096,
                        temperature: 0.7
                    },
                    metadata: {
                        description: 'OpenAI GPT-4 model',
                        capabilities: ['text-generation', 'reasoning'],
                        contextLength: 8192
                    }
                },
                {
                    id: 'claude-3-opus',
                    name: 'Claude 3 Opus',
                    provider: 'anthropic',
                    isCustom: false,
                    isActive: false,
                    config: {
                        apiKey: '',
                        baseUrl: 'https://api.anthropic.com',
                        maxTokens: 4096,
                        temperature: 0.7
                    },
                    metadata: {
                        description: 'Anthropic Claude 3 Opus',
                        capabilities: ['text-generation', 'analysis'],
                        contextLength: 200000
                    }
                }
            ],
            activeModelId: undefined,
            globalSettings: {
                defaultTemperature: 0.7,
                defaultMaxTokens: 4096,
                enableModelSwitching: true,
                enableMultiProvider: true
            }
        };
    }

    // 添加新模型
    addModel(model: Omit<EnhancedAIModel, 'id'>): string {
        const id = this.generateModelId(model.provider, model.name);
        const newModel: EnhancedAIModel = {
            ...model,
            id,
            isCustom: true
        };
        
        this.settings.models.push(newModel);
        this.saveSettings();
        return id;
    }

    // 删除模型
    removeModel(modelId: string): boolean {
        const index = this.settings.models.findIndex(m => m.id === modelId);
        if (index === -1) return false;
        
        // 如果删除的是当前活跃模型，清除活跃状态
        if (this.settings.activeModelId === modelId) {
            this.settings.activeModelId = undefined;
        }
        
        this.settings.models.splice(index, 1);
        this.saveSettings();
        return true;
    }

    // 更新模型配置
    updateModel(modelId: string, updates: Partial<EnhancedAIModel>): boolean {
        const model = this.settings.models.find(m => m.id === modelId);
        if (!model) return false;
        
        Object.assign(model, updates);
        this.saveSettings();
        return true;
    }

    // 设置活跃模型
    setActiveModel(modelId: string): boolean {
        const model = this.settings.models.find(m => m.id === modelId);
        if (!model) return false;
        
        // 清除所有模型的活跃状态
        this.settings.models.forEach(m => m.isActive = false);
        
        // 设置新的活跃模型
        model.isActive = true;
        this.settings.activeModelId = modelId;
        
        // 更新使用统计
        if (model.metadata) {
            model.metadata.lastUsed = Date.now();
            model.metadata.usageCount = (model.metadata.usageCount || 0) + 1;
        }
        
        this.saveSettings();
        return true;
    }

    // 获取活跃模型
    getActiveModel(): EnhancedAIModel | undefined {
        return this.settings.models.find(m => m.isActive);
    }

    // 获取指定提供商的模型
    getModelsByProvider(provider: string): EnhancedAIModel[] {
        return this.settings.models.filter(m => m.provider === provider);
    }

    // 获取所有可用的提供商
    getAvailableProviders(): string[] {
        const providers = new Set(this.settings.models.map(m => m.provider));
        return Array.from(providers);
    }

    // 克隆模型配置
    cloneModel(modelId: string, newName: string): string | null {
        const originalModel = this.settings.models.find(m => m.id === modelId);
        if (!originalModel) return null;
        
        const clonedModel: Omit<EnhancedAIModel, 'id'> = {
            ...originalModel,
            name: newName,
            isCustom: true,
            isActive: false
        };
        
        return this.addModel(clonedModel);
    }

    // 导入模型配置
    importModels(models: EnhancedAIModel[]): number {
        let importedCount = 0;
        
        for (const model of models) {
            // 检查是否已存在同样的模型
            const exists = this.settings.models.some(m => 
                m.provider === model.provider && m.name === model.name
            );
            
            if (!exists) {
                const newId = this.generateModelId(model.provider, model.name);
                this.settings.models.push({
                    ...model,
                    id: newId,
                    isActive: false
                });
                importedCount++;
            }
        }
        
        if (importedCount > 0) {
            this.saveSettings();
        }
        
        return importedCount;
    }

    // 导出模型配置
    exportModels(): EnhancedAIModel[] {
        return this.settings.models.map(model => ({...model}));
    }

    // 验证模型配置
    async validateModel(modelId: string): Promise<boolean> {
        const model = this.settings.models.find(m => m.id === modelId);
        if (!model) return false;
        
        try {
            // 这里应该根据不同的提供商实现具体的验证逻辑
            switch (model.provider) {
                case 'openai':
                    return await this.validateOpenAIModel(model);
                case 'anthropic':
                    return await this.validateAnthropicModel(model);
                case 'gemini':
                    return await this.validateGeminiModel(model);
                default:
                    return false;
            }
        } catch (error) {
            console.error(`Failed to validate model ${modelId}:`, error);
            return false;
        }
    }

    // 生成模型ID
    private generateModelId(provider: string, name: string): string {
        const timestamp = Date.now();
        const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        return `${provider}-${sanitizedName}-${timestamp}`;
    }

    // 保存设置
    private async saveSettings(): Promise<void> {
        // 将增强的设置合并到原有设置中
        this.plugin.settings.enhanced = this.settings;
        await this.plugin.saveSettings();
    }

    // 模型验证方法（示例实现）
    private async validateOpenAIModel(model: EnhancedAIModel): Promise<boolean> {
        // 实现 OpenAI 模型验证逻辑
        return true;
    }

    private async validateAnthropicModel(model: EnhancedAIModel): Promise<boolean> {
        // 实现 Anthropic 模型验证逻辑
        return true;
    }

    private async validateGeminiModel(model: EnhancedAIModel): Promise<boolean> {
        // 实现 Gemini 模型验证逻辑
        return true;
    }
}

// 使用示例
export class ModelManagementExample {
    private modelManager: EnhancedModelManager;

    constructor(plugin: any) {
        this.modelManager = new EnhancedModelManager(plugin);
    }

    // 示例：添加自定义 OpenAI 模型
    addCustomOpenAIModel() {
        return this.modelManager.addModel({
            name: 'Custom GPT-4 Turbo',
            provider: 'openai',
            isCustom: true,
            isActive: false,
            config: {
                apiKey: 'your-api-key',
                baseUrl: 'https://api.openai.com/v1',
                maxTokens: 8192,
                temperature: 0.5,
                customParams: {
                    model: 'gpt-4-turbo-preview'
                }
            },
            metadata: {
                description: 'Custom configured GPT-4 Turbo with specific parameters',
                capabilities: ['text-generation', 'code-completion', 'reasoning'],
                contextLength: 128000
            }
        });
    }

    // 示例：添加本地 Ollama 模型
    addOllamaModel() {
        return this.modelManager.addModel({
            name: 'Llama 2 7B',
            provider: 'ollama',
            isCustom: true,
            isActive: false,
            config: {
                baseUrl: 'http://localhost:11434',
                customParams: {
                    model: 'llama2:7b'
                }
            },
            metadata: {
                description: 'Local Llama 2 7B model via Ollama',
                capabilities: ['text-generation'],
                contextLength: 4096
            }
        });
    }

    // 示例：批量导入模型配置
    importModelConfigurations() {
        const modelsToImport: EnhancedAIModel[] = [
            {
                id: 'imported-claude-sonnet',
                name: 'Claude 3 Sonnet',
                provider: 'anthropic',
                isCustom: true,
                isActive: false,
                config: {
                    apiKey: 'your-anthropic-key',
                    baseUrl: 'https://api.anthropic.com',
                    maxTokens: 4096,
                    temperature: 0.7
                },
                metadata: {
                    description: 'Imported Claude 3 Sonnet configuration',
                    capabilities: ['text-generation', 'analysis', 'coding'],
                    contextLength: 200000
                }
            }
        ];

        return this.modelManager.importModels(modelsToImport);
    }

    // 示例：切换到特定模型
    switchToModel(modelName: string) {
        const models = this.modelManager.exportModels();
        const targetModel = models.find(m => m.name === modelName);
        
        if (targetModel) {
            return this.modelManager.setActiveModel(targetModel.id);
        }
        
        return false;
    }
}

// 配置管理接口
export interface ModelConfigurationProfile {
    name: string;
    description: string;
    models: EnhancedAIModel[];
    createdAt: number;
    updatedAt: number;
}

export class ModelProfileManager {
    private profiles: ModelConfigurationProfile[] = [];
    private plugin: any;

    constructor(plugin: any) {
        this.plugin = plugin;
    }

    // 创建配置文件
    createProfile(name: string, description: string, models: EnhancedAIModel[]): string {
        const profile: ModelConfigurationProfile = {
            name,
            description,
            models: models.map(m => ({...m})), // 深拷贝
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        this.profiles.push(profile);
        this.saveProfiles();
        return profile.name;
    }

    // 应用配置文件
    applyProfile(profileName: string, modelManager: EnhancedModelManager): boolean {
        const profile = this.profiles.find(p => p.name === profileName);
        if (!profile) return false;

        // 清除现有模型（可选）
        // 或者标记为非活跃状态

        // 导入配置文件中的模型
        modelManager.importModels(profile.models);
        
        return true;
    }

    private async saveProfiles(): Promise<void> {
        this.plugin.settings.modelProfiles = this.profiles;
        await this.plugin.saveSettings();
    }
}