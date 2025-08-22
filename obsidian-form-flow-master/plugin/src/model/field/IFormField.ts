import { FormFieldType } from "../enums/FormFieldType";
import { ICheckboxField } from "./ICheckboxField";
import { IDateField } from "./time/IDateField";
import { IDateTimeField } from "./time/IDateTimeField";
import { INumberField } from "./INumberField";
import { IPasswordField } from "./IPasswordField";
import { IPropertyValueField } from "./IPropertyValueField";
import { IRadioField } from "./IRadioField";
import { ISelectField } from "./ISelectField";
import { ITextAreaField } from "./ITextAreaField";
import { ITextField } from "./ITextField";
import { IToggleField } from "./IToggleField";
import { IFileListField } from "./IFileListField";
import { AIModelListField } from "./AIModelListField";
import { TemplateListField } from "./TemplateListField";
import { Filter } from "../filter/Filter";
import { FormFieldValue } from "../../service/FormValues";

export interface IFormField {
    id: string;
    label: string;
    type: FormFieldType;
    placeholder?: string;
    description?: string;
    defaultValue?: FormFieldValue;
    required?: boolean;
    enableDescription?: boolean;
    condition?: Filter;
    rightClickSubmit?: boolean; // 新增：是否启用右键提交功能
}

export type FormField =
    | ITextField
    | ITextAreaField
    | IPasswordField
    | INumberField
    | IDateField
    | IDateTimeField
    | IDateTimeField
    | ICheckboxField
    | IToggleField
    | IRadioField
    | ISelectField
    | IPropertyValueField
    | IFileListField
    | AIModelListField
    | TemplateListField