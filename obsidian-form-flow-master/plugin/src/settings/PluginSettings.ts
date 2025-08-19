import { IAISettings, DEFAULT_AI_SETTINGS } from '../model/ai/AISettings';

export interface PluginSettings {

    formFolder: string;

    scriptFolder: string;

    formIntegrations: FormIntegration;

    aiSettings: IAISettings;
}

export interface FormIntegration {
    [filePath: string]: {
        asCommand?: boolean;
    };
}


export const DEFAULT_SETTINGS: PluginSettings = {
    formFolder: "form/forms",
    scriptFolder: "form/scripts",
    formIntegrations: {},
    aiSettings: DEFAULT_AI_SETTINGS,
};
