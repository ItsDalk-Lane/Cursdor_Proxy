import { IFormAction } from "src/model/action/IFormAction";
import { FormActionType } from "src/model/enums/FormActionType";
import CpsForm from "src/view/shared/CpsForm";
import CpsFormItem from "src/view/shared/CpsFormItem";
import { Network } from "lucide-react";
import { useMemo } from "react";

import { localInstance } from "src/i18n/locals";
import { CreateFileSetting } from "./create-file/CreateFileSetting";
import { GenerateFormSetting } from "./generate-form/OpenFormSetting";
import { InsertTextSetting } from "./insert-text/InsertTextSetting";
import { RunScriptSetting } from "./run-script/RunScriptSetting";
import { SuggestModalSetting } from "./suggest-modal/SuggestModalSetting";
import { UpdateFrontmatterSetting } from "./update-frontmatter/UpdateFrontmatterSetting";
import { OpenFileActionSetting } from "./open-file/OpenFileActionSetting";
import { OpenLinkActionSetting } from "./open-link/OpenLinkActionSetting";
import { ExecuteCommandActionSetting } from "./execute-command/ExecuteCommandActionSetting";
import { AICallActionSetting } from "./AICallActionSetting";
import { ContentCleanupSetting } from "./content-cleanup/ContentCleanupSetting";
import useFormConfig from "src/hooks/useFormConfig";

/**
 * 动作详细设置组件
 * 提供所有动作类型的通用设置和特定设置
 */
export default function (props: {
	value: IFormAction;
	onChange: (value: IFormAction) => void;
	onConditionClick?: () => void;
}) {
	const { value, onChange, onConditionClick } = props;
	const formConfig = useFormConfig();

	/**
	 * 计算执行条件数量
	 */
	const fieldConditionLength = useMemo(() => {
		if (!value.condition) {
			return 0;
		}
		if (!value.condition.conditions) {
			return 0;
		}
		return value.condition.conditions.length;
	}, [value.condition]);

	/**
	 * 处理标题变更
	 */
	const handleTitleChange = (title: string) => {
		const newValue = {
			...value,
			title: title || undefined, // 空字符串转为 undefined
		};
		onChange(newValue);
	};

	return (
		<CpsForm layout="horizontal">
			{/* 通用标题设置和执行条件设置 */}
			<CpsFormItem label={localInstance.title}>
				<div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
					<input
						type="text"
						value={value.title || ""}
						onChange={(e) => handleTitleChange(e.target.value)}
						placeholder={localInstance.action_title_placeholder || "请输入动作标题"}
						style={{
							flex: 1,
							height: "var(--input-height)",
							padding: "var(--size-4-1) var(--size-4-2)",
							backgroundColor: "var(--background-secondary)",
							border: "1px solid var(--background-modifier-border)",
							borderRadius: "var(--radius-s)",
							color: "var(--text-normal)",
							fontSize: "var(--font-ui-small)"
						}}
					/>
					{onConditionClick && (
						<button
							className="form--VisibilityConditionButton"
							data-has-condition={fieldConditionLength > 0}
							onClick={onConditionClick}
							style={{
								flexShrink: 0,
								height: "var(--input-height)",
								whiteSpace: "nowrap"
							}}
						>
							<Network size={14} />
							{localInstance.execute_condition}
							{fieldConditionLength > 0 && ` + ${fieldConditionLength}`}
						</button>
					)}
				</div>
			</CpsFormItem>

			{/* 各种动作类型的特定设置 */}
			<CreateFileSetting value={value} onChange={onChange} />
			<InsertTextSetting value={value} onChange={onChange} />
			<UpdateFrontmatterSetting value={value} onChange={onChange} />
			<RunScriptSetting value={value} onChange={onChange} />
			<SuggestModalSetting value={value} onChange={onChange} />
			<GenerateFormSetting value={value} onChange={onChange} />
			<OpenFileActionSetting value={value} onChange={onChange} />
			<OpenLinkActionSetting value={value} onChange={onChange} />
			<ExecuteCommandActionSetting value={value} onChange={onChange} />
			<AICallActionSetting 
				value={value} 
				config={formConfig}
				onChange={onChange} 
			/>
			<ContentCleanupSetting value={value} onChange={onChange} />
		</CpsForm>
	);
}
