import { useId } from "react";
import "./RadioSelect.css";
import { debugManager } from "src/utils/DebugManager";

export type RadioOption = {
	id: string;
	label: string;
	value: any;
};

/**
 * RadioSelect 组件
 * - 仅负责渲染与分发选择事件，保持 onChange 单参数签名
 * - 不对值做类型转换，由上层 RadioControl 统一进行字符串标准化
 * - 输出详细调试日志，便于排查选中状态与值传递问题
 */
export default function (props: {
	name?: string;
	value: any;
	options: RadioOption[];
	onChange: (value: any) => void;
	required?: boolean;
	autoFocus?: boolean;
}) {
	const { value, onChange, autoFocus } = props;
	const options = props.options || [];
	const id = useId();

	debugManager.log('RadioSelect', '渲染 RadioSelect', {
		name: props.name,
		value,
		optionsCount: options.length,
		firstOption: options[0],
	});

	return (
		<div className="form--RadioSelect">
			{options.map((option, index) => {
				return (
					<Option
						key={option.id}
						value={value}
						onChange={onChange}
						name={props.name || id}
						option={option}
						required={props.required === true}
						autoFocus={autoFocus && index === 0}
					/>
				);
			})}
		</div>
	);
}

function Option(props: {
	name: string;
	value: any;
	onChange: (value: any) => void;
	option: RadioOption;
	autoFocus?: boolean;
	required?: boolean;
}) {
	const { option, autoFocus, value, onChange, name } = props;
	// 不对空字符串进行回退，保持与上层传入的 options.value 一致
	const optionValue = option.value;
	const isChecked = value === optionValue;

	debugManager.log('RadioSelect', '渲染单个选项', {
		optionId: option.id,
		optionLabel: option.label,
		optionValue,
		currentValue: value,
		isChecked,
	});

	return (
		<label key={option.id} className="form--RadioSelectOption" data-checked={isChecked === true}>
			<input
				type="radio"
				name={name}
				value={optionValue}
				checked={isChecked}
				onChange={(e) => {
					debugManager.log('RadioSelect', 'onChange 触发', {
						optionId: option.id,
						oldValue: value,
						newValue: e.target.value,
					});
					onChange(e.target.value);
				}}
				autoFocus={autoFocus}
				required={props.required}
			/>
			{option.label}
		</label>
	);
}
