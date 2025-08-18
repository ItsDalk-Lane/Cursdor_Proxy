import { useMemo } from "react";
import useFormConfig from "src/hooks/useFormConfig";
import { useVariables } from "src/hooks/useVariables";
import { localInstance } from "src/i18n/locals";
import CpsFormItem from "src/view/shared/CpsFormItem";
import CodeEditor from "./code-editor/CodeEditor";
import { timeTemplatePreviewExtension } from "./code-editor/FormTimeVariableWidget";
import { createFormVariableSuggestions } from "./code-editor/FormVariableSuggest";
import { formVariableExtension } from "./code-editor/FormVariableWidget";
import { internalFieldNames } from "./variable-quoter/InternalVariablePopover";

export function VariableAwareFilePathInput(props: {
	actionId: string;
	label: string;
	value: string;
	placeholder?: string;
	onChange: (value: string) => void;
	autoAddMdExtension?: boolean; // 是否自动添加.md后缀
}) {
	const { actionId, label, value, onChange, placeholder, autoAddMdExtension = false } = props;
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

	const handleChange = (newValue: string) => {
		let processedValue = newValue;
		
		// 如果启用了自动添加.md后缀，且输入的是纯文件名（不包含路径分隔符和扩展名）
		if (autoAddMdExtension && processedValue.trim()) {
			// 检查是否是纯文件名（没有路径分隔符）且没有扩展名
			const hasPathSeparator = processedValue.includes('/') || processedValue.includes('\\');
			const hasExtension = processedValue.includes('.');
			
			// 如果没有路径分隔符且没有扩展名，则认为是纯文件名，自动添加.md
			if (!hasPathSeparator && !hasExtension) {
				// 检查是否包含变量引用
				const hasVariable = processedValue.includes('{{@');
				if (!hasVariable) {
					processedValue = processedValue + '.md';
				}
			}
		}
		
		onChange(processedValue);
	};

	return (
		<CpsFormItem
			label={label}
			style={{
				flexDirection: "column",
				alignItems: "initial",
			}}
		>
			<CodeEditor
				height="60px"
				initialValue={value || ""}
				onChange={handleChange}
				language="markdown"
				extensions={editorExtensions}
				extensionsKey={extensionKey}
				placeholder={placeholder || localInstance.file_path}
			/>
		</CpsFormItem>
	);
}
