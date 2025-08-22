import { FormFieldValue } from "../service/FormValues";

/**
 * 对象工具类
 */
export class Objects {
    /**
     * 检查对象是否存在（非null且非undefined）
     * @param obj 要检查的对象
     * @returns 是否存在
     */
    static exists(obj: FormFieldValue | any): boolean {
        return obj !== null && obj !== undefined;
    }

    /**
     * 检查对象是否为null或undefined
     * @param obj 要检查的对象
     * @returns 是否为null或undefined
     */
    static isNullOrUndefined(obj: FormFieldValue | any): boolean {
        return obj === null || obj === undefined;
    }
}