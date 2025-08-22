import { FormService, FormSubmitOptions } from "src/service/FormService";
import { FormConfig } from "../../model/FormConfig";
import "./CpsFormActionView.css";
import { CpsFormRenderView } from "./CpsFormRenderView";
import { FormIdValues } from "src/service/FormValues";
import { useObsidianApp } from "src/context/obsidianAppContext";
import { useState } from "react";
import { ActionContext } from "src/service/action/IActionService";
import { debugManager } from "src/utils/DebugManager";

type Props = {
	formConfig: FormConfig;
	options?: {
		afterSubmit?: (state: Record<string, any>) => void;
	};
	prefilledData?: Map<string, any>;
} & React.HTMLAttributes<HTMLDivElement>;

export default function (props: Props) {
	// 调试信息：记录CpsFormActionView组件初始化
	debugManager.log('CpsFormActionView', '组件初始化');
	debugManager.logObject('CpsFormActionView', 'props:', props);
	debugManager.logObject('CpsFormActionView', 'formConfig:', props.formConfig);
	debugManager.logObject('CpsFormActionView', 'prefilledData:', props.prefilledData);
	debugManager.log('CpsFormActionView', 'prefilledData 是否存在:', !!props.prefilledData);
	debugManager.log('CpsFormActionView', 'prefilledData 大小:', props.prefilledData ? props.prefilledData.size : 0);
	if (props.prefilledData && props.prefilledData.size > 0) {
		debugManager.log('CpsFormActionView', 'prefilledData 内容:');
		props.prefilledData.forEach((value, key) => {
			debugManager.log('CpsFormActionView', `  ${key}:`, value);
		});
	}
	
	const viewOptions = props.options ?? {};
	const { prefilledData } = props;
	const app = useObsidianApp();
	const { formConfig } = props;
	const [submitResult, setSubmitResult] = useState<ActionContext | null>(null);
	
	const onSubmit = async (values: FormIdValues) => {
		try {
			const context: FormSubmitOptions = {
				app: app,
			};
			const formService = new FormService();
			const result = await formService.submit(values, formConfig, context);
			setSubmitResult(result);
		} catch (error) {
			debugManager.error('CpsFormActionView', '表单提交失败:', error);
			throw error;
		}
	};

	// 如果有提交结果且包含输出变量，显示结果
	if (submitResult && submitResult.state.outputVariables && Object.keys(submitResult.state.outputVariables).length > 0) {
		return (
			<div className="form--CpsFormResult">
				<div className="form--CpsFormResultHeader">
					<h3>表单提交结果</h3>
					<button 
						onClick={() => setSubmitResult(null)}
						className="form--button"
					>
						返回表单
					</button>
				</div>
				<div className="form--CpsFormResultContent">
					{Object.entries(submitResult.state.outputVariables).map(([key, value]) => (
						<div key={key} className="form--CpsFormResultItem">
							<div className="form--CpsFormResultItemLabel">
								{key}:
							</div>
							<div className="form--CpsFormResultItemValue">
								{typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}

	// 调试信息：记录传递给CpsFormRenderView的数据
	debugManager.log('CpsFormActionView', '传递给 CpsFormRenderView:');
	debugManager.logObject('CpsFormActionView', 'formConfig:', formConfig);
	debugManager.logObject('CpsFormActionView', 'prefilledData:', prefilledData);
	
	return (
		<CpsFormRenderView
			formConfig={formConfig}
			onSubmit={onSubmit}
			afterSubmit={(values) => {
				viewOptions.afterSubmit?.(values);
			}}
			prefilledData={prefilledData}
		/>
	);
}
