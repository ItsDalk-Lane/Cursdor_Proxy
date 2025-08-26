import { DropIndicator } from "@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box";
import {
	CircleAlert,
	ChevronDown,
	ChevronRight,
	Copy,
	Trash2,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useActionTitle } from "src/hooks/useActionTitle";
import { useActionTypeStyle } from "src/hooks/useActionTypeStyle";
import { useActionValidation } from "src/hooks/useActionValidation";
import { localInstance } from "src/i18n/locals";
import { IFormAction } from "src/model/action/IFormAction";
import { ContentTemplateSource } from "src/model/action/CreateFileFormAction";
import { CleanupType } from "src/model/action/ContentCleanupFormAction";
import { FormActionType } from "src/model/enums/FormActionType";
import { OpenPageInType } from "src/model/enums/OpenPageInType";
import { TargetFileType } from "src/model/enums/TargetFileType";
import { TextInsertPosition } from "src/model/enums/TextInsertPosition";
import { Filter, FilterType } from "src/model/filter/Filter";
import { OperatorType } from "src/model/filter/OperatorType";
import { FormCondition } from "src/view/shared/filter-content/FormCondition";
import { v4 } from "uuid";
import ActionTypeSelect from "./common/ActionTypeSelect";
import CpsFormActionDetailSetting from "./CpsFormActionDetailSetting";
import useSortableItem from "src/hooks/useSortableItem";
import { ConfirmPopover } from "src/component/confirm/ConfirmPopover";
import { DragHandler } from "src/component/drag-handler/DragHandler";
import Dialog2 from "src/component/dialog/Dialog2";
import { FilterRoot } from "src/component/filter/FilterRoot";
import "./CpsFormAction.css";

/**
 * 转换动作类型时保留通用字段并初始化特定字段
 * @param currentAction 当前动作
 * @param newType 新的动作类型
 * @returns 转换后的动作
 */
function convertActionType(currentAction: IFormAction, newType: FormActionType): any {
	const baseAction = {
		id: currentAction.id,
		type: newType,
		condition: currentAction.condition, // 保留条件设置
	};

	switch (newType) {
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
		case FormActionType.INSERT_TEXT:
			return {
				...baseAction,
				type: FormActionType.INSERT_TEXT,
				filePath: "",
				targetFolder: "",
				fileName: "",
				openPageIn: OpenPageInType.none,
				newFileTemplate: "",
				targetFileType: TargetFileType.CURRENT_FILE,
				position: TextInsertPosition.END_OF_CONTENT,
				heading: "",
				content: "",
			};
		default:
			// 对于其他类型，保持原有逻辑
			return {
				...currentAction,
				type: newType,
			};
	}
}

export default function (props: {
	value: IFormAction;
	onChange: (action: IFormAction) => void;
	onDelete: (action: IFormAction) => void;
	onDuplicate: (action: IFormAction) => void;
	defaultOpen?: boolean;
}) {
	const [open, setOpen] = useState(props.defaultOpen === true);
	const { value, onDelete, onDuplicate } = props;
	const { closestEdge, dragging, draggedOver, setElRef, setDragHandleRef } =
		useSortableItem(value.id);
	const saveAction = (action: IFormAction) => {
		props.onChange(action);
	};
	const result = useActionValidation(value);
	const heading = useActionTitle(value);

	const title = useMemo(() => {
		return heading.title;
	}, [heading.title]);

	const [openCondition, setOpenCondition] = useState(false);
	const condition: Filter = value.condition ?? {
		id: v4(),
		type: FilterType.group,
		operator: OperatorType.And,
		conditions: [],
	};
	return (
		<div
			className="form--CpsFormActionSetting"
			data-is-valid={result.isValid}
			ref={setElRef}
		>
			{!result.isValid && (
				<span className="form--CpsFormActionErrorTips">
					<CircleAlert size={16} />
					{result.validationMessages[0] || ""}
				</span>
			)}
			<CpsFormAcionHeader
				title={title}
				value={value}
				open={open}
				onOpenChange={setOpen}
				onChange={saveAction}
				onDelete={onDelete}
				onDuplicate={onDuplicate}
				setDragHandleRef={setDragHandleRef}
			/>
			{open && (
				<div className="form--CpsFormActionContent">
					<CpsFormActionDetailSetting
						value={value}
						onChange={saveAction}
						onConditionClick={() => setOpenCondition(true)}
					/>
				</div>
			)}
			<Dialog2
				open={openCondition}
				onOpenChange={function (open: boolean): void {
					setOpenCondition(open);
				}}
			>
				{(close) => {
					return (
						<FilterRoot
							filter={condition}
							onFilterChange={(filter: Filter) => {
								const newValue = {
									...value,
									condition: filter,
								};
								saveAction(newValue);
							}}
							filterContentComponent={FormCondition}
						/>
					);
				}}
			</Dialog2>
			{closestEdge && <DropIndicator edge={closestEdge} gap="1px" />}
		</div>
	);
}

function CpsFormAcionHeader(props: {
	title: React.ReactNode;
	value: IFormAction;
	open: boolean;
	onChange: (action: IFormAction) => void;
	onOpenChange: (open: boolean) => void;
	onDelete: (action: IFormAction) => void;
	onDuplicate: (action: IFormAction) => void;
	setDragHandleRef: (ref: HTMLDivElement | null) => void;
}) {
	const { value, open, setDragHandleRef, title } = props;

	const typeStyles = useActionTypeStyle(value.type);

	return (
		<div
			className="form--CpsFormActionHeader"
			onClick={(e) => {
				if (e.target === e.currentTarget) {
					props.onOpenChange(!open);
				}
			}}
		>
			<DragHandler
				ref={setDragHandleRef}
				aria-label={localInstance.drag_and_drop_to_reorder}
			/>

			<ActionTypeSelect
				value={value.type}
				styles={typeStyles}
				onChange={(type) => {
					const newAction = convertActionType(value, type);
					props.onChange(newAction);
				}}
			/>
			<div
				className="form--CpsFormActionHeaderTitle"
				onClick={(e) => {
					if (e.target === e.currentTarget) {
						props.onOpenChange(!open);
					}
				}}
			>
				{title}
			</div>
			<div className="form--CpsFormActionHeaderControl">
				<button
					className="clickable-icon"
					aria-label={
						open ? localInstance.fold : localInstance.expand
					}
					onClick={() => props.onOpenChange(!open)}
				>
					{open ? (
						<ChevronDown size={14} />
					) : (
						<ChevronRight size={14} />
					)}
				</button>
				<button
					className="clickable-icon"
					aria-label={localInstance.duplicate}
					onClick={() => props.onDuplicate(value)}
				>
					<Copy />
				</button>
				<ConfirmPopover
					onConfirm={() => {
						props.onDelete(value);
					}}
					title={localInstance.confirm_to_delete}
				>
					<button
						className="clickable-icon"
						data-type="danger"
						aria-label={localInstance.delete}
					>
						<Trash2 size={14} />
					</button>
				</ConfirmPopover>
			</div>
		</div>
	);
}
