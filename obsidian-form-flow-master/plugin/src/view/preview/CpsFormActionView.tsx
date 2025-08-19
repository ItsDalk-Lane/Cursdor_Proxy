import { FormService, FormSubmitOptions } from "src/service/FormService";
import { FormConfig } from "../../model/FormConfig";
import "./CpsFormActionView.css";
import { CpsFormRenderView } from "./CpsFormRenderView";
import { FormIdValues } from "src/service/FormValues";
import { useObsidianApp } from "src/context/obsidianAppContext";
import { useState } from "react";
import { ActionContext } from "src/service/action/IActionService";

type Props = {
	formConfig: FormConfig;
	options?: {
		afterSubmit?: (state: Record<string, any>) => void;
	};
} & React.HTMLAttributes<HTMLDivElement>;

export default function (props: Props) {
	const viewOptions = props.options || {};
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
			console.error('表单提交失败:', error);
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

	return (
		<CpsFormRenderView
			formConfig={formConfig}
			onSubmit={onSubmit}
			afterSubmit={(state) => {
				viewOptions.afterSubmit?.(state);
			}}
		/>
	);
}
