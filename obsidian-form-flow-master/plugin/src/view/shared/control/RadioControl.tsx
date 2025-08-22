import RadioSelect from "src/component/radio/RadioSelect";
import { IRadioField } from "src/model/field/IRadioField";
import { FormFieldValue } from "../../../service/FormValues";
import { debugManager } from "src/utils/DebugManager";

/**
 * 单选控件
 * - 统一将选项值标准化为字符串，避免严格相等比较失败
 * - 维持单参数 onValueChange(value) 回调签名
 * - 在调试模式下输出详细的选项与值映射日志
 */
interface Props {
	field: IRadioField;
	value: FormFieldValue;
	onValueChange: (value: FormFieldValue) => void;
	autoFocus?: boolean;
}

export default function (props: Props) {
	const { value, field, onValueChange, autoFocus } = props;
	const f = field as IRadioField;
	const options = (f.options || []).map((o) => {
		const raw = f.enableCustomValue === true ? o.value : o.label;
		const strValue = typeof raw === 'string' ? raw : String(raw ?? '');
		return {
			id: o.id,
			label: o.label,
			value: strValue,
		};
	});

	const normalizedValue =
		typeof value === 'string' ? value : (value == null ? '' : String(value));

	debugManager.log('RadioControl', '渲染单选控件', {
		fieldId: field.id,
		label: field.label,
		value,
		normalizedValue,
		options,
	});

	return (
		<RadioSelect
			name={field.label}
			value={normalizedValue}
			onChange={(v) => {
				debugManager.log('RadioControl', 'onChange 触发', {
					fieldId: field.id,
					oldValue: normalizedValue,
					newValue: v,
				});
				onValueChange(v);
			}}
			options={options}
			autoFocus={autoFocus}
			required={field.required}
		/>
	);
}
