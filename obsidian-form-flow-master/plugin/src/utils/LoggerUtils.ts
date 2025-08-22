import { debugManager } from "./DebugManager";

/**
 * 日志级别枚举
 */
export enum LogLevel {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR'
}

/**
 * 日志格式化工具类
 * 提供统一的日志格式化和输出功能
 */
export class LoggerUtils {
    /**
     * 格式化时间戳
     */
    private static formatTimestamp(): string {
        const now = new Date();
        return now.toISOString().replace('T', ' ').substring(0, 23);
    }
    
    /**
     * 格式化日志消息
     * @param level 日志级别
     * @param source 日志来源
     * @param message 日志消息
     * @param args 额外参数
     */
    private static formatMessage(level: LogLevel, source: string, message: string, ...args: any[]): string {
        const timestamp = this.formatTimestamp();
        const prefix = `[${timestamp}] [${level}] [${source}]`;
        
        if (args.length > 0) {
            const argsStr = args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ');
            return `${prefix} ${message} ${argsStr}`;
        }
        
        return `${prefix} ${message}`;
    }
    
    /**
     * 输出调试日志
     * @param source 日志来源
     * @param message 日志消息
     * @param args 额外参数
     */
    static debug(source: string, message: string, ...args: any[]): void {
        const formattedMessage = this.formatMessage(LogLevel.DEBUG, source, message, ...args);
        debugManager.log(source, formattedMessage);
    }
    
    /**
     * 输出信息日志
     * @param source 日志来源
     * @param message 日志消息
     * @param args 额外参数
     */
    static info(source: string, message: string, ...args: any[]): void {
        const formattedMessage = this.formatMessage(LogLevel.INFO, source, message, ...args);
        debugManager.log(source, formattedMessage);
    }
    
    /**
     * 输出警告日志
     * @param source 日志来源
     * @param message 日志消息
     * @param args 额外参数
     */
    static warn(source: string, message: string, ...args: any[]): void {
        const formattedMessage = this.formatMessage(LogLevel.WARN, source, message, ...args);
        debugManager.warn(source, formattedMessage);
    }
    
    /**
     * 输出错误日志
     * @param source 日志来源
     * @param message 日志消息
     * @param args 额外参数
     */
    static error(source: string, message: string, ...args: any[]): void {
        const formattedMessage = this.formatMessage(LogLevel.ERROR, source, message, ...args);
        debugManager.error(source, formattedMessage);
    }
    
    /**
     * 输出对象日志
     * @param source 日志来源
     * @param message 日志消息
     * @param obj 要记录的对象
     * @param level 日志级别
     */
    static logObject(source: string, message: string, obj: any, level: LogLevel = LogLevel.DEBUG): void {
        const timestamp = this.formatTimestamp();
        const prefix = `[${timestamp}] [${level}] [${source}]`;
        const formattedMessage = `${prefix} ${message}`;
        
        switch (level) {
            case LogLevel.ERROR:
                debugManager.error(source, formattedMessage, obj);
                break;
            case LogLevel.WARN:
                debugManager.warn(source, formattedMessage, obj);
                break;
            default:
                debugManager.logObject(source, formattedMessage, obj);
                break;
        }
    }

    /**
     * 输出调试对象日志
     * @param source 日志来源
     * @param message 日志消息
     * @param obj 要记录的对象
     */
    static debugObject(source: string, message: string, obj: any): void {
        this.logObject(source, message, obj, LogLevel.DEBUG);
    }
    
    /**
     * 创建带有固定来源的日志记录器
     * @param source 日志来源
     */
    static createLogger(source: string) {
        return {
            debug: (message: string, ...args: any[]) => this.debug(source, message, ...args),
            info: (message: string, ...args: any[]) => this.info(source, message, ...args),
            warn: (message: string, ...args: any[]) => this.warn(source, message, ...args),
            error: (message: string, ...args: any[]) => this.error(source, message, ...args),
            logObject: (message: string, obj: any, level: LogLevel = LogLevel.DEBUG) => 
                this.logObject(source, message, obj, level)
        };
    }
    
    /**
     * 性能计时器
     * @param source 日志来源
     * @param label 计时标签
     */
    static time(source: string, label: string): () => void {
        const startTime = performance.now();
        this.debug(source, `⏱️ Timer started: ${label}`);
        
        return () => {
            const endTime = performance.now();
            const duration = endTime - startTime;
            this.debug(source, `⏱️ Timer ended: ${label} - ${duration.toFixed(2)}ms`);
        };
    }
    
    /**
     * 异步操作日志包装器
     * @param source 日志来源
     * @param operation 操作名称
     * @param asyncFn 异步函数
     */
    static async withLogging<T>(
        source: string, 
        operation: string, 
        asyncFn: () => Promise<T>
    ): Promise<T> {
        const endTimer = this.time(source, operation);
        this.debug(source, `🚀 Starting operation: ${operation}`);
        
        try {
            const result = await asyncFn();
            this.debug(source, `✅ Operation completed: ${operation}`);
            return result;
        } catch (error) {
            this.error(source, `❌ Operation failed: ${operation}`, error);
            throw error;
        } finally {
            endTimer();
        }
    }
    
    /**
     * 条件日志输出
     * @param condition 条件
     * @param source 日志来源
     * @param message 日志消息
     * @param level 日志级别
     * @param args 额外参数
     */
    static logIf(
        condition: boolean, 
        source: string, 
        message: string, 
        level: LogLevel = LogLevel.DEBUG,
        ...args: any[]
    ): void {
        if (!condition) return;
        
        switch (level) {
            case LogLevel.ERROR:
                this.error(source, message, ...args);
                break;
            case LogLevel.WARN:
                this.warn(source, message, ...args);
                break;
            case LogLevel.INFO:
                this.info(source, message, ...args);
                break;
            default:
                this.debug(source, message, ...args);
                break;
        }
    }
    
    /**
     * 分组日志开始
     * @param source 日志来源
     * @param groupName 分组名称
     */
    static groupStart(source: string, groupName: string): void {
        this.debug(source, `📁 Group Start: ${groupName}`);
    }
    
    /**
     * 分组日志结束
     * @param source 日志来源
     * @param groupName 分组名称
     */
    static groupEnd(source: string, groupName: string): void {
        this.debug(source, `📁 Group End: ${groupName}`);
    }
    
    /**
     * 带分组的操作包装器
     * @param source 日志来源
     * @param groupName 分组名称
     * @param fn 要执行的函数
     */
    static withGroup<T>(source: string, groupName: string, fn: () => T): T {
        this.groupStart(source, groupName);
        try {
            return fn();
        } finally {
            this.groupEnd(source, groupName);
        }
    }
}

/**
 * 创建专用的日志记录器实例
 * @param source 日志来源
 */
export function createLogger(source: string) {
    return LoggerUtils.createLogger(source);
}