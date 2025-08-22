import { debugManager } from './DebugManager';
import { LoggerUtils } from './LoggerUtils';
import { debugConfig, DebugModule } from './DebugConfig';

/**
 * 性能指标接口
 */
export interface PerformanceMetric {
    name: string;
    startTime: number;
    endTime?: number;
    duration?: number;
    memoryBefore?: number;
    memoryAfter?: number;
    memoryDelta?: number;
    metadata?: Record<string, any>;
}

/**
 * 内存使用信息接口
 */
export interface MemoryInfo {
    used: number;
    total: number;
    percentage: number;
    timestamp: Date;
}

/**
 * 性能统计信息接口
 */
export interface PerformanceStats {
    totalOperations: number;
    averageDuration: number;
    minDuration: number;
    maxDuration: number;
    slowOperations: number;
    memoryLeaks: number;
    lastCleanup: Date;
}

/**
 * 性能监控器类
 */
export class PerformanceMonitor {
    private static instance: PerformanceMonitor;
    private metrics: Map<string, PerformanceMetric> = new Map();
    private completedMetrics: PerformanceMetric[] = [];
    private memoryHistory: MemoryInfo[] = [];
    private maxHistorySize = 1000;
    private slowOperationThreshold = 1000; // 毫秒
    private memoryLeakThreshold = 50 * 1024 * 1024; // 50MB
    private cleanupInterval: NodeJS.Timeout | null = null;

    private constructor() {
        this.startCleanupTimer();
    }

    /**
     * 获取单例实例
     */
    static getInstance(): PerformanceMonitor {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    }

    /**
     * 开始性能监控
     */
    startMetric(name: string, metadata?: Record<string, any>): string {
        const metricId = `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const startTime = performance.now();
        const memoryBefore = this.getCurrentMemoryUsage();

        const metric: PerformanceMetric = {
            name,
            startTime,
            memoryBefore,
            metadata
        };

        this.metrics.set(metricId, metric);

        if (debugConfig.shouldLog(DebugModule.PERFORMANCE, 4)) {
            LoggerUtils.debug('PerformanceMonitor', `Started metric: ${name}`, { metricId, metadata });
        }

        return metricId;
    }

    /**
     * 结束性能监控
     */
    endMetric(metricId: string): PerformanceMetric | null {
        const metric = this.metrics.get(metricId);
        if (!metric) {
            LoggerUtils.warn('PerformanceMonitor', `Metric not found: ${metricId}`);
            return null;
        }

        const endTime = performance.now();
        const duration = endTime - metric.startTime;
        const memoryAfter = this.getCurrentMemoryUsage();
        const memoryDelta = memoryAfter - (metric.memoryBefore || 0);

        const completedMetric: PerformanceMetric = {
            ...metric,
            endTime,
            duration,
            memoryAfter,
            memoryDelta
        };

        this.metrics.delete(metricId);
        this.addCompletedMetric(completedMetric);

        // 检查是否为慢操作
        if (duration > this.slowOperationThreshold) {
            LoggerUtils.warn('PerformanceMonitor', `Slow operation detected: ${metric.name}`, {
                duration: `${duration.toFixed(2)}ms`,
                threshold: `${this.slowOperationThreshold}ms`,
                metadata: metric.metadata
            });
        }

        // 检查内存增长
        if (memoryDelta > this.memoryLeakThreshold) {
            LoggerUtils.warn('PerformanceMonitor', `Large memory increase detected: ${metric.name}`, {
                memoryDelta: `${(memoryDelta / 1024 / 1024).toFixed(2)}MB`,
                threshold: `${(this.memoryLeakThreshold / 1024 / 1024).toFixed(2)}MB`
            });
        }

        if (debugConfig.shouldLog(DebugModule.PERFORMANCE, 4)) {
            LoggerUtils.debug('PerformanceMonitor', `Completed metric: ${metric.name}`, {
                duration: `${duration.toFixed(2)}ms`,
                memoryDelta: `${(memoryDelta / 1024).toFixed(2)}KB`
            });
        }

        return completedMetric;
    }

    /**
     * 测量函数执行性能
     */
    async measureFunction<T>(
        name: string,
        fn: () => Promise<T> | T,
        metadata?: Record<string, any>
    ): Promise<T> {
        const metricId = this.startMetric(name, metadata);
        try {
            const result = await fn();
            this.endMetric(metricId);
            return result;
        } catch (error) {
            this.endMetric(metricId);
            throw error;
        }
    }

    /**
     * 创建性能装饰器
     */
    createDecorator(name?: string) {
        return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
            const originalMethod = descriptor.value;
            const metricName = name || `${target.constructor.name}.${propertyKey}`;

            descriptor.value = async function (...args: any[]) {
                const monitor = PerformanceMonitor.getInstance();
                return monitor.measureFunction(
                    metricName,
                    () => originalMethod.apply(this, args),
                    { className: target.constructor.name, methodName: propertyKey }
                );
            };

            return descriptor;
        };
    }

    /**
     * 记录内存使用情况
     */
    recordMemoryUsage(): MemoryInfo {
        const memoryInfo: MemoryInfo = {
            used: this.getCurrentMemoryUsage(),
            total: this.getTotalMemoryLimit(),
            percentage: 0,
            timestamp: new Date()
        };

        memoryInfo.percentage = (memoryInfo.used / memoryInfo.total) * 100;

        this.memoryHistory.push(memoryInfo);
        if (this.memoryHistory.length > this.maxHistorySize) {
            this.memoryHistory = this.memoryHistory.slice(-this.maxHistorySize);
        }

        return memoryInfo;
    }

    /**
     * 获取性能统计信息
     */
    getStats(): PerformanceStats {
        const durations = this.completedMetrics.map(m => m.duration || 0);
        const slowOperations = durations.filter(d => d > this.slowOperationThreshold).length;
        const memoryLeaks = this.completedMetrics.filter(m => 
            (m.memoryDelta || 0) > this.memoryLeakThreshold
        ).length;

        return {
            totalOperations: this.completedMetrics.length,
            averageDuration: durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
            minDuration: durations.length > 0 ? Math.min(...durations) : 0,
            maxDuration: durations.length > 0 ? Math.max(...durations) : 0,
            slowOperations,
            memoryLeaks,
            lastCleanup: new Date()
        };
    }

    /**
     * 获取内存历史
     */
    getMemoryHistory(): MemoryInfo[] {
        return [...this.memoryHistory];
    }

    /**
     * 获取最近的性能指标
     */
    getRecentMetrics(count: number = 10): PerformanceMetric[] {
        return this.completedMetrics.slice(-count);
    }

    /**
     * 按名称获取性能指标
     */
    getMetricsByName(name: string): PerformanceMetric[] {
        return this.completedMetrics.filter(m => m.name === name);
    }

    /**
     * 获取慢操作
     */
    getSlowOperations(): PerformanceMetric[] {
        return this.completedMetrics.filter(m => (m.duration || 0) > this.slowOperationThreshold);
    }

    /**
     * 获取内存泄漏操作
     */
    getMemoryLeakOperations(): PerformanceMetric[] {
        return this.completedMetrics.filter(m => (m.memoryDelta || 0) > this.memoryLeakThreshold);
    }

    /**
     * 设置慢操作阈值
     */
    setSlowOperationThreshold(threshold: number): void {
        this.slowOperationThreshold = threshold;
        debugConfig.setSlowOperationThreshold(threshold);
    }

    /**
     * 设置内存泄漏阈值
     */
    setMemoryLeakThreshold(threshold: number): void {
        this.memoryLeakThreshold = threshold;
    }

    /**
     * 清理历史数据
     */
    cleanup(): void {
        const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24小时前
        
        // 清理完成的指标
        this.completedMetrics = this.completedMetrics.filter(m => 
            m.startTime > cutoffTime
        );

        // 清理内存历史
        this.memoryHistory = this.memoryHistory.filter(m => 
            m.timestamp.getTime() > cutoffTime
        );

        // 清理未完成的指标（可能是泄漏的）
        const activeMetrics = Array.from(this.metrics.entries());
        activeMetrics.forEach(([id, metric]) => {
            if (metric.startTime < cutoffTime) {
                LoggerUtils.warn('PerformanceMonitor', `Removing stale metric: ${metric.name}`, { id });
                this.metrics.delete(id);
            }
        });

        LoggerUtils.info('PerformanceMonitor', 'Performance data cleanup completed', {
            remainingMetrics: this.completedMetrics.length,
            remainingMemoryHistory: this.memoryHistory.length,
            activeMetrics: this.metrics.size
        });
    }

    /**
     * 生成性能报告
     */
    generateReport(): string {
        const stats = this.getStats();
        const slowOps = this.getSlowOperations();
        const memoryLeaks = this.getMemoryLeakOperations();
        const currentMemory = this.recordMemoryUsage();

        const report = [
            '=== Performance Monitor Report ===',
            '',
            '## Overall Statistics',
            `Total Operations: ${stats.totalOperations}`,
            `Average Duration: ${stats.averageDuration.toFixed(2)}ms`,
            `Min Duration: ${stats.minDuration.toFixed(2)}ms`,
            `Max Duration: ${stats.maxDuration.toFixed(2)}ms`,
            `Slow Operations: ${stats.slowOperations}`,
            `Memory Leaks: ${stats.memoryLeaks}`,
            '',
            '## Current Memory Usage',
            `Used: ${(currentMemory.used / 1024 / 1024).toFixed(2)}MB`,
            `Total: ${(currentMemory.total / 1024 / 1024).toFixed(2)}MB`,
            `Percentage: ${currentMemory.percentage.toFixed(2)}%`,
            '',
            '## Slow Operations (Top 5)',
            ...slowOps.slice(0, 5).map(op => 
                `- ${op.name}: ${(op.duration || 0).toFixed(2)}ms`
            ),
            '',
            '## Memory Leak Operations (Top 5)',
            ...memoryLeaks.slice(0, 5).map(op => 
                `- ${op.name}: +${((op.memoryDelta || 0) / 1024 / 1024).toFixed(2)}MB`
            ),
            '',
            `Report generated at: ${new Date().toISOString()}`
        ];

        return report.join('\n');
    }

    /**
     * 销毁监控器
     */
    destroy(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        this.metrics.clear();
        this.completedMetrics = [];
        this.memoryHistory = [];
    }

    /**
     * 获取当前内存使用量
     */
    private getCurrentMemoryUsage(): number {
        if (typeof performance !== 'undefined' && (performance as any).memory) {
            return (performance as any).memory.usedJSHeapSize;
        }
        return 0;
    }

    /**
     * 获取总内存限制
     */
    private getTotalMemoryLimit(): number {
        if (typeof performance !== 'undefined' && (performance as any).memory) {
            return (performance as any).memory.totalJSHeapSize;
        }
        return 100 * 1024 * 1024; // 默认100MB
    }

    /**
     * 添加完成的指标
     */
    private addCompletedMetric(metric: PerformanceMetric): void {
        this.completedMetrics.push(metric);
        if (this.completedMetrics.length > this.maxHistorySize) {
            this.completedMetrics = this.completedMetrics.slice(-this.maxHistorySize);
        }
    }

    /**
     * 启动清理定时器
     */
    private startCleanupTimer(): void {
        // 每小时清理一次
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 60 * 60 * 1000);
    }
}

// 导出单例实例
export const performanceMonitor = PerformanceMonitor.getInstance();

// 便捷函数
export const startMetric = (name: string, metadata?: Record<string, any>) => 
    performanceMonitor.startMetric(name, metadata);

export const endMetric = (metricId: string) => 
    performanceMonitor.endMetric(metricId);

export const measureFunction = <T>(name: string, fn: () => Promise<T> | T, metadata?: Record<string, any>) => 
    performanceMonitor.measureFunction(name, fn, metadata);

// 性能装饰器
export const Performance = (name?: string) => 
    performanceMonitor.createDecorator(name);