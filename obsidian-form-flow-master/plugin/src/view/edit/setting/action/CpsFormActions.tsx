import { localInstance } from "src/i18n/locals";
import { IFormAction } from "src/model/action/IFormAction";
import { ContentTemplateSource } from "src/model/action/CreateFileFormAction";
import { CleanupType } from "src/model/action/ContentCleanupFormAction";
import { FormActionType } from "src/model/enums/FormActionType";
import { OpenPageInType } from "src/model/enums/OpenPageInType";
import { FormConfig } from "src/model/FormConfig";
import { getActionsCompatible } from "src/utils/getActionsCompatible";
import { v4 } from "uuid";
import FormVariableQuotePanel from "./common/variable-quoter/FormVariableQuotePanel";
import CpsFormAction from "./CpsFormAction";
import useSortable from "src/hooks/useSortable";

/**
 * 创建新动作的工厂函数
 * @param type 动作类型
 * @returns 初始化的动作对象
 */
function createNewAction(type: FormActionType): any {
	const baseAction = {
		id: v4(),
		type: type,
	};

	switch (type) {
		case FormActionType.CREATE_FILE:
			return {
				...baseAction,
				type: FormActionType.CREATE_FILE,
				targetFolder: "",
				fileName: "",
				contentTemplateSource: ContentTemplateSource.TEXT,
				content: "",
				templateFile: "",
				openPageIn: OpenPageInType.none,
			};
		case FormActionType.CONTENT_CLEANUP:
			return {
				...baseAction,
				type: FormActionType.CONTENT_CLEANUP,
				cleanupType: CleanupType.DELETE_FILES,
				targetFiles: [""], // 确保初始化时就有一个空的输入框
				requireConfirmation: false,
				enableDebug: false,
			};
		case FormActionType.COPY_AS_RICH_TEXT:
			return {
				...baseAction,
				type: FormActionType.COPY_AS_RICH_TEXT,
				targetMode: 'current',
				includeImages: true,
				maxImageSize: 10,
				imageQuality: 85,
			};
		case FormActionType.CONVERT_IMAGE_LINKS:
			return {
				...baseAction,
				type: FormActionType.CONVERT_IMAGE_LINKS,
				targetMode: 'current',
				backupOriginal: false,
				preserveDisplayText: true,
			};
		case FormActionType.ADD_SPACES_BETWEEN_CJK_AND_LATIN:
			return {
				...baseAction,
				type: FormActionType.ADD_SPACES_BETWEEN_CJK_AND_LATIN,
				targetMode: 'current',
				tabWidth: '4',
				formatEmbeddedCode: false,
				preserveCodeBlocks: true,
			};
		default:
			return {
				...baseAction,
				type: FormActionType.CREATE_FILE,
				targetFolder: "",
				fileName: "",
				contentTemplateSource: ContentTemplateSource.TEXT,
				content: "",
				templateFile: "",
				openPageIn: OpenPageInType.none,
			};
	}
}

export function CpsFormActions(props: {
	config: FormConfig;
	onChange: (actions: IFormAction[]) => void;
}) {
	const { config } = props;
	const saveAction = (action: IFormAction[]) => {
		props.onChange(action);
	};

	const actions = getActionsCompatible(config);
	useSortable({
		items: actions || [],
		getId: (item) => item.id,
		onChange: (orders) => {
			props.onChange(orders);
		},
	});

	const addAction = () => {
		const newAction = createNewAction(FormActionType.CONTENT_CLEANUP);
		const newActions = [...actions, newAction];
		saveAction(newActions);
	};

	return (
		<div className="form--CpsFormActionsSetting">
			<FormVariableQuotePanel formConfig={config} />
			{actions.map((action, index) => {
				return (
					<CpsFormAction
						key={action.id}
						value={action}
						defaultOpen={actions.length === 1}
						onChange={(v) => {
							const newActions = actions.map((a, i) => {
								if (v.id === a.id) {
									return v;
								}
								return a;
							});
							saveAction(newActions);
						}}
						onDelete={(v) => {
							const newActions = actions.filter(
								(a) => a.id !== v.id
							);
							saveAction(newActions);
						}}
						onDuplicate={(v) => {
							const newAction = {
								...v,
								id: v4(),
							};
							const originIndex = actions.findIndex(
								(a) => a.id === v.id
							);
							const newActions = [
								...actions.slice(0, originIndex + 1),
								newAction,
								...actions.slice(originIndex + 1),
							];
							saveAction(newActions);
						}}
					/>
				);
			})}
			<button className="form--AddButton" onClick={addAction}>
				+ {localInstance.add_action}
			</button>
		</div>
	);
}
