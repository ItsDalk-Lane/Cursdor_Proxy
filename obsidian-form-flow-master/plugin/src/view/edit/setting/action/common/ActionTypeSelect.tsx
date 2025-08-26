import { Code, File, FileJson, MessageSquare, Text, ExternalLink, Link, Command, Brain, Trash2, Copy, Image, Type, FileText } from "lucide-react";
import { localInstance } from "src/i18n/locals";
import { FormActionType } from "src/model/enums/FormActionType";
import { FormTypeSelect } from "src/view/shared/select/FormTypeSelect";

export default function (props: {
	value: string;
	onChange: (value: FormActionType) => void;
	styles?: Record<string, string>;
}) {
	const { value } = props;
	const options = formActionTypeOptions.map((option) => ({
		...option,
		id: option.value,
	}));
	return (
		<FormTypeSelect
			value={value}
			onChange={props.onChange}
			options={options}
			styles={props.styles}
		/>
	);
}

export const formActionTypeOptions = [
	{
		value: FormActionType.CREATE_FILE,
		label: localInstance.create_file,
		icon: <File />,
	},
	{
		value: FormActionType.INSERT_TEXT,
		label: localInstance.insert_text,
		icon: <Text />,
	},
	{
		value: FormActionType.UPDATE_FRONTMATTER,
		label: localInstance.update_property,
		icon: <FileJson />,
	},
	// {
	// 	value: FormActionType.GENERATE_FORM,
	// 	label: localInstance.generate_form,
	// 	icon: <Clipboard />,
	// },
	{
		value: FormActionType.SUGGEST_MODAL,
		label: localInstance.suggest_modal,
		icon: <MessageSquare />,
	},
	{
		value: FormActionType.RUN_SCRIPT,
		label: localInstance.run_script,
		icon: <Code />,
	},
	{
		value: FormActionType.OPEN_FILE,
		label: localInstance.open_file,
		icon: <ExternalLink />,
	},
	{
		value: FormActionType.OPEN_LINK,
		label: localInstance.open_link,
		icon: <Link />,
	},
	{
		value: FormActionType.EXECUTE_COMMAND,
		label: localInstance.execute_command,
		icon: <Command />,
	},
	{
		value: FormActionType.AI_CALL,
		label: localInstance.ai_call_action,
		icon: <Brain />,
	},
	{
		value: FormActionType.CONTENT_CLEANUP,
		label: localInstance.content_cleanup,
		icon: <Trash2 />,
	},
	{
		value: FormActionType.COPY_AS_RICH_TEXT,
		label: localInstance.copy_as_rich_text,
		icon: <FileText />,
	},
	{
		value: FormActionType.CONVERT_IMAGE_LINKS,
		label: localInstance.convert_image_links,
		icon: <Text />,
	},
	{
		value: FormActionType.ADD_SPACES_BETWEEN_CJK_AND_LATIN,
		label: localInstance.add_spaces_between_cjk_and_latin,
		icon: <Type />,
	},
];
