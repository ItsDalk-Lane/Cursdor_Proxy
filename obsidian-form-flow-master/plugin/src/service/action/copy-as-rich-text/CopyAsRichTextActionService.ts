import { App, Notice, TFile, MarkdownView } from "obsidian";
import { IFormAction } from "src/model/action/IFormAction";
import { CopyAsRichTextFormAction } from "src/model/action/CopyAsRichTextFormAction";
import { FormActionType } from "src/model/enums/FormActionType";
import { FormTemplateProcessEngine } from "../../engine/FormTemplateProcessEngine";
import { ActionChain, ActionContext, IActionService } from "../IActionService";
import { BaseService } from "../../BaseService";

/**
 * 复制为Markdown格式动作服务
 * 将Obsidian文档内容转换为标准Markdown格式并复制到系统剪贴板
 */
export default class CopyAsRichTextActionService extends BaseService implements IActionService {
    private engine = new FormTemplateProcessEngine();

    constructor() {
        super('CopyAsRichTextActionService');
    }

    /**
     * 检查是否接受此动作
     */
    accept(action: IFormAction, context: ActionContext): boolean {
        const isAccepted = action.type === FormActionType.COPY_AS_RICH_TEXT;
        this.debugLog(`接受动作检查: ${action.type} -> ${isAccepted}`);
        return isAccepted;
    }

    /**
     * 执行复制为富文本动作
     */
    async run(action: IFormAction, context: ActionContext, chain: ActionChain): Promise<void> {
        const formAction = action as CopyAsRichTextFormAction;
        const app = context.app;
        
        this.debugLog("开始执行复制为Markdown格式动作", {
            targetMode: formAction.targetMode,
            includeImages: formAction.includeImages
        });

        try {
            const file = await this.getTargetFile(formAction, context);
            if (!file) {
                throw new Error("无法找到目标文件");
            }

            const content = await app.vault.cachedRead(file);
            
            // 转换为标准Markdown格式
            const markdownContent = await this.convertToMarkdown(content, file, formAction, app);
            
            // 复制到剪贴板
            await navigator.clipboard.writeText(markdownContent);
            
            new Notice("✅ 内容已复制为Markdown格式");
            this.debugLog("复制为Markdown格式完成", { fileSize: content.length });
            
        } catch (error) {
            this.debugLog("复制为Markdown格式失败", error);
            new Notice(`❌ 复制失败: ${error.message}`);
            throw error;
        }

        // 继续执行下一个动作
        await chain.next(context);
    }

    /**
     * 获取目标文件
     */
    private async getTargetFile(action: CopyAsRichTextFormAction, context: ActionContext): Promise<TFile | null> {
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
     * 将Obsidian内容转换为标准Markdown格式
     */
    private async convertToMarkdown(content: string, file: TFile, action: CopyAsRichTextFormAction, app: App): Promise<string> {
        let markdownContent = content;

        // 1. 处理图片链接 - 转换为标准Markdown格式
        if (action.includeImages) {
            markdownContent = await this.convertImagesToMarkdown(markdownContent, file, app);
        } else {
            // 如果不包含图片，移除所有图片链接
            markdownContent = markdownContent.replace(/!\[\[([^\]]*?)\]\]/g, '');
        }

        // 2. 转换Obsidian特有语法为标准Markdown
        markdownContent = this.convertObsidianToMarkdown(markdownContent);

        return markdownContent;
    }

    /**
     * 将Obsidian图片链接转换为标准Markdown格式
     */
    private async convertImagesToMarkdown(content: string, file: TFile, app: App): Promise<string> {
        const imageRegex = /!\[\[([^\]]*?)(\|([^\]]*?))?\]\]/g;
        let result = content;
        
        const matches = [...content.matchAll(imageRegex)];
        for (const match of matches) {
            const imagePath = match[1];
            const displayText = match[3] || imagePath;
            
            try {
                const imageFile = this.findImageFile(imagePath, file, app);
                if (imageFile) {
                    // 转换为标准Markdown图片链接格式
                    const replacement = `![${displayText}](${imagePath})`;
                    result = result.replace(match[0], replacement);
                    this.debugLog(`转换图片链接: ${imagePath}`);
                } else {
                    // 图片文件不存在，保持原格式或移除
                    result = result.replace(match[0], `![${displayText}](${imagePath})`);
                    this.debugLog(`图片文件不存在，保持链接: ${imagePath}`);
                }
            } catch (error) {
                this.debugLog(`图片处理失败: ${imagePath}`, error);
                // 保持原格式
                result = result.replace(match[0], `![${displayText}](${imagePath})`);
            }
        }
        
        return result;
    }

    /**
     * 转换Obsidian特有语法为标准Markdown
     */
    private convertObsidianToMarkdown(content: string): string {
        let result = content;
        
        // 转换内部链接 [[链接]] 为标准Markdown链接
        result = result.replace(/\[\[([^\]]+)\]\]/g, '[$1]($1)');
        
        // 转换带显示文本的内部链接 [[链接|显示文本]] 为标准Markdown链接
        result = result.replace(/\[\[([^\]]+)\|([^\]]+)\]\]/g, '[$2]($1)');
        
        // 转换标签 #标签 为普通文本（保持原样）
        // 标签在标准Markdown中没有对应语法，保持原样
        
        // 转换高亮 ==文本== 为粗体（标准Markdown中没有高亮语法）
        result = result.replace(/==([^=]+)==/g, '**$1**');
        
        // 转换删除线 ~~文本~~ （标准Markdown支持）
        // 保持原样，标准Markdown支持
        
        return result;
    }

    /**
     * 查找图片文件
     */
    private findImageFile(imagePath: string, sourceFile: TFile, app: App): TFile | null {
        // 先尝试相对于源文件的路径
        const sourceFolder = sourceFile.parent?.path || '';
        const relativePath = sourceFolder ? `${sourceFolder}/${imagePath}` : imagePath;
        
        let imageFile = app.vault.getAbstractFileByPath(relativePath);
        if (imageFile instanceof TFile) {
            return imageFile;
        }
        
        // 再尝试绝对路径
        imageFile = app.vault.getAbstractFileByPath(imagePath);
        if (imageFile instanceof TFile) {
            return imageFile;
        }
        
        // 最后尝试搜索所有文件
        const files = app.vault.getFiles();
        for (const file of files) {
            if (file.name === imagePath || file.basename === imagePath) {
                return file;
            }
        }
        
        return null;
    }


}