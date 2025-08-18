import { FormActionType } from "../enums/FormActionType";
import { IFormAction } from "./IFormAction";

export interface OpenLinkFormAction extends IFormAction {
    type: FormActionType.OPEN_LINK;
    linkUrl: string;
}
