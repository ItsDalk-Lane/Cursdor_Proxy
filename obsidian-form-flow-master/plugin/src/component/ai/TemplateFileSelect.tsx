import React, { useState, useEffect, useMemo } from "react";
import { TFile } from "obsidian";
import { useObsidianApp } from "src/context/obsidianAppContext";
import { ListBox } from "src/component/list-box/ListBox";
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
                console.log('TemplateFileSelect - 开始加载模板文件');
                
                // 获取AI设置中的模板目录
                const settingsService = new AISettingsService(app);
                const settings = await settingsService.loadSettings();
                const folder = settings.promptTemplateFolder || "form/prompts";
                
                console.log('TemplateFileSelect - 模板目录:', folder);
                setTemplateFolder(folder);
                
                // 获取模板文件列表
                const templateService = new PromptTemplateService(app, folder);
                const files = await templateService.getTemplateFiles();
                
                console.log('TemplateFileSelect - 找到的模板文件:', files.map(f => f.path));
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

    // 构建选项列表
    const options = useMemo(() => {
        return templateFiles.map((file) => ({
            id: file.path,
            label: file.name,
            value: file.path,
            description: file.path
        }));
    }, [templateFiles]);

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
        <ListBox
            value={value ? [value] : []}
            options={options}
            onChange={(values) => {
                const selectedValue = Array.isArray(values) && values.length > 0 ? values[0] : "";
                onChange(selectedValue);
            }}
        />
    );
}
