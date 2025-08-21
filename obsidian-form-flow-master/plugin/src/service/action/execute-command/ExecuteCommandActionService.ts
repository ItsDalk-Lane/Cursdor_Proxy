import { IFormAction } from "src/model/action/IFormAction";
import { ExecuteCommandFormAction } from "src/model/action/ExecuteCommandFormAction";
import { FormActionType } from "src/model/enums/FormActionType";
import { FormTemplateProcessEngine } from "../../engine/FormTemplateProcessEngine";
import { ActionChain, ActionContext, IActionService } from "../IActionService";
import { debugManager } from "../../../utils/DebugManager";

export default class ExecuteCommandActionService implements IActionService {

    accept(action: IFormAction, context: ActionContext): boolean {
        return action.type === FormActionType.EXECUTE_COMMAND;
    }

    async run(action: IFormAction, context: ActionContext, chain: ActionChain): Promise<void> {
        const formAction = action as ExecuteCommandFormAction;
        const engine = new FormTemplateProcessEngine();
        const app = context.app;
        
        // 处理命令ID中的变量
        const commandId = await engine.process(formAction.commandId, context.state, app, context.config);
        
        // 执行命令
        try {
            await app.commands.executeCommandById(commandId);
        } catch (error) {
            debugManager.error('ExecuteCommandAction', `Failed to execute command: ${commandId}`, error);
        }
        
        // 继续执行下一个动作
        await chain.next(context);
    }
}
