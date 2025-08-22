import React, { useState, useEffect, useMemo, useCallback } from "react";
import { TFile } from "obsidian";
import { useObsidianApp } from "src/context/obsidianAppContext";
import { AISettingsService } from "src/service/ai/AISettingsService";
import { PromptTemplateService } from "src/service/ai/PromptTemplateService";
import { TemplateListField } from "src/model/field/TemplateListField";
import { debugManager } from "src/utils/DebugManager";

interface TemplateListControlProps {
    field: TemplateListField;
    value: string;
    onChange: (value: string) => void;
    autoFocus?: boolean;
}

/**
 * 模板列表控件组件 - 已优化性能
 * 使用React.memo和useCallback减少不必要的重新渲染
 * 添加调试信息追踪性能问题
 */
function TemplateListControl({ field, value, onChange, autoFocus = false }: TemplateListControlProps) {
    const app = useObsidianApp();
    const [templateFiles, setTemplateFiles] = useState<TFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [templateFolder, setTemplateFolder] = useState<string>("");

    debugManager.log('TemplateListControl', 'Component rendering', { fieldId: field.id, value, loading });

    // 优化的事件处理函数
    const handleChange = useCallback((newValue: string) => {
        debugManager.log('TemplateListControl', 'Value changed', { oldValue: value, newValue });
        onChange(newValue);
    }, [onChange, value]);

    // 加载模板文件
    useEffect(() => {
        async function loadTemplateFiles() {
            try {
                debugManager.log('TemplateListControl', 'Loading template files started');
                
                // 获取AI设置中的模板目录
                const settingsService = new AISettingsService(app);
                const settings = await settingsService.loadSettings();
                const folder = field.templateFolder || settings.promptTemplateFolder || "form/prompts";
                
                debugManager.log('TemplateListControl', 'Template folder determined', { folder });
                setTemplateFolder(folder);
                
                // 获取模板文件列表
                const templateService = new PromptTemplateService(app, folder);
                const files = await templateService.getTemplateFiles();
                
                debugManager.log('TemplateListControl', 'Template files loaded', { count: files.length });
                setTemplateFiles(files);
            } catch (error) {
                debugManager.error('TemplateListControl', 'Failed to load template files', error);
                setTemplateFiles([]);
            } finally {
                setLoading(false);
            }
        }
        
        loadTemplateFiles();
    }, [app, field.templateFolder]);

    // 自动选择逻辑
    useEffect(() => {
        if (!loading && templateFiles.length > 0) {
            // 如果有预选择的模板文件，使用它
            if (field.selectedTemplateFile) {
                const selectedTemplate = templateFiles.find(file => file.path === field.selectedTemplateFile);
                if (selectedTemplate && (!value || value === "__AUTO_SELECT_FIRST__")) {
                    debugManager.log('TemplateListControl', 'Auto selecting predefined template', { templatePath: selectedTemplate.path });
                    onChange(selectedTemplate.path);
                    return;
                }
            }
            
            // 如果启用了自动选择第一个或值为特殊标记，选择第一个模板
            if (field.autoSelectFirst || value === "__AUTO_SELECT_FIRST__") {
                const firstTemplatePath = templateFiles[0].path;
                debugManager.log('TemplateListControl', 'Auto selecting first template', { templatePath: firstTemplatePath });
                onChange(firstTemplatePath);
                return;
            }
        }
    }, [loading, templateFiles, value, field.selectedTemplateFile, field.autoSelectFirst, onChange]);

    if (loading) {
        return (
            <div className="template-list-control-loading">
                <span>加载模板文件中...</span>
            </div>
        );
    }

    if (templateFiles.length === 0) {
        return (
            <div className="template-list-control-empty">
                <span>在目录 "{templateFolder}" 中未找到模板文件</span>
                <div style={{ fontSize: "0.9em", color: "var(--text-muted)", marginTop: "4px" }}>
                    请在AI设置中配置提示模板目录，并在该目录下放置 .md 或 .txt 文件
                </div>
            </div>
        );
    }

    return (
        <select
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            autoFocus={autoFocus}
            style={{
                width: "100%",
                height: "var(--input-height)",
                padding: "var(--size-4-1) var(--size-4-2)",
                backgroundColor: "var(--background-secondary)",
                border: "1px solid var(--background-modifier-border)",
                borderRadius: "var(--radius-s)",
                color: "var(--text-normal)",
                fontSize: "var(--font-ui-small)"
            }}
        >
            <option value="">{field.placeholder || "选择模板文件..."}</option>
            {templateFiles.map((file) => (
                <option key={file.path} value={file.path}>
                    {file.name}
                </option>
            ))}
        </select>
    );
}

// 使用React.memo优化组件性能，避免不必要的重新渲染
export const TemplateListControlMemo = React.memo(TemplateListControl, (prevProps, nextProps) => {
    // 自定义比较函数，只在关键属性变化时重新渲染
    return (
        prevProps.value === nextProps.value &&
        prevProps.field.id === nextProps.field.id &&
        prevProps.field.templateFolder === nextProps.field.templateFolder &&
        prevProps.autoFocus === nextProps.autoFocus &&
        prevProps.onChange === nextProps.onChange
    );
});

// 导出优化后的组件
export { TemplateListControlMemo as TemplateListControl };
