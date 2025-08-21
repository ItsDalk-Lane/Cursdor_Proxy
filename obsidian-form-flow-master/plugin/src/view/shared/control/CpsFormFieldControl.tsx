import { PropertyValueSuggestInput } from "src/component/combobox/PropertyValueSuggestInput";
import { PasswordInput } from "src/component/password/PasswordInput";
import { FormFieldType } from "src/model/enums/FormFieldType";
import { IFormField } from "src/model/field/IFormField";
import { IPropertyValueField } from "src/model/field/IPropertyValueField";
import { ISelectField } from "src/model/field/ISelectField";
import { ITextAreaField } from "src/model/field/ITextAreaField";
import { Strings } from "src/utils/Strings";
import { FileListControl } from "./FileListControl";
import RadioControl from "./RadioControl";
import SelectControl from "./SelectControl";
import ToggleControl from "./ToggleControl";
import AIModelListControl from "./AIModelListControl";
import { TemplateListControl } from "./TemplateListControl";
import { ContextMenuService } from "src/service/context-menu/ContextMenuService";
import "./CpsFormFieldControl.css";

export function CpsFormFieldControl(props: {
	field: IFormField;
	value: any;
	onValueChange: (value: any) => void;
	autoFocus?: boolean;
}) {
	const { value, field, autoFocus } = props;
	const actualValue = value || "";
	const onValueChange = props.onValueChange;

	/**
	 * 处理右键点击事件，为启用了右键提交功能的字段添加右键事件处理
	 */
	const handleRightClick = async (event: React.MouseEvent) => {
		if (!field.rightClickSubmit) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		try {
			const contextMenuService = ContextMenuService.getInstance();
			if (contextMenuService) {
				// 暂时传递空字符串，等待与右键菜单集成
				// TODO: 这里应该从右键菜单获取实际内容
				await contextMenuService.addContentToField(field.id, '');
			}
		} catch (error) {
			console.error('右键提交处理失败:', error);
		}
	};

	/**
	 * 获取字段的样式类名，为右键提交字段添加特殊标识
	 */
	const getFieldClassName = () => {
		return field.rightClickSubmit ? 'form-field-right-click-enabled' : '';
	};

	if (field.type === FormFieldType.TEXTAREA) {
		const isTextArea = field as ITextAreaField;
		const rows = isTextArea.rows || 5;
		return (
			<textarea
				id={field.id}
				data-name={field.label}
				value={actualValue}
				rows={rows}
				required={field.required}
				onChange={(e) => onValueChange(e.target.value)}
				onContextMenu={handleRightClick}
				className={getFieldClassName()}
				autoFocus={autoFocus}
			/>
		);
	}
	if (field.type === FormFieldType.PASSWORD) {
		return (
			<PasswordInput
				value={actualValue}
				name={field.label}
				onChange={(e) => onValueChange(e)}
				required={field.required}
				onContextMenu={handleRightClick}
				className={getFieldClassName()}
				autoFocus={autoFocus}
			/>
		);
	}
	if (field.type === FormFieldType.NUMBER) {
		return (
			<input
				id={field.id}
				data-name={field.label}
				type="number"
				step={"any"}
				value={actualValue}
				required={field.required}
				onChange={(e) => onValueChange(e.target.value)}
				onContextMenu={handleRightClick}
				className={getFieldClassName()}
				autoFocus={autoFocus}
			/>
		);
	}
	if (field.type === FormFieldType.DATE) {
		return (
			<input
				id={field.id}
				data-name={field.label}
				type="date"
				value={actualValue}
				max="9999-12-31"
				required={field.required}
				onChange={(e) => onValueChange(e.target.value)}
				onContextMenu={handleRightClick}
				className={getFieldClassName()}
				autoFocus={autoFocus}
			/>
		);
	}
	if (field.type === FormFieldType.DATETIME) {
		return (
			<input
				id={field.id}
				data-name={field.label}
				type="datetime-local"
				max="9999-12-31T23:59"
				value={actualValue}
				required={field.required}
				onChange={(e) => onValueChange(e.target.value)}
				onContextMenu={handleRightClick}
				className={getFieldClassName()}
				autoFocus={autoFocus}
			/>
		);
	}

	if (field.type === FormFieldType.TIME) {
		return (
			<input
				id={field.id}
				data-name={field.label}
				type="time"
				value={actualValue}
				required={field.required}
				onChange={(e) => onValueChange(e.target.value)}
				onContextMenu={handleRightClick}
				className={getFieldClassName()}
				autoFocus={autoFocus}
			/>
		);
	}

	if (field.type === FormFieldType.SELECT) {
		return (
			<SelectControl
				field={field as ISelectField}
				value={actualValue}
				onValueChange={onValueChange}
				onContextMenu={handleRightClick}
				className={getFieldClassName()}
				autoFocus={autoFocus}
			/>
		);
	}
	if (
		field.type === FormFieldType.TOGGLE ||
		field.type === FormFieldType.CHECKBOX
	) {
		return (
			<ToggleControl
				id={field.id}
				value={actualValue}
				required={field.required}
				onValueChange={onValueChange}
				autoFocus={autoFocus}
			/>
		);
	}
	if (field.type === FormFieldType.RADIO) {
		return (
			<RadioControl
				field={field}
				value={actualValue}
				onValueChange={onValueChange}
				autoFocus={autoFocus}
			/>
		);
	}

	if (field.type === FormFieldType.FILE_LIST) {
		return (
			<FileListControl
				field={field}
				value={actualValue}
				onValueChange={onValueChange}
				autoFocus={autoFocus}
			/>
		);
	}

	if (field.type === FormFieldType.AI_MODEL_LIST) {
		return (
			<AIModelListControl
				field={field}
				value={value}
				onValueChange={onValueChange}
				autoFocus={autoFocus}
			/>
		);
	}

	if (field.type === FormFieldType.TEMPLATE_LIST) {
		return (
			<TemplateListControl
				field={field as any}
				value={value}
				onChange={onValueChange}
				autoFocus={autoFocus}
			/>
		);
	}

	if (field.type === FormFieldType.PROPERTY_VALUE) {
		const propertyValueField = field as IPropertyValueField;
		const propertyName = Strings.defaultIfBlank(
			propertyValueField.propertyName,
			field.label
		);
		return (
			<PropertyValueSuggestInput
				id={field.id}
				label={field.label}
				name={propertyName}
				value={actualValue}
				onChange={onValueChange}
			/>
		);
	}

	return (
		<input
			id={field.id}
			data-name={field.label}
			type="text"
			value={actualValue}
			required={field.required}
			onChange={(e) => onValueChange(e.target.value)}
			onContextMenu={handleRightClick}
			className={getFieldClassName()}
			autoFocus={autoFocus}
		/>
	);
}
