import { Setting } from 'obsidian';
import { AIProvider } from '../types';
import { t } from '../i18n';
import { OpenAISettings } from './ai/OpenAISettings';
import { AnthropicSettings } from './ai/AnthropicSettings';
import { DeepseekSettings } from './ai/DeepseekSettings';
import { GeminiSettings } from './ai/GeminiSettings';
import { OllamaSettings } from './ai/OllamaSettings';
import { SiliconFlowSettings } from './ai/SiliconFlowSettings';

export class AIServiceTab {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private plugin: any;
    private containerEl: HTMLElement;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(plugin: any, containerEl: HTMLElement) {
        this.plugin = plugin;
        this.containerEl = containerEl;
    }

    display(): void {
        // AI 服务设置
        new Setting(this.containerEl)
            .setName(t('AI service'))
            .setDesc(t('Select the AI service provider'))
            .addDropdown(dropdown => {
                const options: Record<AIProvider, string> = {
                    'openai': 'OpenAI',
                    'gemini': 'Gemini',
                    'anthropic': 'Anthropic',
                    'deepseek': 'Deepseek',
                    'siliconflow': 'SiliconFlow',
                    'ollama': 'Ollama (Local)'
                };

                return dropdown
                    .addOptions(options)
                    .setValue(this.plugin.settings.ai.provider)
                    .onChange(async (value: AIProvider) => {
                        this.plugin.settings.ai.provider = value;
                        await this.plugin.saveSettings();
                        // 重新显示设置
                        this.containerEl.empty();
                        this.display();
                    });
            });

        // 根据选择的服务显示相应的设置
        switch (this.plugin.settings.ai.provider) {
            case 'openai':
                new OpenAISettings(this.plugin, this.containerEl).display(this.containerEl);
                break;
            case 'gemini':
                new GeminiSettings(this.plugin, this.containerEl).display(this.containerEl);
                break;
            case 'anthropic':
                new AnthropicSettings(this.plugin, this.containerEl).display(this.containerEl);
                break;
            case 'ollama':
                new OllamaSettings(this.plugin, this.containerEl).display(this.containerEl);
                break;
            case 'deepseek':
                new DeepseekSettings(this.plugin, this.containerEl).display(this.containerEl);
                break;
            case 'siliconflow':
                new SiliconFlowSettings(this.plugin, this.containerEl).display(this.containerEl);
                break;
        }
    }
}
