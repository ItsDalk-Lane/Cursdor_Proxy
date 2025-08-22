import { Filter } from "src/model/filter/Filter";
import { OperatorType } from "src/model/filter/OperatorType";
import { FormFieldValue } from "../../../FormValues";
import { OperatorHandleContext, OperatorHandler } from "../OperatorHandler";

export class EqOperatorHandler implements OperatorHandler {

    accept(filter: Filter) {
        return filter.operator === OperatorType.Equals;
    }

    /**
     * 应用等于操作符
     * @param fieldValue 字段值
     * @param value 比较值
     * @param context 操作上下文
     * @returns 是否相等
     */
    apply(fieldValue: FormFieldValue, value: FormFieldValue, context: OperatorHandleContext): boolean {
        if (Array.isArray(fieldValue) && Array.isArray(value)) {
            if (fieldValue.length !== value.length) {
                return false;
            }
            // 使用 JSON.stringify 进行深度比较，避免类型错误
            const fieldValueStr = JSON.stringify(fieldValue.sort());
            const valueStr = JSON.stringify(value.sort());
            return fieldValueStr === valueStr;
        }

        return fieldValue === value;
    }

}
