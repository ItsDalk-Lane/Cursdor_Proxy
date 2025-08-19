import { Setting, Notice } from "obsidian";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { localInstance } from "../../i18n/locals";
import FormPlugin from "../../main";
import FolderSuggest from "../../component/combobox/FolderSuggest";
import { AIModelConfigModal } from "../../component/modal/AIModelConfigModal";
import { AIModelList } from "../../component/ai/AIModelList";
import { IAIModelConfig } from "../../model/ai/AIModelConfig";
import { AISettingsService } from "../../service/ai/AISettingsService";
import "./AISettingTabItem.css";

export function AISettingTabItem(props: { plugin: FormPlugin }) {
    const { plugin } = props;
    const aiSettingsService = new AISettingsService(plugin.app, plugin);
    const settingsRef = useRef<HTMLDivElement>(null);
    
    const [showModelConfigModal, setShowModelConfigModal] = useState(false);
    const [editingModel, setEditingModel] = useState<IAIModelConfig | null>(null);
    const [modelsExpanded, setModelsExpanded] = useState(false);
    const [models, setModels] = useState<IAIModelConfig[]>([]);
    const [promptTemplateFolder, setPromptTemplateFolder] = useState(plugin.settings.aiSettings.promptTemplateFolder);
    const [enableSystemPrompt, setEnableSystemPrompt] = useState(plugin.settings.aiSettings.enableSystemPrompt);
    const [systemPrompt, setSystemPrompt] = useState(plugin.settings.aiSettings.systemPrompt);

    // 加载AI设置
    useEffect(() => {
        const loadAISettings = async () => {
            try {
                const settings = await aiSettingsService.loadSettings();
                setModels(settings.models);
                setPromptTemplateFolder(settings.promptTemplateFolder);
                setEnableSystemPrompt(settings.enableSystemPrompt);
                setSystemPrompt(settings.systemPrompt);
                setIsInitialized(true);
            } catch (error) {
                console.error('加载AI设置失败:', error);
                // 如果加载失败，从插件设置中恢复
                setPromptTemplateFolder(plugin.settings.aiSettings.promptTemplateFolder);
                setEnableSystemPrompt(plugin.settings.aiSettings.enableSystemPrompt);
                setSystemPrompt(plugin.settings.aiSettings.systemPrompt);
                setModels(plugin.settings.aiSettings.models);
                setIsInitialized(true);
            }
        };
        loadAISettings();
    }, []);

    // 移除自动同步到主插件设置的逻辑，避免冲突
    // AI设置完全由AISettingsService管理，主插件在启动时会同步这些设置
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (!settingsRef.current) {
            return;
        }

        const el = settingsRef.current;
        el.empty();

        // 提示模板加载目录设置
        new Setting(el)
            .setName(localInstance.ai_prompt_template_folder)
            .setDesc(localInstance.ai_prompt_template_folder_desc)
            .addText((cb) => {
                cb.setValue(promptTemplateFolder);
                cb.setPlaceholder(localInstance.ai_prompt_template_folder_placeholder);
                cb.onChange(async (v) => {
                    setPromptTemplateFolder(v);
                    try {
                        await aiSettingsService.updatePromptTemplateFolder(v);
                        console.log('提示模板目录已更新为:', v);
                    } catch (error) {
                        console.error('更新提示模板目录失败:', error);
                    }
                });

                const suggest = new FolderSuggest(plugin.app, cb.inputEl);
                suggest.onSelect(async (folder) => {
                    cb.setValue(folder.path);
                    setPromptTemplateFolder(folder.path);
                    try {
                        await aiSettingsService.updatePromptTemplateFolder(folder.path);
                        console.log('提示模板目录已更新为:', folder.path);
                    } catch (error) {
                        console.error('更新提示模板目录失败:', error);
                    }
                    suggest.close();
                });
            });

        // 用户系统提示设置
        const systemPromptSetting = new Setting(el)
            .setName(localInstance.ai_user_system_prompt)
            .setDesc(localInstance.ai_user_system_prompt_desc)
            .addToggle((cb) => {
                cb.setValue(enableSystemPrompt);
                cb.onChange(async (value) => {
                    setEnableSystemPrompt(value);
                    try {
                        await aiSettingsService.updateSystemPromptSettings(value, systemPrompt);
                    } catch (error) {
                        console.error('更新系统提示设置失败:', error);
                    }
                });
            });

        // 如果启用系统提示，显示文本框
        if (enableSystemPrompt) {
            new Setting(el)
                .setName("")
                .addTextArea((cb) => {
                    cb.setValue(systemPrompt);
                    cb.setPlaceholder(localInstance.ai_system_prompt_placeholder);
                    cb.onChange(async (value) => {
                        setSystemPrompt(value);
                        try {
                            await aiSettingsService.updateSystemPromptSettings(enableSystemPrompt, value);
                        } catch (error) {
                            console.error('更新系统提示设置失败:', error);
                        }
                    });
                    cb.inputEl.rows = 6;
                    cb.inputEl.style.width = "100%";
                });
        }

        return () => {
            el.empty();
        };
    }, [promptTemplateFolder, enableSystemPrompt, systemPrompt]);

    const handleAddModel = () => {
        setEditingModel(null);
        setShowModelConfigModal(true);
    };

    const handleEditModel = (model: IAIModelConfig) => {
        setEditingModel(model);
        setShowModelConfigModal(true);
    };

    const handleDeleteModel = async (modelId: string) => {
        try {
            await aiSettingsService.deleteModel(modelId);
            setModels(models.filter(m => m.id !== modelId));
        } catch (error) {
            console.error('删除模型失败:', error);
        }
    };

    const handleSaveModel = async (model: IAIModelConfig) => {
        console.log('AISettingTabItem - 开始保存模型:', model);
        console.log('当前编辑模型:', editingModel);
        console.log('当前模型列表:', models);
        
        try {
            if (editingModel) {
                // 更新现有模型
                console.log('更新现有模型, ID:', model.id);
                await aiSettingsService.updateModel(model.id, model);
                const updatedModels = models.map(m => m.id === model.id ? model : m);
                setModels(updatedModels);
                console.log('模型更新完成, 新列表:', updatedModels);
            } else {
                // 添加新模型
                console.log('添加新模型');
                const newModel = await aiSettingsService.addModel(model);
                const newModels = [...models, newModel];
                setModels(newModels);
                console.log('模型添加完成, 新列表:', newModels);
            }
            setShowModelConfigModal(false);
            setEditingModel(null);
            
            // 重新加载设置以确保同步
            console.log('重新加载AI设置以确保同步');
            const settings = await aiSettingsService.loadSettings();
            setModels(settings.models);
            console.log('重新加载后的模型列表:', settings.models);
        } catch (error) {
            console.error('保存模型失败:', error);
            new Notice('保存模型失败: ' + (error instanceof Error ? error.message : '未知错误'));
        }
    };

    return (
        <div className="ai-setting-tab">
            {/* AI模型管理标题行 */}
            <div className="ai-setting-header">
                <h2>{localInstance.ai_model_management}</h2>
                <button 
                    className="mod-cta"
                    onClick={handleAddModel}
                >
                    <Plus size={16} />
                    {localInstance.ai_add_model}
                </button>
            </div>

            {/* 模型列表 */}
            <div className="ai-models-section">
                <div 
                    className="ai-models-header"
                    onClick={() => setModelsExpanded(!modelsExpanded)}
                >
                    {modelsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <span>{localInstance.ai_model_list}</span>
                </div>
                
                {modelsExpanded && (
                    <AIModelList
                        models={models}
                        onEdit={handleEditModel}
                        onDelete={handleDeleteModel}
                    />
                )}
            </div>

            {/* 其他设置 */}
            <div ref={settingsRef}></div>

            {/* 模型配置模态框 */}
            {showModelConfigModal && (
                <AIModelConfigModal
                    model={editingModel}
                    onSave={handleSaveModel}
                    onCancel={() => {
                        setShowModelConfigModal(false);
                        setEditingModel(null);
                    }}
                />
            )}
        </div>
    );
}
