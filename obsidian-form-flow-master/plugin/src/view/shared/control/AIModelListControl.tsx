import React, { useMemo, useState, useEffect, useCallback } from "react";
import { ListBox } from "src/component/list-box/ListBox";
import { localInstance } from "src/i18n/locals";
import { FormFieldType } from "src/model/enums/FormFieldType";
import { IFormField } from "src/model/field/IFormField";
import { AIModelListField } from "src/model/field/AIModelListField";
import { useObsidianApp } from "src/context/obsidianAppContext";
import { AISettingsService } from "src/service/ai/AISettingsService";
import { IAIModelConfig } from "src/model/ai/AIModelConfig";
import { debugManager } from "src/utils/DebugManager";
import { FormFieldValue } from "../../../service/FormValues";

/**
 * AI模型列表控件属性接口
 */
interface Props {
    field: AIModelListField;
    value: FormFieldValue;
    onValueChange: (value: FormFieldValue) => void;
    autoFocus?: boolean;
}

/**
 * AI模型列表控件组件 - 已优化性能
 * 使用React.memo和useCallback减少不必要的重新渲染
 * 添加调试信息追踪性能问题
 */
function AIModelListControl(props: Props) {
    const { value, field, onValueChange, autoFocus } = props;
    const app = useObsidianApp();
    const [aiModels, setAiModels] = useState<IAIModelConfig[]>([]);
    const [loading, setLoading] = useState(true);
    
    debugManager.log('AIModelListControl', 'Component rendering', { fieldId: field.id, value, loading });
    
    if (field.type !== FormFieldType.AI_MODEL_LIST) {
        debugManager.warn('AIModelListControl', 'Invalid field type', { fieldType: field.type });
        return null;
    }
    
    const aiField = field as AIModelListField;
    
    // 异步加载AI模型列表
    useEffect(() => {
        async function loadModels() {
            try {
                debugManager.log('AIModelListControl', 'Loading AI models started');
                const settingsService = new AISettingsService(app);
                const settings = await settingsService.loadSettings();
                const models = settings.models || [];
                debugManager.log('AIModelListControl', 'AI models loaded', { count: models.length });
                setAiModels(models);
            } catch (error) {
                debugManager.error('AIModelListControl', 'Failed to load AI models', error);
                setAiModels([]);
            } finally {
                setLoading(false);
            }
        }
        
        loadModels();
    }, [app]);
    
    // 构建选项列表 - 使用useMemo优化性能
    const options = useMemo(() => {
        debugManager.log('AIModelListControl', 'Building options list', { modelsCount: aiModels.length, showProvider: aiField.showProvider });
        return aiModels.map((model: IAIModelConfig) => ({
            id: model.id,
            label: aiField.showProvider 
                ? `${model.displayName} (${model.provider})` 
                : model.displayName,
            value: model.id,
            group: aiField.showProvider ? model.provider : undefined
        }));
    }, [aiModels, aiField.showProvider]);
    
    // 优化的事件处理函数
    const handleValueChange = useCallback((newValue: string) => {
        debugManager.log('AIModelListControl', 'Value changed', { oldValue: value, newValue });
        onValueChange(newValue);
    }, [onValueChange, value]);
    
    // 如果自动选择第一个且当前没有值或值为特殊标记
    useEffect(() => {
        if ((aiField.autoSelectFirst || value === "__AUTO_SELECT_FIRST__") && aiModels.length > 0 && !loading) {
            const firstModelId = aiModels[0].id;
            debugManager.log('AIModelListControl', 'Auto selecting first model', { modelId: firstModelId });
            onValueChange(firstModelId);
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
            value={typeof value === 'string' ? value : ""}
            onChange={(e) => handleValueChange(e.target.value)}
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

// 使用React.memo优化组件性能，避免不必要的重新渲染
export default React.memo(AIModelListControl, (prevProps, nextProps) => {
    // 自定义比较函数，只在关键属性变化时重新渲染
    return (
        prevProps.value === nextProps.value &&
        prevProps.field.id === nextProps.field.id &&
        prevProps.autoFocus === nextProps.autoFocus &&
        prevProps.onValueChange === nextProps.onValueChange
    );
});
