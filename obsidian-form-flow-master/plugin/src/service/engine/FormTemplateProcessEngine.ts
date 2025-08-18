import { FormState } from "../FormState";
import { App, TFile } from "obsidian";
import TemplateParser from "./TemplateParser";
import { getEditorSelection } from "src/utils/getEditorSelection";
import { processObTemplate } from "src/utils/templates";
import { FormConfig } from "src/model/FormConfig";
import { FormFieldType } from "src/model/enums/FormFieldType";
import { IFileListField } from "src/model/field/IFileListField";

export class FormTemplateProcessEngine {
    async process(text: string, state: FormState, app: App, config?: FormConfig) {
        if (!text || text === "") {
            return "";
        }

        // if exactly matches {{@variableName}}, return the value directly
        const pureVariableMatch = text.match(/^{{\@([^}]+)}}$/);
        if (pureVariableMatch) {
            const variableName = pureVariableMatch[1];
            const value = state.values[variableName];
            if (value !== undefined && value !== null) {
                // 检查是否是文件内容字段
                if (config) {
                    const field = config.fields?.find(f => f.label === variableName);
                    if (field) {
                        // 检查文件列表字段的文件内容提取功能
                        if (field.type === FormFieldType.FILE_LIST && (field as IFileListField).extractContent === true) {
                            if (typeof value === 'string') {
                                // 单个文件，提取内容
                                const cleanPath = this.cleanFilePath(value);
                                const fileContent = await this.readFileContent(app, cleanPath);
                                return fileContent;
                            } else if (Array.isArray(value)) {
                                // 多个文件，提取所有文件内容并连接
                                const contents: string[] = [];
                                for (const filePath of value) {
                                    if (typeof filePath === 'string') {
                                        const cleanPath = this.cleanFilePath(filePath);
                                        const content = await this.readFileContent(app, cleanPath);
                                        contents.push(content);
                                    }
                                }
                                return contents.join('\n\n---\n\n'); // 用分隔符连接多个文件内容
                            }
                        }
                    }
                }
                return value;
            }
            return "";
        }

        let res = text;
        res = await this.compileWithFileContent(res, state, app, config);

        // handle {{selection}}
        const selectionVariable = "{{selection}}";
        if (res.includes(selectionVariable)) {
            const selectedText = getEditorSelection(app);
            res = res.replace(selectionVariable, selectedText);
        }

        // handle {{clipboard}}
        const clipboardVariable = "{{clipboard}}";
        if (res.includes(clipboardVariable)) {
            const clipboardText = await navigator.clipboard.readText();
            res = res.replace(clipboardVariable, clipboardText);
        }

        // 最后处理 Obsidian 格式模板
        res = processObTemplate(res);
        return res;
    }

    private async compileWithFileContent(text: string, state: FormState, app: App, config?: FormConfig): Promise<string> {
        let result = '';
        let i = 0;

        while (i < text.length) {
            // 查找下一个 {{@ 表达式
            const startIdx = text.indexOf("{{@", i);
            if (startIdx === -1) {
                result += text.slice(i);
                break;
            }

            result += text.slice(i, startIdx);
            const endIdx = this.findClosingBrace(text, startIdx + 2);
            if (endIdx === -1) {
                result += text.slice(startIdx);
                break;
            }

            const expr = text.slice(startIdx + 3, endIdx);
            const resolvedValue = await this.evaluateExpression(expr, state, app, config);
            result += resolvedValue;

            i = endIdx + 2;
        }

        return result;
    }

    private findClosingBrace(text: string, startPos: number): number {
        let inString = false;
        let escape = false;

        // 从startPos位置开始查找，这个位置是第二个{后面
        for (let i = startPos + 1; i < text.length - 1; i++) {
            const char = text[i];

            if (escape) {
                escape = false;
                continue;
            }

            if (char === '\\') {
                escape = true;
                continue;
            }

            // 处理字符串引号
            if (char === '"' && !inString) {
                inString = true;
                continue;
            }

            if (char === '"' && inString) {
                inString = false;
                continue;
            }

            // 查找未转义且不在字符串内的 }} 序列
            if (!inString && char === '}' && text[i + 1] === '}') {
                return i; // 返回第一个 } 的位置
            }
        }

        return -1; // 未找到匹配的 }}
    }

    private async evaluateExpression(expr: string, state: FormState, app: App, config?: FormConfig): Promise<string> {
        const propertyName = expr;
        const value = state.values[propertyName];
        if (value === undefined || value === null) {
            return "";
        }

                // 检查是否是文件内容字段
                if (config) {
                    const field = config.fields?.find(f => f.label === propertyName);
                    if (field) {
                        // 检查文件列表字段的文件内容提取功能
                        if (field.type === FormFieldType.FILE_LIST && (field as IFileListField).extractContent === true) {
                            if (typeof value === 'string') {
                                // 单个文件，提取内容
                                const cleanPath = this.cleanFilePath(value);
                                const fileContent = await this.readFileContent(app, cleanPath);
                                return fileContent;
                            } else if (Array.isArray(value)) {
                                // 多个文件，提取所有文件内容并连接
                                const contents: string[] = [];
                                for (const filePath of value) {
                                    if (typeof filePath === 'string') {
                                        const cleanPath = this.cleanFilePath(filePath);
                                        const content = await this.readFileContent(app, cleanPath);
                                        contents.push(content);
                                    }
                                }
                                return contents.join('\n\n---\n\n'); // 用分隔符连接多个文件内容
                            }
                        }
                    }
                }        return String(value);
    }

    private async readFileContent(app: App, filePath: string): Promise<string> {
        try {
            // 清理文件路径
            let cleanPath = filePath.trim();
            
            // 如果路径没有扩展名，自动添加 .md
            if (!cleanPath.includes('.')) {
                cleanPath += '.md';
            }

            // 获取文件
            const file = app.vault.getAbstractFileByPath(cleanPath) as TFile;
            if (!file) {
                return `[文件未找到: ${cleanPath}]`;
            }

            // 读取文件内容
            const content = await app.vault.read(file);
            
            // 移除 YAML frontmatter（属性）
            let processedContent = content.replace(/^---[\s\S]*?---\n?/, '');
            
            // 移除第一个一级标题（如果存在）
            processedContent = processedContent.replace(/^# .*\n?/, '');
            
            // 移除开头的空行
            processedContent = processedContent.replace(/^\n+/, '');
            
            return processedContent;
        } catch (error) {
            return `[读取文件失败: ${filePath}]`;
        }
    }

    private cleanFilePath(filePath: string): string {
        // 清理内链格式，提取文件名
        let cleanPath = filePath.replace(/^\[\[/, '').replace(/\]\]$/, '');
        
        // 移除可能的链接显示文本部分（如 [[file|display text]]）
        if (cleanPath.includes('|')) {
            cleanPath = cleanPath.split('|')[0];
        }
        
        return cleanPath.trim();
    }
}