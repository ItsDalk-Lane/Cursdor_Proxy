import { Presentation, Settings } from "lucide-react";
import { useState } from "react";
import { useForm } from "../../hooks/useForm";
import { FormConfig } from "../../model/FormConfig";
import CpsFormEditView from "../edit/CpsFormEditView";
import CpsFormActionView from "./CpsFormActionView";
import "./CpsFormFileView.css";
import { FormConfigContext } from "src/hooks/useFormConfig";
import { localInstance } from "src/i18n/locals";
import { debugManager } from "src/utils/DebugManager";

type Props = {
	filePath: string;
	formConfig: FormConfig;
	prefilledData?: Map<string, any>;
	options?: {
		hideHeader?: boolean;
		showFilePath?: boolean;
		afterSubmit?: (state: Record<string, any>) => void;
	};
} & React.HTMLAttributes<HTMLDivElement>;

export function CpsFormFileView(props: Props) {
	// 调试信息：记录CpsFormFileView组件初始化
	debugManager.log('CpsFormFileView', '组件初始化');
	debugManager.logObject('CpsFormFileView', 'props:', props);
	debugManager.log('CpsFormFileView', 'filePath:', props.filePath);
	debugManager.logObject('CpsFormFileView', 'formConfig:', props.formConfig);
	debugManager.logObject('CpsFormFileView', 'prefilledData:', props.prefilledData);
	debugManager.log('CpsFormFileView', 'prefilledData 是否存在:', !!props.prefilledData);
	debugManager.log('CpsFormFileView', 'prefilledData 大小:', props.prefilledData ? props.prefilledData.size : 0);
	
	const viewOptions = props.options || {};
	const [inEditing, setInEditing] = useState<boolean>(false);
	const { filePath, options, className, formConfig: config, prefilledData, ...rest } = props;
	const { formConfig, formFile } = useForm(filePath, props.formConfig);
	const fileName = formFile.split("/").pop() || "";
	const fileBasename = fileName.split(".")[0] || "";

	return (
		<FormConfigContext.Provider value={formConfig}>
			<div
				className={`form--CpsFormFileView ${className ?? ""}`}
				{...rest}
			>
				{viewOptions.hideHeader !== true && (
					<div
						className="form--CpsFormFileViewHeader"
						data-editing={inEditing}
					>
						{<div>{fileBasename}</div>}
						{inEditing ? (
							<button
								className="form--CpsFormFileViewModeButton"
								onClick={() => setInEditing(false)}
							>
								<Presentation size={16} />
								{localInstance.click_switch_to_preview_mode}
							</button>
						) : (
							<button
								className="form--CpsFormFileViewModeButton"
								onClick={() => setInEditing(true)}
							>
								<Settings size={16} />
							</button>
						)}
					</div>
				)}
				{inEditing === true ? (
					<CpsFormEditView
						defaultConfig={formConfig}
						filePath={formFile}
					/>
				) : (
					<>
						{/* 调试信息：记录传递给CpsFormActionView的数据 */}
						{(window as any).FormFlowPlugin?.settings?.enableDebugLogging && (() => {
							console.log('[CpsFormFileView] 传递给 CpsFormActionView:');
							console.log('[CpsFormFileView] formConfig:', formConfig);
							console.log('[CpsFormFileView] prefilledData:', prefilledData);
							console.log('[CpsFormFileView] options:', props.options);
							return null;
						})()}
						<CpsFormActionView
							formConfig={formConfig}
							prefilledData={prefilledData}
							options={props.options}
						/>
					</>
				)}
			</div>
		</FormConfigContext.Provider>
	);
}
