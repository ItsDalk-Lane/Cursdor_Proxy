import { App } from "obsidian";
import { FormFieldValue } from "../service/FormValues";
import { Objects } from "./Objects";
import getPropertyTypeByName from "./getPropertyTypeByName";
import { PropertyType } from "./PropertyType";

/**
 * 获取属性的所有可能值
 * @param app Obsidian应用实例
 * @param property 属性名称
 * @returns 属性值数组
 */
export function getPropertyValues(app: App, property: string): FormFieldValue[] {
    const values = app.metadataCache.getFrontmatterPropertyValuesForKey(property);
    if (!Objects.isNullOrUndefined(values) || values.length == 0) {
        const propType = getPropertyTypeByName(app, property);
        if (propType == PropertyType.checkbox) {
            return ["true", "false"];
        }
    }
    return values;
}