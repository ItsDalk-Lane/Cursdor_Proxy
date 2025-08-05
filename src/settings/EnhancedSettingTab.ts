import { App, PluginSettingTab, Setting, Notice } from 'obsidian';
import { EnhancedModelManagement } from './EnhancedModelManagement';
import { t } from '../i18n';

export class EnhancedSettingTab extends PluginSettingTab {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin: any;
    private modelManagement: EnhancedModelManagement;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(app: App, plugin: any) {
        super(app, plugin);
        this.plugin = plugin;
    }

    async display(): Promise<void> {
        const { containerEl } = this;
        containerEl.empty();

        // 添加样式
        containerEl.addClass('enhanced-ai-settings');

        // 主标题
        new Setting(containerEl)
            .setName(t('HiNote Enhanced AI Settings'))
            .setDesc(t('Configure multiple AI models and providers'))
            .setHeading();

        // 创建标签页导航
        const tabContainer = containerEl.createDiv('settings-tab-container');
        const contentContainer = containerEl.createDiv('settings-content-container');

        // 标签页按钮
        const tabs = [
            { id: 'models', name: t('Model Management'), icon: '🤖' },
            { id: 'chat', name: t('Chat Settings'), icon: '💬' },
            { id: 'context', name: t('Context Settings'), icon: '📄' },
            { id: 'export', name: t('Export/Import'), icon: '📁' }
        ];

        let activeTab = 'models';

        const tabButtons = tabs.map(tab => {
            const button = tabContainer.createEl('button', {
                text: `${tab.icon} ${tab.name}`,
                cls: `settings-tab-button ${tab.id === activeTab ? 'active' : ''}`
            });

            button.onclick = () => {
                // 更新活跃标签
                tabButtons.forEach(btn => btn.removeClass('active'));
                button.addClass('active');
                activeTab = tab.id;

                // 显示对应内容
                this.displayTabContent(contentContainer, tab.id);
            };

            return button;
        });

        // 显示默认标签内容
        this.displayTabContent(contentContainer, activeTab);
    }

    private displayTabContent(container: HTMLElement, tabId: string): void {
        container.empty();

        switch (tabId) {
            case 'models':
                this.displayModelManagement(container);
                break;
            case 'chat':
                this.displayChatSettings(container);
                break;
            case 'context':
                this.displayContextSettings(container);
                break;
            case 'export':
                this.displayExportImport(container);
                break;
        }
    }

    private displayModelManagement(container: HTMLElement): void {
        // 使用增强的模型管理组件
        this.modelManagement = new EnhancedModelManagement(this.plugin, container);
        this.modelManagement.display();
    }

    private displayChatSettings(container: HTMLElement): void {
        new Setting(container)
            .setName(t('Chat Behavior'))
            .setHeading();

        // 自动保存对话历史
        new Setting(container)
            .setName(t('Auto-save Chat History'))
            .setDesc(t('Automatically save chat conversations'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.autoSaveChatHistory ?? true)
                .onChange(async (value) => {
                    this.plugin.settings.autoSaveChatHistory = value;
                    await this.plugin.saveSettings();
                }));

        // 对话历史限制
        new Setting(container)
            .setName(t('Chat History Limit'))
            .setDesc(t('Maximum number of messages to keep in history (0 = unlimited)'))
            .addText(text => text
                .setPlaceholder('50')
                .setValue(String(this.plugin.settings.chatHistoryLimit ?? 50))
                .onChange(async (value) => {
                    const limit = parseInt(value) || 50;
                    this.plugin.settings.chatHistoryLimit = limit;
                    await this.plugin.saveSettings();
                }));

        // 显示模型信息
        new Setting(container)
            .setName(t('Show Model Info'))
            .setDesc(t('Display current model information in chat interface'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showModelInfo ?? true)
                .onChange(async (value) => {
                    this.plugin.settings.showModelInfo = value;
                    await this.plugin.saveSettings();
                }));

        // 启用快速模型切换
        new Setting(container)
            .setName(t('Quick Model Switch'))
            .setDesc(t('Enable quick model switching in chat interface'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.quickModelSwitch ?? true)
                .onChange(async (value) => {
                    this.plugin.settings.quickModelSwitch = value;
                    await this.plugin.saveSettings();
                }));

        // 对话模板
        new Setting(container)
            .setName(t('Conversation Templates'))
            .setHeading();

        new Setting(container)
            .setName(t('Default System Prompt'))
            .setDesc(t('Default system prompt for new conversations'))
            .addTextArea(text => text
                .setPlaceholder(t('You are a helpful AI assistant...'))
                .setValue(this.plugin.settings.defaultSystemPrompt || '')
                .onChange(async (value) => {
                    this.plugin.settings.defaultSystemPrompt = value;
                    await this.plugin.saveSettings();
                }));

        // 代码高亮设置
        new Setting(container)
            .setName(t('Code Highlighting'))
            .setDesc(t('Enable syntax highlighting for code in responses'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableCodeHighlighting ?? true)
                .onChange(async (value) => {
                    this.plugin.settings.enableCodeHighlighting = value;
                    await this.plugin.saveSettings();
                }));
    }

    private displayContextSettings(container: HTMLElement): void {
        new Setting(container)
            .setName(t('Context Management'))
            .setHeading();

        // 上下文策略
        new Setting(container)
            .setName(t('Context Strategy'))
            .setDesc(t('How to extract context from documents'))
            .addDropdown(dropdown => {
                const strategies = {
                    'smart': t('Smart (Automatic)'),
                    'paragraph': t('Current Paragraph'),
                    'section': t('Current Section'),
                    'surrounding': t('Surrounding Lines')
                };

                Object.entries(strategies).forEach(([key, value]) => {
                    dropdown.addOption(key, value);
                });

                dropdown.setValue(this.plugin.settings.contextOptions?.strategy || 'smart');
                dropdown.onChange(async (value) => {
                    if (!this.plugin.settings.contextOptions) {
                        this.plugin.settings.contextOptions = {};
                    }
                    this.plugin.settings.contextOptions.strategy = value;
                    await this.plugin.saveSettings();
                    if (container.parentElement) {
                        this.displayTabContent(container.parentElement, 'context');
                    }
                });
            });

        // 包含标题
        new Setting(container)
            .setName(t('Include Document Title'))
            .setDesc(t('Include the document title in context'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.contextOptions?.includeTitle ?? true)
                .onChange(async (value) => {
                    if (!this.plugin.settings.contextOptions) {
                        this.plugin.settings.contextOptions = {};
                    }
                    this.plugin.settings.contextOptions.includeTitle = value;
                    await this.plugin.saveSettings();
                }));

        // 最大上下文长度
        new Setting(container)
            .setName(t('Max Context Length'))
            .setDesc(t('Maximum number of characters to include in context'))
            .addText(text => text
                .setPlaceholder('2000')
                .setValue(String(this.plugin.settings.contextOptions?.maxLength ?? 2000))
                .onChange(async (value) => {
                    if (!this.plugin.settings.contextOptions) {
                        this.plugin.settings.contextOptions = {};
                    }
                    const length = parseInt(value) || 2000;
                    this.plugin.settings.contextOptions.maxLength = length;
                    await this.plugin.saveSettings();
                }));

        // 周围行数（仅在 surrounding 策略下显示）
        if (this.plugin.settings.contextOptions?.strategy === 'surrounding') {
            new Setting(container)
                .setName(t('Surrounding Lines'))
                .setDesc(t('Number of lines to include before and after selection'))
                .addSlider(slider => slider
                    .setLimits(1, 20, 1)
                    .setValue(this.plugin.settings.contextOptions?.surroundingLines ?? 3)
                    .setDynamicTooltip()
                    .onChange(async (value) => {
                        if (!this.plugin.settings.contextOptions) {
                            this.plugin.settings.contextOptions = {};
                        }
                        this.plugin.settings.contextOptions.surroundingLines = value;
                        await this.plugin.saveSettings();
                    }));
        }

        // 高级上下文选项
        new Setting(container)
            .setName(t('Advanced Context Options'))
            .setHeading();

        // 自动检测代码块
        new Setting(container)
            .setName(t('Auto-detect Code Blocks'))
            .setDesc(t('Automatically include complete code blocks in context'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.autoDetectCodeBlocks ?? true)
                .onChange(async (value) => {
                    this.plugin.settings.autoDetectCodeBlocks = value;
                    await this.plugin.saveSettings();
                }));

        // 包含链接文档
        new Setting(container)
            .setName(t('Include Linked Documents'))
            .setDesc(t('Include content from linked documents in context'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.includeLinkedDocs ?? false)
                .onChange(async (value) => {
                    this.plugin.settings.includeLinkedDocs = value;
                    await this.plugin.saveSettings();
                }));
    }

    private displayExportImport(container: HTMLElement): void {
        new Setting(container)
            .setName(t('Configuration Management'))
            .setHeading();

        // 导出配置
        new Setting(container)
            .setName(t('Export Settings'))
            .setDesc(t('Export your model configurations and settings'))
            .addButton(button => button
                .setButtonText(t('Export'))
                .onClick(async () => {
                    try {
                        await this.exportSettings();
                        new Notice(t('Settings exported successfully'));
                    } catch (error) {
                        new Notice(t('Failed to export settings'));
                        console.error('Export error:', error);
                    }
                }));

        // 导入配置
        new Setting(container)
            .setName(t('Import Settings'))
            .setDesc(t('Import model configurations and settings from file'))
            .addButton(button => button
                .setButtonText(t('Import'))
                .onClick(() => {
                    this.importSettings();
                }));

        // 重置设置
        new Setting(container)
            .setName(t('Reset Settings'))
            .setDesc(t('Reset all settings to default values'))
            .addButton(button => button
                .setButtonText(t('Reset'))
                .setWarning()
                .onClick(async () => {
                    const confirmed = await this.showConfirmDialog(
                        t('Reset Settings'),
                        t('Are you sure you want to reset all settings? This action cannot be undone.')
                    );
                    
                    if (confirmed) {
                        await this.resetSettings();
                        new Notice(t('Settings reset successfully'));
                        this.display(); // 重新显示设置页面
                    }
                }));

        // 数据统计
        new Setting(container)
            .setName(t('Usage Statistics'))
            .setHeading();

        const stats = this.getUsageStats();
        const statsContainer = container.createDiv('usage-stats');

        Object.entries(stats).forEach(([key, value]) => {
            const statEl = statsContainer.createDiv('stat-item');
            statEl.createDiv('stat-label', (el) => {
                el.textContent = t(key);
            });
            statEl.createDiv('stat-value', (el) => {
                el.textContent = String(value);
            });
        });

        // 清除统计数据
        new Setting(container)
            .setName(t('Clear Statistics'))
            .setDesc(t('Clear usage statistics and chat history'))
            .addButton(button => button
                .setButtonText(t('Clear'))
                .onClick(async () => {
                    const confirmed = await this.showConfirmDialog(
                        t('Clear Statistics'),
                        t('Are you sure you want to clear all usage statistics and chat history?')
                    );
                    
                    if (confirmed) {
                        await this.clearStatistics();
                        new Notice(t('Statistics cleared successfully'));
                        this.displayTabContent(container, 'export');
                    }
                }));
    }

    private async exportSettings(): Promise<void> {
        const settings = {
            version: '1.0',
            timestamp: Date.now(),
            settings: this.plugin.settings
        };

        const blob = new Blob([JSON.stringify(settings, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hinote-settings-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    private importSettings(): void {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            try {
                const text = await file.text();
                const data = JSON.parse(text);
                
                if (data.settings) {
                    // 合并设置而不是完全替换
                    Object.assign(this.plugin.settings, data.settings);
                    await this.plugin.saveSettings();
                    new Notice(t('Settings imported successfully'));
                    this.display(); // 重新显示设置页面
                } else {
                    new Notice(t('Invalid settings file'));
                }
            } catch (error) {
                new Notice(t('Failed to import settings'));
                console.error('Import error:', error);
            }
        };

        input.click();
    }

    private async resetSettings(): Promise<void> {
        // 重置为默认设置
        this.plugin.settings = this.plugin.getDefaultSettings();
        await this.plugin.saveSettings();
    }

    private getUsageStats(): Record<string, number> {
        return {
            'Total Models': this.plugin.settings.enhancedModels?.length || 0,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            'Active Models': this.plugin.settings.enhancedModels?.filter((m: any) => m.isActive).length || 0,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            'Custom Models': this.plugin.settings.enhancedModels?.filter((m: any) => m.isCustom).length || 0,
            'Total Conversations': this.plugin.settings.chatHistory?.length || 0
        };
    }

    private async clearStatistics(): Promise<void> {
        // 清除统计数据
        delete this.plugin.settings.chatHistory;
        delete this.plugin.settings.usageStats;
        
        // 重置模型使用统计
        if (this.plugin.settings.enhancedModels) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.plugin.settings.enhancedModels.forEach((model: any) => {
                if (model.metadata) {
                    model.metadata.usageCount = 0;
                    delete model.metadata.lastUsed;
                }
            });
        }
        
        await this.plugin.saveSettings();
    }

    private async showConfirmDialog(title: string, message: string): Promise<boolean> {
        return new Promise((resolve) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const modal = new (this.app as any).modal.constructor(this.app);
            modal.titleEl.textContent = title;
            modal.contentEl.textContent = message;
            
            const buttonContainer = modal.contentEl.createDiv('modal-button-container');
            
            const confirmButton = buttonContainer.createEl('button', {
                text: t('Confirm'),
                cls: 'mod-warning'
            });
            confirmButton.onclick = () => {
                resolve(true);
                modal.close();
            };
            
            const cancelButton = buttonContainer.createEl('button', {
                text: t('Cancel')
            });
            cancelButton.onclick = () => {
                resolve(false);
                modal.close();
            };
            
            modal.open();
        });
    }
}