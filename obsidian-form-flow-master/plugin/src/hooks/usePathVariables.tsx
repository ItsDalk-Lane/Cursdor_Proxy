import { useMemo } from "react";
import { GenerateFormAction } from "../model/action/OpenFormAction";
import { SuggestModalFormAction } from "../model/action/SuggestModalFormAction";
import { FormActionType } from "../model/enums/FormActionType";
import { FormFieldType } from "../model/enums/FormFieldType";
import { FormConfig } from "../model/FormConfig";
import { IFileListField } from "../model/field/IFileListField";

export function usePathVariables(actionId: string, formConfig: FormConfig) {
	return useMemo(() => {
		const actions = formConfig.actions || [];
		// 过滤掉设置了文件内容提取的文件列表字段，这些字段不能在路径中引用
		const fields = (formConfig.fields || [])
			.filter((f) => {
				// 排除设置了 extractContent 的文件列表字段
				if (f.type === FormFieldType.FILE_LIST && (f as IFileListField).extractContent === true) {
					return false;
				}
				// 确保字段有有效的 label
				if (!f.label || typeof f.label !== 'string') {
					return false;
				}
				return true;
			})
			.map((f) => {
				return {
					label: f.label,
					info: f.description || '',
					type: "variable",
				};
			});
		const currentIndex = actions.findIndex((a) => a.id === actionId);
		for (let i = currentIndex - 1; i >= 0; i--) {
			const action = actions[i];
			if (action.type === FormActionType.SUGGEST_MODAL) {
				const a = action as SuggestModalFormAction;
				// 确保 fieldName 有效
				if (!a.fieldName || typeof a.fieldName !== 'string') {
					continue;
				}
				if (fields.find((f) => f.label === a.fieldName)) {
					continue;
				}
				fields.push({
					label: a.fieldName,
					info: "",
					type: "variable",
				});
			}

			if (action.type === FormActionType.GENERATE_FORM) {
				const a = action as GenerateFormAction;
				const afields = a.fields || [];
				afields.forEach((f) => {
					// 确保字段有有效的 label
					if (!f.label || typeof f.label !== 'string') {
						return;
					}
					if (!fields.find((ff) => ff.label === f.label)) {
						fields.push({
							label: f.label,
							info: f.description || '',
							type: "variable",
						});
					}
				});
			}
		}

		return fields;
	}, [formConfig]);
}
