import { useMemo } from "react";
import useFormConfig from "src/hooks/useFormConfig";
import { useVariables } from "src/hooks/useVariables";
import { localInstance } from "src/i18n/locals";
import CodeEditor from "../common/code-editor/CodeEditor";
import { timeTemplatePreviewExtension } from "../common/code-editor/FormTimeVariableWidget";
import { createFormVariableSuggestions } from "../common/code-editor/FormVariableSuggest";
import { formVariableExtension } from "../common/code-editor/FormVariableWidget";
import { internalFieldNames } from "../common/variable-quoter/InternalVariablePopover";

export function VariableAwarePropertyValueInput(props: {
	actionId: string;
	value: any;
	placeholder?: string;
	onChange: (value: any) => void;
}) {
	const { actionId, value, onChange, placeholder } = props;
	const formConfig = useFormConfig();
	
	const internalVariableNames = internalFieldNames.map((f) => {
		return {
			label: f.name,
			detail: f.description,
		};
	});

	const fieldNames = useVariables(actionId, formConfig);
	const extensionKey = useMemo(() => {
		return fieldNames.map((f) => f.label).join("|");
	}, [fieldNames]);

	const editorExtensions = useMemo(() => {
		return [
			formVariableExtension,
			createFormVariableSuggestions(fieldNames),
			timeTemplatePreviewExtension,
		];
	}, [fieldNames]);

	// 将数组或单个值转换为字符串
	const stringValue = useMemo(() => {
		if (Array.isArray(value)) {
			return value.join(', ');
		}
		return value || "";
	}, [value]);

	const handleChange = (newValue: string) => {
		// 如果包含逗号，则作为数组处理
		if (newValue.includes(',')) {
			const arrayValue = newValue.split(',').map(v => v.trim()).filter(v => v);
			onChange(arrayValue);
		} else {
			onChange(newValue);
		}
	};

	return (
		<CodeEditor
			height="60px"
			initialValue={stringValue}
			onChange={handleChange}
			language="markdown"
			extensions={editorExtensions}
			extensionsKey={extensionKey}
			placeholder={placeholder || localInstance.property_value}
		/>
	);
}
