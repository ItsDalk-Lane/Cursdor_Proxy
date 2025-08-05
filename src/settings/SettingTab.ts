import { App, PluginSettingTab } from 'obsidian';
import { AIServiceTab } from './AIServiceTab';

export class HighlightSettingTab extends PluginSettingTab {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin: any;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(app: App, plugin: any) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        new AIServiceTab(this.plugin, containerEl).display();
    }
}

export class AISettingTab extends PluginSettingTab {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin: any;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(app: App, plugin: any) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        new AIServiceTab(this.plugin, containerEl).display();
    }
}
