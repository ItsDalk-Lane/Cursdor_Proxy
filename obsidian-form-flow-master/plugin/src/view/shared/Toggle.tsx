import React from 'react';
import './Toggle.css';

/**
 * 滑动开关组件
 * @param checked - 是否选中
 * @param onChange - 状态改变回调
 * @param disabled - 是否禁用
 * @param size - 尺寸大小
 */
export interface ToggleProps {
	checked: boolean;
	onChange: (checked: boolean) => void;
	disabled?: boolean;
	size?: 'small' | 'medium' | 'large';
}

export function Toggle({ checked, onChange, disabled = false, size = 'medium' }: ToggleProps) {
	return (
		<label className={`toggle toggle--${size}`} data-disabled={disabled}>
			<input
				type="checkbox"
				checked={checked}
				onChange={(e) => onChange(e.target.checked)}
				disabled={disabled}
				className="toggle__input"
			/>
			<span className="toggle__slider"></span>
		</label>
	);
}

export default Toggle;