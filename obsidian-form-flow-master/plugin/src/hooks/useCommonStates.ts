import { useState, useCallback } from 'react';

/**
 * 通用的开关状态Hook
 * 用于管理模态框、下拉框等组件的开关状态
 */
export function useToggle(initialValue: boolean = false) {
    const [value, setValue] = useState(initialValue);
    
    const toggle = useCallback(() => {
        setValue(prev => !prev);
    }, []);
    
    const setTrue = useCallback(() => {
        setValue(true);
    }, []);
    
    const setFalse = useCallback(() => {
        setValue(false);
    }, []);
    
    return {
        value,
        setValue,
        toggle,
        open: setTrue,
        close: setFalse,
        // 别名，用于不同场景
        isOpen: value,
        setIsOpen: setValue,
        show: setTrue,
        hide: setFalse,
        enable: setTrue,
        disable: setFalse
    };
}

/**
 * 加载状态Hook
 * 用于管理异步操作的加载状态
 */
export function useLoading(initialValue: boolean = false) {
    const [loading, setLoading] = useState(initialValue);
    
    const startLoading = useCallback(() => {
        setLoading(true);
    }, []);
    
    const stopLoading = useCallback(() => {
        setLoading(false);
    }, []);
    
    const withLoading = useCallback(async <T>(asyncFn: () => Promise<T>): Promise<T> => {
        startLoading();
        try {
            const result = await asyncFn();
            return result;
        } finally {
            stopLoading();
        }
    }, [startLoading, stopLoading]);
    
    return {
        loading,
        setLoading,
        startLoading,
        stopLoading,
        withLoading
    };
}

/**
 * 下拉框状态Hook
 * 统一管理下拉框的开关状态和活跃索引
 */
export function useDropdown(initialOpen: boolean = false, initialActiveIndex: number = -1) {
    const { value: isOpen, setValue: setIsOpen, toggle, open, close } = useToggle(initialOpen);
    const [activeIndex, setActiveIndex] = useState(initialActiveIndex);
    
    const resetActiveIndex = useCallback(() => {
        setActiveIndex(-1);
    }, []);
    
    const closeAndReset = useCallback(() => {
        close();
        resetActiveIndex();
    }, [close, resetActiveIndex]);
    
    return {
        isOpen,
        setIsOpen,
        toggle,
        open,
        close,
        activeIndex,
        setActiveIndex,
        resetActiveIndex,
        closeAndReset
    };
}

/**
 * 搜索状态Hook
 * 用于管理搜索框的查询状态和结果
 */
export function useSearch<T>(initialQuery: string = '') {
    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState<T[]>([]);
    const { loading, withLoading } = useLoading();
    
    const clearQuery = useCallback(() => {
        setQuery('');
    }, []);
    
    const clearResults = useCallback(() => {
        setResults([]);
    }, []);
    
    const clearAll = useCallback(() => {
        clearQuery();
        clearResults();
    }, [clearQuery, clearResults]);
    
    const search = useCallback(async (searchFn: (query: string) => Promise<T[]>) => {
        if (!query.trim()) {
            setResults([]);
            return;
        }
        
        return withLoading(async () => {
            const searchResults = await searchFn(query);
            setResults(searchResults);
            return searchResults;
        });
    }, [query, withLoading]);
    
    return {
        query,
        setQuery,
        results,
        setResults,
        loading,
        clearQuery,
        clearResults,
        clearAll,
        search
    };
}

/**
 * 表单状态Hook
 * 用于管理表单的通用状态
 */
export function useFormState<T>(initialState: T) {
    const [formState, setFormState] = useState<T>(initialState);
    const [isDirty, setIsDirty] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    const updateField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
        setFormState(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
        // 清除该字段的错误
        if (errors[field as string]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field as string];
                return newErrors;
            });
        }
    }, [errors]);
    
    const setFieldError = useCallback((field: string, error: string) => {
        setErrors(prev => ({ ...prev, [field]: error }));
    }, []);
    
    const clearFieldError = useCallback((field: string) => {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    }, []);
    
    const clearAllErrors = useCallback(() => {
        setErrors({});
    }, []);
    
    const reset = useCallback(() => {
        setFormState(initialState);
        setIsDirty(false);
        clearAllErrors();
    }, [initialState, clearAllErrors]);
    
    const hasErrors = Object.keys(errors).length > 0;
    
    return {
        formState,
        setFormState,
        updateField,
        isDirty,
        setIsDirty,
        errors,
        setErrors,
        setFieldError,
        clearFieldError,
        clearAllErrors,
        hasErrors,
        reset
    };
}

/**
 * 计时器状态Hook
 * 用于管理计时器相关状态
 */
export function useTimer(initialSeconds: number = 0, initialMilliseconds: number = 0) {
    const [seconds, setSeconds] = useState(initialSeconds);
    const [milliseconds, setMilliseconds] = useState(initialMilliseconds);
    const [isRunning, setIsRunning] = useState(false);
    
    const start = useCallback(() => {
        setIsRunning(true);
    }, []);
    
    const stop = useCallback(() => {
        setIsRunning(false);
    }, []);
    
    const reset = useCallback(() => {
        setSeconds(initialSeconds);
        setMilliseconds(initialMilliseconds);
        setIsRunning(false);
    }, [initialSeconds, initialMilliseconds]);
    
    const toggle = useCallback(() => {
        setIsRunning(prev => !prev);
    }, []);
    
    return {
        seconds,
        setSeconds,
        milliseconds,
        setMilliseconds,
        isRunning,
        setIsRunning,
        start,
        stop,
        reset,
        toggle
    };
}