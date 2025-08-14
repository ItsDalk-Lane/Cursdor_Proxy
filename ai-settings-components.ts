//  AI设置相关的UI组件 - 适配新的数据管理器
import { App, Modal, Setting, Notice } from 'obsidian';
import { ModelConfig, NewModelConfigManager } from './new-model-config-manager';
import { PREDEFINED_PROVIDERS } from './model-config';

// 模型管理主模态框
export class ModelManagementModal extends Modal {
    private modelManager: NewModelConfigManager;
    private onUpdate: () => void;

    constructor(app: App, modelManager: NewModelConfigManager, onUpdate: () => void) {
        super(app);
        this.modelManager = modelManager;
        this.onUpdate = onUpdate;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass('model-management-modal');

        // 标题
        const titleEl = contentEl.createEl('h2', { text: 'AI模型管理', cls: 'modal-title' });
        titleEl.style.display = 'flex';
        titleEl.style.justifyContent = 'space-between';
        titleEl.style.alignItems = 'center';
        titleEl.style.marginBottom = '20px';

        // 添加模型按钮
        const addButton = titleEl.createEl('button', { text: '添加AI模型', cls: 'mod-cta' });
        addButton.style.fontSize = '14px';
        addButton.style.padding = '8px 16px';
        addButton.addEventListener('click', () => {
            const addModal = new ModelFormModal(this.app, this.modelManager, null, () => {
                this.refreshModelList();
                this.onUpdate();
            }, this);
            addModal.open();
        });

        // 模型列表容器
        this.createModelList(contentEl);

        // 底部按钮
        const buttonContainer = contentEl.createEl('div', { cls: 'modal-button-container' });
        buttonContainer.style.marginTop = '20px';
        buttonContainer.style.textAlign = 'right';

        const closeButton = buttonContainer.createEl('button', { text: '关闭' });
        closeButton.addEventListener('click', () => this.close());
    }

    private createModelList(containerEl: HTMLElement) {
        const listContainer = containerEl.createEl('div', { cls: 'model-list-container' });
        listContainer.style.maxHeight = '400px';
        listContainer.style.overflowY = 'auto';
        listContainer.style.border = '1px solid var(--background-modifier-border)';
        listContainer.style.borderRadius = '8px';
        listContainer.style.padding = '12px';

        this.refreshModelList();
    }

    refreshModelList() {
        const listContainer = this.contentEl.querySelector('.model-list-container') as HTMLElement;
        if (!listContainer) return;

        listContainer.empty();

        const models = this.modelManager.getAllModels();
        
        if (models.length === 0) {
            const emptyMessage = listContainer.createEl('div', { 
                text: '暂无配置的模型，点击上方"添加AI模型"按钮开始配置', 
                cls: 'empty-message' 
            });
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.color = 'var(--text-muted)';
            emptyMessage.style.padding = '40px 20px';
            return;
        }

        models.forEach(model => {
            this.createModelItem(listContainer, model);
        });
    }

    private createModelItem(container: HTMLElement, model: ModelConfig) {
        const itemEl = container.createEl('div', { cls: 'model-item' });
        itemEl.style.display = 'flex';
        itemEl.style.justifyContent = 'space-between';
        itemEl.style.alignItems = 'center';
        itemEl.style.padding = '12px';
        itemEl.style.marginBottom = '8px';
        itemEl.style.border = '1px solid var(--background-modifier-border)';
        itemEl.style.borderRadius = '6px';
        itemEl.style.backgroundColor = 'var(--background-secondary)';

        // 左侧信息
        const infoEl = itemEl.createEl('div', { cls: 'model-info' });
        
        const nameEl = infoEl.createEl('div', { cls: 'model-name' });
        nameEl.style.fontWeight = 'bold';
        nameEl.style.marginBottom = '4px';
        
        // 显示验证状态
        const statusIcon = model.isVerified ? '✅' : '❌';
        nameEl.textContent = `${statusIcon} ${model.displayName}`;

        const detailsEl = infoEl.createEl('div', { cls: 'model-details' });
        detailsEl.style.fontSize = '12px';
        detailsEl.style.color = 'var(--text-muted)';
        
        // 格式化token数量显示
        const contextTokens = model.maxContextTokens ? `${(model.maxContextTokens / 1000).toFixed(0)}K` : 'N/A';
        const outputTokens = model.maxOutputTokens ? `${(model.maxOutputTokens / 1000).toFixed(0)}K` : 'N/A';
        
        detailsEl.textContent = `${model.modelName} | ${PREDEFINED_PROVIDERS[model.provider]?.name || model.provider} | 上下文:${contextTokens} 输出:${outputTokens}`;

        // 右侧按钮
        const buttonsEl = itemEl.createEl('div', { cls: 'model-buttons' });
        buttonsEl.style.display = 'flex';
        buttonsEl.style.gap = '8px';

        // 编辑按钮
        const editButton = buttonsEl.createEl('button', { text: '设置', cls: 'mod-small' });
        editButton.addEventListener('click', () => {
            const editModal = new ModelFormModal(this.app, this.modelManager, model, () => {
                this.refreshModelList();
                this.onUpdate();
            }, this);
            editModal.open();
        });

        // 删除按钮
        const deleteButton = buttonsEl.createEl('button', { text: '删除', cls: 'mod-small mod-warning' });
        deleteButton.addEventListener('click', async () => {
            await this.modelManager.deleteModel(model.id);
            this.refreshModelList();
            this.onUpdate();
        });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}

// 模型配置表单模态框
export class ModelFormModal extends Modal {
    private modelManager: NewModelConfigManager;
    private model: ModelConfig | null;
    private onSave: () => void;
    private formData: Partial<ModelConfig> = {};
    private parentModal: ModelManagementModal | null = null;
    private baseURLInput: HTMLInputElement | null = null;
    private modelNameInput: HTMLInputElement | null = null;
    private isNewModelVerified: boolean = false;

    constructor(app: App, modelManager: NewModelConfigManager, model: ModelConfig | null, onSave: () => void, parentModal?: ModelManagementModal) {
        super(app);
        this.modelManager = modelManager;
        this.model = model;
        this.onSave = onSave;
        this.parentModal = parentModal || null;
        
        // 初始化表单数据
        if (model) {
            this.formData = { ...model };
        } else {
            this.formData = {
                displayName: '',
                modelName: '',
                provider: 'deepseek',
                baseURL: PREDEFINED_PROVIDERS.deepseek.defaultBaseURL,
                apiKey: '',
                maxContextTokens: 32000,  // 默认32K上下文
                maxOutputTokens: 4000     // 默认4K输出
            };
        }
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass('model-form-modal');

        // 清空输入框引用
        this.baseURLInput = null;
        this.modelNameInput = null;
        // 重置验证状态
        this.isNewModelVerified = false;

        // 标题
        const title = this.model ? '编辑模型配置' : '添加模型配置';
        contentEl.createEl('h2', { text: title, cls: 'modal-title' });

        // 表单容器
        const formEl = contentEl.createEl('div', { cls: 'model-form' });
        formEl.style.padding = '20px 0';

        this.createFormFields(formEl);
        this.createButtons(contentEl);
    }

    private createFormFields(container: HTMLElement) {
        // 显示名称
        const displayNameSetting = new Setting(container)
            .setName('显示名称')
            .setDesc('为此模型设置一个自定义名称')
            .addText(text => {
                text.setPlaceholder('例如：我的DeepSeek模型')
                    .setValue(this.formData.displayName || '')
                    .onChange(value => {
                        this.formData.displayName = value;
                    });
            });

        // 模型型号
        const modelNameSetting = new Setting(container)
            .setName('模型型号')
            .setDesc('输入具体的模型型号名称')
            .addText(text => {
                text.setPlaceholder(this.getModelPlaceholder())
                    .setValue(this.formData.modelName || '')
                    .onChange(value => {
                        this.formData.modelName = value;
                    });
                this.modelNameInput = text.inputEl;
            });

        // AI提供商
        const providerSetting = new Setting(container)
            .setName('AI提供商')
            .setDesc('选择AI服务提供商')
            .addDropdown(dropdown => {
                Object.entries(PREDEFINED_PROVIDERS).forEach(([key, provider]) => {
                    dropdown.addOption(key, provider.name);
                });
                
                dropdown.setValue(this.formData.provider || 'deepseek')
                    .onChange(value => {
                        this.formData.provider = value;
                        this.formData.baseURL = PREDEFINED_PROVIDERS[value]?.defaultBaseURL || '';
                        // 直接更新相关字段，而不是重新渲染整个表单
                        this.updateProviderRelatedFields();
                    });
            });

        // 基础URL
        const baseURLSetting = new Setting(container)
            .setName('基础URL')
            .setDesc('API服务的基础URL地址')
            .addText(text => {
                text.setPlaceholder('https://api.example.com/v1')
                    .setValue(this.formData.baseURL || '')
                    .onChange(value => {
                        this.formData.baseURL = value;
                    });
                this.baseURLInput = text.inputEl;
            });

        // API密钥
        const apiKeySetting = new Setting(container)
            .setName('API密钥')
            .setDesc('输入您的API密钥')
            .addText(text => {
                text.setPlaceholder('sk-...')
                    .setValue(this.formData.apiKey || '')
                    .onChange(value => {
                        this.formData.apiKey = value;
                    });
                text.inputEl.type = 'password';
            });

        // 最大上下文长度
        const maxContextSetting = new Setting(container)
            .setName('最大上下文长度')
            .setDesc('模型支持的最大上下文令牌数（例如：32000表示32K）')
            .addText(text => {
                text.setPlaceholder('32000')
                    .setValue(this.formData.maxContextTokens?.toString() || '32000')
                    .onChange(value => {
                        const numValue = parseInt(value);
                        if (!isNaN(numValue) && numValue > 0) {
                            this.formData.maxContextTokens = numValue;
                        }
                    });
                text.inputEl.type = 'number';
                text.inputEl.min = '1000';
                text.inputEl.step = '1000';
            });

        // 最大输出令牌数
        const maxOutputSetting = new Setting(container)
            .setName('最大输出令牌数')
            .setDesc('模型单次输出的最大令牌数（例如：4000表示4K）')
            .addText(text => {
                text.setPlaceholder('4000')
                    .setValue(this.formData.maxOutputTokens?.toString() || '4000')
                    .onChange(value => {
                        const numValue = parseInt(value);
                        if (!isNaN(numValue) && numValue > 0) {
                            this.formData.maxOutputTokens = numValue;
                        }
                    });
                text.inputEl.type = 'number';
                text.inputEl.min = '100';
                text.inputEl.step = '100';
            });
    }

    private createButtons(container: HTMLElement) {
        const buttonContainer = container.createEl('div', { cls: 'modal-button-container' });
        buttonContainer.style.marginTop = '20px';
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'space-between';
        buttonContainer.style.gap = '10px';

        // 左侧：验证按钮
        const leftButtons = buttonContainer.createEl('div');
        const verifyButton = leftButtons.createEl('button', { text: '验证', cls: 'mod-cta verify-model-btn' });
        verifyButton.addEventListener('click', () => this.verifyModel());

        // 右侧：保存和取消按钮
        const rightButtons = buttonContainer.createEl('div');
        rightButtons.style.display = 'flex';
        rightButtons.style.gap = '10px';

        const saveButton = rightButtons.createEl('button', { text: '保存', cls: 'mod-cta' });
        saveButton.addEventListener('click', () => this.saveModel());

        const cancelButton = rightButtons.createEl('button', { text: '取消' });
        cancelButton.addEventListener('click', () => this.close());
    }

    private getModelPlaceholder(): string {
        const provider = this.formData.provider || 'deepseek';
        return PREDEFINED_PROVIDERS[provider]?.modelPlaceholder || '输入模型型号';
    }

    private updateProviderRelatedFields(): void {
        // 更新baseURL输入框的值
        if (this.baseURLInput) {
            this.baseURLInput.value = this.formData.baseURL || '';
        }

        // 更新模型名称输入框的placeholder
        if (this.modelNameInput) {
            this.modelNameInput.placeholder = this.getModelPlaceholder();
        }
    }

    private async verifyModel() {
        if (!this.validateForm()) return;

        // 通过类名获取验证按钮
        const verifyButton = this.contentEl.querySelector('.verify-model-btn') as HTMLButtonElement;
        if (verifyButton) {
            verifyButton.textContent = '验证中...';
            verifyButton.disabled = true;
        }

        try {
            let result;
            
            if (this.model) {
                // 对于现有模型，先更新配置再验证
                await this.modelManager.updateModel(this.model.id, {
                    displayName: this.formData.displayName!,
                    modelName: this.formData.modelName!,
                    provider: this.formData.provider!,
                    baseURL: this.formData.baseURL!,
                    apiKey: this.formData.apiKey!,
                    maxContextTokens: this.formData.maxContextTokens || 32000,
                    maxOutputTokens: this.formData.maxOutputTokens || 4000,
                    isVerified: false
                });
                result = await this.modelManager.verifyModel(this.model.id);
            } else {
                // 对于新模型，直接测试配置而不创建
                result = await this.modelManager.testModelConfig({
                    displayName: this.formData.displayName!,
                    modelName: this.formData.modelName!,
                    provider: this.formData.provider!,
                    baseURL: this.formData.baseURL!,
                    apiKey: this.formData.apiKey!,
                    maxContextTokens: this.formData.maxContextTokens || 32000,
                    maxOutputTokens: this.formData.maxOutputTokens || 4000
                });
            }

            if (result.success) {
                new Notice('✅ 模型验证成功！');
                
                if (this.model) {
                    // 对于现有模型，更新当前编辑界面中的模型对象状态
                    this.model.isVerified = true;
                    this.model.displayName = this.formData.displayName!;
                    this.model.modelName = this.formData.modelName!;
                    this.model.provider = this.formData.provider!;
                    this.model.baseURL = this.formData.baseURL!;
                    this.model.apiKey = this.formData.apiKey!;
                    this.model.maxContextTokens = this.formData.maxContextTokens || 32000;
                    this.model.maxOutputTokens = this.formData.maxOutputTokens || 4000;
                } else {
                    // 对于新模型，标记验证状态
                    this.isNewModelVerified = true;
                }
                
                // 验证成功后刷新父界面的模型列表
                if (this.parentModal) {
                    this.parentModal.refreshModelList();
                }
            } else {
                new Notice(`❌ 模型验证失败：${result.error}`);
                
                if (this.model) {
                    // 对于现有模型，更新验证状态为失败
                    this.model.isVerified = false;
                } else {
                    // 验证失败时重置标志
                    this.isNewModelVerified = false;
                }
            }
        } catch (error) {
            new Notice(`❌ 验证过程中发生错误：${error.message}`);
            
            // 验证出错时，更新验证状态为失败
            if (this.model) {
                this.model.isVerified = false;
            } else {
                this.isNewModelVerified = false;
            }
        } finally {
            // 还原验证按钮状态
            const verifyButton = this.contentEl.querySelector('.verify-model-btn') as HTMLButtonElement;
            if (verifyButton) {
                verifyButton.textContent = '验证';
                verifyButton.disabled = false;
            }
        }
    }

    private async saveModel() {
        if (!this.validateForm()) return;

        try {
            if (this.model) {
                // 更新现有模型 - 检查是否有关键配置变化
                const originalModel = this.modelManager.getModelById(this.model.id);
                const hasKeyChanges = originalModel && (
                    originalModel.modelName !== this.formData.modelName ||
                    originalModel.provider !== this.formData.provider ||
                    originalModel.baseURL !== this.formData.baseURL ||
                    originalModel.apiKey !== this.formData.apiKey
                );
                
                // 如果有关键变化且当前模型对象的验证状态没有更新，则重置验证状态
                let finalVerifiedStatus;
                if (hasKeyChanges && this.model.isVerified === originalModel?.isVerified) {
                    // 配置变化了但没有重新验证，重置验证状态
                    finalVerifiedStatus = false;
                } else {
                    // 使用当前模型对象的验证状态（可能在验证方法中已更新）
                    finalVerifiedStatus = this.model.isVerified;
                }
                
                await this.modelManager.updateModel(this.model.id, {
                    displayName: this.formData.displayName!,
                    modelName: this.formData.modelName!,
                    provider: this.formData.provider!,
                    baseURL: this.formData.baseURL!,
                    apiKey: this.formData.apiKey!,
                    maxContextTokens: this.formData.maxContextTokens || 32000,
                    maxOutputTokens: this.formData.maxOutputTokens || 4000,
                    isVerified: finalVerifiedStatus
                });
            } else {
                // 添加新模型 - 使用验证状态标志
                const modelId = await this.modelManager.addModel({
                    displayName: this.formData.displayName!,
                    modelName: this.formData.modelName!,
                    provider: this.formData.provider!,
                    baseURL: this.formData.baseURL!,
                    apiKey: this.formData.apiKey!,
                    maxContextTokens: this.formData.maxContextTokens || 32000,
                    maxOutputTokens: this.formData.maxOutputTokens || 4000
                });
                
                // 如果新模型已经验证过，更新验证状态
                if (this.isNewModelVerified) {
                    await this.modelManager.updateModel(modelId, { isVerified: true });
                }
            }

            // 保存成功后刷新父界面
            if (this.parentModal) {
                this.parentModal.refreshModelList();
            }
            
            this.onSave();
            this.close();
        } catch (error) {
            new Notice(`保存失败：${error.message}`);
        }
    }

    private validateForm(): boolean {
        const required = ['displayName', 'modelName', 'provider', 'baseURL', 'apiKey'];
        
        for (const field of required) {
            if (!this.formData[field]?.trim()) {
                const fieldNames = {
                    displayName: '显示名称',
                    modelName: '模型型号',
                    provider: 'AI提供商',
                    baseURL: '基础URL',
                    apiKey: 'API密钥'
                };
                new Notice(`请填写${fieldNames[field]}`);
                return false;
            }
        }

        // 验证token参数
        if (!this.formData.maxContextTokens || this.formData.maxContextTokens < 1000) {
            new Notice('最大上下文长度不能少于1000');
            return false;
        }

        if (!this.formData.maxOutputTokens || this.formData.maxOutputTokens < 100) {
            new Notice('最大输出令牌数不能少于100');
            return false;
        }

        return true;
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
        
        // 清空输入框引用
        this.baseURLInput = null;
        this.modelNameInput = null;
    }
}

// 默认模型选择器组件
export class DefaultModelSelector {
    private container: HTMLElement;
    private modelManager: NewModelConfigManager;
    private selectEl: HTMLSelectElement;
    private onModelChange: (modelId: string | null) => void;

    constructor(
        container: HTMLElement, 
        modelManager: NewModelConfigManager, 
        onModelChange: (modelId: string | null) => void
    ) {
        this.container = container;
        this.modelManager = modelManager;
        this.onModelChange = onModelChange;
        this.render();
    }

    render() {
        // 清空容器
        this.container.empty();

        // 创建选择器
        this.selectEl = this.container.createEl('select', { cls: 'dropdown' });
        this.selectEl.style.width = '100%';
        this.selectEl.style.padding = '8px';
        this.selectEl.style.borderRadius = '4px';
        this.selectEl.style.border = '1px solid var(--background-modifier-border)';
        this.selectEl.style.backgroundColor = 'var(--background-primary)';

        this.updateOptions();

        this.selectEl.addEventListener('change', async () => {
            const selectedValue = this.selectEl.value;
            const modelId = selectedValue === '' ? null : selectedValue;
            
            if (modelId) {
                await this.modelManager.setDefaultModel(modelId);
            }
            
            this.onModelChange(modelId);
        });
    }

    updateOptions() {
        if (!this.selectEl) return;

        // 清空现有选项
        this.selectEl.innerHTML = '';

        // 添加默认选项
        const defaultOption = this.selectEl.createEl('option', { value: '', text: '请选择默认模型' });

        // 获取已验证的模型
        const verifiedModels = this.modelManager.getVerifiedModels();
        
        if (verifiedModels.length === 0) {
            const noModelOption = this.selectEl.createEl('option', { 
                value: '', 
                text: '暂无可用模型（请先添加并验证模型）' 
            });
            noModelOption.disabled = true;
            this.selectEl.disabled = true;
        } else {
            this.selectEl.disabled = false;
            
            verifiedModels.forEach(model => {
                const option = this.selectEl.createEl('option', { 
                    value: model.id, 
                    text: model.displayName 
                });
            });
        }

        // 设置当前选中的值
        const defaultModelId = this.modelManager.getDefaultModelId();
        if (defaultModelId) {
            this.selectEl.value = defaultModelId;
        }
    }

    // 外部调用以更新选项
    refresh() {
        this.updateOptions();
    }
}
