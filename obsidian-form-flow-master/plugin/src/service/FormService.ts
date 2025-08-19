import { App, TFile } from "obsidian";
import FormViewModal2 from "src/component/modal/FormViewModal2";
import { localInstance } from "src/i18n/locals";
import { showPromiseToast } from "../component/toast/PromiseToast";
import { ToastManager } from "../component/toast/ToastManager";
import { FormConfig } from "../model/FormConfig";
import { FormActionType } from "../model/enums/FormActionType";
import { FormFieldType } from "../model/enums/FormFieldType";
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
        await this.openForm(form, app);
    }

    async openForm(formConfig: FormConfig, app: App) {
        // 检查是否需要显示表单界面
        const shouldShowForm = this.shouldShowFormInterface(formConfig);
        
        if (!shouldShowForm) {
            // 直接提交表单
            const formService = new FormService();
            await formService.submitDirectly(formConfig, app);
        } else {
            // 显示表单界面
            const m = new FormViewModal2(app, {
                formConfig: formConfig,
            });
            m.open();
        }
    }

    /**
     * 判断是否需要显示表单界面
     * 规则：
     * 1. 如果启用了自动提交且所有字段都有固定值，则不显示表单
     * 2. 如果有任何字段需要用户输入，则显示表单
     * 3. 如果没有启用自动提交，则始终显示表单（除非所有字段都有固定值）
     */
    private shouldShowFormInterface(formConfig: FormConfig): boolean {
        // 如果没有字段，直接执行
        if (!formConfig.fields || formConfig.fields.length === 0) {
            return false;
        }

        // 检查每个字段是否有固定值
        const fieldsNeedingInput: any[] = [];
        
        for (const field of formConfig.fields) {
            const hasFixedValue = this.fieldHasFixedValue(field);
            if (!hasFixedValue) {
                fieldsNeedingInput.push(field);
            }
        }

        // 如果所有字段都有固定值，不显示表单界面
        if (fieldsNeedingInput.length === 0) {
            return false;
        }

        // 如果启用了自动提交但还有字段需要输入，这种情况下显示表单
        // 因为用户需要填写这些字段
        return true;
    }

    /**
     * 检查字段是否有固定值
     */
    private fieldHasFixedValue(field: any): boolean {
        // 根据不同字段类型检查是否有默认值或固定值
        switch (field.type) {
            case FormFieldType.TEXT:
            case FormFieldType.TEXTAREA:
            case FormFieldType.PASSWORD:
                return !!(field.defaultValue && field.defaultValue.trim());
            
            case FormFieldType.NUMBER:
                return field.defaultValue !== undefined && field.defaultValue !== null;
            
            case FormFieldType.CHECKBOX:
                return field.defaultValue !== undefined;
            
            case FormFieldType.RADIO:
            case FormFieldType.SELECT:
                return !!(field.defaultValue && field.defaultValue.trim());
            
            case FormFieldType.DATE:
            case FormFieldType.TIME:
            case FormFieldType.DATETIME:
                return !!(field.defaultValue && field.defaultValue.trim());
            
            case FormFieldType.FILE_LIST:
                return !!(field.defaultValue && 
                    ((Array.isArray(field.defaultValue) && field.defaultValue.length > 0) ||
                     (typeof field.defaultValue === 'string' && field.defaultValue.trim())));
            
            case FormFieldType.AI_MODEL_LIST:
                // AI模型字段如果有预选择的模型ID或自动选择第一个，则认为有固定值
                return !!(field.selectedModelId || field.autoSelectFirst);
            
            case FormFieldType.TEMPLATE_LIST:
                // 模板列表字段如果有预选择的模板文件或自动选择第一个，则认为有固定值
                return !!(field.selectedTemplateFile || field.autoSelectFirst);
            
            default:
                // 其他类型字段，检查是否有默认值
                return !!(field.defaultValue !== undefined && field.defaultValue !== null && 
                    (typeof field.defaultValue !== 'string' || field.defaultValue.trim()));
        }
    }
}