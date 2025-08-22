import { debugManager } from '../utils/DebugManager';
import { errorHandler, ErrorType, ErrorSeverity, FormFlowError } from '../utils/ErrorHandler';
import { performanceMonitor } from '../utils/PerformanceMonitor';
import { debugConfig, DebugModule, DebugLevel } from '../utils/DebugConfig';
import { LoggerUtils } from '../utils/LoggerUtils';

/**
 * 基础服务类，提供通用的调试日志、错误处理和性能监控功能
 */
export abstract class BaseService {
    protected serviceName: string;
    protected debugModule: DebugModule;
    protected debugEnabled: boolean = false;

    constructor(serviceName: string, debugModule?: DebugModule) {
        this.serviceName = serviceName;
        this.debugModule = debugModule || DebugModule.PLUGIN_CORE;
        this.initializeService();
    }

    /**
     * 初始化服务
     */
    private initializeService(): void {
        // 从配置中获取调试状态
        this.debugEnabled = debugConfig.isModuleEnabled(this.debugModule);
        
        // 监听配置变更
        debugConfig.addListener((config) => {
            this.debugEnabled = debugConfig.isModuleEnabled(this.debugModule);
        });
    }

    /**
     * 设置调试模式
     */
    setDebugMode(enabled: boolean): void {
        this.debugEnabled = enabled;
        debugConfig.setModuleDebug(this.debugModule, enabled);
    }

    /**
     * 调试日志输出（仅在调试模式下输出）
     */
    protected debugLog(message: string, ...args: any[]): void {
        if (debugConfig.shouldLog(this.debugModule, DebugLevel.DEBUG)) {
            LoggerUtils.debug(this.serviceName, message, ...args);
        }
    }

    /**
     * 信息日志输出
     */
    protected infoLog(message: string, ...args: any[]): void {
        if (debugConfig.shouldLog(this.debugModule, DebugLevel.INFO)) {
            LoggerUtils.info(this.serviceName, message, ...args);
        }
    }

    /**
     * 警告日志输出
     */
    protected warnLog(message: string, ...args: any[]): void {
        if (debugConfig.shouldLog(this.debugModule, DebugLevel.WARN)) {
            LoggerUtils.warn(this.serviceName, message, ...args);
        }
    }

    /**
     * 错误日志输出
     */
    protected errorLog(message: string, ...args: any[]): void {
        if (debugConfig.shouldLog(this.debugModule, DebugLevel.ERROR)) {
            LoggerUtils.error(this.serviceName, message, ...args);
        }
    }

    /**
     * 调试对象日志输出（仅在调试模式下输出）
     */
    protected debugLogObject(message: string, obj: any): void {
        if (debugConfig.shouldLog(this.debugModule, DebugLevel.DEBUG)) {
            LoggerUtils.debugObject(this.serviceName, message, obj);
        }
    }

    /**
     * 强制调试日志输出（忽略调试模式设置，保持向后兼容）
     */
    protected forceDebugLog(message: string, ...args: any[]): void {
        debugManager.log(this.serviceName, message, ...args);
    }

    /**
     * 强制调试对象日志输出（忽略调试模式设置，保持向后兼容）
     */
    protected forceDebugLogObject(message: string, obj: any): void {
        debugManager.logObject(this.serviceName, message, obj);
    }

    /**
     * 处理错误
     */
    protected handleError(message: string, type: ErrorType = ErrorType.UNKNOWN, severity: ErrorSeverity = ErrorSeverity.MEDIUM, details?: any): FormFlowError {
        return errorHandler.handleError({
            type,
            severity,
            message,
            source: this.serviceName,
            details
        });
    }

    /**
     * 抛出错误
     */
    protected throwError(message: string, type: ErrorType = ErrorType.UNKNOWN, severity: ErrorSeverity = ErrorSeverity.MEDIUM, details?: any): never {
        throw this.handleError(message, type, severity, details);
    }

    /**
     * 安全执行函数
     */
    protected async safeExecute<T>(
        fn: () => Promise<T> | T,
        errorMessage: string,
        errorType: ErrorType = ErrorType.UNKNOWN,
        defaultValue?: T
    ): Promise<T | undefined> {
        return errorHandler.safeExecute(
            fn,
            {
                type: errorType,
                severity: ErrorSeverity.MEDIUM,
                message: errorMessage,
                source: this.serviceName
            },
            defaultValue
        );
    }

    /**
     * 开始性能监控
     */
    protected startPerformanceMetric(name: string, metadata?: Record<string, any>): string {
        return performanceMonitor.startMetric(`${this.serviceName}.${name}`, {
            service: this.serviceName,
            ...metadata
        });
    }

    /**
     * 结束性能监控
     */
    protected endPerformanceMetric(metricId: string): void {
        performanceMonitor.endMetric(metricId);
    }

    /**
     * 测量方法性能
     */
    protected async measurePerformance<T>(
        name: string,
        fn: () => Promise<T> | T,
        metadata?: Record<string, any>
    ): Promise<T> {
        return performanceMonitor.measureFunction(
            `${this.serviceName}.${name}`,
            fn,
            {
                service: this.serviceName,
                ...metadata
            }
        );
    }

    /**
     * 获取服务统计信息
     */
    protected getServiceStats(): Record<string, any> {
        const performanceStats = performanceMonitor.getStats();
        const errorStats = errorHandler.getErrorStats();
        
        return {
            serviceName: this.serviceName,
            debugModule: this.debugModule,
            debugEnabled: this.debugEnabled,
            performance: performanceStats,
            errors: errorStats
        };
    }
}

/**
 * 单例模式基础服务类
 */
export abstract class BaseSingletonService extends BaseService {
    public static instances: Map<string, BaseSingletonService> = new Map();

    constructor(serviceName: string, debugModule?: DebugModule) {
        super(serviceName, debugModule);
    }

    /**
     * 获取单例实例
     */
    public static getInstance<T extends BaseSingletonService>(
        this: new (serviceName: string, debugModule?: DebugModule) => T,
        serviceName: string,
        debugModule?: DebugModule
    ): T {
        const key = `${this.name}_${serviceName}`;
        if (!BaseSingletonService.instances.has(key)) {
            const instance = new this(serviceName, debugModule);
            BaseSingletonService.instances.set(key, instance);
            
            // 记录单例创建
            instance.infoLog(`Singleton instance created: ${key}`);
        }
        return BaseSingletonService.instances.get(key) as T;
    }

    /**
     * 检查实例是否存在
     */
    static hasInstance(serviceName: string): boolean {
        const keys = Array.from(BaseSingletonService.instances.keys());
        return keys.some(key => key.endsWith(`_${serviceName}`));
    }

    /**
     * 获取所有实例信息
     */
    static getAllInstancesInfo(): Array<{ key: string; serviceName: string; className: string }> {
        return Array.from(BaseSingletonService.instances.entries()).map(([key, instance]) => ({
            key,
            serviceName: instance.serviceName,
            className: instance.constructor.name
        }));
    }

    /**
     * 清除所有单例实例
     */
    static clearAllInstances(): void {
        const instanceCount = BaseSingletonService.instances.size;
        
        // 通知所有实例即将被销毁
        BaseSingletonService.instances.forEach((instance, key) => {
            try {
                instance.infoLog(`Singleton instance being destroyed: ${key}`);
                if ('destroy' in instance && typeof (instance as any).destroy === 'function') {
                    (instance as any).destroy();
                }
            } catch (error) {
                console.error(`Error destroying singleton instance ${key}:`, error);
            }
        });
        
        BaseSingletonService.instances.clear();
        console.log(`Cleared ${instanceCount} singleton instances`);
    }

    /**
     * 清除特定服务的实例
     */
    static clearInstance(serviceName: string): void {
        const keysToDelete = Array.from(BaseSingletonService.instances.keys())
            .filter(key => key.endsWith(`_${serviceName}`));
        
        keysToDelete.forEach(key => {
            const instance = BaseSingletonService.instances.get(key);
            if (instance) {
                try {
                    instance.infoLog(`Singleton instance being destroyed: ${key}`);
                    if ('destroy' in instance && typeof (instance as any).destroy === 'function') {
                        (instance as any).destroy();
                    }
                } catch (error) {
                    console.error(`Error destroying singleton instance ${key}:`, error);
                }
            }
            BaseSingletonService.instances.delete(key);
        });
        
        if (keysToDelete.length > 0) {
            console.log(`Cleared ${keysToDelete.length} singleton instances for service: ${serviceName}`);
        }
    }

    /**
     * 获取单例统计信息
     */
    static getSingletonStats(): Record<string, any> {
        const instances = BaseSingletonService.getAllInstancesInfo();
        const serviceGroups = instances.reduce((acc, instance) => {
            acc[instance.serviceName] = (acc[instance.serviceName] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        return {
            totalInstances: instances.length,
            serviceGroups,
            instances: instances.map(i => ({ serviceName: i.serviceName, className: i.className }))
        };
    }
}