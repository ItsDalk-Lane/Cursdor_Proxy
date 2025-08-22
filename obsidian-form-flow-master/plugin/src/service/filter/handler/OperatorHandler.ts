import { Filter } from "src/model/filter/Filter";
import { FormFieldValue } from "../../FormValues";

/**
 * 操作符处理器接口
 * 定义了过滤器操作符的处理逻辑
 */
export interface OperatorHandler {

    accept(filter: Filter): boolean;

    /**
     * 应用操作符逻辑
     * @param fieldValue 字段值
     * @param value 比较值
     * @param context 操作上下文
     * @returns 是否匹配条件
     */
    apply(fieldValue: FormFieldValue, value: FormFieldValue, context: OperatorHandleContext): boolean;

}

export interface OperatorHandleContext {
    filter: Filter;
}