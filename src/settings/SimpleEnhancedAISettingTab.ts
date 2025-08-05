import { App, PluginSettingTab, Setting, Notice } from 'obsidian';
import { AIServiceTab } from './AIServiceTab';

export class EnhancedAISettingTab extends PluginSettingTab {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin: any;
    private multiModelEnabled = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(app: App, plugin: any) {
        super(app, plugin);
        this.plugin = plugin;
        
        // 初始化多模型设置
        if (!this.plugin.settings.multiModels) {
            this.plugin.settings.multiModels = [];
        }
        
        // 检查是否已启用多模型功能
        this.multiModelEnabled = this.plugin.settings.enableMultiModel || false;
    }

    async display(): Promise<void> {
        const { containerEl } = this;
        containerEl.empty();

        // 添加样式类
        containerEl.addClass('ai-chat-settings');

        // 创建标题
        containerEl.createEl('h2', { text: 'AI 模型配置' });

        // 显示模式切换器
        this.displayModeToggle(containerEl);

        if (this.multiModelEnabled) {
            // 多模型管理界面
            this.displayMultiModelInterface(containerEl);
        } else {
            // 传统单一模型界面
            this.displayLegacyInterface(containerEl);
        }
    }

    private displayModeToggle(container: HTMLElement) {
        const modeSection = container.createDiv('mode-toggle-section');
        
        new Setting(modeSection)
            .setName('启用多模型管理')
            .setDesc('启用后可以同时配置和切换多个AI模型，提供更灵活的使用体验')
            .addToggle(toggle => toggle
                .setValue(this.multiModelEnabled)
                .onChange(async (value) => {
                    if (value) {
                        await this.enableMultiModel();
                    } else {
                        await this.disableMultiModel();
                    }
                    this.multiModelEnabled = value;
                    this.display(); // 重新显示界面
                }));

        if (!this.multiModelEnabled) {
            modeSection.createEl('p', {
                text: '💡 提示：启用多模型管理后，您可以同时配置多个AI服务提供商，并在使用时快速切换。',
                cls: 'setting-item-description'
            });
        }
    }

    private async enableMultiModel() {
        this.plugin.settings.enableMultiModel = true;
        
        // 迁移现有配置
        await this.migrateExistingSettings();
        
        await this.plugin.saveSettings();
        new Notice('已启用多模型管理功能');
    }

    private async migrateExistingSettings() {
        const currentProvider = this.plugin.settings.ai.provider;
        const providerConfig = this.plugin.settings.ai[currentProvider];
        
        if (providerConfig && providerConfig.apiKey) {
            // 检查是否已经迁移过
            const existingMigrated = this.plugin.settings.multiModels?.find(
                (m: Record<string, unknown>) => m.provider === currentProvider && String(m.name).includes('迁移')
            );
            
            if (!existingMigrated) {
                const migratedModel = {
                    id: `migrated-${currentProvider}-${Date.now()}`,
                    name: `${currentProvider.charAt(0).toUpperCase() + currentProvider.slice(1)} (迁移)`,
                    provider: currentProvider,
                    config: {
                        apiKey: providerConfig.apiKey,
                        model: providerConfig.model || this.getDefaultModel(currentProvider),
                        baseUrl: providerConfig.baseUrl || this.getDefaultBaseUrl(currentProvider)
                    },
                    isActive: true,
                    isEnabled: true
                };

                this.plugin.settings.multiModels?.push(migratedModel);
                new Notice(`已迁移现有的 ${currentProvider} 配置`);
            }
        }
    }

    private async disableMultiModel() {
        this.plugin.settings.enableMultiModel = false;
        await this.plugin.saveSettings();
        new Notice('已关闭多模型管理功能');
    }

    private displayLegacyInterface(container: HTMLElement) {
        // 显示传统的单一模型界面
        const legacySection = container.createDiv('legacy-ai-settings');
        legacySection.createEl('h3', { text: '传统模式 - 单一AI服务配置' });
        
        const aiServiceTab = new AIServiceTab(this.plugin, legacySection);
        aiServiceTab.display();
    }

    private displayMultiModelInterface(container: HTMLElement) {
        const multiSection = container.createDiv('multi-model-settings');
        multiSection.createEl('h3', { text: '多模型管理' });

        // 快速操作按钮
        this.createQuickActions(multiSection);

        // 当前模型列表
        this.displayModelList(multiSection);

        // 简单的全局设置
        this.displaySimpleGlobalSettings(multiSection);
    }

    private createQuickActions(container: HTMLElement) {
        const actionsSection = container.createDiv('quick-actions');
        
        new Setting(actionsSection)
            .setName('手动添加模型')
            .setDesc('手动配置新的AI模型')
            .addButton(btn => btn
                .setButtonText('添加模型')
                .setIcon('plus')
                .setCta()
                .onClick(() => {
                    this.showAddModelForm(container);
                }));

        // 导入/导出按钮
        new Setting(actionsSection)
            .setName('配置管理')
            .setDesc('导入或导出模型配置')
            .addButton(btn => btn
                .setButtonText('导出配置')
                .onClick(() => this.exportConfig()))
            .addButton(btn => btn
                .setButtonText('导入配置')
                .onClick(() => this.importConfig()));
    }

    private showAddModelForm(container: HTMLElement) {
        const formSection = container.createDiv('add-model-form');
        formSection.createEl('h4', { text: '添加新模型' });

        let modelName = '';
        let provider = 'openai';
        let apiKey = '';
        let model = '';
        let baseUrl = '';

        new Setting(formSection)
            .setName('模型名称')
            .addText(text => text
                .setPlaceholder('例如：GPT-4 Turbo')
                .onChange(value => modelName = value));

        new Setting(formSection)
            .setName('服务提供商')
            .addDropdown(dropdown => dropdown
                .addOption('openai', 'OpenAI')
                .addOption('anthropic', 'Anthropic')
                .addOption('gemini', 'Google Gemini')
                .addOption('deepseek', 'DeepSeek')
                .addOption('ollama', 'Ollama')
                .addOption('siliconflow', 'SiliconFlow')
                .setValue(provider)
                .onChange(value => provider = value));

        new Setting(formSection)
            .setName('API 密钥')
            .addText(text => text
                .setPlaceholder('sk-...')
                .onChange(value => apiKey = value));

        new Setting(formSection)
            .setName('模型名称')
            .addText(text => text
                .setPlaceholder('gpt-4')
                .onChange(value => model = value));

        new Setting(formSection)
            .setName('基础 URL（可选）')
            .addText(text => text
                .setPlaceholder('https://api.openai.com/v1')
                .onChange(value => baseUrl = value));

        new Setting(formSection)
            .addButton(btn => btn
                .setButtonText('添加')
                .setCta()
                .onClick(async () => {
                    if (!modelName || !apiKey || !model) {
                        new Notice('请填写所有必填字段');
                        return;
                    }

                    const newModel = {
                        id: `model-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        name: modelName,
                        provider: provider,
                        config: {
                            apiKey: apiKey,
                            model: model,
                            baseUrl: baseUrl || this.getDefaultBaseUrl(provider)
                        },
                        isActive: false,
                        isEnabled: true
                    };

                    if (!this.plugin.settings.multiModels) {
                        this.plugin.settings.multiModels = [];
                    }

                    this.plugin.settings.multiModels.push(newModel);
                    await this.plugin.saveSettings();
                    new Notice(`模型 "${modelName}" 添加成功`);
                    
                    // 移除表单并刷新界面
                    formSection.remove();
                    this.display();
                }))
            .addButton(btn => btn
                .setButtonText('取消')
                .onClick(() => {
                    formSection.remove();
                }));
    }

    private displayModelList(container: HTMLElement) {
        const modelsSection = container.createDiv('models-list-section');
        modelsSection.createEl('h4', { text: '已配置的模型' });

        const models = this.plugin.settings.multiModels || [];
        
        if (models.length === 0) {
            modelsSection.createEl('p', {
                text: '还没有配置任何模型。点击"添加模型"开始配置。',
                cls: 'setting-item-description'
            });
            return;
        }

        const modelsList = modelsSection.createDiv('models-list');

        models.forEach((model: Record<string, unknown>, index: number) => {
            const modelItem = modelsList.createDiv('model-item');
            modelItem.style.cssText = 'border: 1px solid var(--background-modifier-border); padding: 1rem; margin: 0.5rem 0; border-radius: 8px;';
            
            // 模型信息
            const modelInfo = modelItem.createDiv('model-info');
            const nameEl = modelInfo.createEl('strong', { text: String(model.name) });
            if (model.isActive) {
                nameEl.style.color = 'var(--interactive-accent)';
                nameEl.textContent += ' (当前使用)';
            }
            modelInfo.createEl('br');
            modelInfo.createEl('small', { 
                text: `${model.provider} - ${(model.config as Record<string, unknown>)?.model}`,
                cls: 'model-details'
            });

            // 模型操作
            const modelActions = modelItem.createDiv('model-actions');
            modelActions.style.cssText = 'margin-top: 0.5rem; display: flex; gap: 0.5rem;';
            
            // 激活按钮
            const activateBtn = modelActions.createEl('button', {
                text: model.isActive ? '已激活' : '激活',
                cls: model.isActive ? 'mod-cta' : ''
            });
            activateBtn.disabled = Boolean(model.isActive);
            activateBtn.onclick = async () => {
                // 取消其他模型的激活状态
                models.forEach((m: Record<string, unknown>) => m.isActive = false);
                model.isActive = true;
                await this.plugin.saveSettings();
                new Notice(`已切换到: ${model.name}`);
                this.display();
            };

            // 删除按钮
            const deleteBtn = modelActions.createEl('button', {
                text: '删除',
                cls: 'mod-warning'
            });
            deleteBtn.onclick = async () => {
                const confirmed = confirm(`确定要删除模型 "${model.name}" 吗？`);
                if (confirmed) {
                    models.splice(index, 1);
                    // 如果删除的是激活模型，激活第一个可用模型
                    if (model.isActive && models.length > 0) {
                        models[0].isActive = true;
                    }
                    await this.plugin.saveSettings();
                    new Notice(`已删除模型: ${model.name}`);
                    this.display();
                }
            };
        });
    }

    private displaySimpleGlobalSettings(container: HTMLElement) {
        const globalSection = container.createDiv('global-settings-section');
        globalSection.createEl('h4', { text: '全局设置' });

        new Setting(globalSection)
            .setName('启用快速切换')
            .setDesc('在聊天界面显示模型切换器')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.ui?.enableQuickSwitch || false)
                .onChange(async (value) => {
                    if (!this.plugin.settings.ui) this.plugin.settings.ui = {};
                    this.plugin.settings.ui.enableQuickSwitch = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(globalSection)
            .setName('显示模型信息')
            .setDesc('在界面中显示当前使用的模型信息')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.ui?.showModelInfo || false)
                .onChange(async (value) => {
                    if (!this.plugin.settings.ui) this.plugin.settings.ui = {};
                    this.plugin.settings.ui.showModelInfo = value;
                    await this.plugin.saveSettings();
                }));
    }

    private async exportConfig() {
        const config = {
            multiModels: this.plugin.settings.multiModels || [],
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const dataStr = JSON.stringify(config, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `hinote-models-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        new Notice('模型配置已导出');
    }

    private async importConfig() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const text = await file.text();
                try {
                    const config = JSON.parse(text);
                    if (config.multiModels && Array.isArray(config.multiModels)) {
                        if (!this.plugin.settings.multiModels) {
                            this.plugin.settings.multiModels = [];
                        }
                        
                        this.plugin.settings.multiModels.push(...config.multiModels);
                        await this.plugin.saveSettings();
                        this.display();
                        new Notice(`成功导入 ${config.multiModels.length} 个模型配置`);
                    } else {
                        new Notice('无效的配置文件格式');
                    }
                } catch (error) {
                    new Notice('配置文件解析失败');
                }
            }
        };
        
        input.click();
    }

    private getDefaultBaseUrl(provider: string): string {
        const urls: Record<string, string> = {
            'openai': 'https://api.openai.com/v1',
            'anthropic': 'https://api.anthropic.com',
            'gemini': 'https://generativelanguage.googleapis.com/v1beta',
            'deepseek': 'https://api.deepseek.com/v1',
            'ollama': 'http://localhost:11434',
            'siliconflow': 'https://api.siliconflow.cn/v1'
        };
        return urls[provider] || '';
    }

    private getDefaultModel(provider: string): string {
        const models: Record<string, string> = {
            'openai': 'gpt-4',
            'anthropic': 'claude-3-sonnet-20240229',
            'gemini': 'gemini-1.5-pro',
            'deepseek': 'deepseek-chat',
            'ollama': 'llama2',
            'siliconflow': 'deepseek-ai/DeepSeek-V2.5'
        };
        return models[provider] || '';
    }
}
