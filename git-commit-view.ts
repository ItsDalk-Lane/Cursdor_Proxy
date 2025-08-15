// Git提交侧边栏视图
import { ItemView, WorkspaceLeaf, ButtonComponent, TextAreaComponent, Notice } from 'obsidian';
import { GitChangeInfo } from './git-types';

// 前向声明，避免循环导入
interface GitAutoCommitPlugin {
    validateRepository(): Promise<boolean>;
    getGitChanges(): Promise<GitChangeInfo[]>;
    generateCommitMessageWithAI(files: string[]): Promise<string>;
    performActualCommit(files: string[], message: string): Promise<void>;
    pushToRemoteRepository(): Promise<void>;
}

export const GIT_COMMIT_VIEW_TYPE = 'git-auto-commit-view';

export class GitCommitView extends ItemView {
    plugin: GitAutoCommitPlugin;
    private commitMessage: string = '';
    private changes: GitChangeInfo[] = [];
    private commitMessageTextarea: TextAreaComponent | null = null;
    private commitButton: ButtonComponent | null = null;
    private pushButton: ButtonComponent | null = null;
    private refreshButton: ButtonComponent | null = null;
    private changesContainer: HTMLElement | null = null;
    private isPostCommitState: boolean = false;
    private isLoading: boolean = false;

    constructor(leaf: WorkspaceLeaf, plugin: GitAutoCommitPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType(): string {
        return GIT_COMMIT_VIEW_TYPE;
    }

    getDisplayText(): string {
        return 'Git提交';
    }

    getIcon(): string {
        return 'git-commit';
    }

    async onOpen() {
        await this.buildView();
        await this.refreshChanges();
    }

    onClose() {
        // 清理资源
        return super.onClose();
    }

    private async buildView() {
        const container = this.containerEl.children[1];
        container.empty();
        container.addClass('git-commit-view');

        // 创建主容器
        const contentEl = container.createDiv('git-view');

        // 创建头部工具栏
        this.createHeader(contentEl);

        // 创建提交信息区域
        this.createCommitMessageSection(contentEl);

        // 创建文件变更区域
        this.createChangesSection(contentEl);

        // 创建操作按钮区域
        this.createButtonSection(contentEl);

        // 应用样式
        this.applyStyles();
    }

    private createHeader(container: HTMLElement) {
        const header = container.createDiv('nav-header');
        const buttonsContainer = header.createDiv('nav-buttons-container');

        // AI生成按钮
        new ButtonComponent(buttonsContainer)
            .setIcon('bot')
            .setTooltip('AI生成提交信息')
            .onClick(async () => {
                await this.generateAIMessage();
            })
            .buttonEl.addClass('clickable-icon', 'nav-action-button');

        // 提交按钮
        this.commitButton = new ButtonComponent(buttonsContainer)
            .setIcon('check')
            .setTooltip('提交')
            .onClick(async () => {
                await this.performCommit();
            });
        this.commitButton.buttonEl.addClass('clickable-icon', 'nav-action-button');

        // 刷新按钮
        this.refreshButton = new ButtonComponent(buttonsContainer)
            .setIcon('refresh-cw')
            .setTooltip('刷新')
            .onClick(async () => {
                await this.refreshChanges();
            });
        
        this.refreshButton.buttonEl.addClass('clickable-icon', 'nav-action-button');
    }

    private createCommitMessageSection(container: HTMLElement) {
        const messageSection = container.createDiv('git-commit-msg');
        
        // 提交信息输入框
        this.commitMessageTextarea = new TextAreaComponent(messageSection);
        this.commitMessageTextarea.inputEl.addClass('commit-msg-input');
        this.commitMessageTextarea.setPlaceholder('Commit Message');
        this.commitMessageTextarea.onChange((value) => {
            this.commitMessage = value;
            this.updateButtonStates();
            this.adjustTextareaHeight();
        });

        // 设置初始高度并启用自动调整
        this.commitMessageTextarea.inputEl.style.height = 'auto';
        this.commitMessageTextarea.inputEl.style.minHeight = '60px';
        this.commitMessageTextarea.inputEl.style.resize = 'none';
        this.commitMessageTextarea.inputEl.addEventListener('input', () => {
            this.adjustTextareaHeight();
        });
    }

    private adjustTextareaHeight() {
        if (!this.commitMessageTextarea) return;
        
        const textarea = this.commitMessageTextarea.inputEl;
        textarea.style.height = 'auto';
        textarea.style.height = Math.max(60, textarea.scrollHeight) + 'px';
    }

    private createChangesSection(container: HTMLElement) {
        this.changesContainer = container.createDiv('nav-files-container');
        // 内容将在refreshChanges中填充
    }

    private createButtonSection(container: HTMLElement) {
        const buttonSection = container.createDiv('git-commit-buttons');
        
        // 推送按钮（初始隐藏）
        this.pushButton = new ButtonComponent(buttonSection)
            .setButtonText('🚀 推送')
            .setClass('git-push-button')
            .onClick(async () => {
                await this.performPush();
            });
        
        this.pushButton.buttonEl.style.display = 'none';
    }

    private async refreshChanges() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.updateLoadingState();

        try {
            // 验证Git仓库
            if (!(await this.plugin.validateRepository())) {
                this.showEmptyState('当前目录不是Git仓库');
                return;
            }

            // 获取变更信息
            this.changes = await this.plugin.getGitChanges();
            this.updateChangesDisplay();

        } catch (error) {
            console.error('刷新变更失败:', error);
            this.showEmptyState(`获取变更失败: ${error.message}`);
        } finally {
            this.isLoading = false;
            this.updateLoadingState();
        }
    }

    private updateChangesDisplay() {
        if (!this.changesContainer) return;

        this.changesContainer.empty();

        if (this.changes.length === 0) {
            this.showEmptyState('没有检测到文件变更');
            return;
        }

        // 创建变更列表
        const changesTreeContainer = this.changesContainer.createDiv('tree-item nav-folder mod-root');

        // 暂存变更区域
        const stagedChanges = this.changes.filter(change => change.isStaged);
        if (stagedChanges.length > 0) {
            this.createChangesGroup(changesTreeContainer, '暂存变更', stagedChanges, true);
        }

        // 变更区域（未暂存）
        const unstagedChanges = this.changes.filter(change => !change.isStaged);
        if (unstagedChanges.length > 0) {
            this.createChangesGroup(changesTreeContainer, '变更', unstagedChanges, false);
        }
    }

    private createChangesGroup(container: HTMLElement, title: string, changes: GitChangeInfo[], isStaged: boolean) {
        const groupContainer = container.createDiv(`${isStaged ? 'staged' : 'changes'} tree-item nav-folder`);
        
        // 组标题（不可折叠）
        const titleContainer = groupContainer.createDiv('tree-item-self nav-folder-title');
        
        // 标题文本
        const titleText = titleContainer.createDiv('tree-item-inner nav-folder-title-content');
        titleText.textContent = title;

        // 文件数量
        const countBadge = titleContainer.createSpan('tree-item-flair');
        countBadge.textContent = changes.length.toString();

        // 文件列表（始终显示）
        const filesList = groupContainer.createDiv('tree-item-children nav-folder-children');
        
        changes.forEach(change => {
            this.createFileItem(filesList, change);
        });
    }

    private createFileItem(container: HTMLElement, change: GitChangeInfo) {
        const fileItem = container.createDiv('tree-item nav-file');
        
        // 文件信息容器
        const fileInfo = fileItem.createDiv('tree-item-self is-clickable nav-file-title');
        
        // 文件名
        const fileName = fileInfo.createDiv('tree-item-inner nav-file-title-content');
        fileName.textContent = this.getDisplayPath(change.filePath);

        // 状态标识
        const statusBadge = fileInfo.createDiv('git-file-status');
        statusBadge.textContent = this.getStatusText(change.status);
        statusBadge.addClass(`status-${change.status.toLowerCase()}`);

        // 点击查看diff
        fileInfo.addEventListener('click', () => {
            if (change.diff) {
                this.toggleDiffDisplay(fileItem, change);
            }
        });
    }

    private toggleDiffDisplay(fileItem: HTMLElement, change: GitChangeInfo) {
        let diffContainer = fileItem.querySelector('.git-diff-container') as HTMLElement;
        
        if (diffContainer) {
            // 切换显示/隐藏
            const isVisible = diffContainer.style.display !== 'none';
            diffContainer.style.display = isVisible ? 'none' : 'block';
        } else if (change.diff) {
            // 创建diff显示
            diffContainer = fileItem.createDiv('git-diff-container');
            const diffContent = diffContainer.createEl('pre');
            diffContent.innerHTML = `<code>${this.escapeHtml(change.diff)}</code>`;
        }
    }

    private async generateAIMessage() {
        try {
            new Notice('正在生成AI提交信息...');
            const aiMessage = await this.plugin.generateCommitMessageWithAI([]);
            
            if (aiMessage) {
                this.commitMessage = aiMessage;
                this.commitMessageTextarea?.setValue(aiMessage);
                this.updateButtonStates();
                new Notice('✅ AI提交信息生成完成');
            }
        } catch (error) {
            console.error('AI生成失败:', error);
            new Notice(`❌ AI生成失败: ${error.message}`);
        }
    }

    private async performCommit() {
        if (!this.commitMessage.trim()) {
            new Notice('❌ 请输入提交信息');
            return;
        }

        const selectedFiles = this.getSelectedFiles();
        if (selectedFiles.length === 0) {
            new Notice('❌ 没有要提交的文件');
            return;
        }

        try {
            this.commitButton?.setButtonText('提交中...');
            this.commitButton?.setDisabled(true);
            
            await this.plugin.performActualCommit(selectedFiles, this.commitMessage.trim());
            
            // 切换到成功状态
            this.showPostCommitState();
            
        } catch (error) {
            console.error('提交失败:', error);
            new Notice(`❌ 提交失败: ${error.message}`);
            
            // 恢复按钮状态
            this.commitButton?.setButtonText('💾 提交');
            this.commitButton?.setDisabled(false);
        }
    }

    private async performPush() {
        try {
            this.pushButton?.setButtonText('推送中...');
            this.pushButton?.setDisabled(true);
            
            await this.plugin.pushToRemoteRepository();
            new Notice('✅ 推送成功');
            
            // 重置界面
            await this.resetToInitialState();
            
        } catch (error) {
            console.error('推送失败:', error);
            new Notice(`❌ 推送失败: ${error.message}`);
            
            // 恢复按钮状态
            this.pushButton?.setButtonText('🚀 推送');
            this.pushButton?.setDisabled(false);
        }
    }

    private showPostCommitState() {
        this.isPostCommitState = true;
        
        // 隐藏提交相关界面
        const commitSection = this.containerEl.querySelector('.git-commit-msg') as HTMLElement;
        const changesSection = this.containerEl.querySelector('.nav-files-container') as HTMLElement;
        if (commitSection) commitSection.style.display = 'none';
        if (changesSection) changesSection.style.display = 'none';
        
        // 显示成功信息
        this.showSuccessMessage();
        
        // 显示推送按钮，隐藏提交按钮
        this.commitButton?.buttonEl.style.setProperty('display', 'none');
        this.pushButton?.buttonEl.style.setProperty('display', 'inline-block');
    }

    private showSuccessMessage() {
        if (!this.changesContainer) return;
        
        this.changesContainer.empty();
        this.changesContainer.removeClass('nav-files-container');
        this.changesContainer.addClass('git-success-container');
        
        const successMessage = this.changesContainer.createDiv('git-success-message');
        successMessage.createEl('h3', { text: '✅ 提交成功', cls: 'success-title' });
        successMessage.createEl('p', { text: '变更已成功提交到本地仓库', cls: 'success-text' });
        
        const commitInfo = successMessage.createDiv('commit-info');
        commitInfo.createEl('strong', { text: '提交信息:' });
        const messageDisplay = commitInfo.createDiv('commit-message-display');
        messageDisplay.textContent = this.commitMessage;
    }

    private async resetToInitialState() {
        this.isPostCommitState = false;
        this.commitMessage = '';
        
        // 重新构建界面
        await this.buildView();
        await this.refreshChanges();
    }

    private getSelectedFiles(): string[] {
        // 返回所有文件，因为我们不再使用复选框选择
        return this.changes.map(change => change.filePath);
    }

    private updateButtonStates() {
        if (!this.commitButton) return;
        
        const hasMessage = this.commitMessage.trim().length > 0;
        const hasChanges = this.changes.length > 0;
        
        this.commitButton.setDisabled(!hasMessage || !hasChanges);
    }

    private updateLoadingState() {
        if (this.refreshButton) {
            this.refreshButton.buttonEl.classList.toggle('loading', this.isLoading);
        }
    }

    private showEmptyState(message: string) {
        if (!this.changesContainer) return;
        
        this.changesContainer.empty();
        const emptyState = this.changesContainer.createDiv('git-empty-state');
        emptyState.textContent = message;
    }

    private getDisplayPath(filePath: string): string {
        // 简化路径显示
        const parts = filePath.split('/');
        return parts[parts.length - 1];
    }

    private getStatusText(status: string): string {
        switch (status) {
            case 'M': return 'M';
            case 'A': return 'A';
            case 'D': return 'D';
            case 'R': return 'R';
            case '??': return 'U';
            case 'MM': return 'M';
            default: return status;
        }
    }

    private escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    private applyStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .git-commit-view {
                height: 100%;
                display: flex;
                flex-direction: column;
            }

            .git-view {
                height: 100%;
                display: flex;
                flex-direction: column;
            }

            .nav-header {
                padding: 4px 8px;
                border-bottom: 1px solid var(--background-modifier-border);
                flex-shrink: 0;
                min-height: 42px;
                display: flex;
                align-items: center;
            }

            .nav-buttons-container {
                display: flex;
                gap: 4px;
                justify-content: flex-end;
                width: 100%;
            }

            .nav-action-button {
                padding: 6px;
                min-height: 32px;
                width: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .git-commit-msg {
                padding: 12px;
                border-bottom: 1px solid var(--background-modifier-border);
                flex-shrink: 0;
            }

            .commit-msg-input {
                width: 100%;
                min-height: 60px;
                padding: 8px;
                border: 1px solid var(--background-modifier-border);
                border-radius: 4px;
                background: var(--background-primary);
                color: var(--text-normal);
                font-family: var(--font-interface);
                font-size: 13px;
                resize: vertical;
                margin-bottom: 8px;
            }

            .git-commit-ai-button {
                display: flex;
                justify-content: flex-end;
                margin-bottom: 8px;
            }

            .ai-generate-button {
                padding: 4px 8px;
                font-size: 11px;
                border-radius: 3px;
            }

            .git-commit-msg-clear-button {
                position: absolute;
                right: 20px;
                top: 85px;
                width: 16px;
                height: 16px;
                cursor: pointer;
                opacity: 0.5;
                background: var(--text-muted);
                mask: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>') no-repeat center;
                mask-size: 12px;
            }

            .git-commit-msg-clear-button:hover {
                opacity: 1;
            }

            .nav-files-container {
                flex: 1;
                overflow-y: auto;
                padding: 8px;
            }

            .git-file-status {
                margin-left: auto;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 10px;
                font-weight: bold;
                color: white;
                min-width: 16px;
                text-align: center;
            }

            .status-m { background-color: #2ea043; } /* Modified */
            .status-a { background-color: #1f6feb; } /* Added */
            .status-d { background-color: #da3633; } /* Deleted */
            .status-r { background-color: #fb8500; } /* Renamed */
            .status-u { background-color: #6f42c1; } /* Untracked */
            .status-mm { background-color: #fd7e14; } /* Mixed */

            .git-diff-container {
                margin: 8px 0;
                background: var(--background-secondary);
                border: 1px solid var(--background-modifier-border);
                border-radius: 4px;
                padding: 8px;
                font-family: var(--font-monospace);
                font-size: 11px;
                max-height: 200px;
                overflow-y: auto;
            }

            .git-commit-buttons {
                padding: 12px;
                border-top: 1px solid var(--background-modifier-border);
                display: flex;
                gap: 8px;
                flex-shrink: 0;
            }

            .git-push-button {
                background: var(--interactive-accent);
                color: var(--text-on-accent);
            }

            .git-empty-state {
                text-align: center;
                padding: 40px 20px;
                color: var(--text-muted);
                font-style: italic;
            }

            .git-success-container {
                padding: 20px;
                text-align: center;
            }

            .success-title {
                color: var(--text-success);
                margin-bottom: 10px;
            }

            .success-text {
                color: var(--text-muted);
                margin-bottom: 20px;
            }

            .commit-info {
                background: var(--background-secondary);
                padding: 12px;
                border-radius: 6px;
                border: 1px solid var(--background-modifier-border);
                text-align: left;
            }

            .commit-message-display {
                margin-top: 8px;
                font-family: var(--font-monospace);
                font-size: 12px;
                background: var(--background-primary);
                padding: 8px;
                border-radius: 4px;
                border: 1px solid var(--background-modifier-border-hover);
                white-space: pre-wrap;
            }

            .tree-item-flair {
                background: var(--background-modifier-border);
                color: var(--text-muted);
                border-radius: 10px;
                padding: 2px 6px;
                font-size: 10px;
                margin-left: 8px;
            }

            /* 统一分组标题背景样式 */
            .staged .tree-item-self,
            .changes .tree-item-self {
                background: transparent;
                padding: 6px 8px;
            }

            .staged .tree-item-self:hover,
            .changes .tree-item-self:hover {
                background: var(--background-modifier-hover);
            }

            /* 移除分组的特殊背景色 */
            .staged,
            .changes {
                background: transparent;
            }

            /* 文件列表项样式优化 */
            .tree-item.nav-file {
                margin: 1px 0;
            }

            .tree-item.nav-file .tree-item-self {
                padding: 4px 8px;
                border-radius: 4px;
            }

            .tree-item.nav-file .tree-item-self:hover {
                background: var(--background-modifier-hover);
            }

            .clickable-icon.loading {
                animation: rotate 1s linear infinite;
            }

            @keyframes rotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        
        document.head.appendChild(style);
    }
}
