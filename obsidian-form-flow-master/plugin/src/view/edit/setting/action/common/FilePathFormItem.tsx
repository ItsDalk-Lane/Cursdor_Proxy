import { Popover as RadixPopover } from "radix-ui";
import "./FilePathFormItem.css";
import { FileEdit } from "lucide-react";
import { TFile, Notice } from "obsidian";
import { useMemo, useCallback, useState, useRef, useEffect } from "react";
import { useObsidianApp } from "src/context/obsidianAppContext";
import { localInstance } from "src/i18n/locals";
import { openFilePathDirectly } from "src/utils/openFilePathDirectly";
import { Strings } from "src/utils/Strings";
import CpsFormItem from "src/view/shared/CpsFormItem";
import useFormConfig from "src/hooks/useFormConfig";
import { usePathVariables } from "src/hooks/usePathVariables";
import { advancedSearch, highlightMatches, SearchResult } from "src/utils/searchUtils";

export function FilePathFormItem(props: {
	label: string;
	value: string | undefined;
	placeholder?: string;
	onChange: (value: string) => void;
	actionId?: string; // 新增，用于获取表单变量
}) {
	const { value, onChange, actionId } = props;

	const app = useObsidianApp();
	const exists = useMemo(() => {
		if (Strings.isBlank(value)) {
			return false;
		}
		const file = app.vault.getAbstractFileByPath(value || "");
		if (file instanceof TFile) {
			return true;
		}
		return false;
	}, [value]);

	const openFile = useCallback((filePath: string) => {
		if (!filePath) {
			new Notice(localInstance.file_not_found);
			return;
		}
		const file = app.vault.getAbstractFileByPath(filePath);
		if (!file) {
			new Notice(localInstance.file_not_found + ": " + filePath);
			return;
		}
		openFilePathDirectly(app, filePath, "modal");
	}, []);

	return (
		<CpsFormItem label={props.label}>
			<AllFilesList
				value={value || ""}
				actionId={actionId}
				onChange={(value) => {
					onChange(value);
				}}
			/>
			{exists && (
				<button
					onClick={() => {
						openFile(value || "");
					}}
				>
					<FileEdit size={16} />
				</button>
			)}
		</CpsFormItem>
	);
}

function AllFilesList(props: {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	actionId?: string; // 新增，用于获取表单变量
}) {
	const { value, onChange, actionId } = props;
	const [open, setOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(-1);
	const contentRef = useRef<HTMLDivElement>(null);
	const listRef = useRef<HTMLDivElement>(null);
	const app = useObsidianApp();
	const formConfig = useFormConfig();
	
	// 获取表单变量（排除文件内容字段）
	const variables = actionId ? usePathVariables(actionId, formConfig) : [];
	
	const items = useMemo(() => {
		// 获取所有文件，包括各种扩展名的文件
		const files = app.vault.getFiles();
		
		// 如果输入内容以 @ 开头，显示变量选项
		const safeValue = value || "";
		const isVariableMode = safeValue.trim().startsWith('@') || safeValue.includes('{{@');
		
		let variableResults: SearchResult<any>[] = [];
		if (isVariableMode && variables.length > 0) {
			const searchText = safeValue.trim().replace('@', '').replace('{{', '').replace('}}', '');
			variableResults = advancedSearch(
				variables,
				searchText,
				(v) => v.label,
				50
			).map(result => ({
				...result,
				item: {
					id: `var_${result.item.label}`,
					value: `{{@${result.item.label}}}`,
					label: `{{@${result.item.label}}}`,
					type: 'variable' as const,
					searchResult: result
				}
			}));
		}
		
		// 使用高级搜索算法搜索文件
		const fileResults = advancedSearch(
			files,
			value || "",
			(f) => f.path,
			100
		).map(result => ({
			...result,
			item: {
				id: result.item.path,
				value: result.item.path,
				label: result.item.path,
				type: 'file' as const,
				searchResult: result
			}
		}));
		
		// 合并变量和文件结果，变量优先
		const allResults = [...variableResults, ...fileResults];
		
		// 如果没有搜索词，返回前100个文件
		if (!value || value.trim() === '') {
			return files.slice(0, 100).map((f) => ({
				id: f.path,
				value: f.path,
				label: f.path,
				type: 'file' as const,
				searchResult: null
			}));
		}
		
		return allResults.map(result => result.item);
	}, [value, variables, app.vault]);

	// 滚动到活跃项
	useEffect(() => {
		if (activeIndex >= 0 && activeIndex < items.length && listRef.current) {
			const activeItemId = items[activeIndex].id;
			const activeItem = listRef.current.querySelector(
				`[data-id="${activeItemId}"]`
			);

			if (activeItem) {
				activeItem.scrollIntoView({
					block: "nearest",
					inline: "nearest",
				});
			}
		}
	}, [activeIndex, items]);

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		// is composing
		if (event.nativeEvent.isComposing) {
			return;
		}
		
		// 当输入 @ 符号时，如果有表单变量，自动打开下拉列表
		if (event.key === '@' && variables.length > 0 && !open) {
			setOpen(true);
			return;
		}
		
		if (event.key === "ArrowDown") {
			event.preventDefault();
			setActiveIndex((prevIndex) =>
				prevIndex < items.length - 1 ? prevIndex + 1 : 0
			);
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			setActiveIndex((prevIndex) =>
				prevIndex > 0 ? prevIndex - 1 : items.length - 1
			);
		} else if (event.key === "Enter") {
			event.preventDefault();
			if (activeIndex >= 0 && activeIndex < items.length) {
				const selectedItem = items[activeIndex];
				onChange(selectedItem.value);
			}
			setOpen(false);
		}
	};

	return (
		<RadixPopover.Root open={open} onOpenChange={setOpen}>
			<RadixPopover.Trigger asChild>
				<span className="form--FormFilePathSuggestTrigger">
					{value}
				</span>
			</RadixPopover.Trigger>
			<RadixPopover.Portal
				container={window.activeWindow.activeDocument.body}
			>
				<RadixPopover.Content
					className="form--FormFilePathSuggestContent"
					sideOffset={4}
					collisionPadding={{
						left: 16,
						right: 16,
						top: 8,
						bottom: 8,
					}}
					ref={contentRef}
				>
					<input
						type="text"
						className="form--FormFilePathSuggestInput"
						value={value}
						onChange={(e) => {
							const newValue = e.target.value;
							onChange(newValue);
						}}
						placeholder={props.placeholder}
						onKeyDown={handleKeyDown}
					/>
					<div
						className="form--FormFilePathSuggestList"
						ref={listRef}
					>
						{items.map((item, index) => {
							// 获取高亮文本
							const getHighlightedLabel = () => {
								if (item.searchResult && item.searchResult.matchedIndices.length > 0) {
									const searchText = item.type === 'variable' ? item.label.replace('{{@', '').replace('}}', '') : item.label;
									return highlightMatches(searchText, item.searchResult.matchedIndices);
								}
								return item.label;
							};
							
							return (
								<div
									key={item.id}
									className={`form--FormFilePathSuggestItem ${item.type === 'variable' ? 'form--FormFilePathSuggestItem--variable' : ''}`}
									data-highlighted={
										activeIndex === index ? "true" : "false"
									}
									data-id={item.id}
									onClick={() => {
										onChange(item.value);
										setOpen(false);
									}}
									title={item.label} // 添加完整路径的提示
								>
									{item.type === 'variable' && <span className="form--VariableIcon">@</span>}
									<span 
										dangerouslySetInnerHTML={{ __html: getHighlightedLabel() }}
									/>
								</div>
							);
						})}
					</div>
				</RadixPopover.Content>
			</RadixPopover.Portal>
		</RadixPopover.Root>
	);
}
