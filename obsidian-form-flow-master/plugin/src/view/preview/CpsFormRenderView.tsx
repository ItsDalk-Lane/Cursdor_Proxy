import { HTMLAttributes, useState, useRef, useMemo, useEffect } from "react";
import { useAnotherKeyToSubmitForm } from "src/hooks/useAnotherKeyToSubmitForm";
import { useAutoFocus } from "src/hooks/useAutoFocus";
import { SubmitState } from "src/hooks/useSubmitForm";
import { localInstance } from "src/i18n/locals";
import { IFormField } from "src/model/field/IFormField";
import { TemplateListField } from "src/model/field/TemplateListField";
import { FormConfig } from "src/model/FormConfig";
import { FormFieldType } from "src/model/enums/FormFieldType";
import { FormVisibilies } from "src/service/condition/FormVisibilies";
import { FormIdValues } from "src/service/FormValues";
import { resolveDefaultFormIdValues } from "src/utils/resolveDefaultFormIdValues";
import ActionFlow from "../shared/action-flow/ActionFlow";
import { CpsFormFieldControl } from "../shared/control/CpsFormFieldControl";
import CpsForm from "../shared/CpsForm";
import CpsFormItem from "../shared/CpsFormItem";
import { ToastManager } from "../../component/toast/ToastManager";
import CpsFormButtonLoading from "./animation/CpsFormButtonLoading";
import CalloutBlock from "src/component/callout-block/CalloutBlock";

type Props = {
	fields?: IFormField[]; // 保持向后兼容
	formConfig?: FormConfig; // 新增：完整的表单配置
	onSubmit: (values: FormIdValues) => Promise<void>;
	afterSubmit?: (values: FormIdValues) => void;
	prefilledData?: Map<string, any>; // 预填充数据
} & Omit<HTMLAttributes<HTMLDivElement>, "defaultValue">;

export function CpsFormRenderView(props: Props) {
	// 调试信息：记录CpsFormRenderView组件初始化
	if ((window as any).FormFlowPlugin?.settings?.enableDebugLogging) {
		console.log('[CpsFormRenderView] 组件初始化');
		console.log('[CpsFormRenderView] props:', props);
		console.log('[CpsFormRenderView] formConfig:', props.formConfig);
		console.log('[CpsFormRenderView] prefilledData:', props.prefilledData);
		console.log('[CpsFormRenderView] prefilledData 是否存在:', !!props.prefilledData);
		console.log('[CpsFormRenderView] prefilledData 大小:', props.prefilledData ? props.prefilledData.size : 0);
		if (props.prefilledData && props.prefilledData.size > 0) {
			console.log('[CpsFormRenderView] prefilledData 详细内容:');
			props.prefilledData.forEach((value, key) => {
				console.log(`  字段 '${key}':`, value);
			});
		}
	}
	
	const { fields: propsFields, formConfig, onSubmit, afterSubmit, prefilledData, className, ...rest } = props;
	
	// 从formConfig或props中获取fields
	const fields = formConfig?.fields || propsFields || [];
	
	// 调试信息：记录字段信息
	if ((window as any).FormFlowPlugin?.settings?.enableDebugLogging) {
		console.log('[CpsFormRenderView] 表单字段总数:', fields.length);
		console.log('[CpsFormRenderView] 表单字段列表:', fields.map(f => ({id: f.id, label: f.label, type: f.type, defaultValue: f.defaultValue})));
	}
	
	/**
	 * 创建包含预填充数据的初始表单值
	 */
	const createInitialFormValues = (): FormIdValues => {
		const defaultValues = resolveDefaultFormIdValues(fields);
		
		// 调试信息：记录默认值
		if ((window as any).FormFlowPlugin?.settings?.enableDebugLogging) {
			console.log('[CpsFormRenderView] 字段默认值:', defaultValues);
		}
		
		// 如果有预填充数据，合并到默认值中
		if (prefilledData) {
			if ((window as any).FormFlowPlugin?.settings?.enableDebugLogging) {
				console.log('[CpsFormRenderView] 开始处理预填充数据');
			}
			for (const [fieldId, value] of prefilledData.entries()) {
				defaultValues[fieldId] = value;
				if ((window as any).FormFlowPlugin?.settings?.enableDebugLogging) {
					console.log(`[CpsFormRenderView] 预填充字段 '${fieldId}' 值:`, value);
				}
			}
			if ((window as any).FormFlowPlugin?.settings?.enableDebugLogging) {
				console.log('[CpsFormRenderView] 预填充处理完成，最终表单值:', defaultValues);
			}
		}
		
		return defaultValues;
	};
	
	const [formIdValues, setFormIdValues] = useState<FormIdValues>(
		createInitialFormValues()
	);

	// 监听预填充数据变化，更新表单值
	useEffect(() => {
		if ((window as any).FormFlowPlugin?.settings?.enableDebugLogging) {
			console.log('[CpsFormRenderView] useEffect: prefilledData 发生变化');
			console.log('[CpsFormRenderView] useEffect: 新的 prefilledData:', prefilledData);
		}
		const newFormValues = createInitialFormValues();
		setFormIdValues(newFormValues);
		if ((window as any).FormFlowPlugin?.settings?.enableDebugLogging) {
			console.log('[CpsFormRenderView] useEffect: 更新后的表单值:', newFormValues);
		}
	}, [prefilledData, fields]); // 依赖prefilledData和fields的变化
	const [submitState, setSubmitState] = useState<SubmitState>({
		submitting: false,
		error: false,
		errorMessage: "",
	});
	const formRef = useRef<HTMLFormElement>(null);
	const settingRef = useRef<HTMLDivElement>(null);
	const submitButtonRef = useRef<HTMLButtonElement>(null);

	const submit = async () => {
		if (submitState.submitting) {
			return;
		}

		setSubmitState({
			submitting: true,
			error: false,
			errorMessage: "",
		});

		try {
			await onSubmit(formIdValues);
			setSubmitState({
				submitting: false,
				error: false,
				errorMessage: "",
			});
		} catch (e) {
			setSubmitState({
				submitting: false,
				error: true,
				errorMessage: e?.message || localInstance.unknown_error,
			});
			ToastManager.error(e.message || localInstance.unknown_error, 3000);
			return;
		}
		afterSubmit?.(formIdValues);
		
		// 根据配置决定是否显示成功消息
		if (formConfig?.showSubmitMessage !== false) {
			ToastManager.success(localInstance.submit_success);
		}
		
		setFormIdValues(resolveDefaultFormIdValues(fields));
	};

	useAnotherKeyToSubmitForm(
		() => {
			onSubmit(formIdValues);
		},
		settingRef,
		formRef
	);
	useAutoFocus(formRef);

	/**
	 * 检查字段是否有固定值（与FormService中的逻辑保持一致）
	 */
	const fieldHasFixedValue = (field: IFormField): boolean => {
		console.log('=== DYNAMIC_DISPLAY_DEBUG: CpsFormRenderView.fieldHasFixedValue ===');
		console.log('字段信息:', {
			id: field.id,
			label: field.label,
			type: field.type,
			defaultValue: field.defaultValue
		});
		
		let hasFixedValue = false;
		
		switch (field.type) {
			case FormFieldType.TEXT:
			case FormFieldType.TEXTAREA:
			case FormFieldType.PASSWORD:
				hasFixedValue = !!(field.defaultValue && field.defaultValue.trim());
				console.log('文本类型字段固定值检查:', { hasFixedValue, defaultValue: field.defaultValue });
				break;
			
			case FormFieldType.NUMBER:
				hasFixedValue = field.defaultValue !== undefined && field.defaultValue !== null;
				console.log('数字类型字段固定值检查:', { hasFixedValue, defaultValue: field.defaultValue });
				break;
			
			case FormFieldType.CHECKBOX:
				hasFixedValue = field.defaultValue !== undefined;
				console.log('复选框类型字段固定值检查:', { hasFixedValue, defaultValue: field.defaultValue });
				break;
			
			case FormFieldType.RADIO:
			case FormFieldType.SELECT:
				hasFixedValue = !!(field.defaultValue && field.defaultValue.trim());
				console.log('选择类型字段固定值检查:', { hasFixedValue, defaultValue: field.defaultValue });
				break;
			
			case FormFieldType.DATE:
			case FormFieldType.TIME:
			case FormFieldType.DATETIME:
				hasFixedValue = !!(field.defaultValue && field.defaultValue.trim());
				console.log('日期时间类型字段固定值检查:', { hasFixedValue, defaultValue: field.defaultValue });
				break;
			
			case FormFieldType.FILE_LIST:
				hasFixedValue = !!(field.defaultValue && 
					((Array.isArray(field.defaultValue) && field.defaultValue.length > 0) ||
					 (typeof field.defaultValue === 'string' && field.defaultValue.trim())));
				console.log('文件列表类型字段固定值检查:', { hasFixedValue, defaultValue: field.defaultValue });
				break;
			
            case FormFieldType.AI_MODEL_LIST:
                // AI模型字段如果有预选择的模型ID、自动选择第一个或有默认值，则认为有固定值
                const aiField = field as any;
                hasFixedValue = !!(aiField.selectedModelId || aiField.autoSelectFirst || 
                    (field.defaultValue && field.defaultValue.trim()));
                console.log('AI模型列表字段固定值检查:', {
                    fieldId: field.id,
                    fieldLabel: field.label,
                    selectedModelId: aiField.selectedModelId,
                    autoSelectFirst: aiField.autoSelectFirst,
                    hasFixedValue: hasFixedValue,
                    formValue: formIdValues[field.id],
                    defaultValue: field.defaultValue
                });
                break;
            
            case FormFieldType.TEMPLATE_LIST:
                // 模板列表字段如果有预选择的模板文件、自动选择第一个或有默认值，则认为有固定值
                const templateField = field as any;
                hasFixedValue = !!(templateField.selectedTemplateFile || templateField.autoSelectFirst || 
                    (field.defaultValue && field.defaultValue.trim()));
                console.log('模板列表字段固定值检查:', {
                    fieldId: field.id,
                    fieldLabel: field.label,
                    selectedTemplateFile: templateField.selectedTemplateFile,
                    autoSelectFirst: templateField.autoSelectFirst,
                    hasFixedValue: hasFixedValue,
                    formValue: formIdValues[field.id],
                    defaultValue: field.defaultValue
                });
                break;
			
			default:
				// 其他类型字段，检查是否有默认值
				hasFixedValue = !!(field.defaultValue !== undefined && field.defaultValue !== null && 
					(typeof field.defaultValue !== 'string' || field.defaultValue.trim()));
				console.log('其他类型字段固定值检查:', { hasFixedValue, defaultValue: field.defaultValue });
				break;
		}
		
		console.log(`字段 '${field.label}' (${field.type}) 最终固定值结果:`, hasFixedValue);
		console.log('=== DYNAMIC_DISPLAY_DEBUG: 结束 ===\n');
		
		return hasFixedValue;
	};

	const visibleFields = useMemo(() => {
		// 调试信息：记录字段可见性计算开始
		if ((window as any).FormFlowPlugin?.settings?.enableDebugLogging) {
			console.log('[CpsFormRenderView] ===== 开始计算字段可见性 =====');
			console.log('[CpsFormRenderView] 当前表单值:', formIdValues);
			console.log('[CpsFormRenderView] 预填充数据:', prefilledData);
		}
		
		// 首先获取可见字段
		const allVisibleFields = FormVisibilies.visibleFields(fields, formIdValues);
		if ((window as any).FormFlowPlugin?.settings?.enableDebugLogging) {
			console.log('[CpsFormRenderView] 所有可见字段:', allVisibleFields.map(f => ({id: f.id, label: f.label, type: f.type})));
		}
		
		// 根据动态表单显示逻辑过滤字段
		// 规则：只有没有固定值且没有有效预填充值的字段才需要用户输入
		const fieldsNeedingInput = allVisibleFields.filter(field => {
			const hasFixedValue = fieldHasFixedValue(field);
			const hasPrefilledValue = prefilledData && prefilledData.has(field.id);
			const prefilledValue = prefilledData ? prefilledData.get(field.id) : undefined;
			
			// 检查预填充值是否为空
			const isEmptyPrefilledValue = (value: any): boolean => {
				if (value === undefined || value === null) {
					return true;
				}
				if (typeof value === 'string' && value.trim() === '') {
					return true;
				}
				if (Array.isArray(value) && value.length === 0) {
					return true;
				}
				return false;
			};
			
			if ((window as any).FormFlowPlugin?.settings?.enableDebugLogging) {
				console.log(`[CpsFormRenderView] 字段 '${field.label}' (${field.type}) - 固定值: ${hasFixedValue}, 预填充值: ${hasPrefilledValue}`);
				if (hasPrefilledValue) {
					console.log(`[CpsFormRenderView] 字段 '${field.label}' 的预填充值:`, prefilledValue);
					console.log(`[CpsFormRenderView] 字段 '${field.label}' 预填充值是否为空:`, isEmptyPrefilledValue(prefilledValue));
				}
			}
			
			// 如果字段有固定值，则不需要用户输入
			if (hasFixedValue) {
				if ((window as any).FormFlowPlugin?.settings?.enableDebugLogging) {
					console.log(`[CpsFormRenderView] 字段 '${field.label}' 有固定值，不显示在表单中`);
				}
				return false;
			}
			
			// 如果字段有有效的预填充值，则不需要用户输入
			if (hasPrefilledValue && !isEmptyPrefilledValue(prefilledValue)) {
				if ((window as any).FormFlowPlugin?.settings?.enableDebugLogging) {
					console.log(`[CpsFormRenderView] 字段 '${field.label}' 有有效预填充值，不显示在表单中`);
				}
				return false;
			}
			
			if ((window as any).FormFlowPlugin?.settings?.enableDebugLogging) {
				console.log(`[CpsFormRenderView] 字段 '${field.label}' 需要用户输入`);
			}
			return true;
		});
		
		if ((window as any).FormFlowPlugin?.settings?.enableDebugLogging) {
			console.log('[CpsFormRenderView] 需要用户输入的字段:', fieldsNeedingInput.map(f => ({id: f.id, label: f.label, type: f.type})));
			console.log('[CpsFormRenderView] ===== 字段可见性计算完成 =====');
		}
		return fieldsNeedingInput;
	}, [fields, formIdValues, prefilledData]);

	return (
		<form
			className="form--CpsFormPreview"
			ref={formRef}
			onSubmit={(e) => {
				e.preventDefault();
				submit();
			}}
			autoFocus={true}
		>
			<CpsForm
				ref={settingRef}
				className="form--CpsFormPreviewBody"
				layout="vertical"
			>
				{visibleFields.map((field, index) => (
					<CpsFormItem
						required={field.required}
						label={field.label}
						key={field.id}
						description={field.description}
					>
						<CpsFormFieldControl
							field={field}
							value={formIdValues[field.id]}
							autoFocus={index === 0}
							onValueChange={(value) => {
								const newValues = {
									...formIdValues,
									[field.id]: value,
								};
								setFormIdValues(newValues);
							}}
						/>
					</CpsFormItem>
				))}
				{fields.length === 0 && <ActionFlow />}
			</CpsForm>

			{submitState.error && (
				<CalloutBlock
					type="error"
					// title={localInstance.submit_failed}
					content={submitState.errorMessage}
					closeable={true}
					onClose={() => {
						setSubmitState({
							submitting: false,
							error: false,
							errorMessage: "",
						});
					}}
				/>
			)}

			<div className="form--CpsFormPreviewFooter">
				<button
					className="form--CpsFormSubmitButton mod-cta"
					type="submit"
					ref={submitButtonRef}
					disabled={submitState.submitting}
				>
					{submitState.submitting ? (
						<CpsFormButtonLoading size={18} />
					) : (
						<>
							{localInstance.submit}
							<span className="form--CpsFormSubmitButtonKey">
								↵
							</span>
						</>
					)}
				</button>
			</div>
		</form>
	);
}
