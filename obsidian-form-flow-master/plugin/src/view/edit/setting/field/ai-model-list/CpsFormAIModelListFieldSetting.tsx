import { localInstance } from "src/i18n/locals";
import { FormFieldType } from "src/model/enums/FormFieldType";
import { IFormField } from "src/model/field/IFormField";
import { AIModelListField } from "src/model/field/AIModelListField";
import CpsFormItem from "src/view/shared/CpsFormItem";
import ToggleControl from "src/view/shared/control/ToggleControl";

export default function (props: {
    field: IFormField;
    onChange: (field: IFormField) => void;
}) {
    const { field, onChange } = props;
    if (field.type !== FormFieldType.AI_MODEL_LIST) {
        return null;
    }
    const aiModelField = field as AIModelListField;
    
    return (
        <>
            <CpsFormItem label={localInstance.show_provider}>
                <ToggleControl
                    value={aiModelField.showProvider === true}
                    onValueChange={(value: boolean) => {
                        const newField = {
                            ...aiModelField,
                            showProvider: value,
                        };
                        onChange(newField);
                    }}
                />
            </CpsFormItem>
            <CpsFormItem label={localInstance.show_custom_fields}>
                <ToggleControl
                    value={aiModelField.showCustomFields === true}
                    onValueChange={(value: boolean) => {
                        const newField = {
                            ...aiModelField,
                            showCustomFields: value,
                        };
                        onChange(newField);
                    }}
                />
            </CpsFormItem>
            <CpsFormItem label={localInstance.auto_select_first}>
                <ToggleControl
                    value={aiModelField.autoSelectFirst === true}
                    onValueChange={(value: boolean) => {
                        const newField = {
                            ...aiModelField,
                            autoSelectFirst: value,
                        };
                        onChange(newField);
                    }}
                />
            </CpsFormItem>
        </>
    );
}
