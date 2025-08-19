import { TFile } from "obsidian";
import { localInstance } from "src/i18n/locals";
import { ContentTemplateSource, CreateFileFormAction } from "src/model/action/CreateFileFormAction";
import { IFormAction } from "src/model/action/IFormAction";
import { FormActionType } from "src/model/enums/FormActionType";
import { OpenPageInType } from "src/model/enums/OpenPageInType";
import { createFileByText } from "src/utils/createFileByText";
import { openFilePathDirectly } from "src/utils/openFilePathDirectly";
import { FormTemplateProcessEngine } from "../../engine/FormTemplateProcessEngine";
import { ActionChain, ActionContext, IActionService } from "../IActionService";
import { getFilePathFromAction } from "../util/getFilePathFromAction";
import { validateFileName } from "../util/validateFileName";

export default class CreateFileActionService implements IActionService {

    accept(action: IFormAction, context: ActionContext): boolean {
        return action.type === FormActionType.CREATE_FILE;
    }

    async run(action: IFormAction, context: ActionContext, chain: ActionChain) {
        const formAction = action as CreateFileFormAction;
        const engine = new FormTemplateProcessEngine();
        const state = context.state;
        await validateFileName(formAction, context);

        const app = context.app;
        let formContent;
        if (formAction.contentTemplateSource === ContentTemplateSource.FILE) {
            const templateFilePath = formAction.templateFile ?? "";
            if (templateFilePath.trim() === "") {
                formContent = "";
            } else {
                const processedTemplateFilePath = await engine.process(templateFilePath, state, context.app, context.config);
                const templateFile = app.vault.getAbstractFileByPath(processedTemplateFilePath);
                if (!templateFile || !(templateFile instanceof TFile)) {
                    throw new Error(localInstance.template_file_not_exists + ": " + processedTemplateFilePath);
                }
                const templateContent = await app.vault.cachedRead(templateFile);
                formContent = await engine.process(templateContent, state, context.app, context.config);
            }
        } else {
            formContent = await engine.process(formAction.content ?? "", state, context.app, context.config);
        }

        const filePath = await getFilePathFromAction(formAction, context);
        const file = await createFileByText(app, filePath, formContent);
        openFilePathDirectly(app, filePath, formAction.openPageIn || OpenPageInType.none);

        // do next
        await chain.next(context);
    }

}