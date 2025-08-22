import { HTMLAttributes, useState, useRef, useMemo, useEffect, useCallback } from "react";
import React from "react";
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
import { debugManager } from "src/utils/DebugManager";
import { FieldValidationUtils } from "src/utils/FieldValidationUtils";

type Props = {
	fields?: IFormField[]; // 保持向后兼容
	formConfig?: FormConfig; // 新增：完整的表单配置
	onSubmit: (values: FormIdValues) => Promise<void>;
	afterSubmit?: (values: FormIdValues) => void;
	prefilledData?: Map<string, any>; // 预填充数据
} & Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onSubmit">;

/**
 * 表单渲染视图组件 - 已优化性能
 * 使用React.memo、useCallback和useMemo减少不必要的重新渲染
 * 添加调试信息追踪性能问题
 */
function CpsFormRenderViewComponent(props: Props) {
	// 调试信息：记录CpsFormRenderView组件初始化
	debugManager.log('CpsFormRenderView', '组件初始化');
	debugManager.logObject('CpsFormRenderView', 'props', props);
	debugManager.logObject('CpsFormRenderView', 'formConfig', props.formConfig);
	debugManager.logObject('CpsFormRenderView', 'prefilledData', props.prefilledData);
	debugManager.log('CpsFormRenderView', 'prefilledData 是否存在:', !!props.prefilledData);
	debugManager.log('CpsFormRenderView', 'prefilledData 大小:', props.prefilledData ? props.prefilledData.size : 0);
	if (props.prefilledData && props.prefilledData.size > 0) {
		debugManager.log('CpsFormRenderView', 'prefilledData 详细内容:');
		props.prefilledData.forEach((value, key) => {
			debugManager.log('CpsFormRenderView', `  字段 '${key}':`, value);
		});
	}
	
	const { fields: propsFields, formConfig, onSubmit, afterSubmit, prefilledData, className, ...rest } = props;
	
	// 从formConfig或props中获取fields
	const fields = formConfig?.fields || propsFields || [];
	
	// 调试信息：记录字段信息
	debugManager.log('CpsFormRenderView', '表单字段总数:', fields.length);
	debugManager.logObject('CpsFormRenderView', '表单字段列表', fields.map(f => ({id: f.id, label: f.label, type: f.type, defaultValue: f.defaultValue})));
	
	/**
	 * 创建包含预填充数据的初始表单值
	 * 使用useCallback优化性能
	 */
	const createInitialFormValues = useCallback((): FormIdValues => {
		const defaultValues = resolveDefaultFormIdValues(fields);
		
		// 调试信息：记录默认值
		debugManager.logObject('CpsFormRenderView', '字段默认值', defaultValues);
		
		// 如果有预填充数据，合并到默认值中
		if (prefilledData) {
			debugManager.log('CpsFormRenderView', '开始处理预填充数据');
			for (const [fieldId, value] of prefilledData.entries()) {
				defaultValues[fieldId] = value;
				debugManager.log('CpsFormRenderView', `预填充字段 '${fieldId}' 值:`, value);
			}
			debugManager.logObject('CpsFormRenderView', '预填充处理完成，最终表单值', defaultValues);
		}
		
		return defaultValues;
	}, [fields, prefilledData]);
	
	const [formIdValues, setFormIdValues] = useState<FormIdValues>(
		createInitialFormValues()
	);

	// 监听预填充数据变化，更新表单值
	useEffect(() => {
		debugManager.log('CpsFormRenderView', 'useEffect: prefilledData 发生变化');
		debugManager.logObject('CpsFormRenderView', 'useEffect: 新的 prefilledData', prefilledData);
		const newFormValues = createInitialFormValues();
		setFormIdValues(newFormValues);
		debugManager.logObject('CpsFormRenderView', 'useEffect: 更新后的表单值', newFormValues);
	}, [prefilledData, fields]); // 依赖prefilledData和fields的变化
	const [submitState, setSubmitState] = useState<SubmitState>({
		submitting: false,
		error: false,
		errorMessage: "",
	});
	const formRef = useRef<HTMLFormElement>(null);
	const settingRef = useRef<HTMLDivElement>(null);
	const submitButtonRef = useRef<HTMLButtonElement>(null);

	/**
	 * 优化的表单提交函数
	 * 使用useCallback避免不必要的重新创建
	 */
	const submit = useCallback(async () => {
		if (submitState.submitting) {
			return;
		}

		debugManager.log('CpsFormRenderView', '开始提交表单', formIdValues);

		setSubmitState({
			submitting: true,
			error: false,
			errorMessage: "",
		});

		try {
			await onSubmit(formIdValues);
			debugManager.log('CpsFormRenderView', '表单提交成功');
			setSubmitState({
				submitting: false,
				error: false,
				errorMessage: "",
			});
		} catch (e) {
			debugManager.error('CpsFormRenderView', '表单提交失败', e);
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
	}, [submitState.submitting, formIdValues, onSubmit, afterSubmit, formConfig?.showSubmitMessage, fields]);

	useAnotherKeyToSubmitForm(
		() => {
			onSubmit(formIdValues);
		},
		settingRef,
		formRef
	);
	useAutoFocus(formRef);

	/**
	 * 优化的值变更处理函数（柯里化版本）
	 * 返回指定字段的单参数回调，供子组件直接调用
	 * - 使用函数式 setState 避免闭包捕获旧状态
	 * - 在调试模式下输出详细日志，便于问题排查
	 */
	const createFieldValueChangeHandler = useCallback((fieldId: string) => {
		return (value: any) => {
			debugManager.log('CpsFormRenderView', '字段值变更', { fieldId, value });
			setFormIdValues((prev) => ({
				...prev,
				[fieldId]: value,
			}));
		};
	}, []);

	/**
	 * 检查字段是否有固定值
	 * @param field 表单字段
	 * @returns 是否有固定值
	 */
	const fieldHasFixedValue = useCallback((field: IFormField): boolean => {
		return FieldValidationUtils.fieldHasFixedValue(field, 'CpsFormRenderView');
	}, []);

	const visibleFields = useMemo(() => {
		// 调试信息：记录字段可见性计算开始
		debugManager.log('CpsFormRenderView', '===== 开始计算字段可见性 =====');
		debugManager.logObject('CpsFormRenderView', '当前表单值', formIdValues);
		debugManager.logObject('CpsFormRenderView', '预填充数据', prefilledData);
		
		// 首先获取可见字段
		const allVisibleFields = FormVisibilies.visibleFields(fields, formIdValues);
		debugManager.logObject('CpsFormRenderView', '所有可见字段', allVisibleFields.map(f => ({id: f.id, label: f.label, type: f.type})));
		
		// 根据动态表单显示逻辑过滤字段
		// 规则：只有没有固定值且没有有效预填充值的字段才需要用户输入
		const fieldsNeedingInput = allVisibleFields.filter(field => {
			const hasFixedValue = fieldHasFixedValue(field);
			const hasPrefilledValue = prefilledData && prefilledData.has(field.id);
			const prefilledValue = prefilledData ? prefilledData.get(field.id) : undefined;
			
			/**
			 * 检查预填充值是否为空
			 * @param value 预填充值
			 * @returns 是否为空
			 */
			const isEmptyPrefilledValue = (value: any): boolean => {
				return FieldValidationUtils.isEmptyPrefilledValue(value);
			};
			
			debugManager.log('CpsFormRenderView', `字段 '${field.label}' (${field.type}) - 固定值: ${hasFixedValue}, 预填充值: ${hasPrefilledValue}`);
			if (hasPrefilledValue) {
				debugManager.log('CpsFormRenderView', `字段 '${field.label}' 的预填充值:`, prefilledValue);
				debugManager.log('CpsFormRenderView', `字段 '${field.label}' 预填充值是否为空:`, isEmptyPrefilledValue(prefilledValue));
			}
			
			// 如果字段有固定值，则不需要用户输入
			if (hasFixedValue) {
				debugManager.log('CpsFormRenderView', `字段 '${field.label}' 有固定值，不显示在表单中`);
				return false;
			}
			
			// 如果字段有有效的预填充值，则不需要用户输入
			if (hasPrefilledValue && !isEmptyPrefilledValue(prefilledValue)) {
				debugManager.log('CpsFormRenderView', `字段 '${field.label}' 有有效预填充值，不显示在表单中`);
				return false;
			}
			
			debugManager.log('CpsFormRenderView', `字段 '${field.label}' 需要用户输入`);
			return true;
		});
		
		debugManager.logObject('CpsFormRenderView', '需要用户输入的字段', fieldsNeedingInput.map(f => ({id: f.id, label: f.label, type: f.type})));
		debugManager.log('CpsFormRenderView', '===== 字段可见性计算完成 =====');
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
							onValueChange={createFieldValueChangeHandler(field.id)}
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

// 使用React.memo优化组件性能，避免不必要的重新渲染
const CpsFormRenderViewMemo = React.memo(CpsFormRenderViewComponent, (prevProps, nextProps) => {
	// 自定义比较函数，只在关键属性变化时重新渲染
	return (
		prevProps.fields === nextProps.fields &&
		prevProps.formConfig === nextProps.formConfig &&
		prevProps.onSubmit === nextProps.onSubmit &&
		prevProps.afterSubmit === nextProps.afterSubmit &&
		prevProps.prefilledData === nextProps.prefilledData &&
		prevProps.className === nextProps.className
	);
});

export { CpsFormRenderViewMemo as CpsFormRenderView };
