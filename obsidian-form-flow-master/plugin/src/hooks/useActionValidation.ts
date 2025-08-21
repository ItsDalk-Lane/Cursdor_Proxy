import { getLanguage } from "obsidian";
import { UpdateFrontmatterFormAction } from "src/model/action/UpdateFrontmatterFormAction";
import { CreateFileFormAction } from "../model/action/CreateFileFormAction";
import { IFormAction } from "../model/action/IFormAction";
import { InsertTextFormAction } from "../model/action/InsertTextFormAction";
import { GenerateFormAction } from "../model/action/OpenFormAction";
import { SuggestModalFormAction } from "../model/action/SuggestModalFormAction";
import { ContentCleanupFormAction } from "../model/action/ContentCleanupFormAction";
import { FormActionType } from "../model/enums/FormActionType";
import { TargetFileType } from "../model/enums/TargetFileType";
import { CleanupType } from "../model/action/ContentCleanupFormAction";
import { Strings } from "src/utils/Strings";


type FormActionImp = CreateFileFormAction | InsertTextFormAction | UpdateFrontmatterFormAction | GenerateFormAction | SuggestModalFormAction | ContentCleanupFormAction

export function useActionValidation(action: IFormAction) {
    const formAction = action as FormActionImp;
    const validationResults = validateAction(formAction);
    return {
        isValid: validationResults.isValid,
        validationMessages: validationResults.messages
    };
}

function validateAction(action: FormActionImp) {
    const messages: string[] = [];
    const i18n = {
        "en": {
            target_folder_required: "Target folder is required",
            file_path_required: "File path is required",
            content_required: "Content is required",
            properties_must_not_be_empty: "At least one property update is required",
            property_configure_incompleted: "One or more property updates are incomplete",
            at_leat_one_field_required: "At least one field is required",
            cleanup_target_required: "Please specify cleanup target",
            cleanup_heading_required: "Please specify heading name",
            cleanup_properties_required: "Please specify property names"
        },
        "zh-CN": {
            target_folder_required: "请填写目标文件夹",
            file_path_required: "请指定文件路径",
            content_required: "请填写内容",
            properties_must_not_be_empty: "至少填写一个属性",
            property_configure_incompleted: "一个或多个属性配置不完整",
            at_leat_one_field_required: "至少填写一个字段",
            cleanup_target_required: "请指定清理目标",
            cleanup_heading_required: "请指定标题名称",
            cleanup_properties_required: "请指定属性名称"

        },
        "zh-TW": {
            target_folder_required: "請填寫目標文件夾",
            file_path_required: "請指定文件路徑",
            content_required: "請填寫內容",
            properties_must_not_be_empty: "至少填寫一個屬性",
            property_configure_incompleted: "一個或多個屬性配置不完整",
            at_leat_one_field_required: "至少填寫一個字段",
            cleanup_target_required: "請指定清理目標",
            cleanup_heading_required: "請指定標題名稱",
            cleanup_properties_required: "請指定屬性名稱"
        }
    }


    const lang = getLanguage();
    let l;
    switch (lang) {
        case "zh-CN":
        case "zh":
            l = i18n["zh-CN"];
            break;
        case "zh-TW":
            l = i18n["zh-TW"];
            break;
        default:
            l = i18n["en"];
            break;
    }



    switch (action.type) {
        case FormActionType.CREATE_FILE:
            if (Strings.isEmpty(action.filePath)) {
                messages.push(l.file_path_required);
            }
            break;

        case FormActionType.INSERT_TEXT:
            if (action.targetFileType !== TargetFileType.CURRENT_FILE) {
                if (Strings.isEmpty(action.filePath)) {
                    messages.push(l.file_path_required);
                }
            }
            if (!action.content) {
                messages.push(l.content_required);
            }
            break;
        case FormActionType.GENERATE_FORM:
            if (!action.fields || action.fields.length === 0) {
                messages.push(l.at_leat_one_field_required);
            }
            break;

        case FormActionType.UPDATE_FRONTMATTER:
            if (action.targetFileType !== TargetFileType.CURRENT_FILE) {
                if (Strings.isEmpty(action.filePath)) {
                    messages.push(l.file_path_required);
                }
            }
            const propertyUpdates = action.propertyUpdates || [];
            if (propertyUpdates.length === 0) {
                messages.push(l.properties_must_not_be_empty);
            } else {
                const hasInvalidUpdate = propertyUpdates.some(
                    update => !update.name || update.value === undefined
                );
                if (hasInvalidUpdate) {
                    messages.push(l.property_configure_incompleted);
                }
            }
            break;

        case FormActionType.CONTENT_CLEANUP:
            const cleanupAction = action as ContentCleanupFormAction;
            switch (cleanupAction.cleanupType) {
                case CleanupType.DELETE_FILES:
                    if (!cleanupAction.targetFiles || cleanupAction.targetFiles.length === 0) {
                        messages.push(l.cleanup_target_required);
                    }
                    break;
                case CleanupType.DELETE_FOLDERS:
                    if (!cleanupAction.targetFolders || cleanupAction.targetFolders.length === 0) {
                        messages.push(l.cleanup_target_required);
                    }
                    break;
                case CleanupType.DELETE_HEADING_CONTENT:
                    if (Strings.isEmpty(cleanupAction.targetFilePath)) {
                        messages.push(l.file_path_required);
                    }
                    if (Strings.isEmpty(cleanupAction.headingName)) {
                        messages.push(l.cleanup_heading_required);
                    }
                    break;
                case CleanupType.CLEAR_TEXT_FORMAT:
                    if (Strings.isEmpty(cleanupAction.targetFilePath)) {
                        messages.push(l.file_path_required);
                    }
                    break;
            }
            break;
    }

    return {
        isValid: messages.length === 0,
        messages
    };
}