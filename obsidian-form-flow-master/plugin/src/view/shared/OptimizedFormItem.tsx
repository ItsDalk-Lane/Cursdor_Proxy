import React from 'react';
import './OptimizedFormItem.css';

/**
 * 优化的表单项组件属性
 */
export interface OptimizedFormItemProps {
	label: React.ReactNode;
	description?: React.ReactNode;
	children: React.ReactNode;
	required?: boolean;
	layout?: 'horizontal' | 'vertical';
	className?: string;
	style?: React.CSSProperties;
}

/**
 * 优化的表单项组件
 * 提供更好的左右布局，标题和描述分离显示
 * @param label - 标题
 * @param description - 描述文本
 * @param children - 控件内容
 * @param required - 是否必填
 * @param layout - 布局方式
 * @param className - 自定义样式类
 * @param style - 自定义样式
 */
export function OptimizedFormItem({
	label,
	description,
	children,
	required = false,
	layout = 'horizontal',
	className = '',
	style
}: OptimizedFormItemProps) {
	return (
		<div 
			className={`optimized-form-item optimized-form-item--${layout} ${className}`}
			style={style}
		>
			<div className="optimized-form-item__info">
				<div className={`optimized-form-item__label ${required ? 'optimized-form-item__label--required' : ''}`}>
					{label}
				</div>
				{description && (
					<div className="optimized-form-item__description">
						{description}
					</div>
				)}
			</div>
			<div className="optimized-form-item__control">
				{children}
			</div>
		</div>
	);
}

export default OptimizedFormItem;