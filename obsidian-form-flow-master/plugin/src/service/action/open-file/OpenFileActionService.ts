import { IFormAction } from "src/model/action/IFormAction";
import { OpenFileFormAction } from "src/model/action/OpenFileFormAction";
import { FormActionType } from "src/model/enums/FormActionType";
import { OpenPageInType } from "src/model/enums/OpenPageInType";
import { openFilePathDirectly } from "src/utils/openFilePathDirectly";
import { FormTemplateProcessEngine } from "../../engine/FormTemplateProcessEngine";
import { ActionChain, ActionContext, IActionService } from "../IActionService";

export default class OpenFileActionService implements IActionService {

    accept(action: IFormAction, context: ActionContext): boolean {
        return action.type === FormActionType.OPEN_FILE;
    }

    async run(action: IFormAction, context: ActionContext, chain: ActionChain): Promise<void> {
        const formAction = action as OpenFileFormAction;
        const engine = new FormTemplateProcessEngine();
        const app = context.app;
        
        // 处理文件路径中的变量
        const filePath = await engine.process(formAction.filePath, context.state, app, context.config);
        
        // 打开文件
        openFilePathDirectly(app, filePath, formAction.openPageIn || OpenPageInType.none);
        
        // 继续执行下一个动作
        await chain.next(context);
    }
}
