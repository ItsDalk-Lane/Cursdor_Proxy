import { App, Notice } from "obsidian";
import { IAISettings, DEFAULT_AI_SETTINGS } from "../../model/ai/AISettings";
import { IAIModelConfig } from "../../model/ai/AIModelConfig";
import { EncryptionService } from "../../utils/ai/Encryption";
import { v4 as uuidv4 } from "uuid";
import FormPlugin from "../../main";

export class AISettingsService {
    private app: App;
    private plugin: FormPlugin;
    private masterPassword: string;

    constructor(app: App, plugin?: FormPlugin) {
        this.app = app;
        if (plugin) {
            this.plugin = plugin;
        } else {
            // 尝试从app实例获取插件
            this.plugin = (app as any).plugins?.getPlugin('form-flow') || null;
            console.log('从App获取插件实例:', this.plugin ? '成功' : '失败');
        }
        this.masterPassword = EncryptionService.generateMasterPassword();
    }

    /**
     * 获取当前AI设置（从主插件设置中获取）
     */
    async loadSettings(): Promise<IAISettings> {
        try {
            if (!this.plugin) {
                console.warn('插件实例不存在，使用默认AI设置');
                return DEFAULT_AI_SETTINGS;
            }

            const aiSettings = this.plugin.settings.aiSettings;
            console.log('从主插件设置加载AI设置:', aiSettings);

            // 解密API密钥
            if (aiSettings.models && Array.isArray(aiSettings.models)) {
                aiSettings.models = aiSettings.models.map((model: any) => {
                    if (model.apiKey) {
                        try {
                            model.apiKey = EncryptionService.decryptApiKey(model.apiKey, this.masterPassword);
                        } catch (error) {
                            console.warn(`解密模型 ${model.displayName} 的API密钥失败:`, error);
                            model.apiKey = '';
                            model.verified = false;
                        }
                    }
                    return model;
                });
            }

            return aiSettings;
        } catch (error) {
            console.error('加载AI设置失败:', error);
            return DEFAULT_AI_SETTINGS;
        }
    }

    /**
     * 保存AI设置（保存到主插件设置中）
     */
    async saveSettings(settings: IAISettings): Promise<void> {
        console.log('开始保存AI设置到主插件设置:', settings);
        
        try {
            if (!this.plugin) {
                throw new Error('插件实例不存在');
            }

            // 加密API密钥
            const encryptedSettings = {
                ...settings,
                models: settings.models.map(model => {
                    console.log('加密模型API密钥:', model.displayName, '密钥长度:', model.apiKey.length);
                    return {
                        ...model,
                        apiKey: model.apiKey ? EncryptionService.encryptApiKey(model.apiKey, this.masterPassword) : ''
                    };
                })
            };

            console.log('加密后的设置:', encryptedSettings);

            // 更新主插件设置中的AI设置部分
            await this.plugin.replaceSettings({
                ...this.plugin.settings,
                aiSettings: encryptedSettings
            });

            console.log('AI设置已保存到主插件设置');
        } catch (error) {
            console.error('保存AI设置失败:', error);
            new Notice('保存AI设置失败: ' + (error instanceof Error ? error.message : '未知错误'));
            throw error;
        }
    }

    /**
     * 获取当前设置
     */
    getSettings(): IAISettings {
        if (!this.plugin) {
            return DEFAULT_AI_SETTINGS;
        }
        return this.plugin.settings.aiSettings;
    }

    /**
     * 添加AI模型
     */
    async addModel(model: Omit<IAIModelConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<IAIModelConfig> {
        console.log('添加AI模型开始:', model);
        
        const newModel: IAIModelConfig = {
            ...model,
            id: uuidv4(),
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        console.log('生成的新模型:', newModel);

        // 获取当前设置
        const currentSettings = await this.loadSettings();
        const updatedSettings = {
            ...currentSettings,
            models: [...currentSettings.models, newModel]
        };

        console.log('更新后的设置:', updatedSettings);

        // 保存设置
        try {
            await this.saveSettings(updatedSettings);
            console.log('AI模型添加成功');
            return newModel;
        } catch (error) {
            console.error('保存新模型失败:', error);
            throw error;
        }
    }

    /**
     * 更新AI模型
     */
    async updateModel(modelId: string, updates: Partial<IAIModelConfig>): Promise<void> {
        console.log('更新AI模型开始:', modelId, updates);
        
        // 获取当前设置
        const currentSettings = await this.loadSettings();
        const modelIndex = currentSettings.models.findIndex(m => m.id === modelId);
        
        if (modelIndex === -1) {
            console.error('要更新的模型不存在:', modelId);
            throw new Error('模型不存在');
        }

        const originalModel = currentSettings.models[modelIndex];
        const updatedModel = {
            ...originalModel,
            ...updates,
            updatedAt: Date.now()
        };

        console.log('原模型:', originalModel);
        console.log('更新后模型:', updatedModel);

        const updatedModels = [...currentSettings.models];
        updatedModels[modelIndex] = updatedModel;

        const updatedSettings = {
            ...currentSettings,
            models: updatedModels
        };

        console.log('更新后的设置:', updatedSettings);

        // 保存设置
        try {
            await this.saveSettings(updatedSettings);
            console.log('AI模型更新成功');
        } catch (error) {
            console.error('保存更新模型失败:', error);
            throw error;
        }
    }

    /**
     * 删除AI模型
     */
    async deleteModel(modelId: string): Promise<void> {
        console.log('删除AI模型:', modelId);
        
        // 获取当前设置
        const currentSettings = await this.loadSettings();
        const updatedSettings = {
            ...currentSettings,
            models: currentSettings.models.filter(m => m.id !== modelId)
        };

        // 保存设置
        await this.saveSettings(updatedSettings);
    }

    /**
     * 获取模型列表
     */
    getModels(): IAIModelConfig[] {
        if (!this.plugin) {
            return [];
        }
        return this.plugin.settings.aiSettings.models;
    }

    /**
     * 根据ID获取模型
     */
    getModelById(modelId: string): IAIModelConfig | undefined {
        if (!this.plugin) {
            return undefined;
        }
        return this.plugin.settings.aiSettings.models.find(m => m.id === modelId);
    }

    /**
     * 更新提示模板目录
     */
    async updatePromptTemplateFolder(folder: string): Promise<void> {
        console.log('更新提示模板目录:', folder);
        
        // 获取当前设置
        const currentSettings = await this.loadSettings();
        const updatedSettings = {
            ...currentSettings,
            promptTemplateFolder: folder
        };
        
        // 保存设置
        await this.saveSettings(updatedSettings);
    }

    /**
     * 更新系统提示设置
     */
    async updateSystemPromptSettings(enabled: boolean, prompt?: string): Promise<void> {
        console.log('更新系统提示设置:', enabled, prompt);
        
        // 获取当前设置
        const currentSettings = await this.loadSettings();
        const updatedSettings = {
            ...currentSettings,
            enableSystemPrompt: enabled,
            systemPrompt: prompt || currentSettings.systemPrompt
        };
        
        // 保存设置
        await this.saveSettings(updatedSettings);
    }
}
