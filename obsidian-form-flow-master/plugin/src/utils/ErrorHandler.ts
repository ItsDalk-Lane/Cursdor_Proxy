import { debugManager } from './DebugManager';
import { LoggerUtils } from './LoggerUtils';

/**
 * 错误类型枚举
 */
export enum ErrorType {
    VALIDATION = 'VALIDATION',
    FILE_OPERATION = 'FILE_OPERATION',
    NETWORK = 'NETWORK',
    AI_SERVICE = 'AI_SERVICE',
    FORM_PROCESSING = 'FORM_PROCESSING',
    SCRIPT_EXECUTION = 'SCRIPT_EXECUTION',
    CONFIGURATION = 'CONFIGURATION',
    UNKNOWN = 'UNKNOWN'
}

/**
 * 错误严重级别
 */
export enum ErrorSeverity {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL'
}

/**
 * 错误信息接口
 */
export interface ErrorInfo {
    type: ErrorType;
    severity: ErrorSeverity;
    message: string;
    details?: any;
    source?: string;
    timestamp?: Date;
    stack?: string;
}

/**
 * 自定义错误类
 */
export class FormFlowError extends Error {
    public readonly type: ErrorType;
    public readonly severity: ErrorSeverity;
    public readonly source?: string;
    public readonly details?: any;
    public readonly timestamp: Date;

    constructor(info: ErrorInfo) {
        super(info.message);
        this.name = 'FormFlowError';
        this.type = info.type;
        this.severity = info.severity;
        this.source = info.source;
        this.details = info.details;
        this.timestamp = info.timestamp || new Date();
        
        // 保持错误堆栈
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, FormFlowError);
        }
    }

    /**
     * 获取格式化的错误信息
     */
    getFormattedMessage(): string {
        const timestamp = this.timestamp.toISOString();
        const source = this.source ? `[${this.source}]` : '';
        return `${timestamp} ${source} [${this.type}:${this.severity}] ${this.message}`;
    }

    /**
     * 转换为普通对象
     */
    toObject(): Record<string, any> {
        return {
            name: this.name,
            type: this.type,
            severity: this.severity,
            message: this.message,
            source: this.source,
            details: this.details,
            timestamp: this.timestamp,
            stack: this.stack
        };
    }
}

/**
 * 统一错误处理工具类
 */
export class ErrorHandler {
    private static instance: ErrorHandler;
    private errorHistory: FormFlowError[] = [];
    private maxHistorySize = 100;
    private debugMode = false;

    private constructor() {}

    /**
     * 获取单例实例
     */
    static getInstance(): ErrorHandler {
        if (!ErrorHandler.instance) {
            ErrorHandler.instance = new ErrorHandler();
        }
        return ErrorHandler.instance;
    }

    /**
     * 设置调试模式
     */
    setDebugMode(enabled: boolean): void {
        this.debugMode = enabled;
    }

    /**
     * 处理错误
     */
    handleError(info: ErrorInfo): FormFlowError {
        const error = new FormFlowError(info);
        
        // 记录错误历史
        this.addToHistory(error);
        
        // 根据严重级别决定日志输出方式
        this.logError(error);
        
        return error;
    }

    /**
     * 创建并抛出错误
     */
    throwError(info: ErrorInfo): never {
        const error = this.handleError(info);
        throw error;
    }

    /**
     * 安全执行函数，捕获并处理错误
     */
    async safeExecute<T>(
        fn: () => Promise<T> | T,
        errorInfo: Partial<ErrorInfo>,
        defaultValue?: T
    ): Promise<T | undefined> {
        try {
            return await fn();
        } catch (error) {
            const formattedError = this.handleError({
                type: errorInfo.type || ErrorType.UNKNOWN,
                severity: errorInfo.severity || ErrorSeverity.MEDIUM,
                message: errorInfo.message || (error instanceof Error ? error.message : '未知错误'),
                source: errorInfo.source,
                details: { originalError: error, ...errorInfo.details }
            });
            
            if (this.debugMode) {
                console.error('SafeExecute caught error:', formattedError);
            }
            
            return defaultValue;
        }
    }

    /**
     * 包装异步函数，自动处理错误
     */
    wrapAsync<T extends any[], R>(
        fn: (...args: T) => Promise<R>,
        errorInfo: Partial<ErrorInfo>
    ): (...args: T) => Promise<R | undefined> {
        return async (...args: T) => {
            return this.safeExecute(() => fn(...args), errorInfo);
        };
    }

    /**
     * 验证错误处理
     */
    handleValidationError(message: string, source?: string, details?: any): FormFlowError {
        return this.handleError({
            type: ErrorType.VALIDATION,
            severity: ErrorSeverity.MEDIUM,
            message,
            source,
            details
        });
    }

    /**
     * 文件操作错误处理
     */
    handleFileError(message: string, source?: string, details?: any): FormFlowError {
        return this.handleError({
            type: ErrorType.FILE_OPERATION,
            severity: ErrorSeverity.HIGH,
            message,
            source,
            details
        });
    }

    /**
     * 网络错误处理
     */
    handleNetworkError(message: string, source?: string, details?: any): FormFlowError {
        return this.handleError({
            type: ErrorType.NETWORK,
            severity: ErrorSeverity.HIGH,
            message,
            source,
            details
        });
    }

    /**
     * AI服务错误处理
     */
    handleAIError(message: string, source?: string, details?: any): FormFlowError {
        return this.handleError({
            type: ErrorType.AI_SERVICE,
            severity: ErrorSeverity.HIGH,
            message,
            source,
            details
        });
    }

    /**
     * 表单处理错误
     */
    handleFormError(message: string, source?: string, details?: any): FormFlowError {
        return this.handleError({
            type: ErrorType.FORM_PROCESSING,
            severity: ErrorSeverity.MEDIUM,
            message,
            source,
            details
        });
    }

    /**
     * 脚本执行错误处理
     */
    handleScriptError(message: string, source?: string, details?: any): FormFlowError {
        return this.handleError({
            type: ErrorType.SCRIPT_EXECUTION,
            severity: ErrorSeverity.HIGH,
            message,
            source,
            details
        });
    }

    /**
     * 配置错误处理
     */
    handleConfigError(message: string, source?: string, details?: any): FormFlowError {
        return this.handleError({
            type: ErrorType.CONFIGURATION,
            severity: ErrorSeverity.CRITICAL,
            message,
            source,
            details
        });
    }

    /**
     * 获取错误历史
     */
    getErrorHistory(): FormFlowError[] {
        return [...this.errorHistory];
    }

    /**
     * 清除错误历史
     */
    clearErrorHistory(): void {
        this.errorHistory = [];
    }

    /**
     * 获取特定类型的错误
     */
    getErrorsByType(type: ErrorType): FormFlowError[] {
        return this.errorHistory.filter(error => error.type === type);
    }

    /**
     * 获取特定严重级别的错误
     */
    getErrorsBySeverity(severity: ErrorSeverity): FormFlowError[] {
        return this.errorHistory.filter(error => error.severity === severity);
    }

    /**
     * 获取错误统计信息
     */
    getErrorStats(): Record<string, number> {
        const stats: Record<string, number> = {};
        
        // 按类型统计
        Object.values(ErrorType).forEach(type => {
            stats[`type_${type}`] = this.getErrorsByType(type).length;
        });
        
        // 按严重级别统计
        Object.values(ErrorSeverity).forEach(severity => {
            stats[`severity_${severity}`] = this.getErrorsBySeverity(severity).length;
        });
        
        stats.total = this.errorHistory.length;
        
        return stats;
    }

    /**
     * 记录错误到历史
     */
    private addToHistory(error: FormFlowError): void {
        this.errorHistory.push(error);
        
        // 限制历史记录大小
        if (this.errorHistory.length > this.maxHistorySize) {
            this.errorHistory = this.errorHistory.slice(-this.maxHistorySize);
        }
    }

    /**
     * 记录错误日志
     */
    private logError(error: FormFlowError): void {
        const source = error.source || 'ErrorHandler';
        const message = error.getFormattedMessage();
        
        // 根据严重级别选择日志方式
        switch (error.severity) {
            case ErrorSeverity.CRITICAL:
                debugManager.error(source, message, error.details);
                LoggerUtils.error(source, message, error.details);
                break;
            case ErrorSeverity.HIGH:
                debugManager.error(source, message, error.details);
                LoggerUtils.warn(source, message, error.details);
                break;
            case ErrorSeverity.MEDIUM:
                if (this.debugMode) {
                    debugManager.error(source, message, error.details);
                }
                LoggerUtils.info(source, message, error.details);
                break;
            case ErrorSeverity.LOW:
                if (this.debugMode) {
                    debugManager.log(source, message, error.details);
                    LoggerUtils.debug(source, message, error.details);
                }
                break;
        }
    }
}

// 导出单例实例
export const errorHandler = ErrorHandler.getInstance();

// 便捷函数
export const handleError = (info: ErrorInfo) => errorHandler.handleError(info);
export const throwError = (info: ErrorInfo): never => errorHandler.throwError(info);
export const safeExecute = <T>(fn: () => Promise<T> | T, errorInfo: Partial<ErrorInfo>, defaultValue?: T) => 
    errorHandler.safeExecute(fn, errorInfo, defaultValue);