import { useMemo } from "react";
import { MultipleComboboxSuggestion } from "./MultipleComboboxSuggestion";
import { isMultiTextProperty } from "src/utils/isMultiTextProperty";
import ComboboxSuggestion from "./ComboboxSuggestion";
import { useObsidianApp } from "src/context/obsidianAppContext";
import { getPropertyValues } from "src/utils/getPropertyValues";
import { FormFieldValue } from "src/service/FormValues";

export function PropertyValueSuggestInput(props: {
	id?: string;
	label?: string;
	placeholder?: string;
	name: string;
	value: string;
	onChange: (value: string | string[] | null) => void;
}) {
	const app = useObsidianApp();
	const { name, value, onChange } = props;
	const items = useMemo(() => {
		app.metadataTypeManager.getAllProperties().find;
		const options = getPropertyValues(app, name)
			.filter((f: FormFieldValue) => {
				if (f == null || f == undefined) {
					return false;
				}
				return true;
			})
			.map((v: FormFieldValue, index: number) => {
				return {
					label: String(v),
					value: String(v),
				};
			});
		return options;
	}, [name]);

	const isMultiple = isMultiTextProperty(app, name);

	return isMultiple ? (
		<MultipleComboboxSuggestion
			id={props.id}
			label={props.label}
			placeholder={props.placeholder}
			value={value}
			onChange={onChange}
			options={items}
		/>
	) : (
		<ComboboxSuggestion
			label={props.label}
			id={props.id}
			placeholder={props.placeholder}
			value={value}
			onChange={onChange}
			options={items}
		/>
	);
}
