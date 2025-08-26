/**
 * 优化的模板处理工具类
 * 提供更强大和灵活的模板处理功能
 */

import { moment } from "obsidian";
import { Objects } from "./Objects";
import { globalPerformanceMonitor } from "../core/PerformanceMonitor";
import { globalErrorHandler, ErrorType, ErrorSeverity } from "../core/ErrorHandler";

export interface TemplateContext {
    moment?: moment.Moment;
    title?: string;
    [key: string]: any;
}

export interface TemplateOptions {
    context?: TemplateContext;
    customReplacers?: Array<{
        pattern: RegExp;
        replacer: (match: string, ...args: any[]) => string;
    }>;
    enableCache?: boolean;
}

/**
 * 模板处理器类
 */
export class TemplateProcessor {
    private static instance: TemplateProcessor;
    private cache = new Map<string, string>();
    private maxCacheSize = 100;

    private constructor() {}

    static getInstance(): TemplateProcessor {
        if (!TemplateProcessor.instance) {
            TemplateProcessor.instance = new TemplateProcessor();
        }
        return TemplateProcessor.instance;
    }

    /**
     * 处理模板（兼容原有接口）
     */
    processTemplate(templateContent: any, context?: TemplateContext): string {
        return this.processTemplateAdvanced(templateContent, { context });
    }

    /**
     * 高级模板处理
     */
    processTemplateAdvanced(templateContent: any, options: TemplateOptions = {}): string {
        const metricId = globalPerformanceMonitor.startMetric('template-process', {
            contentLength: typeof templateContent === 'string' ? templateContent.length : 0,
            hasCustomReplacers: Boolean(options.customReplacers?.length),
            enableCache: Boolean(options.enableCache)
        });

        try {
            if (!Objects.exists(templateContent) || typeof templateContent !== 'string') {
                return templateContent;
            }

            // 检查缓存
            const cacheKey = this.generateCacheKey(templateContent, options);
            if (options.enableCache && this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey)!;
            }

            let result = templateContent;

            // 处理内置模板
            result = this.processBuiltinTemplates(result, options.context);

            // 处理自定义替换器
            if (options.customReplacers) {
                result = this.processCustomReplacers(result, options.customReplacers);
            }

            // 缓存结果
            if (options.enableCache) {
                this.setCacheResult(cacheKey, result);
            }

            return result;
        } catch (error) {
            globalErrorHandler.handleError({
                type: ErrorType.BUSINESS_LOGIC,
                severity: ErrorSeverity.MEDIUM,
                message: 'Template processing failed',
                source: 'TemplateProcessor.processTemplateAdvanced',
                details: error
            });
            return templateContent;
        } finally {
            globalPerformanceMonitor.endMetric(metricId);
        }
    }

    /**
     * 处理内置模板
     */
    private processBuiltinTemplates(content: string, context?: TemplateContext): string {
        const ctx = this.createTemplateContext(context);
        let result = content;

        // 日期时间模板
        if (ctx.moment) {
            result = this.processDateTimeTemplates(result, ctx.moment);
        }

        // 标题模板
        if (ctx.title) {
            result = this.processTitleTemplate(result, ctx.title);
        }

        // 其他上下文变量
        result = this.processContextVariables(result, ctx);

        return result;
    }

    /**
     * 处理日期时间模板
     */
    private processDateTimeTemplates(content: string, momentTime: moment.Moment): string {
        const patterns = [
            {
                regex: /\{\{date:(.*?)\}\}/g,
                defaultFormat: "YYYY-MM-DD"
            },
            {
                regex: /\{\{time:(.*?)\}\}/g,
                defaultFormat: "HH:mm"
            },
            {
                regex: /\{\{datetime:(.*?)\}\}/g,
                defaultFormat: "YYYY-MM-DD HH:mm"
            }
        ];

        let result = content;

        patterns.forEach(({ regex, defaultFormat }) => {
            result = result.replace(regex, (match, format) => {
                try {
                    return momentTime.format(format?.trim() || defaultFormat);
                } catch (error) {
                    console.warn(`Invalid date format: ${format}`, error);
                    return match;
                }
            });
        });

        // 简单的日期时间模板
        const simplePatterns = [
            { regex: /\{\{date\}\}/g, format: "YYYY-MM-DD" },
            { regex: /\{\{time\}\}/g, format: "HH:mm" },
            { regex: /\{\{datetime\}\}/g, format: "YYYY-MM-DD HH:mm" },
            { regex: /\{\{timestamp\}\}/g, format: "X" },
            { regex: /\{\{year\}\}/g, format: "YYYY" },
            { regex: /\{\{month\}\}/g, format: "MM" },
            { regex: /\{\{day\}\}/g, format: "DD" }
        ];

        simplePatterns.forEach(({ regex, format }) => {
            result = result.replace(regex, () => momentTime.format(format));
        });

        return result;
    }

    /**
     * 处理标题模板
     */
    private processTitleTemplate(content: string, title: string): string {
        return content.replace(/\{\{title\}\}/g, title);
    }

    /**
     * 处理上下文变量
     */
    private processContextVariables(content: string, context: TemplateContext): string {
        let result = content;

        Object.entries(context).forEach(([key, value]) => {
            if (key !== 'moment' && key !== 'title') {
                const regex = new RegExp(`\\{\\{${this.escapeRegExp(key)}\\}\\}`, 'g');
                result = result.replace(regex, String(value || ''));
            }
        });

        return result;
    }

    /**
     * 处理自定义替换器
     */
    private processCustomReplacers(
        content: string,
        replacers: Array<{ pattern: RegExp; replacer: (match: string, ...args: any[]) => string }>
    ): string {
        let result = content;

        replacers.forEach(({ pattern, replacer }) => {
            try {
                result = result.replace(pattern, replacer);
            } catch (error) {
                console.warn('Custom replacer error:', error);
            }
        });

        return result;
    }

    /**
     * 创建模板上下文
     */
    private createTemplateContext(context?: TemplateContext): TemplateContext {
        return {
            moment: moment(),
            ...context
        };
    }

    /**
     * 生成缓存键
     */
    private generateCacheKey(content: string, options: TemplateOptions): string {
        const contextHash = options.context ? 
            JSON.stringify(Object.keys(options.context).sort()) : '';
        const replacersHash = options.customReplacers?.length || 0;
        
        return `${content.substring(0, 50)}_${contextHash}_${replacersHash}`;
    }

    /**
     * 设置缓存结果
     */
    private setCacheResult(key: string, result: string): void {
        if (this.cache.size >= this.maxCacheSize) {
            // 删除最旧的缓存项
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, result);
    }

    /**
     * 转义正则表达式特殊字符
     */
    private escapeRegExp(string: string): string {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * 清除缓存
     */
    clearCache(): void {
        this.cache.clear();
    }

    /**
     * 获取缓存统计
     */
    getCacheStats(): { size: number; maxSize: number } {
        return {
            size: this.cache.size,
            maxSize: this.maxCacheSize
        };
    }

    /**
     * 批量处理模板
     */
    async processBatch(
        templates: Array<{ content: string; options?: TemplateOptions }>,
        maxConcurrency: number = 10
    ): Promise<string[]> {
        const metricId = globalPerformanceMonitor.startMetric('template-batch-process', {
            templateCount: templates.length,
            maxConcurrency
        });

        try {
            const results: string[] = [];
            
            for (let i = 0; i < templates.length; i += maxConcurrency) {
                const batch = templates.slice(i, i + maxConcurrency);
                const batchResults = await Promise.all(
                    batch.map(({ content, options }) => 
                        Promise.resolve(this.processTemplateAdvanced(content, options))
                    )
                );
                results.push(...batchResults);
            }
            
            return results;
        } finally {
            globalPerformanceMonitor.endMetric(metricId);
        }
    }
}

// 兼容性函数，保持向后兼容
export function processObTemplate(templateContent: any): string {
    return TemplateProcessor.getInstance().processTemplate(templateContent);
}

export function processObTemplateInContext(templateContent: any, context: TemplateContext): string {
    return TemplateProcessor.getInstance().processTemplate(templateContent, context);
}

// 导出模板处理器实例
export const templateProcessor = TemplateProcessor.getInstance();