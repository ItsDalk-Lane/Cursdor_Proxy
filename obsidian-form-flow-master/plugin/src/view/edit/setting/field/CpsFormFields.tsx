import { useCallback } from "react";
import useSortable from "src/hooks/useSortable";
import { localInstance } from "src/i18n/locals";
import { FormFieldType } from "src/model/enums/FormFieldType";
import { IFormField, FormField } from "src/model/field/IFormField";
import { IOptionsField } from "src/model/field/ISelectField";
import { Filter, FilterType } from "src/model/filter/Filter";
import generateSequenceName from "src/utils/generateSequenceName";
import { Strings } from "src/utils/Strings";
import { v4 } from "uuid";
import { CpsFormFieldItemEditing } from "./CpsFormFieldItemEditing";
import "./CpsFormFields.css";

export default function (props: {
	fields: IFormField[];
	onSave: (fields: IFormField[], modified: IFormField[]) => void;
}) {
	const { fields, onSave } = props;
	useSortable({
		items: fields || [],
		getId: (item) => item.id,
		onChange: (orders) => {
			onSave(orders, []);
		},
	});

	/**
	 * 字段保存处理函数 - 优化状态更新逻辑
	 */
	const onFieldSave = useCallback(
		(field: IFormField) => {
			const existingField = fields.find((f) => f.id === field.id);
			let newFields: IFormField[];
			
			if (existingField) {
				// 更新现有字段
				newFields = updateField(field, fields);
			} else {
				// 添加新字段
				newFields = [...fields, field];
			}
			
			onSave(newFields, existingField ? [existingField] : []);
		},
		[fields, onSave]
	);

	/**
	 * 字段删除处理函数
	 */
	const onFieldDeleted = useCallback(
		(field: IFormField) => {
			const newFields = fields.filter((f) => f.id !== field.id);
			onSave(newFields, []);
		},
		[fields, onSave]
	);

	/**
	 * 添加新字段处理函数 - 优化标签生成逻辑
	 */
	const onFieldAdd = useCallback(() => {
		const existingLabels = fields.map((f) => f.label);
		const newField: IFormField = {
			id: v4(),
			label: generateSequenceName(existingLabels, "字段"), // 使用更友好的默认前缀
			type: FormFieldType.TEXT,
			required: false,
			enableDescription: false,
			rightClickSubmit: false
		};
		const newFields = [...fields, newField];
		onSave(newFields, []);
	}, [fields, onSave]);

	/**
	 * 字段复制处理函数 - 优化复制逻辑
	 */
	const onDuplicate = useCallback(
		(field: IFormField) => {
			const existingLabels = fields.map((f) => f.label);
			const duplicatedField: IFormField = {
				...field,
				id: v4(),
				label: generateSequenceName(existingLabels, field.label + " 副本")
			};
			
			// 在原字段后面插入复制的字段
			const newFields = fields.flatMap((f) => {
				if (f.id === field.id) {
					return [f, duplicatedField];
				}
				return [f];
			});
			onSave(newFields, []);
		},
		[fields, onSave]
	);

	return (
			<div className="form--CpsFormFieldsSetting">
				{fields.map((field, index) => {
					return (
						<CpsFormFieldItemEditing
							key={field.id}
							index={index}
							field={field as FormField}
							allFields={fields}
							onDelete={onFieldDeleted}
							onChange={onFieldSave}
							onDuplicate={onDuplicate}
						/>
					);
				})}
				<button className="form--AddButton" onClick={onFieldAdd}>
					+{localInstance.add_field}
				</button>
			</div>
		);
}

function updateField(updated: IFormField, fields: IFormField[]) {
	const original = fields.find((f) => f.id === updated.id);
	if (!original) {
		return fields;
	}
	return fields.map((field) => {
		if (field.id === updated.id) {
			return updated;
		}
		if (!field.condition) {
			return field;
		}
		const newCondition = updateCondition(
			field.condition,
			original,
			updated
		);
		return {
			...field,
			condition: newCondition,
		};
	});
}

function updateCondition(
	condition: Filter,
	original: IFormField,
	updated: IFormField
) {
	if (!condition) {
		return condition;
	}
	if (condition.type === FilterType.group) {
		const conditions = condition.conditions || [];
		const newConditions = conditions.map((c) => {
			return updateCondition(c, original, updated);
		});
		condition.conditions = newConditions;
		return condition;
	}

	if (condition.property !== updated.id) {
		return condition;
	}

	// original is select
	const isSelectField = (field: IFormField) =>
		[FormFieldType.SELECT, FormFieldType.RADIO].includes(field.type);
	if (isSelectField(original) && isSelectField(updated)) {
		const originalOptions = (original as IOptionsField).options || [];
		const updatedSelectField = (updated as IOptionsField).options || [];
		const originalOptionId = originalOptions.find(
			(o) => o.value === condition.value || o.label === condition.value
		)?.id;
		if (!originalOptionId) {
			// if original option is not found, return condition as is
			return condition;
		}

		const updatedOption = updatedSelectField.find(
			(o) => o.id === originalOptionId
		);
		if (updatedOption) {
			condition.value = Strings.defaultIfEmpty(
				String(updatedOption.value || ''),
				updatedOption.label
			);
		}
	}
	return condition;
}
