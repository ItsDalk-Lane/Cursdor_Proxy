import { Copy, MoreHorizontal, Trash2, X } from "lucide-react";
import { Popover } from "radix-ui";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { ConfirmPopover } from "src/component/confirm/ConfirmPopover";
import { DragHandler } from "src/component/drag-handler/DragHandler";
import { localInstance } from "src/i18n/locals";
import { FormFieldType } from "src/model/enums/FormFieldType";
import { IFormField } from "src/model/field/IFormField";
import { FormTypeSelect } from "src/view/shared/select/FormTypeSelect";
import { fieldTypeOptions } from "../common/FieldTypeSelect";
import { CpsFormFieldDetailEditing } from "../CpsFormFieldDetailEditing";
import "./FormFieldSettingHeader.css";

/**
 * 表单字段设置头部组件 - 重构状态管理逻辑
 * 解决防抖机制与字段列表更新冲突的问题
 */
export function FormFieldSettingHeader(props: {
	children?: React.ReactNode;
	field: IFormField;
	allFields: IFormField[];
	onChange: (field: IFormField) => void;
	onDelete: (field: IFormField) => void;
	onDuplicate: (field: IFormField) => void;
	setDragHandleRef: (ref: HTMLDivElement | null) => void;
}) {
	const { field, setDragHandleRef, onChange, onDuplicate } = props;
	
	// 使用ref跟踪字段ID，检测字段是否被替换
	const fieldIdRef = useRef(field.id);
	const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
	
	// 本地状态管理标签输入值
	const [localLabel, setLocalLabel] = useState(field.label);
	
	// 当字段ID变化时，说明这是一个新字段，重置本地状态
	useEffect(() => {
		if (fieldIdRef.current !== field.id) {
			fieldIdRef.current = field.id;
			setLocalLabel(field.label);
			// 清除之前的防抖定时器
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
				debounceTimerRef.current = null;
			}
		}
	}, [field.id, field.label]);
	
	// 当外部字段标签变化时同步本地状态（但不覆盖用户正在输入的内容）
	useEffect(() => {
		// 只有在没有待处理的防抖更新时才同步外部变化
		if (!debounceTimerRef.current && localLabel !== field.label) {
			setLocalLabel(field.label);
		}
	}, [field.label]);
	
	// 优化的防抖更新逻辑
	useEffect(() => {
		// 清除之前的定时器
		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current);
		}
		
		// 只有当本地标签与字段标签不同时才设置防抖
		if (localLabel !== field.label) {
			debounceTimerRef.current = setTimeout(() => {
				// 再次检查，确保在延迟期间字段没有被删除或替换
				if (fieldIdRef.current === field.id && localLabel !== field.label) {
					const newField = {
						...field,
						label: localLabel,
					};
					onChange(newField);
				}
				debounceTimerRef.current = null;
			}, 150); // 减少防抖延迟到150ms，提高响应性
		}
		
		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
				debounceTimerRef.current = null;
			}
		};
	}, [localLabel, field, onChange]);
	
	// 处理标签输入变化
	const handleLabelChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setLocalLabel(e.target.value);
	}, []);
	return (
		<div
			className="form--CpsFormFieldSettingHeader"
			data-required={field.required}
		>
			<DragHandler
				ref={setDragHandleRef}
				aria-label={localInstance.drag_and_drop_to_reorder}
			/>

			{field.required && (
				<span className="form--CpsFormFieldSettingLabelRequired">
					*
				</span>
			)}
			<input
				type="text"
				className="form--CpsFormFieldSettingLabelInlineInput"
				value={localLabel}
				placeholder={localInstance.please_input_name}
				onChange={handleLabelChange}
			/>

			<div className="form--CpsFormFieldSettingHeaderControl">
				<FormTypeSelect
					value={field.type}
					hideLabel={true}
					onChange={(value) => {
						const newField = {
							...field,
							type: value as FormFieldType,
						};
						props.onChange(newField);
					}}
					options={fieldTypeOptions}
				/>

				<ConfirmPopover
					onConfirm={() => {
						props.onDelete(field);
					}}
					title={localInstance.confirm_to_delete}
				>
					<button
						className="clickable-icon"
						aria-label={localInstance.delete}
						data-type="danger"
					>
						<Trash2 size={14} />
					</button>
				</ConfirmPopover>
				<Popover.Root>
					<Popover.Trigger asChild>
						<button
							className="clickable-icon"
							aria-label={localInstance.more}
						>
							<MoreHorizontal size={14} />
						</button>
					</Popover.Trigger>
					<Popover.Portal>
						<Popover.Content
							sideOffset={24}
							side="right"
							align="start"
							className="form--CpsFormFieldSettingPopover"
							collisionPadding={{
								left: 16,
								right: 16,
								top: 8,
								bottom: 8,
							}}
						>
							<div className="form--CpsFormFieldSettingPopoverTitle">
								<button
									className="clickable-icon"
									aria-label={localInstance.duplicate}
									onClick={onDuplicate.bind(null, field)}
								>
									<Copy size={14} />
								</button>
								{localInstance.form_fields_setting}
							</div>
							<CpsFormFieldDetailEditing
								value={field}
								allFields={props.allFields}
								onChange={(field) => {
									onChange(field);
								}}
							/>
							<Popover.Close
								className="form--CpsFormFieldSettingPopoverClose"
								aria-label={localInstance.close}
							>
								<X size={14} />
							</Popover.Close>
						</Popover.Content>
					</Popover.Portal>
				</Popover.Root>
				{props.children}
			</div>
		</div>
	);
}
