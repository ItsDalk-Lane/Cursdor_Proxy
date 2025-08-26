/**
 * 性能验证和优化效果评估工具
 * 提供插件性能基准测试和优化效果验证
 */

import { globalPerformanceMonitor, PerformanceReport } from "../core/PerformanceMonitor";
import { globalErrorHandler } from "../core/ErrorHandler";
import { globalEventBus, FormFlowEvents } from "../core/EventBus";
import { App } from "obsidian";

export interface PerformanceBenchmark {
    name: string;
    baselineTime: number; // 基准时间（毫秒）
    targetImprovement: number; // 目标改善百分比
    category: 'startup' | 'ui' | 'file' | 'computation' | 'memory';
}

export interface ValidationResult {
    benchmark: PerformanceBenchmark;
    actualTime: number;
    improvement: number;
    passed: boolean;
    recommendation?: string;
}

export interface PerformanceValidationReport {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    overallImprovement: number;
    results: ValidationResult[];
    recommendations: string[];
    timestamp: number;
}

/**
 * 性能验证器类
 */
export class PerformanceValidator {
    private app: App;
    private benchmarks: PerformanceBenchmark[] = [];

    constructor(app: App) {
        this.app = app;
        this.setupDefaultBenchmarks();
    }

    /**
     * 设置默认性能基准
     */
    private setupDefaultBenchmarks(): void {
        this.benchmarks = [
            {
                name: 'plugin-startup',
                baselineTime: 1000,
                targetImprovement: 25,
                category: 'startup'
            },
            {
                name: 'form-render',
                baselineTime: 500,
                targetImprovement: 30,
                category: 'ui'
            },
            {
                name: 'file-operations',
                baselineTime: 200,
                targetImprovement: 20,
                category: 'file'
            },
            {
                name: 'template-processing',
                baselineTime: 100,
                targetImprovement: 40,
                category: 'computation'
            },
            {
                name: 'component-update',
                baselineTime: 50,
                targetImprovement: 35,
                category: 'ui'
            }
        ];
    }

    /**
     * 运行性能验证
     */
    async runValidation(): Promise<PerformanceValidationReport> {
        console.log('[FormFlow] 开始性能验证...');
        
        const results: ValidationResult[] = [];
        
        // 获取当前性能统计
        const currentStats = globalPerformanceMonitor.getStats();
        
        for (const benchmark of this.benchmarks) {
            const result = await this.validateBenchmark(benchmark, currentStats);
            results.push(result);
        }
        
        // 计算总体结果
        const passedTests = results.filter(r => r.passed).length;
        const failedTests = results.length - passedTests;
        const overallImprovement = results.reduce((sum, r) => sum + r.improvement, 0) / results.length;
        
        const report: PerformanceValidationReport = {
            totalTests: results.length,
            passedTests,
            failedTests,
            overallImprovement,
            results,
            recommendations: this.generateRecommendations(results),
            timestamp: Date.now()
        };
        
        // 发布验证完成事件
        globalEventBus.emit('performance:validation-complete', report, 'PerformanceValidator');
        
        this.logValidationReport(report);
        
        return report;
    }

    /**
     * 验证单个基准
     */
    private async validateBenchmark(
        benchmark: PerformanceBenchmark, 
        stats: PerformanceReport
    ): Promise<ValidationResult> {
        
        // 从统计数据中找到对应的性能指标
        const relevantMetrics = stats.slowestOperations.filter(
            op => op.name.includes(benchmark.name) || 
                  op.category === benchmark.category
        );
        
        let actualTime = benchmark.baselineTime;
        
        if (relevantMetrics.length > 0) {
            // 使用平均执行时间
            actualTime = relevantMetrics.reduce((sum, metric) => 
                sum + (metric.duration || 0), 0) / relevantMetrics.length;
        }
        
        // 计算改善百分比
        const improvement = ((benchmark.baselineTime - actualTime) / benchmark.baselineTime) * 100;
        const passed = improvement >= benchmark.targetImprovement;
        
        const result: ValidationResult = {
            benchmark,
            actualTime,
            improvement,
            passed,
            recommendation: this.generateBenchmarkRecommendation(benchmark, improvement)
        };
        
        return result;
    }

    /**
     * 生成基准建议
     */
    private generateBenchmarkRecommendation(
        benchmark: PerformanceBenchmark, 
        improvement: number
    ): string {
        if (improvement >= benchmark.targetImprovement) {
            return `✅ ${benchmark.name}: 性能目标已达成 (${improvement.toFixed(1)}% 改善)`;
        }
        
        const gap = benchmark.targetImprovement - improvement;
        
        switch (benchmark.category) {
            case 'startup':
                return `⚠️ 启动性能需要进一步优化 ${gap.toFixed(1)}%，建议：减少同步操作、延迟非关键服务初始化`;
            case 'ui':
                return `⚠️ UI性能需要进一步优化 ${gap.toFixed(1)}%，建议：使用React.memo、优化重新渲染`;
            case 'file':
                return `⚠️ 文件操作需要进一步优化 ${gap.toFixed(1)}%，建议：使用批量操作、异步处理`;
            case 'computation':
                return `⚠️ 计算性能需要进一步优化 ${gap.toFixed(1)}%，建议：使用缓存、优化算法`;
            case 'memory':
                return `⚠️ 内存使用需要进一步优化 ${gap.toFixed(1)}%，建议：检查内存泄漏、优化对象生命周期`;
            default:
                return `⚠️ ${benchmark.name} 需要进一步优化 ${gap.toFixed(1)}%`;
        }
    }

    /**
     * 生成总体建议
     */
    private generateRecommendations(results: ValidationResult[]): string[] {
        const recommendations: string[] = [];
        const failedResults = results.filter(r => !r.passed);
        
        if (failedResults.length === 0) {
            recommendations.push('🎉 所有性能目标都已达成！插件性能优化非常成功。');
            return recommendations;
        }
        
        // 按类别分组失败的测试
        const failedByCategory = failedResults.reduce((acc, result) => {
            const category = result.benchmark.category;
            if (!acc[category]) acc[category] = [];
            acc[category].push(result);
            return acc;
        }, {} as Record<string, ValidationResult[]>);
        
        Object.entries(failedByCategory).forEach(([category, failures]) => {
            const avgGap = failures.reduce((sum, f) => 
                sum + (f.benchmark.targetImprovement - f.improvement), 0) / failures.length;
            
            switch (category) {
                case 'startup':
                    recommendations.push(`🚀 优先优化启动性能：平均需要改善 ${avgGap.toFixed(1)}%`);
                    break;
                case 'ui':
                    recommendations.push(`🎨 优化UI响应性：平均需要改善 ${avgGap.toFixed(1)}%`);
                    break;
                case 'file':
                    recommendations.push(`📁 优化文件操作：平均需要改善 ${avgGap.toFixed(1)}%`);
                    break;
                case 'computation':
                    recommendations.push(`⚡ 优化计算性能：平均需要改善 ${avgGap.toFixed(1)}%`);
                    break;
                case 'memory':
                    recommendations.push(`🧠 优化内存使用：平均需要改善 ${avgGap.toFixed(1)}%`);
                    break;
            }
        });
        
        return recommendations;
    }

    /**
     * 记录验证报告
     */
    private logValidationReport(report: PerformanceValidationReport): void {
        console.group('[FormFlow] 性能验证报告');
        console.log(`总测试数: ${report.totalTests}`);
        console.log(`通过测试: ${report.passedTests}`);
        console.log(`失败测试: ${report.failedTests}`);
        console.log(`总体改善: ${report.overallImprovement.toFixed(1)}%`);
        
        console.group('详细结果:');
        report.results.forEach(result => {
            const status = result.passed ? '✅' : '❌';
            console.log(`${status} ${result.benchmark.name}: ${result.improvement.toFixed(1)}% 改善`);
            if (result.recommendation) {
                console.log(`   ${result.recommendation}`);
            }
        });
        console.groupEnd();
        
        if (report.recommendations.length > 0) {
            console.group('优化建议:');
            report.recommendations.forEach(rec => console.log(rec));
            console.groupEnd();
        }
        
        console.groupEnd();
    }

    /**
     * 添加自定义基准
     */
    addBenchmark(benchmark: PerformanceBenchmark): void {
        this.benchmarks.push(benchmark);
    }

    /**
     * 运行实时性能测试
     */
    async runRealTimeTest(testName: string, testFunction: () => Promise<void>): Promise<number> {
        const metricId = globalPerformanceMonitor.startMetric(`test-${testName}`);
        
        try {
            await testFunction();
            const metric = globalPerformanceMonitor.endMetric(metricId);
            return metric?.duration || 0;
        } catch (error) {
            globalPerformanceMonitor.endMetric(metricId);
            throw error;
        }
    }

    /**
     * 生成性能报告摘要
     */
    generateSummary(): string {
        const stats = globalPerformanceMonitor.getStats();
        const errorStats = globalErrorHandler.getErrorStats();
        
        return `
📊 FormFlow 性能摘要
===================
⏱️  总操作数: ${stats.totalMetrics}
📈 平均耗时: ${stats.averageDuration.toFixed(2)}ms
🐌 最慢操作: ${stats.slowestOperations[0]?.name || 'N/A'} (${stats.slowestOperations[0]?.duration?.toFixed(2) || 0}ms)
🧠 内存密集: ${stats.memoryIntensiveOperations.length} 个操作
❌ 错误统计: ${errorStats.total} 个错误
💡 建议数: ${stats.recommendations.length} 条建议
        `.trim();
    }
}

/**
 * 创建性能验证器实例
 */
export function createPerformanceValidator(app: App): PerformanceValidator {
    return new PerformanceValidator(app);
}