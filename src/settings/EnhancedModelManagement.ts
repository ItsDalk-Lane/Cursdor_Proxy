import { Setting, Notice, Modal, App } from 'obsidian';
import { t } from '../i18n';

// 增强的模型接口定义
export interface EnhancedAIModel {
    id: string;
    name: string;
    provider: string;
    isCustom: boolean;
    isActive: boolean;
    isEnabled: boolean;
    config: ModelConfig;
    metadata?: ModelMetadata;
}

export interface ModelConfig {
    apiKey?: string;
    baseUrl?: string;
    maxTokens?: number;
    temperature?: number;
    model?: string; // 实际的模型标识符
    customParams?: Record<string, string | number | boolean>;
}

export interface ModelMetadata {
    description?: string;
    capabilities?: string[];
    contextLength?: number;
    costPerToken?: number;
    lastUsed?: number;
    usageCount?: number;
    tags?: string[];
}

// 模型提供商模板
export const PROVIDER_TEMPLATES = {
    openai: {
        name: 'OpenAI',
        baseUrl: 'https://api.openai.com/v1',
        models: [
            { id: 'gpt-4', name: 'GPT-4' },
            { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
            { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' }
        ] as Array<{ id: string; name: string }>
    },
    anthropic: {
        name: 'Anthropic',
        baseUrl: 'https://api.anthropic.com',
        models: [
            { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' },
            { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet' },
            { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku' }
        ] as Array<{ id: string; name: string }>
    },
    gemini: {
        name: 'Google Gemini',
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
        models: [
            { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
            { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' }
        ] as Array<{ id: string; name: string }>
    },
    ollama: {
        name: 'Ollama (Local)',
        baseUrl: 'http://localhost:11434',
        models: [] as Array<{ id: string; name: string }>
    },
    custom: {
        name: 'Custom Provider',
        baseUrl: '',
        models: [] as Array<{ id: string; name: string }>
    }
};

export class EnhancedModelManagement {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private plugin: any;
    private containerEl: HTMLElement;
    private models: EnhancedAIModel[] = [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(plugin: any, containerEl: HTMLElement) {
        this.plugin = plugin;
        this.containerEl = containerEl;
        this.loadModels();
    }

    private loadModels(): void {
        // 从设置中加载现有模型，或使用默认模型
        this.models = this.plugin.settings.enhancedModels || this.getDefaultModels();
    }

    private getDefaultModels(): EnhancedAIModel[] {
        return [
            {
                id: 'default-openai-gpt4',
                name: 'GPT-4',
                provider: 'openai',
                isCustom: false,
                isActive: false,
                isEnabled: true,
                config: {
                    baseUrl: 'https://api.openai.com/v1',
                    model: 'gpt-4',
                    maxTokens: 4096,
                    temperature: 0.7
                },
                metadata: {
                    description: 'OpenAI GPT-4 model',
                    capabilities: ['text-generation', 'reasoning'],
                    contextLength: 8192
                }
            }
        ];
    }

    display(): void {
        this.containerEl.empty();

        // 主标题
        new Setting(this.containerEl)
            .setName(t('Enhanced Model Management'))
            .setDesc(t('Manage multiple AI models and providers'))
            .setHeading();

        // 全局设置
        this.displayGlobalSettings();

        // 模型列表
        this.displayModelList();

        // 添加模型按钮
        this.displayAddModelSection();
    }

    private displayGlobalSettings(): void {
        const globalContainer = this.containerEl.createDiv('enhanced-global-settings');
        
        new Setting(globalContainer)
            .setName(t('Global Settings'))
            .setHeading();

        // 启用多模型切换
        new Setting(globalContainer)
            .setName(t('Enable Model Switching'))
            .setDesc(t('Allow switching between multiple configured models'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableModelSwitching ?? true)
                .onChange(async (value) => {
                    this.plugin.settings.enableModelSwitching = value;
                    await this.plugin.saveSettings();
                }));

        // 默认温度
        new Setting(globalContainer)
            .setName(t('Default Temperature'))
            .setDesc(t('Default temperature for new models (0.0 - 2.0)'))
            .addSlider(slider => slider
                .setLimits(0, 2, 0.1)
                .setValue(this.plugin.settings.defaultTemperature ?? 0.7)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.defaultTemperature = value;
                    await this.plugin.saveSettings();
                }));

        // 默认最大令牌数
        new Setting(globalContainer)
            .setName(t('Default Max Tokens'))
            .setDesc(t('Default maximum tokens for new models'))
            .addText(text => text
                .setPlaceholder('4096')
                .setValue(String(this.plugin.settings.defaultMaxTokens ?? 4096))
                .onChange(async (value) => {
                    const tokens = parseInt(value) || 4096;
                    this.plugin.settings.defaultMaxTokens = tokens;
                    await this.plugin.saveSettings();
                }));
    }

    private displayModelList(): void {
        const listContainer = this.containerEl.createDiv('enhanced-model-list');
        
        new Setting(listContainer)
            .setName(t('Configured Models'))
            .setDesc(t('Manage your AI model configurations'))
            .setHeading();

        if (this.models.length === 0) {
            listContainer.createDiv('no-models-message', (el) => {
                el.textContent = t('No models configured. Add a model to get started.');
            });
            return;
        }

        // 活跃模型指示器
        const activeModel = this.models.find(m => m.isActive);
        if (activeModel) {
            new Setting(listContainer)
                .setName(t('Active Model'))
                .setDesc(`${activeModel.name} (${activeModel.provider})`)
                .addButton(button => button
                    .setButtonText(t('Switch'))
                    .onClick(() => this.showModelSwitcher()));
        }

        // 模型列表
        this.models.forEach((model, index) => {
            this.displayModelItem(listContainer, model, index);
        });
    }

    private displayModelItem(container: HTMLElement, model: EnhancedAIModel, index: number): void {
        const modelContainer = container.createDiv('model-item');
        if (model.isActive) {
            modelContainer.addClass('active-model');
        }
        if (!model.isEnabled) {
            modelContainer.addClass('disabled-model');
        }

        // 模型信息
        const modelInfo = modelContainer.createDiv('model-info');
        
        // 模型名称和提供商
        const titleEl = modelInfo.createDiv('model-title');
        titleEl.createSpan('model-name', (el) => {
            el.textContent = model.name;
        });
        titleEl.createSpan('model-provider', (el) => {
            el.textContent = ` (${model.provider})`;
        });

        // 模型状态
        const statusEl = modelInfo.createDiv('model-status');
        if (model.isActive) {
            statusEl.createSpan('status-badge active', (el) => {
                el.textContent = t('Active');
            });
        }
        if (model.isCustom) {
            statusEl.createSpan('status-badge custom', (el) => {
                el.textContent = t('Custom');
            });
        }
        if (!model.isEnabled) {
            statusEl.createSpan('status-badge disabled', (el) => {
                el.textContent = t('Disabled');
            });
        }

        // 模型描述
        if (model.metadata?.description) {
            modelInfo.createDiv('model-description', (el) => {
                el.textContent = model.metadata?.description || '';
            });
        }

        // 操作按钮
        const actionsContainer = modelContainer.createDiv('model-actions');
        
        // 启用/禁用按钮
        const enableButton = actionsContainer.createEl('button', {
            text: model.isEnabled ? t('Disable') : t('Enable'),
            cls: 'model-action-button'
        });
        enableButton.onclick = () => this.toggleModelEnabled(index);

        // 激活按钮
        if (model.isEnabled && !model.isActive) {
            const activateButton = actionsContainer.createEl('button', {
                text: t('Activate'),
                cls: 'model-action-button primary'
            });
            activateButton.onclick = () => this.activateModel(index);
        }

        // 编辑按钮
        const editButton = actionsContainer.createEl('button', {
            text: t('Edit'),
            cls: 'model-action-button'
        });
        editButton.onclick = () => this.editModel(index);

        // 复制按钮
        const cloneButton = actionsContainer.createEl('button', {
            text: t('Clone'),
            cls: 'model-action-button'
        });
        cloneButton.onclick = () => this.cloneModel(index);

        // 删除按钮（仅自定义模型）
        if (model.isCustom) {
            const deleteButton = actionsContainer.createEl('button', {
                text: t('Delete'),
                cls: 'model-action-button danger'
            });
            deleteButton.onclick = () => this.deleteModel(index);
        }
    }

    private displayAddModelSection(): void {
        const addContainer = this.containerEl.createDiv('add-model-section');
        
        new Setting(addContainer)
            .setName(t('Add New Model'))
            .setDesc(t('Add a new AI model configuration'))
            .addButton(button => button
                .setButtonText(t('Add Model'))
                .setCta()
                .onClick(() => this.showAddModelModal()));

        // 快速添加预设模型
        new Setting(addContainer)
            .setName(t('Quick Add'))
            .setDesc(t('Quickly add models from supported providers'))
            .addDropdown(dropdown => {
                dropdown.addOption('', t('Select a provider...'));
                Object.entries(PROVIDER_TEMPLATES).forEach(([key, template]) => {
                    if (key !== 'custom') {
                        dropdown.addOption(key, template.name);
                    }
                });
                
                dropdown.onChange((provider) => {
                    if (provider) {
                        this.showQuickAddModal(provider);
                        dropdown.setValue('');
                    }
                });
            });
    }

    private async toggleModelEnabled(index: number): Promise<void> {
        const model = this.models[index];
        model.isEnabled = !model.isEnabled;
        
        // 如果禁用的是活跃模型，取消活跃状态
        if (!model.isEnabled && model.isActive) {
            model.isActive = false;
        }
        
        await this.saveModels();
        this.display();
    }

    private async activateModel(index: number): Promise<void> {
        // 取消所有模型的活跃状态
        this.models.forEach(m => m.isActive = false);
        
        // 激活选中的模型
        this.models[index].isActive = true;
        
        await this.saveModels();
        this.display();
        
        new Notice(t('Model activated: ') + this.models[index].name);
    }

    private showModelSwitcher(): void {
        const modal = new ModelSwitcherModal(this.plugin.app, this.models, (modelId) => {
            const index = this.models.findIndex(m => m.id === modelId);
            if (index !== -1) {
                this.activateModel(index);
            }
        });
        modal.open();
    }

    private editModel(index: number): void {
        const model = this.models[index];
        const modal = new ModelEditModal(this.plugin.app, model, async (updatedModel) => {
            this.models[index] = updatedModel;
            await this.saveModels();
            this.display();
        });
        modal.open();
    }

    private cloneModel(index: number): void {
        const originalModel = this.models[index];
        const clonedModel: EnhancedAIModel = {
            ...originalModel,
            id: this.generateModelId(),
            name: originalModel.name + ' (Copy)',
            isCustom: true,
            isActive: false
        };
        
        this.models.push(clonedModel);
        this.saveModels();
        this.display();
        
        new Notice(t('Model cloned successfully'));
    }

    private async deleteModel(index: number): Promise<void> {
        const model = this.models[index];
        
        // 确认删除
        const confirmed = await this.showConfirmDialog(
            t('Delete Model'),
            t('Are you sure you want to delete the model "') + model.name + '"?'
        );
        
        if (confirmed) {
            this.models.splice(index, 1);
            await this.saveModels();
            this.display();
            new Notice(t('Model deleted successfully'));
        }
    }

    private showAddModelModal(): void {
        const modal = new ModelEditModal(this.plugin.app, undefined, async (newModel) => {
            newModel.id = this.generateModelId();
            newModel.isCustom = true;
            newModel.isActive = false;
            newModel.isEnabled = true;
            
            this.models.push(newModel);
            await this.saveModels();
            this.display();
            new Notice(t('Model added successfully'));
        });
        modal.open();
    }

    private showQuickAddModal(provider: string): void {
        const modal = new QuickAddModal(this.plugin.app, provider, async (models) => {
            models.forEach(model => {
                model.id = this.generateModelId();
                model.isCustom = false;
                model.isActive = false;
                model.isEnabled = true;
            });
            
            this.models.push(...models);
            await this.saveModels();
            this.display();
            new Notice(t('Models added successfully'));
        });
        modal.open();
    }

    private generateModelId(): string {
        return 'model_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    private async saveModels(): Promise<void> {
        this.plugin.settings.enhancedModels = this.models;
        await this.plugin.saveSettings();
    }

    private async showConfirmDialog(title: string, message: string): Promise<boolean> {
        return new Promise((resolve) => {
            const modal = new ConfirmModal(this.plugin.app, title, message, resolve);
            modal.open();
        });
    }
}

// 模型切换模态框
class ModelSwitcherModal extends Modal {
    private models: EnhancedAIModel[];
    private onSelect: (modelId: string) => void;

    constructor(app: App, models: EnhancedAIModel[], onSelect: (modelId: string) => void) {
        super(app);
        this.models = models;
        this.onSelect = onSelect;
    }

    onOpen(): void {
        const { contentEl } = this;
        contentEl.empty();
        
        contentEl.createEl('h2', { text: t('Switch Model') });
        
        const enabledModels = this.models.filter(m => m.isEnabled);
        
        enabledModels.forEach(model => {
            const modelEl = contentEl.createDiv('model-option');
            if (model.isActive) {
                modelEl.addClass('active');
            }
            
            modelEl.createSpan('model-name', (el) => {
                el.textContent = model.name;
            });
            modelEl.createSpan('model-provider', (el) => {
                el.textContent = ` (${model.provider})`;
            });
            
            modelEl.onclick = () => {
                this.onSelect(model.id);
                this.close();
            };
        });
    }

    onClose(): void {
        const { contentEl } = this;
        contentEl.empty();
    }
}

// 模型编辑模态框
class ModelEditModal extends Modal {
    private model?: EnhancedAIModel;
    private onSave: (model: EnhancedAIModel) => void;
    private formData: Partial<EnhancedAIModel> = {};

    constructor(app: App, model: EnhancedAIModel | undefined, onSave: (model: EnhancedAIModel) => void) {
        super(app);
        this.model = model;
        this.onSave = onSave;
        
        if (model) {
            this.formData = { ...model };
        } else {
            this.formData = {
                name: '',
                provider: 'openai',
                config: {
                    apiKey: '',
                    baseUrl: '',
                    maxTokens: 4096,
                    temperature: 0.7
                },
                metadata: {
                    description: ''
                }
            };
        }
    }

    onOpen(): void {
        const { contentEl } = this;
        contentEl.empty();
        
        contentEl.createEl('h2', { text: this.model ? t('Edit Model') : t('Add Model') });
        
        this.buildForm(contentEl);
    }

    private buildForm(container: HTMLElement): void {
        // 模型名称
        new Setting(container)
            .setName(t('Model Name'))
            .addText(text => text
                .setValue(this.formData.name || '')
                .onChange(value => {
                    this.formData.name = value;
                }));

        // 提供商
        new Setting(container)
            .setName(t('Provider'))
            .addDropdown(dropdown => {
                Object.entries(PROVIDER_TEMPLATES).forEach(([key, template]) => {
                    dropdown.addOption(key, template.name);
                });
                
                dropdown.setValue(this.formData.provider || 'openai');
                dropdown.onChange(value => {
                    this.formData.provider = value;
                    // 更新基础URL
                    if (this.formData.config) {
                        this.formData.config.baseUrl = PROVIDER_TEMPLATES[value as keyof typeof PROVIDER_TEMPLATES]?.baseUrl || '';
                    }
                });
            });

        // API密钥
        new Setting(container)
            .setName(t('API Key'))
            .addText(text => text
                .setValue(this.formData.config?.apiKey || '')
                .onChange(value => {
                    if (!this.formData.config) this.formData.config = {};
                    this.formData.config.apiKey = value;
                }));

        // 基础URL
        new Setting(container)
            .setName(t('Base URL'))
            .addText(text => text
                .setValue(this.formData.config?.baseUrl || '')
                .onChange(value => {
                    if (!this.formData.config) this.formData.config = {};
                    this.formData.config.baseUrl = value;
                }));

        // 模型ID
        new Setting(container)
            .setName(t('Model ID'))
            .addText(text => text
                .setValue(this.formData.config?.model || '')
                .onChange(value => {
                    if (!this.formData.config) this.formData.config = {};
                    this.formData.config.model = value;
                }));

        // 描述
        new Setting(container)
            .setName(t('Description'))
            .addTextArea(text => text
                .setValue(this.formData.metadata?.description || '')
                .onChange(value => {
                    if (!this.formData.metadata) this.formData.metadata = {};
                    this.formData.metadata.description = value;
                }));

        // 按钮
        const buttonContainer = container.createDiv('modal-button-container');
        
        const saveButton = buttonContainer.createEl('button', {
            text: t('Save'),
            cls: 'mod-cta'
        });
        saveButton.onclick = () => this.save();
        
        const cancelButton = buttonContainer.createEl('button', {
            text: t('Cancel')
        });
        cancelButton.onclick = () => this.close();
    }

    private save(): void {
        if (!this.formData.name || !this.formData.provider) {
            new Notice(t('Please fill in all required fields'));
            return;
        }

        const model: EnhancedAIModel = {
            id: this.model?.id || '',
            name: this.formData.name,
            provider: this.formData.provider,
            isCustom: this.formData.isCustom ?? true,
            isActive: this.formData.isActive ?? false,
            isEnabled: this.formData.isEnabled ?? true,
            config: this.formData.config || {},
            metadata: this.formData.metadata
        };

        this.onSave(model);
        this.close();
    }

    onClose(): void {
        const { contentEl } = this;
        contentEl.empty();
    }
}

// 快速添加模态框
class QuickAddModal extends Modal {
    private provider: string;
    private onAdd: (models: EnhancedAIModel[]) => void;
    private selectedModels: Set<string> = new Set();

    constructor(app: App, provider: string, onAdd: (models: EnhancedAIModel[]) => void) {
        super(app);
        this.provider = provider;
        this.onAdd = onAdd;
    }

    onOpen(): void {
        const { contentEl } = this;
        contentEl.empty();
        
        const template = PROVIDER_TEMPLATES[this.provider as keyof typeof PROVIDER_TEMPLATES];
        contentEl.createEl('h2', { text: t('Add ') + template.name + t(' Models') });
        
        template.models.forEach(model => {
            new Setting(contentEl)
                .setName(model.name)
                .setDesc(model.id)
                .addToggle(toggle => toggle
                    .onChange(value => {
                        if (value) {
                            this.selectedModels.add(model.id);
                        } else {
                            this.selectedModels.delete(model.id);
                        }
                    }));
        });

        // 按钮
        const buttonContainer = contentEl.createDiv('modal-button-container');
        
        const addButton = buttonContainer.createEl('button', {
            text: t('Add Selected'),
            cls: 'mod-cta'
        });
        addButton.onclick = () => this.addSelected();
        
        const cancelButton = buttonContainer.createEl('button', {
            text: t('Cancel')
        });
        cancelButton.onclick = () => this.close();
    }

    private addSelected(): void {
        const template = PROVIDER_TEMPLATES[this.provider as keyof typeof PROVIDER_TEMPLATES];
        const modelsToAdd: EnhancedAIModel[] = [];

        template.models.forEach(model => {
            if (this.selectedModels.has(model.id)) {
                modelsToAdd.push({
                    id: '',
                    name: model.name,
                    provider: this.provider,
                    isCustom: false,
                    isActive: false,
                    isEnabled: true,
                    config: {
                        baseUrl: template.baseUrl,
                        model: model.id,
                        maxTokens: 4096,
                        temperature: 0.7
                    },
                    metadata: {
                        description: `${template.name} ${model.name} model`
                    }
                });
            }
        });

        if (modelsToAdd.length > 0) {
            this.onAdd(modelsToAdd);
        }
        this.close();
    }

    onClose(): void {
        const { contentEl } = this;
        contentEl.empty();
    }
}

// 确认对话框
class ConfirmModal extends Modal {
    private title: string;
    private message: string;
    private resolve: (confirmed: boolean) => void;

    constructor(app: App, title: string, message: string, resolve: (confirmed: boolean) => void) {
        super(app);
        this.title = title;
        this.message = message;
        this.resolve = resolve;
    }

    onOpen(): void {
        const { contentEl } = this;
        contentEl.empty();
        
        contentEl.createEl('h2', { text: this.title });
        contentEl.createEl('p', { text: this.message });
        
        const buttonContainer = contentEl.createDiv('modal-button-container');
        
        const confirmButton = buttonContainer.createEl('button', {
            text: t('Confirm'),
            cls: 'mod-warning'
        });
        confirmButton.onclick = () => {
            this.resolve(true);
            this.close();
        };
        
        const cancelButton = buttonContainer.createEl('button', {
            text: t('Cancel')
        });
        cancelButton.onclick = () => {
            this.resolve(false);
            this.close();
        };
    }

    onClose(): void {
        const { contentEl } = this;
        contentEl.empty();
    }
}
