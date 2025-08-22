import { App, Notice, TFile, TFolder, MarkdownView, Modal } from "obsidian";
import { IFormAction } from "src/model/action/IFormAction";
import { ContentCleanupFormAction, CleanupType } from "src/model/action/ContentCleanupFormAction";
import { FormActionType } from "src/model/enums/FormActionType";
import { FormTemplateProcessEngine } from "../../engine/FormTemplateProcessEngine";
import { ActionChain, ActionContext, IActionService } from "../IActionService";
import FormPlugin from "src/main";
import { BaseService } from "../../BaseService";
import { debugManager } from "../../../utils/DebugManager";

/**
 * 内容清理动作服务
 * 支持删除文件、文件夹、指定标题下的内容和清除文本格式
 */
export default class ContentCleanupActionService extends BaseService implements IActionService {
    private engine = new FormTemplateProcessEngine();

    constructor() {
        super('ContentCleanupActionService');
    }

    // 调试功能已由基类提供

    /**
     * 检查是否接受此动作
     */
    accept(action: IFormAction, context: ActionContext): boolean {
        const isAccepted = action.type === FormActionType.CONTENT_CLEANUP;
        this.debugLog(`接受动作检查: ${action.type} -> ${isAccepted}`);
        return isAccepted;
    }

    /**
     * 执行内容清理动作
     */
    async run(action: IFormAction, context: ActionContext, chain: ActionChain): Promise<void> {
        const formAction = action as ContentCleanupFormAction;
        const app = context.app;
        
        this.debugLog("开始执行内容清理动作", {
            cleanupType: formAction.cleanupType,
            targetFiles: formAction.targetFiles,
            targetFolders: formAction.targetFolders,
            targetFilePath: formAction.targetFilePath,
            headingName: formAction.headingName,
            recursive: formAction.recursive,
            requireConfirmation: formAction.requireConfirmation,
            enableDebug: formAction.enableDebug
        });

        try {
            // 如果需要确认，显示确认对话框
            if (formAction.requireConfirmation) {
                this.debugLog("显示确认对话框", { message: formAction.confirmationMessage });
                const confirmed = await this.showConfirmation(formAction, context);
                if (!confirmed) {
                    this.debugLog("用户取消了清理操作");
                    await chain.next(context);
                    return;
                }
                this.debugLog("用户确认了清理操作");
            }

            // 根据清理类型执行相应操作
            switch (formAction.cleanupType) {
                case CleanupType.DELETE_FILES:
                    this.debugLog("执行删除文件操作", { files: formAction.targetFiles });
                    await this.deleteFiles(formAction, context);
                    break;
                case CleanupType.DELETE_FOLDERS:
                    this.debugLog("执行删除文件夹操作", { folders: formAction.targetFolders, recursive: formAction.recursive });
                    await this.deleteFolders(formAction, context);
                    break;
                case CleanupType.DELETE_HEADING_CONTENT:
                    this.debugLog("执行删除标题内容操作", { filePath: formAction.targetFilePath, heading: formAction.headingName });
                    await this.deleteHeadingContent(formAction, context);
                    break;
                case CleanupType.CLEAR_TEXT_FORMAT:
                    this.debugLog("执行清除文本格式操作", { filePath: formAction.targetFilePath });
                    await this.clearTextFormat(formAction, context);
                    break;
                default:
                    this.debugLog("不支持的清理类型", { cleanupType: formAction.cleanupType });
                    throw new Error(`不支持的清理类型: ${formAction.cleanupType}`);
            }

            this.debugLog("内容清理动作执行完成", {
                type: formAction.cleanupType,
                timestamp: new Date().toISOString()
            });
            new Notice("✅ 内容清理完成");
            
            // 输出调试信息（如果启用了动作级别的调试）
            if (formAction.enableDebug) {
                debugManager.log('ContentCleanupActionService', '清理操作完成', {
                    type: formAction.cleanupType,
                    timestamp: new Date().toISOString()
                });
            }
            
        } catch (error) {
            this.debugLog("内容清理动作执行失败", { error: error.message, stack: error.stack });
            new Notice(`❌ 内容清理失败: ${error.message}`);
            throw error;
        }

        // 继续执行下一个动作
        await chain.next(context);
    }

    /**
     * 显示确认对话框
     */
    private async showConfirmation(formAction: ContentCleanupFormAction, context: ActionContext): Promise<boolean> {
        return new Promise(async (resolve) => {
            const message = formAction.confirmationMessage || "确认要执行此清理操作吗？";
            const processedMessage = await this.engine.process(message, context.state, context.app, context.config);
            
            // 创建确认对话框
            const modal = new ConfirmationModal(context.app, String(processedMessage), resolve);
            modal.open();
        });
    }

    /**
     * 删除文件
     */
    private async deleteFiles(formAction: ContentCleanupFormAction, context: ActionContext): Promise<void> {
        if (!formAction.targetFiles || formAction.targetFiles.length === 0) {
            throw new Error("未指定要删除的文件");
        }

        this.debugLog("开始删除文件", { fileCount: formAction.targetFiles.length });

        for (const filePath of formAction.targetFiles) {
            const processedPath = await this.engine.process(filePath, context.state, context.app, context.config);
            const pathString = String(processedPath);
            
            this.debugLog("正在删除文件", { filePath: pathString });
            
            const file = context.app.vault.getAbstractFileByPath(pathString);
            if (file instanceof TFile) {
                await context.app.vault.delete(file);
                this.debugLog("文件删除成功", { filePath: pathString });
            } else {
                this.debugLog("文件不存在，跳过删除", { filePath: pathString });
            }
        }
    }

    /**
     * 删除文件夹
     */
    private async deleteFolders(formAction: ContentCleanupFormAction, context: ActionContext): Promise<void> {
        if (!formAction.targetFolders || formAction.targetFolders.length === 0) {
            throw new Error("未指定要删除的文件夹");
        }

        this.debugLog("开始删除文件夹", { folderCount: formAction.targetFolders.length });

        for (const folderPath of formAction.targetFolders) {
            const processedPath = await this.engine.process(folderPath, context.state, context.app, context.config);
            const pathString = String(processedPath);
            
            this.debugLog("正在删除文件夹", { folderPath: pathString, recursive: formAction.recursive });
            
            const folder = context.app.vault.getAbstractFileByPath(pathString);
            if (folder instanceof TFolder) {
                try {
                    if (formAction.recursive) {
                        // 递归删除：先删除文件夹内的所有内容
                        this.debugLog("递归删除文件夹内容", { folderPath: processedPath });
                        await this.recursiveDeleteFolderContents(folder, context);
                    }
                    
                    // 删除文件夹本身
                    await context.app.vault.delete(folder, formAction.recursive || false);
                    this.debugLog("文件夹删除成功", { folderPath: processedPath });
                } catch (error) {
                    this.debugLog("文件夹删除失败", { folderPath: processedPath, error: error.message });
                    // 如果标准删除失败，尝试强制递归删除
                    if (formAction.recursive) {
                        this.debugLog("尝试强制递归删除", { folderPath: processedPath });
                        await this.forceDeleteFolder(folder, context);
                        this.debugLog("强制删除成功", { folderPath: processedPath });
                    } else {
                        throw new Error(`删除文件夹失败: ${processedPath}. ${error.message}. 提示：如果文件夹不为空，请启用递归删除选项。`);
                    }
                }
            } else {
                this.debugLog("文件夹不存在，跳过删除", { folderPath: processedPath });
            }
        }
    }

    /**
     * 递归删除文件夹内容
     */
    private async recursiveDeleteFolderContents(folder: TFolder, context: ActionContext): Promise<void> {
        this.debugLog("开始递归删除文件夹内容", { folderPath: folder.path });
        
        // 获取文件夹中的所有子项
        const children = folder.children.slice(); // 创建副本避免在迭代时修改数组
        
        for (const child of children) {
            if (child instanceof TFile) {
                this.debugLog("删除文件", { filePath: child.path });
                await context.app.vault.delete(child);
            } else if (child instanceof TFolder) {
                this.debugLog("递归删除子文件夹", { folderPath: child.path });
                await this.recursiveDeleteFolderContents(child, context);
                await context.app.vault.delete(child);
            }
        }
        
        this.debugLog("文件夹内容删除完成", { folderPath: folder.path });
    }

    /**
     * 强制删除文件夹（当标准方法失败时使用）
     */
    private async forceDeleteFolder(folder: TFolder, context: ActionContext): Promise<void> {
        this.debugLog("开始强制删除文件夹", { folderPath: folder.path });
        
        try {
            // 先递归删除所有内容
            await this.recursiveDeleteFolderContents(folder, context);
            
            // 再次尝试删除空文件夹
            await context.app.vault.delete(folder);
            
            this.debugLog("强制删除文件夹成功", { folderPath: folder.path });
        } catch (error) {
            this.debugLog("强制删除文件夹仍然失败", { folderPath: folder.path, error: error.message });
            throw new Error(`无法删除文件夹 ${folder.path}: ${error.message}`);
        }
    }

    /**
     * 删除指定标题下的内容
     */
    private async deleteHeadingContent(formAction: ContentCleanupFormAction, context: ActionContext): Promise<void> {
        if (!formAction.headingName) {
            throw new Error("未指定要删除内容的标题名称");
        }

        const targetFile = await this.getTargetFile(formAction, context);
        const processedHeading = await this.engine.process(formAction.headingName, context.state, context.app, context.config);
        const headingString = String(processedHeading);
        
        // 处理标题名称，去除可能包含的Markdown标题符号
        const cleanHeadingName = headingString.replace(/^#+\s*/, '').trim();
        
        this.debugLog("开始删除标题下的内容", { 
            filePath: targetFile.path, 
            originalHeadingName: headingString,
            cleanHeadingName: cleanHeadingName,
            deleteToSameLevelHeading: formAction.deleteToSameLevelHeading !== false,
            deleteMode: formAction.deleteToSameLevelHeading !== false ? "删除到同级或更高级标题" : "只删除正文内容"
        });

        const content = await context.app.vault.read(targetFile);
        const lines = content.split('\n');
        const newLines: string[] = [];
        let inTargetSection = false;
        let targetHeadingLevel = 0;
        let deletedLinesCount = 0;
        let foundTargetHeading = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const headingMatch = line.match(/^(#+)\s+(.+)$/);
            
            if (headingMatch) {
                const level = headingMatch[1].length;
                const title = headingMatch[2].trim();
                
                if (title === cleanHeadingName && !foundTargetHeading) {
                    // 找到目标标题（只匹配第一个）
                    foundTargetHeading = true;
                    inTargetSection = true;
                    targetHeadingLevel = level;
                    newLines.push(line); // 保留标题行
                    this.debugLog("找到目标标题", { level, title, cleanHeadingName, lineIndex: i });
                    continue;
                } else if (inTargetSection) {
                    // 根据设置决定是否结束删除区域
                    const shouldStopAtSameLevel = formAction.deleteToSameLevelHeading !== false; // 默认为true
                    const shouldStopAtAnyHeading = !shouldStopAtSameLevel;
                    
                    if (shouldStopAtAnyHeading) {
                        // 遇到任何标题就停止删除
                        this.debugLog("遇到标题，结束删除区域（只删除正文模式）", { 
                            currentLevel: level, 
                            targetLevel: targetHeadingLevel, 
                            title, 
                            lineIndex: i 
                        });
                        inTargetSection = false;
                        newLines.push(line); // 保留这个新标题
                        continue;
                    } else if (level <= targetHeadingLevel) {
                        // 遇到同级或更高级标题，结束删除区域
                        this.debugLog("遇到同级或更高级标题，结束删除区域", { 
                            currentLevel: level, 
                            targetLevel: targetHeadingLevel, 
                            title, 
                            lineIndex: i 
                        });
                        inTargetSection = false;
                        newLines.push(line); // 保留这个新标题
                        continue;
                    }
                }
            }
            
            if (inTargetSection) {
                // 在目标区域内，删除内容（不包括标题行本身）
                deletedLinesCount++;
                this.debugLog("删除行内容", { lineIndex: i, content: line.substring(0, 50) + (line.length > 50 ? '...' : '') });
            } else {
                // 不在目标区域内，保留内容
                newLines.push(line);
            }
        }

        if (!foundTargetHeading) {
            this.debugLog("未找到目标标题", { 
                originalHeadingName: processedHeading,
                cleanHeadingName: cleanHeadingName,
                availableHeadings: lines.filter(line => line.match(/^#+\s+/)).map(line => {
                    const match = line.match(/^(#+)\s+(.+)$/);
                    return match ? { level: match[1].length, title: match[2].trim() } : null;
                }).filter(Boolean)
            });
            throw new Error(`未找到标题: ${cleanHeadingName} (原始输入: ${processedHeading})`);
        }

        if (deletedLinesCount === 0) {
            this.debugLog("目标标题下没有内容可删除", { 
                originalHeadingName: processedHeading,
                cleanHeadingName: cleanHeadingName
            });
        } else {
            this.debugLog("标题下内容删除完成", { 
                originalHeadingName: processedHeading,
                cleanHeadingName: cleanHeadingName,
                deletedLinesCount,
                originalLinesCount: lines.length,
                newLinesCount: newLines.length
            });
        }

        await context.app.vault.modify(targetFile, newLines.join('\n'));
    }



    /**
     * 清除文本格式
     */
    private async clearTextFormat(formAction: ContentCleanupFormAction, context: ActionContext): Promise<void> {
        const targetFile = await this.getTargetFile(formAction, context);
        
        this.debugLog("开始清除文本格式", { 
            filePath: targetFile.path,
            formatClearOptions: formAction.formatClearOptions
        });

        const content = await context.app.vault.read(targetFile);
        const options = formAction.formatClearOptions || {};
        
        // 如果启用了一键清除所有格式，则清除所有格式
        const shouldClearAll = options.clearAll;
        
        let cleanContent = content;
        let clearedFormats: string[] = [];
        
        // 清除粗体格式
        if (shouldClearAll || options.clearBold) {
            cleanContent = cleanContent
                .replace(/\*\*(.*?)\*\*/g, '$1')
                .replace(/__(.*?)__/g, '$1');
            clearedFormats.push('粗体');
        }
        
        // 清除斜体格式
        if (shouldClearAll || options.clearItalic) {
            cleanContent = cleanContent
                .replace(/\*(.*?)\*/g, '$1')
                .replace(/_(.*?)_/g, '$1');
            clearedFormats.push('斜体');
        }
        
        // 清除删除线格式
        if (shouldClearAll || options.clearStrikethrough) {
            cleanContent = cleanContent.replace(/~~(.*?)~~/g, '$1');
            clearedFormats.push('删除线');
        }
        
        // 清除高亮格式
        if (shouldClearAll || options.clearHighlight) {
            cleanContent = cleanContent.replace(/==(.*?)==/g, '$1');
            clearedFormats.push('高亮');
        }
        
        // 清除行内代码格式
        if (shouldClearAll || options.clearInlineCode) {
            cleanContent = cleanContent.replace(/`([^`]+)`/g, '$1');
            clearedFormats.push('行内代码');
        }
        
        // 清除链接格式，保留链接文本
        if (shouldClearAll || options.clearLinks) {
            cleanContent = cleanContent.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
            clearedFormats.push('链接');
        }
        
        // 清除图片格式
        if (shouldClearAll || options.clearImages) {
            cleanContent = cleanContent.replace(/!\[([^\]]*)\]\([^\)]+\)/g, '$1');
            clearedFormats.push('图片');
        }
        
        // 清除引用格式
        if (shouldClearAll || options.clearQuotes) {
            cleanContent = cleanContent.replace(/^>\s*/gm, '');
            clearedFormats.push('引用');
        }
        
        // 清除列表格式
        if (shouldClearAll || options.clearLists) {
            cleanContent = cleanContent
                .replace(/^[\s]*[-*+]\s+/gm, '')
                .replace(/^[\s]*\d+\.\s+/gm, '');
            clearedFormats.push('列表');
        }
        
        // 清除标题格式
        if (shouldClearAll || options.clearHeadings) {
            cleanContent = cleanContent.replace(/^#+\s+/gm, '');
            clearedFormats.push('标题');
        }
        
        // 清除注释
        if (shouldClearAll || options.clearComments) {
            // 清除Obsidian注释格式 %% 注释 %%
            cleanContent = cleanContent.replace(/%%[\s\S]*?%%/g, '');
            // 清除HTML注释格式 <!-- 注释 -->
            cleanContent = cleanContent.replace(/<!--[\s\S]*?-->/g, '');
            clearedFormats.push('注释');
        }
        
        // 清除脚注
        if (shouldClearAll || options.clearFootnotes) {
            // 清除脚注引用 [^1]
            cleanContent = cleanContent.replace(/\[\^[^\]]+\]/g, '');
            // 清除脚注定义 [^1]: 脚注内容
            cleanContent = cleanContent.replace(/^\[\^[^\]]+\]:[\s\S]*?(?=\n\n|\n\[|$)/gm, '');
            clearedFormats.push('脚注');
        }
        
        // 清除表格
        if (shouldClearAll || options.clearTables) {
            // 清除表格格式，保留表格内容
            cleanContent = cleanContent.replace(/^\|(.*?)\|\s*$/gm, (match: string, content: string) => {
                // 提取表格单元格内容，去除 | 分隔符
                const cells = content.split('|').map((cell: string) => cell.trim()).filter((cell: string) => cell.length > 0);
                return cells.join(' ');
            });
            // 清除表格分隔行（如 |---|---| ）
            cleanContent = cleanContent.replace(/^\|[\s\-\|:]*\|\s*$/gm, '');
            // 清除多余的空行
            cleanContent = cleanContent.replace(/\n\n\n+/g, '\n\n');
            clearedFormats.push('表格');
        }
        
        // 清除数学块
        if (shouldClearAll || options.clearMathBlocks) {
            // 清除数学块格式，保留数学公式内容 $$ 公式 $$
            cleanContent = cleanContent.replace(/\$\$([\s\S]*?)\$\$/g, '$1');
            // 清除行内数学公式格式，保留公式内容 $ 公式 $
            cleanContent = cleanContent.replace(/\$([^$\n]+)\$/g, '$1');
            clearedFormats.push('数学块');
        }
        
        // 清除属性（frontmatter）
        if (shouldClearAll || options.clearProperties) {
            // 清除YAML frontmatter
            cleanContent = cleanContent.replace(/^---[\s\S]*?---\n?/, '');
            clearedFormats.push('属性');
        }
        
        // 清理多余的空行
        cleanContent = cleanContent.replace(/\n\n\n+/g, '\n\n').trim();

        await context.app.vault.modify(targetFile, cleanContent);
        
        this.debugLog("文本格式清除完成", {
            clearedFormats,
            clearAll: shouldClearAll,
            originalLength: content.length,
            newLength: cleanContent.length
        });
    }

    /**
     * 获取目标文件
     */
    private async getTargetFile(formAction: ContentCleanupFormAction, context: ActionContext): Promise<TFile> {
        let targetPath: string;
        
        if (formAction.targetFilePath) {
            const processedPath = await this.engine.process(formAction.targetFilePath, context.state, context.app, context.config);
            targetPath = String(processedPath);
        } else {
            // 使用当前活动文件
            const activeView = context.app.workspace.getActiveViewOfType(MarkdownView);
            if (!activeView || !activeView.file) {
                throw new Error("未指定目标文件且当前没有活动的Markdown文件");
            }
            targetPath = activeView.file.path;
        }

        const file = context.app.vault.getAbstractFileByPath(targetPath);
        if (!(file instanceof TFile)) {
            throw new Error(`目标文件不存在: ${targetPath}`);
        }

        return file;
    }


}

/**
 * 确认对话框模态窗口
 */
class ConfirmationModal extends Modal {
    private message: string;
    private callback: (confirmed: boolean) => void;

    constructor(app: App, message: string, callback: (confirmed: boolean) => void) {
        super(app);
        this.message = message;
        this.callback = callback;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        
        contentEl.createEl('h2', { text: '确认操作' });
        contentEl.createEl('p', { text: this.message });
        
        const buttonContainer = contentEl.createDiv({ cls: 'modal-button-container' });
        
        const confirmButton = buttonContainer.createEl('button', { 
            text: '确认', 
            cls: 'mod-cta' 
        });
        confirmButton.onclick = () => {
            this.close();
            this.callback(true);
        };
        
        const cancelButton = buttonContainer.createEl('button', { 
            text: '取消' 
        });
        cancelButton.onclick = () => {
            this.close();
            this.callback(false);
        };
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}