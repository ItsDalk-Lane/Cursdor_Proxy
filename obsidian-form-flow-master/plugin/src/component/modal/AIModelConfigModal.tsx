import { useState, useEffect } from "react";
import { X, RotateCcw } from "lucide-react";
import { IAIModelConfig, AIProvider, AI_PROVIDER_CONFIGS, DEFAULT_ADVANCED_SETTINGS } from "../../model/ai/AIModelConfig";
import { AIModelValidationService } from "../../service/ai/AIModelValidationService";
import { localInstance } from "../../i18n/locals";
import { v4 as uuidv4 } from "uuid";

interface AIModelConfigModalProps {
    model?: IAIModelConfig | null;
    onSave: (model: IAIModelConfig) => void;
    onCancel: () => void;
}

export function AIModelConfigModal({ model, onSave, onCancel }: AIModelConfigModalProps) {
    const isEditing = !!model;
    
    const [formData, setFormData] = useState<IAIModelConfig>(() => {
        if (model) {
            // 编辑模式：基于现有模型初始化
            console.log('编辑模式初始化，原模型数据:', model);
            return {
                ...model,
                updatedAt: Date.now()
            };
        } else {
            // 新建模式：使用默认值
            console.log('新建模式初始化');
            return {
                id: uuidv4(),
                displayName: "",
                modelName: "",
                provider: AIProvider.DEEPSEEK,
                baseUrl: AI_PROVIDER_CONFIGS[AIProvider.DEEPSEEK].baseUrl,
                apiKey: "",
                maxContextLength: 32000,
                maxOutputTokens: 8000,
                advancedSettings: { ...DEFAULT_ADVANCED_SETTINGS },
                capabilities: { reasoning: false, webSearch: false },
                verified: false,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
        }
    });

    const [showAdvanced, setShowAdvanced] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [verificationResult, setVerificationResult] = useState<string | null>(null);

    // 当提供商改变时自动设置默认URL（仅在新建模式下）
    useEffect(() => {
        if (!isEditing && formData.provider !== AIProvider.CUSTOM) {
            const providerConfig = AI_PROVIDER_CONFIGS[formData.provider];
            setFormData(prev => ({
                ...prev,
                baseUrl: providerConfig.baseUrl,
                modelName: providerConfig.defaultModel
            }));
        } else if (!isEditing && formData.provider === AIProvider.CUSTOM) {
            // 自定义提供商时清空默认模型名
            setFormData(prev => ({
                ...prev,
                baseUrl: "",
                modelName: ""
            }));
        }
    }, [formData.provider, isEditing]);

    const handleInputChange = (field: keyof IAIModelConfig, value: any) => {
        console.log(`字段更新: ${String(field)} = ${value}`);
        setFormData(prev => {
            const newData = {
                ...prev,
                [field]: value,
                updatedAt: Date.now()
            };
            console.log('更新后的formData:', newData);
            return newData;
        });
    };

    const handleAdvancedChange = (field: string, value: number) => {
        setFormData(prev => ({
            ...prev,
            advancedSettings: {
                ...prev.advancedSettings!,
                [field]: value
            },
            updatedAt: Date.now()
        }));
    };

    const resetAdvancedSetting = (field: string) => {
        const defaultValue = DEFAULT_ADVANCED_SETTINGS[field as keyof typeof DEFAULT_ADVANCED_SETTINGS];
        handleAdvancedChange(field, defaultValue);
    };

    const handleVerifyModel = async () => {
        setVerifying(true);
        setVerificationResult(null);
        
        try {
            // 使用当前表单数据进行验证，包括用户可能输入的新密钥
            const modelToVerify = { ...formData };
            
            // 如果在编辑模式且用户没有输入新密钥，使用原有密钥进行验证
            if (isEditing && !modelToVerify.apiKey.trim() && model?.apiKey) {
                modelToVerify.apiKey = model.apiKey;
            }
            
            if (!modelToVerify.apiKey.trim()) {
                setVerificationResult("请先输入API密钥");
                setVerifying(false);
                return;
            }
            
            const result = await AIModelValidationService.validateModel(modelToVerify);
            
            setFormData(prev => ({
                ...prev,
                verified: result.success,
                capabilities: result.capabilities,
                updatedAt: Date.now()
            }));
            
            setVerificationResult(result.message);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "验证失败";
            setVerificationResult(errorMessage);
            setFormData(prev => ({ 
                ...prev, 
                verified: false,
                capabilities: { reasoning: false, webSearch: false },
                updatedAt: Date.now()
            }));
        } finally {
            setVerifying(false);
        }
    };

    const handleSave = async () => {
        console.log('=== 开始保存模型配置 ===');
        console.log('isEditing:', isEditing);
        console.log('原始model:', model);
        console.log('当前formData:', formData);
        
        // 基本验证
        if (!formData.displayName.trim()) {
            alert(localInstance.please_input_name);
            return;
        }
        if (!formData.modelName.trim()) {
            alert("请输入模型型号");
            return;
        }
        if (!formData.apiKey.trim() && (!isEditing || !model?.apiKey)) {
            alert("请输入API密钥");
            return;
        }

        // 准备最终数据
        const finalData = { ...formData };
        
        // 对于编辑模式，如果API密钥为空但原模型有密钥，保持原有密钥
        if (isEditing && !finalData.apiKey.trim() && model?.apiKey) {
            finalData.apiKey = model.apiKey;
            console.log('使用原有密钥');
        }
        
        // 确保更新时间
        finalData.updatedAt = Date.now();
        
        // 如果是新建模型，确保创建时间
        if (!isEditing) {
            finalData.createdAt = Date.now();
        }

        console.log('=== 最终保存的数据 ===', finalData);
        console.log('准备调用onSave函数');
        onSave(finalData);
    };

    return (
        <div className="ai-model-config-modal" onClick={(e) => e.target === e.currentTarget && onCancel()}>
            <div className="ai-model-config-content">
                <div className="ai-model-config-header">
                    <h3>{isEditing ? "编辑AI模型" : localInstance.ai_add_model}</h3>
                    <button onClick={onCancel}>
                        <X size={20} />
                    </button>
                </div>

                <div className="ai-model-config-form">
                    {/* 显示名称 */}
                    <div className="ai-form-group">
                        <label>{localInstance.ai_model_display_name}</label>
                        <input
                            type="text"
                            value={formData.displayName}
                            onChange={(e) => handleInputChange('displayName', e.target.value)}
                            placeholder="给这个模型取个名字..."
                        />
                    </div>

                    {/* 模型型号 */}
                    <div className="ai-form-group">
                        <label>{localInstance.ai_model_name}</label>
                        <input
                            type="text"
                            value={formData.modelName}
                            onChange={(e) => handleInputChange('modelName', e.target.value)}
                            placeholder="模型的具体型号..."
                        />
                    </div>

                    {/* AI提供商 */}
                    <div className="ai-form-group">
                        <label>{localInstance.ai_provider}</label>
                        <select
                            value={formData.provider}
                            onChange={(e) => handleInputChange('provider', e.target.value as AIProvider)}
                        >
                            {Object.entries(AI_PROVIDER_CONFIGS).map(([key, config]) => (
                                <option key={key} value={key}>
                                    {config.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 基础URL */}
                    <div className="ai-form-group">
                        <label>{localInstance.ai_base_url}</label>
                        <input
                            type="url"
                            value={formData.baseUrl}
                            onChange={(e) => handleInputChange('baseUrl', e.target.value)}
                            placeholder="API基础地址..."
                            disabled={formData.provider !== AIProvider.CUSTOM}
                        />
                    </div>

                    {/* API密钥 */}
                    <div className="ai-form-group">
                        <label>{localInstance.ai_api_key}</label>
                        <input
                            type="password"
                            value={formData.apiKey}
                            onChange={(e) => handleInputChange('apiKey', e.target.value)}
                            placeholder={model ? "密钥已保存，如需修改请输入新密钥..." : "请输入API密钥..."}
                        />
                    </div>

                    {/* 最大上下文长度 */}
                    <div className="ai-form-group">
                        <label>{localInstance.ai_max_context_length}</label>
                        <input
                            type="number"
                            value={formData.maxContextLength}
                            onChange={(e) => handleInputChange('maxContextLength', parseInt(e.target.value) || 0)}
                            min="1000"
                            max="1000000"
                        />
                    </div>

                    {/* 最大输出令牌数 */}
                    <div className="ai-form-group">
                        <label>{localInstance.ai_max_output_tokens}</label>
                        <input
                            type="number"
                            value={formData.maxOutputTokens}
                            onChange={(e) => handleInputChange('maxOutputTokens', parseInt(e.target.value) || 0)}
                            min="100"
                            max="100000"
                        />
                    </div>

                    {/* 模型能力设置 */}
                    <div className="ai-form-group">
                        <label>模型能力</label>
                        <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'normal' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.capabilities.reasoning}
                                    onChange={(e) => handleInputChange('capabilities', {
                                        ...formData.capabilities,
                                        reasoning: e.target.checked
                                    })}
                                />
                                推理能力
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'normal' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.capabilities.webSearch}
                                    onChange={(e) => handleInputChange('capabilities', {
                                        ...formData.capabilities,
                                        webSearch: e.target.checked
                                    })}
                                />
                                联网搜索
                            </label>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                            可手动设置或通过验证自动检测
                        </div>
                    </div>

                    {/* 高级设置 */}
                    <div className="ai-advanced-settings">
                        <div className="ai-advanced-header">
                            <label>{localInstance.ai_advanced_settings}</label>
                            <input
                                type="checkbox"
                                checked={showAdvanced}
                                onChange={(e) => setShowAdvanced(e.target.checked)}
                            />
                        </div>

                        {showAdvanced && (
                            <div className="ai-advanced-controls">
                                {/* 温度 */}
                                <div className="ai-form-group">
                                    <label>{localInstance.ai_temperature}</label>
                                    <div className="ai-parameter-info">控制输出的随机性，值越高越随机</div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <input
                                        type="number"
                                        value={formData.advancedSettings?.temperature || 0.7}
                                        onChange={(e) => handleAdvancedChange('temperature', parseFloat(e.target.value))}
                                        min="0"
                                        max="2"
                                        step="0.1"
                                        style={{ width: '80px' }}
                                    />
                                    <button
                                        type="button"
                                        className="ai-reset-btn"
                                        onClick={() => resetAdvancedSetting('temperature')}
                                    >
                                        <RotateCcw size={12} />
                                    </button>
                                </div>

                                {/* 最高概率值 */}
                                <div className="ai-form-group">
                                    <label>{localInstance.ai_top_p}</label>
                                    <div className="ai-parameter-info">核采样，控制词汇选择的多样性</div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <input
                                        type="number"
                                        value={formData.advancedSettings?.topP || 0.9}
                                        onChange={(e) => handleAdvancedChange('topP', parseFloat(e.target.value))}
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        style={{ width: '80px' }}
                                    />
                                    <button
                                        type="button"
                                        className="ai-reset-btn"
                                        onClick={() => resetAdvancedSetting('topP')}
                                    >
                                        <RotateCcw size={12} />
                                    </button>
                                </div>

                                {/* 频率惩罚 */}
                                <div className="ai-form-group">
                                    <label>{localInstance.ai_frequency_penalty}</label>
                                    <div className="ai-parameter-info">降低重复词汇的概率</div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <input
                                        type="number"
                                        value={formData.advancedSettings?.frequencyPenalty || 0.0}
                                        onChange={(e) => handleAdvancedChange('frequencyPenalty', parseFloat(e.target.value))}
                                        min="-2"
                                        max="2"
                                        step="0.1"
                                        style={{ width: '80px' }}
                                    />
                                    <button
                                        type="button"
                                        className="ai-reset-btn"
                                        onClick={() => resetAdvancedSetting('frequencyPenalty')}
                                    >
                                        <RotateCcw size={12} />
                                    </button>
                                </div>

                                {/* 存在惩罚 */}
                                <div className="ai-form-group">
                                    <label>{localInstance.ai_presence_penalty}</label>
                                    <div className="ai-parameter-info">鼓励谈论新话题</div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <input
                                        type="number"
                                        value={formData.advancedSettings?.presencePenalty || 0.0}
                                        onChange={(e) => handleAdvancedChange('presencePenalty', parseFloat(e.target.value))}
                                        min="-2"
                                        max="2"
                                        step="0.1"
                                        style={{ width: '80px' }}
                                    />
                                    <button
                                        type="button"
                                        className="ai-reset-btn"
                                        onClick={() => resetAdvancedSetting('presencePenalty')}
                                    >
                                        <RotateCcw size={12} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="ai-model-config-actions">
                    <div className="ai-config-left-actions">
                        <button
                            className="ai-verify-btn"
                            onClick={handleVerifyModel}
                            disabled={verifying || !formData.apiKey.trim()}
                        >
                            {verifying ? "验证中..." : localInstance.ai_verify_model}
                        </button>
                        {verificationResult && (
                            <span className={`ai-verification-status ${formData.verified ? 'ai-verification-success' : 'ai-verification-error'}`}>
                                {verificationResult}
                            </span>
                        )}
                    </div>

                    <div className="ai-config-right-actions">
                        <button onClick={onCancel}>
                            {localInstance.cancel}
                        </button>
                        <button className="mod-cta" onClick={handleSave}>
                            {localInstance.save}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
