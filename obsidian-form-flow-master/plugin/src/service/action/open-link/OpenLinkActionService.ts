import { IFormAction } from "src/model/action/IFormAction";
import { OpenLinkFormAction } from "src/model/action/OpenLinkFormAction";
import { FormActionType } from "src/model/enums/FormActionType";
import { FormTemplateProcessEngine } from "../../engine/FormTemplateProcessEngine";
import { ActionChain, ActionContext, IActionService } from "../IActionService";

export default class OpenLinkActionService implements IActionService {

    accept(action: IFormAction, context: ActionContext): boolean {
        return action.type === FormActionType.OPEN_LINK;
    }

    async run(action: IFormAction, context: ActionContext, chain: ActionChain): Promise<void> {
        const formAction = action as OpenLinkFormAction;
        const engine = new FormTemplateProcessEngine();
        const app = context.app;
        
        // 处理链接中的变量
        let linkUrl = await engine.process(formAction.linkUrl, context.state, app, context.config);
        
        // 检查是否是内链格式 [[链接]]
        if (linkUrl.startsWith('[[') && linkUrl.endsWith(']]')) {
            // 处理内链
            const noteName = linkUrl.slice(2, -2); // 移除 [[ 和 ]]
            
            // 检查是否有显示文本 [[文件|显示文本]]
            const actualNoteName = noteName.includes('|') ? noteName.split('|')[0] : noteName;
            
            // 查找文件
            const file = app.metadataCache.getFirstLinkpathDest(actualNoteName, '');
            if (file) {
                // 在当前标签页打开内部文件
                const leaf = app.workspace.getLeaf(false);
                await leaf.openFile(file);
            } else {
                console.warn(`Internal link file not found: ${actualNoteName}`);
            }
        } else {
            // 处理外部链接
            window.open(linkUrl, '_blank');
        }
        
        // 继续执行下一个动作
        await chain.next(context);
    }
}
