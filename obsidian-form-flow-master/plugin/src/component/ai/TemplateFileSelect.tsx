import React, { useState, useEffect, useMemo } from "react";
import { TFile } from "obsidian";
import { useObsidianApp } from "src/context/obsidianAppContext";
import { AISettingsService } from "src/service/ai/AISettingsService";
import { PromptTemplateService } from "src/service/ai/PromptTemplateService";

interface TemplateFileSelectProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function TemplateFileSelect({ value, onChange, placeholder = "选择模板文件..." }: TemplateFileSelectProps) {
    const app = useObsidianApp();
    const [templateFiles, setTemplateFiles] = useState<TFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [templateFolder, setTemplateFolder] = useState<string>("");

    // 加载模板文件
    useEffect(() => {
        async function loadTemplateFiles() {
            try {
        
                
                // 获取AI设置中的模板目录
                const settingsService = new AISettingsService(app);
                const settings = await settingsService.loadSettings();
                const folder = settings.promptTemplateFolder || "form/prompts";
                
    
                setTemplateFolder(folder);
                
                // 获取模板文件列表
                const templateService = new PromptTemplateService(app, folder);
                const files = await templateService.getTemplateFiles();
                
    
                setTemplateFiles(files);
            } catch (error) {
                console.error("Failed to load template files:", error);
                setTemplateFiles([]);
            } finally {
                setLoading(false);
            }
        }
        
        loadTemplateFiles();
    }, [app]);

    if (loading) {
        return (
            <div className="template-file-select-loading">
                <span>加载模板文件中...</span>
            </div>
        );
    }

    if (templateFiles.length === 0) {
        return (
            <div className="template-file-select-empty">
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
            onChange={(e) => onChange(e.target.value)}
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
            <option value="">{placeholder}</option>
            {templateFiles.map((file) => (
                <option key={file.path} value={file.path}>
                    {file.name}
                </option>
            ))}
        </select>
    );
}
