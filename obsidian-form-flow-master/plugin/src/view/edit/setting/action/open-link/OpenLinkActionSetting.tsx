import { localInstance } from "src/i18n/locals";
import { IFormAction } from "src/model/action/IFormAction";
import { OpenLinkFormAction } from "src/model/action/OpenLinkFormAction";
import { FormActionType } from "src/model/enums/FormActionType";
import CpsFormItem from "src/view/shared/CpsFormItem";

export function OpenLinkActionSetting(props: {
    value: IFormAction;
    onChange: (value: IFormAction) => void;
}) {
    const { value } = props;
    if (value.type !== FormActionType.OPEN_LINK) {
        return null;
    }
    const action = value as OpenLinkFormAction;

    return (
        <>
            <CpsFormItem label={localInstance.link_url}>
                <input
                    type="text"
                    value={action.linkUrl || ""}
                    placeholder="https://example.com 或 [[笔记名称]]"
                    onChange={(e) => {
                        const newAction = {
                            ...action,
                            linkUrl: e.target.value,
                        };
                        props.onChange(newAction);
                    }}
                />
            </CpsFormItem>
        </>
    );
}
