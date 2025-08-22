import { FormFieldType } from "../enums/FormFieldType";
import { IFormField } from "./IFormField";
import { FormFieldValue } from "../../service/FormValues";

export interface ISelectField extends IOptionsField {
    type: FormFieldType.SELECT;
    multiple?: boolean;
}

export interface IOptionsField extends IFormField {
    options: SelectOption[];
    enableCustomValue?: boolean;
}

/**
 * 选择项接口定义
 */
export interface SelectOption {
    id: string;
    label: string;
    value: FormFieldValue;
}