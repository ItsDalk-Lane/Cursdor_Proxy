/**
 * 快速开始示例 - 最小化多模型集成
 * 这个文件展示如何用最少的代码修改实现多模型功能
 */

import { Plugin, Setting, Modal, Notice } from 'obsidian';

// 扩展现有的设置接口
interface MultiAIModel {
    id: string;
    name: string;
    provider: string;
    config: {
        apiKey: string;
        model: string;
        baseUrl?: string;
    };
    isActive: boolean;
    isEnabled: boolean;
}

interface EnhancedSettings {
    // 保持原有设置
    ai: unknown;
    
    // 添加多模型支持
    multiModels: MultiAIModel[];
    enableQuickSwitch: boolean;
}

// 2. 简单的模型管理类
class SimpleModelManager {
    private plugin: Plugin;
    private settings: EnhancedSettings;

    constructor(plugin: Plugin, settings: EnhancedSettings) {
        this.plugin = plugin;
        this.settings = settings;
    }

    getActiveModel(): MultiAIModel | null {
        return this.settings.multiModels.find(m => m.isActive) || null;
    }

    getEnabledModels(): MultiAIModel[] {
        return this.settings.multiModels.filter(m => m.isEnabled);
    }

    async switchModel(modelId: string): Promise<boolean> {
        const models = this.settings.multiModels;
        
        // 取消所有模型的激活状态
        models.forEach(m => m.isActive = false);
        
        // 激活指定模型
        const targetModel = models.find(m => m.id === modelId);
        if (targetModel) {
            targetModel.isActive = true;
            await this.saveSettings();
            return true;
        }
        
        return false;
    }

    async addModel(model: Omit<MultiAIModel, 'id'>): Promise<string> {
        const id = `model-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newModel: MultiAIModel = {
            ...model,
            id
        };
        
        this.settings.multiModels.push(newModel);
        await this.saveSettings();
        
        return id;
    }

    async removeModel(modelId: string): Promise<boolean> {
        const index = this.settings.multiModels.findIndex(m => m.id === modelId);
        if (index !== -1) {
            this.settings.multiModels.splice(index, 1);
            await this.saveSettings();
            return true;
        }
        return false;
    }

    private async saveSettings() {
        // 这里需要调用插件的保存设置方法
        // 具体实现取决于你的插件架构
        // await this.plugin.saveSettings();
    }
}

// 3. 简化的模型添加对话框
class QuickAddModelModal extends Modal {
    private onSubmit: (model: Omit<MultiAIModel, 'id'>) => void;

    constructor(app: unknown, onSubmit: (model: Omit<MultiAIModel, 'id'>) => void) {
        super(app as any);
        this.onSubmit = onSubmit;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.createEl('h2', { text: '添加 AI 模型' });

        let name = '';
        let provider = 'openai';
        let apiKey = '';
        let model = '';
        let baseUrl = '';

        new Setting(contentEl)
            .setName('模型名称')
            .setDesc('为这个模型起一个易于识别的名称')
            .addText(text => text
                .setPlaceholder('例如：GPT-4 Turbo')
                .setValue(name)
                .onChange(value => name = value));

        new Setting(contentEl)
            .setName('服务提供商')
            .setDesc('选择 AI 服务提供商')
            .addDropdown(dropdown => dropdown
                .addOption('openai', 'OpenAI')
                .addOption('anthropic', 'Anthropic')
                .addOption('gemini', 'Google Gemini')
                .addOption('deepseek', 'DeepSeek')
                .addOption('ollama', 'Ollama')
                .addOption('custom', '自定义')
                .setValue(provider)
                .onChange(value => provider = value));

        new Setting(contentEl)
            .setName('API 密钥')
            .setDesc('输入你的 API 密钥')
            .addText(text => text
                .setPlaceholder('sk-...')
                .setValue(apiKey)
                .onChange(value => apiKey = value));

        new Setting(contentEl)
            .setName('模型名称')
            .setDesc('输入具体的模型名称')
            .addText(text => text
                .setPlaceholder('gpt-4-turbo-preview')
                .setValue(model)
                .onChange(value => model = value));

        new Setting(contentEl)
            .setName('基础 URL')
            .setDesc('可选：自定义 API 端点')
            .addText(text => text
                .setPlaceholder('https://api.openai.com/v1')
                .setValue(baseUrl)
                .onChange(value => baseUrl = value));

        new Setting(contentEl)
            .addButton(btn => btn
                .setButtonText('添加')
                .setCta()
                .onClick(() => {
                    if (!name || !apiKey || !model) {
                        new Notice('请填写所有必填字段');
                        return;
                    }

                    this.onSubmit({
                        name,
                        provider,
                        config: {
                            apiKey,
                            model,
                            baseUrl
                        },
                        isActive: false,
                        isEnabled: true
                    });

                    this.close();
                }))
            .addButton(btn => btn
                .setButtonText('取消')
                .onClick(() => this.close()));
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}

// 4. 简化的设置标签页扩展
class QuickMultiModelSettings {
    private containerEl: HTMLElement;
    private modelManager: SimpleModelManager;
    private app: unknown;

    constructor(containerEl: HTMLElement, modelManager: SimpleModelManager, app: unknown) {
        this.containerEl = containerEl;
        this.modelManager = modelManager;
        this.app = app;
    }

    display() {
        const container = this.containerEl.createDiv();
        
        // 标题
        container.createEl('h3', { text: '模型管理' });
        
        // 添加模型按钮
        new Setting(container)
            .setName('添加新模型')
            .setDesc('配置一个新的 AI 模型')
                .addButton(btn => btn
                .setButtonText('添加模型')
                .setIcon('plus')
                .onClick(() => {
                    const modal = new QuickAddModelModal(this.app, async (model) => {
                        await this.modelManager.addModel(model);
                        new Notice(`模型 "${model.name}" 添加成功`);
                        this.display(); // 刷新界面
                    });
                    modal.open();
                }));        // 模型列表
        const models = this.modelManager.getEnabledModels();
        if (models.length === 0) {
            container.createDiv({ text: '暂无配置的模型，请添加一个模型。', cls: 'setting-item-description' });
            return;
        }

        models.forEach(model => {
            new Setting(container)
                .setName(model.name)
                .setDesc(`${model.provider} - ${model.config.model}`)
                .addToggle(toggle => toggle
                    .setValue(model.isActive)
                    .onChange(async (value) => {
                        if (value) {
                            await this.modelManager.switchModel(model.id);
                            new Notice(`已切换到: ${model.name}`);
                            this.display(); // 刷新界面
                        }
                    }))
                .addButton(btn => btn
                    .setButtonText('删除')
                    .setWarning()
                    .onClick(async () => {
                        const confirmed = confirm(`确定要删除模型 "${model.name}" 吗？`);
                        if (confirmed) {
                            await this.modelManager.removeModel(model.id);
                            new Notice(`模型 "${model.name}" 已删除`);
                            this.display(); // 刷新界面
                        }
                    }));
        });

        // 快速切换设置
        new Setting(container)
            .setName('启用快速切换')
            .setDesc('在聊天界面显示模型切换器')
            .addToggle(toggle => toggle
                .setValue(this.modelManager['settings'].enableQuickSwitch)
                .onChange(async (value) => {
                    this.modelManager['settings'].enableQuickSwitch = value;
                    // await this.modelManager.saveSettings();
                }));
    }
}

// 5. 使用示例 - 在主插件类中集成

/*
export default class HiNotePlugin extends Plugin {
    settings: EnhancedSettings;
    modelManager: SimpleModelManager;

    async onload() {
        // 加载设置
        await this.loadSettings();
        
        // 初始化模型管理器
        this.modelManager = new SimpleModelManager(this, this.settings);
        
        // 迁移旧配置（如果需要）
        await this.migrateOldSettings();
        
        // 添加命令
        this.addCommand({
            id: 'hinote-switch-model',
            name: '切换 AI 模型',
            callback: () => this.showModelSwitcher()
        });

        this.addCommand({
            id: 'hinote-add-model',
            name: '添加 AI 模型',
            callback: () => this.showAddModelModal()
        });
    }

    async loadSettings() {
        this.settings = Object.assign({
            ai: {},
            multiModels: [],
            enableQuickSwitch: true
        }, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async migrateOldSettings() {
        // 如果已经有多模型配置，跳过迁移
        if (this.settings.multiModels.length > 0) {
            return;
        }

        // 从旧的 ai 配置迁移
        if (this.settings.ai.provider && this.settings.ai[this.settings.ai.provider]) {
            const provider = this.settings.ai.provider;
            const config = this.settings.ai[provider];
            
            if (config.apiKey) {
                await this.modelManager.addModel({
                    name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} (Migrated)`,
                    provider,
                    config: {
                        apiKey: config.apiKey,
                        model: config.model || 'gpt-4',
                        baseUrl: config.baseUrl
                    },
                    isActive: true,
                    isEnabled: true
                });
                
                new Notice('已迁移现有配置到多模型系统');
            }
        }
    }

    showModelSwitcher() {
        const models = this.modelManager.getEnabledModels();
        if (models.length === 0) {
            new Notice('请先添加一个模型');
            return;
        }

        // 创建一个简单的选择界面
        // 这里可以使用 SuggesterModal 或自定义模态框
    }

    showAddModelModal() {
        const modal = new QuickAddModelModal(this.app, async (model) => {
            await this.modelManager.addModel(model);
            new Notice(`模型 "${model.name}" 添加成功`);
        });
        modal.open();
    }

    // 在你的 AI 服务类中使用活跃模型
    getCurrentModelConfig() {
        const activeModel = this.modelManager.getActiveModel();
        if (activeModel) {
            return {
                provider: activeModel.provider,
                apiKey: activeModel.config.apiKey,
                model: activeModel.config.model,
                baseUrl: activeModel.config.baseUrl
            };
        }

        // 回退到旧配置
        return {
            provider: this.settings.ai.provider,
            ...this.settings.ai[this.settings.ai.provider]
        };
    }
}
*/

// 6. 在设置标签页中使用

/*
export class SettingTab extends PluginSettingTab {
    plugin: HiNotePlugin;
    
    constructor(app: App, plugin: HiNotePlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        // 原有设置...

        // 添加多模型管理部分
        containerEl.createEl('h2', { text: 'AI 模型管理' });
        
        const multiModelSettings = new QuickMultiModelSettings(
            containerEl,
            this.plugin.modelManager
        );
        multiModelSettings.display();
    }
}
*/

export type {
    MultiAIModel,
    EnhancedSettings
};

export {
    SimpleModelManager,
    QuickAddModelModal,
    QuickMultiModelSettings
};
