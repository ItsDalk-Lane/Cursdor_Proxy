import { Setting } from 'obsidian';
import { t } from '../../i18n';

export interface AIModel {
    id: string;
    name: string;
    isCustom?: boolean;
}

export interface AIServiceSettings {
    display(containerEl: HTMLElement): void;
}

export abstract class BaseAIServiceSettings {
    protected containerEl: HTMLElement;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected plugin: any;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(plugin: any, containerEl: HTMLElement) {
        this.plugin = plugin;
        this.containerEl = containerEl;
    }

    abstract display(containerEl: HTMLElement): void;

    protected createModelDropdown(container: HTMLElement, models: AIModel[], defaultModel: AIModel) {
        new Setting(container)
            .setName(t('Model'))
            .setDesc(t('Select the AI model to use'))
            .addDropdown(dropdown => {
                const options = Object.fromEntries(
                    models.map(model => [model.id, model.name])
                );

                return dropdown
                    .addOptions(options)
                    .setValue(this.plugin.settings.ai.model || defaultModel.id)
                    .onChange(async (value) => {
                        this.plugin.settings.ai.model = value;
                        await this.plugin.saveSettings();
                    });
            });
    }
}
