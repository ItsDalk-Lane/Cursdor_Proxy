import { Plugin } from 'obsidian';
import { EnhancedAISettingTab } from './src/settings/SimpleEnhancedAISettingTab';
import { PluginSettings, DEFAULT_SETTINGS } from './src/types';
import { ChatView } from './src/components/ChatView';
import { t } from './src/i18n';

export default class ChatPlugin extends Plugin {
	settings: PluginSettings;

	async onload() {
		// 加载设置
		const loadedData = await this.loadData();
		this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedData);

		// 添加设置标签页 - 使用新的增强设置标签页
		this.addSettingTab(new EnhancedAISettingTab(this.app, this));

		// 添加打开对话窗口的命令
		this.addCommand({
			id: 'open-chat-window',
			name: t('Open AI chat window'),
			callback: () => {
				const chatView = ChatView.getInstance(this.app, this);
				chatView.show();
			}
		});

		// 添加工具栏按钮
		this.addRibbonIcon(
			'bot-message-square',
			'AI 对话',
			() => {
				const chatView = ChatView.getInstance(this.app, this);
				chatView.show();
			}
		);
	}

	async onunload() {
		// 如果对话窗口打开，关闭它
		if (ChatView.instance) {
			ChatView.instance.close();
		}
	}

	async loadSettings() {
        const loadedData = await this.loadData();
        
        // 初始化设置
        if (!this.settings) {
            this.settings = {
                ai: {
                    provider: DEFAULT_SETTINGS.ai.provider,
                    openai: DEFAULT_SETTINGS.ai.openai ? { ...DEFAULT_SETTINGS.ai.openai } : undefined,
                    anthropic: DEFAULT_SETTINGS.ai.anthropic ? { ...DEFAULT_SETTINGS.ai.anthropic } : undefined,
                    gemini: DEFAULT_SETTINGS.ai.gemini ? { ...DEFAULT_SETTINGS.ai.gemini } : undefined,
                    ollama: DEFAULT_SETTINGS.ai.ollama ? { ...DEFAULT_SETTINGS.ai.ollama } : undefined,
                    deepseek: DEFAULT_SETTINGS.ai.deepseek ? { ...DEFAULT_SETTINGS.ai.deepseek } : undefined,
                    siliconflow: DEFAULT_SETTINGS.ai.siliconflow ? { ...DEFAULT_SETTINGS.ai.siliconflow } : undefined
                }
            };
        }

        if (loadedData?.ai) {
            // 分别合并每个服务提供商的设置
            if (loadedData.ai.provider) {
                this.settings.ai.provider = loadedData.ai.provider;
            }
            if (loadedData.ai.openai && this.settings.ai.openai) {
                this.settings.ai.openai = {
                    apiKey: loadedData.ai.openai.apiKey || this.settings.ai.openai.apiKey,
                    model: loadedData.ai.openai.model || this.settings.ai.openai.model,
                    baseUrl: loadedData.ai.openai.baseUrl
                };
            }
            if (loadedData.ai.anthropic && this.settings.ai.anthropic) {
                this.settings.ai.anthropic = {
                    apiKey: loadedData.ai.anthropic.apiKey || this.settings.ai.anthropic.apiKey,
                    model: loadedData.ai.anthropic.model || this.settings.ai.anthropic.model,
                    availableModels: loadedData.ai.anthropic.availableModels,
                    apiAddress: loadedData.ai.anthropic.apiAddress || loadedData.ai.anthropic.baseUrl,
                    isCustomModel: loadedData.ai.anthropic.isCustomModel || false,
                    lastCustomModel: loadedData.ai.anthropic.lastCustomModel || ''
                };
            }
            if (loadedData.ai.gemini && this.settings.ai.gemini) {
                this.settings.ai.gemini = {
                    apiKey: loadedData.ai.gemini.apiKey || this.settings.ai.gemini.apiKey,
                    model: loadedData.ai.gemini.model || this.settings.ai.gemini.model,
                    baseUrl: loadedData.ai.gemini.baseUrl,
                    isCustomModel: loadedData.ai.gemini.isCustomModel || false
                };
            }
            if (loadedData.ai.ollama && this.settings.ai.ollama) {
                this.settings.ai.ollama = {
                    host: loadedData.ai.ollama.host || this.settings.ai.ollama.host,
                    model: loadedData.ai.ollama.model || this.settings.ai.ollama.model,
                    availableModels: loadedData.ai.ollama.availableModels
                };
            }
            if (loadedData.ai.deepseek && this.settings.ai.deepseek) {
                this.settings.ai.deepseek = {
                    apiKey: loadedData.ai.deepseek.apiKey || this.settings.ai.deepseek.apiKey,
                    model: loadedData.ai.deepseek.model || this.settings.ai.deepseek.model,
                    baseUrl: loadedData.ai.deepseek.baseUrl
                };
            }
            if (loadedData.ai.siliconflow && this.settings.ai.siliconflow) {
                this.settings.ai.siliconflow = {
                    apiKey: loadedData.ai.siliconflow.apiKey || this.settings.ai.siliconflow.apiKey,
                    model: loadedData.ai.siliconflow.model || this.settings.ai.siliconflow.model,
                    baseUrl: loadedData.ai.siliconflow.baseUrl,
                    isCustomModel: loadedData.ai.siliconflow.isCustomModel || false,
                    lastCustomModel: loadedData.ai.siliconflow.lastCustomModel || ''
                };
            }
        }

        await this.saveSettings();
    }

    async saveSettings() {
        // 确保基础设置存在
        if (!this.settings) {
            this.settings = { ...DEFAULT_SETTINGS };
        }

        // 确保 AI 设置存在
        if (!this.settings.ai) {
            this.settings.ai = { ...DEFAULT_SETTINGS.ai };
        }

        // 确保每个 AI 服务提供商的设置都存在并有默认值
        if (!this.settings.ai.openai) {
            this.settings.ai.openai = {
                apiKey: '',
                model: DEFAULT_SETTINGS.ai.openai?.model || 'gpt-4o',
                baseUrl: DEFAULT_SETTINGS.ai.openai?.baseUrl
            };
        }
        if (!this.settings.ai.anthropic) {
            this.settings.ai.anthropic = {
                apiKey: '',
                model: 'claude-2',
                availableModels: DEFAULT_SETTINGS.ai.anthropic?.availableModels,
                apiAddress: DEFAULT_SETTINGS.ai.anthropic?.apiAddress,
                isCustomModel: false,
                lastCustomModel: ''
            };
        }
        if (!this.settings.ai.gemini) {
            this.settings.ai.gemini = {
                apiKey: '',
                model: 'gemini-1.5-flash',
                isCustomModel: false,
                baseUrl: DEFAULT_SETTINGS.ai.gemini?.baseUrl
            };
        }
        if (!this.settings.ai.ollama) {
            this.settings.ai.ollama = {
                host: 'http://localhost:11434',
                model: '',
                availableModels: DEFAULT_SETTINGS.ai.ollama?.availableModels
            };
        }
        if (!this.settings.ai.deepseek) {
            this.settings.ai.deepseek = {
                apiKey: '',
                model: 'deepseek-chat',
                baseUrl: DEFAULT_SETTINGS.ai.deepseek?.baseUrl
            };
        }
        if (!this.settings.ai.siliconflow) {
            this.settings.ai.siliconflow = {
                apiKey: '',
                model: 'deepseek-ai/DeepSeek-V2.5',
                baseUrl: DEFAULT_SETTINGS.ai.siliconflow?.baseUrl,
                isCustomModel: false,
                lastCustomModel: ''
            };
        }
        
        await this.saveData(this.settings);
    }

    // 获取当前活跃的模型配置
    getCurrentModelConfig() {
        // 如果启用了多模型管理
        if (this.settings.enableMultiModel && this.settings.multiModels) {
            const activeModel = this.settings.multiModels.find((m: any) => m.isActive);
            if (activeModel) {
                return {
                    provider: activeModel.provider,
                    ...activeModel.config
                };
            }
        }
        
        // 回退到传统单一模型配置
        const currentProvider = this.settings.ai.provider;
        const providerConfig = this.settings.ai[currentProvider];
        
        return {
            provider: currentProvider,
            ...providerConfig
        };
    }
}
