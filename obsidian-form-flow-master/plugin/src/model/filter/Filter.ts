import { OperatorType } from "./OperatorType";
import { FormFieldValue } from "../../service/FormValues";

/**
 * 过滤器接口定义
 */
export interface Filter {
	id: string;
	type: FilterType;
	operator: OperatorType;
	property?: string;
	value?: FormFieldValue;
	conditions: Filter[];
}

export enum FilterType {
	group = "group",
	filter = "filter",
	jsQuery = "jsQuery",
}
