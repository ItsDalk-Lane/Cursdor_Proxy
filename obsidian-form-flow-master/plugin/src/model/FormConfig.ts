import { v4 } from "uuid";
import { IFormAction } from "./action/IFormAction";
import { FormActionType } from "./enums/FormActionType";
import { IFormField } from "./field/IFormField";

export class FormConfig {
    id: string;
    fields: IFormField[];
    /**
     * @deprecated
     */
    action?: IFormAction;
    actions: IFormAction[];
    autoSubmit: boolean;
    showSubmitMessage: boolean; // 新增：控制是否显示提交信息

    constructor(id: string) {
        this.id = id;
        this.fields = [];
        const createFileAction = {
            id: v4(),
            type: FormActionType.CREATE_FILE,
            targetFolder: "",
            fileName: "",
        }
        this.actions = [createFileAction];
        this.autoSubmit = false;
        this.showSubmitMessage = true; // 默认显示提交信息
    }
}
