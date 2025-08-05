// 简化版多模型管理实现
// 可以直接替换现有的 AIServiceTab.ts

import { Setting, Notice } from 'obsidian';
import { AIProvider } from '../types';
import { t } from '../i18n';

// 扩展的AI模型接口
export interface MultiAIModel {
    id: string;
    name: string;
    provider: AIProvider;
    config: {
        apiKey: string;
        baseUrl?: string;
        model: string;
        maxTokens?: number;
        temperature?: number;
    };
    isActive: boolean;
    isEnabled: boolean;
    isCustom: boolean;
}

export class MultiModelAIServiceTab {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private plugin: any;
    private containerEl: HTMLElement;
    private models: MultiAIModel[] = [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(plugin: any, containerEl: HTMLElement) {
        this.plugin = plugin;
        this.containerEl = containerEl;
        this.initializeModels();
    }

    private initializeModels(): void {
        // 从设置中加载现有模型，或创建默认模型
        this.models = this.plugin.settings.multiModels || this.createDefaultModels();
    }

    private createDefaultModels(): MultiAIModel[] {
        // 基于现有设置创建默认模型列表
        const defaultModels: MultiAIModel[] = [];
        const currentAI = this.plugin.settings.ai;

        // 为每个已配置的提供商创建模型
        if (currentAI.openai?.apiKey) {
            defaultModels.push({
                id: 'openai-default',
                name: 'OpenAI Default',
                provider: 'openai',
                config: {
                    apiKey: currentAI.openai.apiKey,
                    baseUrl: currentAI.openai.baseUrl,
                    model: currentAI.openai.model || 'gpt-4',
                    maxTokens: 4096,
                    temperature: 0.7
                },
                isActive: currentAI.provider === 'openai',
                isEnabled: true,
                isCustom: false
            });
        }

        if (currentAI.anthropic?.apiKey) {
            defaultModels.push({
                id: 'anthropic-default',
                name: 'Anthropic Default',
                provider: 'anthropic',
                config: {
                    apiKey: currentAI.anthropic.apiKey,
                    baseUrl: currentAI.anthropic.apiAddress,
                    model: currentAI.anthropic.model || 'claude-3-sonnet-20240229',
                    maxTokens: 4096,
                    temperature: 0.7
                },
                isActive: currentAI.provider === 'anthropic',
                isEnabled: true,
                isCustom: false
            });
        }

        // 类似地处理其他提供商...

        return defaultModels;
    }

    display(): void {
        this.containerEl.empty();

        // 主标题
        new Setting(this.containerEl)
            .setName(t('Multi-Model AI Configuration'))
            .setDesc(t('Manage multiple AI models and switch between them'))
            .setHeading();

        // 当前活跃模型显示
        this.displayActiveModel();

        // 模型列表
        this.displayModelList();

        // 添加新模型
        this.displayAddModelSection();

        // 全局设置
        this.displayGlobalSettings();
    }

    private displayActiveModel(): void {
        const activeModel = this.models.find(m => m.isActive);
        
        if (activeModel) {
            new Setting(this.containerEl)
                .setName(t('Current Active Model'))
                .setDesc(`${activeModel.name} (${activeModel.provider})`)
                .addButton(button => button
                    .setButtonText(t('Switch Model'))
                    .onClick(() => this.showModelSelector()));
        } else {
            new Setting(this.containerEl)
                .setName(t('No Active Model'))
                .setDesc(t('Please activate a model to start using AI features'))
                .addButton(button => button
                    .setButtonText(t('Activate Model'))
                    .onClick(() => this.showModelSelector()));
        }
    }

    private displayModelList(): void {
        if (this.models.length === 0) {
            this.containerEl.createDiv('no-models', (el) => {
                el.textContent = t('No models configured. Add a model to get started.');
                el.style.textAlign = 'center';
                el.style.padding = '2rem';
                el.style.color = 'var(--text-muted)';
            });
            return;
        }

        const listContainer = this.containerEl.createDiv('model-list');
        
        new Setting(listContainer)
            .setName(t('Configured Models'))
            .setHeading();

        this.models.forEach((model, index) => {
            const modelContainer = listContainer.createDiv('model-item');
            modelContainer.style.border = '1px solid var(--background-modifier-border)';
            modelContainer.style.borderRadius = '8px';
            modelContainer.style.padding = '1rem';
            modelContainer.style.marginBottom = '1rem';
            
            if (model.isActive) {
                modelContainer.style.borderColor = 'var(--interactive-accent)';
                modelContainer.style.backgroundColor = 'var(--background-modifier-hover)';
            }

            // 模型信息
            const infoDiv = modelContainer.createDiv();
            const titleSpan = infoDiv.createSpan();
            titleSpan.textContent = model.name;
            titleSpan.style.fontWeight = '600';
            titleSpan.style.fontSize = '1.1em';

            const providerSpan = infoDiv.createSpan();
            providerSpan.textContent = ` (${model.provider})`;
            providerSpan.style.color = 'var(--text-muted)';
            providerSpan.style.marginLeft = '0.5rem';

            // 状态标签
            const statusDiv = modelContainer.createDiv();
            statusDiv.style.marginTop = '0.5rem';
            statusDiv.style.marginBottom = '1rem';

            if (model.isActive) {
                const activeBadge = statusDiv.createSpan();
                activeBadge.textContent = t('Active');
                activeBadge.style.backgroundColor = 'var(--color-green)';
                activeBadge.style.color = 'white';
                activeBadge.style.padding = '0.2rem 0.5rem';
                activeBadge.style.borderRadius = '4px';
                activeBadge.style.fontSize = '0.8em';
                activeBadge.style.marginRight = '0.5rem';
            }

            if (model.isCustom) {
                const customBadge = statusDiv.createSpan();
                customBadge.textContent = t('Custom');
                customBadge.style.backgroundColor = 'var(--color-blue)';
                customBadge.style.color = 'white';
                customBadge.style.padding = '0.2rem 0.5rem';
                customBadge.style.borderRadius = '4px';
                customBadge.style.fontSize = '0.8em';
            }

            // 操作按钮
            const actionsDiv = modelContainer.createDiv();
            actionsDiv.style.display = 'flex';
            actionsDiv.style.gap = '0.5rem';

            // 激活/停用按钮
            if (model.isEnabled && !model.isActive) {
                const activateBtn = actionsDiv.createEl('button', {
                    text: t('Activate')
                });
                activateBtn.style.backgroundColor = 'var(--interactive-accent)';
                activateBtn.style.color = 'var(--text-on-accent)';
                activateBtn.onclick = () => this.activateModel(index);
            }

            // 编辑按钮
            const editBtn = actionsDiv.createEl('button', {
                text: t('Edit')
            });
            editBtn.onclick = () => this.editModel(index);

            // 克隆按钮
            const cloneBtn = actionsDiv.createEl('button', {
                text: t('Clone')
            });
            cloneBtn.onclick = () => this.cloneModel(index);

            // 删除按钮（仅自定义模型）
            if (model.isCustom) {
                const deleteBtn = actionsDiv.createEl('button', {
                    text: t('Delete')
                });
                deleteBtn.style.backgroundColor = 'var(--color-red)';
                deleteBtn.style.color = 'white';
                deleteBtn.onclick = () => this.deleteModel(index);
            }
        });
    }

    private displayAddModelSection(): void {
        const addSection = this.containerEl.createDiv('add-model-section');
        addSection.style.border = '2px dashed var(--background-modifier-border)';
        addSection.style.borderRadius = '8px';
        addSection.style.padding = '1rem';
        addSection.style.marginTop = '2rem';

        new Setting(addSection)
            .setName(t('Add New Model'))
            .setDesc(t('Configure additional AI models'))
            .addButton(button => button
                .setButtonText(t('Add Custom Model'))
                .onClick(() => this.addCustomModel()))
            .addDropdown(dropdown => {
                dropdown.addOption('', t('Quick Add...'));
                dropdown.addOption('openai', 'OpenAI');
                dropdown.addOption('anthropic', 'Anthropic');
                dropdown.addOption('gemini', 'Gemini');
                dropdown.addOption('deepseek', 'Deepseek');
                dropdown.addOption('ollama', 'Ollama');

                dropdown.onChange((provider) => {
                    if (provider) {
                        this.quickAddModel(provider as AIProvider);
                        dropdown.setValue('');
                    }
                });
            });
    }

    private displayGlobalSettings(): void {
        const globalSection = this.containerEl.createDiv('global-settings');
        
        new Setting(globalSection)
            .setName(t('Global Settings'))
            .setHeading();

        // 启用快速切换
        new Setting(globalSection)
            .setName(t('Enable Quick Model Switch'))
            .setDesc(t('Show model selector in chat interface'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableQuickSwitch ?? true)
                .onChange(async (value) => {
                    this.plugin.settings.enableQuickSwitch = value;
                    await this.plugin.saveSettings();
                }));

        // 自动模型选择
        new Setting(globalSection)
            .setName(t('Auto Model Selection'))
            .setDesc(t('Automatically select best model based on query type'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.autoModelSelection ?? false)
                .onChange(async (value) => {
                    this.plugin.settings.autoModelSelection = value;
                    await this.plugin.saveSettings();
                }));
    }

    private showModelSelector(): void {
        const enabledModels = this.models.filter(m => m.isEnabled);
        
        if (enabledModels.length === 0) {
            new Notice(t('No enabled models available'));
            return;
        }

        // 简化的模型选择器 - 使用下拉菜单
        const dropdown = document.createElement('select');
        dropdown.style.position = 'fixed';
        dropdown.style.top = '50%';
        dropdown.style.left = '50%';
        dropdown.style.transform = 'translate(-50%, -50%)';
        dropdown.style.zIndex = '1000';
        dropdown.style.padding = '0.5rem';
        dropdown.style.borderRadius = '4px';

        enabledModels.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = `${model.name} (${model.provider})`;
            if (model.isActive) {
                option.selected = true;
            }
            dropdown.appendChild(option);
        });

        dropdown.onchange = async () => {
            const modelId = dropdown.value;
            await this.switchToModel(modelId);
            document.body.removeChild(dropdown);
        };

        document.body.appendChild(dropdown);
        dropdown.focus();
    }

    private async activateModel(index: number): Promise<void> {
        // 停用所有模型
        this.models.forEach(m => m.isActive = false);
        
        // 激活选定模型
        this.models[index].isActive = true;
        
        await this.saveModels();
        this.display();
        
        new Notice(t('Model activated: ') + this.models[index].name);
    }

    private async switchToModel(modelId: string): Promise<void> {
        const targetModel = this.models.find(m => m.id === modelId);
        if (!targetModel) return;

        // 停用所有模型
        this.models.forEach(m => m.isActive = false);
        
        // 激活目标模型
        targetModel.isActive = true;
        
        await this.saveModels();
        this.display();
        
        new Notice(t('Switched to: ') + targetModel.name);
    }

    private editModel(index: number): void {
        const model = this.models[index];
        // 这里可以实现一个简单的编辑界面
        // 为了简化，我们只修改名称
        const newName = prompt(t('Enter new name for model:'), model.name);
        if (newName && newName !== model.name) {
            model.name = newName;
            this.saveModels();
            this.display();
        }
    }

    private cloneModel(index: number): void {
        const originalModel = this.models[index];
        const clonedModel: MultiAIModel = {
            ...originalModel,
            id: 'clone_' + Date.now(),
            name: originalModel.name + ' (Copy)',
            isActive: false,
            isCustom: true
        };
        
        this.models.push(clonedModel);
        this.saveModels();
        this.display();
        
        new Notice(t('Model cloned successfully'));
    }

    private async deleteModel(index: number): Promise<void> {
        const model = this.models[index];
        const confirmed = confirm(t('Delete model "') + model.name + '"?');
        
        if (confirmed) {
            this.models.splice(index, 1);
            await this.saveModels();
            this.display();
            new Notice(t('Model deleted'));
        }
    }

    private quickAddModel(provider: AIProvider): void {
        const apiKey = prompt(t('Enter API Key for ') + provider + ':');
        if (!apiKey) return;

        const newModel: MultiAIModel = {
            id: provider + '_' + Date.now(),
            name: provider.charAt(0).toUpperCase() + provider.slice(1) + ' Model',
            provider: provider,
            config: {
                apiKey: apiKey,
                baseUrl: this.getDefaultBaseUrl(provider),
                model: this.getDefaultModel(provider),
                maxTokens: 4096,
                temperature: 0.7
            },
            isActive: false,
            isEnabled: true,
            isCustom: true
        };

        this.models.push(newModel);
        this.saveModels();
        this.display();
        
        new Notice(t('Model added successfully'));
    }

    private addCustomModel(): void {
        // 简化的自定义模型添加
        const name = prompt(t('Enter model name:'));
        if (!name) return;

        const provider = prompt(t('Enter provider (openai/anthropic/gemini/etc):')) as AIProvider;
        if (!provider) return;

        const apiKey = prompt(t('Enter API Key:'));
        if (!apiKey) return;

        const newModel: MultiAIModel = {
            id: 'custom_' + Date.now(),
            name: name,
            provider: provider,
            config: {
                apiKey: apiKey,
                baseUrl: this.getDefaultBaseUrl(provider),
                model: prompt(t('Enter model ID:')) || this.getDefaultModel(provider),
                maxTokens: 4096,
                temperature: 0.7
            },
            isActive: false,
            isEnabled: true,
            isCustom: true
        };

        this.models.push(newModel);
        this.saveModels();
        this.display();
        
        new Notice(t('Custom model added successfully'));
    }

    private getDefaultBaseUrl(provider: AIProvider): string {
        const urls = {
            'openai': 'https://api.openai.com/v1',
            'anthropic': 'https://api.anthropic.com',
            'gemini': 'https://generativelanguage.googleapis.com/v1beta',
            'deepseek': 'https://api.deepseek.com/v1',
            'ollama': 'http://localhost:11434',
            'siliconflow': 'https://api.siliconflow.cn/v1'
        };
        return urls[provider] || '';
    }

    private getDefaultModel(provider: AIProvider): string {
        const models = {
            'openai': 'gpt-4',
            'anthropic': 'claude-3-sonnet-20240229',
            'gemini': 'gemini-1.5-pro',
            'deepseek': 'deepseek-chat',
            'ollama': 'llama2',
            'siliconflow': 'deepseek-ai/DeepSeek-V2.5'
        };
        return models[provider] || '';
    }

    private async saveModels(): Promise<void> {
        this.plugin.settings.multiModels = this.models;
        await this.plugin.saveSettings();
    }

    // 公共方法：获取当前活跃模型
    public getActiveModel(): MultiAIModel | undefined {
        return this.models.find(m => m.isActive);
    }

    // 公共方法：获取所有启用的模型
    public getEnabledModels(): MultiAIModel[] {
        return this.models.filter(m => m.isEnabled);
    }
}
