/**
 * 智能性能监控系统
 * 提供性能指标收集、分析、预警和优化建议
 */

import { EventBus, globalEventBus, FormFlowEvents } from './EventBus';

export interface PerformanceMetric {
    name: string;
    category: string;
    startTime: number;
    endTime?: number;
    duration?: number;
    startMemory?: number;
    endMemory?: number;
    memoryDelta?: number;
    metadata?: Record<string, any>;
    id: string;
}

export interface PerformanceThreshold {
    name: string;
    maxDuration: number;
    maxMemoryDelta: number;
    warningDuration: number;
    warningMemoryDelta: number;
}

export interface PerformanceReport {
    totalMetrics: number;
    averageDuration: number;
    slowestOperations: PerformanceMetric[];
    memoryIntensiveOperations: PerformanceMetric[];
    timeRange: { start: number; end: number };
    recommendations: string[];
}

export interface MemoryInfo {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
}

/**
 * 性能监控器类
 */
export class PerformanceMonitor {
    private metrics: Map<string, PerformanceMetric> = new Map();
    private completedMetrics: PerformanceMetric[] = [];
    private thresholds: Map<string, PerformanceThreshold> = new Map();
    private eventBus: EventBus;
    private maxMetricsHistory = 1000;
    private disposed = false;

    constructor(eventBus: EventBus = globalEventBus) {
        this.eventBus = eventBus;
        this.setupDefaultThresholds();
    }

    /**
     * 开始性能指标测量
     */
    startMetric(name: string, metadata?: Record<string, any>): string {
        if (this.disposed) {
            return '';
        }

        const id = this.generateMetricId();
        const metric: PerformanceMetric = {
            name,
            category: this.inferCategory(name),
            startTime: performance.now(),
            startMemory: this.getMemoryUsage()?.usedJSHeapSize,
            metadata,
            id
        };

        this.metrics.set(id, metric);
        return id;
    }

    /**
     * 结束性能指标测量
     */
    endMetric(id: string): PerformanceMetric | null {
        if (this.disposed) {
            return null;
        }

        const metric = this.metrics.get(id);
        if (!metric) {
            console.warn(`Performance metric not found: ${id}`);
            return null;
        }

        const endTime = performance.now();
        const endMemory = this.getMemoryUsage()?.usedJSHeapSize;

        // 完善指标数据
        metric.endTime = endTime;
        metric.duration = endTime - metric.startTime;
        metric.endMemory = endMemory;
        metric.memoryDelta = endMemory && metric.startMemory ? 
            endMemory - metric.startMemory : undefined;

        // 移除活跃指标，添加到完成列表
        this.metrics.delete(id);
        this.addCompletedMetric(metric);

        // 检查性能阈值
        this.checkThresholds(metric);

        // 发布性能事件
        this.eventBus.emit(FormFlowEvents.PERFORMANCE_METRIC, {
            metric,
            isSlowOperation: this.isSlowOperation(metric),
            isMemoryIntensive: this.isMemoryIntensive(metric)
        }, 'PerformanceMonitor');

        return metric;
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
     * 测量多个并发操作的性能
     */
    async measureConcurrent<T>(
        operations: Array<{ name: string; fn: () => Promise<T> | T; metadata?: Record<string, any> }>
    ): Promise<T[]> {
        const metricIds = operations.map(op => this.startMetric(op.name, op.metadata));
        
        try {
            const results = await Promise.all(operations.map(op => op.fn()));
            metricIds.forEach(id => this.endMetric(id));
            return results;
        } catch (error) {
            metricIds.forEach(id => this.endMetric(id));
            throw error;
        }
    }

    /**
     * 添加完成的指标
     */
    private addCompletedMetric(metric: PerformanceMetric): void {
        this.completedMetrics.push(metric);

        // 限制历史记录大小
        if (this.completedMetrics.length > this.maxMetricsHistory) {
            this.completedMetrics.shift();
        }
    }

    /**
     * 检查性能阈值
     */
    private checkThresholds(metric: PerformanceMetric): void {
        const threshold = this.thresholds.get(metric.name) || this.getDefaultThreshold();
        
        const isSlowWarning = metric.duration! > threshold.warningDuration;
        const isSlowError = metric.duration! > threshold.maxDuration;
        const isMemoryWarning = metric.memoryDelta && metric.memoryDelta > threshold.warningMemoryDelta;
        const isMemoryError = metric.memoryDelta && metric.memoryDelta > threshold.maxMemoryDelta;

        if (isSlowError || isMemoryError) {
            this.eventBus.emit(FormFlowEvents.PERFORMANCE_WARNING, {
                metric,
                type: 'critical',
                issues: {
                    slowOperation: isSlowError,
                    memoryIntensive: isMemoryError
                },
                recommendations: this.generateRecommendations(metric)
            }, 'PerformanceMonitor');
        } else if (isSlowWarning || isMemoryWarning) {
            this.eventBus.emit(FormFlowEvents.PERFORMANCE_WARNING, {
                metric,
                type: 'warning',
                issues: {
                    slowOperation: isSlowWarning,
                    memoryIntensive: isMemoryWarning
                },
                recommendations: this.generateRecommendations(metric)
            }, 'PerformanceMonitor');
        }
    }

    /**
     * 生成性能建议
     */
    private generateRecommendations(metric: PerformanceMetric): string[] {
        const recommendations: string[] = [];

        if (metric.duration! > 1000) {
            recommendations.push('考虑将长时间运行的操作分解为更小的块');
            recommendations.push('检查是否可以使用缓存来避免重复计算');
        }

        if (metric.memoryDelta && metric.memoryDelta > 10 * 1024 * 1024) { // 10MB
            recommendations.push('检查是否存在内存泄漏');
            recommendations.push('考虑使用对象池或其他内存优化技术');
        }

        if (metric.category === 'dom') {
            recommendations.push('考虑使用批量DOM操作来减少重排和重绘');
            recommendations.push('使用DocumentFragment进行批量DOM插入');
        }

        if (metric.category === 'file') {
            recommendations.push('考虑使用异步文件操作');
            recommendations.push('实现文件操作的批处理');
        }

        return recommendations;
    }

    /**
     * 获取内存使用情况
     */
    private getMemoryUsage(): MemoryInfo | null {
        if ('memory' in performance) {
            return (performance as any).memory;
        }
        return null;
    }

    /**
     * 生成指标ID
     */
    private generateMetricId(): string {
        return `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 推断操作类别
     */
    private inferCategory(name: string): string {
        const lowerName = name.toLowerCase();
        
        if (lowerName.includes('file') || lowerName.includes('read') || lowerName.includes('write')) {
            return 'file';
        }
        if (lowerName.includes('dom') || lowerName.includes('render') || lowerName.includes('element')) {
            return 'dom';
        }
        if (lowerName.includes('api') || lowerName.includes('fetch') || lowerName.includes('request')) {
            return 'network';
        }
        if (lowerName.includes('compute') || lowerName.includes('calculate') || lowerName.includes('process')) {
            return 'computation';
        }
        
        return 'general';
    }

    /**
     * 设置默认阈值
     */
    private setupDefaultThresholds(): void {
        const defaultThresholds: PerformanceThreshold[] = [
            {
                name: 'file-operation',
                maxDuration: 2000,
                warningDuration: 1000,
                maxMemoryDelta: 50 * 1024 * 1024, // 50MB
                warningMemoryDelta: 20 * 1024 * 1024 // 20MB
            },
            {
                name: 'dom-operation',
                maxDuration: 100,
                warningDuration: 50,
                maxMemoryDelta: 10 * 1024 * 1024, // 10MB
                warningMemoryDelta: 5 * 1024 * 1024 // 5MB
            },
            {
                name: 'computation',
                maxDuration: 500,
                warningDuration: 200,
                maxMemoryDelta: 20 * 1024 * 1024, // 20MB
                warningMemoryDelta: 10 * 1024 * 1024 // 10MB
            }
        ];

        for (const threshold of defaultThresholds) {
            this.thresholds.set(threshold.name, threshold);
        }
    }

    /**
     * 获取默认阈值
     */
    private getDefaultThreshold(): PerformanceThreshold {
        return {
            name: 'default',
            maxDuration: 1000,
            warningDuration: 500,
            maxMemoryDelta: 30 * 1024 * 1024, // 30MB
            warningMemoryDelta: 15 * 1024 * 1024 // 15MB
        };
    }

    /**
     * 判断是否为慢操作
     */
    private isSlowOperation(metric: PerformanceMetric): boolean {
        const threshold = this.thresholds.get(metric.name) || this.getDefaultThreshold();
        return metric.duration! > threshold.warningDuration;
    }

    /**
     * 判断是否为内存密集操作
     */
    private isMemoryIntensive(metric: PerformanceMetric): boolean {
        if (!metric.memoryDelta) return false;
        const threshold = this.thresholds.get(metric.name) || this.getDefaultThreshold();
        return metric.memoryDelta > threshold.warningMemoryDelta;
    }

    /**
     * 设置性能阈值
     */
    setThreshold(threshold: PerformanceThreshold): void {
        this.thresholds.set(threshold.name, threshold);
    }

    /**
     * 获取性能统计信息
     */
    getStats(): PerformanceReport {
        const now = Date.now();
        const timeRange = {
            start: this.completedMetrics.length > 0 ? this.completedMetrics[0].startTime : now,
            end: now
        };

        const totalMetrics = this.completedMetrics.length;
        const averageDuration = totalMetrics > 0 ? 
            this.completedMetrics.reduce((sum, m) => sum + (m.duration || 0), 0) / totalMetrics : 0;

        const slowestOperations = [...this.completedMetrics]
            .sort((a, b) => (b.duration || 0) - (a.duration || 0))
            .slice(0, 10);

        const memoryIntensiveOperations = [...this.completedMetrics]
            .filter(m => m.memoryDelta && m.memoryDelta > 0)
            .sort((a, b) => (b.memoryDelta || 0) - (a.memoryDelta || 0))
            .slice(0, 10);

        const recommendations = this.generateGlobalRecommendations();

        return {
            totalMetrics,
            averageDuration,
            slowestOperations,
            memoryIntensiveOperations,
            timeRange,
            recommendations
        };
    }

    /**
     * 生成全局性能建议
     */
    private generateGlobalRecommendations(): string[] {
        const recommendations: string[] = [];
        const stats = this.getBasicStats();

        if (stats.slowOperationsCount > stats.totalOperations * 0.1) {
            recommendations.push('检测到较多慢操作，建议优化算法或使用缓存');
        }

        if (stats.memoryIntensiveCount > stats.totalOperations * 0.05) {
            recommendations.push('检测到内存使用较高，建议检查内存泄漏');
        }

        if (stats.averageDuration > 200) {
            recommendations.push('平均执行时间较长，建议使用异步操作或性能优化');
        }

        return recommendations;
    }

    /**
     * 获取基础统计信息
     */
    private getBasicStats() {
        const totalOperations = this.completedMetrics.length;
        const slowOperationsCount = this.completedMetrics.filter(m => 
            this.isSlowOperation(m)
        ).length;
        const memoryIntensiveCount = this.completedMetrics.filter(m => 
            this.isMemoryIntensive(m)
        ).length;
        const averageDuration = totalOperations > 0 ? 
            this.completedMetrics.reduce((sum, m) => sum + (m.duration || 0), 0) / totalOperations : 0;

        return {
            totalOperations,
            slowOperationsCount,
            memoryIntensiveCount,
            averageDuration
        };
    }

    /**
     * 获取指定时间范围内的指标
     */
    getMetricsInRange(startTime: number, endTime: number): PerformanceMetric[] {
        return this.completedMetrics.filter(metric => 
            metric.startTime >= startTime && metric.startTime <= endTime
        );
    }

    /**
     * 获取指定类别的指标
     */
    getMetricsByCategory(category: string): PerformanceMetric[] {
        return this.completedMetrics.filter(metric => metric.category === category);
    }

    /**
     * 清除历史指标
     */
    clearHistory(): void {
        this.completedMetrics = [];
        this.metrics.clear();
    }

    /**
     * 销毁性能监控器
     */
    dispose(): void {
        if (this.disposed) {
            return;
        }

        this.clearHistory();
        this.thresholds.clear();
        this.disposed = true;
    }
}

/**
 * 全局性能监控器实例
 */
export const globalPerformanceMonitor = new PerformanceMonitor();