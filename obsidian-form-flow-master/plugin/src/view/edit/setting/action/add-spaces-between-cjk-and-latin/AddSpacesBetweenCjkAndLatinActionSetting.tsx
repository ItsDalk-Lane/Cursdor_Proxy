import { localInstance } from "src/i18n/locals";
import { IFormAction } from "src/model/action/IFormAction";
import { AddSpacesBetweenCjkAndLatinFormAction } from "src/model/action/AddSpacesBetweenCjkAndLatinFormAction";
import { FormActionType } from "src/model/enums/FormActionType";
import CpsFormItem from "src/view/shared/CpsFormItem";
import { FilePathFormItem } from "../common/FilePathFormItem";

export function AddSpacesBetweenCjkAndLatinActionSetting(props: {
    value: IFormAction;
    onChange: (value: IFormAction) => void;
}) {
    const { value } = props;
    if (value.type !== FormActionType.ADD_SPACES_BETWEEN_CJK_AND_LATIN) {
        return null;
    }
    const action = value as AddSpacesBetweenCjkAndLatinFormAction;

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

            <CpsFormItem label="缩进宽度">
                <select
                    value={action.tabWidth || '4'}
                    onChange={(e) => {
                        const newAction = {
                            ...action,
                            tabWidth: e.target.value as '2' | '4',
                        };
                        props.onChange(newAction);
                    }}
                >
                    <option value="2">2 空格</option>
                    <option value="4">4 空格</option>
                </select>
            </CpsFormItem>


        </>
    );
}