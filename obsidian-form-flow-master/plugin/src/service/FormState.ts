import { FormIdValues, FormLabelValues } from "./FormValues";

export class FormState {
    idValues: FormIdValues;
    values: FormLabelValues;
    outputVariables?: Record<string, any>; // AI动作的输出变量
}
