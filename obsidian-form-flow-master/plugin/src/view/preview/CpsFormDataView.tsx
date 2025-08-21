import { FormConfigContext } from "src/hooks/useFormConfig";
import { FormConfig } from "../../model/FormConfig";
import CpsFormActionView from "./CpsFormActionView";
import "./CpsFormDataView.css";

type Props = {
	formConfig: FormConfig;
	options?: {
		afterSubmit?: (state: Record<string, any>) => void;
	};
	prefilledData?: Map<string, any>;
} & React.HTMLAttributes<HTMLDivElement>;

export function CpsFormDataView(props: Props) {
	const { options, className, formConfig, prefilledData, ...rest } = props;
	return (
		<FormConfigContext.Provider value={formConfig}>
			<div
				className={`form--CpsFormDataView ${className ?? ""}`}
				{...rest}
			>
				<CpsFormActionView
					formConfig={formConfig}
					options={props.options}
					prefilledData={prefilledData}
				/>
			</div>
		</FormConfigContext.Provider>
	);
}
