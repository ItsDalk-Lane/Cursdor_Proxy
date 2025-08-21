/**
 * 统一的调试管理器
 * 用于控制整个插件的调试信息输出
 */
export class DebugManager {
    private static instance: DebugManager | null = null;
    private debugEnabled: boolean = false;

    private constructor() {}

    /**
     * 获取调试管理器实例
     */
    static getInstance(): DebugManager {
        if (!DebugManager.instance) {
            DebugManager.instance = new DebugManager();
        }
        return DebugManager.instance;
    }

    /**
     * 设置调试开关状态
     */
    setDebugEnabled(enabled: boolean): void {
        this.debugEnabled = enabled;
        this.log('DebugManager', `调试模式已${enabled ? '启用' : '禁用'}`);
    }

    /**
     * 获取调试开关状态
     */
    isDebugEnabled(): boolean {
        return this.debugEnabled;
    }

    /**
     * 输出调试日志
     * @param module 模块名称
     * @param message 日志消息
     * @param args 额外参数
     */
    log(module: string, message: string, ...args: any[]): void {
        if (this.debugEnabled) {
            console.log(`[FormFlow Debug] ${module}: ${message}`, ...args);
        }
    }

    /**
     * 输出错误日志（总是输出，不受调试开关控制）
     * @param module 模块名称
     * @param message 错误消息
     * @param args 额外参数
     */
    error(module: string, message: string, ...args: any[]): void {
        console.error(`[FormFlow Error] ${module}: ${message}`, ...args);
    }

    /**
     * 输出警告日志（总是输出，不受调试开关控制）
     * @param module 模块名称
     * @param message 警告消息
     * @param args 额外参数
     */
    warn(module: string, message: string, ...args: any[]): void {
        console.warn(`[FormFlow Warning] ${module}: ${message}`, ...args);
    }

    /**
     * 输出信息日志（总是输出，不受调试开关控制）
     * @param module 模块名称
     * @param message 信息消息
     * @param args 额外参数
     */
    info(module: string, message: string, ...args: any[]): void {
        console.info(`[FormFlow Info] ${module}: ${message}`, ...args);
    }

    /**
     * 条件调试日志 - 只有在调试模式下才输出
     * @param module 模块名称
     * @param condition 条件
     * @param message 日志消息
     * @param args 额外参数
     */
    logIf(module: string, condition: boolean, message: string, ...args: any[]): void {
        if (this.debugEnabled && condition) {
            console.log(`[FormFlow Debug] ${module}: ${message}`, ...args);
        }
    }

    /**
     * 性能调试 - 测量代码执行时间
     * @param module 模块名称
     * @param label 标签
     * @param fn 要测量的函数
     */
    async measureTime<T>(module: string, label: string, fn: () => Promise<T> | T): Promise<T> {
        if (!this.debugEnabled) {
            return await fn();
        }

        const startTime = performance.now();
        try {
            const result = await fn();
            const endTime = performance.now();
            this.log(module, `${label} 执行时间: ${(endTime - startTime).toFixed(2)}ms`);
            return result;
        } catch (error) {
            const endTime = performance.now();
            this.log(module, `${label} 执行失败，耗时: ${(endTime - startTime).toFixed(2)}ms`);
            throw error;
        }
    }

    /**
     * 对象调试 - 格式化输出对象信息
     * @param module 模块名称
     * @param label 标签
     * @param obj 要输出的对象
     */
    logObject(module: string, label: string, obj: any): void {
        if (this.debugEnabled) {
            console.log(`[FormFlow Debug] ${module}: ${label}`, obj);
        }
    }

    /**
     * 数组调试 - 格式化输出数组信息
     * @param module 模块名称
     * @param label 标签
     * @param arr 要输出的数组
     */
    logArray(module: string, label: string, arr: any[]): void {
        if (this.debugEnabled) {
            console.log(`[FormFlow Debug] ${module}: ${label} (${arr.length} 项)`, arr);
        }
    }

    /**
     * 分组调试日志开始
     * @param module 模块名称
     * @param label 分组标签
     */
    groupStart(module: string, label: string): void {
        if (this.debugEnabled) {
            console.group(`[FormFlow Debug] ${module}: ${label}`);
        }
    }

    /**
     * 分组调试日志结束
     */
    groupEnd(): void {
        if (this.debugEnabled) {
            console.groupEnd();
        }
    }

    /**
     * 折叠分组调试日志开始
     * @param module 模块名称
     * @param label 分组标签
     */
    groupCollapsedStart(module: string, label: string): void {
        if (this.debugEnabled) {
            console.groupCollapsed(`[FormFlow Debug] ${module}: ${label}`);
        }
    }
}

// 导出全局实例
export const debugManager = DebugManager.getInstance();