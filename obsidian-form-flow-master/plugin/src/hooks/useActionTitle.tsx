import { normalizePath } from "obsidian";
import { useMemo } from "react";
import { CreateFileFormAction } from "../model/action/CreateFileFormAction";
import { IFormAction } from "../model/action/IFormAction";
import { InsertTextFormAction } from "../model/action/InsertTextFormAction";
import {
	RunScriptFormAction,
	ScriptSourceType,
} from "../model/action/RunScriptFormAction";
import { SuggestModalFormAction } from "../model/action/SuggestModalFormAction";
import { ContentCleanupFormAction, CleanupType } from "../model/action/ContentCleanupFormAction";
import { FormActionType } from "../model/enums/FormActionType";
import { TargetFileType } from "../model/enums/TargetFileType";
import { formActionTypeOptions } from "../view/edit/setting/action/common/ActionTypeSelect";
import { allFormInsertPositionOptions } from "../view/edit/setting/action/common/InsertPositionSelect";
import { localInstance } from "src/i18n/locals";
import { Strings } from "src/utils/Strings";

export function useActionTitle(value: IFormAction) {
	const heading = useMemo(() => {
		const typeLabel =
			formActionTypeOptions.find((t) => t.value === value.type)?.label ||
			"";

		// 优先使用自定义标题
		if (value.title && value.title.trim()) {
			return {
				type: typeLabel,
				title: value.title.trim(),
			};
		}

		let title = "";

		if (value.type === FormActionType.SUGGEST_MODAL) {
			const suggestAction = value as SuggestModalFormAction;
			if (!suggestAction.fieldName || suggestAction.fieldName === "") {
				title = localInstance.unnamed;
			} else {
				title = suggestAction.fieldName;
			}
		}

		if (value.type === FormActionType.RUN_SCRIPT) {
			const scriptAction = value as RunScriptFormAction;
			if (scriptAction.scriptSource === ScriptSourceType.INLINE) {
				title = scriptAction.title || "";
			}
		}

		if (value.type === FormActionType.CREATE_FILE) {
			const createFileAction = value as CreateFileFormAction;

			if (Strings.isEmpty(createFileAction.filePath)) {
				title = localInstance.file_path_required;
			} else {
				title = normalizePath(createFileAction.filePath);
			}
		}

		if (value.type === FormActionType.INSERT_TEXT) {
			const insertTextAction = value as InsertTextFormAction;
			let file = "";
			let position = "";
			if (
				insertTextAction.targetFileType === TargetFileType.CURRENT_FILE
			) {
				file = localInstance.in_current_file;
				position = "";
			} else {
				if (Strings.isEmpty(insertTextAction.filePath)) {
					title = localInstance.file_path_required;
				} else {
					title = normalizePath(insertTextAction.filePath);
				}
				position =
					allFormInsertPositionOptions.find(
						(p) => p.value === insertTextAction.position
					)?.label || "";
			}

			title = file + " " + position;
		}

		if (value.type === FormActionType.CONTENT_CLEANUP) {
			const cleanupAction = value as ContentCleanupFormAction;
			switch (cleanupAction.cleanupType) {
				case CleanupType.DELETE_FILES:
					if (cleanupAction.targetFiles && cleanupAction.targetFiles.length > 0) {
						title = `删除文件: ${cleanupAction.targetFiles.length}个文件`;
					} else {
						title = "删除文件";
					}
					break;
				case CleanupType.DELETE_FOLDERS:
					if (cleanupAction.targetFolders && cleanupAction.targetFolders.length > 0) {
						title = `删除文件夹: ${cleanupAction.targetFolders.length}个文件夹`;
					} else {
						title = "删除文件夹";
					}
					break;
				case CleanupType.DELETE_HEADING_CONTENT:
					if (cleanupAction.headingName) {
						title = `删除标题内容: ${cleanupAction.headingName}`;
					} else {
						title = "删除标题内容";
					}
					break;

				case CleanupType.CLEAR_TEXT_FORMAT:
					title = "清除文本格式";
					break;
				default:
					title = "内容清理";
					break;
			}
		}

		return {
			type: typeLabel,
			title: title,
		};
	}, [value]);
	return heading;
}
