// 简化的模型配置向导

import { Modal, Setting, Notice, App } from 'obsidian';
import type { EnhancedAIModel, ModelConfig, HiNotePlugin } from '../types';

// 提供商配置模板
interface ProviderTemplate {
    name: string;
    description: string;
    baseUrl: string;
    defaultModels: Array<{
        id: string;
        name: string;
        description: string;
        contextLength?: number;
        capabilities: string[];
    }>;
    configFields: Array<{
        key: string;
        label: string;
        type: 'text' | 'password' | 'number' | 'toggle';
        required: boolean;
        placeholder?: string;
        description?: string;
        defaultValue?: string | number | boolean;
    }>;
    testEndpoint?: string;
}

// 内置提供商模板
const PROVIDER_TEMPLATES: Record<string, ProviderTemplate> = {
    openai: {
        name: 'OpenAI',
        description: 'OpenAI GPT 系列模型，包括 GPT-4、GPT-3.5 等',
        baseUrl: 'https://api.openai.com/v1',
        defaultModels: [
            {
                id: 'gpt-4',
                name: 'GPT-4',
                description: '最新的 GPT-4 模型',
                contextLength: 8192,
                capabilities: ['text-generation', 'reasoning', 'analysis']
            },
            {
                id: 'gpt-3.5-turbo',
                name: 'GPT-3.5 Turbo',
                description: '快速且经济的 GPT-3.5 模型',
                contextLength: 4096,
                capabilities: ['text-generation', 'reasoning']
            }
        ],
        configFields: [
            {
                key: 'apiKey',
                label: 'API 密钥',
                type: 'password',
                required: true,
                placeholder: 'sk-...',
                description: '从 OpenAI 控制台获取'
            },
            {
                key: 'baseUrl',
                label: '基础 URL',
                type: 'text',
                required: false,
                placeholder: 'https://api.openai.com/v1',
                description: '可选：自定义 API 端点'
            }
        ]
    }
};

export class ModelConfigurationWizard extends Modal {
    private plugin: HiNotePlugin;
    private onComplete: (models: EnhancedAIModel[]) => void;
    private step = 1;
    private selectedProvider = '';
    private selectedModels: string[] = [];
    private config: Partial<ModelConfig> = {};
    private configuredModels: EnhancedAIModel[] = [];

    constructor(app: App, plugin: HiNotePlugin, onComplete: (models: EnhancedAIModel[]) => void) {
        super(app);
        this.plugin = plugin;
        this.onComplete = onComplete;
    }

    onOpen() {
        this.displayStep();
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }

    private displayStep() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass('model-config-wizard');

        // 标题
        contentEl.createEl('h2', { 
            text: '模型配置向导',
            cls: 'wizard-title'
        });

        // 步骤指示器
        this.createStepIndicator(contentEl);

        // 根据步骤显示内容
        switch (this.step) {
            case 1: {
                this.displayProviderSelection(contentEl);
                break;
            }
            case 2: {
                this.displayConfiguration(contentEl);
                break;
            }
            case 3: {
                this.displaySummary(contentEl);
                break;
            }
        }
    }

    private createStepIndicator(container: HTMLElement) {
        const indicator = container.createDiv('step-indicator');
        const steps = ['选择提供商', '配置参数', '完成'];
        
        steps.forEach((stepName, index) => {
            indicator.createDiv({
                cls: `step ${index + 1 === this.step ? 'active' : ''} ${index + 1 < this.step ? 'completed' : ''}`,
                text: `${index + 1}. ${stepName}`
            });
        });
    }

    private displayProviderSelection(container: HTMLElement) {
        container.createEl('h3', { text: '选择 AI 服务提供商' });
        container.createEl('p', { 
            text: '请选择您要配置的 AI 服务提供商',
            cls: 'wizard-description'
        });

        const providersContainer = container.createDiv('providers-grid');

        Object.entries(PROVIDER_TEMPLATES).forEach(([key, template]) => {
            const providerCard = providersContainer.createDiv({
                cls: `provider-card ${this.selectedProvider === key ? 'selected' : ''}`
            });

            providerCard.createEl('h4', { text: template.name });
            providerCard.createEl('p', { text: template.description });
            providerCard.createEl('small', { 
                text: `${template.defaultModels.length} 个预设模型`
            });

            providerCard.addEventListener('click', () => {
                this.selectedProvider = key;
                this.displayStep();
            });
        });

        this.createNavigationButtons(container, false, this.selectedProvider !== '');
    }

    private displayConfiguration(container: HTMLElement) {
        const template = PROVIDER_TEMPLATES[this.selectedProvider];
        if (!template) return;

        container.createEl('h3', { text: `配置 ${template.name} 模型` });
        container.createEl('p', { 
            text: '请填写必要的配置信息',
            cls: 'wizard-description'
        });

        const configContainer = container.createDiv('config-container');

        template.configFields.forEach(field => {
            new Setting(configContainer)
                .setName(field.label + (field.required ? ' *' : ''))
                .setDesc(field.description || '')
                .addText(text => {
                    if (field.type === 'password') {
                        text.inputEl.type = 'password';
                    } else if (field.type === 'number') {
                        text.inputEl.type = 'number';
                    }
                    
                    text.setPlaceholder(field.placeholder || '')
                        .setValue(String(field.defaultValue || ''))
                        .onChange(value => {
                            const configValue = field.type === 'number' 
                                ? parseFloat(value) || 0
                                : value;
                            (this.config as Record<string, unknown>)[field.key] = configValue;
                        });
                    
                    // 设置默认值
                    if (field.defaultValue !== undefined) {
                        (this.config as Record<string, unknown>)[field.key] = field.defaultValue;
                    }
                });
        });

        // 显示预设模型列表
        container.createEl('h4', { text: '将添加的模型:' });
        const modelsList = container.createEl('ul');
        template.defaultModels.forEach(model => {
            const li = modelsList.createEl('li');
            li.createEl('strong', { text: model.name });
            li.createEl('span', { text: ` - ${model.description}` });
        });

        this.createNavigationButtons(container, true, true);
    }

    private displaySummary(container: HTMLElement) {
        const template = PROVIDER_TEMPLATES[this.selectedProvider];
        if (!template) return;

        container.createEl('h3', { text: '配置完成' });
        
        const summary = container.createDiv('summary-container');
        summary.createEl('p', { text: `✅ 提供商: ${template.name}` });
        summary.createEl('p', { text: `✅ 模型数量: ${template.defaultModels.length}` });
        
        const modelsList = summary.createEl('ul');
        template.defaultModels.forEach(model => {
            modelsList.createEl('li', { text: model.name });
        });

        container.createEl('p', { 
            text: '点击"完成"将添加这些模型到您的配置中。',
            cls: 'wizard-description'
        });

        this.createNavigationButtons(container, true, true, true);
    }

    private createNavigationButtons(
        container: HTMLElement, 
        showBack = false, 
        enableNext = false,
        isFinish = false
    ) {
        const buttonContainer = container.createDiv('wizard-buttons');

        if (showBack) {
            new Setting(buttonContainer)
                .addButton(btn => btn
                    .setButtonText('上一步')
                    .onClick(() => {
                        this.step--;
                        this.displayStep();
                    }));
        }

        new Setting(buttonContainer)
            .addButton(btn => btn
                .setButtonText(isFinish ? '完成' : '下一步')
                .setCta()
                .setDisabled(!enableNext)
                .onClick(() => {
                    if (isFinish) {
                        this.completeWizard();
                    } else {
                        this.step++;
                        this.displayStep();
                    }
                }))
            .addButton(btn => btn
                .setButtonText('取消')
                .onClick(() => this.close()));
    }

    private completeWizard() {
        const template = PROVIDER_TEMPLATES[this.selectedProvider];
        if (!template) return;

        // 创建配置的模型
        this.configuredModels = template.defaultModels.map(modelTemplate => {
            return {
                id: `${this.selectedProvider}-${modelTemplate.id}-${Date.now()}`,
                name: `${modelTemplate.name} (${template.name})`,
                displayName: modelTemplate.name,
                provider: this.selectedProvider,
                isCustom: false,
                isActive: false,
                isEnabled: true,
                config: {
                    ...this.config,
                    model: modelTemplate.id,
                    baseUrl: this.config.baseUrl || template.baseUrl
                } as ModelConfig,
                metadata: {
                    description: modelTemplate.description,
                    contextLength: modelTemplate.contextLength,
                    capabilities: modelTemplate.capabilities as never[],
                    createdAt: Date.now()
                },
                category: 'general'
            } as EnhancedAIModel;
        });

        // 完成回调
        this.onComplete(this.configuredModels);
        this.close();

        new Notice(`成功添加 ${this.configuredModels.length} 个模型配置`);
    }

    // 公共方法用于设置初始状态
    public setInitialState(provider: string, step: number) {
        this.selectedProvider = provider;
        this.step = step;
    }
}

// 便捷的创建函数
export async function quickConfigureModel(
    app: App, 
    plugin: HiNotePlugin, 
    provider: string
): Promise<EnhancedAIModel[]> {
    return new Promise((resolve) => {
        const wizard = new ModelConfigurationWizard(app, plugin, resolve);
        wizard.setInitialState(provider, 2);
        wizard.open();
    });
}
