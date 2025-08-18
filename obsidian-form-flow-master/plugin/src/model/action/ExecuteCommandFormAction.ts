import { FormActionType } from "../enums/FormActionType";
import { IFormAction } from "./IFormAction";

export interface ExecuteCommandFormAction extends IFormAction {
    type: FormActionType.EXECUTE_COMMAND;
    commandId: string;
}
