import { localInstance } from "src/i18n/locals";
import { IFormAction } from "src/model/action/IFormAction";
import { ContentCleanupFormAction, CleanupType } from "src/model/action/ContentCleanupFormAction";
import { FormActionType } from "src/model/enums/FormActionType";
import CpsFormItem from "src/view/shared/CpsFormItem";
import OptimizedFormItem from "src/view/shared/OptimizedFormItem";
import Toggle from "src/view/shared/Toggle";
import MultiSelect, { MultiSelectOption } from "src/view/shared/MultiSelect";
import { FilePathFormItem } from "../common/FilePathFormItem";
import { Trash2, Plus } from "lucide-react";
import { useState } from "react";

/**
 * 内容清理动作设置组件
 * 提供删除文件、文件夹、标题内容和清除文本格式的配置界面
 */
export function ContentCleanupSetting(props: {
	value: IFormAction;
	onChange: (value: IFormAction) => void;
}) {
	const { value } = props;
	if (value.type !== FormActionType.CONTENT_CLEANUP) {
		return null;
	}
	const action = value as ContentCleanupFormAction;

	/**
	 * 更新动作配置
	 */
	const updateAction = (updates: Partial<ContentCleanupFormAction>) => {
		const newAction = { ...action, ...updates };
		props.onChange(newAction);
	};

	// MultiSelect选项定义
	const basicFormatOptions: MultiSelectOption[] = [
		{ value: 'clearBold', label: '清除粗体格式', description: '**文本** 和 __文本__' },
		{ value: 'clearItalic', label: '清除斜体格式', description: '*文本* 和 _文本_' },
		{ value: 'clearStrikethrough', label: '清除删除线格式', description: '~~文本~~' },
		{ value: 'clearHighlight', label: '清除高亮格式', description: '==文本==' },
		{ value: 'clearInlineCode', label: '清除行内代码格式', description: '`代码`' }
	];

	const linkMediaOptions: MultiSelectOption[] = [
		{ value: 'clearLinks', label: '清除链接格式', description: '保留链接文本' },
		{ value: 'clearImages', label: '清除图片格式', description: '移除图片引用' }
	];

	const structureOptions: MultiSelectOption[] = [
		{ value: 'clearHeadings', label: '清除标题格式', description: '# ## ###' },
		{ value: 'clearQuotes', label: '清除引用格式', description: '> 引用文本' },
		{ value: 'clearLists', label: '清除列表格式', description: '- * + 和数字列表' },
		{ value: 'clearTables', label: '清除表格格式', description: '移除表格结构' }
	];

	const advancedOptions: MultiSelectOption[] = [
		{ value: 'clearComments', label: '清除注释', description: '%% 注释 %%' },
		{ value: 'clearFootnotes', label: '清除脚注', description: '[^1] 和脚注定义' },
		{ value: 'clearMathBlocks', label: '清除数学块', description: '$$ 数学公式 $$ 和 $ 行内公式 $' },
		{ value: 'clearProperties', label: '清除属性', description: '--- frontmatter ---' }
	];

	/**
	 * 获取选中的格式选项
	 */
	const getSelectedFormatOptions = (category: 'basic' | 'linkMedia' | 'structure' | 'advanced'): string[] => {
		const formatOptions = action.formatClearOptions || {};
		const options = {
			basic: basicFormatOptions,
			linkMedia: linkMediaOptions,
			structure: structureOptions,
			advanced: advancedOptions
		}[category];

		return options.filter(option => formatOptions[option.value as keyof typeof formatOptions]).map(option => option.value);
	};

	/**
	 * 更新格式选项
	 */
	const updateFormatOptions = (category: 'basic' | 'linkMedia' | 'structure' | 'advanced', selectedValues: string[]) => {
		const formatOptions = action.formatClearOptions || {};
		const options = {
			basic: basicFormatOptions,
			linkMedia: linkMediaOptions,
			structure: structureOptions,
			advanced: advancedOptions
		}[category];

		// 创建新的格式选项对象
		const newFormatOptions = { ...formatOptions };
		
		// 重置当前类别的所有选项
		options.forEach(option => {
			newFormatOptions[option.value as keyof typeof newFormatOptions] = selectedValues.includes(option.value);
		});

		updateAction({ formatClearOptions: newFormatOptions });
	};

	/**
	 * 添加文件路径
	 */
	const addFilePath = () => {
		const currentFiles = action.targetFiles || [];
		updateAction({ targetFiles: [...currentFiles, ""] });
	};

	/**
	 * 删除文件路径
	 */
	const removeFilePath = (index: number) => {
		const currentFiles = action.targetFiles || [];
		const newFiles = currentFiles.filter((_, i) => i !== index);
		// 确保至少保留一个空的输入框
		if (newFiles.length === 0) {
			newFiles.push("");
		}
		updateAction({ targetFiles: newFiles });
	};

	/**
	 * 更新文件路径
	 */
	const updateFilePath = (index: number, value: string) => {
		const currentFiles = action.targetFiles || [];
		const newFiles = [...currentFiles];
		newFiles[index] = value;
		updateAction({ targetFiles: newFiles });
	};

	/**
	 * 添加文件夹路径
	 */
	const addFolderPath = () => {
		const currentFolders = action.targetFolders || [];
		updateAction({ targetFolders: [...currentFolders, ""] });
	};

	/**
	 * 删除文件夹路径
	 */
	const removeFolderPath = (index: number) => {
		const currentFolders = action.targetFolders || [];
		const newFolders = currentFolders.filter((_, i) => i !== index);
		// 确保至少保留一个空的输入框
		if (newFolders.length === 0) {
			newFolders.push("");
		}
		updateAction({ targetFolders: newFolders });
	};

	/**
	 * 更新文件夹路径
	 */
	const updateFolderPath = (index: number, value: string) => {
		const currentFolders = action.targetFolders || [];
		const newFolders = [...currentFolders];
		newFolders[index] = value;
		updateAction({ targetFolders: newFolders });
	};





	return (
		<>
			{/* 清理类型选择 */}
			<OptimizedFormItem 
				label="清理类型"
				description="选择要执行的清理操作类型"
			>
				<select
					value={action.cleanupType || CleanupType.DELETE_FILES}
					onChange={(e) => {
						updateAction({ cleanupType: e.target.value as CleanupType });
					}}
				>
					<option value={CleanupType.DELETE_FILES}>删除文件</option>
					<option value={CleanupType.DELETE_FOLDERS}>删除文件夹</option>
					<option value={CleanupType.DELETE_HEADING_CONTENT}>删除标题下内容</option>
					<option value={CleanupType.CLEAR_TEXT_FORMAT}>清除文本格式</option>
				</select>
			</OptimizedFormItem>

			{/* 删除文件配置 */}
			{action.cleanupType === CleanupType.DELETE_FILES && (
				<OptimizedFormItem 
					label="目标文件"
					description="指定要删除的文件路径，支持相对路径和绝对路径"
				>
					<div className="content-cleanup-item">
						<div className="content-cleanup-list">
							{/* 确保至少显示一个输入框 */}
							{(action.targetFiles && action.targetFiles.length > 0 ? action.targetFiles : [""]).map((filePath, index) => (
								<div key={index} className="content-cleanup-item">
									<div className="content-cleanup-file-input-wide">
										<FilePathFormItem
											label=""
											value={filePath}
											placeholder="文件路径"
											actionId={action.id}
											onChange={(value) => updateFilePath(index, value)}
										/>
									</div>
									<button
										type="button"
										className="content-cleanup-remove-btn"
										onClick={() => removeFilePath(index)}
									>
										<Trash2 size={16} />
									</button>
									<button
										type="button"
										className="content-cleanup-add-btn"
										onClick={addFilePath}
									>
										<Plus size={16} />
									</button>
								</div>
							))}
						</div>
					</div>
				</OptimizedFormItem>
			)}

			{/* 删除文件夹配置 */}
			{action.cleanupType === CleanupType.DELETE_FOLDERS && (
				<>
					<OptimizedFormItem 
						label="目标文件夹"
						description="指定要删除的文件夹路径，支持相对路径和绝对路径"
					>
						<div className="content-cleanup-item">
							<div className="content-cleanup-list">
								{/* 确保至少显示一个输入框 */}
								{(action.targetFolders && action.targetFolders.length > 0 ? action.targetFolders : [""]).map((folderPath, index) => (
									<div key={index} className="content-cleanup-item">
										<div className="content-cleanup-file-input-wide">
											<FilePathFormItem
												label=""
												value={folderPath}
												placeholder="文件夹路径"
												actionId={action.id}
												onChange={(value) => updateFolderPath(index, value)}
											/>
										</div>
										<button
											type="button"
											className="content-cleanup-remove-btn"
											onClick={() => removeFolderPath(index)}
										>
											<Trash2 size={16} />
										</button>
										<button
											type="button"
											className="content-cleanup-add-btn"
											onClick={addFolderPath}
										>
											<Plus size={16} />
										</button>
									</div>
								))}
							</div>
						</div>
					</OptimizedFormItem>
					<OptimizedFormItem 
						label="递归删除"
						description="同时删除文件夹内的所有子文件夹和文件"
					>
						<Toggle
							checked={action.recursive || false}
							onChange={(checked) => updateAction({ recursive: checked })}
						/>
					</OptimizedFormItem>
				</>
			)}

			{/* 删除标题下内容配置 */}
			{action.cleanupType === CleanupType.DELETE_HEADING_CONTENT && (
				<>
					<OptimizedFormItem 
						label="目标文件"
						description="指定要处理的文件，留空则使用当前文件"
					>
						<FilePathFormItem
							label=""
							value={action.targetFilePath || ""}
							actionId={action.id}
							placeholder="留空使用当前文件"
							onChange={(value) => updateAction({ targetFilePath: value })}
						/>
					</OptimizedFormItem>
					<OptimizedFormItem 
						label="标题名称"
						description="指定要删除内容的标题名称"
					>
						<input
							type="text"
							value={action.headingName || ""}
							placeholder="要删除内容的标题名称"
							onChange={(e) => updateAction({ headingName: e.target.value })}
						/>
					</OptimizedFormItem>
					<OptimizedFormItem 
						label="删除模式"
						description="开启时删除到同级或更高级标题为止，关闭时只删除正文内容"
					>
						<Toggle
							checked={action.deleteToSameLevelHeading !== false}
							onChange={(checked) => updateAction({ deleteToSameLevelHeading: checked })}
						/>
					</OptimizedFormItem>
				</>
			)}



			{/* 清除文本格式配置 */}
			{action.cleanupType === CleanupType.CLEAR_TEXT_FORMAT && (
				<>
					<OptimizedFormItem 
						label="目标文件"
						description="指定要处理的文件，留空则使用当前文件"
					>
						<FilePathFormItem
							label=""
							value={action.targetFilePath || ""}
							actionId={action.id}
							placeholder="留空使用当前文件"
							onChange={(value) => updateAction({ targetFilePath: value })}
						/>
					</OptimizedFormItem>
					
					{/* 一键清除所有格式 */}
					<OptimizedFormItem 
						label="一键清除所有格式"
						description="开启后将清除所有文本格式，忽略下方的单独设置"
					>
						<Toggle
							checked={action.formatClearOptions?.clearAll || false}
							onChange={(checked) => {
								const formatOptions = action.formatClearOptions || {};
								updateAction({ 
									formatClearOptions: { 
										...formatOptions, 
										clearAll: checked 
									} 
								});
							}}
						/>
					</OptimizedFormItem>
					
					{/* 单独格式控制 */}
					{!action.formatClearOptions?.clearAll && (
						<>
							<OptimizedFormItem 
								label="基础格式"
								description="选择要清除的基础文本格式"
							>
								<MultiSelect
									options={basicFormatOptions}
									value={getSelectedFormatOptions('basic')}
									onChange={(values) => updateFormatOptions('basic', values)}
									placeholder="选择要清除的基础格式"
								/>
							</OptimizedFormItem>
							
							<OptimizedFormItem 
								label="链接和媒体"
								description="选择要清除的链接和媒体格式"
							>
								<MultiSelect
									options={linkMediaOptions}
									value={getSelectedFormatOptions('linkMedia')}
									onChange={(values) => updateFormatOptions('linkMedia', values)}
									placeholder="选择要清除的链接和媒体格式"
								/>
							</OptimizedFormItem>
							
							<OptimizedFormItem 
								label="结构格式"
								description="选择要清除的结构性格式"
							>
								<MultiSelect
									options={structureOptions}
									value={getSelectedFormatOptions('structure')}
									onChange={(values) => updateFormatOptions('structure', values)}
									placeholder="选择要清除的结构格式"
								/>
							</OptimizedFormItem>
							
							<OptimizedFormItem 
								label="高级格式"
								description="选择要清除的高级格式和特殊元素"
							>
								<MultiSelect
									options={advancedOptions}
									value={getSelectedFormatOptions('advanced')}
									onChange={(values) => updateFormatOptions('advanced', values)}
									placeholder="选择要清除的高级格式"
								/>
							</OptimizedFormItem>
						</>
					)}
				</>
			)}

			{/* 确认配置 */}
			<OptimizedFormItem 
				label="需要确认"
				description="执行前显示确认对话框"
			>
				<Toggle
					checked={action.requireConfirmation || false}
					onChange={(checked) => updateAction({ requireConfirmation: checked })}
				/>
			</OptimizedFormItem>

			{/* 确认消息 */}
			{action.requireConfirmation && (
				<OptimizedFormItem 
					label="确认消息"
					description="自定义确认对话框中显示的消息"
				>
					<input
						type="text"
						value={action.confirmationMessage || ""}
						placeholder="确认要执行此清理操作吗？"
						onChange={(e) => updateAction({ confirmationMessage: e.target.value })}
					/>
				</OptimizedFormItem>
			)}

			{/* 调试开关 */}
			<OptimizedFormItem 
				label="启用调试"
				description="在控制台输出详细的调试信息"
			>
				<Toggle
					checked={action.enableDebug || false}
					onChange={(checked) => updateAction({ enableDebug: checked })}
				/>
			</OptimizedFormItem>
		</>
	);
}