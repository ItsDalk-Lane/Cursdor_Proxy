// Git提交侧边栏视图
import { ItemView, WorkspaceLeaf, ButtonComponent, TextAreaComponent, Notice, setIcon } from 'obsidian';
import { GitChangeInfo, FileStatusResult, Status } from './git-types';

// 前向声明，避免循环导入
interface GitAutoCommitPlugin {
    validateRepository(): Promise<boolean>;
    getGitChanges(): Promise<GitChangeInfo[]>;
    getGitStatus(): Promise<Status>;  // 新增方法
    generateCommitMessageWithAI(files: string[]): Promise<string>;
    performActualCommit(files: string[], message: string): Promise<void>;
    pushToRemoteRepository(): Promise<void>;
    debugLog(...args: any[]): void; // 新增调试方法
    debugError(...args: any[]): void;
    debugWarn(...args: any[]): void;
}

export const GIT_COMMIT_VIEW_TYPE = 'git-auto-commit-view';

export class GitCommitView extends ItemView {
    plugin: GitAutoCommitPlugin;
    private commitMessage: string = '';
    private changes: GitChangeInfo[] = [];
    private status: Status | null = null;  // 新的状态对象
    private commitMessageTextarea: TextAreaComponent | null = null;
    private commitButton: ButtonComponent | null = null;
    private stageButton: ButtonComponent | null = null;
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
        this.plugin.debugLog('=== GitCommitView onOpen 开始 ===');
        await this.buildView();
        this.plugin.debugLog('=== buildView 完成，开始 refreshChanges ===');
        await this.refreshChanges();
        this.plugin.debugLog('=== GitCommitView onOpen 完成 ===');
        
        // 添加窗口resize监听器
        this.registerDomEvent(window, 'resize', () => {
            setTimeout(() => this.adjustTextareaHeight(), 100);
        });
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

        // 提交按钮（改为圆圈包裹向上箭头，始终显示）
        this.commitButton = new ButtonComponent(buttonsContainer)
            .setIcon('arrow-up-circle')
            .setTooltip('提交')
            .onClick(async () => {
                await this.performCommit();
            });
        this.commitButton.buttonEl.addClass('clickable-icon', 'nav-action-button', 'git-commit-icon-button');

        // 暂存按钮（一键暂存所有未暂存文件）
        this.stageButton = new ButtonComponent(buttonsContainer)
            .setIcon('plus-circle')
            .setTooltip('暂存所有文件')
            .onClick(async () => {
                await this.performStageAll();
            });
        this.stageButton.buttonEl.addClass('clickable-icon', 'nav-action-button');

        // 刷新按钮
        this.refreshButton = new ButtonComponent(buttonsContainer)
            .setIcon('refresh-cw')
            .setTooltip('刷新')
            .onClick(async () => {
                await this.refreshChanges();
            });
        
        this.refreshButton.buttonEl.addClass('clickable-icon', 'nav-action-button');

        // 推送按钮（初始隐藏，成功提交后显示）
        this.pushButton = new ButtonComponent(buttonsContainer)
            .setIcon('upload')
            .setTooltip('推送')
            .onClick(async () => {
                await this.performPush();
            });
        this.pushButton.buttonEl.addClass('clickable-icon', 'nav-action-button');
        this.pushButton.buttonEl.style.display = 'none';
    }

    private createCommitMessageSection(container: HTMLElement) {
        const messageSection = container.createDiv('git-commit-msg');
        
        // 创建消息输入容器（用于相对定位清除按钮）
        const inputContainer = messageSection.createDiv('commit-msg-input-container');
        
        // 提交信息输入框
        this.commitMessageTextarea = new TextAreaComponent(inputContainer);
        this.commitMessageTextarea.inputEl.addClass('commit-msg-input');
        this.commitMessageTextarea.setPlaceholder('Commit Message');
        this.commitMessageTextarea.onChange(async (value) => {
            this.commitMessage = value;
            await this.updateButtonStates(); // 修复异步调用
            this.adjustTextareaHeight();
        });

        // 设置自动高度调整
        this.commitMessageTextarea.inputEl.style.minHeight = '54px';
        this.commitMessageTextarea.inputEl.style.resize = 'none';
        this.commitMessageTextarea.inputEl.style.overflow = 'hidden';
        this.commitMessageTextarea.inputEl.addEventListener('input', () => {
            this.adjustTextareaHeight();
        });

        // 创建清除按钮
        const clearButton = inputContainer.createDiv('commit-msg-clear-button');
        clearButton.setAttribute('aria-label', '清除提交信息');
        clearButton.addEventListener('click', async () => {
            this.commitMessage = '';
            this.commitMessageTextarea?.setValue('');
            await this.updateButtonStates(); // 修复异步调用
            this.adjustTextareaHeight();
        });

        // 初始高度调整
        this.adjustTextareaHeight();
    }

    private adjustTextareaHeight() {
        if (!this.commitMessageTextarea) return;
        
        const textarea = this.commitMessageTextarea.inputEl;
        const messageSection = textarea.closest('.git-commit-msg') as HTMLElement;
        if (!messageSection) return;

        // 重置高度以获取真实的滚动高度
        textarea.style.height = 'auto';
        
        // 计算可用空间：git-view高度 - nav-header(37px) - nav-files-container最小高度(182px)
        const gitViewEl = textarea.closest('.git-view') as HTMLElement;
        if (!gitViewEl) return;
        
        const gitViewHeight = gitViewEl.clientHeight;
        const availableHeight = gitViewHeight - 37 - 182; // 减去header和files容器最小高度
        const maxTextareaHeight = Math.max(54, availableHeight - 20); // 减去容器padding
        
        // 计算内容高度
        const contentHeight = Math.max(54, textarea.scrollHeight);
        
        if (contentHeight <= maxTextareaHeight) {
            // 内容不超过最大高度，自动调整
            textarea.style.height = contentHeight + 'px';
            textarea.style.overflowY = 'hidden';
            messageSection.style.height = (contentHeight + 13.5) + 'px'; // 13.5px是容器padding
        } else {
            // 内容超过最大高度，显示滚动条
            textarea.style.height = maxTextareaHeight + 'px';
            textarea.style.overflowY = 'auto';
            messageSection.style.height = (maxTextareaHeight + 13.5) + 'px';
        }
    }

    private createChangesSection(container: HTMLElement) {
        this.changesContainer = container.createDiv('nav-files-container');
        // 内容将在refreshChanges中填充
    }

    private async refreshChanges() {
        if (this.isLoading) return;
        
        this.plugin.debugLog('=== refreshChanges 开始 ===');
        
        this.isLoading = true;
        this.updateLoadingState();

        try {
            // 验证Git仓库
            if (!(await this.plugin.validateRepository())) {
                this.plugin.debugLog('Git仓库验证失败');
                this.showEmptyState('当前目录不是Git仓库');
                return;
            }

            this.plugin.debugLog('Git仓库验证成功，开始获取状态...');
            
            // 获取Git状态信息 - 使用新的getGitStatus方法
            this.status = await this.plugin.getGitStatus();
            this.plugin.debugLog('获取到的Git状态:', this.status);
            
            await this.updateChangesDisplay();

        } catch (error) {
            console.error('刷新变更失败:', error);
            this.showEmptyState(`获取变更失败: ${error.message}`);
        } finally {
            this.isLoading = false;
            this.updateLoadingState();
            this.plugin.debugLog('=== refreshChanges 结束 ===');
        }
    }

    private async updateChangesDisplay() {
        if (!this.changesContainer || !this.status) {
            this.plugin.debugLog('=== updateChangesDisplay 跳过 ===');
            this.plugin.debugLog('changesContainer:', this.changesContainer);
            this.plugin.debugLog('status:', this.status);
            return;
        }

        this.plugin.debugLog('=== updateChangesDisplay 开始 ===');
        this.plugin.debugLog('Git状态对象:', this.status);
        this.plugin.debugLog('暂存文件数量:', this.status.staged.length);
        this.plugin.debugLog('未暂存文件数量:', this.status.changed.length);

        this.changesContainer.empty();
        
        // 更新 changes 数组 - 这是按钮状态依赖的关键数据
        this.changes = [];
        
        // 添加暂存文件到 changes 数组
        this.status.staged.forEach(file => {
            this.changes.push({
                filePath: file.path,
                status: file.index as any, // 使用文件的索引状态
                statusText: file.index || 'M', // 状态文本
                isStaged: true,
                diff: '' // diff 信息在需要时获取
            });
        });
        
        // 添加未暂存文件到 changes 数组
        this.status.changed.forEach(file => {
            this.changes.push({
                filePath: file.path,
                status: file.workingDir as any, // 使用文件的工作目录状态
                statusText: file.workingDir || 'M', // 状态文本
                isStaged: false,
                diff: '' // diff 信息在需要时获取
            });
        });
        
        this.plugin.debugLog('=== updateChangesDisplay 填充changes数组 ===');
        this.plugin.debugLog('最终changes数组长度:', this.changes.length);
        this.plugin.debugLog('最终changes数组:', this.changes);
        
        // 更新按钮状态
        await this.updateButtonStates();

        if (this.status.all.length === 0) {
            await this.showEmptyState('没有检测到文件变更');
            return;
        }

        // 创建变更列表
        const changesTreeContainer = this.changesContainer.createDiv('tree-item nav-folder mod-root');

        // 显示暂存文件
        if (this.status.staged.length > 0) {
            this.createFileStatusGroup(changesTreeContainer, '暂存文件', this.status.staged, true);
        }

        // 显示未暂存文件
        if (this.status.changed.length > 0) {
            this.createFileStatusGroup(changesTreeContainer, '未暂存文件', this.status.changed, false);
        }
    }

    private createFileStatusGroup(container: HTMLElement, title: string, files: FileStatusResult[], isStaged: boolean) {
        const groupContainer = container.createDiv(`${isStaged ? 'staged' : 'changes'} tree-item nav-folder git-change-group`);
        
        const titleContainer = groupContainer.createDiv('tree-item-self nav-folder-title is-clickable');
        const collapseIconEl = titleContainer.createDiv('collapse-icon');
        setIcon(collapseIconEl, 'chevron-down');
        const titleText = titleContainer.createDiv('tree-item-inner nav-folder-title-content');
        titleText.textContent = title;
        const countBadge = titleContainer.createSpan('tree-item-flair');
        countBadge.textContent = files.length.toString();
        
        const filesList = groupContainer.createDiv('tree-item-children nav-folder-children');
        files.forEach(file => this.createFileStatusItem(filesList, file, isStaged));
        
        titleContainer.addEventListener('click', () => {
            const willCollapse = !groupContainer.classList.contains('is-collapsed');
            if (willCollapse) {
                groupContainer.classList.add('is-collapsed');
                filesList.style.display = 'none';
                setIcon(collapseIconEl, 'chevron-right');
            } else {
                groupContainer.classList.remove('is-collapsed');
                filesList.style.display = '';
                setIcon(collapseIconEl, 'chevron-down');
            }
        });
    }

    private createFileStatusItem(container: HTMLElement, file: FileStatusResult, isStaged: boolean) {
        const fileItem = container.createDiv('tree-item nav-file');
        const fileContent = fileItem.createDiv('tree-item-self nav-file-title is-clickable');
        
        // 文件名 - 只显示文件名，不显示完整路径
        const fileName = fileContent.createDiv('tree-item-inner nav-file-title-content');
        const displayName = this.getDisplayPath(file.vaultPath);
        fileName.textContent = displayName;
        
        // 添加悬停显示完整路径的功能 - 使用解码后的仓库相对路径
        const decodedPath = this.getDecodedPath(file.vaultPath);
        fileName.setAttribute('title', decodedPath);
        
        // 文件状态图标 - 移到右侧
        const statusIcon = fileContent.createDiv('tree-item-icon nav-file-tag git-status-right');
        const statusText = this.getStatusText(isStaged ? file.index : file.workingDir);
        statusIcon.textContent = statusText;
        statusIcon.setAttribute('data-status', isStaged ? file.index : file.workingDir);
        
        // 点击事件
        fileContent.addEventListener('click', () => {
            // 可以在这里添加文件点击处理逻辑
        });
    }

    private getStatusText(status: string): string {
        switch (status) {
            case 'M': return 'M';  // 修改
            case 'A': return 'A';  // 新增
            case 'D': return 'D';  // 删除
            case 'R': return 'R';  // 重命名
            case 'C': return 'C';  // 复制
            case 'U': return 'U';  // 未跟踪
            case '?': return '?';  // 未知
            default: return status;
        }
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
            this.plugin.debugLog('UI: 开始调用AI生成方法');
            
            // 使用新的方法，不会暂存文件
            const aiMessage = await (this.plugin as any).generateAICommitMessageOnly();
            this.plugin.debugLog('UI: AI方法返回结果:', aiMessage);
            
            if (aiMessage) {
                this.commitMessage = aiMessage;
                // 确保完整显示AI生成的信息
                this.commitMessageTextarea?.setValue(aiMessage);
                this.adjustTextareaHeight(); // 调整高度以完整显示内容
                await this.updateButtonStates();
                new Notice('✅ AI提交信息生成完成');
                this.plugin.debugLog('UI: AI提交信息设置成功');
            } else {
                this.plugin.debugWarn('UI: AI方法返回空结果');
                new Notice('⚠️ AI生成的提交信息为空');
            }
        } catch (error) {
            this.plugin.debugError('UI: AI生成失败:', error);
            this.plugin.debugError('UI: 错误详情:', error.message, error.stack);
            new Notice(`❌ AI生成失败: ${error.message}`);
        }
    }

    private async performCommit() {
        if (!this.commitMessage.trim()) {
            new Notice('❌ 请输入提交信息');
            return;
        }

        // 获取所有未暂存的文件
        const unstagedFiles = this.changes.filter(c => !c.isStaged).map(c => c.filePath);
        
        if (unstagedFiles.length === 0) {
            new Notice('❌ 没有未暂存的文件需要提交');
            return;
        }

        try {
            this.commitButton?.setDisabled(true);
            this.commitButton?.buttonEl.classList.add('loading');
            
            // 只添加未暂存的文件到暂存区并提交
            await this.plugin.performActualCommit(unstagedFiles, this.commitMessage.trim());
            
            new Notice('✅ 提交成功！');
            
            // 清除输入框内容
            this.commitMessage = '';
            this.commitMessageTextarea?.setValue('');
            this.adjustTextareaHeight();
            
            // 刷新文件状态
            await this.refreshChanges();
            
            // 恢复按钮状态
            this.commitButton?.buttonEl.classList.remove('loading');
            this.commitButton?.setDisabled(false);
            
        } catch (error) {
            console.error('提交失败:', error);
            new Notice(`❌ 提交失败: ${error.message}`);
            
            // 恢复按钮状态
            this.commitButton?.buttonEl.classList.remove('loading');
            this.commitButton?.setDisabled(false);
        }
    }

    private async performStageAll() {
        // 获取所有未暂存的文件
        const unstagedFiles = this.changes.filter(c => !c.isStaged);
        
        if (unstagedFiles.length === 0) {
            new Notice('❌ 没有未暂存的文件需要暂存');
            return;
        }

        try {
            this.stageButton?.setDisabled(true);
            this.stageButton?.buttonEl.classList.add('loading');
            
            // 使用插件的方法暂存所有未暂存文件
            const filePaths = unstagedFiles.map(c => c.filePath);
            await (this.plugin as any).stageFiles(filePaths);
            
            new Notice(`✅ 已暂存 ${unstagedFiles.length} 个文件`);
            
            // 刷新文件状态
            await this.refreshChanges();
            
        } catch (error) {
            console.error('暂存失败:', error);
            new Notice(`❌ 暂存失败: ${error.message}`);
        } finally {
            // 恢复按钮状态
            this.stageButton?.buttonEl.classList.remove('loading');
            this.stageButton?.setDisabled(false);
        }
    }

    private async performPush() {
        try {
            this.pushButton?.setDisabled(true);
            this.pushButton?.buttonEl.classList.add('loading');
            
            // 检查是否有本地提交可以推送
            const vaultPath = (this.app.vault.adapter as any).basePath;
            const { execSync } = require('child_process');
            
            try {
                // 检查是否有未推送的提交
                const unpushedCommits = execSync('git log --oneline @{u}..HEAD', { 
                    cwd: vaultPath, 
                    encoding: 'utf8' 
                }).trim();
                
                if (!unpushedCommits) {
                    new Notice('❌ 没有需要推送的本地提交');
                    return;
                }
            } catch (checkError) {
                // 如果命令失败，可能是没有上游分支，直接尝试推送
                console.log('无法检查未推送提交，直接尝试推送');
            }
            
            await this.plugin.pushToRemoteRepository();
            new Notice('✅ 推送到远程仓库成功');
            
            // 清除输入框内容
            this.commitMessage = '';
            this.commitMessageTextarea?.setValue('');
            this.adjustTextareaHeight();
            
            // 刷新文件状态
            await this.refreshChanges();
            
        } catch (error) {
            console.error('推送失败:', error);
            new Notice(`❌ 推送失败: ${error.message}`);
        } finally {
            // 恢复按钮状态
            this.pushButton?.buttonEl.classList.remove('loading');
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
        this.pushButton?.buttonEl.style.setProperty('display', 'flex');
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

    private async updateButtonStates() {
        const unstagedFiles = this.changes.filter(c => !c.isStaged);
        const stagedFiles = this.changes.filter(c => c.isStaged);
        const hasMessage = this.commitMessage.trim().length > 0;
        
        this.plugin.debugLog('=== 按钮状态调试 ===');
        this.plugin.debugLog('总文件变更数量:', this.changes.length);
        this.plugin.debugLog('变更列表:', this.changes);
        this.plugin.debugLog('未暂存文件数量:', unstagedFiles.length);
        this.plugin.debugLog('已暂存文件数量:', stagedFiles.length);
        this.plugin.debugLog('提交信息:', this.commitMessage);
        this.plugin.debugLog('有提交信息:', hasMessage);
        this.plugin.debugLog('提交按钮对象:', this.commitButton);
        
        // 提交按钮：有已暂存文件且有提交信息时可用
        const shouldEnableCommit = stagedFiles.length > 0 && hasMessage;
        this.plugin.debugLog('提交按钮应该启用:', shouldEnableCommit);
        
        if (this.commitButton) {
            this.commitButton.setDisabled(!shouldEnableCommit);
            
            // 更新提示信息
            if (stagedFiles.length === 0) {
                this.commitButton.setTooltip('提交（没有已暂存文件）');
            } else if (!hasMessage) {
                this.commitButton.setTooltip('提交（请输入提交信息）');
            } else {
                this.commitButton.setTooltip('提交');
            }
            
            this.plugin.debugLog('提交按钮禁用状态:', this.commitButton.buttonEl.disabled);
        } else {
            this.plugin.debugError('提交按钮对象为空!');
        }
        
        // 暂存按钮：有未暂存文件时可用
        const shouldEnableStage = unstagedFiles.length > 0;
        this.plugin.debugLog('暂存按钮应该启用:', shouldEnableStage);
        
        if (this.stageButton) {
            this.stageButton.setDisabled(!shouldEnableStage);
            this.plugin.debugLog('暂存按钮禁用状态:', this.stageButton.buttonEl.disabled);
        } else {
            this.plugin.debugError('暂存按钮对象为空!');
        }
        
        // 推送按钮：检查未推送提交数量并更新显示
        await this.updatePushButtonState();
        
        this.plugin.debugLog('=== 按钮状态调试结束 ===');
    }

    private async updatePushButtonState() {
        if (!this.pushButton) return;
        
        try {
            const vaultPath = (this.app.vault.adapter as any).basePath;
            const { execSync } = require('child_process');
            
            // 获取未推送的提交数量
            const unpushedCommits = execSync('git rev-list --count @{u}..HEAD', { 
                cwd: vaultPath, 
                encoding: 'utf8' 
            }).trim();
            
            const commitCount = parseInt(unpushedCommits) || 0;
            
            if (commitCount > 0) {
                this.pushButton.setTooltip(`推送 (${commitCount}次提交)`);
                this.pushButton.setDisabled(false);
                
                // 更新按钮文本显示提交次数
                const buttonEl = this.pushButton.buttonEl;
                const existingBadge = buttonEl.querySelector('.commit-count-badge');
                if (existingBadge) {
                    existingBadge.textContent = commitCount.toString();
                } else {
                    const badge = buttonEl.createDiv('commit-count-badge');
                    badge.textContent = commitCount.toString();
                }
            } else {
                this.pushButton.setTooltip('推送');
                this.pushButton.setDisabled(true);
                
                // 移除提交次数显示
                const buttonEl = this.pushButton.buttonEl;
                const existingBadge = buttonEl.querySelector('.commit-count-badge');
                if (existingBadge) {
                    existingBadge.remove();
                }
            }
        } catch (error) {
            console.log('无法获取未推送提交数量，可能没有上游分支');
            this.pushButton.setTooltip('推送');
            this.pushButton.setDisabled(false);
            
            // 移除提交次数显示
            const buttonEl = this.pushButton.buttonEl;
            const existingBadge = buttonEl.querySelector('.commit-count-badge');
            if (existingBadge) {
                existingBadge.remove();
            }
        }
    }

    private updateLoadingState() {
        if (this.refreshButton) {
            this.refreshButton.buttonEl.classList.toggle('loading', this.isLoading);
        }
    }

    private async showEmptyState(message: string) {
        if (!this.changesContainer) return;
        
        // 清空变更数组并更新按钮状态
        this.changes = [];
        await this.updateButtonStates();
        
        this.changesContainer.empty();
        const emptyState = this.changesContainer.createDiv('git-empty-state');
        emptyState.textContent = message;
    }

    private getDisplayPath(filePath: string): string {
        // 简化路径显示 - 支持Windows和Unix路径分隔符
        
        // 首先去除路径中的引号
        let cleanPath = filePath.replace(/^"/, '').replace(/"$/, '');
        
        // 解码UTF-8八进制转义字符
        try {
            // 使用更简单的方法：先转换为Buffer，再解码
            if (cleanPath.includes('\\')) {
                const buffer = Buffer.alloc(cleanPath.length);
                let bufferIndex = 0;
                
                for (let i = 0; i < cleanPath.length; i++) {
                    if (cleanPath[i] === '\\' && i + 3 < cleanPath.length && 
                        /^\d{3}$/.test(cleanPath.substr(i + 1, 3))) {
                        // 八进制转义序列
                        const octal = cleanPath.substr(i + 1, 3);
                        const byteValue = parseInt(octal, 8);
                        buffer[bufferIndex++] = byteValue;
                        i += 3; // 跳过已处理的字符
                    } else {
                        // 普通字符
                        buffer[bufferIndex++] = cleanPath.charCodeAt(i);
                    }
                }
                
                // 截取实际使用的部分并解码
                const actualBuffer = buffer.slice(0, bufferIndex);
                cleanPath = actualBuffer.toString('utf8');
            }
        } catch (e) {
            console.error('UTF-8解码失败:', e);
            // 如果解码失败，简单地移除转义字符
            cleanPath = cleanPath.replace(/\\(\d{3})/g, '');
        }
        
        const parts = cleanPath.split(/[/\\]/);
        let result = parts[parts.length - 1];
        
        // 清理文件名，去除特殊字符和状态标识
        result = result.replace(/^\*/, '').replace(/\*$/, ''); // 去除开头和结尾的*号
        result = result.trim(); // 去除空格
        
        return result;
    }

    private getDecodedPath(filePath: string): string {
        // 获取解码后的完整仓库相对路径，用于悬停显示
        
        // 首先去除路径中的引号
        let cleanPath = filePath.replace(/^"/, '').replace(/"$/, '');
        
        // 解码UTF-8八进制转义字符
        try {
            // 使用更简单的方法：先转换为Buffer，再解码
            if (cleanPath.includes('\\')) {
                const buffer = Buffer.alloc(cleanPath.length);
                let bufferIndex = 0;
                
                for (let i = 0; i < cleanPath.length; i++) {
                    if (cleanPath[i] === '\\' && i + 3 < cleanPath.length && 
                        /^\d{3}$/.test(cleanPath.substr(i + 1, 3))) {
                        // 八进制转义序列
                        const octal = cleanPath.substr(i + 1, 3);
                        const byteValue = parseInt(octal, 8);
                        buffer[bufferIndex++] = byteValue;
                        i += 3; // 跳过已处理的字符
                    } else {
                        // 普通字符
                        buffer[bufferIndex++] = cleanPath.charCodeAt(i);
                    }
                }
                
                // 截取实际使用的部分并解码
                const actualBuffer = buffer.slice(0, bufferIndex);
                cleanPath = actualBuffer.toString('utf8');
            }
        } catch (e) {
            console.error('UTF-8解码失败:', e);
            // 如果解码失败，简单地移除转义字符
            cleanPath = cleanPath.replace(/\\(\d{3})/g, '');
        }
        
        // 清理路径，去除特殊字符
        cleanPath = cleanPath.replace(/^\*/, '').replace(/\*$/, ''); // 去除开头和结尾的*号
        cleanPath = cleanPath.trim(); // 去除空格
        
        return cleanPath;
    }

    private escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
