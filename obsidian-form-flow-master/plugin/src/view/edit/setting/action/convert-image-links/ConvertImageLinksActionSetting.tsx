import { localInstance } from "src/i18n/locals";
import { IFormAction } from "src/model/action/IFormAction";
import { ConvertImageLinksFormAction } from "src/model/action/ConvertImageLinksFormAction";
import { FormActionType } from "src/model/enums/FormActionType";
import CpsFormItem from "src/view/shared/CpsFormItem";
import { FilePathFormItem } from "../common/FilePathFormItem";

export function ConvertImageLinksActionSetting(props: {
    value: IFormAction;
    onChange: (value: IFormAction) => void;
}) {
    const { value } = props;
    if (value.type !== FormActionType.CONVERT_IMAGE_LINKS) {
        return null;
    }
    const action = value as ConvertImageLinksFormAction;

    return (
        <>
            <CpsFormItem label="目标模式">
                <select
                    value={action.targetMode || 'current'}
                    onChange={(e) => {
                        const newAction = {
                            ...action,
                            targetMode: e.target.value as 'current' | 'specified',
                        };
                        props.onChange(newAction);
                    }}
                >
                    <option value="current">当前文件</option>
                    <option value="specified">指定文件</option>
                </select>
            </CpsFormItem>

            {action.targetMode === 'specified' && (
                <FilePathFormItem
                    label="文件路径"
                    value={action.filePath || ""}
                    onChange={(filePath: string) => {
                        const newAction = {
                            ...action,
                            filePath: filePath,
                        };
                        props.onChange(newAction);
                    }}
                />
            )}


        </>
    );
}