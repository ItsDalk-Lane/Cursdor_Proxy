import { IAIModelConfig } from "./AIModelConfig";

export interface IAISettings {
    models: IAIModelConfig[];
    promptTemplateFolder: string;
    enableSystemPrompt: boolean;
    systemPrompt: string;
}

export const DEFAULT_AI_SETTINGS: IAISettings = {
    models: [],
    promptTemplateFolder: "form/prompts",
    enableSystemPrompt: false,
    systemPrompt: "You are a helpful AI assistant. Please provide accurate and helpful responses."
};
