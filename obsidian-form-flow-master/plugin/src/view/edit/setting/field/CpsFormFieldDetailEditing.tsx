import { useMemo } from "react";
import { localInstance } from "src/i18n/locals";
import { FormFieldType } from "src/model/enums/FormFieldType";
import { IFileListField } from "src/model/field/IFileListField";
import { IFormField } from "src/model/field/IFormField";
import { ISelectField } from "src/model/field/ISelectField";
import { isTimeFormField } from "src/utils/isTimeFormField";
import { CpsFormFieldControl } from "src/view/shared/control/CpsFormFieldControl";
import SelectControl from "src/view/shared/control/SelectControl";
import ToggleControl from "src/view/shared/control/ToggleControl";
import CpsForm from "src/view/shared/CpsForm";
import { FormFieldTypeSelect } from "./common/FormFieldTypeSelect";
import { DateFieldDefaultValueControl } from "./default-value/DateFieldDefaultValueControl";
import CpsFormPropertyValueFieldSetting from "./property-value/CpsFormPropertyValueFieldSetting";
import CpsFormTextAreaFieldSetting from "./textarea/CpsFormTextAreaFieldSetting";
import CpsFormAIModelListFieldSetting from "./ai-model-list/CpsFormAIModelListFieldSetting";
import CpsFormItem from "src/view/shared/CpsFormItem";
import { ToastManager } from "src/component/toast/ToastManager";

export function CpsFormFieldDetailEditing(props: {
	value: IFormField;
	allFields: IFormField[];
	onChange: (field: IFormField) => void;
}) {
	const { value: field, onChange: setField } = props;
	const selectTypes = [FormFieldType.RADIO, FormFieldType.SELECT];

	const defaultValueEl = useMemo(() => {
		if (isTimeFormField(field.type)) {
			return (
				<DateFieldDefaultValueControl
					field={field}
					onChange={(newField) => {
						setField(newField);
					}}
				/>
			);
		}

		if (selectTypes.includes(field.type)) {
			return (
				<SelectControl
					field={field}
					value={field.defaultValue}
					onValueChange={(v) => {
						const newField = {
							...field,
							defaultValue: v,
						};
						setField(newField);
					}}
				/>
			);
		}

		return (
			<CpsFormFieldControl
				field={field}
				value={field.defaultValue}
				onValueChange={(v) => {
					const newField = {
						...field,
						defaultValue: v,
					};
					setField(newField);
				}}
			/>
		);
	}, [field, setField]);

	return (
		<CpsForm>
			<CpsFormItem label={localInstance.field_type}>
				<FormFieldTypeSelect
					value={field.type}
					onChange={(value) => {
						const newField = {
							...field,
							type: value,
						};
						props.onChange(newField);
					}}
				/>
			</CpsFormItem>
			<CpsFormItem label={localInstance.required}>
				<ToggleControl
					value={field.required === true}
					onValueChange={(value) => {
						setField({
							...field,
							required: value,
						});
					}}
				/>
			</CpsFormItem>

			<CpsFormItem label={localInstance.description}>
				<ToggleControl
					value={field.enableDescription === true}
					onValueChange={(value) => {
						setField({
							...field,
							enableDescription: value,
						});
					}}
				/>
			</CpsFormItem>
			
			{/* 只在文本和多行文本字段类型中显示右键提交选项 */}
			{(field.type === FormFieldType.TEXT || field.type === FormFieldType.TEXTAREA) && (() => {
				// 检查是否已有其他字段开启了右键提交
				const otherRightClickField = props.allFields.find(
					f => f.id !== field.id && f.rightClickSubmit === true
				);
				
				// 当前字段是否已开启右键提交
				const isCurrentFieldEnabled = field.rightClickSubmit === true;
				
				// 是否应该禁用按钮：有其他字段开启了右键提交且当前字段未开启
				const shouldDisable = otherRightClickField && !isCurrentFieldEnabled;
				
				// 描述文本
				const description = shouldDisable 
					? `${localInstance.right_click_submit_description} (当前已有字段"${otherRightClickField.label}"开启了此功能，每个表单只能有一个字段开启右键提交)`
					: localInstance.right_click_submit_description;
				
				// 提示文本
				const tooltipText = shouldDisable 
					? `每个表单只能设置一个字段开启右键提交功能。当前字段"${otherRightClickField.label}"已开启此功能，请先关闭该字段的右键提交功能后再开启此字段。`
					: undefined;
				
				return (
					<CpsFormItem 
						label={localInstance.right_click_submit}
						description={description}
					>
						<ToggleControl
							value={isCurrentFieldEnabled}
							disabled={shouldDisable}
							title={tooltipText}
							onValueChange={(value) => {
								// 如果按钮被禁用，不执行任何操作
								if (shouldDisable) {
									return;
								}
								
								setField({
									...field,
									rightClickSubmit: value,
								});
							}}
						/>
					</CpsFormItem>
				);
			})()}
			
			<CpsFormItem label={localInstance.default_value}>
				{defaultValueEl}
			</CpsFormItem>

			<CpsFormPropertyValueFieldSetting
				field={field}
				onChange={setField}
			/>
			<CpsFormTextAreaFieldSetting field={field} onChange={setField} />
			<CpsFormAIModelListFieldSetting field={field} onChange={setField} />

			{field.type === FormFieldType.FILE_LIST && (
				<>
					<CpsFormItem label={localInstance.to_internal_link}>
						<ToggleControl
							value={
								(field as IFileListField).internalLink === true
							}
							onValueChange={(value) => {
								const f = field as IFileListField;
								const v = {
									...f,
									internalLink: value,
								};
								setField(v);
							}}
						/>
					</CpsFormItem>
					<CpsFormItem label={localInstance.multiple}>
						<ToggleControl
							value={(field as IFileListField).multiple === true}
							onValueChange={(value) => {
								const f = field as IFileListField;
								if (
									value === false &&
									Array.isArray(f.defaultValue)
								) {
									f.defaultValue = f.defaultValue[0];
								}
								const v = {
									...f,
									multiple: value,
								};

								setField(v);
							}}
						/>
					</CpsFormItem>
					<CpsFormItem 
						label={localInstance.extract_file_content}
						description={localInstance.extract_file_content_description}
					>
						<ToggleControl
							value={(field as IFileListField).extractContent === true}
							onValueChange={(value) => {
								const f = field as IFileListField;
								const v = {
									...f,
									extractContent: value,
								};
								setField(v);
							}}
						/>
					</CpsFormItem>
				</>
			)}

			{field.type === FormFieldType.SELECT && (
				<CpsFormItem label={localInstance.multiple}>
					<ToggleControl
						value={(field as ISelectField).multiple === true}
						onValueChange={(value) => {
							const f = field as ISelectField;
							const v = {
								...f,
								multiple: value,
							};
							setField(v);
						}}
					/>
				</CpsFormItem>
			)}
			{selectTypes.includes(field.type) && (
				<>
					<CpsFormItem label={localInstance.enable_custom_value}>
						<ToggleControl
							value={
								(field as ISelectField).enableCustomValue ===
								true
							}
							onValueChange={(value) => {
								const f = field as ISelectField;
								const v = {
									...f,
									enableCustomValue: value,
								};
								setField(v);
							}}
						/>
					</CpsFormItem>
				</>
			)}
		</CpsForm>
	);
}
