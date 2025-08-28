import React, { useState, useRef, useEffect, useCallback } from "react";
import { App, MarkdownRenderer, Component } from "obsidian";
import { ConversationSaveConfig } from "../../../model/action/AICallFormAction";
import { debugManager } from "../../../utils/DebugManager";
import { ChatService, ChatConfig, StreamResponseCallback } from "../../../service/chat/ChatService";

/**
 * 对话消息接口
 */
export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

/**
 * 窗口状态接口
 */
export interface WindowState {
    isMinimized: boolean;
    position: { x: number; y: number };
    size: { width: number; height: number };
    isVisible: boolean;
}

/**
 * 悬浮对话界面配置接口
 */
export interface FloatingChatDialogOptions {
    app: App;
    modelId: string;
    promptTemplate?: string;
    conversationSave?: ConversationSaveConfig;
    onClose?: () => void;
}

/**
 * 悬浮对话界面组件
 */
export class FloatingChatDialog {
    private app: App;
    private containerEl: HTMLElement;
    private dialogEl: HTMLElement;
    private minimizedEl: HTMLElement;
    private chatContentEl: HTMLElement;
    private inputEl: HTMLTextAreaElement;
    private sendBtn: HTMLButtonElement;
    private modelSelectEl: HTMLSelectElement;
    private templateSelectEl: HTMLSelectElement;
    
    private windowState: WindowState;
    private messages: ChatMessage[] = [];
    private isDragging = false;
    private isResizing = false;
    private dragOffset = { x: 0, y: 0 };
    private resizeHandle = '';
    
    private options: FloatingChatDialogOptions;
    private markdownComponent: Component;
    private chatService: ChatService;
    private sessionId: string;
    private isProcessing = false;
    
    constructor(options: FloatingChatDialogOptions) {
        this.options = options;
        this.app = options.app;
        this.markdownComponent = new Component();
        this.chatService = new ChatService(options.app);
        this.sessionId = this.chatService.createSession({
            modelId: options.modelId,
            promptTemplate: options.promptTemplate,
            saveConfig: options.conversationSave
        });
        
        // 初始化窗口状态
        this.windowState = {
            isMinimized: false,
            position: { x: window.innerWidth - 420, y: 100 },
            size: { width: 400, height: 600 },
            isVisible: true
        };
        
        this.createDialog();
        this.createMinimizedIcon();
        this.setupEventListeners();
        
        debugManager.info('FloatingChatDialog', '悬浮对话界面已创建，会话ID:', this.sessionId);
    }
    
    /**
     * 创建对话界面
     */
    private createDialog(): void {
        // 创建主容器
        this.containerEl = document.createElement('div');
        this.containerEl.className = 'floating-chat-container';
        this.containerEl.style.cssText = `
            position: fixed;
            top: ${this.windowState.position.y}px;
            left: ${this.windowState.position.x}px;
            width: ${this.windowState.size.width}px;
            height: ${this.windowState.size.height}px;
            z-index: 9999;
            background: var(--background-primary);
            border: 1px solid var(--background-modifier-border);
            border-radius: 8px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            resize: both;
            min-width: 300px;
            min-height: 400px;
        `;
        
        // 创建标题栏
        const headerEl = document.createElement('div');
        headerEl.className = 'chat-header';
        headerEl.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 12px;
            background: var(--background-secondary);
            border-bottom: 1px solid var(--background-modifier-border);
            cursor: move;
            user-select: none;
            gap: 12px;
        `;
        
        // 左侧区域：标题和选择器
        const leftAreaEl = document.createElement('div');
        leftAreaEl.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            flex: 1;
            min-width: 0;
            overflow: hidden;
        `;
        
        const titleEl = document.createElement('div');
        titleEl.textContent = 'AI 对话';
        titleEl.style.cssText = `
            font-weight: 600;
            color: var(--text-normal);
            white-space: nowrap;
            flex-shrink: 1;
            min-width: 40px;
            overflow: hidden;
            text-overflow: ellipsis;
        `;
        
        // 模型选择器
        this.modelSelectEl = document.createElement('select');
        this.modelSelectEl.style.cssText = `
            min-width: 80px;
            max-width: 120px;
            padding: 2px 6px;
            border: 1px solid var(--background-modifier-border);
            border-radius: 4px;
            background: var(--background-primary);
            color: var(--text-normal);
            font-size: 12px;
            flex-shrink: 1;
        `;
        
        // 阻止下拉列表事件冒泡到拖拽处理
        this.modelSelectEl.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });
        this.modelSelectEl.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // 模板选择器
        this.templateSelectEl = document.createElement('select');
        this.templateSelectEl.style.cssText = `
            min-width: 80px;
            max-width: 120px;
            padding: 2px 6px;
            border: 1px solid var(--background-modifier-border);
            border-radius: 4px;
            background: var(--background-primary);
            color: var(--text-normal);
            font-size: 12px;
            flex-shrink: 1;
        `;
        
        // 阻止下拉列表事件冒泡到拖拽处理
        this.templateSelectEl.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });
        this.templateSelectEl.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        leftAreaEl.appendChild(titleEl);
        leftAreaEl.appendChild(this.modelSelectEl);
        leftAreaEl.appendChild(this.templateSelectEl);
        
        const buttonsEl = document.createElement('div');
        buttonsEl.style.cssText = `
            display: flex;
            gap: 2px;
            flex-shrink: 0;
            align-items: center;
        `;
        
        // 保存对话按钮
        const saveBtn = document.createElement('button');
        saveBtn.innerHTML = '💾';
        saveBtn.title = '保存对话';
        saveBtn.style.cssText = `
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            font-size: 14px;
            min-width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.2s;
        `;
        saveBtn.addEventListener('click', () => this.saveConversation());
        saveBtn.addEventListener('mouseenter', () => {
            saveBtn.style.backgroundColor = 'var(--background-modifier-hover)';
        });
        saveBtn.addEventListener('mouseleave', () => {
            saveBtn.style.backgroundColor = 'transparent';
        });
        
        // 清除对话按钮
        const clearBtn = document.createElement('button');
        clearBtn.innerHTML = '🗑️';
        clearBtn.title = '清除对话';
        clearBtn.style.cssText = `
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            font-size: 14px;
            min-width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.2s;
        `;
        clearBtn.addEventListener('click', () => this.clearConversation());
        clearBtn.addEventListener('mouseenter', () => {
            clearBtn.style.backgroundColor = 'var(--background-modifier-hover)';
        });
        clearBtn.addEventListener('mouseleave', () => {
            clearBtn.style.backgroundColor = 'transparent';
        });
        
        // 最小化按钮
        const minimizeBtn = document.createElement('button');
        minimizeBtn.innerHTML = '−';
        minimizeBtn.title = '最小化';
        minimizeBtn.style.cssText = `
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            font-weight: bold;
            min-width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.2s;
        `;
        minimizeBtn.addEventListener('click', () => this.minimize());
        minimizeBtn.addEventListener('mouseenter', () => {
            minimizeBtn.style.backgroundColor = 'var(--background-modifier-hover)';
        });
        minimizeBtn.addEventListener('mouseleave', () => {
            minimizeBtn.style.backgroundColor = 'transparent';
        });
        
        // 关闭按钮
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.title = '关闭';
        closeBtn.style.cssText = `
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            font-weight: bold;
            color: var(--text-error);
            min-width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.2s;
        `;
        closeBtn.addEventListener('click', () => this.close());
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.backgroundColor = 'var(--background-modifier-error-hover)';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.backgroundColor = 'transparent';
        });
        
        buttonsEl.appendChild(saveBtn);
        buttonsEl.appendChild(clearBtn);
        buttonsEl.appendChild(minimizeBtn);
        buttonsEl.appendChild(closeBtn);
        
        headerEl.appendChild(leftAreaEl);
        headerEl.appendChild(buttonsEl);
        
        // 创建对话内容区域
        this.chatContentEl = document.createElement('div');
        this.chatContentEl.className = 'chat-content';
        this.chatContentEl.style.cssText = `
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 12px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        `;
        
        // 创建输入区域
        const inputAreaEl = document.createElement('div');
        inputAreaEl.className = 'chat-input-area';
        inputAreaEl.style.cssText = `
            padding: 8px;
            border-top: 1px solid var(--background-modifier-border);
            background: var(--background-primary);
        `;
        
        // 创建输入框容器（包含输入框和发送按钮）
        const inputContainerEl = document.createElement('div');
        inputContainerEl.style.cssText = `
            position: relative;
            width: 100%;
            display: flex;
            align-items: flex-end;
        `;
        
        this.inputEl = document.createElement('textarea');
        this.inputEl.placeholder = '输入您的问题...';
        this.inputEl.style.cssText = `
            width: 100%;
            min-height: 40px;
            max-height: 120px;
            padding: 8px 48px 8px 12px;
            border: 1px solid var(--background-modifier-border);
            border-radius: 20px;
            background: var(--background-primary);
            color: var(--text-normal);
            resize: none;
            font-family: var(--font-interface);
            line-height: 1.4;
            outline: none;
        `;
        
        this.sendBtn = document.createElement('button');
        this.sendBtn.innerHTML = '➤';
        this.sendBtn.title = '发送消息';
        this.sendBtn.style.cssText = `
            position: absolute;
            right: 6px;
            bottom: 6px;
            width: 32px;
            height: 32px;
            background: var(--interactive-accent);
            color: var(--text-on-accent);
            border: none;
            border-radius: 50%;
            cursor: pointer;
            font-size: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            z-index: 1;
        `;
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        
        // 添加悬停效果
        this.sendBtn.addEventListener('mouseenter', () => {
            if (!this.sendBtn.disabled) {
                this.sendBtn.style.background = 'var(--interactive-accent-hover)';
                this.sendBtn.style.transform = 'scale(1.05)';
            }
        });
        this.sendBtn.addEventListener('mouseleave', () => {
            this.sendBtn.style.transform = 'scale(1)';
            if (!this.sendBtn.disabled) {
                this.sendBtn.style.background = 'var(--interactive-accent)';
            }
        });
        
        inputContainerEl.appendChild(this.inputEl);
        inputContainerEl.appendChild(this.sendBtn);
        inputAreaEl.appendChild(inputContainerEl);
        
        // 组装对话界面
        this.dialogEl = document.createElement('div');
        this.dialogEl.style.cssText = `
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
        `;
        
        this.dialogEl.appendChild(headerEl);
        this.dialogEl.appendChild(this.chatContentEl);
        this.dialogEl.appendChild(inputAreaEl);
        
        this.containerEl.appendChild(this.dialogEl);
        
        // 添加到页面
        document.body.appendChild(this.containerEl);
        
        // 设置拖拽处理
        headerEl.addEventListener('mousedown', (e) => this.startDrag(e));
        
        // 设置输入框回车发送
        this.inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }
    
    /**
     * 创建最小化图标
     */
    private createMinimizedIcon(): void {
        this.minimizedEl = document.createElement('div');
        this.minimizedEl.className = 'chat-minimized-icon';
        this.minimizedEl.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            display: none;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 9998;
            user-select: none;
        `;
        
        // 创建机器人SVG图标
        const robotIcon = `
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H9L3 7V9C3 10.1 3.9 11 5 11V20C5 21.1 5.9 22 7 22H17C18.1 22 19 21.1 19 20V11C20.1 11 21 10.1 21 9ZM11 20H7V12H11V20ZM17 20H13V12H17V20ZM19 9H5V7.5L9.5 3H14.5L19 7.5V9ZM9.5 8.5C9.5 9.33 8.83 10 8 10S6.5 9.33 6.5 8.5S7.17 7 8 7S9.5 7.67 9.5 8.5ZM17.5 8.5C17.5 9.33 16.83 10 16 10S14.5 9.33 14.5 8.5S15.17 7 16 7S17.5 7.67 17.5 8.5Z" fill="var(--text-accent)" stroke="var(--background-primary)" stroke-width="0.5"/>
            </svg>
        `;
        
        this.minimizedEl.innerHTML = robotIcon;
        this.minimizedEl.title = '恢复对话窗口';
        this.minimizedEl.addEventListener('click', () => this.restore());
        
        document.body.appendChild(this.minimizedEl);
    }
    
    /**
     * 设置事件监听器
     */
    private setupEventListeners(): void {
        // 全局鼠标事件
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', () => this.handleMouseUp());
        
        // 窗口大小变化事件
        window.addEventListener('resize', () => this.handleWindowResize());
    }
    
    /**
     * 开始拖拽
     */
    private startDrag(e: MouseEvent): void {
        this.isDragging = true;
        const rect = this.containerEl.getBoundingClientRect();
        this.dragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        e.preventDefault();
    }
    
    /**
     * 处理鼠标移动
     */
    private handleMouseMove(e: MouseEvent): void {
        if (this.isDragging) {
            const newX = e.clientX - this.dragOffset.x;
            const newY = e.clientY - this.dragOffset.y;
            
            // 限制在窗口范围内
            const maxX = window.innerWidth - this.windowState.size.width;
            const maxY = window.innerHeight - this.windowState.size.height;
            
            this.windowState.position.x = Math.max(0, Math.min(newX, maxX));
            this.windowState.position.y = Math.max(0, Math.min(newY, maxY));
            
            this.updatePosition();
        }
    }
    
    /**
     * 处理鼠标释放
     */
    private handleMouseUp(): void {
        this.isDragging = false;
        this.isResizing = false;
    }
    
    /**
     * 处理窗口大小变化
     */
    private handleWindowResize(): void {
        // 确保窗口不会超出屏幕范围
        const maxX = window.innerWidth - this.windowState.size.width;
        const maxY = window.innerHeight - this.windowState.size.height;
        
        if (this.windowState.position.x > maxX) {
            this.windowState.position.x = Math.max(0, maxX);
        }
        if (this.windowState.position.y > maxY) {
            this.windowState.position.y = Math.max(0, maxY);
        }
        
        this.updatePosition();
    }
    
    /**
     * 更新窗口位置
     */
    private updatePosition(): void {
        this.containerEl.style.left = `${this.windowState.position.x}px`;
        this.containerEl.style.top = `${this.windowState.position.y}px`;
    }
    
    /**
     * 最小化窗口
     */
    public minimize(): void {
        this.windowState.isMinimized = true;
        this.containerEl.style.display = 'none';
        this.minimizedEl.style.display = 'flex';
        
        debugManager.info('FloatingChatDialog', '窗口已最小化');
    }
    
    /**
     * 恢复窗口
     */
    public restore(): void {
        this.windowState.isMinimized = false;
        this.containerEl.style.display = 'flex';
        this.minimizedEl.style.display = 'none';
        
        // 聚焦到输入框
        this.inputEl.focus();
        
        debugManager.info('FloatingChatDialog', '窗口已恢复');
    }
    
    /**
     * 关闭窗口
     */
    public close(): void {
        this.windowState.isVisible = false;
        
        // 移除DOM元素
        if (this.containerEl.parentNode) {
            this.containerEl.parentNode.removeChild(this.containerEl);
        }
        if (this.minimizedEl.parentNode) {
            this.minimizedEl.parentNode.removeChild(this.minimizedEl);
        }
        
        // 清理组件
        this.markdownComponent.unload();
        
        // 调用关闭回调
        if (this.options.onClose) {
            this.options.onClose();
        }
        
        debugManager.info('FloatingChatDialog', '窗口已关闭');
    }
    
    /**
     * 销毁对话框
     */
    public destroy(): void {
        this.markdownComponent.unload();
        
        // 清理ChatService会话
        if (this.sessionId) {
            this.chatService.deleteSession(this.sessionId);
        }
        
        if (this.containerEl && this.containerEl.parentNode) {
            this.containerEl.parentNode.removeChild(this.containerEl);
        }
        
        if (this.minimizedEl && this.minimizedEl.parentNode) {
            this.minimizedEl.parentNode.removeChild(this.minimizedEl);
        }
        
        debugManager.log('FloatingChatDialog destroyed, session cleaned:', this.sessionId);
    }
    
    /**
     * 清除对话
     */
    public clearConversation(): void {
        this.messages = [];
        this.chatContentEl.innerHTML = '';
        
        // 清除ChatService会话数据
        this.chatService.clearSession(this.sessionId);
        
        // 添加欢迎消息
        this.addWelcomeMessage();
        
        debugManager.info('FloatingChatDialog', '对话已清除，会话ID:', this.sessionId);
    }
    
    /**
     * 添加欢迎消息（已删除）
     */
    private addWelcomeMessage(): void {
        // 不再显示欢迎消息
    }
    
    /**
     * 发送消息
     */
    private async sendMessage(): Promise<void> {
        const content = this.inputEl.value.trim();
        if (!content || this.isProcessing) return;
        
        this.isProcessing = true;
        this.updateSendButtonState();
        
        // 清空输入框
        this.inputEl.value = '';
        
        // 添加用户消息
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: Date.now()
        };
        
        this.addMessage(userMessage);
        
        // 创建AI响应消息占位符
        const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: '',
            timestamp: Date.now()
        };
        
        this.addMessage(assistantMessage);
        
        try {
            // 更新聊天配置（包含当前选择的模型和模板）
            const selectedModel = this.getSelectedModel();
            const selectedTemplate = this.getSelectedTemplate();
            
            if (selectedModel) {
                this.chatService.updateChatConfig(this.sessionId, {
                    modelId: selectedModel,
                    promptTemplate: selectedTemplate || undefined
                });
            }
            
            // 流式响应回调
            const streamCallback: StreamResponseCallback = (chunk: string, isComplete: boolean) => {
                if (chunk) {
                    assistantMessage.content += chunk;
                    this.updateLastMessage(assistantMessage.content);
                }
                
                if (isComplete) {
                    this.isProcessing = false;
                    this.updateSendButtonState();
                    debugManager.info('FloatingChatDialog', 'AI响应完成');
                    
                    // AI响应完成后，添加时间戳和刷新按钮
                    this.addTimestampAndRefreshButton();
                    
                    // 移除自动保存功能，用户需要手动点击保存按钮
                    // 自动保存已禁用，用户可通过保存按钮手动保存对话
                }
            };
            
            // 使用流式发送消息
            await this.chatService.sendMessageStream(this.sessionId, content, streamCallback);
            
        } catch (error) {
            debugManager.error('FloatingChatDialog', 'AI调用失败', error);
            
            assistantMessage.content = `抱歉，AI调用失败：${error.message}`;
            this.updateLastMessage(assistantMessage.content);
            this.isProcessing = false;
            this.updateSendButtonState();
            
            // 错误情况下也添加时间戳和刷新按钮
            this.addTimestampAndRefreshButton();
        }
    }
    
    /**
     * 添加消息到对话
     */
    private addMessage(message: ChatMessage): void {
        this.messages.push(message);
        
        const messageEl = document.createElement('div');
        messageEl.className = `chat-message chat-message-${message.role}`;
        messageEl.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 16px;
            margin: 0;
            width: 100%;
            word-wrap: break-word;
            position: relative;
            ${message.role === 'user' 
                ? 'background: var(--background-secondary); color: var(--text-normal); border-radius: 8px; border: 1px solid var(--background-modifier-border); box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);'
                : 'background: transparent; color: var(--text-normal);'
            }
        `;
        
        const contentEl = document.createElement('div');
        contentEl.className = 'message-content';
        
        if (message.role === 'assistant') {
            // 渲染Markdown内容
            MarkdownRenderer.renderMarkdown(
                message.content,
                contentEl,
                '',
                this.markdownComponent
            );
        } else {
            contentEl.textContent = message.content;
        }
        
        messageEl.appendChild(contentEl);
        
        // 为用户消息添加时间戳
        if (message.role === 'user') {
            const timeEl = document.createElement('div');
            timeEl.style.cssText = `
                font-size: 0.8em;
                opacity: 0.7;
                text-align: right;
                margin-top: 4px;
            `;
            timeEl.textContent = new Date(message.timestamp).toLocaleTimeString();
            messageEl.appendChild(timeEl);
        }
        
        // AI消息的时间戳和刷新按钮将在内容生成完成后动态添加
        
        this.chatContentEl.appendChild(messageEl);
        
        // 滚动到底部
        this.scrollToBottom();
    }
    

    
    /**
     * 滚动到底部
     */
    private scrollToBottom(): void {
        this.chatContentEl.scrollTop = this.chatContentEl.scrollHeight;
    }
    

    
    /**
     * 显示窗口
     */
    public show(): void {
        this.windowState.isVisible = true;
        this.containerEl.style.display = 'flex';
        this.minimizedEl.style.display = 'none';
        
        // 添加欢迎消息
        if (this.messages.length === 0) {
            this.addWelcomeMessage();
        }
        
        // 聚焦到输入框
        setTimeout(() => {
            this.inputEl.focus();
        }, 100);
        
        debugManager.info('FloatingChatDialog', '窗口已显示');
    }
    
    /**
     * 获取窗口状态
     */
    public getWindowState(): WindowState {
        return { ...this.windowState };
    }
    
    /**
     * 获取对话消息
     */
    public getMessages(): ChatMessage[] {
        return [...this.messages];
    }
    
    /**
     * 设置模型选项
     */
    public setModelOptions(models: Array<{ id: string; name: string }>): void {
        this.modelSelectEl.innerHTML = '';
        
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = model.name;
            this.modelSelectEl.appendChild(option);
        });
        
        // 设置默认选中
        if (this.options.modelId) {
            this.modelSelectEl.value = this.options.modelId;
        }
    }
    
    /**
     * 设置模板选项
     */
    public setTemplateOptions(templates: Array<{ id: string; name: string }>): void {
        this.templateSelectEl.innerHTML = '';
        
        // 添加空选项
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = '无模板';
        this.templateSelectEl.appendChild(emptyOption);
        
        templates.forEach(template => {
            const option = document.createElement('option');
            option.value = template.id;
            option.textContent = template.name;
            this.templateSelectEl.appendChild(option);
        });
    }
    
    /**
     * 异步加载并设置模板选项（包含内置提示词）
     */
    public async loadAndSetTemplateOptions(): Promise<void> {
        try {
            // 获取AI设置中的模板目录
            const { AISettingsService } = await import('../../../service/ai/AISettingsService');
            const { PromptTemplateService } = await import('../../../service/ai/PromptTemplateService');
            
            const settingsService = new AISettingsService(this.app);
            const settings = await settingsService.loadSettings();
            const templateFolder = settings.promptTemplateFolder || 'form/prompts';
            
            // 获取模板文件列表
            const templateService = new PromptTemplateService(this.app, templateFolder);
            const templateFiles = await templateService.getTemplateFiles();
            
            // 转换为选项格式
            const templateOptions = templateFiles.map(file => ({
                id: file.path,
                name: file.basename
            }));
            
            // 设置模板选项
            this.setTemplateOptions(templateOptions);
            
            console.log(`已加载 ${templateOptions.length} 个内置模板`);
        } catch (error) {
            console.error('加载模板选项失败:', error);
            // 设置空的模板选项列表
            this.setTemplateOptions([]);
        }
    }
    
    /**
     * 获取当前选中的模型
     */
    public getSelectedModel(): string {
        return this.modelSelectEl.value;
    }
    
    /**
     * 获取当前选中的模板
     */
    public getSelectedTemplate(): string {
        return this.templateSelectEl.value;
    }
    
    /**
     * 更新最后一条消息的内容
     */
    private updateLastMessage(content: string): void {
        const lastMessageEl = this.chatContentEl.lastElementChild as HTMLElement;
        if (lastMessageEl && lastMessageEl.classList.contains('chat-message-assistant')) {
            const contentEl = lastMessageEl.querySelector('.message-content');
            if (contentEl) {
                // 清空之前的内容
                contentEl.innerHTML = '';
                
                // 渲染Markdown内容
                MarkdownRenderer.renderMarkdown(
                    content,
                    contentEl as HTMLElement,
                    '',
                    this.markdownComponent
                );
                
                // 滚动到底部
                this.scrollToBottom();
            }
        }
    }
    
    /**
     * 保存对话
     */
    private async saveConversation(): Promise<void> {
        if (this.messages.length === 0) {
            debugManager.info('FloatingChatDialog', '没有对话内容可保存');
            return;
        }
        
        try {
            // 使用ChatService的保存功能
            await this.chatService.saveConversation(this.sessionId);
            debugManager.info('FloatingChatDialog', '对话已保存，会话ID:', this.sessionId);
        } catch (error) {
            debugManager.error('FloatingChatDialog', '保存对话失败', error);
        }
    }
    
    /**
     * 重新生成最后一个AI回答
     */
    private async regenerateLastResponse(): Promise<void> {
        if (this.isProcessing) {
            debugManager.warn('FloatingChatDialog', '正在处理中，无法重新生成');
            return;
        }
        
        // 找到最后一个用户消息
        let lastUserMessage: ChatMessage | null = null;
        for (let i = this.messages.length - 1; i >= 0; i--) {
            if (this.messages[i].role === 'user') {
                lastUserMessage = this.messages[i];
                break;
            }
        }
        
        if (!lastUserMessage) {
            debugManager.warn('FloatingChatDialog', '没有找到用户消息，无法重新生成');
            return;
        }
        
        // 移除最后一个AI回答（如果存在）
        const lastMessage = this.messages[this.messages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
            this.messages.pop();
            const lastMessageEl = this.chatContentEl.lastElementChild;
            if (lastMessageEl) {
                lastMessageEl.remove();
            }
        }
        
        // 重新发送最后一个用户消息
        this.isProcessing = true;
        this.updateSendButtonState();
        
        // 创建AI响应消息占位符
        const assistantMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'assistant',
            content: '正在思考中...',
            timestamp: Date.now()
        };
        
        this.addMessage(assistantMessage);
        
        try {
            // 更新聊天配置
            const selectedModel = this.getSelectedModel();
            const selectedTemplate = this.getSelectedTemplate();
            
            if (selectedModel) {
                this.chatService.updateChatConfig(this.sessionId, {
                    modelId: selectedModel,
                    promptTemplate: selectedTemplate || undefined
                });
            }
            
            // 重置消息内容为空，准备流式更新
            assistantMessage.content = '';
            
            // 流式响应回调
            const streamCallback: StreamResponseCallback = (chunk: string, isComplete: boolean) => {
                if (chunk) {
                    assistantMessage.content += chunk;
                    this.updateLastMessage(assistantMessage.content);
                }
                
                if (isComplete) {
                    this.isProcessing = false;
                    this.updateSendButtonState();
                    debugManager.info('FloatingChatDialog', 'AI重新生成完成');
                    
                    // 流式输出完成后，添加时间戳和刷新按钮
                    this.addTimestampAndRefreshButton();
                }
            };
            
            // 使用流式发送消息
            await this.chatService.sendMessageStream(this.sessionId, lastUserMessage.content, streamCallback);
            
        } catch (error) {
            debugManager.error('FloatingChatDialog', '重新生成回答失败', error);
            
            assistantMessage.content = `抱歉，重新生成回答失败：${error.message}`;
            this.updateLastMessage(assistantMessage.content);
            this.isProcessing = false;
            this.updateSendButtonState();
            
            // 错误情况下也添加时间戳和刷新按钮
            this.addTimestampAndRefreshButton();
        }
    }
    
    /**
     * 更新发送按钮状态
     */
    private updateSendButtonState(): void {
        if (this.sendBtn) {
            this.sendBtn.disabled = this.isProcessing;
            if (this.isProcessing) {
                this.sendBtn.style.background = 'var(--background-modifier-border)';
                this.sendBtn.style.color = 'var(--text-muted)';
                this.sendBtn.style.cursor = 'not-allowed';
                this.sendBtn.innerHTML = '⏳';
            } else {
                this.sendBtn.style.background = 'var(--interactive-accent)';
                this.sendBtn.style.color = 'var(--text-on-accent)';
                this.sendBtn.style.cursor = 'pointer';
                this.sendBtn.innerHTML = '➤';
            }
        }
    }
    
    /**
     * 为AI消息添加时间戳和刷新按钮（在内容生成完成后）
     */
    private addTimestampAndRefreshButton(): void {
        const lastMessageEl = this.chatContentEl.lastElementChild as HTMLElement;
        if (lastMessageEl && lastMessageEl.classList.contains('chat-message-assistant')) {
            const lastMessage = this.messages[this.messages.length - 1];
            if (lastMessage && lastMessage.role === 'assistant' && lastMessage.content && lastMessage.content.trim() !== '' && !lastMessage.content.includes('正在思考中')) {
                // 检查是否已经有底部容器
                let bottomContainer = lastMessageEl.querySelector('.ai-message-bottom') as HTMLElement;
                if (!bottomContainer) {
                    // 创建底部容器（包含时间戳和刷新按钮）
                    bottomContainer = document.createElement('div');
                    bottomContainer.className = 'ai-message-bottom';
                    bottomContainer.style.cssText = `
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        margin-top: 8px;
                        font-size: 0.8em;
                        opacity: 0.7;
                    `;
                    
                    // 添加时间戳
                    const timeEl = document.createElement('span');
                    timeEl.textContent = new Date(lastMessage.timestamp).toLocaleTimeString();
                    timeEl.style.cssText = `
                        color: var(--text-muted);
                    `;
                    
                    // 添加刷新按钮
                    const refreshBtn = document.createElement('button');
                    refreshBtn.innerHTML = '🔄';
                    refreshBtn.title = '重新生成AI回答';
                    refreshBtn.style.cssText = `
                        background: none;
                        border: none;
                        cursor: pointer;
                        padding: 2px 4px;
                        border-radius: 3px;
                        font-size: 12px;
                        transition: all 0.2s;
                        color: var(--text-muted);
                        opacity: 0.7;
                    `;
                    
                    refreshBtn.addEventListener('click', () => {
                        this.regenerateLastResponse();
                    });
                    
                    refreshBtn.addEventListener('mouseenter', () => {
                        refreshBtn.style.background = 'var(--background-modifier-hover)';
                        refreshBtn.style.color = 'var(--text-normal)';
                        refreshBtn.style.opacity = '1';
                    });
                    
                    refreshBtn.addEventListener('mouseleave', () => {
                        refreshBtn.style.background = 'none';
                        refreshBtn.style.color = 'var(--text-muted)';
                        refreshBtn.style.opacity = '0.7';
                    });
                    
                    bottomContainer.appendChild(timeEl);
                    bottomContainer.appendChild(refreshBtn);
                    lastMessageEl.appendChild(bottomContainer);
                }
            }
        }
    }
    
    /**
     * 重新渲染最后一条消息（用于在流式完成后添加刷新按钮）
     */
    private rerenderLastMessage(): void {
        // 调用新的方法
        this.addTimestampAndRefreshButton();
    }
}