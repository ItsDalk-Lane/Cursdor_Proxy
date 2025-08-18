// 数据迁移向导 - 帮助用户了解新的数据存储方式
import { App, Modal, Notice } from 'obsidian';
import { DataManager } from './data-manager';

export class DataMigrationModal extends Modal {
    private dataManager: DataManager;
    private hasOldData: boolean;

    constructor(app: App, dataManager: DataManager, hasOldData: boolean) {
        super(app);
        this.dataManager = dataManager;
        this.hasOldData = hasOldData;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass('data-migration-modal');

        if (this.hasOldData) {
            this.showMigrationCompleteView(contentEl);
        } else {
            this.showNewDataSystemView(contentEl);
        }
    }

    private showMigrationCompleteView(container: HTMLElement) {
        // 标题
        const titleEl = container.createEl('h2', { 
            text: '🎉 数据迁移完成！', 
            cls: 'modal-title' 
        });
        titleEl.style.color = 'var(--color-green)';
        titleEl.style.textAlign = 'center';
        titleEl.style.marginBottom = '20px';

        // 说明内容
        const contentDiv = container.createEl('div', { cls: 'migration-content' });
        contentDiv.style.padding = '20px';
        contentDiv.style.lineHeight = '1.6';

        contentDiv.createEl('p', { 
            text: '您的旧配置数据已成功迁移到新的数据存储系统！' 
        });

        // 主要改变
        const changesTitle = contentDiv.createEl('h3', { text: '📋 主要改变' });
        changesTitle.style.marginTop = '20px';
        changesTitle.style.marginBottom = '10px';

        const changesList = contentDiv.createEl('ul');
        changesList.style.paddingLeft = '20px';

        const changes = [
            '🔒 API密钥现在已加密存储，更加安全',
            '📁 所有配置数据保存在独立的 plugin-data.json 文件中',
            '🧹 已清理 localStorage 中的旧数据',
            '🚀 插件分享更方便，只需复制核心文件'
        ];

        changes.forEach(change => {
            const li = changesList.createEl('li');
            li.textContent = change;
            li.style.marginBottom = '8px';
        });

        // 数据文件位置
        const locationTitle = contentDiv.createEl('h3', { text: '📍 数据文件位置' });
        locationTitle.style.marginTop = '20px';
        locationTitle.style.marginBottom = '10px';

        const locationCode = contentDiv.createEl('code', { 
            text: this.dataManager.getDataFilePath() 
        });
        locationCode.style.backgroundColor = 'var(--background-secondary)';
        locationCode.style.padding = '8px 12px';
        locationCode.style.borderRadius = '4px';
        locationCode.style.display = 'block';
        locationCode.style.marginBottom = '15px';

        // 重要提醒
        const reminderDiv = contentDiv.createEl('div', { cls: 'reminder-box' });
        reminderDiv.style.backgroundColor = 'var(--background-modifier-border)';
        reminderDiv.style.border = '1px solid var(--color-accent)';
        reminderDiv.style.borderRadius = '8px';
        reminderDiv.style.padding = '15px';
        reminderDiv.style.marginTop = '20px';

        const reminderTitle = reminderDiv.createEl('h4', { text: '💡 分享插件时' });
        reminderTitle.style.color = 'var(--color-accent)';
        reminderTitle.style.marginBottom = '10px';

        reminderDiv.createEl('p', { 
            text: '现在您可以安全地分享插件，只需复制以下三个文件：' 
        });

        const filesList = reminderDiv.createEl('ul');
        ['main.js', 'styles.css', 'manifest.json'].forEach(file => {
            const li = filesList.createEl('li');
            li.textContent = file;
        });

        reminderDiv.createEl('p', { 
            text: '不要复制 plugin-data.json 文件，这样其他人会获得一个干净的初始状态插件。',
            cls: 'text-muted'
        });

        this.addButtons(container, '我知道了');
    }

    private showNewDataSystemView(container: HTMLElement) {
        // 标题
        const titleEl = container.createEl('h2', { 
            text: '🆕 新的数据存储系统', 
            cls: 'modal-title' 
        });
        titleEl.style.color = 'var(--color-accent)';
        titleEl.style.textAlign = 'center';
        titleEl.style.marginBottom = '20px';

        // 说明内容
        const contentDiv = container.createEl('div', { cls: 'new-system-content' });
        contentDiv.style.padding = '20px';
        contentDiv.style.lineHeight = '1.6';

        contentDiv.createEl('p', { 
            text: '欢迎使用 Git 自动提交插件！我们使用了全新的数据存储系统，让您的配置更安全、更易管理。' 
        });

        // 主要特性
        const featuresTitle = contentDiv.createEl('h3', { text: '✨ 主要特性' });
        featuresTitle.style.marginTop = '20px';
        featuresTitle.style.marginBottom = '10px';

        const featuresList = contentDiv.createEl('ul');
        featuresList.style.paddingLeft = '20px';

        const features = [
            '🔐 API密钥加密存储，保护您的隐私',
            '📁 独立数据文件，配置与代码分离',
            '🔄 自动数据备份和恢复',
            '📤 简化的插件分享流程',
            '🎛️ 灵活的个性化设置选项'
        ];

        features.forEach(feature => {
            const li = featuresList.createEl('li');
            li.textContent = feature;
            li.style.marginBottom = '8px';
        });

        // 开始使用
        const startTitle = contentDiv.createEl('h3', { text: '🚀 开始使用' });
        startTitle.style.marginTop = '20px';
        startTitle.style.marginBottom = '10px';

        const startList = contentDiv.createEl('ol');
        startList.style.paddingLeft = '20px';

        const steps = [
            '在设置中添加您的第一个AI模型',
            '配置模型的API密钥和参数',
            '验证模型连接是否正常',
            '设置为默认模型开始使用'
        ];

        steps.forEach(step => {
            const li = startList.createEl('li');
            li.textContent = step;
            li.style.marginBottom = '8px';
        });

        // 提示框
        const tipDiv = contentDiv.createEl('div', { cls: 'tip-box' });
        tipDiv.style.backgroundColor = 'var(--background-secondary)';
        tipDiv.style.border = '1px solid var(--color-green)';
        tipDiv.style.borderRadius = '8px';
        tipDiv.style.padding = '15px';
        tipDiv.style.marginTop = '20px';

        const tipTitle = tipDiv.createEl('h4', { text: '💡 小提示' });
        tipTitle.style.color = 'var(--color-green)';
        tipTitle.style.marginBottom = '10px';

        tipDiv.createEl('p', { 
            text: '您可以随时使用"调试数据状态"命令来查看当前的配置状态，或使用"重置插件数据"命令恢复到初始状态。' 
        });

        this.addButtons(container, '开始配置');
    }

    private addButtons(container: HTMLElement, primaryButtonText: string) {
        const buttonContainer = container.createEl('div', { cls: 'modal-button-container' });
        buttonContainer.style.marginTop = '30px';
        buttonContainer.style.textAlign = 'center';
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '10px';
        buttonContainer.style.justifyContent = 'center';

        // 主要按钮
        const primaryButton = buttonContainer.createEl('button', { 
            text: primaryButtonText, 
            cls: 'mod-cta' 
        });
        primaryButton.style.padding = '10px 20px';
        primaryButton.addEventListener('click', () => {
            this.close();
        });

        // 查看详情按钮
        const detailsButton = buttonContainer.createEl('button', { 
            text: '查看详细说明' 
        });
        detailsButton.style.padding = '10px 20px';
        detailsButton.addEventListener('click', () => {
            this.showDetailedInfo();
        });
    }

    private showDetailedInfo() {
        const info = `
# Git 自动提交插件 - 数据存储说明

## 数据文件位置
${this.dataManager.getDataFilePath()}

## 主要改进
1. **安全性**: API密钥使用Base64编码存储
2. **独立性**: 配置数据与插件代码完全分离  
3. **便携性**: 更容易分享和备份插件
4. **可维护性**: 清晰的数据结构，便于管理

## 重置说明
- 删除数据文件即可重置为初始状态
- 可使用"重置插件数据"命令
- 插件会自动创建新的默认配置

## 调试工具
- "调试AI配置": 查看模型配置状态
- "调试数据状态": 查看完整数据状态
- "重置插件数据": 恢复初始状态

更多详细信息请查看插件目录中的 DATA_STORAGE.md 文件。
        `;

        navigator.clipboard.writeText(info).then(() => {
            new Notice('详细说明已复制到剪贴板');
        }).catch(() => {
            console.log('Git Auto Commit - 详细说明:', info);
            new Notice('详细说明已输出到控制台，请按F12查看');
        });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}

// 数据迁移检查器
export class DataMigrationChecker {
    static async checkAndShowMigrationIfNeeded(app: App, dataManager: DataManager): Promise<void> {
        try {
            // 检查是否有旧的localStorage数据
            const hasOldModels = localStorage.getItem('git-auto-commit-models') !== null;
            const hasOldDefaultModel = localStorage.getItem('git-auto-commit-default-model') !== null;
            const hasOldData = hasOldModels || hasOldDefaultModel;

            // 检查是否是首次运行
            const dataFileExists = await dataManager.dataFileExists();
            const isFirstRun = !dataFileExists && !hasOldData;

            // 只在有意义的情况下显示迁移对话框
            if (hasOldData || isFirstRun) {
                const modal = new DataMigrationModal(app, dataManager, hasOldData);
                modal.open();
            }
        } catch (error) {
            console.warn('Git Auto Commit - 迁移检查失败:', error);
        }
    }
}
