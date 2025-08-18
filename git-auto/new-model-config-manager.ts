// 新的模型配置管理器 - 使用统一的数据管理器
import { DataManager, ModelConfigData } from './data-manager';
import { PREDEFINED_PROVIDERS } from './model-config';

export interface ModelConfig {
    id: string;
    displayName: string;
    modelName: string;
    provider: string;
    baseURL: string;
    apiKey: string;  // 解码后的API密钥（仅在内存中使用）
    maxContextTokens: number;
    maxOutputTokens: number;
    isVerified: boolean;
    createdAt: number;
    lastModified: number;
}

export class NewModelConfigManager {
    private dataManager: DataManager;

    constructor(dataManager: DataManager) {
        this.dataManager = dataManager;
    }

    // ========== 模型管理方法 ==========

    /**
     * 添加新模型
     */
    async addModel(config: Omit<ModelConfig, 'id' | 'isVerified' | 'createdAt' | 'lastModified'>): Promise<string> {
        return await this.dataManager.addModel(config);
    }

    /**
     * 更新模型配置
     */
    async updateModel(id: string, updates: Partial<Omit<ModelConfig, 'id' | 'createdAt'>>): Promise<boolean> {
        return await this.dataManager.updateModel(id, updates);
    }

    /**
     * 删除模型
     */
    async deleteModel(id: string): Promise<boolean> {
        return await this.dataManager.deleteModel(id);
    }

    /**
     * 获取所有模型（解码API密钥）
     */
    getAllModels(): ModelConfig[] {
        const models = this.dataManager.getAllModels();
        return models.map(model => this.convertToModelConfig(model));
    }

    /**
     * 获取已验证的模型
     */
    getVerifiedModels(): ModelConfig[] {
        const models = this.dataManager.getVerifiedModels();
        return models.map(model => this.convertToModelConfig(model));
    }

    /**
     * 根据ID获取模型
     */
    getModelById(id: string): ModelConfig | null {
        const modelData = this.dataManager.getModelById(id);
        if (!modelData) return null;
        return this.convertToModelConfig(modelData);
    }

    /**
     * 设置默认模型
     */
    async setDefaultModel(id: string): Promise<boolean> {
        return await this.dataManager.setDefaultModel(id);
    }

    /**
     * 获取默认模型
     */
    getDefaultModel(): ModelConfig | null {
        const modelData = this.dataManager.getDefaultModel();
        if (!modelData) return null;
        return this.convertToModelConfig(modelData);
    }

    /**
     * 获取默认模型ID
     */
    getDefaultModelId(): string | null {
        return this.dataManager.getDefaultModelId();
    }

    /**
     * 清空所有模型配置
     */
    async clearAllModels(): Promise<void> {
        await this.dataManager.clearAllModels();
    }

    // ========== 模型验证和测试方法 ==========

    /**
     * 验证模型配置
     */
    async verifyModel(id: string): Promise<{ success: boolean; error?: string }> {
        const model = this.getModelById(id);
        if (!model) {
            return { success: false, error: '模型不存在' };
        }

        try {
            const response = await this.testModelConnection(model);
            if (response.success) {
                await this.updateModel(id, { isVerified: true });
                return { success: true };
            } else {
                await this.updateModel(id, { isVerified: false });
                return { success: false, error: response.error };
            }
        } catch (error) {
            await this.updateModel(id, { isVerified: false });
            return { success: false, error: error.message };
        }
    }

    /**
     * 直接测试模型配置（不添加到管理器）
     */
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

    /**
     * 测试模型连接
     */
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

    // ========== 配置导入导出方法 ==========

    /**
     * 导出配置
     */
    exportConfig(): string {
        return this.dataManager.exportConfig();
    }

    /**
     * 导入配置
     */
    async importConfig(configJson: string): Promise<{ success: boolean; error?: string; imported: number }> {
        return await this.dataManager.importConfig(configJson);
    }

    // ========== 向后兼容性方法 ==========

    /**
     * 从存储中加载模型配置（保持与旧API兼容）
     */
    loadFromStorage(): void {
        // 新的数据管理器在初始化时已经处理了数据加载
        // 这个方法保留是为了兼容性，实际不执行任何操作
        console.log('Git Auto Commit - 使用新的数据管理器，跳过旧的加载方式');
    }

    /**
     * 保存到存储（保持与旧API兼容）
     */
    saveToStorage(): void {
        // 新的数据管理器会自动保存，这个方法保留是为了兼容性
        console.log('Git Auto Commit - 使用新的数据管理器，自动保存');
    }

    /**
     * 迁移旧配置，为没有token参数的模型添加默认值
     */
    migrateOldConfigs(): void {
        // 数据迁移在DataManager中处理
        console.log('Git Auto Commit - 数据迁移由数据管理器处理');
    }

    // ========== 工具方法 ==========

    /**
     * 将ModelConfigData转换为ModelConfig（解码API密钥）
     */
    private convertToModelConfig(modelData: ModelConfigData): ModelConfig {
        return {
            ...modelData,
            apiKey: this.dataManager.decodeApiKey(modelData.encodedApiKey)
        };
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
               typeof config.apiKey === 'string' &&
               (typeof config.maxContextTokens === 'number' || config.maxContextTokens === undefined) &&
               (typeof config.maxOutputTokens === 'number' || config.maxOutputTokens === undefined);
    }
}
