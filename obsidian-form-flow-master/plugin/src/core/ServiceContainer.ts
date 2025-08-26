/**
 * 服务容器和依赖注入系统
 * 提供统一的服务管理、生命周期控制和依赖注入功能
 */

export interface ServiceDefinition<T = any> {
    factory: (container: ServiceContainer) => T;
    singleton: boolean;
    instance?: T;
    dependencies?: string[];
}

export interface IServiceContainer {
    register<T>(name: string, factory: (container: ServiceContainer) => T, singleton?: boolean): void;
    get<T>(name: string): T;
    has(name: string): boolean;
    dispose(): void;
}

/**
 * 装饰器函数用于标记依赖注入
 */
export function Inject(serviceName: string) {
    return function (target: any, propertyKey: string) {
        if (!target._injectedServices) {
            target._injectedServices = [];
        }
        target._injectedServices.push({ propertyKey, serviceName });
    };
}

/**
 * 服务容器类
 * 实现依赖注入、单例管理、生命周期控制
 */
export class ServiceContainer implements IServiceContainer {
    private static instance: ServiceContainer | null = null;
    private services = new Map<string, ServiceDefinition>();
    private circularDependencyDetection = new Set<string>();
    private disposed = false;

    private constructor() {}

    /**
     * 获取全局服务容器实例
     */
    static getInstance(): ServiceContainer {
        if (!ServiceContainer.instance) {
            ServiceContainer.instance = new ServiceContainer();
        }
        return ServiceContainer.instance;
    }

    /**
     * 重置服务容器实例（用于插件重新加载）
     */
    static resetInstance(): void {
        if (ServiceContainer.instance) {
            ServiceContainer.instance.dispose();
            ServiceContainer.instance = null;
        }
    }

    /**
     * 注册服务
     * @param name 服务名称
     * @param factory 服务工厂函数
     * @param singleton 是否为单例模式（默认true）
     * @param dependencies 依赖的服务列表
     */
    register<T>(
        name: string, 
        factory: (container: ServiceContainer) => T,
        singleton: boolean = true,
        dependencies: string[] = []
    ): void {
        if (this.disposed) {
            throw new Error('ServiceContainer has been disposed');
        }

        this.services.set(name, {
            factory,
            singleton,
            dependencies,
            instance: undefined
        });
    }

    /**
     * 获取服务实例
     * @param name 服务名称
     * @returns 服务实例
     */
    get<T>(name: string): T {
        if (this.disposed) {
            throw new Error('ServiceContainer has been disposed');
        }

        // 检测循环依赖
        if (this.circularDependencyDetection.has(name)) {
            throw new Error(`Circular dependency detected for service: ${name}`);
        }

        const service = this.services.get(name);
        if (!service) {
            throw new Error(`Service not found: ${name}`);
        }

        // 如果是单例且已创建实例，直接返回
        if (service.singleton && service.instance) {
            return service.instance;
        }

        // 添加循环依赖检测
        this.circularDependencyDetection.add(name);

        try {
            // 先解析依赖
            if (service.dependencies) {
                for (const dep of service.dependencies) {
                    this.get(dep);
                }
            }

            // 创建实例
            const instance = service.factory(this);

            // 处理属性注入
            this.injectDependencies(instance);

            // 如果是单例，缓存实例
            if (service.singleton) {
                service.instance = instance;
            }

            return instance;
        } finally {
            // 移除循环依赖检测
            this.circularDependencyDetection.delete(name);
        }
    }

    /**
     * 检查是否存在指定服务
     * @param name 服务名称
     */
    has(name: string): boolean {
        return this.services.has(name);
    }

    /**
     * 注入依赖到实例属性
     */
    private injectDependencies(instance: any): void {
        const injectedServices = instance.constructor.prototype._injectedServices;
        if (injectedServices) {
            for (const { propertyKey, serviceName } of injectedServices) {
                instance[propertyKey] = this.get(serviceName);
            }
        }
    }

    /**
     * 获取所有注册的服务信息
     */
    getServiceInfo(): Array<{ name: string; singleton: boolean; hasInstance: boolean; dependencies: string[] }> {
        return Array.from(this.services.entries()).map(([name, service]) => ({
            name,
            singleton: service.singleton,
            hasInstance: service.singleton && !!service.instance,
            dependencies: service.dependencies || []
        }));
    }

    /**
     * 清理特定服务
     * @param name 服务名称
     */
    clearService(name: string): void {
        const service = this.services.get(name);
        if (service && service.instance) {
            // 如果服务有dispose方法，调用它
            if (typeof service.instance.dispose === 'function') {
                service.instance.dispose();
            }
            service.instance = undefined;
        }
    }

    /**
     * 销毁容器，清理所有服务实例
     */
    dispose(): void {
        if (this.disposed) {
            return;
        }

        // 按依赖关系逆序销毁服务
        const serviceNames = Array.from(this.services.keys());
        const disposalOrder = this.calculateDisposalOrder(serviceNames);

        for (const serviceName of disposalOrder) {
            this.clearService(serviceName);
        }

        this.services.clear();
        this.circularDependencyDetection.clear();
        this.disposed = true;
    }

    /**
     * 计算服务销毁顺序（依赖图的拓扑排序）
     */
    private calculateDisposalOrder(serviceNames: string[]): string[] {
        const visited = new Set<string>();
        const result: string[] = [];

        const visit = (name: string) => {
            if (visited.has(name)) {
                return;
            }
            visited.add(name);

            const service = this.services.get(name);
            if (service?.dependencies) {
                for (const dep of service.dependencies) {
                    if (serviceNames.includes(dep)) {
                        visit(dep);
                    }
                }
            }

            result.push(name);
        };

        for (const name of serviceNames) {
            visit(name);
        }

        // 返回逆序，先销毁依赖者，再销毁被依赖者
        return result.reverse();
    }

    /**
     * 批量注册服务
     */
    registerBatch(services: Array<{
        name: string;
        factory: (container: ServiceContainer) => any;
        singleton?: boolean;
        dependencies?: string[];
    }>): void {
        for (const service of services) {
            this.register(
                service.name,
                service.factory,
                service.singleton,
                service.dependencies
            );
        }
    }
}

/**
 * 获取全局服务容器实例的便捷函数
 */
export const serviceContainer = () => ServiceContainer.getInstance();