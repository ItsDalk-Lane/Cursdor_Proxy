import { App, TFile, Vault } from "obsidian";
import { ConversationSaveConfig } from "../../model/action/AICallFormAction";
import { ChatMessage } from "../../view/shared/chat/FloatingChatDialog";
import { debugManager } from "../../utils/DebugManager";

/**
 * 对话保存服务
 * 负责将对话内容保存到Obsidian文件中
 */
export class ConversationSaveService {
    private app: App;
    private vault: Vault;

    constructor(app: App) {
        this.app = app;
        this.vault = app.vault;
    }

    /**
     * 保存对话到文件
     * @param messages 对话消息列表
     * @param saveConfig 保存配置
     */
    public async saveConversation(
        messages: ChatMessage[],
        saveConfig: ConversationSaveConfig
    ): Promise<void> {
        if (!saveConfig.enabled || messages.length === 0) {
            return;
        }

        try {
            const content = this.formatConversation(messages);
            const targetFile = await this.getTargetFile(saveConfig);

            if (targetFile) {
                await this.appendToFile(targetFile, content);
                debugManager.log('Conversation saved to:', targetFile.path);
            } else {
                debugManager.error('ConversationSaveService', 'Failed to get target file for saving conversation');
            }
        } catch (error) {
            debugManager.error('Failed to save conversation:', error);
            throw error;
        }
    }

    /**
     * 格式化对话内容为Markdown格式
     * @param messages 对话消息列表
     * @returns 格式化后的Markdown内容
     */
    private formatConversation(messages: ChatMessage[]): string {
        const timestamp = new Date().toLocaleString();
        let content = `\n\n---\n\n## AI对话记录 - ${timestamp}\n\n`;

        for (const message of messages) {
            const messageTime = new Date(message.timestamp).toLocaleTimeString();
            const roleLabel = message.role === 'user' ? '👤 用户' : '🤖 AI助手';
            
            content += `### ${roleLabel} (${messageTime})\n\n`;
            content += `${message.content}\n\n`;
        }

        content += `---\n\n`;
        return content;
    }

    /**
     * 获取目标文件
     * @param saveConfig 保存配置
     * @returns 目标文件对象
     */
    private async getTargetFile(saveConfig: ConversationSaveConfig): Promise<TFile | null> {
        if (saveConfig.saveToCurrentFile) {
            // 保存到当前活动文件
            const activeFile = this.app.workspace.getActiveFile();
            if (activeFile) {
                return activeFile;
            } else {
                debugManager.warn('ConversationSaveService', 'No active file found, cannot save to current file');
                return null;
            }
        } else if (saveConfig.targetFilePath) {
            // 保存到指定文件
            return await this.getOrCreateFile(saveConfig.targetFilePath);
        } else {
            debugManager.warn('ConversationSaveService', 'No target file specified for conversation save');
            return null;
        }
    }

    /**
     * 获取或创建文件
     * @param filePath 文件路径
     * @returns 文件对象
     */
    private async getOrCreateFile(filePath: string): Promise<TFile | null> {
        try {
            // 确保文件路径以.md结尾
            if (!filePath.endsWith('.md')) {
                filePath += '.md';
            }

            // 尝试获取现有文件
            let file = this.vault.getAbstractFileByPath(filePath);
            
            if (file instanceof TFile) {
                return file;
            }

            // 文件不存在，创建新文件
            const content = `# AI对话记录\n\n此文件用于保存AI对话记录。\n`;
            file = await this.vault.create(filePath, content);
            
            if (file instanceof TFile) {
                debugManager.log('Created new conversation file:', filePath);
                return file;
            }

            return null;
        } catch (error) {
            debugManager.error('Failed to get or create file:', filePath, error);
            return null;
        }
    }

    /**
     * 追加内容到文件
     * @param file 目标文件
     * @param content 要追加的内容
     */
    private async appendToFile(file: TFile, content: string): Promise<void> {
        try {
            const existingContent = await this.vault.read(file);
            const newContent = existingContent + content;
            await this.vault.modify(file, newContent);
            debugManager.log('Content appended to file:', file.path);
        } catch (error) {
            debugManager.error('Failed to append content to file:', file.path, error);
            throw error;
        }
    }

    /**
     * 验证文件路径是否有效
     * @param filePath 文件路径
     * @returns 是否有效
     */
    public isValidFilePath(filePath: string): boolean {
        if (!filePath || filePath.trim() === '') {
            return false;
        }

        // 检查是否包含非法字符
        const invalidChars = /[<>:"|?*]/;
        if (invalidChars.test(filePath)) {
            return false;
        }

        // 检查路径长度
        if (filePath.length > 255) {
            return false;
        }

        return true;
    }

    /**
     * 获取建议的文件名
     * @returns 建议的文件名
     */
    public getSuggestedFileName(): string {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
        return `AI对话记录_${dateStr}_${timeStr}.md`;
    }
}