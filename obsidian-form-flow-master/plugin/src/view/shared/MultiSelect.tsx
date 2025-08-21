import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import './MultiSelect.css';

/**
 * 多选下拉列表选项接口
 */
export interface MultiSelectOption {
	value: string;
	label: string;
	description?: string;
}

/**
 * 多选下拉列表组件属性
 */
export interface MultiSelectProps {
	options: MultiSelectOption[];
	value: string[];
	onChange: (value: string[]) => void;
	placeholder?: string;
	disabled?: boolean;
	maxHeight?: number;
}

/**
 * 多选下拉列表组件
 * @param options - 选项列表
 * @param value - 当前选中的值数组
 * @param onChange - 值改变回调
 * @param placeholder - 占位符文本
 * @param disabled - 是否禁用
 * @param maxHeight - 下拉列表最大高度
 */
export function MultiSelect({
	options,
	value,
	onChange,
	placeholder = '请选择...',
	disabled = false,
	maxHeight = 200
}: MultiSelectProps) {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	// 点击外部关闭下拉列表
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	/**
	 * 切换选项选中状态
	 */
	const toggleOption = (optionValue: string) => {
		if (disabled) return;
		
		const newValue = value.includes(optionValue)
			? value.filter(v => v !== optionValue)
			: [...value, optionValue];
		
		onChange(newValue);
	};

	/**
	 * 获取显示文本
	 */
	const getDisplayText = () => {
		if (value.length === 0) {
			return placeholder;
		}
		
		if (value.length === 1) {
			const option = options.find(opt => opt.value === value[0]);
			return option?.label || value[0];
		}
		
		return `已选择 ${value.length} 项`;
	};

	return (
		<div 
			ref={containerRef} 
			className={`multi-select ${disabled ? 'multi-select--disabled' : ''}`}
		>
			<div 
				className={`multi-select__trigger ${isOpen ? 'multi-select__trigger--open' : ''}`}
				onClick={() => !disabled && setIsOpen(!isOpen)}
			>
				<span className="multi-select__text">{getDisplayText()}</span>
				<ChevronDown 
					size={16} 
					className={`multi-select__icon ${isOpen ? 'multi-select__icon--rotated' : ''}`}
				/>
			</div>
			
			{isOpen && (
				<div 
					className="multi-select__dropdown"
					style={{ maxHeight: `${maxHeight}px` }}
				>
					{options.map((option) => {
						const isSelected = value.includes(option.value);
						
						return (
							<div
								key={option.value}
								className={`multi-select__option ${isSelected ? 'multi-select__option--selected' : ''}`}
								onClick={() => toggleOption(option.value)}
							>
								<div className="multi-select__option-content">
									<div className="multi-select__option-label">{option.label}</div>
									{option.description && (
										<div className="multi-select__option-description">{option.description}</div>
									)}
								</div>
								{isSelected && (
									<Check size={16} className="multi-select__check" />
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}

export default MultiSelect;