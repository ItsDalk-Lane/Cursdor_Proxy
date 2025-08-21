import { ToggleComponent } from "obsidian";
import { useRef, useLayoutEffect, useEffect } from "react";

export default function (props: {
	value: any;
	onValueChange: (value: any) => void;
	required?: boolean;
	id?: string;
	autoFocus?: boolean;
	disabled?: boolean;
	title?: string;
}) {
	const { value, onValueChange, id, disabled, title } = props;
	const containerRef = useRef<HTMLDivElement>(null);
	const toggleRef = useRef<ToggleComponent | null>(null);
	useLayoutEffect(() => {
		if (!containerRef.current) {
			return;
		}
		const switchElement = containerRef.current;
		switchElement.empty();
		const el = new ToggleComponent(switchElement);
		el.toggleEl.id = id ?? "";
		el.toggleEl.autofocus = props.autoFocus || false;
		el.setValue(value);
		
		// 设置禁用状态
		if (disabled) {
			// 检查元素类型并设置disabled属性
			if (el.toggleEl instanceof HTMLInputElement) {
				el.toggleEl.disabled = true;
			}
			el.toggleEl.style.opacity = '0.5';
			el.toggleEl.style.cursor = 'not-allowed';
			el.onChange(() => {}); // 禁用时不响应变化
		} else {
			el.onChange(onValueChange);
		}
		
		// 设置提示文本
		if (title) {
			el.toggleEl.title = title;
		}
		
		if (el.toggleEl instanceof HTMLInputElement) {
			el.toggleEl.required = props.required || false;
		}
		toggleRef.current = el;
		return () => {};
	}, [props.autoFocus, id, props.required, disabled, title]);

	useEffect(() => {
		if (toggleRef.current) {
			toggleRef.current.setValue(value);
		}
	}, [value]);
	useEffect(() => {
		if (toggleRef.current) {
			if (disabled) {
				toggleRef.current.onChange(() => {}); // 禁用时不响应变化
			} else {
				toggleRef.current.onChange(onValueChange);
			}
		}
	}, [props.onValueChange, disabled]);

	return <div ref={containerRef}></div>;
}
