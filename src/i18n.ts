// 简单的国际化支持
export function t(key: string): string {
    const translations: Record<string, string> = {
        'Chat': 'AI 对话',
        'Input message...': '输入消息...',
        'Open AI chat window': '打开AI对话窗口',
        'Open Settings': '打开设置',
        'Please open plugin settings manually': '请手动打开插件设置'
    };
    
    return translations[key] || key;
}
