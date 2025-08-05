import { TextAreaComponent, Notice } from 'obsidian';
import { setIcon } from 'obsidian';
import { t } from '../i18n';

export class PromptSettingsTab {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private plugin: any;
    private containerEl: HTMLElement;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(plugin: any, containerEl: HTMLElement) {
        this.plugin = plugin;
        this.containerEl = containerEl;
    }

    display(): void {
        const container = this.containerEl.createEl('div', {
            cls: 'prompt-settings-container'
        });

        // 标题和添加按钮容器
        const headerContainer = container.createEl('div', {
            cls: 'prompt-settings-header setting-item-heading'
        });

        // 使用直接创建标题元素，而不是使用Setting组件
        headerContainer.createEl('h4', { 
            text: t('Prompt settings'),
            cls: 'prompt-settings-title'
        });

        // 添加按钮
        const addButton = headerContainer.createEl('button', {
            cls: 'prompt-add-btn',
            attr: {
                'aria-label': t('Add prompt')
            }
        });
        setIcon(addButton, 'plus');
        
        addButton.onclick = () => {
            // 如果已经存在新建表单，就不要重复创建
            if (container.querySelector('.new-prompt-section')) return;
            
            // 创建新的表单并插入到 promptList 之前
            const promptList = container.querySelector('.prompt-list') as HTMLElement;
            if (promptList) {
                this.createNewPromptForm(container, promptList);
            }
        };

        // Existing prompts list
        this.displayPromptList(container);
    }

    private createNewPromptForm(container: HTMLElement, beforeElement: HTMLElement) {
        const newPromptSection = container.createEl('div', { cls: 'new-prompt-section' });
        beforeElement.parentElement?.insertBefore(newPromptSection, beforeElement);
        
        const nameInput = newPromptSection.createEl('input', {
            cls: 'prompt-name-input',
            attr: { 
                placeholder: t('Input Prompt Name'),
                type: 'text'
            }
        });

        const contentArea = new TextAreaComponent(newPromptSection);
        contentArea
            .setPlaceholder(t('Input Prompt Content\nAvailable parameters:\n{{highlight}} - Current highlighted text\n{{comment}} - Existing comment'))
            .setValue('');
        contentArea.inputEl.addClass('prompt-textarea');

        // Buttons container
        const buttonsContainer = newPromptSection.createEl('div', { cls: 'prompt-buttons' });

        // Save button
        const saveBtn = buttonsContainer.createEl('button', {
            cls: 'prompt-save-btn',
            text: t('Save')
        });
        saveBtn.onclick = async () => {
            const name = nameInput.value;
            const content = contentArea.getValue();
            
            if (name && content) {
                if (!this.plugin.settings.ai.prompts) {
                    this.plugin.settings.ai.prompts = {};
                }
                this.plugin.settings.ai.prompts[name] = content;
                await this.plugin.saveSettings();
                
                newPromptSection.remove();
                this.displayPromptList(container);
                new Notice(t('Prompt added'));

                // CommentView no longer exists - removed update call
            }
        };

        // Cancel button
        const cancelBtn = buttonsContainer.createEl('button', {
            cls: 'prompt-cancel-btn',
            text: t('Cancel')
        });
        cancelBtn.onclick = () => {
            newPromptSection.remove();
        };
    }

    private displayPromptList(container: HTMLElement) {
        // Remove existing list if any
        const existingList = container.querySelector('.prompt-list');
        if (existingList) {
            existingList.remove();
        }

        const promptList = container.createEl('div', { cls: 'prompt-list' });

        const prompts = this.plugin.settings.ai.prompts || {};
        
        for (const [name, content] of Object.entries(prompts)) {
            const promptItem = promptList.createEl('div', { cls: 'prompt-item' });
            
            // Display mode elements
            const displayContainer = promptItem.createEl('div', { cls: 'prompt-display-mode' });
            
            const infoContainer = displayContainer.createEl('div', { cls: 'prompt-info' });
            infoContainer.createEl('div', { cls: 'prompt-name', text: name });
            
            // 创建内容预览，移除换行符并限制显示
            const contentPreview = (content as string).replace(/\n/g, ' ');
            infoContainer.createEl('div', { 
                cls: 'prompt-content-preview', 
                text: contentPreview
            });
            
            const buttonContainer = displayContainer.createEl('div', { cls: 'prompt-buttons' });
            
            // Edit button
            const editBtn = buttonContainer.createEl('button', {
                cls: 'prompt-edit-btn',
                attr: {
                    'aria-label': t('Edit')
                }
            });
            setIcon(editBtn, 'square-pen');

            // Edit mode elements (hidden by default)
            const editContainer = promptItem.createEl('div', { 
                cls: 'prompt-edit-mode hi-note-hidden'
            });

            const nameInput = editContainer.createEl('input', {
                cls: 'prompt-name-input',
                attr: { value: name, type: 'text' }
            });

            const contentArea = new TextAreaComponent(editContainer);
            contentArea.setValue(content as string);
            contentArea.inputEl.classList.add('prompt-content-input');
            contentArea.inputEl.addClass('prompt-textarea');

            // Edit mode buttons container
            const editButtonsContainer = editContainer.createEl('div', { cls: 'prompt-edit-buttons' });
            
            // Save button
            const saveBtn = editButtonsContainer.createEl('button', {
                cls: 'prompt-save-btn',
                text: t('Save')
            });

            // Cancel button
            const cancelBtn = editButtonsContainer.createEl('button', {
                cls: 'prompt-cancel-btn',
                text: t('Cancel')
            });

            // Delete button (moved to edit mode)
            const deleteBtn = editButtonsContainer.createEl('button', {
                cls: 'prompt-delete-btn',
                attr: {
                    'aria-label': t('Delete')
                }
            });
            setIcon(deleteBtn, 'trash-2');

            // Event handlers
            editBtn.onclick = () => {
                displayContainer.addClass('hi-note-hidden');
                editContainer.removeClass('hi-note-hidden');
            };

            deleteBtn.onclick = async () => {
                delete this.plugin.settings.ai.prompts[name];
                await this.plugin.saveSettings();
                promptItem.remove();

                // CommentView no longer exists - removed update call
            };

            saveBtn.onclick = async () => {
                const newName = nameInput.value;
                const newContent = contentArea.getValue();
                
                if (newName && newContent) {
                    // 如果名称改变了，需要删除旧的
                    if (newName !== name) {
                        delete this.plugin.settings.ai.prompts[name];
                    }
                    this.plugin.settings.ai.prompts[newName] = newContent;
                    await this.plugin.saveSettings();
                    
                    // 重新显示列表
                    this.displayPromptList(container);
                    new Notice(t('Prompt updated'));

                    // CommentView no longer exists - removed update call
                }
            };

            cancelBtn.onclick = () => {
                displayContainer.removeClass('hi-note-hidden');
                editContainer.addClass('hi-note-hidden');
            };
        }
    }
}
