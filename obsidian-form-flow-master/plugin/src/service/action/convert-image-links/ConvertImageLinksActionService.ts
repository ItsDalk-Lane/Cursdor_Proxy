import { App, Notice, TFile, MarkdownView } from "obsidian";
import { IFormAction } from "src/model/action/IFormAction";
import { ConvertImageLinksFormAction } from "src/model/action/ConvertImageLinksFormAction";
import { FormActionType } from "src/model/enums/FormActionType";
import { FormTemplateProcessEngine } from "../../engine/FormTemplateProcessEngine";
import { ActionChain, ActionContext, IActionService } from "../IActionService";
import { BaseService } from "../../BaseService";

/**
 * 复制为纯文本格式动作服务
 * 将Markdown文档内容转换为纯文本格式并复制到系统剪贴板，清除所有格式
 */
export default class ConvertImageLinksActionService extends BaseService implements IActionService {
    private engine = new FormTemplateProcessEngine();

    constructor() {
        super('ConvertImageLinksActionService');
    }

    /**
     * 检查是否接受此动作
     */
    accept(action: IFormAction, context: ActionContext): boolean {
        const isAccepted = action.type === FormActionType.CONVERT_IMAGE_LINKS;
        this.debugLog(`接受动作检查: ${action.type} -> ${isAccepted}`);
        return isAccepted;
    }

    /**
     * 执行转换图片链接动作
     */
    async run(action: IFormAction, context: ActionContext, chain: ActionChain): Promise<void> {
        const formAction = action as ConvertImageLinksFormAction;
        const app = context.app;
        
        this.debugLog("开始执行复制为纯文本格式动作", {
            targetMode: formAction.targetMode
        });

        try {
            const file = await this.getTargetFile(formAction, context);
            if (!file) {
                throw new Error("无法找到目标文件");
            }

            const originalContent = await app.vault.cachedRead(file);
            const plainTextContent = this.convertToPlainText(originalContent);
            
            // 复制到剪贴板
            await navigator.clipboard.writeText(plainTextContent);
            
            new Notice("✅ 内容已复制为纯文本格式");
            this.debugLog("复制为纯文本格式完成", { 
                file: file.path, 
                originalLength: originalContent.length,
                plainTextLength: plainTextContent.length
            });
            
        } catch (error) {
            this.debugLog("复制为纯文本格式失败", error);
            new Notice(`❌ 复制失败: ${error.message}`);
            throw error;
        }

        // 继续执行下一个动作
        await chain.next(context);
    }

    /**
     * 获取目标文件
     */
    private async getTargetFile(action: ConvertImageLinksFormAction, context: ActionContext): Promise<TFile | null> {
        const app = context.app;
        
        if (action.targetMode === 'current') {
            const activeView = app.workspace.getActiveViewOfType(MarkdownView);
            if (activeView && activeView.file) {
                return activeView.file;
            }
            throw new Error("没有活动的Markdown编辑器");
        } else {
            // 指定文件模式
            if (!action.filePath) {
                throw new Error("指定文件模式下filePath不能为空");
            }
            
            const processedPath = await this.engine.process(action.filePath, context.state, app, context.config);
            const filePath = String(processedPath);
            const file = app.vault.getAbstractFileByPath(filePath);
            
            if (!file || !(file instanceof TFile)) {
                throw new Error(`文件不存在: ${filePath}`);
            }
            
            return file;
        }
    }



    /**
     * 将Markdown内容转换为纯文本格式
     */
    private convertToPlainText(content: string): string {
        let result = content;
        
        // 移除frontmatter（属性信息）
        result = result.replace(/^---[\s\S]*?---\n?/m, '');
        
        // 移除所有图片链接 ![[image.png]] 或 ![alt](url)
        result = result.replace(/!\[\[([^\]]*?)(\|([^\]]*?))?\]\]/g, '');
        result = result.replace(/!\[([^\]]*)\]\([^)]*\)/g, '');
        
        // 移除内部链接 [[链接]] 或 [[链接|显示文本]]，保留显示文本或链接文本
        result = result.replace(/\[\[([^\]]+)\|([^\]]+)\]\]/g, '$2');
        result = result.replace(/\[\[([^\]]+)\]\]/g, '$1');
        
        // 移除外部链接格式 [文本](url)，保留文本
        result = result.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
        
        // 移除标题标记 # ## ###
        result = result.replace(/^#{1,6}\s+/gm, '');
        
        // 移除粗体和斜体标记 **text** *text* ***text***
        result = result.replace(/\*\*\*([^*]+)\*\*\*/g, '$1');
        result = result.replace(/\*\*([^*]+)\*\*/g, '$1');
        result = result.replace(/\*([^*]+)\*/g, '$1');
        
        // 移除删除线 ~~text~~
        result = result.replace(/~~([^~]+)~~/g, '$1');
        
        // 移除高亮 ==text==
        result = result.replace(/==([^=]+)==/g, '$1');
        
        // 移除代码块标记 ```
        result = result.replace(/```[\s\S]*?```/g, (match) => {
            // 提取代码块内容，移除语言标识和标记
            const lines = match.split('\n');
            return lines.slice(1, -1).join('\n');
        });
        
        // 移除内联代码标记 `code`
        result = result.replace(/`([^`]+)`/g, '$1');
        
        // 移除引用标记 >
        result = result.replace(/^>\s*/gm, '');
        
        // 移除列表标记 - * +
        result = result.replace(/^[\s]*[-*+]\s+/gm, '');
        
        // 移除有序列表标记 1. 2. 等
        result = result.replace(/^[\s]*\d+\.\s+/gm, '');
        
        // 移除水平分割线
        result = result.replace(/^[-*_]{3,}$/gm, '');
        
        // 移除标签 #tag
        result = result.replace(/#\w+/g, '');
        
        // 清理多余的空行，保留段落结构
        result = result.replace(/\n{3,}/g, '\n\n');
        
        // 清理首尾空白
        result = result.trim();
        
        return result;
    }
}