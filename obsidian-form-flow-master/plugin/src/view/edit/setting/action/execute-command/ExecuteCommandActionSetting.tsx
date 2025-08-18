import { localInstance } from "src/i18n/locals";
import { IFormAction } from "src/model/action/IFormAction";
import { ExecuteCommandFormAction } from "src/model/action/ExecuteCommandFormAction";
import { FormActionType } from "src/model/enums/FormActionType";
import CpsFormItem from "src/view/shared/CpsFormItem";
import { CommandSuggestInput } from "src/component/command-suggest/CommandSuggestInput";

export function ExecuteCommandActionSetting(props: {
    value: IFormAction;
    onChange: (value: IFormAction) => void;
}) {
    const { value } = props;
    if (value.type !== FormActionType.EXECUTE_COMMAND) {
        return null;
    }
    const action = value as ExecuteCommandFormAction;

    return (
        <>
            <CpsFormItem label={localInstance.command_id}>
                <CommandSuggestInput
                    value={action.commandId || ""}
                    placeholder="输入命令ID或名称，如: editor:toggle-bold"
                    onChange={(commandId) => {
                        const newAction = {
                            ...action,
                            commandId: commandId,
                        };
                        props.onChange(newAction);
                    }}
                />
            </CpsFormItem>
        </>
    );
}
