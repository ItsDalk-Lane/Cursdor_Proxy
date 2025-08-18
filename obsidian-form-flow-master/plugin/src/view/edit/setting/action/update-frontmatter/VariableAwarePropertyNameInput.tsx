import { useMemo } from "react";
import useFormConfig from "src/hooks/useFormConfig";
import { useVariables } from "src/hooks/useVariables";
import { localInstance } from "src/i18n/locals";
import CpsFormItem from "src/view/shared/CpsFormItem";
import CodeEditor from "../common/code-editor/CodeEditor";
import { timeTemplatePreviewExtension } from "../common/code-editor/FormTimeVariableWidget";
import { createFormVariableSuggestions } from "../common/code-editor/FormVariableSuggest";
import { formVariableExtension } from "../common/code-editor/FormVariableWidget";
import { internalFieldNames } from "../common/variable-quoter/InternalVariablePopover";

export function VariableAwarePropertyNameInput(props: {
	actionId: string;
	value: string;
	placeholder?: string;
	onChange: (value: string) => void;
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

	return (
		<CodeEditor
			height="60px"
			initialValue={value || ""}
			onChange={onChange}
			language="markdown"
			extensions={editorExtensions}
			extensionsKey={extensionKey}
			placeholder={placeholder || localInstance.property_name}
		/>
	);
}
