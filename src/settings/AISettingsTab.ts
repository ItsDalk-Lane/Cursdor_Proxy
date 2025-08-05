import { App, PluginSettingTab, Setting, Notice } from 'obsidian';
import { AIProvider, PluginSettings } from '../types';
import { ChatService } from '../services/ChatService';

export class AISettingsTab extends PluginSettingTab {
    plugin: any;
    private chatService: ChatService;

    constructor(app: App, plugin: any) {
        super(app, plugin);
        this.plugin = plugin;
        this.chatService = new ChatService(plugin);
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        // 标题
        containerEl.createEl('h1', { text: 'AI 对话插件设置' });
        
        // AI 提供商选择
        this.createProviderSection(containerEl);
        
        // 根据选择的提供商显示对应的设置
        this.createProviderSettings(containerEl);
        
        // 连接测试
        this.createConnectionTest(containerEl);
    }

    private createProviderSection(containerEl: HTMLElement) {
        const providerSection = containerEl.createEl('div', { cls: 'setting-section' });
        providerSection.createEl('h2', { text: 'AI 服务提供商' });

        new Setting(providerSection)
            .setName('选择 AI 提供商')
            .setDesc('选择您要使用的 AI 服务提供商')
            .addDropdown(dropdown => {
                dropdown
                    .addOption('openai', 'OpenAI (GPT-4, GPT-3.5)')
                    .addOption('anthropic', 'Anthropic (Claude)')
                    .addOption('gemini', 'Google Gemini')
                    .addOption('deepseek', 'DeepSeek')
                    .addOption('siliconflow', 'SiliconFlow')
                    .addOption('ollama', 'Ollama (本地)')
                    .setValue(this.plugin.settings.ai.provider)
                    .onChange(async (value: AIProvider) => {
                        this.plugin.settings.ai.provider = value;
                        await this.plugin.saveSettings();
                        this.display(); // 重新渲染界面
                    });
            });
    }

    private createProviderSettings(containerEl: HTMLElement) {
        const provider = this.plugin.settings.ai.provider;
        
        switch (provider) {
            case 'openai':
                this.createOpenAISettings(containerEl);
                break;
            case 'anthropic':
                this.createAnthropicSettings(containerEl);
                break;
            case 'gemini':
                this.createGeminiSettings(containerEl);
                break;
            case 'deepseek':
                this.createDeepSeekSettings(containerEl);
                break;
            case 'siliconflow':
                this.createSiliconFlowSettings(containerEl);
                break;
            case 'ollama':
                this.createOllamaSettings(containerEl);
                break;
        }
    }

    private createOpenAISettings(containerEl: HTMLElement) {
        const section = containerEl.createEl('div', { cls: 'setting-section' });
        section.createEl('h2', { text: 'OpenAI 设置' });

        new Setting(section)
            .setName('API 密钥')
            .setDesc('输入您的 OpenAI API 密钥')
            .addText(text => {
                text.inputEl.type = 'password';
                text.setPlaceholder('sk-...')
                    .setValue(this.plugin.settings.ai.openai?.apiKey || '')
                    .onChange(async (value) => {
                        if (!this.plugin.settings.ai.openai) {
                            this.plugin.settings.ai.openai = { apiKey: '', model: 'gpt-4o' };
                        }
                        this.plugin.settings.ai.openai.apiKey = value;
                        await this.plugin.saveSettings();
                    });
            });

        new Setting(section)
            .setName('模型')
            .setDesc('选择要使用的 OpenAI 模型')
            .addDropdown(dropdown => {
                dropdown
                    .addOption('gpt-4o', 'GPT-4o')
                    .addOption('gpt-4o-mini', 'GPT-4o Mini')
                    .addOption('gpt-4', 'GPT-4')
                    .addOption('gpt-3.5-turbo', 'GPT-3.5 Turbo')
                    .setValue(this.plugin.settings.ai.openai?.model || 'gpt-4o')
                    .onChange(async (value) => {
                        if (!this.plugin.settings.ai.openai) {
                            this.plugin.settings.ai.openai = { apiKey: '', model: 'gpt-4o' };
                        }
                        this.plugin.settings.ai.openai.model = value;
                        await this.plugin.saveSettings();
                    });
            });

        new Setting(section)
            .setName('自定义 API 端点 (可选)')
            .setDesc('如果使用自定义的 OpenAI 兼容服务，请输入端点 URL')
            .addText(text => {
                text.setPlaceholder('https://api.openai.com/v1/chat/completions')
                    .setValue(this.plugin.settings.ai.openai?.baseUrl || '')
                    .onChange(async (value) => {
                        if (!this.plugin.settings.ai.openai) {
                            this.plugin.settings.ai.openai = { apiKey: '', model: 'gpt-4o' };
                        }
                        this.plugin.settings.ai.openai.baseUrl = value;
                        await this.plugin.saveSettings();
                    });
            });
    }

    private createAnthropicSettings(containerEl: HTMLElement) {
        const section = containerEl.createEl('div', { cls: 'setting-section' });
        section.createEl('h2', { text: 'Anthropic 设置' });

        new Setting(section)
            .setName('API 密钥')
            .setDesc('输入您的 Anthropic API 密钥')
            .addText(text => {
                text.inputEl.type = 'password';
                text.setPlaceholder('sk-ant-api...')
                    .setValue(this.plugin.settings.ai.anthropic?.apiKey || '')
                    .onChange(async (value) => {
                        if (!this.plugin.settings.ai.anthropic) {
                            this.plugin.settings.ai.anthropic = { apiKey: '', model: 'claude-3-sonnet-20240229' };
                        }
                        this.plugin.settings.ai.anthropic.apiKey = value;
                        await this.plugin.saveSettings();
                    });
            });

        new Setting(section)
            .setName('模型')
            .setDesc('选择要使用的 Claude 模型')
            .addDropdown(dropdown => {
                dropdown
                    .addOption('claude-3-opus-20240229', 'Claude 3 Opus')
                    .addOption('claude-3-sonnet-20240229', 'Claude 3 Sonnet')
                    .addOption('claude-3-haiku-20240307', 'Claude 3 Haiku')
                    .setValue(this.plugin.settings.ai.anthropic?.model || 'claude-3-sonnet-20240229')
                    .onChange(async (value) => {
                        if (!this.plugin.settings.ai.anthropic) {
                            this.plugin.settings.ai.anthropic = { apiKey: '', model: 'claude-3-sonnet-20240229' };
                        }
                        this.plugin.settings.ai.anthropic.model = value;
                        await this.plugin.saveSettings();
                    });
            });
    }

    private createGeminiSettings(containerEl: HTMLElement) {
        const section = containerEl.createEl('div', { cls: 'setting-section' });
        section.createEl('h2', { text: 'Google Gemini 设置' });

        new Setting(section)
            .setName('API 密钥')
            .setDesc('输入您的 Google AI Studio API 密钥')
            .addText(text => {
                text.inputEl.type = 'password';
                text.setPlaceholder('AI...')
                    .setValue(this.plugin.settings.ai.gemini?.apiKey || '')
                    .onChange(async (value) => {
                        if (!this.plugin.settings.ai.gemini) {
                            this.plugin.settings.ai.gemini = { apiKey: '', model: 'gemini-pro' };
                        }
                        this.plugin.settings.ai.gemini.apiKey = value;
                        await this.plugin.saveSettings();
                    });
            });

        new Setting(section)
            .setName('模型')
            .setDesc('选择要使用的 Gemini 模型')
            .addDropdown(dropdown => {
                dropdown
                    .addOption('gemini-pro', 'Gemini Pro')
                    .addOption('gemini-1.5-pro', 'Gemini 1.5 Pro')
                    .addOption('gemini-1.5-flash', 'Gemini 1.5 Flash')
                    .setValue(this.plugin.settings.ai.gemini?.model || 'gemini-pro')
                    .onChange(async (value) => {
                        if (!this.plugin.settings.ai.gemini) {
                            this.plugin.settings.ai.gemini = { apiKey: '', model: 'gemini-pro' };
                        }
                        this.plugin.settings.ai.gemini.model = value;
                        await this.plugin.saveSettings();
                    });
            });
    }

    private createDeepSeekSettings(containerEl: HTMLElement) {
        const section = containerEl.createEl('div', { cls: 'setting-section' });
        section.createEl('h2', { text: 'DeepSeek 设置' });

        new Setting(section)
            .setName('API 密钥')
            .setDesc('输入您的 DeepSeek API 密钥')
            .addText(text => {
                text.inputEl.type = 'password';
                text.setPlaceholder('sk-...')
                    .setValue(this.plugin.settings.ai.deepseek?.apiKey || '')
                    .onChange(async (value) => {
                        if (!this.plugin.settings.ai.deepseek) {
                            this.plugin.settings.ai.deepseek = { apiKey: '', model: 'deepseek-chat' };
                        }
                        this.plugin.settings.ai.deepseek.apiKey = value;
                        await this.plugin.saveSettings();
                    });
            });

        new Setting(section)
            .setName('模型')
            .setDesc('选择要使用的 DeepSeek 模型')
            .addDropdown(dropdown => {
                dropdown
                    .addOption('deepseek-chat', 'DeepSeek Chat')
                    .addOption('deepseek-reasoner', 'DeepSeek Reasoner')
                    .setValue(this.plugin.settings.ai.deepseek?.model || 'deepseek-chat')
                    .onChange(async (value) => {
                        if (!this.plugin.settings.ai.deepseek) {
                            this.plugin.settings.ai.deepseek = { apiKey: '', model: 'deepseek-chat' };
                        }
                        this.plugin.settings.ai.deepseek.model = value;
                        await this.plugin.saveSettings();
                    });
            });
    }

    private createSiliconFlowSettings(containerEl: HTMLElement) {
        const section = containerEl.createEl('div', { cls: 'setting-section' });
        section.createEl('h2', { text: 'SiliconFlow 设置' });

        new Setting(section)
            .setName('API 密钥')
            .setDesc('输入您的 SiliconFlow API 密钥')
            .addText(text => {
                text.inputEl.type = 'password';
                text.setPlaceholder('sk-...')
                    .setValue(this.plugin.settings.ai.siliconflow?.apiKey || '')
                    .onChange(async (value) => {
                        if (!this.plugin.settings.ai.siliconflow) {
                            this.plugin.settings.ai.siliconflow = { apiKey: '', model: 'deepseek-ai/DeepSeek-V2.5' };
                        }
                        this.plugin.settings.ai.siliconflow.apiKey = value;
                        await this.plugin.saveSettings();
                    });
            });

        new Setting(section)
            .setName('模型')
            .setDesc('选择要使用的 SiliconFlow 模型')
            .addDropdown(dropdown => {
                dropdown
                    .addOption('deepseek-ai/DeepSeek-V2.5', 'DeepSeek V2.5')
                    .addOption('Qwen/Qwen2.5-7B-Instruct', 'Qwen2.5 7B')
                    .addOption('meta-llama/Meta-Llama-3.1-8B-Instruct', 'Llama 3.1 8B')
                    .setValue(this.plugin.settings.ai.siliconflow?.model || 'deepseek-ai/DeepSeek-V2.5')
                    .onChange(async (value) => {
                        if (!this.plugin.settings.ai.siliconflow) {
                            this.plugin.settings.ai.siliconflow = { apiKey: '', model: 'deepseek-ai/DeepSeek-V2.5' };
                        }
                        this.plugin.settings.ai.siliconflow.model = value;
                        await this.plugin.saveSettings();
                    });
            });
    }

    private createOllamaSettings(containerEl: HTMLElement) {
        const section = containerEl.createEl('div', { cls: 'setting-section' });
        section.createEl('h2', { text: 'Ollama 设置' });

        new Setting(section)
            .setName('服务器地址')
            .setDesc('Ollama 服务器的地址')
            .addText(text => {
                text.setPlaceholder('http://localhost:11434')
                    .setValue(this.plugin.settings.ai.ollama?.host || 'http://localhost:11434')
                    .onChange(async (value) => {
                        if (!this.plugin.settings.ai.ollama) {
                            this.plugin.settings.ai.ollama = { host: 'http://localhost:11434', model: '' };
                        }
                        this.plugin.settings.ai.ollama.host = value;
                        await this.plugin.saveSettings();
                    });
            });

        new Setting(section)
            .setName('模型名称')
            .setDesc('要使用的 Ollama 模型名称 (如: llama2, mistral)')
            .addText(text => {
                text.setPlaceholder('llama2')
                    .setValue(this.plugin.settings.ai.ollama?.model || '')
                    .onChange(async (value) => {
                        if (!this.plugin.settings.ai.ollama) {
                            this.plugin.settings.ai.ollama = { host: 'http://localhost:11434', model: '' };
                        }
                        this.plugin.settings.ai.ollama.model = value;
                        await this.plugin.saveSettings();
                    });
            });
    }

    private createConnectionTest(containerEl: HTMLElement) {
        const section = containerEl.createEl('div', { cls: 'setting-section' });
        section.createEl('h2', { text: '连接测试' });

        const testContainer = section.createEl('div', { cls: 'connection-test-container' });
        
        new Setting(testContainer)
            .setName('测试连接')
            .setDesc('测试当前 AI 服务配置是否正常工作')
            .addButton(button => {
                button
                    .setButtonText('测试连接')
                    .setCta()
                    .onClick(async () => {
                        button.setButtonText('测试中...');
                        button.setDisabled(true);
                        
                        try {
                            const isConnected = await this.chatService.testConnection();
                            if (isConnected) {
                                new Notice('✅ 连接测试成功！');
                                button.setButtonText('连接成功');
                            } else {
                                new Notice('❌ 连接测试失败，请检查配置');
                                button.setButtonText('连接失败');
                            }
                        } catch (error) {
                            console.error('Connection test error:', error);
                            new Notice('❌ 连接测试失败，请检查配置');
                            button.setButtonText('连接失败');
                        }
                        
                        setTimeout(() => {
                            button.setButtonText('测试连接');
                            button.setDisabled(false);
                        }, 2000);
                    });
            });
    }
}
