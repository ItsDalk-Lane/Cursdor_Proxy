import { localInstance } from "src/i18n/locals";
import { IFormAction } from "src/model/action/IFormAction";
import { OpenFileFormAction } from "src/model/action/OpenFileFormAction";
import { FormActionType } from "src/model/enums/FormActionType";
import CpsFormItem from "src/view/shared/CpsFormItem";
import { FilePathFormItem } from "src/view/edit/setting/action/common/FilePathFormItem";
import OpenPageTypeSelect from "src/view/edit/setting/action/common/OpenPageTypeSelect";

export function OpenFileActionSetting(props: {
    value: IFormAction;
    onChange: (value: IFormAction) => void;
}) {
    const { value } = props;
    if (value.type !== FormActionType.OPEN_FILE) {
        return null;
    }
    const action = value as OpenFileFormAction;

    return (
        <>
            <FilePathFormItem
                label={localInstance.file_path}
                value={action.filePath || ""}
                onChange={(filePath: string) => {
                    const newAction = {
                        ...action,
                        filePath: filePath,
                    };
                    props.onChange(newAction);
                }}
            />

            <CpsFormItem label={localInstance.open_page_in_tab}>
                <OpenPageTypeSelect
                    value={action.openPageIn || "current"}
                    onChange={(openPageIn) => {
                        const newAction = {
                            ...action,
                            openPageIn: openPageIn,
                        };
                        props.onChange(newAction);
                    }}
                />
            </CpsFormItem>
        </>
    );
}
