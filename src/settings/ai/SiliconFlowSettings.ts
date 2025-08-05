import { Setting, Notice, requestUrl } from 'obsidian';
import { AIModel } from '../../types';
import { DEFAULT_SILICONFLOW_MODELS } from '../../types';
import { BaseAIServiceSettings } from './AIServiceSettings';
import { t } from '../../i18n';

interface SiliconFlowModelState {
    selectedModel: AIModel;
    apiKey: string;
}

export class SiliconFlowSettings extends BaseAIServiceSettings {
    private modelState: SiliconFlowModelState;
    private modelSelectEl: HTMLSelectElement | null = null;
    private customModelContainer: HTMLDivElement | null = null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(plugin: any, containerEl: HTMLElement) {
        super(plugin, containerEl);
        this.modelState = this.initializeModelState();
    }

    private initializeModelState(): SiliconFlowModelState {
        if (!this.plugin.settings.ai.siliconflow) {
            this.plugin.settings.ai.siliconflow = {
                apiKey: '',
                model: DEFAULT_SILICONFLOW_MODELS[0].id,
                baseUrl: '',
                isCustomModel: false,
                lastCustomModel: ''
            };
        }

        const settings = this.plugin.settings.ai.siliconflow;
        let selectedModel: AIModel;

        if (settings.isCustomModel) {
            selectedModel = {
                id: settings.model,
                name: settings.model,
                isCustom: true
            };
        } else {
            const savedModel = DEFAULT_SILICONFLOW_MODELS.find(m => m.id === settings.model);
            selectedModel = savedModel || DEFAULT_SILICONFLOW_MODELS[0];
            
            if (!savedModel) {
                settings.model = selectedModel.id;
            }
        }

        return {
            selectedModel,
            apiKey: settings.apiKey || ''
        };
    }

    private async saveModelState() {
        if (!this.plugin.settings.ai.siliconflow) {
            this.plugin.settings.ai.siliconflow = {
                apiKey: this.modelState.apiKey || '',
                model: this.modelState.selectedModel.id,
                baseUrl: '',
                isCustomModel: !!this.modelState.selectedModel.isCustom,
                lastCustomModel: this.modelState.selectedModel.isCustom ? this.modelState.selectedModel.id : undefined
            };
        } else {
            const settings = this.plugin.settings.ai.siliconflow;
            const model = this.modelState.selectedModel;
            
            settings.model = model.id;
            settings.isCustomModel = !!model.isCustom;
            settings.apiKey = this.modelState.apiKey || '';
            
            if (model.isCustom && model.id) {
                settings.lastCustomModel = model.id;
            }
        }
        
        await this.plugin.saveSettings();
    }

    private async validateApiKey(apiKey: string): Promise<{ isValid: boolean; message?: string }> {
        try {
            const defaultUrl = 'https://api.siliconflow.cn/v1';
            const customUrl = this.plugin.settings.ai.siliconflow?.baseUrl;
            const baseUrl = customUrl && customUrl.trim() ? customUrl : defaultUrl;
            
            // 先验证 API Key 是否有效
            const modelId = this.modelState.selectedModel.id;
            const chatUrl = `${baseUrl}/chat/completions`;


            const response = await requestUrl({
                url: chatUrl,
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: modelId,
                    messages: [
                        {
                            role: 'user',
                            content: 'Hello'
                        }
                    ],
                    max_tokens: 1
                })
            });

            if (!response.status || response.status < 200 || response.status >= 300) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const errorData = response.json || null;

                return {
                    isValid: false,
                    message: t('API Key 无效或模型不可用。请检查你的 API Key 和模型 ID 是否正确。')
                };
            }
            
            return {
                isValid: true,
                message: t('API Key and model available.')
            };
        } catch (error) {

            return {
                isValid: false,
                message: t('API Key 无效或服务器错误。')
            };
        }
    }

    private async showCustomModelInput() {
        if (this.customModelContainer && this.modelSelectEl) {
            this.customModelContainer.addClass('visible');
            // Margin handled by CSS
        }
    }

    private async hideCustomModelInput() {
        if (this.customModelContainer && this.modelSelectEl) {
            this.customModelContainer.removeClass('visible');
            // Margin handled by CSS
        }
    }

    display(containerEl: HTMLElement) {
        const siliconflowSection = containerEl.createEl('div', { cls: 'ai-service-settings' });

        // 添加标题
        new Setting(siliconflowSection)
            .setName(t('SiliconFlow service'))
            .setHeading();

        // API Key 设置 - 变量用于链式调用
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const apiKeySetting = new Setting(siliconflowSection)
            .setName(t('API key'))
            .setDesc(t('Please enter your API Key.'))
            .addText(text => text
                .setPlaceholder('sk-...')
                .setValue(this.modelState.apiKey)
                .onChange(async (value) => {
                    this.modelState.apiKey = value;
                    await this.saveModelState();
                }))
            .addButton(button => button
                .setButtonText(t('Check'))
                .onClick(async () => {
                    const apiKey = this.modelState.apiKey;
                    if (!apiKey) {
                        new Notice(t('Please input API Key'));
                        return;
                    }

                    button.setButtonText(t('Checking...'));
                    button.setDisabled(true);

                    const result = await this.validateApiKey(apiKey);

                    button.setButtonText(t('Check'));
                    button.setDisabled(false);

                    if (result.message) {
                        new Notice(result.message);
                    }
                }));

        // Model 设置
        const modelSetting = new Setting(siliconflowSection)
            .setName(t('Model'))
            .setDesc(t('Select a model or enter a custom one.'))
            .addDropdown(dropdown => {
                // 添加预设模型
                DEFAULT_SILICONFLOW_MODELS.forEach(model => {
                    dropdown.addOption(model.id, model.name);
                });
                // 添加自定义模型选项
                dropdown.addOption('custom', t('Custom Model'));

                // 设置当前选中的模型
                const currentModel = this.modelState.selectedModel;
                dropdown.setValue(currentModel.isCustom ? 'custom' : currentModel.id);

                this.modelSelectEl = dropdown.selectEl;

                dropdown.onChange(async (value) => {
                    if (value === 'custom') {
                        // 如果有上次使用的自定义模型，使用它
                        const lastCustomModel = this.plugin.settings.ai.siliconflow?.lastCustomModel;
                        this.modelState.selectedModel = {
                            id: lastCustomModel || '',
                            name: lastCustomModel || '',
                            isCustom: true
                        };
                        await this.saveModelState();
                        await this.showCustomModelInput();
                    } else {
                        const selectedModel = DEFAULT_SILICONFLOW_MODELS.find(m => m.id === value);
                        if (selectedModel) {
                            if (this.modelState.selectedModel.isCustom && this.plugin.settings.ai.siliconflow) {
                                this.plugin.settings.ai.siliconflow.lastCustomModel = this.modelState.selectedModel.id;
                                await this.plugin.saveSettings();
                            }
                            
                            this.modelState.selectedModel = selectedModel;
                            await this.saveModelState();
                            await this.hideCustomModelInput();
                        }
                    }
                });

                return dropdown;
            });

        // 创建自定义模型输入容器
        this.customModelContainer = modelSetting.settingEl.createDiv('custom-model-container');
        this.customModelContainer.addClass('custom-model-container');
        
        // 将自定义输入框容器移到下拉框之前
        const dropdownEl = modelSetting.settingEl.querySelector('.setting-item-control');
        if (dropdownEl) {
            (dropdownEl as HTMLElement).addClass('openai-dropdown-container');
            dropdownEl.insertBefore(this.customModelContainer, dropdownEl.firstChild);
        }

        // 添加自定义模型输入框
        const textComponent = new Setting(this.customModelContainer)
            .addText(text => text
                .setPlaceholder('model-id')
                .setValue(this.modelState.selectedModel.isCustom ? this.modelState.selectedModel.id : '')
                .onChange(async (value) => {
                    const trimmedValue = value.trim();
                    
                    if (!trimmedValue) {
                        return;
                    }
                    
                    if (!/^[a-zA-Z0-9-_./]+$/.test(trimmedValue)) {
                        new Notice('模型 ID 只能包含字母、数字、下划线、点和连字符');
                        text.setValue(this.modelState.selectedModel.id);
                        return;
                    }
                    
                    this.modelState.selectedModel = {
                        id: trimmedValue,
                        name: trimmedValue,
                        isCustom: true
                    };
                    await this.saveModelState();
                }));

        // 移除 Setting 组件的额外样式
        const settingItem = textComponent.settingEl;
        settingItem.addClass('openai-setting-no-border');
        const controlEl = settingItem.querySelector('.setting-item-control');
        if (controlEl) {
            (controlEl as HTMLElement).addClass('openai-setting-no-margin');
        }

        // 如果当前是自定义模型，显示输入框
        if (this.modelState.selectedModel.isCustom) {
            this.showCustomModelInput();
        }

        // Custom API Address 设置
        new Setting(siliconflowSection)
            .setName(t('Provider URL'))
            .setDesc(t('Leave it blank, unless you are using a proxy.'))
            .addText(text => {
                const defaultUrl = 'https://api.siliconflow.cn/v1';
                const currentValue = this.plugin.settings.ai.siliconflow?.baseUrl;
                
                text.setPlaceholder(defaultUrl)
                    .setValue(currentValue || '')
                    .onChange(async (value) => {
                        if (!this.plugin.settings.ai.siliconflow) {
                            this.plugin.settings.ai.siliconflow = {
                                apiKey: this.modelState.apiKey || '',
                                model: this.modelState.selectedModel.id,
                                baseUrl: value || '',
                                isCustomModel: !!this.modelState.selectedModel.isCustom,
                                lastCustomModel: this.modelState.selectedModel.isCustom ? this.modelState.selectedModel.id : undefined
                            };
                        } else {
                            this.plugin.settings.ai.siliconflow.baseUrl = value || '';
                        }
                        await this.plugin.saveSettings();
                    });
                return text;
            });
    }
}
