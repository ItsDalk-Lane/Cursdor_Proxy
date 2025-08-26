/**
 * 统一的文件操作工具类
 * 整合和优化文件相关的操作，减少重复代码
 */

import { App, TFile, normalizePath, Notice, TFolder, MarkdownView } from "obsidian";
import { localInstance } from "src/i18n/locals";
import { processObTemplate } from "./templates";
import { globalErrorHandler, ErrorType, ErrorSeverity } from "../core/ErrorHandler";
import { globalPerformanceMonitor } from "../core/PerformanceMonitor";

export interface CreateFileOptions {
    /** 是否在文件已存在时覆盖 */
    overwrite?: boolean;
    /** 是否在创建失败时显示通知 */
    showNotice?: boolean;
    /** 文件创建前的模板处理 */
    processTemplate?: boolean;
    /** 自定义模板上下文 */
    templateContext?: Record<string, any>;
}

export interface WriteOptions {
    mode?: 'insert' | 'replace' | 'append';
    position?: 'cursor' | 'end' | number;
    newline?: boolean;
}

export class FileOperations {
    private app: App;

    constructor(app: App) {
        this.app = app;
    }

    /**
     * 创建文件（整合 createFileByText 逻辑）
     */
    async createFile(
        filePath: string,
        content: string,
        options: CreateFileOptions = {}
    ): Promise<TFile | null> {
        const metricId = globalPerformanceMonitor.startMetric('file-create', {
            filePath,
            contentLength: content.length
        });

        try {
            const result = await globalErrorHandler.safeExecute(
                async () => {
                    // 标准化路径
                    const normalizedPath = normalizePath(filePath);
                    
                    // 确保父目录存在
                    await this.ensureDirectoryExists(normalizedPath);
                    
                    // 检查文件是否已存在
                    const existingFile = this.app.vault.getAbstractFileByPath(normalizedPath);
                    if (existingFile && !options.overwrite) {
                        if (options.showNotice !== false) {
                            new Notice(localInstance.file_already_exists.format(filePath));
                        }
                        return existingFile as TFile;
                    }
                    
                    // 处理模板
                    let processedContent = content;
                    if (options.processTemplate !== false) {
                        processedContent = processObTemplate(content);
                    }
                    
                    // 创建文件
                    if (existingFile && options.overwrite) {
                        await this.app.vault.modify(existingFile as TFile, processedContent);
                        return existingFile as TFile;
                    } else {
                        return await this.app.vault.create(normalizedPath, processedContent);
                    }
                },
                {
                    type: ErrorType.FILE_SYSTEM,
                    severity: ErrorSeverity.MEDIUM,
                    message: `Failed to create file: ${filePath}`,
                    source: 'FileOperations.createFile'
                },
                null
            );
            return result ?? null;
        } finally {
            globalPerformanceMonitor.endMetric(metricId);
        }
    }

    /**
     * 确保目录存在
     */
    async ensureDirectoryExists(filePath: string): Promise<void> {
        const parentPath = filePath.substring(0, filePath.lastIndexOf("/"));
        if (parentPath && !(await this.app.vault.adapter.exists(parentPath))) {
            await this.app.vault.adapter.mkdir(parentPath);
        }
    }

    /**
     * 写入文本到编辑器（整合 write 逻辑）
     */
    async writeToEditor(text: string, options: WriteOptions = {}): Promise<boolean> {
        const metricId = globalPerformanceMonitor.startMetric('editor-write', {
            textLength: text.length,
            mode: options.mode
        });

        try {
            return await globalErrorHandler.safeExecute(
                async () => {
                    const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
                    if (!editor) {
                        throw new Error("No active editor found");
                    }

                    const mode = options.mode || 'insert';
                    const position = options.position || 'cursor';
                    const newline = options.newline || false;

                    let content = text;
                    if (newline && content && !content.startsWith('\n')) {
                        content = '\n' + content;
                    }

                    const from = editor.getCursor("from");

                    switch (mode) {
                        case 'replace':
                            const to = editor.getCursor("to");
                            const origin = editor.getSelection();
                            editor.replaceRange(content, from, to, origin);
                            break;

                        case 'append':
                            const lastLine = editor.lastLine();
                            const lastLineText = editor.getLine(lastLine);
                            let appendText = content;
                            if (newline) {
                                appendText = '\n' + appendText;
                            }
                            editor.replaceRange(appendText, { line: lastLine, ch: lastLineText.length });
                            break;

                        default: // 'insert'
                            if (typeof position === 'number') {
                                const line = Math.min(Math.max(position, 0), editor.lastLine());
                                const lineText = editor.getLine(line);
                                editor.replaceRange(content, { line, ch: lineText.length });
                            } else if (position === 'end') {
                                const lastLine = editor.lastLine();
                                const lastLineText = editor.getLine(lastLine);
                                const needNewline = lastLineText && lastLineText.trim().length > 0;
                                const appendText = needNewline ? '\n' + content : content;
                                editor.replaceRange(appendText, { line: lastLine, ch: lastLineText.length });
                            } else {
                                editor.replaceRange(content, from);
                            }
                    }

                    // 更新光标位置
                    const newCursor = {
                        line: from.line,
                        ch: from.ch + content.length
                    };
                    editor.setCursor(newCursor);

                    return true;
                },
                {
                    type: ErrorType.PLUGIN_API,
                    severity: ErrorSeverity.MEDIUM,
                    message: 'Failed to write to editor',
                    source: 'FileOperations.writeToEditor'
                },
                false
            ) || false;
        } finally {
            globalPerformanceMonitor.endMetric(metricId);
        }
    }

    /**
     * 读取文件内容
     */
    async readFile(filePath: string): Promise<string | null> {
        const metricId = globalPerformanceMonitor.startMetric('file-read', { filePath });

        try {
            const result = await globalErrorHandler.safeExecute(
                async () => {
                    const file = this.app.vault.getAbstractFileByPath(normalizePath(filePath));
                    if (!file || !(file instanceof TFile)) {
                        return null;
                    }
                    return await this.app.vault.read(file);
                },
                {
                    type: ErrorType.FILE_SYSTEM,
                    severity: ErrorSeverity.MEDIUM,
                    message: `Failed to read file: ${filePath}`,
                    source: 'FileOperations.readFile'
                },
                null
            );
            return result ?? null;
        } finally {
            globalPerformanceMonitor.endMetric(metricId);
        }
    }

    /**
     * 批量文件操作
     */
    async batchOperation<T>(
        operations: Array<() => Promise<T>>,
        maxConcurrency: number = 5
    ): Promise<Array<T | null>> {
        const metricId = globalPerformanceMonitor.startMetric('file-batch-operation', {
            operationCount: operations.length,
            maxConcurrency
        });

        try {
            const results: Array<T | null> = [];
            
            // 分批处理
            for (let i = 0; i < operations.length; i += maxConcurrency) {
                const batch = operations.slice(i, i + maxConcurrency);
                const batchResults = await Promise.allSettled(
                    batch.map(op => op())
                );
                
                results.push(...batchResults.map(result => 
                    result.status === 'fulfilled' ? result.value : null
                ));
            }
            
            return results;
        } finally {
            globalPerformanceMonitor.endMetric(metricId);
        }
    }

    /**
     * 检查文件是否存在
     */
    async fileExists(filePath: string): Promise<boolean> {
        try {
            return await this.app.vault.adapter.exists(normalizePath(filePath));
        } catch {
            return false;
        }
    }

    /**
     * 获取文件统计信息
     */
    async getFileStats(filePath: string): Promise<{ size: number; modified: number } | null> {
        try {
            const stats = await this.app.vault.adapter.stat(normalizePath(filePath));
            return stats ? { size: stats.size, modified: stats.mtime } : null;
        } catch {
            return null;
        }
    }

    /**
     * 安全删除文件
     */
    async deleteFile(filePath: string, moveToTrash: boolean = true): Promise<boolean> {
        const metricId = globalPerformanceMonitor.startMetric('file-delete', { filePath });

        try {
            return await globalErrorHandler.safeExecute(
                async () => {
                    const file = this.app.vault.getAbstractFileByPath(normalizePath(filePath));
                    if (!file) {
                        return false;
                    }

                    if (moveToTrash) {
                        await this.app.vault.trash(file, false);
                    } else {
                        await this.app.vault.delete(file);
                    }
                    
                    return true;
                },
                {
                    type: ErrorType.FILE_SYSTEM,
                    severity: ErrorSeverity.HIGH,
                    message: `Failed to delete file: ${filePath}`,
                    source: 'FileOperations.deleteFile'
                },
                false
            ) || false;
        } finally {
            globalPerformanceMonitor.endMetric(metricId);
        }
    }
}

/**
 * 全局文件操作实例工厂
 */
export function createFileOperations(app: App): FileOperations {
    return new FileOperations(app);
}