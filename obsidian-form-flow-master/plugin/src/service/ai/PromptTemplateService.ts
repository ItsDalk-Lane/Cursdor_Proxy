import { App, TFile, TFolder } from "obsidian";
import { FormIdValues } from "../FormValues";

export interface VariableContext {
    formValues: FormIdValues;
    outputVariables?: Record<string, any>;
    internalVariables?: Record<string, any>;
}

export class PromptTemplateService {
    private app: App;
    private templateFolder: string;

    constructor(app: App, templateFolder: string) {
        this.app = app;
        this.templateFolder = templateFolder;
    }

    /**
     * 从模板文件加载内容
     */
    async loadTemplate(templatePath: string): Promise<string> {
        try {
            const file = this.app.vault.getAbstractFileByPath(templatePath);
            if (file instanceof TFile) {
                return await this.app.vault.read(file);
            } else {
                throw new Error(`模板文件不存在: ${templatePath}`);
            }
        } catch (error) {
            throw new Error(`加载模板文件失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
    }

    /**
     * 获取模板目录下的所有文件
     */
    async getTemplateFiles(): Promise<TFile[]> {
        const folder = this.app.vault.getAbstractFileByPath(this.templateFolder);
        if (!folder || !(folder instanceof TFolder)) {
            return [];
        }

        const templateFiles: TFile[] = [];
        
        const scanFolder = (currentFolder: TFolder) => {
            for (const child of currentFolder.children) {
                if (child instanceof TFile && (child.extension === 'md' || child.extension === 'txt')) {
                    templateFiles.push(child);
                } else if (child instanceof TFolder) {
                    scanFolder(child);
                }
            }
        };

        scanFolder(folder);
        return templateFiles;
    }

    /**
     * 处理模板内容，替换变量
     */
    processTemplate(template: string, context: VariableContext): string {
        let processed = template;

        // 替换表单变量 {{@fieldName}}
        if (context.formValues) {
            Object.entries(context.formValues).forEach(([fieldId, value]) => {
                // 首先尝试通过字段ID匹配
                const idRegex = new RegExp(`\\{\\{\\@${this.escapeRegex(fieldId)}\\}\\}`, 'g');
                const strValue = this.formatValue(value);
                processed = processed.replace(idRegex, strValue);
            });
        }

        // 如果还有未替换的 {{@fieldName}} 变量，尝试通过字段标签匹配
        if (context.formValues) {
            const fieldIdToLabelMap: Record<string, any> = {};
            
            // 需要从上下文中获取字段标签映射关系
            // 这个需要传入完整的FormState，暂时使用现有逻辑
            Object.entries(context.formValues).forEach(([fieldId, value]) => {
                fieldIdToLabelMap[fieldId] = value;
            });

            // 匹配任何 {{@变量名}} 格式
            const fieldVarPattern = /\{\{\@([^}]+)\}\}/g;
            let match;
            while ((match = fieldVarPattern.exec(processed)) !== null) {
                const fieldName = match[1].trim();
                const fullMatch = match[0];
                
                // 在表单值中查找对应的值
                let replacement = '';
                if (context.formValues[fieldName]) {
                    replacement = this.formatValue(context.formValues[fieldName]);
                }
                
                processed = processed.replace(fullMatch, replacement);
            }
        }

        // 替换输出变量 {{output:variableName}}
        if (context.outputVariables) {
            Object.entries(context.outputVariables).forEach(([varName, value]) => {
                const regex = new RegExp(`\\{\\{\\s*output\\s*:\\s*${this.escapeRegex(varName)}\\s*\\}\\}`, 'g');
                const strValue = this.formatValue(value);
                processed = processed.replace(regex, strValue);
            });
        }

        // 替换内置变量
        if (context.internalVariables) {
            Object.entries(context.internalVariables).forEach(([varName, value]) => {
                const regex = new RegExp(`\\{\\{\\s*${this.escapeRegex(varName)}\\s*\\}\\}`, 'g');
                const strValue = this.formatValue(value);
                processed = processed.replace(regex, strValue);
            });
        }

        // 替换日期时间变量
        processed = this.processDateTimeVariables(processed);

        return processed;
    }

    /**
     * 处理日期时间变量
     */
    private processDateTimeVariables(content: string): string {
        const now = new Date();
        
        // 替换常见的日期时间格式
        const dateTimePatterns = [
            { pattern: /\{\{\s*date\s*:\s*YYYY-MM-DD\s*\}\}/g, replacement: this.formatDate(now, 'YYYY-MM-DD') },
            { pattern: /\{\{\s*date\s*:\s*YYYY\/MM\/DD\s*\}\}/g, replacement: this.formatDate(now, 'YYYY/MM/DD') },
            { pattern: /\{\{\s*date\s*:\s*MM-DD-YYYY\s*\}\}/g, replacement: this.formatDate(now, 'MM-DD-YYYY') },
            { pattern: /\{\{\s*time\s*:\s*HH:mm\s*\}\}/g, replacement: this.formatTime(now, 'HH:mm') },
            { pattern: /\{\{\s*time\s*:\s*HH:mm:ss\s*\}\}/g, replacement: this.formatTime(now, 'HH:mm:ss') },
            { pattern: /\{\{\s*datetime\s*\}\}/g, replacement: now.toLocaleString() },
            { pattern: /\{\{\s*date\s*\}\}/g, replacement: this.formatDate(now, 'YYYY-MM-DD') },
            { pattern: /\{\{\s*time\s*\}\}/g, replacement: this.formatTime(now, 'HH:mm') }
        ];

        let processed = content;
        dateTimePatterns.forEach(({ pattern, replacement }) => {
            processed = processed.replace(pattern, replacement);
        });

        return processed;
    }

    /**
     * 格式化日期
     */
    private formatDate(date: Date, format: string): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return format
            .replace('YYYY', year.toString())
            .replace('MM', month)
            .replace('DD', day);
    }

    /**
     * 格式化时间
     */
    private formatTime(date: Date, format: string): string {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return format
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
    }

    /**
     * 转义正则表达式特殊字符
     */
    private escapeRegex(string: string): string {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * 格式化值
     */
    private formatValue(value: any): string {
        if (value === null || value === undefined) {
            return '';
        }
        
        if (typeof value === 'string') {
            return value;
        }
        
        if (typeof value === 'number' || typeof value === 'boolean') {
            return value.toString();
        }
        
        if (Array.isArray(value)) {
            return value.join(', ');
        }
        
        if (typeof value === 'object') {
            try {
                return JSON.stringify(value, null, 2);
            } catch {
                return value.toString();
            }
        }
        
        return value.toString();
    }

    /**
     * 验证模板语法
     */
    validateTemplate(template: string): { valid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        // 检查未闭合的变量标记
        const openBraces = (template.match(/\{\{/g) || []).length;
        const closeBraces = (template.match(/\}\}/g) || []).length;
        
        if (openBraces !== closeBraces) {
            errors.push('变量标记未正确闭合，请检查 {{ 和 }} 的配对');
        }

        // 检查变量语法
        const variablePattern = /\{\{\s*([^}]+)\s*\}\}/g;
        let match;
        
        while ((match = variablePattern.exec(template)) !== null) {
            const variable = match[1].trim();
            
            // 检查输出变量格式
            if (variable.startsWith('output:')) {
                const outputVar = variable.substring(7).trim();
                if (!outputVar) {
                    errors.push(`输出变量格式错误: {{${variable}}}，应为 {{output:variableName}}`);
                }
            }
            
            // 检查日期时间变量格式
            if (variable.startsWith('date:') || variable.startsWith('time:')) {
                const format = variable.split(':')[1]?.trim();
                if (!format) {
                    errors.push(`日期时间变量格式错误: {{${variable}}}，缺少格式说明`);
                }
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * 获取模板中使用的变量列表
     */
    extractVariables(template: string): {
        formVariables: string[];
        outputVariables: string[];
        dateTimeVariables: string[];
        internalVariables: string[];
    } {
        const formVariables: string[] = [];
        const outputVariables: string[] = [];
        const dateTimeVariables: string[] = [];
        const internalVariables: string[] = [];

        const variablePattern = /\{\{\s*([^}]+)\s*\}\}/g;
        let match;

        while ((match = variablePattern.exec(template)) !== null) {
            const variable = match[1].trim();

            if (variable.startsWith('output:')) {
                const outputVar = variable.substring(7).trim();
                if (outputVar && !outputVariables.includes(outputVar)) {
                    outputVariables.push(outputVar);
                }
            } else if (variable.startsWith('date') || variable.startsWith('time') || variable === 'datetime') {
                if (!dateTimeVariables.includes(variable)) {
                    dateTimeVariables.push(variable);
                }
            } else if (['clipboard', 'selection', 'now', 'today'].includes(variable)) {
                if (!internalVariables.includes(variable)) {
                    internalVariables.push(variable);
                }
            } else {
                if (!formVariables.includes(variable)) {
                    formVariables.push(variable);
                }
            }
        }

        return {
            formVariables,
            outputVariables,
            dateTimeVariables,
            internalVariables
        };
    }
}
