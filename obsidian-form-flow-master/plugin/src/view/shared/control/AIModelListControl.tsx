import React, { useMemo, useState, useEffect } from "react";
import { ListBox } from "src/component/list-box/ListBox";
import { localInstance } from "src/i18n/locals";
import { FormFieldType } from "src/model/enums/FormFieldType";
import { IFormField } from "src/model/field/IFormField";
import { AIModelListField } from "src/model/field/AIModelListField";
import { useObsidianApp } from "src/context/obsidianAppContext";
import { AISettingsService } from "src/service/ai/AISettingsService";
import { IAIModelConfig } from "src/model/ai/AIModelConfig";

export default function AIModelListControl(props: {
    field: IFormField;
    value: any;
    onValueChange: (value: any) => void;
    autoFocus?: boolean;
}) {
    const { value, field, onValueChange, autoFocus } = props;
    const app = useObsidianApp();
    const [aiModels, setAiModels] = useState<IAIModelConfig[]>([]);
    const [loading, setLoading] = useState(true);
    
    if (field.type !== FormFieldType.AI_MODEL_LIST) {
        return null;
    }
    
    const aiField = field as AIModelListField;
    
    // 异步加载AI模型列表
    useEffect(() => {
        async function loadModels() {
            try {
    
                const settingsService = new AISettingsService(app);
                const settings = await settingsService.loadSettings();
                //
                setAiModels(settings.models || []);
            } catch (error) {
                console.error("Failed to load AI models:", error);
                setAiModels([]);
            } finally {
                setLoading(false);
            }
        }
        
        loadModels();
    }, [app]);
    
    // 构建选项列表
    const options = useMemo(() => {
        return aiModels.map((model: IAIModelConfig) => ({
            id: model.id,
            label: aiField.showProvider 
                ? `${model.displayName} (${model.provider})` 
                : model.displayName,
            value: model.id,
            group: aiField.showProvider ? model.provider : undefined
        }));
    }, [aiModels, aiField.showProvider]);
    
    // 如果自动选择第一个且当前没有值或值为特殊标记
    useEffect(() => {
        if ((aiField.autoSelectFirst || value === "__AUTO_SELECT_FIRST__") && aiModels.length > 0 && !loading) {
            
            onValueChange(aiModels[0].id);
        }
    }, [aiModels, value, aiField.autoSelectFirst, loading, onValueChange]);
    
    if (loading) {
        return (
            <div className="form--no-ai-models">
                <span>加载AI模型列表中...</span>
            </div>
        );
    }
    
    if (aiModels.length === 0) {
        return (
            <div className="form--no-ai-models">
                <span>{localInstance.no_ai_models_available}</span>
            </div>
        );
    }
    
    return (
        <select
            id={field.id}
            data-name={field.label}
            className="dropdown"
            value={value || ""}
            onChange={(e) => {
                onValueChange(e.target.value);
            }}
            autoFocus={autoFocus}
        >
            <option value="">
                {localInstance.please_select_option}
            </option>
            {aiModels.map((model) => (
                <option key={model.id} value={model.id}>
                    {aiField.showProvider 
                        ? `${model.displayName} (${model.provider})` 
                        : model.displayName}
                </option>
            ))}
        </select>
    );
}
