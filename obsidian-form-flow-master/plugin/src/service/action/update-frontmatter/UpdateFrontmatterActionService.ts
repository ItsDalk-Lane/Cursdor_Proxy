import { IFormAction } from "src/model/action/IFormAction";
import { UpdateFrontmatterFormAction } from "src/model/action/UpdateFrontmatterFormAction";
import { FormActionType } from "src/model/enums/FormActionType";
import { FormTemplateProcessEngine } from "src/service/engine/FormTemplateProcessEngine";
import { convertFrontmatterValue } from "src/utils/convertFrontmatterValue";
import { IActionService, ActionContext, ActionChain } from "../IActionService";
import { createFileFromActionIfNotExists } from "../util/createFileFromActionIfNotExists";
import { getFilePathFromAction } from "../util/getFilePathFromAction";
import { validateFileName } from "../util/validateFileName";


export default class UpdateFrontmatterActionService implements IActionService {

    accept(action: IFormAction, context: ActionContext): boolean {
        return action.type === FormActionType.UPDATE_FRONTMATTER;
    }

    async run(action: UpdateFrontmatterFormAction, context: ActionContext, chain: ActionChain): Promise<void> {
        const app = context.app;
        const engien = new FormTemplateProcessEngine();
        await validateFileName(action, context);

        const formatted: {
            name: string;
            value: string | string[];
        }[] = []
        for (const property of action.propertyUpdates) {
            const processedName = await engien.process(property.name, context.state, app, context.config);
            const nameString = String(processedName);
            let value;
            if (Array.isArray(property.value)) {
                value = [];
                for (const item of property.value) {
                    const res = await engien.process(item, context.state, app, context.config);
                    if (Array.isArray(res)) {
                        value.push(...res.map(r => String(r)));
                    } else {
                        value.push(String(res));
                    }
                }
            } else {
                const processedValue = await engien.process(property.value, context.state, app, context.config);
                value = String(processedValue);
            }
            formatted.push({
                name: nameString,
                value: value,
            })
        }
        const filePath = await getFilePathFromAction(action, context);
        const file = await createFileFromActionIfNotExists(filePath, action, context);
        await app.fileManager.processFrontMatter(file, (frontmatter) => {
            for (const property of formatted) {
                frontmatter[property.name] = convertFrontmatterValue(app, property.name, property.value);
            }
        });

        await chain.next(context);
    }
}