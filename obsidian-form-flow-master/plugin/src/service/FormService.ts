import { App, TFile } from "obsidian";
import FormViewModal2 from "src/component/modal/FormViewModal2";
import { localInstance } from "src/i18n/locals";
import { showPromiseToast } from "../component/toast/PromiseToast";
import { ToastManager } from "../component/toast/ToastManager";
import { FormConfig } from "../model/FormConfig";
import { FormActionType } from "../model/enums/FormActionType";
import { getActionsCompatible } from "../utils/getActionsCompatible";
import { resolveDefaultFormIdValues } from "../utils/resolveDefaultFormIdValues";
import { ActionChain, ActionContext } from "./action/IActionService";
import { FormVisibilies } from "./condition/FormVisibilies";
import { FormIdValues } from "./FormValues";
import { FormValidator } from "./validator/FormValidator";
import { AITimer } from "./ai/AITimerManager";

export interface FormSubmitOptions {
    app: App
}

export class FormService {

    async submit(idValues: FormIdValues, config: FormConfig, options: FormSubmitOptions): Promise<ActionContext> {
        const actions = getActionsCompatible(config);
        
        // 检查是否有AI调用动作
        const hasAIAction = actions.some(action => action.type === FormActionType.AI_CALL);
        
        if (hasAIAction) {
            console.log('检测到AI调用动作，启动计时器');
            AITimer.startTimer();
        }
        
        try {
            FormValidator.validate(config, idValues);
            const chain = new ActionChain(actions);
            const visibleIdValues = FormVisibilies.getVisibleIdValues(config.fields, idValues);
            const formLabelValues = FormVisibilies.toFormLabelValues(config.fields, idValues);
            const actionContext: ActionContext = {
                app: options.app,
                config: config,
                state: {
                    idValues: visibleIdValues,
                    values: formLabelValues,
                    outputVariables: {} // 初始化输出变量
                }
            }
            chain.validate(actionContext);
            // run all action sequentially
            await chain.next(actionContext);
            
            // 返回包含输出变量的上下文
            return actionContext;
        } finally {
            if (hasAIAction) {
                console.log('AI动作完成，停止计时器');
                AITimer.stopTimer();
            }
        }
    }

    async submitDirectly(formConfig: FormConfig, app: App): Promise<ActionContext> {
        try {
            const formIdValues = resolveDefaultFormIdValues(formConfig.fields);
            const context: FormSubmitOptions = {
                app: app,
            };
            const result = await this.submit(formIdValues, formConfig, context);
            
            // 根据配置决定是否显示提交信息
            if (formConfig.showSubmitMessage !== false) {
                ToastManager.success(localInstance.submit_success, 3000);
            }
            
            return result;
        } catch (e) {
            // 错误信息始终显示，因为这很重要
            ToastManager.error(e.message || localInstance.unknown_error, 5000);
            throw e;
        }
    }

    async open(file: TFile, app: App) {
        const form = await app.vault.readJson(file.path) as FormConfig;
        if (form.autoSubmit === true) {
            const formService = new FormService();
            await formService.submitDirectly(form, app);
        } else {
            const m = new FormViewModal2(app, {
                formFilePath: file.path,
            });
            m.open();
        }
    }

    async openForm(formConfig: FormConfig, app: App) {
        if (formConfig.autoSubmit === true) {
            const formService = new FormService();
            await formService.submitDirectly(formConfig, app);
        } else {
            const m = new FormViewModal2(app, {
                formConfig: formConfig,
            });
            m.open();
        }
    }
}