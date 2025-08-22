import { FormFieldValue } from "../service/FormValues";

export class Strings {

    static isBlank(value: string | null | undefined): boolean {
        if (value === undefined) {
            return true;
        }
        if (value === null) {
            return true;
        }
        return value.trim() === "";
    }

    static isNotBlank(value: string | null | undefined): boolean {
        return !this.isBlank(value);
    }

    static isEmpty(value: string | null | undefined): boolean {
        if (value === undefined) {
            return true;
        }
        if (value === null) {
            return true;
        }
        return value.length === 0;
    }

    static isNotEmpty(v: string): boolean {
        return !this.isEmpty(v);
    }

    static defaultIfBlank(value: string | null | undefined, defaultValue: string): string {
        if (this.isBlank(value)) {
            return defaultValue;
        }
        return value!;
    }

    static defaultIfEmpty(value: string | null | undefined, defaultValue: string): string {
        if (this.isEmpty(value)) {
            return defaultValue;
        }
        return value!;
    }

    static isEmail(value: string | null | undefined) {
        if (this.isBlank(value)) {
            return false;
        }
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(value!);
    }

    static isStartsWith(value: string | null | undefined, prefixList: string[]): boolean {
        if (this.isBlank(value)) {
            return false;
        }
        if (!Array.isArray(prefixList) || prefixList.length === 0) {
            return false;
        }
        for (const prefix of prefixList) {
            if (value!.startsWith(prefix)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 安全地将值转换为小写字符串
     * @param value 输入值
     * @returns 小写字符串或原值
     */
    static safeToLowerCaseString(value: FormFieldValue): string {
        if (value === undefined || value === null) {
            return "";
        }

        // 如果是字符串类型，直接调用 toLowerCase
        if (typeof value === 'string') {
            return value.toLowerCase();
        }

        // 对于其他类型，先转换为字符串再转小写
        if (typeof value === 'number' || typeof value === 'boolean') {
            return value.toString().toLowerCase();
        }

        if (value instanceof Date) {
            return value.toISOString().toLowerCase();
        }

        if (Array.isArray(value)) {
            return value.join(', ').toLowerCase();
        }

        // 兜底处理：转换为字符串
        return String(value).toLowerCase();
    }
}