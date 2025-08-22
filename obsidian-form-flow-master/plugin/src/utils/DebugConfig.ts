import { debugManager } from './DebugManager';

/**
 * 调试模块枚举
 */
export enum DebugModule {
    FORM_SERVICE = 'FormService',
    FORM_SCRIPT = 'FormScript',
    AI_SERVICE = 'AIService',
    FILE_OPERATION = 'FileOperation',
    CONTEXT_MENU = 'ContextMenu',
    FORM_INTEGRATION = 'FormIntegration',
    CONTENT_CLEANUP = 'ContentCleanup',
    VALIDATION = 'Validation',
    TEMPLATE_ENGINE = 'TemplateEngine',
    ERROR_HANDLER = 'ErrorHandler',
    PERFORMANCE = 'Performance',
    NETWORK = 'Network',
    UI_COMPONENT = 'UIComponent',
    PLUGIN_CORE = 'PluginCore'
}

/**
 * 调试级别枚举
 */
export enum DebugLevel {
    NONE = 0,
    ERROR = 1,
    WARN = 2,
    INFO = 3,
    DEBUG = 4,
    VERBOSE = 5
}

/**
 * 调试配置接口
 */
export interface DebugConfiguration {
    globalEnabled: boolean;
    globalLevel: DebugLevel;
    moduleSettings: Record<DebugModule, {
        enabled: boolean;
        level: DebugLevel;
        logToConsole: boolean;
        logToFile: boolean;
        showTimestamp: boolean;
        showStackTrace: boolean;
    }>;
    performance: {
        enabled: boolean;
        trackMemory: boolean;
        trackTiming: boolean;
        slowOperationThreshold: number; // 毫秒
    };
    errorHandling: {
        enabled: boolean;
        captureStackTrace: boolean;
        logErrorHistory: boolean;
        maxErrorHistory: number;
    };
    output: {
        useColors: boolean;
        maxLogLength: number;
        truncateObjects: boolean;
        maxObjectDepth: number;
    };
}

/**
 * 默认调试配置
 */
const DEFAULT_DEBUG_CONFIG: DebugConfiguration = {
    globalEnabled: false,
    globalLevel: DebugLevel.INFO,
    moduleSettings: Object.values(DebugModule).reduce((acc, module) => {
        acc[module] = {
            enabled: false,
            level: DebugLevel.INFO,
            logToConsole: true,
            logToFile: false,
            showTimestamp: true,
            showStackTrace: false
        };
        return acc;
    }, {} as any),
    performance: {
        enabled: false,
        trackMemory: false,
        trackTiming: false,
        slowOperationThreshold: 1000
    },
    errorHandling: {
        enabled: true,
        captureStackTrace: true,
        logErrorHistory: true,
        maxErrorHistory: 100
    },
    output: {
        useColors: true,
        maxLogLength: 1000,
        truncateObjects: true,
        maxObjectDepth: 3
    }
};

/**
 * 调试配置管理器
 */
export class DebugConfigManager {
    private static instance: DebugConfigManager;
    private config: DebugConfiguration;
    private listeners: Array<(config: DebugConfiguration) => void> = [];

    private constructor() {
        this.config = { ...DEFAULT_DEBUG_CONFIG };
        this.loadFromStorage();
    }

    /**
     * 获取单例实例
     */
    static getInstance(): DebugConfigManager {
        if (!DebugConfigManager.instance) {
            DebugConfigManager.instance = new DebugConfigManager();
        }
        return DebugConfigManager.instance;
    }

    /**
     * 获取当前配置
     */
    getConfig(): DebugConfiguration {
        return { ...this.config };
    }

    /**
     * 更新配置
     */
    updateConfig(updates: Partial<DebugConfiguration>): void {
        this.config = { ...this.config, ...updates };
        this.saveToStorage();
        this.notifyListeners();
        this.applyConfig();
    }

    /**
     * 启用/禁用全局调试
     */
    setGlobalDebug(enabled: boolean): void {
        this.updateConfig({ globalEnabled: enabled });
    }

    /**
     * 设置全局调试级别
     */
    setGlobalLevel(level: DebugLevel): void {
        this.updateConfig({ globalLevel: level });
    }

    /**
     * 启用/禁用特定模块调试
     */
    setModuleDebug(module: DebugModule, enabled: boolean): void {
        const moduleSettings = { ...this.config.moduleSettings };
        moduleSettings[module] = { ...moduleSettings[module], enabled };
        this.updateConfig({ moduleSettings });
    }

    /**
     * 设置模块调试级别
     */
    setModuleLevel(module: DebugModule, level: DebugLevel): void {
        const moduleSettings = { ...this.config.moduleSettings };
        moduleSettings[module] = { ...moduleSettings[module], level };
        this.updateConfig({ moduleSettings });
    }

    /**
     * 检查模块是否启用调试
     */
    isModuleEnabled(module: DebugModule): boolean {
        if (!this.config.globalEnabled) {
            return false;
        }
        return this.config.moduleSettings[module]?.enabled || false;
    }

    /**
     * 检查是否应该记录特定级别的日志
     */
    shouldLog(module: DebugModule, level: DebugLevel): boolean {
        if (!this.isModuleEnabled(module)) {
            return false;
        }
        
        const moduleLevel = this.config.moduleSettings[module]?.level || DebugLevel.INFO;
        const globalLevel = this.config.globalLevel;
        
        return level <= Math.min(moduleLevel, globalLevel);
    }

    /**
     * 启用性能监控
     */
    setPerformanceMonitoring(enabled: boolean): void {
        const performance = { ...this.config.performance, enabled };
        this.updateConfig({ performance });
    }

    /**
     * 设置慢操作阈值
     */
    setSlowOperationThreshold(threshold: number): void {
        const performance = { ...this.config.performance, slowOperationThreshold: threshold };
        this.updateConfig({ performance });
    }

    /**
     * 重置为默认配置
     */
    resetToDefault(): void {
        this.config = { ...DEFAULT_DEBUG_CONFIG };
        this.saveToStorage();
        this.notifyListeners();
        this.applyConfig();
    }

    /**
     * 导出配置
     */
    exportConfig(): string {
        return JSON.stringify(this.config, null, 2);
    }

    /**
     * 导入配置
     */
    importConfig(configJson: string): boolean {
        try {
            const importedConfig = JSON.parse(configJson);
            this.validateConfig(importedConfig);
            this.config = { ...DEFAULT_DEBUG_CONFIG, ...importedConfig };
            this.saveToStorage();
            this.notifyListeners();
            this.applyConfig();
            return true;
        } catch (error) {
            console.error('Failed to import debug config:', error);
            return false;
        }
    }

    /**
     * 添加配置变更监听器
     */
    addListener(listener: (config: DebugConfiguration) => void): void {
        this.listeners.push(listener);
    }

    /**
     * 移除配置变更监听器
     */
    removeListener(listener: (config: DebugConfiguration) => void): void {
        const index = this.listeners.indexOf(listener);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }

    /**
     * 获取调试统计信息
     */
    getDebugStats(): Record<string, any> {
        const enabledModules = Object.entries(this.config.moduleSettings)
            .filter(([_, settings]) => settings.enabled)
            .map(([module, _]) => module);

        return {
            globalEnabled: this.config.globalEnabled,
            globalLevel: DebugLevel[this.config.globalLevel],
            enabledModules,
            enabledModuleCount: enabledModules.length,
            totalModules: Object.keys(this.config.moduleSettings).length,
            performanceMonitoring: this.config.performance.enabled,
            errorHandling: this.config.errorHandling.enabled
        };
    }

    /**
     * 从存储加载配置
     */
    private loadFromStorage(): void {
        try {
            const stored = localStorage.getItem('formflow-debug-config');
            if (stored) {
                const parsedConfig = JSON.parse(stored);
                this.config = { ...DEFAULT_DEBUG_CONFIG, ...parsedConfig };
            }
        } catch (error) {
            console.warn('Failed to load debug config from storage:', error);
        }
    }

    /**
     * 保存配置到存储
     */
    private saveToStorage(): void {
        try {
            localStorage.setItem('formflow-debug-config', JSON.stringify(this.config));
        } catch (error) {
            console.warn('Failed to save debug config to storage:', error);
        }
    }

    /**
     * 通知监听器
     */
    private notifyListeners(): void {
        this.listeners.forEach(listener => {
            try {
                listener(this.config);
            } catch (error) {
                console.error('Error in debug config listener:', error);
            }
        });
    }

    /**
     * 应用配置到调试管理器
     */
    private applyConfig(): void {
        // 更新 debugManager 的设置
        debugManager.setDebugMode(this.config.globalEnabled);
        
        // 这里可以添加更多配置应用逻辑
    }

    /**
     * 验证配置格式
     */
    private validateConfig(config: any): void {
        if (typeof config !== 'object' || config === null) {
            throw new Error('Config must be an object');
        }
        
        // 这里可以添加更详细的配置验证逻辑
    }
}

// 导出单例实例
export const debugConfig = DebugConfigManager.getInstance();

// 便捷函数
export const isDebugEnabled = (module: DebugModule) => debugConfig.isModuleEnabled(module);
export const shouldLog = (module: DebugModule, level: DebugLevel) => debugConfig.shouldLog(module, level);
export const setGlobalDebug = (enabled: boolean) => debugConfig.setGlobalDebug(enabled);
export const setModuleDebug = (module: DebugModule, enabled: boolean) => debugConfig.setModuleDebug(module, enabled);