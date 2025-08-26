/**
 * 事件总线系统
 * 提供类型安全的事件发布订阅机制
 */

export type EventListener<T = any> = (data: T) => void | Promise<void>;
export type EventUnsubscriber = () => void;

export interface EventMetadata {
    timestamp: number;
    source?: string;
    id: string;
}

export interface EventContext<T = any> {
    data: T;
    metadata: EventMetadata;
    preventDefault(): void;
    stopPropagation(): void;
}

/**
 * 事件总线类
 */
export class EventBus {
    private listeners = new Map<string, Set<EventListener>>();
    private onceListeners = new Map<string, Set<EventListener>>();
    private eventHistory: Array<{ event: string; data: any; metadata: EventMetadata }> = [];
    private maxHistorySize = 1000;
    private disposed = false;

    constructor() {}

    /**
     * 订阅事件
     * @param event 事件名称
     * @param listener 事件监听器
     * @returns 取消订阅的函数
     */
    on<T = any>(event: string, listener: EventListener<T>): EventUnsubscriber {
        if (this.disposed) {
            throw new Error('EventBus has been disposed');
        }

        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(listener);

        // 返回取消订阅函数
        return () => this.off(event, listener);
    }

    /**
     * 一次性订阅事件
     * @param event 事件名称
     * @param listener 事件监听器
     * @returns 取消订阅的函数
     */
    once<T = any>(event: string, listener: EventListener<T>): EventUnsubscriber {
        if (this.disposed) {
            throw new Error('EventBus has been disposed');
        }

        if (!this.onceListeners.has(event)) {
            this.onceListeners.set(event, new Set());
        }
        this.onceListeners.get(event)!.add(listener);

        return () => this.onceListeners.get(event)?.delete(listener);
    }

    /**
     * 取消订阅事件
     * @param event 事件名称
     * @param listener 事件监听器
     */
    off<T = any>(event: string, listener: EventListener<T>): void {
        this.listeners.get(event)?.delete(listener);
        this.onceListeners.get(event)?.delete(listener);
    }

    /**
     * 发布事件
     * @param event 事件名称
     * @param data 事件数据
     * @param source 事件源标识
     */
    async emit<T = any>(event: string, data?: T, source?: string): Promise<void> {
        if (this.disposed) {
            return;
        }

        const metadata: EventMetadata = {
            timestamp: Date.now(),
            source,
            id: this.generateEventId()
        };

        // 记录事件历史
        this.recordEvent(event, data, metadata);

        // 创建事件上下文
        let defaultPrevented = false;
        let propagationStopped = false;

        const context: EventContext<T> = {
            data: data!,
            metadata,
            preventDefault: () => { defaultPrevented = true; },
            stopPropagation: () => { propagationStopped = true; }
        };

        try {
            // 处理普通监听器
            const regularListeners = this.listeners.get(event);
            if (regularListeners && !propagationStopped) {
                await this.executeListeners(Array.from(regularListeners), context);
            }

            // 处理一次性监听器
            const onceListeners = this.onceListeners.get(event);
            if (onceListeners && !propagationStopped) {
                await this.executeListeners(Array.from(onceListeners), context);
                // 清除一次性监听器
                this.onceListeners.delete(event);
            }

        } catch (error) {
            console.error(`Error executing listeners for event '${event}':`, error);
            // 发布错误事件
            if (event !== 'error') {
                this.emit('error', {
                    originalEvent: event,
                    originalData: data,
                    error,
                    metadata
                }, 'EventBus');
            }
        }
    }

    /**
     * 执行监听器列表
     */
    private async executeListeners<T>(listeners: EventListener<T>[], context: EventContext<T>): Promise<void> {
        const promises: Promise<void>[] = [];

        for (const listener of listeners) {
            try {
                const result = listener(context.data);
                if (result instanceof Promise) {
                    promises.push(result);
                }
            } catch (error) {
                console.error('Synchronous listener error:', error);
            }
        }

        // 等待所有异步监听器完成
        if (promises.length > 0) {
            await Promise.allSettled(promises);
        }
    }

    /**
     * 生成事件ID
     */
    private generateEventId(): string {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 记录事件历史
     */
    private recordEvent(event: string, data: any, metadata: EventMetadata): void {
        this.eventHistory.push({ event, data, metadata });
        
        // 限制历史记录大小
        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory.shift();
        }
    }

    /**
     * 获取事件历史
     */
    getEventHistory(limit?: number): Array<{ event: string; data: any; metadata: EventMetadata }> {
        if (limit) {
            return this.eventHistory.slice(-limit);
        }
        return [...this.eventHistory];
    }

    /**
     * 清除事件历史
     */
    clearHistory(): void {
        this.eventHistory = [];
    }

    /**
     * 获取监听器统计信息
     */
    getListenerStats(): { [event: string]: { regular: number; once: number } } {
        const stats: { [event: string]: { regular: number; once: number } } = {};

        // 统计普通监听器
        for (const [event, listeners] of this.listeners) {
            if (!stats[event]) {
                stats[event] = { regular: 0, once: 0 };
            }
            stats[event].regular = listeners.size;
        }

        // 统计一次性监听器
        for (const [event, listeners] of this.onceListeners) {
            if (!stats[event]) {
                stats[event] = { regular: 0, once: 0 };
            }
            stats[event].once = listeners.size;
        }

        return stats;
    }

    /**
     * 移除所有监听器
     */
    removeAllListeners(event?: string): void {
        if (event) {
            this.listeners.delete(event);
            this.onceListeners.delete(event);
        } else {
            this.listeners.clear();
            this.onceListeners.clear();
        }
    }

    /**
     * 获取事件监听器数量
     */
    listenerCount(event: string): number {
        const regular = this.listeners.get(event)?.size || 0;
        const once = this.onceListeners.get(event)?.size || 0;
        return regular + once;
    }

    /**
     * 销毁事件总线
     */
    dispose(): void {
        if (this.disposed) {
            return;
        }

        this.removeAllListeners();
        this.clearHistory();
        this.disposed = true;
    }
}

/**
 * 全局事件总线实例
 */
export const globalEventBus = new EventBus();

/**
 * 事件常量定义
 */
export const FormFlowEvents = {
    // 插件生命周期事件
    PLUGIN_LOADED: 'plugin:loaded',
    PLUGIN_UNLOADED: 'plugin:unloaded',
    
    // 表单事件
    FORM_OPENED: 'form:opened',
    FORM_CLOSED: 'form:closed',
    FORM_SUBMITTED: 'form:submitted',
    FORM_VALIDATED: 'form:validated',
    FORM_ERROR: 'form:error',
    
    // 文件事件
    FILE_CREATED: 'file:created',
    FILE_UPDATED: 'file:updated',
    FILE_DELETED: 'file:deleted',
    
    // 服务事件
    SERVICE_INITIALIZED: 'service:initialized',
    SERVICE_ERROR: 'service:error',
    
    // 性能事件
    PERFORMANCE_METRIC: 'performance:metric',
    PERFORMANCE_WARNING: 'performance:warning',
    
    // 通用错误事件
    ERROR: 'error'
} as const;