import { ListBox } from "src/component/list-box/ListBox";
import { localInstance } from "src/i18n/locals";
import { FormFieldType } from "src/model/enums/FormFieldType";
import { ISelectField } from "src/model/field/ISelectField";

import { FormFieldValue } from "../../../service/FormValues";
import { debugManager } from "src/utils/DebugManager";

/**
 * 选择控件
 * - 多选使用 ListBox，保持值类型为 string[]
 * - 单选使用原生 select，将传入值标准化为字符串，避免预填充 number 时无法匹配
 * - 统一单参数 onValueChange(value)
 * - 输出详细调试日志，便于排查选项匹配问题
 */
interface Props {
	field: ISelectField;
	value: FormFieldValue;
	onValueChange: (value: FormFieldValue) => void;
	autoFocus?: boolean;
	onContextMenu?: (event: React.MouseEvent) => void;
	className?: string;
}

export default function (props: Props) {
	const { value, field, onValueChange, autoFocus } = props;
	const f = field as ISelectField;
	const userOptions = (f.options || []).map((o) => {
		const optionValue = f.enableCustomValue === true ? o.value : o.label;
		return {
			id: o.id,
			label: o.label,
			value: typeof optionValue === 'string' ? optionValue : String(optionValue || ''),
		};
	});
	const isSelect = field.type === FormFieldType.SELECT;

	if (f.multiple && isSelect) {
		const multiValue = Array.isArray(value) ? (value as any[]).filter((v: any) => typeof v === 'string') as string[] : null;
		debugManager.log('SelectControl', '渲染多选 ListBox', {
			fieldId: field.id,
			label: field.label,
			optionsCount: userOptions.length,
			value,
			multiValue,
		});
		return (
			<ListBox
				value={multiValue}
				options={userOptions}
				onChange={(v) => {
					debugManager.log('SelectControl', '多选 onChange', { fieldId: field.id, oldValue: multiValue, newValue: v });
					props.onValueChange(v);
				}}
			></ListBox>
		);
	}

	// 单选：标准化传入值为字符串
	const normalizedSingleValue = typeof value === 'string' ? value : (value == null ? "" : String(value));
	const hasMatchValue = userOptions.some((v) => v.value === normalizedSingleValue);

	debugManager.log('SelectControl', '渲染单选 select', {
		fieldId: field.id,
		label: field.label,
		optionsCount: userOptions.length,
		value,
		normalizedSingleValue,
		hasMatchValue,
	});

	return (
			<select
				id={field.id}
				data-name={field.label}
				className={`dropdown ${props.className || ''}`}
				value={hasMatchValue ? normalizedSingleValue : ""}
				required={field.required}
				onChange={(e) => {
					debugManager.log('SelectControl', '单选 onChange', { fieldId: field.id, oldValue: normalizedSingleValue, newValue: e.target.value });
					onValueChange(e.target.value);
				}}
				onContextMenu={props.onContextMenu}
				autoFocus={autoFocus}
			>
				<option value="">
					{localInstance.please_select_option}
				</option>
				{userOptions.map((option) => {
					return (
						<option
							key={option.id}
							value={option.value}
						>
							{option.label}
						</option>
					);
				})}
			</select>
	);
}
