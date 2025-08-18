import { FormActionType } from "../enums/FormActionType";
import { OpenPageInType } from "../enums/OpenPageInType";
import { IFormAction } from "./IFormAction";

export interface OpenFileFormAction extends IFormAction {
    type: FormActionType.OPEN_FILE;
    filePath: string;
    openPageIn?: OpenPageInType;
}
