import { App, Plugin, PluginSettingTab, Setting, Notice, Modal, WorkspaceLeaf } from 'obsidian';
import { exec } from 'child_process';
import { promisify } from 'util';
import { PREDEFINED_PROVIDERS } from './model-config';
import { DataManager } from './data-manager';
import { NewModelConfigManager, ModelConfig } from './new-model-config-manager';
import { ModelManagementModal, DefaultModelSelector } from './ai-settings-components';
import { DataMigrationChecker } from './data-migration-modal';
import { GitCommitView, GIT_COMMIT_VIEW_TYPE } from './git-commit-view';
import { GitChangeInfo } from './git-types';

const execAsync = promisify(exec);

interface GitAutoCommitSettings {
    defaultCommitScope: 'all' | 'single';
    defaultMessageType: 'ai' | 'manual';
    pushToRemote: boolean;
    remoteBranch: string;
    autoCommit: boolean;
    includeFileTypes: string[];
    excludePatterns: string[];
    showNotifications: boolean;
    batchProcessingEnabled: boolean;
    batchSizeLimitMB: number;
}

const ENHANCED_SYSTEM_PROMPT = `你是一个专业的Git提交信息生成助手。请根据提供的git diff内容，生成符合Conventional Commits规范的详细提交信息。

## 输出格式要求：
你可以进行分析和推理，但最终必须在结尾输出标准格式的提交信息：

\`\`\`
<type>: <简短描述>

<详细内容>
\`\`\`

## 提交类型规范：
- feat: 新增功能或特性
- fix: 修复问题或错误
- docs: 文档相关变更
- style: 格式调整（不影响代码逻辑）
- refactor: 重构代码
- chore: 构建过程或辅助工具的变动
- test: 测试相关
- perf: 性能优化

## 生成规则：
1. 首行：选择最主要的变更类型 + 简短总结（不超过50字符）
2. 空行分隔
3. 详细描述：列出所有重要变更，每行一个要点
4. 使用中文输出，描述具体准确
5. 按重要性排序变更内容

## 详细描述格式：
- 新增了XXX功能/文件
- 修改了XXX内容，包括：
  - 具体改动点1
  - 具体改动点2
- 更新了XXX配置
- 重构了XXX模块

## 重要提醒：
无论你进行了多少分析和推理，最终都必须在回答的结尾提供一个标准格式的提交信息，格式如下：

\`\`\`
chore: 清理项目文档

删除了临时的项目文档：
- 移除推理模型修复报告.md
- 清理不需要的说明文件
\`\`\`

请严格按照此格式生成提交信息，确保信息详细且有条理。`;

const DEFAULT_SETTINGS: GitAutoCommitSettings = {
    defaultCommitScope: 'all',
    defaultMessageType: 'ai',
    pushToRemote: true,
    remoteBranch: 'main',
    autoCommit: false,
    includeFileTypes: ['.md', '.txt', '.canvas', '.json'],
    excludePatterns: ['.obsidian/', 'node_modules/', '.git/'],
    showNotifications: true,
    batchProcessingEnabled: true,
    batchSizeLimitMB: 10
};

export default class GitAutoCommitPlugin extends Plugin {
    settings: GitAutoCommitSettings;
    dataManager: DataManager;
    modelManager: NewModelConfigManager;

    async onload() {
        // 初始化数据管理器
        this.dataManager = new DataManager(this.app, this.manifest.dir || '');
        await this.dataManager.initialize();
        
        // 初始化模型管理器
        this.modelManager = new NewModelConfigManager(this.dataManager);
        
        // 加载插件设置
        await this.loadSettings();

        // 检查数据迁移状态并显示相关信息
        await DataMigrationChecker.checkAndShowMigrationIfNeeded(this.app, this.dataManager);

        // 注册Git提交视图
        this.registerView(
            GIT_COMMIT_VIEW_TYPE,
            (leaf) => new GitCommitView(leaf, this)
        );

        // 添加功能区图标
        this.addRibbonIcon('upload', 'Git自动提交', async (evt: MouseEvent) => {
            await this.activateGitCommitView();
        });

        // 添加命令
        this.addCommand({
            id: 'git-auto-commit',
            name: '执行Git提交',
            callback: async () => {
                await this.activateGitCommitView();
            }
        });

        this.addCommand({
            id: 'git-commit-current-file',
            name: '提交当前文件',
            callback: () => {
                this.performGitCommit('current');
            }
        });

        this.addCommand({
            id: 'git-commit-all-files',
            name: '提交所有文件',
            callback: () => {
                this.performGitCommit('all');
            }
        });

        this.addCommand({
            id: 'debug-ai-config',
            name: '调试AI配置',
            callback: () => {
                this.debugAIConfig();
            }
        });

        this.addCommand({
            id: 'debug-data-status',
            name: '调试数据状态',
            callback: () => {
                this.debugDataStatus();
            }
        });

        this.addCommand({
            id: 'reset-plugin-data',
            name: '重置插件数据',
            callback: async () => {
                await this.resetPluginData();
            }
        });

        this.addCommand({
            id: 'test-batch-processing',
            name: '测试分批处理功能',
            callback: () => {
                this.testBatchProcessing();
            }
        });

        // 添加设置选项卡
        this.addSettingTab(new GitAutoCommitSettingTab(this.app, this));

        console.log('Git Auto Commit 插件已加载 - 使用新的数据存储系统');
    }

    async activateGitCommitView() {
        const leaves = this.app.workspace.getLeavesOfType(GIT_COMMIT_VIEW_TYPE);
        let leaf: WorkspaceLeaf;
        
        if (leaves.length === 0) {
            // 如果视图不存在，创建新的叶子
            leaf = this.app.workspace.getRightLeaf(false) ?? this.app.workspace.getLeaf();
            await leaf.setViewState({
                type: GIT_COMMIT_VIEW_TYPE,
                active: true
            });
        } else {
            // 如果视图已存在，激活它
            leaf = leaves[0];
        }
        
        // 显示视图
        this.app.workspace.revealLeaf(leaf);
    }

    onunload() {
        console.log('Git Auto Commit 插件已卸载');
    }

    async loadSettings() {
        // 从数据管理器获取设置
        this.settings = this.dataManager.getSettings();
    }

    async saveSettings() {
        // 通过数据管理器保存设置
        await this.dataManager.updateSettings(this.settings);
    }

    async performGitCommit(scope?: 'all' | 'single' | 'current') {
        try {
            // 验证Git仓库
            if (!(await this.validateRepository())) {
                return;
            }

            // 确定提交范围
            let commitScope = scope || this.settings.defaultCommitScope;
            let filesToCommit: string[] = [];

            if (commitScope === 'current') {
                const activeFile = this.app.workspace.getActiveFile();
                if (!activeFile) {
                    new Notice('❌ 没有打开的文件');
                    return;
                }
                filesToCommit = [activeFile.path];
                commitScope = 'single';
            } else if (commitScope === 'single' && !this.settings.autoCommit) {
                const modifiedFiles = await this.getModifiedFiles();
                if (modifiedFiles.length === 0) {
                    new Notice('没有修改的文件需要提交');
                    return;
                }
                
                // 显示文件选择模态框
                const selectedFile = await this.showFileSelectionModal(modifiedFiles);
                if (!selectedFile) return;
                filesToCommit = [selectedFile];
            }

            // 确定提交信息类型
            let messageType = this.settings.defaultMessageType;
            let commitMessage = '';

            if (messageType === 'ai') {
                const defaultModel = this.modelManager.getDefaultModel();
                console.log('Git Auto Commit - 默认模型:', defaultModel);
                
                if (!defaultModel) {
                    new Notice('❌ 未配置默认AI模型，请在设置中配置');
                    console.error('Git Auto Commit - 未找到默认模型');
                    return;
                }
                if (!defaultModel.isVerified) {
                    new Notice('❌ 默认AI模型未验证，请在设置中验证模型配置');
                    console.error('Git Auto Commit - 默认模型未验证:', defaultModel);
                    return;
                }

                if (this.settings.showNotifications) {
                    new Notice('正在使用AI生成提交信息...');
                }
                
                console.log('Git Auto Commit - 开始生成AI提交信息...');
                commitMessage = await this.generateCommitMessageWithAI(filesToCommit);
                console.log('Git Auto Commit - AI生成的提交信息:', commitMessage);

                if (!this.settings.autoCommit) {
                    const userMessage = await this.showCommitMessageModal(commitMessage);
                    if (!userMessage) return;
                    commitMessage = userMessage;
                }
            } else {
                if (this.settings.autoCommit) {
                    commitMessage = `更新笔记 - ${new Date().toLocaleString('zh-CN')}`;
                } else {
                    const userMessage = await this.showCommitMessageModal();
                    if (!userMessage) return;
                    commitMessage = userMessage;
                }
            }

            // 执行Git操作 - 智能分批处理
            await this.executeGitOperationsWithBatching(filesToCommit, commitMessage);

            if (this.settings.showNotifications) {
                new Notice('✅ Git提交完成！');
            }

        } catch (error) {
            console.error('Git提交失败:', error);
            new Notice(`❌ Git提交失败: ${error.message}`);
        }
    }

    async getGitChanges(): Promise<GitChangeInfo[]> {
        try {
            const vaultPath = (this.app.vault.adapter as any).basePath || 
                             (this.app.vault.adapter as any).path ||
                             this.app.vault.configDir;
            
            const { stdout } = await execAsync('git status --porcelain', { 
                cwd: vaultPath,
                maxBuffer: 10 * 1024 * 1024 // 10MB 缓冲区
            });
            
            if (!stdout.trim()) {
                return [];
            }

            const changes: GitChangeInfo[] = [];
            const lines = stdout.split('\n').filter(line => line.trim());

            for (const line of lines) {
                if (line.length < 4) continue;

                // git status --porcelain 格式：XY filename
                // X = 暂存区状态，Y = 工作区状态
                const indexStatus = line[0]; // 暂存区状态
                const workingStatus = line[1]; // 工作区状态
                const filePath = line.substring(3);

                // 检查文件是否符合包含/排除规则
                const hasValidExtension = this.settings.includeFileTypes.some(ext => 
                    filePath.endsWith(ext)
                );
                if (!hasValidExtension) continue;

                const isExcluded = this.settings.excludePatterns.some(pattern => 
                    filePath.includes(pattern)
                );
                if (isExcluded) continue;

                // 根据暂存区和工作区状态确定最终状态
                let status: GitChangeInfo['status'];
                let isStaged = false;

                if (indexStatus !== ' ' && indexStatus !== '?') {
                    // 文件已暂存
                    isStaged = true;
                    status = indexStatus as GitChangeInfo['status'];
                } else if (workingStatus !== ' ') {
                    // 文件未暂存但有变更
                    isStaged = false;
                    status = workingStatus === '?' ? '??' : workingStatus as GitChangeInfo['status'];
                } else {
                    continue; // 跳过没有变更的文件
                }

                const statusText = this.getStatusText(status);
                
                // 尝试获取diff信息（对于修改的文件）
                let diff = '';
                try {
                    if (status === 'M' || status === 'MM') {
                        const diffCommand = isStaged ? 
                            `git diff --cached -- "${filePath}"` : 
                            `git diff HEAD -- "${filePath}"`;
                        
                        const { stdout: diffOutput } = await execAsync(
                            diffCommand, 
                            { 
                                cwd: vaultPath,
                                maxBuffer: 2 * 1024 * 1024 // 2MB 缓冲区用于diff
                            }
                        );
                        diff = diffOutput.trim();
                    }
                } catch (error) {
                    console.warn(`获取文件 ${filePath} 的diff失败:`, error);
                }

                changes.push({
                    filePath,
                    status,
                    statusText,
                    diff,
                    isStaged // 添加暂存状态标识
                });
            }

            return changes;

        } catch (error) {
            console.error('获取Git变更失败:', error);
            throw error;
        }
    }

    private getStatusText(status: string): string {
        switch (status) {
            case 'M': return '修改';
            case 'A': return '新增';
            case 'D': return '删除';
            case 'R': return '重命名';
            case '??': return '未跟踪';
            case 'MM': return '混合变更';
            default: return status;
        }
    }

    async performActualCommit(filesToCommit: string[], commitMessage: string): Promise<void> {
        try {
            const vaultPath = (this.app.vault.adapter as any).basePath || 
                             (this.app.vault.adapter as any).path ||
                             this.app.vault.configDir;

            // 如果没有指定文件，提交所有变更
            if (filesToCommit.length === 0) {
                await execAsync('git add .', { 
                    cwd: vaultPath,
                    maxBuffer: 50 * 1024 * 1024 // 50MB 缓冲区
                });
            } else {
                // 添加指定文件
                for (const file of filesToCommit) {
                    await execAsync(`git add "${file}"`, { 
                        cwd: vaultPath,
                        maxBuffer: 10 * 1024 * 1024 // 10MB 缓冲区
                    });
                }
            }

            // 执行提交
            await execAsync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, { 
                cwd: vaultPath,
                maxBuffer: 5 * 1024 * 1024 // 5MB 缓冲区
            });

            if (this.settings.showNotifications) {
                new Notice('✅ 提交成功！');
            }

        } catch (error) {
            console.error('Git提交失败:', error);
            throw error;
        }
    }

    async pushToRemoteRepository(): Promise<void> {
        try {
            const vaultPath = (this.app.vault.adapter as any).basePath || 
                             (this.app.vault.adapter as any).path ||
                             this.app.vault.configDir;

            // 推送到远程仓库
            await execAsync(`git push origin ${this.settings.remoteBranch}`, { 
                cwd: vaultPath,
                maxBuffer: 10 * 1024 * 1024 // 10MB 缓冲区
            });

            if (this.settings.showNotifications) {
                new Notice('✅ 推送到远程仓库成功！');
            }

        } catch (error) {
            console.error('推送到远程仓库失败:', error);
            throw error;
        }
    }

    async validateRepository(): Promise<boolean> {
        try {
            const vaultPath = (this.app.vault.adapter as any).basePath || 
                             (this.app.vault.adapter as any).path ||
                             this.app.vault.configDir;
            await execAsync('git rev-parse --git-dir', { 
                cwd: vaultPath,
                maxBuffer: 1024 * 1024 // 1MB 缓冲区（足够小命令使用）
            });
            return true;
        } catch (error) {
            new Notice('❌ 当前目录不是Git仓库，请先初始化Git仓库');
            return false;
        }
    }

    async getModifiedFiles(): Promise<string[]> {
        try {
            const vaultPath = (this.app.vault.adapter as any).basePath || 
                             (this.app.vault.adapter as any).path ||
                             this.app.vault.configDir;
            const { stdout } = await execAsync('git status --porcelain', { 
                cwd: vaultPath,
                maxBuffer: 10 * 1024 * 1024 // 10MB 缓冲区
            });
            
            if (!stdout.trim()) {
                return [];
            }

            return stdout
                .split('\n')
                .filter(line => line.trim())
                .map(line => line.substring(3))
                .filter(file => {
                    // 检查文件类型
                    const hasValidExtension = this.settings.includeFileTypes.some(ext => 
                        file.endsWith(ext)
                    );
                    if (!hasValidExtension) return false;

                    // 检查排除模式
                    const isExcluded = this.settings.excludePatterns.some(pattern => 
                        file.includes(pattern)
                    );
                    return !isExcluded;
                });
        } catch (error) {
            console.error('获取修改文件列表失败:', error);
            return [];
        }
    }

    async generateCommitMessageWithAI(filesToCommit: string[]): Promise<string> {
        try {
            console.log('Git Auto Commit - generateCommitMessageWithAI 开始执行');
            const vaultPath = (this.app.vault.adapter as any).basePath || 
                             (this.app.vault.adapter as any).path ||
                             this.app.vault.configDir;
            console.log('Git Auto Commit - 工作目录:', vaultPath);

            // 添加文件到暂存区
            if (filesToCommit.length > 0) {
                console.log('Git Auto Commit - 添加指定文件到暂存区:', filesToCommit);
                for (const file of filesToCommit) {
                    await execAsync(`git add "${file}"`, { 
                        cwd: vaultPath,
                        maxBuffer: 5 * 1024 * 1024 // 5MB 缓冲区
                    });
                }
            } else {
                console.log('Git Auto Commit - 添加所有文件到暂存区');
                await execAsync('git add .', { 
                    cwd: vaultPath,
                    maxBuffer: 10 * 1024 * 1024 // 10MB 缓冲区
                });
            }

            // 获取详细的diff信息，包含文件名
            const { stdout: gitDiff } = await execAsync('git diff --cached --name-status', { 
                cwd: vaultPath,
                maxBuffer: 50 * 1024 * 1024 // 50MB 缓冲区
            });
            const { stdout: gitDiffContent } = await execAsync('git diff --cached', { 
                cwd: vaultPath,
                maxBuffer: 50 * 1024 * 1024 // 50MB 缓冲区
            });
            
            console.log('Git Auto Commit - Git diff 状态:', gitDiff);
            console.log('Git Auto Commit - Git diff 内容长度:', gitDiffContent.length);

            // 检查 diff 内容大小并给出警告
            if (gitDiffContent.length > 10 * 1024 * 1024) { // 10MB
                console.warn('Git Auto Commit - 检测到大量文件变更，diff 内容超过 10MB，可能影响 AI 处理性能');
                new Notice('⚠️ 检测到大量文件变更，AI 分析可能需要较长时间', 3000);
            } else if (gitDiffContent.length > 5 * 1024 * 1024) { // 5MB
                console.warn('Git Auto Commit - 检测到较多文件变更，diff 内容超过 5MB');
                new Notice('📝 检测到较多文件变更，正在分析...', 2000);
            }

            if (!gitDiff.trim()) {
                console.log('Git Auto Commit - 没有检测到文件变更，使用默认提交信息');
                return '更新笔记内容';
            }

            // 解析修改的文件信息
            const fileChanges = this.parseFileChanges(gitDiff);
            const fileCount = fileChanges.length;
            console.log('Git Auto Commit - 解析到的文件变更:', fileChanges);

            // 构建更详细的上下文信息
            const contextInfo = this.buildContextInfo(fileChanges, gitDiffContent);
            console.log('Git Auto Commit - 上下文信息:', contextInfo);

            // 根据文件数量调整提示词
            const systemPrompt = this.buildDynamicPrompt(fileCount);
            console.log('Git Auto Commit - 系统提示词长度:', systemPrompt.length);

            // 调用选择的AI提供商API
            console.log('Git Auto Commit - 开始调用AI API...');
            const response = await this.callAIProvider(systemPrompt, contextInfo, fileCount);
            console.log('Git Auto Commit - API响应状态:', response.status, response.statusText);

            if (!response.ok) {
                const defaultModel = this.modelManager.getDefaultModel();
                const providerName = defaultModel ? defaultModel.displayName : 'AI模型';
                const errorText = await response.text();
                console.error('Git Auto Commit - API请求失败:', response.status, errorText);
                throw new Error(`${providerName} API请求失败: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('Git Auto Commit - API响应数据:', data);
            
            // 详细检查响应结构
            console.log('Git Auto Commit - choices数组:', data.choices);
            if (data.choices && data.choices[0]) {
                console.log('Git Auto Commit - 第一个choice:', data.choices[0]);
                console.log('Git Auto Commit - message对象:', data.choices[0].message);
            }
            
            if (!data.choices || !data.choices[0]) {
                console.error('Git Auto Commit - API响应格式错误:', data);
                throw new Error('API响应格式错误：缺少choices数组');
            }
            
            let aiMessage = '';
            const choice = data.choices[0];
            
            // 详细打印choice结构用于调试
            console.log('Git Auto Commit - choice的所有属性:', Object.keys(choice));
            if (choice.message) {
                console.log('Git Auto Commit - message的所有属性:', Object.keys(choice.message));
                console.log('Git Auto Commit - message内容:', choice.message);
            }
            
            // 首先通过模型名称检查是否是推理模型
            const isReasoningModelByName = this.isReasoningModelByName();
            
            if (isReasoningModelByName) {
                // 对于推理模型，尝试提取最终答案部分，而不是完全跳过
                console.log('Git Auto Commit - 检测到推理模型（基于模型名称），尝试提取最终答案');
                aiMessage = this.extractFinalAnswerFromReasoning(choice);
            } else {
                // 检查响应结构是否是推理模型
                const isReasoningModelByResponse = this.isReasoningModelByResponse(choice);
                
                if (isReasoningModelByResponse) {
                    console.log('Git Auto Commit - 检测到推理模型（基于响应结构），尝试提取最终答案');
                    aiMessage = this.extractFinalAnswerFromReasoning(choice);
                } else {
                    // 尝试多种可能的内容提取方式（仅限非推理模型）
                    if (choice.message && choice.message.content) {
                        // 检查内容是否包含推理过程特征
                        const content = choice.message.content;
                        if (this.containsReasoningContent(content)) {
                            console.log('Git Auto Commit - 内容包含推理过程，尝试提取最终答案');
                            aiMessage = this.extractFinalAnswerFromContent(content);
                        } else {
                            // 标准模型的content字段
                            aiMessage = content;
                            console.log('Git Auto Commit - 从message.content提取内容');
                        }
                    } else if (choice.delta && choice.delta.content) {
                        // 流式响应的delta格式
                        aiMessage = choice.delta.content;
                        console.log('Git Auto Commit - 从delta.content提取内容');
                    } else if (choice.text) {
                        // 某些API返回text字段
                        aiMessage = choice.text;
                        console.log('Git Auto Commit - 从text字段提取内容');
                    } else if (choice.content) {
                        // 直接的content字段
                        aiMessage = choice.content;
                        console.log('Git Auto Commit - 从content字段提取内容');
                    } else if (choice.message && Object.keys(choice.message).length > 0) {
                        // 尝试从message对象的任何字符串属性中提取
                        console.log('Git Auto Commit - 尝试从message的其他属性提取内容');
                        for (const [key, value] of Object.entries(choice.message)) {
                            if (typeof value === 'string' && value.trim() && key !== 'reasoning') {
                                if (this.containsReasoningContent(value)) {
                                    console.log(`Git Auto Commit - message.${key}包含推理过程，尝试提取最终答案`);
                                    aiMessage = this.extractFinalAnswerFromContent(value);
                                } else {
                                    aiMessage = value;
                                    console.log(`Git Auto Commit - 从message.${key}提取内容`);
                                }
                                if (aiMessage) break;
                            }
                        }
                    } else {
                        // 如果都没有找到，记录详细信息但不抛出错误
                        console.warn('Git Auto Commit - 无法从API响应中提取消息内容');
                        console.log('Git Auto Commit - 完整的choice对象:', JSON.stringify(choice, null, 2));
                        aiMessage = '';
                    }
                }
            }
            
            aiMessage = aiMessage.trim();
            console.log('Git Auto Commit - AI原始消息:', aiMessage);
            console.log('Git Auto Commit - AI原始消息长度:', aiMessage.length);

            // 如果AI返回的内容为空，生成基于文件变更的基本提交信息
            if (!aiMessage) {
                console.warn('Git Auto Commit - AI返回空内容，生成基于文件变更的基本提交信息');
                // 检查是否是推理模型
                if (isReasoningModelByName || this.isReasoningModelByResponse(choice)) {
                    console.log('Git Auto Commit - 检测到推理模型，使用基本提交信息');
                    new Notice('⚠️ 推理模型不适合生成简短的提交信息，已自动生成基于文件变更的描述');
                }
                const basicMessage = this.generateBasicCommitMessage(fileChanges);
                console.log('Git Auto Commit - 基本提交信息:', basicMessage);
                return basicMessage;
            }

            // 清理和格式化AI返回的内容
            const finalMessage = this.formatCommitMessage(aiMessage);
            console.log('Git Auto Commit - 格式化后的提交信息:', finalMessage);
            return finalMessage;

        } catch (error) {
            console.error('Git Auto Commit - AI生成提交信息失败:', error);
            new Notice(`❌ AI生成提交信息失败: ${error.message}`);
            
            // 尝试生成基于文件变更的基本提交信息
            try {
                const vaultPath = (this.app.vault.adapter as any).basePath || 
                                 (this.app.vault.adapter as any).path ||
                                 this.app.vault.configDir;
                const { stdout: gitDiff } = await execAsync('git diff --cached --name-status', { 
                    cwd: vaultPath,
                    maxBuffer: 50 * 1024 * 1024 // 50MB 缓冲区
                });
                
                if (gitDiff.trim()) {
                    const fileChanges = this.parseFileChanges(gitDiff);
                    const basicMessage = this.generateBasicCommitMessage(fileChanges);
                    console.log('Git Auto Commit - 使用基本提交信息作为备用:', basicMessage);
                    return basicMessage;
                }
            } catch (fallbackError) {
                console.error('Git Auto Commit - 生成基本提交信息也失败:', fallbackError);
            }
            
            return `更新笔记内容 - ${new Date().toLocaleString('zh-CN')}`;
        }
    }

    /**
     * 基于模型名称检测是否是推理模型
     */
    private isReasoningModelByName(): boolean {
        const defaultModel = this.modelManager.getDefaultModel();
        if (defaultModel && defaultModel.modelName) {
            const modelName = defaultModel.modelName.toLowerCase();
            
            // OpenAI o1系列推理模型
            const openaiReasoningModels = ['o1', 'o1-preview', 'o1-mini', 'o3', 'o3-mini'];
            for (const model of openaiReasoningModels) {
                if (modelName.includes(model)) {
                    console.log(`Git Auto Commit - 检测到OpenAI推理模型: ${model}`);
                    return true;
                }
            }
            
            // 智谱AI GLM推理模型
            if (modelName.includes('glm') && (modelName.includes('think') || modelName.includes('reasoning') || modelName.includes('cot'))) {
                console.log(`Git Auto Commit - 检测到智谱AI推理模型: ${modelName}`);
                return true;
            }
            
            // DeepSeek推理模型
            if (modelName.includes('deepseek') && (modelName.includes('r1') || modelName.includes('reasoner'))) {
                console.log(`Git Auto Commit - 检测到DeepSeek推理模型: ${modelName}`);
                return true;
            }
            
            // 通用推理模型关键词
            const reasoningKeywords = ['reasoner', 'reasoning', 'think', 'cot', 'chain-of-thought'];
            for (const keyword of reasoningKeywords) {
                if (modelName.includes(keyword)) {
                    console.log(`Git Auto Commit - 模型名称包含推理关键词"${keyword}"，判定为推理模型`);
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * 基于响应结构检测是否是推理模型
     */
    private isReasoningModelByResponse(choice: any): boolean {
        // 检查是否有reasoning相关字段（OpenAI o1系列）
        if (choice.message && choice.message.reasoning) {
            console.log('Git Auto Commit - 检测到OpenAI推理模型字段: reasoning');
            return true;
        }
        
        // 检查是否有reasoning_content字段（智谱AI GLM系列）
        if (choice.message && choice.message.reasoning_content) {
            console.log('Git Auto Commit - 检测到智谱AI推理模型字段: reasoning_content');
            return true;
        }
        
        // 检查是否有thinking字段（一些推理模型使用）
        if (choice.message && choice.message.thinking) {
            console.log('Git Auto Commit - 检测到推理模型字段: thinking');
            return true;
        }
        
        // 检查finish_reason是否为reasoning相关（一些API会标记推理完成原因）
        if (choice.finish_reason && choice.finish_reason.includes('reasoning')) {
            console.log('Git Auto Commit - 检测到推理模型完成原因标记');
            return true;
        }
        
        return false;
    }

    /**
     * 检测内容是否包含推理过程特征
     */
    private containsReasoningContent(content: string): boolean {
        if (!content || typeof content !== 'string') {
            return false;
        }
        
        const lowerContent = content.toLowerCase();
        const reasoningPhrases = [
            '让我分析', '让我来分析', '让我思考', '首先分析', '我来分析',
            '让我看看', '让我检查', '分析一下', '我需要分析', '从提供的',
            '根据提供的', '我分析', '让我们分析', '首先，让我', '让我理解'
        ];
        
        for (const phrase of reasoningPhrases) {
            if (lowerContent.includes(phrase)) {
                console.log(`Git Auto Commit - 内容包含推理短语"${phrase}"，判定为推理内容`);
                return true;
            }
        }
        
        // 检查是否包含明显的推理过程结构（如分段分析）
        if (lowerContent.includes('### ') || lowerContent.includes('## ')) {
            console.log('Git Auto Commit - 内容包含分段结构，可能是推理过程');
            return true;
        }
        
        return false;
    }

    /**
     * 从推理模型的响应中提取最终答案
     */
    private extractFinalAnswerFromReasoning(choice: any): string {
        console.log('Git Auto Commit - 推理模型响应结构:', JSON.stringify(choice, null, 2));
        
        let content = '';
        let isReasoningContent = false;
        
        // 处理不同API的推理模型响应格式
        if (choice.message) {
            // OpenAI o1系列推理模型的响应格式
            if (choice.message.reasoning) {
                console.log('Git Auto Commit - 检测到OpenAI推理模型格式(reasoning字段)');
                // 优先使用reasoning字段的内容
                content = choice.message.reasoning;
                isReasoningContent = true;
            } else if (choice.message.reasoning_content) {
                // 智谱AI GLM推理模型的响应格式
                console.log('Git Auto Commit - 检测到智谱AI推理模型格式(reasoning_content字段)');
                content = choice.message.reasoning_content;
                isReasoningContent = true;
            } else if (choice.message.content) {
                // 标准content字段
                console.log('Git Auto Commit - 使用标准content字段');
                content = choice.message.content;
                // 检查content是否包含推理过程
                isReasoningContent = this.containsReasoningContent(content);
            }
        } else if (choice.text) {
            // 一些API使用text字段
            content = choice.text;
            isReasoningContent = this.containsReasoningContent(content);
            console.log('Git Auto Commit - 从text字段提取内容');
        } else if (choice.content) {
            // 直接的content字段
            content = choice.content;
            isReasoningContent = this.containsReasoningContent(content);
            console.log('Git Auto Commit - 从content字段提取内容');
        }
        
        if (!content) {
            console.log('Git Auto Commit - 推理模型响应中未找到可提取的内容');
            return '';
        }
        
        console.log('Git Auto Commit - 提取到的内容长度:', content.length, 
                   '是推理内容:', isReasoningContent);
        
        // 如果确定是推理内容，使用专门的提取逻辑
        if (isReasoningContent) {
            return this.extractFinalAnswerFromContent(content);
        } else {
            // 如果不是推理内容，直接返回（可能是已经提取好的最终答案）
            return this.formatCommitMessage(content);
        }
    }

    /**
     * 从包含推理过程的内容中提取最终答案
     */
    private extractFinalAnswerFromContent(content: string): string {
        if (!content || typeof content !== 'string') {
            return '';
        }

        console.log('Git Auto Commit - 开始从推理内容中提取最终答案，内容长度:', content.length);

        // 高级模式：尝试识别推理模型的特殊响应结构
        
        // 1. 首先查找明确标记的最终答案部分
        const finalAnswerPatterns = [
            // 查找"最终答案"、"最终建议"等明确标记
            /(?:最终答案|最终建议|最终提交信息|建议的提交信息|推荐的提交信息)[:：]\s*([\s\S]*?)(?=\n\n|$)/gi,
            // 查找代码块中的答案
            /```(?:git|commit)?\s*((?:(?!```)[\s\S])*?)\s*```/gi,
            // 查找通用代码块
            /```\s*((?:(?!```)[\s\S])*?)\s*```/gi,
            // 查找结论性语句
            /(?:因此|所以|综上|总结|结论)[:：，,]\s*((?:feat|fix|docs|style|refactor|chore|test|perf):\s*[^\n]*(?:\n[\s\S]*?)?)(?=\n\n|$)/gi
        ];

        for (const pattern of finalAnswerPatterns) {
            try {
                const matches = content.matchAll(pattern);
                for (const match of matches) {
                    if (match[1]) {
                        const extracted = match[1].trim();
                        if (this.isValidCommitMessage(extracted)) {
                            console.log('Git Auto Commit - 从明确答案标记中提取到有效提交信息');
                            return this.formatCommitMessage(extracted);
                        }
                    }
                }
            } catch (error) {
                console.warn('Git Auto Commit - 正则匹配错误:', error);
                continue;
            }
        }

        // 2. 查找所有的提交格式行，选择最完整的
        const commitTypePattern = /((?:feat|fix|docs|style|refactor|chore|test|perf):\s*[^\n]*(?:\n(?:\s*-\s*[^\n]*|\s*\*\s*[^\n]*|\s{2,}[^\n]*)*)*)/gi;
        
        try {
            const commitMatches = [...content.matchAll(commitTypePattern)];
            
            if (commitMatches.length > 0) {
                // 选择最长或最后出现的提交信息（推理模型通常在最后给出最终答案）
                const lastMatch = commitMatches[commitMatches.length - 1];
                if (lastMatch && lastMatch[1]) {
                    const extracted = lastMatch[1].trim();
                    if (this.isValidCommitMessage(extracted) && extracted.length > 20) {
                        console.log('Git Auto Commit - 从提交类型模式中提取到有效提交信息');
                        return this.formatCommitMessage(extracted);
                    }
                }
            }
        } catch (error) {
            console.warn('Git Auto Commit - 提交类型匹配错误:', error);
        }

        // 3. 查找推理过程中的建议性语句
        const suggestionPatterns = [
            /建议[:：]\s*((?:feat|fix|docs|style|refactor|chore|test|perf):\s*[^\n]*(?:\n[\s\S]*?)?)(?=\n\n|建议|因此|所以|$)/gi,
            /推荐[:：]\s*((?:feat|fix|docs|style|refactor|chore|test|perf):\s*[^\n]*(?:\n[\s\S]*?)?)(?=\n\n|建议|因此|所以|$)/gi,
            /可以写为[:：]\s*((?:feat|fix|docs|style|refactor|chore|test|perf):\s*[^\n]*(?:\n[\s\S]*?)?)(?=\n\n|建议|因此|所以|$)/gi
        ];

        for (const pattern of suggestionPatterns) {
            try {
                const matches = content.matchAll(pattern);
                for (const match of matches) {
                    if (match[1]) {
                        const extracted = match[1].trim();
                        if (this.isValidCommitMessage(extracted)) {
                            console.log('Git Auto Commit - 从建议性语句中提取到有效提交信息');
                            return this.formatCommitMessage(extracted);
                        }
                    }
                }
            } catch (error) {
                console.warn('Git Auto Commit - 建议性语句匹配错误:', error);
                continue;
            }
        }

        // 4. 如果推理模型没有给出明确的最终答案，尝试从内容中提取关键信息生成
        console.log('Git Auto Commit - 未找到明确的最终答案，尝试从推理内容生成提交信息');
        return this.generateCommitFromReasoning(content);
    }

    /**
     * 检测内容是否被截断
     */
    private isContentTruncated(content: string): boolean {
        if (!content) return false;
        
        // 检查是否以不完整的句子结尾
        const trimmedContent = content.trim();
        const lastChar = trimmedContent.slice(-1);
        
        // 如果以这些字符结尾，可能是截断的
        const truncationIndicators = ['-', '这', '、', '是', '的', '了', '和', '或', '等'];
        
        return truncationIndicators.includes(lastChar) || 
               trimmedContent.endsWith('...') ||
               trimmedContent.length < 50; // 内容太短也可能是截断
    }

    /**
     * 生成备用的基本提交信息
     */
    private generateFallbackCommitMessage(content: string): string {
        // 从推理内容中查找关键信息
        const lowerContent = content.toLowerCase();
        
        // 检测主要操作类型
        if (lowerContent.includes('删除') || lowerContent.includes('移除')) {
            return 'chore: 清理和删除文件';
        } else if (lowerContent.includes('新增') || lowerContent.includes('添加') || lowerContent.includes('创建')) {
            return 'feat: 添加新文件和功能';
        } else if (lowerContent.includes('修改') || lowerContent.includes('更新') || lowerContent.includes('改动')) {
            return 'docs: 更新文档和配置文件';
        } else if (lowerContent.includes('重构') || lowerContent.includes('优化')) {
            return 'refactor: 重构代码结构';
        } else if (lowerContent.includes('修复') || lowerContent.includes('修正')) {
            return 'fix: 修复问题';
        } else if (lowerContent.includes('格式') || lowerContent.includes('样式')) {
            return 'style: 调整格式和样式';
        }
        
        // 默认返回通用的更新信息
        return 'chore: 更新项目文件';
    }

    /**
     * 基于推理内容生成合适的提交信息
     */
    private generateCommitFromReasoning(content: string): string {
        console.log('Git Auto Commit - 开始基于推理内容生成提交信息');
        
        const lowerContent = content.toLowerCase();
        
        // 分析推理内容中提到的操作类型和文件类型
        let commitType = 'chore';
        let description = '更新项目文件';
        let details: string[] = [];
        
        // 提取文件变更信息
        const fileMatches = content.match(/(?:新增|添加|创建|删除|移除|修改|更新)(?:了)?(?:\s*[:：]?\s*)?([^\n，。,;；]*)/gi);
        if (fileMatches) {
            fileMatches.forEach(match => {
                const cleanMatch = match.replace(/^(?:新增|添加|创建|删除|移除|修改|更新)(?:了)?(?:\s*[:：]?\s*)?/, '').trim();
                if (cleanMatch && cleanMatch.length > 0 && cleanMatch.length < 50) {
                    details.push(cleanMatch);
                }
            });
        }
        
        // 确定主要操作类型
        if (lowerContent.includes('删除') || lowerContent.includes('移除')) {
            commitType = 'chore';
            
            // 根据删除的文件类型确定描述
            if (lowerContent.includes('文档') || lowerContent.includes('markdown') || lowerContent.includes('.md')) {
                description = '清理项目文档';
            } else if (lowerContent.includes('配置') || lowerContent.includes('插件') || lowerContent.includes('辅助工具')) {
                description = '移除辅助工具文件';
            } else if (details.length > 0) {
                description = `清理${details[0]}等文件`;
            } else {
                description = '清理项目文件';
            }
        } else if (lowerContent.includes('新增') || lowerContent.includes('添加') || lowerContent.includes('创建')) {
            commitType = 'feat';
            if (lowerContent.includes('文档') || lowerContent.includes('markdown')) {
                description = '添加项目文档';
            } else if (lowerContent.includes('功能') || lowerContent.includes('特性')) {
                description = '添加新功能';
            } else if (details.length > 0) {
                description = `添加${details[0]}等文件`;
            } else {
                description = '添加新内容';
            }
        } else if (lowerContent.includes('修改') || lowerContent.includes('更新')) {
            if (lowerContent.includes('文档') || lowerContent.includes('markdown')) {
                commitType = 'docs';
                description = '更新项目文档';
            } else if (lowerContent.includes('配置')) {
                commitType = 'chore';
                description = '更新配置文件';
            } else if (lowerContent.includes('功能')) {
                commitType = 'feat';
                description = '更新功能';
            } else if (details.length > 0) {
                commitType = 'feat';
                description = `更新${details[0]}`;
            } else {
                commitType = 'feat';
                description = '更新内容';
            }
        } else if (lowerContent.includes('修复') || lowerContent.includes('修正')) {
            commitType = 'fix';
            description = '修复问题';
        } else if (lowerContent.includes('重构') || lowerContent.includes('优化')) {
            commitType = 'refactor';
            description = '重构代码';
        } else if (lowerContent.includes('格式') || lowerContent.includes('样式')) {
            commitType = 'style';
            description = '调整格式';
        }
        
        // 构建多行提交信息
        let result = `${commitType}: ${description}`;
        
        // 如果有具体的变更细节，添加到提交信息中
        if (details.length > 0 && details.length <= 3) {
            result += '\n\n';
            details.forEach(detail => {
                if (detail.trim()) {
                    result += `- ${detail.trim()}\n`;
                }
            });
            result = result.trim();
        } else if (details.length > 3) {
            // 如果变更太多，只添加一个总结
            result += `\n\n- 包含${details.length}个文件的变更`;
        }
        
        console.log('Git Auto Commit - 基于推理内容生成提交信息:', result);
        return result;
    }

    /**
     * 验证提取的内容是否像一个有效的提交信息
     */
    private isValidCommitMessage(message: string): boolean {
        if (!message || message.length < 5) {
            return false;
        }

        // 检查是否包含提交类型前缀
        const commitTypes = ['feat', 'fix', 'docs', 'style', 'refactor', 'chore', 'test', 'perf'];
        const hasCommitType = commitTypes.some(type => 
            message.toLowerCase().startsWith(type + ':') || 
            message.toLowerCase().includes(type + ':')
        );

        if (hasCommitType) {
            return true;
        }

        // 检查是否包含常见的提交动词
        const commitVerbs = ['新增', '修改', '删除', '更新', '重构', '添加', '移除', '优化', '修复'];
        const hasCommitVerb = commitVerbs.some(verb => message.includes(verb));

        if (hasCommitVerb && message.length > 10) {
            return true;
        }

        // 避免推理过程的句子
        const reasoningIndicators = ['让我', '我来', '分析', '首先', '然后', '接下来', '根据'];
        const hasReasoningIndicator = reasoningIndicators.some(indicator => 
            message.startsWith(indicator)
        );

        return !hasReasoningIndicator;
    }

    /**
     * 生成基于文件变更的基本提交信息
     */
    private generateBasicCommitMessage(fileChanges: Array<{status: string, file: string, type: string}>): string {
        if (fileChanges.length === 0) {
            return '更新文件内容';
        }

        if (fileChanges.length === 1) {
            const change = fileChanges[0];
            return `${change.status} ${change.file}`;
        }

        // 按状态分组统计
        const statusCounts = fileChanges.reduce((acc, change) => {
            acc[change.status] = (acc[change.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const parts: string[] = [];
        for (const [status, count] of Object.entries(statusCounts)) {
            if (count === 1) {
                parts.push(status);
            } else {
                parts.push(`${status}${count}个文件`);
            }
        }

        return parts.join('，');
    }

    /**
     * 解析文件变更信息
     */
    private parseFileChanges(gitDiff: string): Array<{status: string, file: string, type: string}> {
        return gitDiff.split('\n')
            .filter(line => line.trim())
            .map(line => {
                const [status, file] = line.split('\t');
                const fileExtension = file.split('.').pop()?.toLowerCase() || '';
                const fileType = this.getFileType(fileExtension);
                
                return {
                    status: this.translateStatus(status),
                    file,
                    type: fileType
                };
            });
    }

    /**
     * 翻译Git状态码
     */
    private translateStatus(status: string): string {
        const statusMap: { [key: string]: string } = {
            'A': '新增',
            'M': '修改',
            'D': '删除',
            'R': '重命名',
            'C': '复制',
            'U': '更新'
        };
        return statusMap[status] || '修改';
    }

    /**
     * 获取文件类型
     */
    private getFileType(extension: string): string {
        const typeMap: { [key: string]: string } = {
            'md': '笔记',
            'txt': '文本',
            'json': '配置',
            'js': '脚本',
            'ts': '脚本',
            'css': '样式',
            'html': '页面',
            'png': '图片',
            'jpg': '图片',
            'jpeg': '图片',
            'gif': '图片',
            'pdf': '文档',
            'canvas': '画布'
        };
        return typeMap[extension] || '文件';
    }

    /**
     * 构建上下文信息
     */
    private buildContextInfo(fileChanges: Array<{status: string, file: string, type: string}>, diffContent: string): {summary: string, details: string} {
        // 生成文件变更统计
        const summary = fileChanges.map(change => 
            `${change.status} ${change.file} (${change.type})`
        ).join('\n');

        // 改进的diff内容长度限制
        let details = diffContent;
        const maxLength = 8000; // 增加到8000字符
        
        if (details.length > maxLength) {
            console.log(`Git Auto Commit - Diff内容过长 (${details.length}字符)，正在智能截断...`);
            
            // 提取关键信息：文件头、添加的内容摘要
            const lines = details.split('\n');
            const importantLines: string[] = [];
            let currentLength = 0;
            
            // 优先保留文件头和重要变更
            for (const line of lines) {
                // 保留文件头信息
                if (line.startsWith('+++') || line.startsWith('---') || line.startsWith('@@')) {
                    importantLines.push(line);
                    currentLength += line.length + 1;
                }
                // 保留有意义的添加和删除行（过滤掉空行和极短的行）
                else if ((line.startsWith('+') && !line.startsWith('+++') && line.trim().length > 10) ||
                         (line.startsWith('-') && !line.startsWith('---') && line.trim().length > 10)) {
                    if (currentLength + line.length + 1 < maxLength - 200) { // 留些空间给结尾信息
                        importantLines.push(line);
                        currentLength += line.length + 1;
                    }
                }
                
                // 避免过度截断
                if (importantLines.length > 100 || currentLength > maxLength - 200) {
                    break;
                }
            }
            
            details = importantLines.join('\n') + 
                     `\n\n... (已截断，原始长度: ${diffContent.length}字符, 显示: ${importantLines.length}行)`;
        }

        return { summary, details };
    }

    /**
     * 根据文件数量构建动态提示词
     */
    private buildDynamicPrompt(fileCount: number): string {
        const isReasoningModel = this.isReasoningModelByName();
        
        const basePrompt = `你是一个专业的Git提交信息生成助手。请根据提供的git diff内容，生成符合Conventional Commits规范的详细提交信息。

## 输出格式要求：
必须使用以下格式输出：

\`\`\`
<type>: <简短描述>

<详细内容>
\`\`\`

## 提交类型规范：
- feat: 新增功能或特性
- fix: 修复问题或错误  
- docs: 文档相关变更
- style: 格式调整（不影响代码逻辑）
- refactor: 重构代码
- chore: 构建过程或辅助工具的变动
- test: 测试相关
- perf: 性能优化`;

        // 为推理模型添加特殊说明
        const reasoningInstructions = isReasoningModel ? `

## 特别说明（推理模型）：
🔍 请在分析过程结束后，在回答的最后部分明确给出最终的提交信息。
📝 最终答案必须放在代码块中，格式如下：

最终答案：
\`\`\`
<type>: <简短描述>

<详细内容>
\`\`\`

⚠️ 重要：确保最终答案完整，包含类型前缀和详细描述。` : '';

        if (fileCount <= 5) {
            return basePrompt + reasoningInstructions + `

## 详细描述要求（少量文件）：
- 为每个重要文件生成一行详细描述
- 说明文件的具体改动内容和目的
- 突出变更的业务价值或技术意义

## 示例输出：
\`\`\`
feat: 添加用户认证和权限管理功能

新增了完整的用户认证系统：
- UserService.js: 实现用户登录、注册和密码重置功能
- AuthMiddleware.js: 添加JWT令牌验证中间件
- PermissionManager.js: 实现基于角色的权限控制

更新了相关配置文件：
- config/auth.json: 配置认证服务的参数和安全策略
- README.md: 添加认证功能的使用说明和API文档
\`\`\``;
        } else {
            return basePrompt + reasoningInstructions + `

## 详细描述要求（大量文件）：
- 按功能模块或文件类型分组描述
- 每个分组说明整体的变更目的
- 适当提及重要文件数量和主要改动

## 示例输出：
\`\`\`
feat: 重构项目架构并添加多个核心模块

新增核心业务模块（共8个文件）：
- 用户管理模块: 完整的用户CRUD操作和权限控制
- 数据处理模块: 实现数据验证、转换和存储逻辑
- API网关模块: 统一的请求路由和响应处理

更新项目配置和文档（共5个文件）：
- 重构了项目目录结构和依赖管理
- 更新了部署脚本和环境配置
- 完善了API文档和开发指南

优化现有功能模块（共12个文件）：
- 重构了数据库访问层，提高查询性能
- 优化了前端组件结构，增强可维护性
- 统一了代码风格和错误处理机制
\`\`\``;
        }
    }

    /**
     * 格式化提交信息
     */
    private formatCommitMessage(aiMessage: string): string {
        // 清理AI返回的内容
        let cleanMessage = aiMessage
            .replace(/^["']|["']$/g, '')
            .replace(/^提交信息[:：]\s*/, '')
            .trim();

        // 移除多余的代码块标记，但保留换行
        cleanMessage = cleanMessage
            .replace(/^```[\s\S]*?\n/, '')  // 移除开头的```和可能的语言标识
            .replace(/\n```$/, '')          // 移除结尾的```
            .replace(/^```/g, '')           // 移除行首的```
            .replace(/```$/g, '')           // 移除行尾的```
            .trim();

        if (!cleanMessage) {
            return '更新笔记内容';
        }

        // 保持多行格式，只做基本的清理
        const lines = cleanMessage.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
        
        if (lines.length === 0) {
            return '更新笔记内容';
        }

        // 如果只有一行且很短，可能需要补充时间戳
        if (lines.length === 1 && lines[0].length < 20) {
            return `${lines[0]} - ${new Date().toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
        }

        // 保持多行格式
        return lines.join('\n');
    }

    /**
     * 转义提交信息中的特殊字符，支持多行提交信息
     */
    private escapeCommitMessage(message: string): string {
        // 对于多行消息，使用不同的处理方式
        if (message.includes('\n')) {
            // 保持多行格式，但处理每行的特殊字符
            return message
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0)
                .map(line => {
                    // 转义每行中的特殊字符
                    return line
                        .replace(/"/g, '\\"')         // 转义双引号
                        .replace(/\\/g, '\\\\')       // 转义反斜杠  
                        .replace(/[\x00-\x1F\x7F]/g, '') // 移除控制字符
                })
                .join('\n');
        } else {
            // 单行消息的处理方式
            let escaped = message
                .replace(/\s+/g, ' ')            // 合并多余空格
                .replace(/"/g, '\\"')            // 转义双引号
                .replace(/\\/g, '\\\\')          // 转义反斜杠
                .replace(/[\x00-\x1F\x7F]/g, '') // 移除控制字符
                .trim();

            // 如果消息太长，截断并添加省略号
            if (escaped.length > 500) {
                escaped = escaped.substring(0, 497) + '...';
            }

            // 确保消息不为空
            if (!escaped) {
                escaped = '更新文件内容';
            }

            return escaped;
        }
    }

    /**
     * 调用AI提供商API
     */
    private async callAIProvider(systemPrompt: string, contextInfo: {summary: string, details: string}, fileCount: number): Promise<Response> {
        const defaultModel = this.modelManager.getDefaultModel();
        console.log('Git Auto Commit - callAIProvider 获取到的默认模型:', defaultModel);
        
        if (!defaultModel) {
            throw new Error('未配置默认AI模型');
        }

        // 从模型配置中获取最大输出令牌数
        const maxTokens = defaultModel.maxOutputTokens;
        
        console.log('Git Auto Commit - 使用模型配置的max_tokens:', maxTokens);
        console.log('Git Auto Commit - 文件数量:', fileCount);
        
        // 可以根据文件数量给出建议，但不强制限制用户配置
        if (fileCount > 50) {
            console.log('Git Auto Commit - 文件较多，建议使用较大的token限制以获得详细描述');
        } else if (fileCount > 20) {
            console.log('Git Auto Commit - 文件数量中等，当前token配置应该足够');
        } else {
            console.log('Git Auto Commit - 文件较少，当前token配置充足');
        }

        const userContent = `请为以下Git变更生成提交信息：

文件变更统计：
${contextInfo.summary}

详细变更内容：
${contextInfo.details}`;

        const requestBody = this.buildAPIRequestBody(systemPrompt, userContent, maxTokens, defaultModel);
        const headers = this.buildAPIHeaders(defaultModel);
        
        console.log('Git Auto Commit - API请求URL:', `${defaultModel.baseURL}/chat/completions`);
        console.log('Git Auto Commit - API请求头:', headers);
        console.log('Git Auto Commit - API请求体:', JSON.stringify(requestBody, null, 2));

        return fetch(`${defaultModel.baseURL}/chat/completions`, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody)
        });
    }

    /**
     * 构建API请求体
     */
    private buildAPIRequestBody(systemPrompt: string, userContent: string, maxTokens: number, model: ModelConfig): any {
        const baseBody = {
            model: model.modelName,
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user', 
                    content: userContent
                }
            ],
            max_tokens: maxTokens,
            temperature: 0.7
        };

        // 针对不同提供商的特殊处理
        switch (model.provider) {
            case 'zhipu':
                // 智谱AI的特殊参数
                return {
                    ...baseBody,
                    top_p: 0.7,
                    stream: false
                };
            case 'qwen':
                // 通义千问的特殊参数
                return {
                    ...baseBody,
                    top_p: 0.8,
                    enable_search: false
                };
            case 'openrouter':
                // OpenRouter的特殊参数
                return {
                    ...baseBody,
                    top_p: 0.9
                };
            default:
                return baseBody;
        }
    }

    /**
     * 构建API请求头
     */
    private buildAPIHeaders(model: ModelConfig): Record<string, string> {
        const baseHeaders = {
            'Content-Type': 'application/json'
        };

        switch (model.provider) {
            case 'deepseek':
                return {
                    ...baseHeaders,
                    'Authorization': `Bearer ${model.apiKey}`
                };
            case 'zhipu':
                return {
                    ...baseHeaders,
                    'Authorization': `Bearer ${model.apiKey}`
                };
            case 'qwen':
                return {
                    ...baseHeaders,
                    'Authorization': `Bearer ${model.apiKey}`,
                    'X-DashScope-SSE': 'disable'
                };
            case 'openrouter':
                return {
                    ...baseHeaders,
                    'Authorization': `Bearer ${model.apiKey}`,
                    'HTTP-Referer': 'https://obsidian.md',
                    'X-Title': 'Obsidian Git Auto Commit'
                };
            default:
                return {
                    ...baseHeaders,
                    'Authorization': `Bearer ${model.apiKey}`
                };
        }
    }

    async executeGitOperationsWithBatching(filesToCommit: string[], commitMessage: string) {
        // 检查是否启用分批处理
        if (!this.settings.batchProcessingEnabled) {
            console.log('Git Auto Commit - 分批处理已禁用，执行正常提交');
            await this.executeGitOperations(filesToCommit, commitMessage);
            return;
        }

        const vaultPath = (this.app.vault.adapter as any).basePath || 
                         (this.app.vault.adapter as any).path ||
                         this.app.vault.configDir;

        try {
            // 首先检查整体变更大小
            const overallSize = await this.calculateChangeSize(filesToCommit, vaultPath);
            const sizeLimitMB = this.settings.batchSizeLimitMB;
            const sizeLimit = sizeLimitMB * 1024 * 1024;

            console.log(`Git Auto Commit - 检测到变更总大小: ${(overallSize / 1024 / 1024).toFixed(2)}MB`);

            if (overallSize <= sizeLimit) {
                // 如果总大小在限制内，直接执行正常提交
                console.log('Git Auto Commit - 变更大小在限制内，执行正常提交');
                await this.executeGitOperations(filesToCommit, commitMessage);
                return;
            }

            // 需要分批处理
            console.log(`Git Auto Commit - 变更大小超过${sizeLimitMB}MB限制，开始智能分批处理`);
            new Notice(`📦 检测到大量变更(${(overallSize / 1024 / 1024).toFixed(1)}MB)，正在智能分批提交...`, 4000);

            const batches = await this.createSmartBatches(filesToCommit, vaultPath, sizeLimit);
            console.log(`Git Auto Commit - 分为 ${batches.length} 个批次处理`);

            let batchNumber = 1;
            let totalBatches = batches.length;

            for (const batch of batches) {
                try {
                    console.log(`Git Auto Commit - 处理批次 ${batchNumber}/${totalBatches}，包含 ${batch.files.length} 个文件`);
                    new Notice(`📦 提交批次 ${batchNumber}/${totalBatches} (${batch.files.length}个文件)`, 2000);

                    // 为每个批次生成特定的提交信息
                    const batchCommitMessage = this.generateBatchCommitMessage(commitMessage, batchNumber, totalBatches, batch);
                    
                    // 执行批次提交
                    await this.executeGitOperations(batch.files, batchCommitMessage);
                    
                    console.log(`Git Auto Commit - 批次 ${batchNumber} 提交成功`);
                    batchNumber++;

                    // 在批次之间稍作停顿，避免过于频繁的操作
                    if (batchNumber <= totalBatches) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }

                } catch (error) {
                    console.error(`Git Auto Commit - 批次 ${batchNumber} 提交失败:`, error);
                    throw new Error(`批次 ${batchNumber} 提交失败: ${error.message}`);
                }
            }

            new Notice(`✅ 分批提交完成！共处理 ${totalBatches} 个批次`, 3000);
            console.log(`Git Auto Commit - 所有批次提交完成，共 ${totalBatches} 个批次`);

        } catch (error) {
            console.error('Git Auto Commit - 分批提交失败:', error);
            throw error;
        }
    }

    async calculateChangeSize(filesToCommit: string[], vaultPath: string): Promise<number> {
        try {
            // 暂时添加所有文件到暂存区
            if (filesToCommit.length > 0) {
                for (const file of filesToCommit) {
                    await execAsync(`git add "${file}"`, { 
                        cwd: vaultPath,
                        maxBuffer: 5 * 1024 * 1024
                    });
                }
            } else {
                await execAsync('git add .', { 
                    cwd: vaultPath,
                    maxBuffer: 10 * 1024 * 1024
                });
            }

            // 获取 diff 统计信息
            const { stdout: diffStat } = await execAsync('git diff --cached --numstat', { 
                cwd: vaultPath,
                maxBuffer: 10 * 1024 * 1024
            });

            // 计算总的变更行数作为大小估算
            let totalChanges = 0;
            const lines = diffStat.trim().split('\n').filter(line => line.trim());
            
            for (const line of lines) {
                const [added, deleted] = line.split('\t');
                if (added !== '-' && deleted !== '-') {
                    totalChanges += parseInt(added || '0') + parseInt(deleted || '0');
                }
            }

            // 估算每行平均 50 字节
            const estimatedSize = totalChanges * 50;
            
            // 重置暂存区（撤销刚才的add操作）
            await execAsync('git reset', { 
                cwd: vaultPath,
                maxBuffer: 5 * 1024 * 1024
            });

            return estimatedSize;

        } catch (error) {
            console.error('Git Auto Commit - 计算变更大小失败:', error);
            // 如果计算失败，返回一个较大的值以触发分批处理
            return 20 * 1024 * 1024; // 20MB
        }
    }

    async createSmartBatches(filesToCommit: string[], vaultPath: string, sizeLimit: number): Promise<Array<{files: string[], estimatedSize: number}>> {
        const batches: Array<{files: string[], estimatedSize: number}> = [];
        const filesWithSizes: Array<{file: string, size: number}> = [];

        // 获取每个文件的大小信息
        const filesToProcess = filesToCommit.length > 0 ? filesToCommit : await this.getAllModifiedFiles(vaultPath);

        for (const file of filesToProcess) {
            try {
                const size = await this.estimateFileChangeSize(file, vaultPath);
                filesWithSizes.push({ file, size });
            } catch (error) {
                console.warn(`Git Auto Commit - 无法估算文件 ${file} 的大小，使用默认值`);
                filesWithSizes.push({ file, size: 100 * 1024 }); // 默认 100KB
            }
        }

        // 按文件大小排序，大文件优先
        filesWithSizes.sort((a, b) => b.size - a.size);

        let currentBatch: string[] = [];
        let currentSize = 0;
        const targetSize = sizeLimit * 0.8; // 使用80%的限制作为目标

        for (const { file, size } of filesWithSizes) {
            // 如果单个文件就超过限制，单独成为一个批次
            if (size > targetSize) {
                if (currentBatch.length > 0) {
                    batches.push({ files: [...currentBatch], estimatedSize: currentSize });
                    currentBatch = [];
                    currentSize = 0;
                }
                batches.push({ files: [file], estimatedSize: size });
                continue;
            }

            // 如果添加这个文件会超过限制，先完成当前批次
            if (currentSize + size > targetSize && currentBatch.length > 0) {
                batches.push({ files: [...currentBatch], estimatedSize: currentSize });
                currentBatch = [file];
                currentSize = size;
            } else {
                currentBatch.push(file);
                currentSize += size;
            }
        }

        // 添加最后一个批次
        if (currentBatch.length > 0) {
            batches.push({ files: [...currentBatch], estimatedSize: currentSize });
        }

        return batches;
    }

    async getAllModifiedFiles(vaultPath: string): Promise<string[]> {
        const { stdout } = await execAsync('git status --porcelain', { 
            cwd: vaultPath,
            maxBuffer: 10 * 1024 * 1024
        });
        
        return stdout
            .split('\n')
            .filter(line => line.trim())
            .map(line => line.substring(3))
            .filter(file => {
                const hasValidExtension = this.settings.includeFileTypes.some(ext => 
                    file.endsWith(ext)
                );
                if (!hasValidExtension) return false;

                const isExcluded = this.settings.excludePatterns.some(pattern => 
                    file.includes(pattern)
                );
                return !isExcluded;
            });
    }

    async estimateFileChangeSize(file: string, vaultPath: string): Promise<number> {
        try {
            // 暂时添加单个文件
            await execAsync(`git add "${file}"`, { 
                cwd: vaultPath,
                maxBuffer: 5 * 1024 * 1024
            });

            // 获取该文件的 diff 统计
            const { stdout: diffStat } = await execAsync(`git diff --cached --numstat -- "${file}"`, { 
                cwd: vaultPath,
                maxBuffer: 5 * 1024 * 1024
            });

            // 重置该文件
            await execAsync(`git reset -- "${file}"`, { 
                cwd: vaultPath,
                maxBuffer: 1024 * 1024
            });

            if (diffStat.trim()) {
                const [added, deleted] = diffStat.trim().split('\t');
                if (added !== '-' && deleted !== '-') {
                    const changes = parseInt(added || '0') + parseInt(deleted || '0');
                    return changes * 50; // 估算每行50字节
                }
            }

            return 1024; // 默认1KB

        } catch (error) {
            console.warn(`Git Auto Commit - 估算文件 ${file} 大小失败:`, error);
            return 10 * 1024; // 默认10KB
        }
    }

    generateBatchCommitMessage(originalMessage: string, batchNumber: number, totalBatches: number, batch: {files: string[], estimatedSize: number}): string {
        const sizeInMB = (batch.estimatedSize / 1024 / 1024).toFixed(1);
        const fileCount = batch.files.length;
        
        // 从原始消息中提取主要内容（去掉可能的详细信息）
        const mainMessage = originalMessage.split('\n')[0] || originalMessage;
        
        const batchInfo = totalBatches > 1 ? ` [批次 ${batchNumber}/${totalBatches}]` : '';
        const batchMessage = `${mainMessage}${batchInfo}

批次信息:
- 文件数量: ${fileCount}
- 预估大小: ${sizeInMB}MB
- 批次号: ${batchNumber}/${totalBatches}

包含文件:
${batch.files.slice(0, 10).map(f => `- ${f}`).join('\n')}${batch.files.length > 10 ? `\n... 还有 ${batch.files.length - 10} 个文件` : ''}`;

        return batchMessage;
    }

    // 用于测试分批处理逻辑的方法
    async testBatchProcessing() {
        try {
            const vaultPath = (this.app.vault.adapter as any).basePath || 
                             (this.app.vault.adapter as any).path ||
                             this.app.vault.configDir;
            
            // 获取当前所有修改的文件
            const modifiedFiles = await this.getModifiedFiles();
            console.log('Git Auto Commit - 当前修改的文件:', modifiedFiles);
            
            if (modifiedFiles.length === 0) {
                new Notice('📦 没有检测到修改的文件');
                return;
            }

            // 计算变更大小
            const changeSize = await this.calculateChangeSize(modifiedFiles, vaultPath);
            console.log(`Git Auto Commit - 预估变更大小: ${(changeSize / 1024 / 1024).toFixed(2)}MB`);
            
            // 测试分批逻辑
            const sizeLimit = this.settings.batchSizeLimitMB * 1024 * 1024;
            console.log(`Git Auto Commit - 配置的大小限制: ${this.settings.batchSizeLimitMB}MB`);
            
            if (changeSize > sizeLimit) {
                const batches = await this.createSmartBatches(modifiedFiles, vaultPath, sizeLimit);
                console.log(`Git Auto Commit - 将分为 ${batches.length} 个批次:`);
                
                let totalFiles = 0;
                let totalSize = 0;
                
                batches.forEach((batch, index) => {
                    console.log(`  批次 ${index + 1}: ${batch.files.length} 个文件, ${(batch.estimatedSize / 1024 / 1024).toFixed(2)}MB`);
                    totalFiles += batch.files.length;
                    totalSize += batch.estimatedSize;
                });
                
                console.log(`Git Auto Commit - 总计: ${totalFiles} 个文件, ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
                
                new Notice(
                    `📦 分批处理测试结果:\n` +
                    `变更大小: ${(changeSize / 1024 / 1024).toFixed(2)}MB\n` +
                    `将分为: ${batches.length} 个批次\n` +
                    `总文件数: ${totalFiles}`,
                    5000
                );
            } else {
                new Notice(
                    `📦 分批处理测试结果:\n` +
                    `变更大小: ${(changeSize / 1024 / 1024).toFixed(2)}MB\n` +
                    `无需分批，可直接提交`,
                    3000
                );
            }

        } catch (error) {
            console.error('Git Auto Commit - 分批处理测试失败:', error);
            new Notice(`❌ 分批处理测试失败: ${error.message}`);
        }
    }

    async executeGitOperations(filesToCommit: string[], commitMessage: string) {
        const vaultPath = (this.app.vault.adapter as any).basePath || 
                         (this.app.vault.adapter as any).path ||
                         this.app.vault.configDir;

        try {
            // 添加文件到暂存区
            if (filesToCommit.length > 0) {
                for (const file of filesToCommit) {
                    await execAsync(`git add "${file}"`, { 
                        cwd: vaultPath,
                        maxBuffer: 5 * 1024 * 1024 // 5MB 缓冲区
                    });
                }
            } else {
                await execAsync('git add .', { 
                    cwd: vaultPath,
                    maxBuffer: 10 * 1024 * 1024 // 10MB 缓冲区
                });
            }

            // 检查是否有文件需要提交
            const { stdout: stagedFiles } = await execAsync('git diff --cached --name-only', { 
                cwd: vaultPath,
                maxBuffer: 10 * 1024 * 1024 // 10MB 缓冲区
            });
            if (!stagedFiles.trim()) {
                throw new Error('没有文件需要提交');
            }

            // 提交 - 处理多行提交信息
            const escapedMessage = this.escapeCommitMessage(commitMessage);
            
            // 对于多行提交信息，使用-F参数从临时文件读取
            if (escapedMessage.includes('\n')) {
                // 创建临时文件来存储提交信息
                const { writeFile, unlink } = require('fs').promises;
                const path = require('path');
                const tmpFile = path.join(vaultPath, '.git_commit_msg_tmp');
                
                try {
                    await writeFile(tmpFile, escapedMessage, 'utf8');
                    await execAsync(`git commit -F "${tmpFile}"`, { 
                        cwd: vaultPath,
                        maxBuffer: 5 * 1024 * 1024 // 5MB 缓冲区
                    });
                    await unlink(tmpFile); // 清理临时文件
                } catch (error) {
                    // 清理临时文件
                    try {
                        await unlink(tmpFile);
                    } catch (unlinkError) {
                        // 忽略删除文件的错误
                    }
                    throw error;
                }
            } else {
                // 单行提交信息使用-m参数
                await execAsync(`git commit -m "${escapedMessage}"`, { 
                    cwd: vaultPath,
                    maxBuffer: 5 * 1024 * 1024 // 5MB 缓冲区
                });
            }

            // 推送
            if (this.settings.pushToRemote) {
                await execAsync(`git push origin ${this.settings.remoteBranch}`, { 
                    cwd: vaultPath,
                    maxBuffer: 10 * 1024 * 1024 // 10MB 缓冲区
                });
            }

        } catch (error) {
            throw new Error(`Git操作失败: ${error.message}`);
        }
    }

    async showFileSelectionModal(files: string[]): Promise<string | null> {
        return new Promise((resolve) => {
            const modal = new FileSelectionModal(this.app, files, resolve);
            modal.open();
        });
    }

    async showCommitMessageModal(defaultMessage?: string): Promise<string | null> {
        return new Promise((resolve) => {
            const modal = new CommitMessageModal(this.app, defaultMessage, resolve);
            modal.open();
        });
    }

    debugAIConfig() {
        console.log('=== Git Auto Commit 调试信息 ===');
        
        // 检查插件设置
        console.log('插件设置:', this.settings);
        
        // 检查模型管理器
        console.log('模型管理器:', this.modelManager);
        
        // 检查所有模型
        const allModels = this.modelManager.getAllModels();
        console.log('所有模型数量:', allModels.length);
        console.log('所有模型:', allModels);
        
        // 检查已验证的模型
        const verifiedModels = this.modelManager.getVerifiedModels();
        console.log('已验证的模型数量:', verifiedModels.length);
        console.log('已验证的模型:', verifiedModels);
        
        // 检查默认模型
        const defaultModel = this.modelManager.getDefaultModel();
        console.log('默认模型:', defaultModel);
        console.log('默认模型ID:', this.modelManager.getDefaultModelId());
        
        new Notice('调试信息已输出到控制台，请按F12查看');
    }

    async debugDataStatus() {
        console.log('=== Git Auto Commit 数据状态调试 ===');
        
        // 检查数据管理器状态
        console.log('数据管理器:', this.dataManager);
        console.log('数据文件路径:', this.dataManager.getDataFilePath());
        console.log('数据文件是否存在:', await this.dataManager.dataFileExists());
        
        // 检查当前存储的所有数据
        console.log('当前插件设置:', this.dataManager.getSettings());
        console.log('当前模型配置:', this.dataManager.getAllModels());
        console.log('默认模型ID:', this.dataManager.getDefaultModelId());
        
        // 导出完整配置
        const exportedConfig = this.dataManager.exportConfig();
        console.log('完整配置导出:', exportedConfig);
        
        new Notice('数据状态调试信息已输出到控制台，请按F12查看');
    }

    async resetPluginData() {
        try {
            await this.dataManager.resetToDefaults();
            await this.loadSettings();
            new Notice('✅ 插件数据已重置为初始状态');
            console.log('Git Auto Commit - 插件数据已重置');
        } catch (error) {
            console.error('Git Auto Commit - 重置插件数据失败:', error);
            new Notice(`❌ 重置失败: ${error.message}`);
        }
    }


}

// 文件选择模态框
class FileSelectionModal extends Modal {
    files: string[];
    onSelect: (file: string | null) => void;

    constructor(app: App, files: string[], onSelect: (file: string | null) => void) {
        super(app);
        this.files = files;
        this.onSelect = onSelect;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass('git-auto-commit'); // 添加这行

        contentEl.createEl('h2', { text: '选择要提交的文件', cls: 'modal-title' });

        const fileList = contentEl.createEl('div', { cls: 'file-list' });

        this.files.forEach(file => {
            const fileItem = fileList.createEl('div', { 
                cls: 'file-item',
                text: `📄 ${file}`
            });
            
            fileItem.style.padding = '10px';
            fileItem.style.cursor = 'pointer';
            fileItem.style.borderRadius = '5px';
            fileItem.style.margin = '5px 0';
            
            fileItem.addEventListener('mouseenter', () => {
                fileItem.style.backgroundColor = 'var(--background-modifier-hover)';
            });
            
            fileItem.addEventListener('mouseleave', () => {
                fileItem.style.backgroundColor = '';
            });
            
            fileItem.addEventListener('click', () => {
                this.onSelect(file);
                this.close();
            });
        });

        const buttonContainer = contentEl.createEl('div', { cls: 'button-container' });
        buttonContainer.style.marginTop = '20px';
        buttonContainer.style.textAlign = 'right';

        const cancelButton = buttonContainer.createEl('button', { text: '取消' });
        cancelButton.addEventListener('click', () => {
            this.onSelect(null);
            this.close();
        });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}

// 提交信息模态框
class CommitMessageModal extends Modal {
    defaultMessage?: string;
    onSubmit: (message: string | null) => void;

    constructor(app: App, defaultMessage: string | undefined, onSubmit: (message: string | null) => void) {
        super(app);
        this.defaultMessage = defaultMessage;
        this.onSubmit = onSubmit;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass('git-auto-commit'); // 添加这行

        contentEl.createEl('h2', { text: '输入提交信息', cls: 'modal-title' });

        const inputEl = contentEl.createEl('textarea', { 
            cls: 'commit-message-input',
            placeholder: '请输入提交信息...',
            value: this.defaultMessage || `更新笔记 - ${new Date().toLocaleString('zh-CN')}`
        });
        
        inputEl.style.width = '100%';
        inputEl.style.height = '100px';
        inputEl.style.marginBottom = '20px';
        inputEl.style.padding = '10px';
        inputEl.style.borderRadius = '5px';
        inputEl.style.border = '1px solid var(--background-modifier-border)';
        inputEl.style.backgroundColor = 'var(--background-primary)';
        inputEl.style.color = 'var(--text-normal)';
        inputEl.style.resize = 'vertical';

        const buttonContainer = contentEl.createEl('div', { cls: 'button-container' });
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'space-between';

        const submitButton = buttonContainer.createEl('button', { text: '提交' });
        submitButton.style.backgroundColor = 'var(--interactive-accent)';
        submitButton.style.color = 'var(--text-on-accent)';

        const cancelButton = buttonContainer.createEl('button', { text: '取消' });

        submitButton.addEventListener('click', () => {
            const message = inputEl.value.trim();
            if (message) {
                this.onSubmit(message);
                this.close();
            } else {
                new Notice('请输入提交信息');
            }
        });

        cancelButton.addEventListener('click', () => {
            this.onSubmit(null);
            this.close();
        });

        // 自动聚焦到输入框
        inputEl.focus();
        inputEl.select();
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}

// 设置选项卡
class GitAutoCommitSettingTab extends PluginSettingTab {
    plugin: GitAutoCommitPlugin;
    private defaultModelSelector: DefaultModelSelector | null = null;

    constructor(app: App, plugin: GitAutoCommitPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.addClass('git-auto-commit-settings');

        containerEl.createEl('h2', { text: 'Git自动提交设置' });

        // AI设置标题行
        const aiSettingsHeader = containerEl.createEl('div', { cls: 'ai-settings-header' });
        aiSettingsHeader.style.display = 'flex';
        aiSettingsHeader.style.justifyContent = 'space-between';
        aiSettingsHeader.style.alignItems = 'center';
        aiSettingsHeader.style.marginBottom = '16px';

        const aiTitle = aiSettingsHeader.createEl('h3', { text: '🤖 AI设置' });
        aiTitle.style.margin = '0';

        const addModelButton = aiSettingsHeader.createEl('button', { text: '添加AI模型', cls: 'mod-cta' });
        addModelButton.addEventListener('click', () => {
            const modal = new ModelManagementModal(this.app, this.plugin.modelManager, () => {
                this.refreshDefaultModelSelector();
            });
            modal.open();
        });

        // 默认模型选择
        const defaultModelSetting = new Setting(containerEl)
            .setName('默认模型')
            .setDesc('选择用于生成提交信息的默认AI模型');

        const selectorContainer = defaultModelSetting.controlEl.createEl('div');
        this.defaultModelSelector = new DefaultModelSelector(
            selectorContainer, 
            this.plugin.modelManager, 
            (modelId) => {
                // 这里可以添加模型切换的回调逻辑
                console.log('默认模型已切换:', modelId);
            }
        );

        // 默认行为设置
        containerEl.createEl('h3', { text: '⚙️ 默认行为' });

        new Setting(containerEl)
            .setName('默认提交范围')
            .setDesc('设置默认的提交范围')
            .addDropdown(dropdown => dropdown
                .addOption('all', '提交所有文件')
                .addOption('single', '提交单个文件')
                .setValue(this.plugin.settings.defaultCommitScope)
                .onChange(async (value) => {
                    this.plugin.settings.defaultCommitScope = value as 'all' | 'single';
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('默认提交信息类型')
            .setDesc('设置默认的提交信息生成方式')
            .addDropdown(dropdown => dropdown
                .addOption('ai', 'AI自动生成')
                .addOption('manual', '手动输入')
                .setValue(this.plugin.settings.defaultMessageType)
                .onChange(async (value) => {
                    this.plugin.settings.defaultMessageType = value as 'ai' | 'manual';
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('自动提交模式')
            .setDesc('开启后将使用默认设置直接提交，不显示选择界面')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.autoCommit)
                .onChange(async (value) => {
                    this.plugin.settings.autoCommit = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('显示通知')
            .setDesc('是否显示操作通知')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showNotifications)
                .onChange(async (value) => {
                    this.plugin.settings.showNotifications = value;
                    await this.plugin.saveSettings();
                }));

        // Git设置
        containerEl.createEl('h3', { text: '📤 Git设置' });

        new Setting(containerEl)
            .setName('推送到远程仓库')
            .setDesc('提交后是否自动推送到远程仓库')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.pushToRemote)
                .onChange(async (value) => {
                    this.plugin.settings.pushToRemote = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('远程分支名称')
            .setDesc('推送到的远程分支名称')
            .addText(text => text
                .setPlaceholder('main')
                .setValue(this.plugin.settings.remoteBranch)
                .onChange(async (value) => {
                    this.plugin.settings.remoteBranch = value;
                    await this.plugin.saveSettings();
                }));

        // 文件过滤设置
        containerEl.createEl('h3', { text: '📁 文件过滤' });

        new Setting(containerEl)
            .setName('包含的文件类型')
            .setDesc('要包含在提交中的文件扩展名（用逗号分隔）')
            .addText(text => text
                .setPlaceholder('.md,.txt,.canvas,.json')
                .setValue(this.plugin.settings.includeFileTypes.join(','))
                .onChange(async (value) => {
                    this.plugin.settings.includeFileTypes = value.split(',').map(s => s.trim()).filter(s => s);
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('排除的路径模式')
            .setDesc('要排除的路径模式（用逗号分隔）')
            .addText(text => text
                .setPlaceholder('.obsidian/,node_modules/,.git/')
                .setValue(this.plugin.settings.excludePatterns.join(','))
                .onChange(async (value) => {
                    this.plugin.settings.excludePatterns = value.split(',').map(s => s.trim()).filter(s => s);
                    await this.plugin.saveSettings();
                }));

        // 分批处理设置
        containerEl.createEl('h3', { text: '📦 分批处理' });

        new Setting(containerEl)
            .setName('启用智能分批处理')
            .setDesc('当变更量超过限制时，自动分批提交以避免缓冲区溢出错误')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.batchProcessingEnabled)
                .onChange(async (value) => {
                    this.plugin.settings.batchProcessingEnabled = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('分批大小限制 (MB)')
            .setDesc('单次提交的最大数据量。超过此限制时将自动分批处理 (建议范围: 5-50MB)')
            .addSlider(slider => slider
                .setLimits(1, 50, 1)
                .setValue(this.plugin.settings.batchSizeLimitMB)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.batchSizeLimitMB = value;
                    await this.plugin.saveSettings();
                }))
            .addExtraButton(button => button
                .setIcon('info')
                .setTooltip('分批处理说明')
                .onClick(() => {
                    new Notice(
                        '📦 分批处理功能:\n' +
                        '• 当检测到大量文件变更时自动分批提交\n' +
                        '• 避免 "maxBuffer exceeded" 错误\n' +
                        '• 每个批次都有独立的提交信息\n' +
                        '• 较小的值会产生更多批次，但更稳定\n' +
                        '• 建议根据仓库大小调整 (小仓库5-10MB，大仓库20-50MB)', 
                        8000
                    );
                }));

        // 重置按钮
        new Setting(containerEl)
            .setName('重置设置')
            .setDesc('将所有设置重置为默认值')
            .addButton(button => button
                .setButtonText('重置')
                .setWarning()
                .onClick(async () => {
                    await this.plugin.dataManager.resetToDefaults();
                    await this.plugin.loadSettings();
                    this.display();
                    new Notice('✅ 设置已重置为默认值');
                }));
    }

    /**
     * 刷新默认模型选择器
     */
    private refreshDefaultModelSelector() {
        if (this.defaultModelSelector) {
            this.defaultModelSelector.refresh();
        }
    }
}
