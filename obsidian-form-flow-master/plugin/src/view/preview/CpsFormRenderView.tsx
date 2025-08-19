import { HTMLAttributes, useState, useRef, useMemo } from "react";
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
} & Omit<HTMLAttributes<HTMLDivElement>, "defaultValue">;

export function CpsFormRenderView(props: Props) {
	const { fields: propsFields, formConfig, onSubmit, afterSubmit, className, ...rest } = props;
	
	// 从formConfig或props中获取fields
	const fields = formConfig?.fields || propsFields || [];
	
	const [formIdValues, setFormIdValues] = useState<FormIdValues>(
		resolveDefaultFormIdValues(fields)
	);
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
                const aiField = field as any;
                console.log('检查AI模型字段固定值:', {
                    fieldId: field.id,
                    fieldType: field.type,
                    selectedModelId: aiField.selectedModelId,
                    autoSelectFirst: aiField.autoSelectFirst,
                    hasFixedValue: !!(aiField.selectedModelId || aiField.autoSelectFirst)
                });
                return !!(aiField.selectedModelId || aiField.autoSelectFirst);
            
            case FormFieldType.TEMPLATE_LIST:
                // 模板列表字段如果有预选择的模板文件或自动选择第一个，则认为有固定值
                const templateField = field as any;
                console.log('检查模板列表字段固定值:', {
                    fieldId: field.id,
                    fieldType: field.type,
                    selectedTemplateFile: templateField.selectedTemplateFile,
                    autoSelectFirst: templateField.autoSelectFirst,
                    hasFixedValue: !!(templateField.selectedTemplateFile || templateField.autoSelectFirst)
                });
                return !!(templateField.selectedTemplateFile || templateField.autoSelectFirst);
			
			default:
				// 其他类型字段，检查是否有默认值
				return !!(field.defaultValue !== undefined && field.defaultValue !== null && 
					(typeof field.defaultValue !== 'string' || field.defaultValue.trim()));
		}
	};

	const visibleFields = useMemo(() => {
		// 首先获取可见字段
		const allVisibleFields = FormVisibilies.visibleFields(fields, formIdValues);
		
		// 然后过滤出需要用户输入的字段（没有固定值的字段）
		const fieldsNeedingInput = allVisibleFields.filter(field => {
			return !fieldHasFixedValue(field);
		});
		
		return fieldsNeedingInput;
	}, [fields, formIdValues]);

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
