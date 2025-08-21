import { useState, useEffect } from "react";
import { AICallFormAction, PromptSourceType } from "../../../../model/action/AICallFormAction";
import { IFormAction } from "../../../../model/action/IFormAction";
import { FormActionType } from "../../../../model/enums/FormActionType";
import { FormConfig } from "../../../../model/FormConfig";
import { localInstance } from "../../../../i18n/locals";
import MarkdownFileSuggestInput from "src/component/combobox/MarkdownFileSuggestInput";
import { useObsidianApp } from "../../../../context/obsidianAppContext";
import { TemplateFileSelect } from "../../../../component/ai/TemplateFileSelect";
import { debugManager } from "../../../../utils/DebugManager";

interface AICallActionSettingProps {
    value: IFormAction;
    config: FormConfig;
    onChange: (action: IFormAction) => void;
}

export function AICallActionSetting({ value, config, onChange }: AICallActionSettingProps) {
    // 类型检查 - 必须在所有Hooks之前进行
    if (value.type !== FormActionType.AI_CALL) {
        return null;
    }
    
    const app = useObsidianApp();
    const aiAction = value as AICallFormAction;
    const [promptSource, setPromptSource] = useState<PromptSourceType>(
        aiAction.promptSource || PromptSourceType.CUSTOM
    );
    const [templateFile, setTemplateFile] = useState(aiAction.templateFile || "");
    const [customPrompt, setCustomPrompt] = useState(aiAction.customPrompt || "");
    const [outputVariableName, setOutputVariableName] = useState(aiAction.outputVariableName || "");
    const [modelFieldName, setModelFieldName] = useState(aiAction.modelFieldName || "");
    const [templateFieldName, setTemplateFieldName] = useState(aiAction.templateFieldName || "");

    // 获取表单中的AI模型字段
    const aiModelFields = config.fields.filter(field => field.type === "ai_model_list");
    // 获取表单中的模板列表字段
    const templateListFields = config.fields.filter(field => field.type === "template_list");

    useEffect(() => {
        const updatedAction: AICallFormAction = {
            ...aiAction,
            promptSource,
            templateFile: promptSource === PromptSourceType.BUILTIN_TEMPLATE ? templateFile : undefined,
            customPrompt: promptSource === PromptSourceType.CUSTOM ? customPrompt : undefined,
            outputVariableName,
            modelFieldName,
            templateFieldName
        };
        onChange(updatedAction);
    }, [promptSource, templateFile, customPrompt, outputVariableName, modelFieldName, templateFieldName]);

    return (
        <div className="ai-call-action-setting">
            {/* AI模型字段选择 */}
            {aiModelFields.length > 0 && (
                <div className="setting-item">
                    <div className="setting-item-info">
                        <div className="setting-item-name">AI模型字段</div>
                        <div className="setting-item-description">
                            选择表单中配置的AI模型列表字段。AI将使用该字段的默认值或用户选择的模型。
                        </div>
                    </div>
                    <div className="setting-item-control">
                        <select
                            value={modelFieldName}
                            onChange={(e) => setModelFieldName(e.target.value)}
                        >
                            <option value="">{localInstance.please_select_option}</option>
                            {aiModelFields.map(field => (
                                <option key={field.id} value={field.label}>
                                    {field.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* 提示词设置 */}
            <div className="setting-item">
                <div className="setting-item-info">
                    <div className="setting-item-name">{localInstance.ai_prompt_setting}</div>
                    <div className="setting-item-description">
                        选择使用内置模板还是自定义提示词
                    </div>
                </div>
                <div className="setting-item-control">
                    <div className="radio-group">
                        <label className="radio-item">
                            <input
                                type="radio"
                                value={PromptSourceType.BUILTIN_TEMPLATE}
                                checked={promptSource === PromptSourceType.BUILTIN_TEMPLATE}
                                onChange={(e) => setPromptSource(e.target.value as PromptSourceType)}
                            />
                            <span>{localInstance.ai_builtin_template}</span>
                        </label>
                        <label className="radio-item">
                            <input
                                type="radio"
                                value={PromptSourceType.CUSTOM}
                                checked={promptSource === PromptSourceType.CUSTOM}
                                onChange={(e) => setPromptSource(e.target.value as PromptSourceType)}
                            />
                            <span>{localInstance.ai_custom_prompt}</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* 模板文件选择 */}
            {promptSource === PromptSourceType.BUILTIN_TEMPLATE && (
                <div className="setting-item" style={{ position: "relative", zIndex: 1 }}>
                    <div className="setting-item-info">
                        <div className="setting-item-name">
                            {templateListFields.length > 0 && promptSource === PromptSourceType.BUILTIN_TEMPLATE ? "提示模板字段" : localInstance.ai_template_file}
                        </div>
                        <div className="setting-item-description">
                            {templateListFields.length > 0 && promptSource === PromptSourceType.BUILTIN_TEMPLATE
                                ? "选择表单中的模板列表字段，或直接选择模板文件" 
                                : "从提示模板目录中选择模板文件"
                            }
                        </div>
                    </div>
                    <div className="setting-item-control" style={{ position: "relative", zIndex: 2 }}>
                        {templateListFields.length > 0 && (
                            <div style={{ marginBottom: "8px" }}>
                                <select
                                    value={templateFieldName}
                                    onChange={(e) => {
                                        setTemplateFieldName(e.target.value);
                                        if (e.target.value) {
                                            setTemplateFile(""); // 清空直接选择的模板文件
                                        }
                                    }}
                                    style={{ width: "100%", marginBottom: "4px" }}
                                >
                                    <option value="">{localInstance.please_select_option}</option>
                                    {templateListFields.map(field => (
                                        <option key={field.id} value={field.label}>
                                            {field.label}
                                        </option>
                                    ))}
                                </select>
                                <div style={{ fontSize: "0.9em", color: "var(--text-muted)" }}>
                                    使用表单中的模板列表字段
                                </div>
                            </div>
                        )}
                        {(!templateFieldName || templateListFields.length === 0) && (
                            <div>
                                <TemplateFileSelect
                                    value={templateFile}
                                    onChange={(value) => {
                                        setTemplateFile(value);
                                        if (value) {
                                            setTemplateFieldName(""); // 清空模板字段选择
                                        }
                                    }}
                                    placeholder="选择模板文件..."
                                />
                                {templateListFields.length > 0 && (
                                    <div style={{ fontSize: "0.9em", color: "var(--text-muted)", marginTop: "4px" }}>
                                        直接选择模板文件
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 输出变量名 */}
            <div className="setting-item">
                <div className="setting-item-info">
                    <div className="setting-item-name">{localInstance.ai_output_variable_name}</div>
                    <div className="setting-item-description">
                        设置存储AI返回结果的变量名，可在后续动作中通过 {"{{output:variableName}}"} 引用
                    </div>
                </div>
                <div className="setting-item-control">
                    <input
                        type="text"
                        value={outputVariableName}
                        onChange={(e) => setOutputVariableName(e.target.value)}
                        placeholder="例如：aiResponse"
                    />
                </div>
            </div>

            {/* 自定义提示词 - 移到最后，分上下两个容器 */}
            {promptSource === PromptSourceType.CUSTOM && (
                <div className="setting-item ai-custom-prompt-setting">
                    <div className="setting-item-info">
                        <div className="setting-item-name">{localInstance.ai_custom_content}</div>
                        <div className="setting-item-description">
                            输入自定义提示词内容，支持表单变量 {"{{fieldName}}"}
                        </div>
                    </div>
                </div>
            )}
            {promptSource === PromptSourceType.CUSTOM && (
                <div className="setting-item ai-custom-prompt-textarea">
                    <div className="setting-item-control" style={{ width: "100%" }}>
                        <textarea
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            placeholder="输入您的提示词内容..."
                            rows={8}
                            style={{ 
                                width: "100%", 
                                resize: "vertical",
                                padding: "8px",
                                border: "1px solid var(--background-modifier-border)",
                                borderRadius: "4px",
                                fontFamily: "var(--font-monospace)"
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
