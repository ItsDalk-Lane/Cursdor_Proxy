/**
 * 增强的错误处理系统
 * 提供统一的错误管理、分类、恢复和报告机制
 */

import { EventBus, globalEventBus, FormFlowEvents } from './EventBus';

export enum ErrorType {
    VALIDATION = 'validation',
    NETWORK = 'network',
    FILE_SYSTEM = 'file_system',
    PERMISSION = 'permission',
    BUSINESS_LOGIC = 'business_logic',
    CONFIGURATION = 'configuration',
    PLUGIN_API = 'plugin_api',
    UNKNOWN = 'unknown'
}

export enum ErrorSeverity {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
}

export interface ErrorContext {
    type: ErrorType;
    severity: ErrorSeverity;
    message: string;
    source: string;
    details?: any;
    timestamp?: number;
    stackTrace?: string;
    userVisible?: boolean;
    recoverable?: boolean;
}

export interface ErrorRecoveryStrategy {
    canRecover(error: FormFlowError): boolean;
    recover(error: FormFlowError): Promise<boolean>;
}

export class FormFlowError extends Error {
    public readonly type: ErrorType;
    public readonly severity: ErrorSeverity;
    public readonly source: string;
    public readonly details?: any;
    public readonly timestamp: number;
    public readonly userVisible: boolean;
    public readonly recoverable: boolean;
    public readonly id: string;

    constructor(context: ErrorContext) {
        super(context.message);
        this.name = 'FormFlowError';
        this.type = context.type;
        this.severity = context.severity;
        this.source = context.source;
        this.details = context.details;
        this.timestamp = context.timestamp || Date.now();
        this.userVisible = context.userVisible ?? this.shouldBeUserVisible();
        this.recoverable = context.recoverable ?? this.isRecoverable();
        this.id = this.generateErrorId();

        // 保留原始堆栈跟踪
        if (context.stackTrace) {
            this.stack = context.stackTrace;
        }
    }

    private shouldBeUserVisible(): boolean {
        return this.severity === ErrorSeverity.HIGH || 
               this.severity === ErrorSeverity.CRITICAL ||
               this.type === ErrorType.VALIDATION;
    }

    private isRecoverable(): boolean {
        return this.severity !== ErrorSeverity.CRITICAL &&
               this.type !== ErrorType.PERMISSION;
    }

    private generateErrorId(): string {
        return `${this.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 获取格式化的错误信息
     */
    getFormattedMessage(): string {
        const timestamp = new Date(this.timestamp).toISOString();
        const source = this.source ? `[${this.source}]` : '';
        return `${timestamp} ${source} [${this.type}:${this.severity}] ${this.message}`;
    }

    /**
     * 转换为普通对象
     */
    toObject(): Record<string, any> {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            severity: this.severity,
            message: this.message,
            source: this.source,
            details: this.details,
            timestamp: this.timestamp,
            userVisible: this.userVisible,
            recoverable: this.recoverable,
            stack: this.stack
        };
    }

    toJSON() {
        return {
            id: this.id,
            type: this.type,
            severity: this.severity,
            message: this.message,
            source: this.source,
            details: this.details,
            timestamp: this.timestamp,
            userVisible: this.userVisible,
            recoverable: this.recoverable,
            stack: this.stack
        };
    }
}

/**
 * 错误处理器类
 */
export class ErrorHandler {
    private errorHistory: FormFlowError[] = [];
    private maxHistorySize = 500;
    private recoveryStrategies: ErrorRecoveryStrategy[] = [];
    private eventBus: EventBus;
    private disposed = false;

    constructor(eventBus: EventBus = globalEventBus) {
        this.eventBus = eventBus;
        this.registerDefaultRecoveryStrategies();
    }

    /**
     * 处理错误
     */
    handleError(context: ErrorContext): FormFlowError {
        if (this.disposed) {
            console.error('ErrorHandler disposed:', context);
            return new FormFlowError(context);
        }

        const error = new FormFlowError(context);
        this.recordError(error);

        // 发布错误事件
        this.eventBus.emit(FormFlowEvents.ERROR, {
            error,
            context
        }, 'ErrorHandler');

        // 尝试错误恢复
        this.attemptRecovery(error);

        // 记录到控制台
        this.logError(error);

        return error;
    }

    /**
     * 安全执行函数
     */
    async safeExecute<T>(
        fn: () => Promise<T> | T,
        errorContext: Partial<ErrorContext>,
        defaultValue?: T
    ): Promise<T | undefined> {
        try {
            return await fn();
        } catch (error) {
            const formFlowError = this.handleError({
                type: ErrorType.UNKNOWN,
                severity: ErrorSeverity.MEDIUM,
                message: error instanceof Error ? error.message : String(error),
                source: 'SafeExecute',
                details: error,
                stackTrace: error instanceof Error ? error.stack : undefined,
                ...errorContext
            });

            return defaultValue;
        }
    }

    /**
     * 记录错误到历史
     */
    private recordError(error: FormFlowError): void {
        this.errorHistory.push(error);

        // 限制历史大小
        if (this.errorHistory.length > this.maxHistorySize) {
            this.errorHistory.shift();
        }
    }

    /**
     * 尝试错误恢复
     */
    private async attemptRecovery(error: FormFlowError): Promise<void> {
        if (!error.recoverable) {
            return;
        }

        for (const strategy of this.recoveryStrategies) {
            if (strategy.canRecover(error)) {
                try {
                    const recovered = await strategy.recover(error);
                    if (recovered) {
                        console.log(`Error ${error.id} recovered using ${strategy.constructor.name}`);
                        break;
                    }
                } catch (recoveryError) {
                    console.error('Error recovery failed:', recoveryError);
                }
            }
        }
    }

    /**
     * 记录错误日志
     */
    private logError(error: FormFlowError): void {
        const logLevel = this.getLogLevel(error.severity);
        const message = `[${error.type.toUpperCase()}] ${error.source}: ${error.message}`;
        
        switch (logLevel) {
            case 'error':
                console.error(message, error.details, error);
                break;
            case 'warn':
                console.warn(message, error.details);
                break;
            case 'info':
                console.info(message, error.details);
                break;
            default:
                console.log(message, error.details);
        }
    }

    /**
     * 获取日志级别
     */
    private getLogLevel(severity: ErrorSeverity): string {
        switch (severity) {
            case ErrorSeverity.CRITICAL:
            case ErrorSeverity.HIGH:
                return 'error';
            case ErrorSeverity.MEDIUM:
                return 'warn';
            case ErrorSeverity.LOW:
                return 'info';
            default:
                return 'log';
        }
    }

    /**
     * 注册默认恢复策略
     */
    private registerDefaultRecoveryStrategies(): void {
        // 网络错误恢复策略
        this.addRecoveryStrategy({
            canRecover: (error) => error.type === ErrorType.NETWORK,
            recover: async (error) => {
                // 简单的重试机制
                console.log(`Attempting to recover network error: ${error.id}`);
                return false; // 需要具体实现
            }
        });

        // 文件系统错误恢复策略
        this.addRecoveryStrategy({
            canRecover: (error) => error.type === ErrorType.FILE_SYSTEM,
            recover: async (error) => {
                console.log(`Attempting to recover file system error: ${error.id}`);
                return false; // 需要具体实现
            }
        });
    }

    /**
     * 添加错误恢复策略
     */
    addRecoveryStrategy(strategy: ErrorRecoveryStrategy): void {
        this.recoveryStrategies.push(strategy);
    }

    /**
     * 获取错误统计信息
     */
    getErrorStats(): {
        total: number;
        byType: Record<ErrorType, number>;
        bySeverity: Record<ErrorSeverity, number>;
        recent: FormFlowError[];
    } {
        const byType = {} as Record<ErrorType, number>;
        const bySeverity = {} as Record<ErrorSeverity, number>;

        for (const error of this.errorHistory) {
            byType[error.type] = (byType[error.type] || 0) + 1;
            bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1;
        }

        return {
            total: this.errorHistory.length,
            byType,
            bySeverity,
            recent: this.errorHistory.slice(-10)
        };
    }

    /**
     * 获取错误历史
     */
    getErrorHistory(limit?: number): FormFlowError[] {
        if (limit) {
            return this.errorHistory.slice(-limit);
        }
        return [...this.errorHistory];
    }

    /**
     * 清除错误历史
     */
    clearHistory(): void {
        this.errorHistory = [];
    }

    /**
     * 获取特定类型的错误
     */
    getErrorsByType(type: ErrorType): FormFlowError[] {
        return this.errorHistory.filter(error => error.type === type);
    }

    /**
     * 获取特定严重程度的错误
     */
    getErrorsBySeverity(severity: ErrorSeverity): FormFlowError[] {
        return this.errorHistory.filter(error => error.severity === severity);
    }

    /**
     * 检查是否有未处理的严重错误
     */
    hasCriticalErrors(): boolean {
        return this.errorHistory.some(error => 
            error.severity === ErrorSeverity.CRITICAL &&
            error.timestamp > Date.now() - 300000 // 5分钟内
        );
    }

    /**
     * 销毁错误处理器
     */
    dispose(): void {
        if (this.disposed) {
            return;
        }

        this.clearHistory();
        this.recoveryStrategies = [];
        this.disposed = true;
    }
}

/**
 * 全局错误处理器实例
 */
export const globalErrorHandler = new ErrorHandler();