import { OperatorType } from "../../../../model/filter/OperatorType";
import { FormFieldValue } from "../../../../service/FormValues";

/**
 * 标准化过滤器值
 * @param operator 操作符类型
 * @param value 原始值
 * @returns 标准化后的值
 */
export function normalizeValue(operator: OperatorType, value: FormFieldValue): FormFieldValue {
	if (
		operator === OperatorType.Contains ||
		operator === OperatorType.NotContains
	) {
		// 对于包含操作，确保返回适当的数组类型
		if (Array.isArray(value)) {
			return value;
		}
		if (typeof value === 'string') {
			return [value];
		}
		if (typeof value === 'number') {
			return [value];
		}
		return value !== null && value !== undefined ? [String(value)] : [];
	}

	if (Array.isArray(value)) {
		if (value.length === 0) {
			return null;
		}
		// 确保返回的值符合 FormFieldValue 类型
		const firstValue = value[0];
		if (firstValue instanceof File) {
			// File 类型需要作为数组返回
			return [firstValue];
		}
		return firstValue;
	}

	return value;
}
