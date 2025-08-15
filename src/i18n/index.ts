// i18n Language Manager for Obsidian Git Plugin
import { en, type TranslationValue } from './en';
import { zhCN } from './zh-cn';

// 支持的语言类型
export type SupportedLanguage = 'en' | 'zh-cn';

// 语言配置
export const SUPPORTED_LANGUAGES = {
    'en': {
        name: 'English',
        nativeName: 'English',
        translations: en
    },
    'zh-cn': {
        name: 'Chinese (Simplified)',
        nativeName: '简体中文',
        translations: zhCN
    }
} as const;

// 翻译键类型（支持嵌套路径）
export type TranslationPath = 
    | keyof TranslationValue
    | `${keyof TranslationValue}.${string}`
    | `${keyof TranslationValue}.${string}.${string}`
    | `${keyof TranslationValue}.${string}.${string}.${string}`;

// 语言管理器类
export class I18nManager {
    private currentLanguage: SupportedLanguage = 'en';
    private fallbackLanguage: SupportedLanguage = 'en';
    private storageKey = 'obsidian-git-language';

    constructor() {
        this.loadLanguageFromStorage();
        this.detectSystemLanguage();
    }

    /**
     * 获取当前语言
     */
    getCurrentLanguage(): SupportedLanguage {
        return this.currentLanguage;
    }

    /**
     * 设置当前语言
     * @param language 语言代码
     */
    setLanguage(language: SupportedLanguage): void {
        if (language in SUPPORTED_LANGUAGES) {
            this.currentLanguage = language;
            this.saveLanguageToStorage();
        }
    }

    /**
     * 获取所有支持的语言
     */
    getSupportedLanguages(): Record<SupportedLanguage, { name: string; nativeName: string }> {
        const result: Record<string, { name: string; nativeName: string }> = {};
        
        for (const [code, config] of Object.entries(SUPPORTED_LANGUAGES)) {
            result[code] = {
                name: config.name,
                nativeName: config.nativeName
            };
        }
        
        return result as Record<SupportedLanguage, { name: string; nativeName: string }>;
    }

    /**
     * 翻译函数 - 支持嵌套路径
     * @param path 翻译路径，如 'commands.push' 或 'ui.sourceControl.title'
     * @param params 替换参数
     * @returns 翻译后的文本
     */
    t(path: TranslationPath, params?: Record<string, string | number>): string {
        const translations = SUPPORTED_LANGUAGES[this.currentLanguage].translations;
        const fallbackTranslations = SUPPORTED_LANGUAGES[this.fallbackLanguage].translations;
        
        // 获取翻译文本
        let text = this.getNestedValue(translations, path) || 
                   this.getNestedValue(fallbackTranslations, path) || 
                   path;

        // 调试输出
        if (path.startsWith('commands.') && text === path) {
            console.warn(`Translation missing for path: ${path} (current language: ${this.currentLanguage})`);
        }

        // 替换参数
        if (params && typeof text === 'string') {
            text = this.replaceParams(text, params);
        }

        return text;
    }

    /**
     * 从嵌套对象中获取值
     * @param obj 对象
     * @param path 路径
     * @returns 值或 undefined
     */
    private getNestedValue(obj: any, path: string): string | undefined {
        const keys = path.split('.');
        let current = obj;

        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else {
                return undefined;
            }
        }

        return typeof current === 'string' ? current : undefined;
    }

    /**
     * 替换文本中的参数
     * @param text 原文本
     * @param params 参数对象
     * @returns 替换后的文本
     */
    private replaceParams(text: string, params: Record<string, string | number>): string {
        return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return params[key]?.toString() || match;
        });
    }

    /**
     * 从本地存储加载语言设置
     */
    private loadLanguageFromStorage(): void {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored && stored in SUPPORTED_LANGUAGES) {
                this.currentLanguage = stored as SupportedLanguage;
            }
        } catch (error) {
            console.warn('Failed to load language from storage:', error);
        }
    }

    /**
     * 保存语言设置到本地存储
     */
    private saveLanguageToStorage(): void {
        try {
            localStorage.setItem(this.storageKey, this.currentLanguage);
        } catch (error) {
            console.warn('Failed to save language to storage:', error);
        }
    }

    /**
     * 检测系统语言
     */
    private detectSystemLanguage(): void {
        // 如果没有存储的语言设置，尝试检测系统语言
        if (!localStorage.getItem(this.storageKey)) {
            const systemLang = this.getSystemLanguage();
            if (systemLang && systemLang in SUPPORTED_LANGUAGES) {
                this.currentLanguage = systemLang as SupportedLanguage;
                this.saveLanguageToStorage();
                console.log('Auto-detected language:', systemLang);
            } else {
                console.log('No matching language found, using default:', this.currentLanguage);
            }
        } else {
            console.log('Using stored language:', this.currentLanguage);
        }
    }

    /**
     * 获取系统语言
     */
    private getSystemLanguage(): string | null {
        try {
            // 检测浏览器语言
            const browserLang = navigator.language || (navigator as any).userLanguage;
            
            if (browserLang) {
                // 标准化语言代码
                const normalizedLang = browserLang.toLowerCase();
                
                // 精确匹配
                if (normalizedLang in SUPPORTED_LANGUAGES) {
                    return normalizedLang;
                }
                
                // 语言族匹配（如 zh-CN, zh-TW 都匹配到 zh-cn）
                if (normalizedLang.startsWith('zh')) {
                    return 'zh-cn';
                }
                
                // 英语族匹配
                if (normalizedLang.startsWith('en')) {
                    return 'en';
                }
            }
        } catch (error) {
            console.warn('Failed to detect system language:', error);
        }
        
        return null;
    }

    /**
     * 获取当前语言的显示名称
     */
    getCurrentLanguageName(): string {
        return SUPPORTED_LANGUAGES[this.currentLanguage].nativeName;
    }

    /**
     * 检查是否为中文语言
     */
    isChineseLanguage(): boolean {
        return this.currentLanguage === 'zh-cn';
    }

    /**
     * 检查是否为英文语言
     */
    isEnglishLanguage(): boolean {
        return this.currentLanguage === 'en';
    }
}

// 创建全局 i18n 实例
export const i18n = new I18nManager();

// 导出翻译函数的快捷方式
export const t = (path: TranslationPath, params?: Record<string, string | number>): string => {
    return i18n.t(path, params);
};

// 导出语言切换函数
export const setLanguage = (language: SupportedLanguage): void => {
    i18n.setLanguage(language);
};

// 导出当前语言获取函数
export const getCurrentLanguage = (): SupportedLanguage => {
    return i18n.getCurrentLanguage();
};

// 导出支持的语言列表
export const getSupportedLanguages = () => {
    return i18n.getSupportedLanguages();
};

// 类型导出
export type { SupportedLanguage, TranslationPath };
