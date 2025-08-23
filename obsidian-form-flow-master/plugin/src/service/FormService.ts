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
import { debugManager } from "../utils/DebugManager";
import { FieldValidationUtils } from "../utils/FieldValidationUtils";
import { BaseService } from "./BaseService";

export interface FormSubmitOptions {
    app: App
}

export class FormService extends BaseService {
    
    constructor() {
        super('FormService');
    }

    async submit(idValues: FormIdValues, config: FormConfig, options: FormSubmitOptions): Promise<ActionContext> {
        const actions = getActionsCompatible(config);
        
        // 检查是否有AI调用动作
        const hasAIAction = actions.some(action => action.type === FormActionType.AI_CALL);
        
        if (hasAIAction) {

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
        const content = await app.vault.read(file);
        const form = JSON.parse(content) as FormConfig;
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
     * 打开表单并预填充指定字段的数据
     * @param formConfig 表单配置
     * @param prefilledData 预填充的数据，key为字段ID，value为字段值
     * @param app Obsidian应用实例
     * @param forceDirectExecution 是否强制直接执行（用于右键菜单等场景）
     */
    async openFormWithData(formConfig: FormConfig, prefilledData: Map<string, any>, app: App, forceDirectExecution: boolean = false) {
        this.forceDebugLogObject('打开表单并预填充数据', {
            formId: formConfig.id,
            prefilledFields: Array.from(prefilledData.keys()),
            forceDirectExecution: forceDirectExecution
        });
        
        // 如果强制直接执行，需要检查是否所有字段都有值（包括必填和非必填字段）
        if (forceDirectExecution) {
            this.forceDebugLog('强制直接执行表单，检查所有字段是否需要用户输入');
            
            // 使用shouldShowFormInterfaceWithData来检查是否需要显示表单界面
            // 这个方法会检查所有字段（包括必填和非必填）是否需要用户输入
            const shouldShowForm = this.shouldShowFormInterfaceWithData(formConfig, prefilledData);
            
            if (!shouldShowForm) {
                this.forceDebugLog('所有字段都有值，直接执行表单');
                const formIdValues = this.createFormIdValuesWithData(formConfig, prefilledData);
                const context: FormSubmitOptions = {
                    app: app,
                };
                const result = await this.submit(formIdValues, formConfig, context);
                
                // 根据配置决定是否显示提交信息
                if (formConfig.showSubmitMessage !== false) {
                    ToastManager.success(localInstance.submit_success, 3000);
                }
                
                return result;
            } else {
                this.forceDebugLog('存在字段需要用户输入，显示表单界面');
                // 有字段需要用户输入，显示表单界面
                const m = new FormViewModal2(app, {
                    formConfig: formConfig,
                    prefilledData: prefilledData
                });
                m.open();
                return;
            }
        }
        
        // 检查是否需要显示表单界面
        const shouldShowForm = this.shouldShowFormInterfaceWithData(formConfig, prefilledData);
        
        if (!shouldShowForm) {
            // 直接提交表单
            this.forceDebugLog('所有字段都有值，直接提交表单');
            const formIdValues = this.createFormIdValuesWithData(formConfig, prefilledData);
            const context: FormSubmitOptions = {
                app: app,
            };
            const result = await this.submit(formIdValues, formConfig, context);
            
            // 根据配置决定是否显示提交信息
            if (formConfig.showSubmitMessage !== false) {
                ToastManager.success(localInstance.submit_success, 3000);
            }
            
            return result;
        } else {
            // 显示表单界面并预填充数据
            this.forceDebugLog('显示表单界面并预填充数据');
            const m = new FormViewModal2(app, {
                formConfig: formConfig,
                prefilledData: prefilledData
            });
            m.open();
        }
    }

    /**
     * 判断是否需要显示表单界面
     * 规则：
     * 1. 如果所有字段都有固定值，则不显示表单
     * 2. 如果有任何字段需要用户输入，则显示表单
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

            } else {

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
     * 判断是否需要显示表单界面（考虑预填充数据）
     * @param formConfig 表单配置
     * @param prefilledData 预填充的数据
     */
    private shouldShowFormInterfaceWithData(formConfig: FormConfig, prefilledData: Map<string, any>): boolean {
        this.forceDebugLog('检查是否需要显示表单界面（含预填充数据）');
        
        // 如果没有字段，直接执行
        if (!formConfig.fields || formConfig.fields.length === 0) {
            this.forceDebugLog('没有字段，不显示表单');
            return false;
        }

        // 获取可见字段（考虑条件显示）
        const formIdValues = this.createFormIdValuesWithData(formConfig, prefilledData);
        const visibleFields = FormVisibilies.visibleFields(formConfig.fields, formIdValues);
        
        this.forceDebugLog(`可见字段数量: ${visibleFields.length}`);
        
        // 检查每个可见字段是否需要用户输入
        const fieldsNeedingInput: any[] = [];
        
        for (const field of visibleFields) {
            const hasFixedValue = this.fieldHasFixedValue(field);
            const hasPrefilledValue = prefilledData.has(field.id);
            const prefilledValue = prefilledData.get(field.id);
            
            this.forceDebugLog(`字段 '${field.label}' - 固定值: ${hasFixedValue}, 预填充值: ${hasPrefilledValue}, 必填: ${field.required}`);
            
            // 如果字段没有固定值，需要检查是否需要用户输入
            if (!hasFixedValue) {
                // 如果没有预填充值，或者预填充值为空，则需要用户输入
                if (!hasPrefilledValue || this.isEmptyValue(prefilledValue)) {
                    fieldsNeedingInput.push(field);
                    this.forceDebugLog(`字段 '${field.label}' 需要用户输入（无固定值且无有效预填充值）`);
                } else {
                    this.forceDebugLog(`字段 '${field.label}' 有预填充值，不需要用户输入`);
                }
            } else {
                this.forceDebugLog(`字段 '${field.label}' 有固定值，不需要用户输入`);
            }
        }

        // 如果所有可见字段都有值（固定值或有效预填充值），不显示表单界面
        if (fieldsNeedingInput.length === 0) {
            this.forceDebugLog('所有可见字段都有值，不显示表单');
            return false;
        }

        this.forceDebugLog(`有 ${fieldsNeedingInput.length} 个字段需要输入，显示表单`);
        return true;
    }

    /**
     * 创建包含预填充数据的表单值对象
     * @param formConfig 表单配置
     * @param prefilledData 预填充的数据
     */
    private createFormIdValuesWithData(formConfig: FormConfig, prefilledData: Map<string, any>): FormIdValues {
        this.forceDebugLog('创建包含预填充数据的表单值对象');
        
        // 先获取默认值
        const formIdValues = resolveDefaultFormIdValues(formConfig.fields);
        
        // 然后覆盖预填充的值
        prefilledData.forEach((value, fieldId) => {
            this.forceDebugLogObject(`设置字段 '${fieldId}' 的预填充值`, value);
            formIdValues[fieldId] = value;
        });
        
        return formIdValues;
    }

    /**
     * 检查字段是否有固定值
     */
    /**
     * 检查字段是否有固定值
     * @param field 表单字段
     * @returns 是否有固定值
     */
    private fieldHasFixedValue(field: any): boolean {
        return FieldValidationUtils.fieldHasFixedValue(field, 'FormService');
    }

    /**
     * 检查必填字段是否都有值（考虑预填充数据和固定值）
     * @param formConfig 表单配置
     * @param prefilledData 预填充的数据
     * @returns 是否所有必填字段都有值
     */
    private checkRequiredFieldsWithData(formConfig: FormConfig, prefilledData: Map<string, any>): boolean {
        this.forceDebugLog('检查必填字段是否都有值');
        
        if (!formConfig.fields || formConfig.fields.length === 0) {
            this.forceDebugLog('没有字段，返回true');
            return true;
        }

        // 获取可见字段（考虑条件显示）
        const formIdValues = this.createFormIdValuesWithData(formConfig, prefilledData);
        const visibleFields = FormVisibilies.visibleFields(formConfig.fields, formIdValues);
        
        // 检查每个可见的必填字段
        for (const field of visibleFields) {
            if (field.required) {
                const hasFixedValue = this.fieldHasFixedValue(field);
                const hasPrefilledValue = prefilledData.has(field.id);
                const prefilledValue = prefilledData.get(field.id);
                
                this.forceDebugLog(`检查必填字段 '${field.label}' - 固定值: ${hasFixedValue}, 预填充值: ${hasPrefilledValue}`);
                
                // 如果字段既没有固定值，也没有有效的预填充值
                if (!hasFixedValue && (!hasPrefilledValue || this.isEmptyValue(prefilledValue))) {
                    this.forceDebugLog(`必填字段 '${field.label}' 缺失值`);
                    return false;
                }
            }
        }
        
        this.forceDebugLog('所有必填字段都有值');
        return true;
    }

    /**
     * 检查值是否为空
     * @param value 要检查的值
     * @returns 是否为空
     */
    /**
     * 检查值是否为空（用于必填字段验证）
     * @param value 要检查的值
     * @returns 是否为空
     */
    private isEmptyValue(value: any): boolean {
        return FieldValidationUtils.isEmptyValue(value);
    }
}