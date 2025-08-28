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

	// 监听预填充数据和字段变化，智能更新表单值
	useEffect(() => {
		debugManager.log('CpsFormRenderView', 'useEffect: prefilledData 或 fields 发生变化');
		debugManager.logObject('CpsFormRenderView', 'useEffect: 新的 prefilledData', prefilledData);
		
		// 智能合并：只更新新增字段或预填充数据变化的字段，保留用户已输入的内容
		setFormIdValues(prevValues => {
			const defaultValues = resolveDefaultFormIdValues(fields);
			const newValues = { ...prevValues };
			
			// 处理新增字段：为新字段设置默认值
			fields.forEach(field => {
				if (!(field.id in prevValues)) {
					newValues[field.id] = defaultValues[field.id];
					debugManager.log('CpsFormRenderView', `新增字段 '${field.id}' 设置默认值:`, defaultValues[field.id]);
				}
			});
			
			// 处理预填充数据：只覆盖预填充字段，不影响用户已输入的内容
			if (prefilledData) {
				for (const [fieldId, value] of prefilledData.entries()) {
					// 只有当字段存在且预填充值与当前值不同时才更新
					if (fields.some(f => f.id === fieldId) && newValues[fieldId] !== value) {
						newValues[fieldId] = value;
						debugManager.log('CpsFormRenderView', `预填充字段 '${fieldId}' 更新值:`, value);
					}
				}
			}
			
			// 移除已删除字段的值
			const fieldIds = new Set(fields.map(f => f.id));
			Object.keys(prevValues).forEach(fieldId => {
				if (!fieldIds.has(fieldId)) {
					delete newValues[fieldId];
					debugManager.log('CpsFormRenderView', `删除字段 '${fieldId}' 的值`);
				}
			});
			
			debugManager.logObject('CpsFormRenderView', 'useEffect: 智能合并后的表单值', newValues);
			return newValues;
		});
	}, [prefilledData, fields, createInitialFormValues]); // 依赖prefilledData、fields和createInitialFormValues的变化
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

	// 移除复杂的回调函数缓存机制，恢复到早期版本的简单内联回调
	// 这样可以避免因回调函数引用问题导致的输入内容丢失

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

// 移除React.memo优化，恢复到早期版本的简单实现
// 这样可以避免因优化导致的输入内容丢失问题
export { CpsFormRenderViewComponent as CpsFormRenderView };
