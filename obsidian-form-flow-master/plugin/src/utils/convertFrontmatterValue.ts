import { App } from "obsidian";
import { FormFieldValue } from "../service/FormValues";
import getPropertyTypeByName from "./getPropertyTypeByName";

/**
 * 转换前置元数据值
 * @param app Obsidian应用实例
 * @param name 属性名称
 * @param value 原始值
 * @returns 转换后的值
 */
export function convertFrontmatterValue(app: App, name: string, value: FormFieldValue): FormFieldValue {
    const t = getPropertyTypeByName(app, name)
    switch (t) {
        case "checkbox":
            return value === true || value === "true";
        case "number":
            return Number(value);
        default:
            return value;
    }
}