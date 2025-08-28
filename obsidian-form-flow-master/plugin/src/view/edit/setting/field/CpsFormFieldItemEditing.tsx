import React from "react";
import { DropIndicator } from "@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box";
import { FormField, IFormField } from "../../../../model/field/IFormField";
import { CpsFormFieldSettingContent } from "./setting-content/CpsFormFieldSettingContent";
import { FormFieldSettingHeader } from "./setting-header/FormFieldSettingHeader";
import { FormFieldContext } from "./hooks/FormFieldContext";
import useSortableItem from "src/hooks/useSortableItem";

/**
 * 表单字段编辑项组件
 * 使用React.memo优化性能，避免因其他字段更新导致的不必要重新渲染
 */
function CpsFormFieldItemEditingComponent(props: {
	index: number;
	field: FormField;
	allFields: IFormField[];
	onDelete: (field: IFormField) => void;
	onChange: (field: IFormField) => void;
	onDuplicate: (field: IFormField) => void;
}) {
	const { field, onChange } = props;
	const { closestEdge, dragging, draggedOver, setElRef, setDragHandleRef } =
		useSortableItem(field.id);

	return (
		<FormFieldContext.Provider
			value={{
				field: field,
				index: props.index,
			}}
		>
			<div className="form--CpsFormFieldSetting" ref={setElRef}>
				<FormFieldSettingHeader
					field={field}
					allFields={props.allFields}
					onChange={props.onChange}
					onDelete={props.onDelete}
					onDuplicate={props.onDuplicate}
					setDragHandleRef={setDragHandleRef}
				></FormFieldSettingHeader>
				<CpsFormFieldSettingContent field={field} allFields={props.allFields} onChange={onChange} />
				{closestEdge && <DropIndicator edge={closestEdge} gap="1px" />}
			</div>
		</FormFieldContext.Provider>
	);
}

/**
 * 深度比较两个字段对象是否相等
 * 避免使用JSON.stringify，提供更精确的比较逻辑
 */
function deepCompareFields(field1: IFormField, field2: IFormField): boolean {
	if (field1.id !== field2.id) return false;
	if (field1.label !== field2.label) return false;
	if (field1.type !== field2.type) return false;
	if (field1.required !== field2.required) return false;
	if (field1.enableDescription !== field2.enableDescription) return false;
	if (field1.rightClickSubmit !== field2.rightClickSubmit) return false;
	
	// 比较defaultValue（处理不同类型的值）
	if (field1.defaultValue !== field2.defaultValue) {
		// 对于数组类型的defaultValue，进行深度比较
		if (Array.isArray(field1.defaultValue) && Array.isArray(field2.defaultValue)) {
			if (field1.defaultValue.length !== field2.defaultValue.length) return false;
			for (let i = 0; i < field1.defaultValue.length; i++) {
				if (field1.defaultValue[i] !== field2.defaultValue[i]) return false;
			}
		} else {
			return false;
		}
	}
	
	// 比较其他可能的字段属性
	const field1Keys = Object.keys(field1);
	const field2Keys = Object.keys(field2);
	
	if (field1Keys.length !== field2Keys.length) return false;
	
	for (const key of field1Keys) {
		// 跳过已经比较过的基础属性
		if (['id', 'label', 'type', 'required', 'enableDescription', 'rightClickSubmit', 'defaultValue'].includes(key)) {
			continue;
		}
		
		const value1 = (field1 as any)[key];
		const value2 = (field2 as any)[key];
		
		// 对于对象类型，进行简单的字符串化比较
		if (typeof value1 === 'object' && typeof value2 === 'object') {
			if (JSON.stringify(value1) !== JSON.stringify(value2)) return false;
		} else if (value1 !== value2) {
			return false;
		}
	}
	
	return true;
}

/**
 * 使用React.memo优化的表单字段编辑项组件
 * 只有当字段本身发生变化时才重新渲染，避免因其他字段更新导致的重新渲染
 */
export const CpsFormFieldItemEditing = React.memo(CpsFormFieldItemEditingComponent, (prevProps, nextProps) => {
	// 优化的比较函数：避免不必要的重新渲染
	return (
		prevProps.index === nextProps.index &&
		deepCompareFields(prevProps.field, nextProps.field) &&
		// 比较回调函数引用（通常这些函数是稳定的）
		prevProps.onChange === nextProps.onChange &&
		prevProps.onDelete === nextProps.onDelete &&
		prevProps.onDuplicate === nextProps.onDuplicate
	);
});
