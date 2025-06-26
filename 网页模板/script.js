/**
 * 小红书文案AI助手 - 前端交互脚本
 * 实现文案生成、流式输出、用户交互等功能
 */

class XiaohongshuAIAssistant {
    constructor() {
        this.isGenerating = false;
        this.currentEventSource = null;
        this.init();
    }

    // 初始化应用
    init() {
        this.bindEvents();
        this.updateCharCount();
        this.updateGenerateButtonState();
    }

    // 绑定事件监听器
    bindEvents() {
        // 输入框事件
        const topicInput = document.getElementById('topic-input');
        topicInput.addEventListener('input', () => {
            this.updateCharCount();
            this.updateGenerateButtonState();
        });
        topicInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.handleGenerate();
            }
        });

        // 生成按钮事件
        const generateBtn = document.getElementById('generate-btn');
        generateBtn.addEventListener('click', () => this.handleGenerate());

        // 复制按钮事件
        const copyBtn = document.getElementById('copy-btn');
        copyBtn.addEventListener('click', () => this.handleCopy());

        // 重新生成按钮事件
        const regenerateBtn = document.getElementById('regenerate-btn');
        regenerateBtn.addEventListener('click', () => this.handleRegenerate());

        // 全局键盘快捷键
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter: 生成文案
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                if (!this.isGenerating) {
                    this.handleGenerate();
                }
            }
            // Ctrl/Cmd + C: 复制文案（当输出区域可见时）
            else if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                const outputSection = document.getElementById('output-section');
                if (outputSection && outputSection.style.display !== 'none') {
                    const contentDisplay = document.getElementById('content-display');
                    if (contentDisplay && contentDisplay.textContent.trim()) {
                        e.preventDefault();
                        this.handleCopy();
                    }
                }
            }
            // Escape: 停止生成
            else if (e.key === 'Escape' && this.isGenerating) {
                e.preventDefault();
                this.stopGeneration();
            }
        });
    }

    // 更新字符计数
    updateCharCount() {
        const topicInput = document.getElementById('topic-input');
        const charCount = document.getElementById('char-count');
        const currentLength = topicInput.value.length;
        
        charCount.textContent = currentLength;
        
        // 根据字符数量改变颜色
        if (currentLength > 450) {
            charCount.style.color = '#d63031';
        } else if (currentLength > 400) {
            charCount.style.color = '#fdcb6e';
        } else {
            charCount.style.color = '#8899a6';
        }
    }

    // 更新生成按钮状态
    updateGenerateButtonState() {
        const topicInput = document.getElementById('topic-input');
        const generateBtn = document.getElementById('generate-btn');
        const topic = topicInput.value.trim();
        
        generateBtn.disabled = !topic || this.isGenerating;
    }

    // 处理生成文案
    async handleGenerate() {
        const topicInput = document.getElementById('topic-input');
        const topic = topicInput.value.trim();
        
        if (!topic || this.isGenerating) {
            return;
        }

        // 检查主题长度
        if (topic.length < 2) {
            this.showError('主题内容太短，请输入更详细的描述');
            return;
        }

        try {
            this.setGeneratingState(true);
            this.showOutputSection();
            this.clearContent();
            this.hideError();
            
            await this.generateContentStream(topic);
        } catch (error) {
            console.error('生成文案失败:', error);
            let errorMessage = '生成文案时发生错误，请稍后重试。';
            
            if (error.message.includes('网络')) {
                errorMessage = '网络连接异常，请检查网络后重试';
            } else if (error.message.includes('超时')) {
                errorMessage = '请求超时，请重试';
            } else if (error.message.includes('API')) {
                errorMessage = 'AI服务暂时不可用，请稍后重试';
            }
            
            this.showError(errorMessage);
        } finally {
            this.setGeneratingState(false);
        }
    }

    // 生成文案的核心逻辑
    async generateCopy(topic) {
        try {
            let fullContent = '';
            const contentDisplay = document.getElementById('content-display');
            contentDisplay.classList.add('streaming');
            contentDisplay.textContent = '';

            // 发送POST请求到流式端点
            const controller = new AbortController();
            this.currentController = controller; // 保存控制器以便停止
            const timeoutId = setTimeout(() => controller.abort(), 60000); // 60秒超时
            
            const response = await fetch('/api/generate/stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    topic: topic,
                    style: this.getStylePreferences().style || 'casual',
                    emoji_level: this.getStylePreferences().emoji_level || 'medium',
                    content_type: this.getStylePreferences().content_type || 'general',
                    target_length: this.getStylePreferences().target_length || 'medium'
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) {
                    contentDisplay.classList.remove('streaming');
                    break;
                }
                
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            
                            if (data.type === 'start') {
                                console.log('开始生成文案，请求ID:', data.request_id);
                            } else if (data.type === 'chunk') {
                                fullContent += data.content;
                                contentDisplay.textContent = fullContent;
                                
                                // 更新进度（如果需要）
                                if (data.progress) {
                                    console.log('生成进度:', data.progress + '%');
                                }
                            } else if (data.type === 'complete') {
                                console.log('文案生成完成');
                                this.updateStats(fullContent);
                            } else if (data.type === 'error') {
                                throw new Error(data.message || '生成过程中发生错误');
                            }
                        } catch (parseError) {
                            console.warn('解析SSE数据失败:', parseError, '原始数据:', line);
                        }
                    }
                }
            }
            
            // 确保最终更新统计信息
            this.updateStats(fullContent);
            
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('请求被用户取消');
                throw new Error('请求已取消');
            } else {
                console.error('生成文案时发生错误:', error);
                throw error;
            }
        }
    }

    // 使用简单的fetch请求作为备用方案
    async generateContentStream(topic) {
        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    topic: topic
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success) {
                const contentDisplay = document.getElementById('content-display');
                contentDisplay.textContent = data.content;
                this.updateStats(data.content);
            } else {
                throw new Error(data.message || '生成失败');
            }
        } catch (error) {
            console.error('生成文案时发生错误:', error);
            throw error;
        }
    }

    // 获取样式偏好设置
    getStylePreferences() {
        // 这里可以从localStorage或其他地方获取用户偏好
        // 目前返回默认值
        return {
            style: 'casual',
            emoji_level: 'medium',
            content_type: 'general',
            target_length: 'medium'
        };
    }

    // 处理重新生成
    async handleRegenerate() {
        const topicInput = document.getElementById('topic-input');
        const topic = topicInput.value.trim();
        
        if (!topic) {
            this.showError('请先输入主题');
            return;
        }
        
        await this.handleGenerate();
    }

    // 处理复制文案
    async handleCopy() {
        const contentDisplay = document.getElementById('content-display');
        const content = contentDisplay.textContent;
        
        if (!content) {
            this.showError('没有可复制的内容');
            return;
        }
        
        try {
            await navigator.clipboard.writeText(content);
            this.showSuccess('文案已复制到剪贴板');
        } catch (error) {
            console.error('复制失败:', error);
            // 降级方案：使用传统的复制方法
            this.fallbackCopy(content);
        }
    }

    // 降级复制方案
    fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showSuccess('文案已复制到剪贴板');
        } catch (error) {
            console.error('降级复制也失败:', error);
            this.showError('复制失败，请手动选择文本复制');
        } finally {
            document.body.removeChild(textArea);
        }
    }

    // 设置生成状态
    setGeneratingState(isGenerating) {
        this.isGenerating = isGenerating;
        const generateBtn = document.getElementById('generate-btn');
        const btnText = generateBtn.querySelector('.btn-text');
        const spinner = generateBtn.querySelector('.loading-spinner');
        
        if (isGenerating) {
            btnText.textContent = '生成中...';
            spinner.style.display = 'inline-block';
            generateBtn.disabled = true;
        } else {
            btnText.textContent = '生成文案';
            spinner.style.display = 'none';
            this.updateGenerateButtonState();
        }
    }

    // 显示输出区域
    showOutputSection() {
        const outputSection = document.getElementById('output-section');
        outputSection.style.display = 'block';
        
        // 平滑滚动到输出区域
        setTimeout(() => {
            outputSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 100);
    }

    // 清空内容显示
    clearContent() {
        const contentDisplay = document.getElementById('content-display');
        contentDisplay.textContent = '生成的文案将在这里显示...';
        contentDisplay.classList.add('placeholder');
        
        // 重置统计信息
        this.updateStats('');
    }

    // 更新统计信息
    updateStats(content) {
        const wordCount = document.getElementById('word-count');
        const emojiCount = document.getElementById('emoji-count');
        
        // 计算字数（排除空格和换行）
        const words = content.replace(/\s+/g, '').length;
        wordCount.textContent = words;
        
        // 计算表情符号数量
        const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
        const emojis = content.match(emojiRegex) || [];
        emojiCount.textContent = emojis.length;
        
        // 移除占位符样式
        const contentDisplay = document.getElementById('content-display');
        if (content && content !== '生成的文案将在这里显示...') {
            contentDisplay.classList.remove('placeholder');
        }
    }

    // 显示错误信息
    showError(message) {
        const errorElement = document.getElementById('error-message');
        errorElement.textContent = `⚠️ ${message}`;
        errorElement.style.display = 'block';
        
        // 3秒后自动隐藏
        setTimeout(() => {
            this.hideError();
        }, 5000);
    }

    // 隐藏错误信息
    hideError() {
        const errorElement = document.getElementById('error-message');
        errorElement.style.display = 'none';
    }

    // 显示成功信息
    showSuccess(message) {
        const errorElement = document.getElementById('error-message');
        errorElement.textContent = `✅ ${message}`;
        errorElement.style.display = 'block';
        errorElement.style.backgroundColor = '#d4edda';
        errorElement.style.color = '#155724';
        errorElement.style.borderColor = '#c3e6cb';
        
        // 2秒后自动隐藏并重置样式
        setTimeout(() => {
            this.hideError();
            errorElement.style.backgroundColor = '';
            errorElement.style.color = '';
            errorElement.style.borderColor = '';
        }, 2000);
    }

    // 停止生成
    stopGeneration() {
        if (this.currentController) {
            this.currentController.abort();
            this.currentController = null;
        }
        
        if (this.currentEventSource) {
            this.currentEventSource.close();
            this.currentEventSource = null;
        }
        
        this.setGeneratingState(false);
        console.log('生成已停止');
    }
}

// 当DOM加载完成时初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new XiaohongshuAIAssistant();
});
