import { Edit, Trash2 } from "lucide-react";
import { IAIModelConfig, AI_PROVIDER_CONFIGS } from "../../model/ai/AIModelConfig";
import { localInstance } from "../../i18n/locals";

interface AIModelListProps {
    models: IAIModelConfig[];
    onEdit: (model: IAIModelConfig) => void;
    onDelete: (modelId: string) => void;
}

export function AIModelList({ models, onEdit, onDelete }: AIModelListProps) {
    if (models.length === 0) {
        return (
            <div className="ai-no-models">
                {localInstance.no_ai_models_available}
            </div>
        );
    }

    const formatTokens = (tokens: number): string => {
        if (tokens >= 1000000) {
            return `${(tokens / 1000000).toFixed(1)}M`;
        } else if (tokens >= 1000) {
            return `${(tokens / 1000).toFixed(1)}K`;
        }
        return tokens.toString();
    };

    return (
        <div className="ai-model-list">
            {models.map((model) => {
                const providerConfig = AI_PROVIDER_CONFIGS[model.provider];
                
                return (
                    <div key={model.id} className="ai-model-item">
                        <div>
                            <div className="ai-model-name">{model.displayName}</div>
                            <div className="ai-model-details">
                                <span className="ai-model-type">{model.modelName}</span> • <span className="ai-model-provider">{providerConfig.name}</span>
                            </div>
                        </div>
                        
                        <div className="ai-context-info">
                            {formatTokens(model.maxContextLength)}
                        </div>
                        
                        <div className="ai-context-info">
                            {formatTokens(model.maxOutputTokens)}
                        </div>
                        

                        
                        <div className="ai-verification-status">
                            {model.verified ? (
                                <span className="ai-verification-success">
                                    {localInstance.ai_model_verified}
                                </span>
                            ) : (
                                <span className="ai-verification-error">
                                    {localInstance.ai_model_verification_failed}
                                </span>
                            )}
                        </div>
                        
                        <div className="ai-model-actions">
                            <button 
                                className="edit-btn"
                                onClick={() => onEdit(model)}
                                title={localInstance.edit}
                            >
                                <Edit size={14} />
                            </button>
                            <button 
                                className="delete-btn"
                                onClick={() => onDelete(model.id)}
                                title={localInstance.delete}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
