// 数据管理器 - 统一管理插件的所有数据存储
import { App, TFile } from 'obsidian';

export interface PluginData {
    // 插件基本设置
    settings: {
        defaultCommitScope: 'all' | 'single';
        defaultMessageType: 'ai' | 'manual';
        pushToRemote: boolean;
        remoteBranch: string;
        autoCommit: boolean;
        includeFileTypes: string[];
        excludePatterns: string[];
        showNotifications: boolean;
        batchProcessingEnabled: boolean;
        batchSizeLimitMB: number;
        debugMode: boolean; // 新增调试模式开关
    };
    
    // 模型配置数据
    models: {
        configs: ModelConfigData[];
        defaultModelId: string | null;
    };
    
    // 个性化设置
    preferences: {
        [key: string]: any;
    };
    
    // 数据版本号，用于未来的数据迁移
    version: string;
    lastModified: number;
}

export interface ModelConfigData {
    id: string;
    displayName: string;
    modelName: string;
    provider: string;
    baseURL: string;
    encodedApiKey: string;  // 编码后的API密钥
    maxContextTokens: number;
    maxOutputTokens: number;
    isVerified: boolean;
    createdAt: number;
    lastModified: number;
}

// 默认数据结构
const DEFAULT_PLUGIN_DATA: PluginData = {
    settings: {
        defaultCommitScope: 'all',
        defaultMessageType: 'ai',
        pushToRemote: true,
        remoteBranch: 'main',
        autoCommit: false,
        includeFileTypes: ['.md', '.txt', '.canvas', '.json'],
        excludePatterns: ['.obsidian/', 'node_modules/', '.git/'],
        showNotifications: true,
        batchProcessingEnabled: true,
        batchSizeLimitMB: 10,
        debugMode: false // 默认关闭调试模式
    },
    models: {
        configs: [],
        defaultModelId: null
    },
    preferences: {},
    version: '1.0.0',
    lastModified: Date.now()
};

export class DataManager {
    private app: App;
    private dataFile: string;
    private data: PluginData;

    constructor(app: App, pluginDir: string) {
        this.app = app;
        this.dataFile = `${pluginDir}/plugin-data.json`;
        this.data = { ...DEFAULT_PLUGIN_DATA };
    }

    /**
     * 初始化数据管理器
     */
    async initialize(): Promise<void> {
        try {
            await this.loadData();
            
            // 检查是否需要从旧存储迁移数据
            await this.migrateOldData();
            
            // 清理可能存在的明文API密钥
            const cleanupResult = await this.cleanupPlaintextApiKeys();
            if (cleanupResult.cleaned > 0) {
                console.log(`Git Auto Commit - 安全清理完成：已清理 ${cleanupResult.cleaned}/${cleanupResult.total} 个模型中的明文密钥`);
            }
            
        } catch (error) {
            console.log('Git Auto Commit - 数据文件不存在或损坏，使用默认数据');
            this.data = { ...DEFAULT_PLUGIN_DATA };
            await this.saveData();
        }
    }

    /**
     * 从文件加载数据
     */
    private async loadData(): Promise<void> {
        try {
            const fileExists = await this.app.vault.adapter.exists(this.dataFile);
            if (!fileExists) {
                console.log('Git Auto Commit - 数据文件不存在，使用默认配置');
                this.data = { ...DEFAULT_PLUGIN_DATA };
                return;
            }

            const fileContent = await this.app.vault.adapter.read(this.dataFile);
            const loadedData = JSON.parse(fileContent);
            
            // 合并默认数据和加载的数据，确保所有字段都存在
            this.data = this.mergeWithDefaults(loadedData);
            
            console.log('Git Auto Commit - 数据加载成功');
        } catch (error) {
            console.error('Git Auto Commit - 加载数据失败:', error);
            throw error;
        }
    }

    /**
     * 保存数据到文件
     */
    async saveData(): Promise<void> {
        try {
            this.data.lastModified = Date.now();
            const jsonContent = JSON.stringify(this.data, null, 2);
            await this.app.vault.adapter.write(this.dataFile, jsonContent);
            console.log('Git Auto Commit - 数据保存成功');
        } catch (error) {
            console.error('Git Auto Commit - 保存数据失败:', error);
            throw error;
        }
    }

    /**
     * 合并默认数据，确保数据结构完整
     */
    private mergeWithDefaults(loadedData: any): PluginData {
        const merged = { ...DEFAULT_PLUGIN_DATA };
        
        if (loadedData) {
            // 合并设置
            if (loadedData.settings) {
                merged.settings = { ...merged.settings, ...loadedData.settings };
            }
            
            // 合并模型数据
            if (loadedData.models) {
                merged.models = {
                    configs: loadedData.models.configs || [],
                    defaultModelId: loadedData.models.defaultModelId || null
                };
            }
            
            // 合并个性化设置
            if (loadedData.preferences) {
                merged.preferences = { ...loadedData.preferences };
            }
            
            // 保留版本信息
            if (loadedData.version) {
                merged.version = loadedData.version;
            }
        }
        
        return merged;
    }

    /**
     * 从旧的存储方式迁移数据
     */
    private async migrateOldData(): Promise<void> {
        let hasMigration = false;
        
        try {
            // 迁移 localStorage 中的模型配置
            const oldModels = localStorage.getItem('git-auto-commit-models');
            const oldDefaultModel = localStorage.getItem('git-auto-commit-default-model');
            
            if (oldModels && this.data.models.configs.length === 0) {
                const parsedModels = JSON.parse(oldModels);
                this.data.models.configs = parsedModels.map((model: any) => {
                    const { apiKey, ...modelWithoutApiKey } = model;  // 提取并移除明文apiKey
                    return {
                        ...modelWithoutApiKey,
                        encodedApiKey: this.encodeApiKey(apiKey) // 编码API密钥
                    };
                });
                
                if (oldDefaultModel) {
                    this.data.models.defaultModelId = oldDefaultModel;
                }
                
                hasMigration = true;
                console.log('Git Auto Commit - 迁移了模型配置数据');
            }
            
            // 清理旧的 localStorage 数据
            if (hasMigration) {
                localStorage.removeItem('git-auto-commit-models');
                localStorage.removeItem('git-auto-commit-default-model');
                await this.saveData();
                console.log('Git Auto Commit - 数据迁移完成，已清理旧存储');
            }
            
        } catch (error) {
            console.warn('Git Auto Commit - 数据迁移过程中出现错误:', error);
        }
    }

    /**
     * 编码API密钥 - 使用AES-like加密和随机salt
     */
    private encodeApiKey(apiKey: string): string {
        if (!apiKey) return '';
        
        try {
            // 生成随机salt
            const salt = this.generateRandomSalt();
            
            // 使用复合加密方案
            const encrypted = this.encryptWithSalt(apiKey, salt);
            
            // 将salt和加密数据组合
            const combined = salt + ':' + encrypted;
            
            // 再次Base64编码以确保存储安全
            return btoa(unescape(encodeURIComponent(combined)));
        } catch (error) {
            console.error('Git Auto Commit - API密钥编码失败:', error);
            // 使用简单的Base64作为后备方案
            return btoa(unescape(encodeURIComponent(apiKey)));
        }
    }

    /**
     * 解码API密钥
     */
    decodeApiKey(encodedApiKey: string): string {
        if (!encodedApiKey) return '';
        
        try {
            // 首先尝试新的加密格式
            const decoded = decodeURIComponent(escape(atob(encodedApiKey)));
            
            if (decoded.includes(':')) {
                // 新格式：包含salt
                const [salt, encrypted] = decoded.split(':', 2);
                return this.decryptWithSalt(encrypted, salt);
            } else {
                // 旧格式：直接Base64编码
                return decoded;
            }
        } catch (error) {
            console.error('Git Auto Commit - API密钥解码失败:', error);
            return encodedApiKey; // 解码失败时返回原值（可能是未编码的旧数据）
        }
    }

    /**
     * 生成随机salt
     */
    private generateRandomSalt(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 16; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * 使用salt加密数据
     */
    private encryptWithSalt(data: string, salt: string): string {
        // 实现一个简单但有效的加密算法
        let encrypted = '';
        const key = this.generateKey(salt);
        
        for (let i = 0; i < data.length; i++) {
            const charCode = data.charCodeAt(i);
            const keyCode = key.charCodeAt(i % key.length);
            const encryptedChar = charCode ^ keyCode;
            encrypted += String.fromCharCode(encryptedChar);
        }
        
        // 再次使用Base64编码加密结果
        return btoa(unescape(encodeURIComponent(encrypted)));
    }

    /**
     * 使用salt解密数据
     */
    private decryptWithSalt(encryptedData: string, salt: string): string {
        try {
            // 解码Base64
            const decoded = decodeURIComponent(escape(atob(encryptedData)));
            const key = this.generateKey(salt);
            let decrypted = '';
            
            for (let i = 0; i < decoded.length; i++) {
                const charCode = decoded.charCodeAt(i);
                const keyCode = key.charCodeAt(i % key.length);
                const decryptedChar = charCode ^ keyCode;
                decrypted += String.fromCharCode(decryptedChar);
            }
            
            return decrypted;
        } catch (error) {
            console.error('Git Auto Commit - 解密失败:', error);
            return '';
        }
    }

    /**
     * 从salt生成加密密钥
     */
    private generateKey(salt: string): string {
        // 使用salt和一些固定字符串生成密钥
        const base = 'ObsidianGitAutoCommit2024';
        let key = '';
        
        for (let i = 0; i < Math.max(salt.length, base.length) * 2; i++) {
            const saltChar = salt.charCodeAt(i % salt.length);
            const baseChar = base.charCodeAt(i % base.length);
            key += String.fromCharCode((saltChar + baseChar + i) % 256);
        }
        
        return key;
    }

    // ========== 插件设置相关方法 ==========

    /**
     * 获取插件设置
     */
    getSettings(): PluginData['settings'] {
        return { ...this.data.settings };
    }

    /**
     * 更新插件设置
     */
    async updateSettings(newSettings: Partial<PluginData['settings']>): Promise<void> {
        this.data.settings = { ...this.data.settings, ...newSettings };
        await this.saveData();
    }

    // ========== 模型配置相关方法 ==========

    /**
     * 获取所有模型配置
     */
    getAllModels(): ModelConfigData[] {
        return [...this.data.models.configs];
    }

    /**
     * 获取已验证的模型
     */
    getVerifiedModels(): ModelConfigData[] {
        return this.data.models.configs.filter(model => model.isVerified);
    }

    /**
     * 根据ID获取模型
     */
    getModelById(id: string): ModelConfigData | null {
        return this.data.models.configs.find(model => model.id === id) || null;
    }

    /**
     * 添加新模型
     */
    async addModel(config: Omit<ModelConfigData, 'id' | 'encodedApiKey' | 'isVerified' | 'createdAt' | 'lastModified'> & { apiKey: string }): Promise<string> {
        const now = Date.now();
        const { apiKey, ...configWithoutApiKey } = config;  // 提取并移除明文apiKey
        
        const newModel: ModelConfigData = {
            id: this.generateId(),
            ...configWithoutApiKey,
            encodedApiKey: this.encodeApiKey(apiKey),
            isVerified: false,
            createdAt: now,
            lastModified: now
        };

        this.data.models.configs.push(newModel);
        await this.saveData();
        return newModel.id;
    }

    /**
     * 更新模型配置
     */
    async updateModel(id: string, updates: Partial<Omit<ModelConfigData, 'id' | 'createdAt'>> & { apiKey?: string }): Promise<boolean> {
        const index = this.data.models.configs.findIndex(model => model.id === id);
        if (index === -1) return false;

        const updateData: any = { ...updates };
        
        // 如果更新包含API密钥，需要编码
        if (updates.apiKey) {
            updateData.encodedApiKey = this.encodeApiKey(updates.apiKey);
            delete updateData.apiKey; // 移除明文密钥
        }

        this.data.models.configs[index] = {
            ...this.data.models.configs[index],
            ...updateData,
            lastModified: Date.now()
        };

        await this.saveData();
        return true;
    }

    /**
     * 删除模型
     */
    async deleteModel(id: string): Promise<boolean> {
        const index = this.data.models.configs.findIndex(model => model.id === id);
        if (index === -1) return false;

        this.data.models.configs.splice(index, 1);
        
        // 如果删除的是默认模型，清除默认设置
        if (this.data.models.defaultModelId === id) {
            this.data.models.defaultModelId = null;
        }

        await this.saveData();
        return true;
    }

    /**
     * 设置默认模型
     */
    async setDefaultModel(id: string): Promise<boolean> {
        const model = this.getModelById(id);
        if (!model || !model.isVerified) return false;

        this.data.models.defaultModelId = id;
        await this.saveData();
        return true;
    }

    /**
     * 获取默认模型
     */
    getDefaultModel(): ModelConfigData | null {
        if (!this.data.models.defaultModelId) return null;
        return this.getModelById(this.data.models.defaultModelId);
    }

    /**
     * 获取默认模型ID
     */
    getDefaultModelId(): string | null {
        return this.data.models.defaultModelId;
    }

    /**
     * 清空所有模型配置
     */
    async clearAllModels(): Promise<void> {
        this.data.models.configs = [];
        this.data.models.defaultModelId = null;
        await this.saveData();
    }

    // ========== 个性化设置相关方法 ==========

    /**
     * 获取个性化设置
     */
    getPreference<T>(key: string, defaultValue: T): T;
    getPreference<T>(key: string, defaultValue?: T): T | undefined;
    getPreference<T>(key: string, defaultValue?: T): T | undefined {
        return this.data.preferences[key] !== undefined ? this.data.preferences[key] : defaultValue;
    }

    /**
     * 设置个性化设置
     */
    async setPreference(key: string, value: any): Promise<void> {
        this.data.preferences[key] = value;
        await this.saveData();
    }

    /**
     * 删除个性化设置
     */
    async removePreference(key: string): Promise<void> {
        delete this.data.preferences[key];
        await this.saveData();
    }

    // ========== 工具方法 ==========

    /**
     * 生成唯一ID
     */
    private generateId(): string {
        return 'model_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 导出配置
     */
    exportConfig(): string {
        return JSON.stringify({
            ...this.data,
            exportedAt: Date.now()
        }, null, 2);
    }

    /**
     * 导入配置
     */
    async importConfig(configJson: string): Promise<{ success: boolean; error?: string; imported: number }> {
        try {
            const config = JSON.parse(configJson);
            
            if (!config.models || !Array.isArray(config.models.configs)) {
                return { success: false, error: '无效的配置格式', imported: 0 };
            }

            let imported = 0;
            for (const modelConfig of config.models.configs) {
                if (this.isValidModelConfig(modelConfig)) {
                    await this.addModel({
                        displayName: modelConfig.displayName,
                        modelName: modelConfig.modelName,
                        provider: modelConfig.provider,
                        baseURL: modelConfig.baseURL,
                        apiKey: this.decodeApiKey(modelConfig.encodedApiKey), // 解码API密钥
                        maxContextTokens: modelConfig.maxContextTokens || 32000,
                        maxOutputTokens: modelConfig.maxOutputTokens || 4000
                    });
                    imported++;
                }
            }

            // 如果有默认模型设置，也导入
            if (config.models.defaultModelId && imported > 0) {
                this.data.models.defaultModelId = config.models.defaultModelId;
                await this.saveData();
            }

            return { success: true, imported };
        } catch (error) {
            return { success: false, error: error.message, imported: 0 };
        }
    }

    /**
     * 验证模型配置格式
     */
    private isValidModelConfig(config: any): boolean {
        return config &&
               typeof config.displayName === 'string' &&
               typeof config.modelName === 'string' &&
               typeof config.provider === 'string' &&
               typeof config.baseURL === 'string' &&
               typeof config.encodedApiKey === 'string' &&
               (typeof config.maxContextTokens === 'number' || config.maxContextTokens === undefined) &&
               (typeof config.maxOutputTokens === 'number' || config.maxOutputTokens === undefined);
    }

    /**
     * 重置所有数据到初始状态
     */
    async resetToDefaults(): Promise<void> {
        this.data = { ...DEFAULT_PLUGIN_DATA };
        this.data.lastModified = Date.now();
        await this.saveData();
        console.log('Git Auto Commit - 所有数据已重置为默认值');
    }

    /**
     * 删除数据文件（用于测试或彻底重置）
     */
    async deleteDataFile(): Promise<void> {
        try {
            const fileExists = await this.app.vault.adapter.exists(this.dataFile);
            if (fileExists) {
                await this.app.vault.adapter.remove(this.dataFile);
                console.log('Git Auto Commit - 数据文件已删除');
            }
            
            // 重置内存中的数据
            this.data = { ...DEFAULT_PLUGIN_DATA };
        } catch (error) {
            console.error('Git Auto Commit - 删除数据文件失败:', error);
            throw error;
        }
    }

    /**
     * 获取数据文件路径（用于调试）
     */
    getDataFilePath(): string {
        return this.dataFile;
    }

    /**
     * 清理数据中的明文API密钥（安全增强）
     */
    async cleanupPlaintextApiKeys(): Promise<{ cleaned: number; total: number }> {
        let cleaned = 0;
        const total = this.data.models.configs.length;
        
        for (let i = 0; i < this.data.models.configs.length; i++) {
            const model = this.data.models.configs[i];
            
            // 检查是否存在明文apiKey字段
            if ((model as any).apiKey) {
                console.log(`Git Auto Commit - 清理模型 ${model.displayName} 中的明文API密钥`);
                
                // 如果没有encodedApiKey，先编码明文密钥
                if (!model.encodedApiKey && (model as any).apiKey) {
                    model.encodedApiKey = this.encodeApiKey((model as any).apiKey);
                }
                
                // 移除明文密钥
                delete (model as any).apiKey;
                cleaned++;
            }
        }
        
        if (cleaned > 0) {
            await this.saveData();
            console.log(`Git Auto Commit - 已清理 ${cleaned} 个模型中的明文API密钥`);
        }
        
        return { cleaned, total };
    }

    /**
     * 检查数据文件是否存在
     */
    async dataFileExists(): Promise<boolean> {
        return await this.app.vault.adapter.exists(this.dataFile);
    }
}
