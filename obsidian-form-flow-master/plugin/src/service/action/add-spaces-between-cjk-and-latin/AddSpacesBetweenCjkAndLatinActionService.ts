import { App, Notice, TFile, MarkdownView, Editor } from "obsidian";
import { IFormAction } from "src/model/action/IFormAction";
import { AddSpacesBetweenCjkAndLatinFormAction } from "src/model/action/AddSpacesBetweenCjkAndLatinFormAction";
import { FormActionType } from "src/model/enums/FormActionType";
import { FormTemplateProcessEngine } from "../../engine/FormTemplateProcessEngine";
import { ActionChain, ActionContext, IActionService } from "../IActionService";
import { BaseService } from "../../BaseService";

/**
 * 中英文加空格动作服务
 * 自动在中文和英文字符之间添加空格，提高可读性
 * 同时支持使用Prettier进行代码格式化
 */
export default class AddSpacesBetweenCjkAndLatinActionService extends BaseService implements IActionService {
    private engine = new FormTemplateProcessEngine();

    constructor() {
        super('AddSpacesBetweenCjkAndLatinActionService');
    }

    /**
     * 检查是否接受此动作
     */
    accept(action: IFormAction, context: ActionContext): boolean {
        const isAccepted = action.type === FormActionType.ADD_SPACES_BETWEEN_CJK_AND_LATIN;
        this.debugLog(`接受动作检查: ${action.type} -> ${isAccepted}`);
        return isAccepted;
    }

    /**
     * 执行中英文加空格动作
     */
    async run(action: IFormAction, context: ActionContext, chain: ActionChain): Promise<void> {
        const formAction = action as AddSpacesBetweenCjkAndLatinFormAction;
        const app = context.app;
        
        this.debugLog("开始执行中英文加空格动作", {
            targetMode: formAction.targetMode,
            tabWidth: formAction.tabWidth,
            formatEmbeddedCode: formAction.formatEmbeddedCode,
            preserveCodeBlocks: formAction.preserveCodeBlocks
        });

        try {
            if (formAction.targetMode === 'current') {
                await this.processCurrentFile(formAction, app);
            } else {
                await this.processSpecifiedFile(formAction, context);
            }
            
        } catch (error) {
            this.debugLog("中英文加空格处理失败", error);
            new Notice(`❌ 处理失败: ${error.message}`);
            throw error;
        }

        // 继续执行下一个动作
        await chain.next(context);
    }

    /**
     * 处理当前活动文件
     */
    private async processCurrentFile(action: AddSpacesBetweenCjkAndLatinFormAction, app: App): Promise<void> {
        const activeView = app.workspace.getActiveViewOfType(MarkdownView);
        if (!activeView) {
            throw new Error("没有活动的Markdown编辑器");
        }

        const editor = activeView.editor;
        const originalContent = editor.getValue();
        const formattedContent = await this.formatContent(originalContent, action);
        
        if (originalContent !== formattedContent) {
            // 保存光标位置
            const cursor = editor.getCursor();
            
            editor.setValue(formattedContent);
            
            // 尝试恢复光标位置（可能因为内容变化而需要调整）
            try {
                editor.setCursor(cursor);
            } catch (error) {
                // 如果光标位置无效，设置到文档开头
                editor.setCursor({ line: 0, ch: 0 });
            }
            
            new Notice("✅ 中英文格式化完成");
            this.debugLog("当前文件格式化完成", { 
                originalLength: originalContent.length,
                formattedLength: formattedContent.length
            });
        } else {
            new Notice("📄 文档已经是正确格式");
        }
    }

    /**
     * 处理指定文件
     */
    private async processSpecifiedFile(action: AddSpacesBetweenCjkAndLatinFormAction, context: ActionContext): Promise<void> {
        if (!action.filePath) {
            throw new Error("指定文件模式下filePath不能为空");
        }

        const app = context.app;
        const processedPath = await this.engine.process(action.filePath, context.state, app, context.config);
        const filePath = String(processedPath);
        const file = app.vault.getAbstractFileByPath(filePath);
        
        if (!file || !(file instanceof TFile)) {
            throw new Error(`文件不存在: ${filePath}`);
        }

        const originalContent = await app.vault.cachedRead(file);
        const formattedContent = await this.formatContent(originalContent, action);
        
        if (originalContent !== formattedContent) {
            await app.vault.modify(file, formattedContent);
            
            new Notice(`✅ 文件格式化完成: ${file.name}`);
            this.debugLog("指定文件格式化完成", { 
                file: file.path,
                originalLength: originalContent.length,
                formattedLength: formattedContent.length
            });
        } else {
            new Notice(`📄 文件已经是正确格式: ${file.name}`);
        }
    }

    /**
     * 格式化内容
     */
    private async formatContent(content: string, action: AddSpacesBetweenCjkAndLatinFormAction): Promise<string> {
        let result = content;

        try {
            // 1. 保护代码块（如果需要）
            const codeBlocks: string[] = [];
            const inlineCodeBlocks: string[] = [];
            
            if (action.preserveCodeBlocks) {
                // 保护代码块
                result = result.replace(/```[\s\S]*?```/g, (match, index) => {
                    const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
                    codeBlocks.push(match);
                    return placeholder;
                });

                // 保护内联代码
                result = result.replace(/`([^`\n]+)`/g, (match, code) => {
                    const placeholder = `__INLINE_CODE_${inlineCodeBlocks.length}__`;
                    inlineCodeBlocks.push(match);
                    return placeholder;
                });
            }

            // 2. 添加中英文空格
            result = this.addSpacesBetweenCjkAndLatin(result);

            // 3. 使用Prettier格式化（如果启用）
            if (action.formatEmbeddedCode) {
                result = await this.prettierFormat(result, action);
            }

            // 4. 恢复代码块
            if (action.preserveCodeBlocks) {
                // 恢复内联代码
                inlineCodeBlocks.forEach((code, index) => {
                    result = result.replace(`__INLINE_CODE_${index}__`, code);
                });

                // 恢复代码块
                codeBlocks.forEach((code, index) => {
                    result = result.replace(`__CODE_BLOCK_${index}__`, code);
                });
            }

            return result;

        } catch (error) {
            this.debugLog("内容格式化失败", error);
            // 如果格式化失败，至少返回添加了空格的版本
            return this.addSpacesBetweenCjkAndLatin(content);
        }
    }

    /**
     * 在中英文字符之间添加空格
     */
    private addSpacesBetweenCjkAndLatin(text: string): string {
        // CJK字符范围（中文、日文、韩文）
        const cjkRegex = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u3040-\u309f\u30a0-\u30ff]/;
        
        // 拉丁字符范围（英文字母和数字）
        const latinRegex = /[a-zA-Z0-9]/;

        let result = text;

        // CJK字符后跟拉丁字符，添加空格
        result = result.replace(
            /([\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u3040-\u309f\u30a0-\u30ff])([a-zA-Z0-9])/g,
            '$1 $2'
        );

        // 拉丁字符后跟CJK字符，添加空格
        result = result.replace(
            /([a-zA-Z0-9])([\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u3040-\u309f\u30a0-\u30ff])/g,
            '$1 $2'
        );

        // 处理特殊情况：避免在标点符号周围添加多余空格
        // 中文标点符号后不需要空格
        result = result.replace(
            /([\u3000-\u303f\uff00-\uffef]) +([a-zA-Z0-9])/g,
            '$1$2'
        );
        
        // 英文标点符号前不需要空格
        result = result.replace(
            /([\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u3040-\u309f\u30a0-\u30ff]) +([,.!?;:])/g,
            '$1$2'
        );

        return result;
    }

    /**
     * 使用基本格式化代码（暂不依赖Prettier）
     */
    private async prettierFormat(content: string, action: AddSpacesBetweenCjkAndLatinFormAction): Promise<string> {
        try {
            // 暂时只进行基本的文本格式化，不使用Prettier
            // 可以在后续版本中通过配置启用Prettier支持
            this.debugLog("跳过Prettier格式化（未配置依赖）");
            return content;

        } catch (error) {
            this.debugLog("格式化失败，返回原内容", error);
            return content;
        }
    }

    /**
     * 检测文本中是否包含需要处理的中英文混排
     */
    private hasChineseEnglishMixture(text: string): boolean {
        // 检测是否同时包含中文和英文字符
        const hasChinese = /[\u4e00-\u9fff]/.test(text);
        const hasEnglish = /[a-zA-Z]/.test(text);
        
        return hasChinese && hasEnglish;
    }

    /**
     * 计算需要处理的位置数量（用于进度显示）
     */
    private countProcessablePositions(text: string): number {
        const regex = /([\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u3040-\u309f\u30a0-\u30ff])([a-zA-Z0-9])|([a-zA-Z0-9])([\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u3040-\u309f\u30a0-\u30ff])/g;
        const matches = text.match(regex);
        return matches ? matches.length : 0;
    }
}