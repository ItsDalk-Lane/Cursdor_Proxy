import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import "./CpsFormSetting.css";

/**
 * 表单设置组件 - 支持折叠功能
 * @param props.icon - 图标
 * @param props.title - 标题
 * @param props.children - 子内容
 * @param props.defaultCollapsed - 默认是否折叠，默认为false
 * @param props.collapsible - 是否可折叠，默认为true
 */
export function CpsFormSettingGroup(props: {
	icon: React.ReactNode;
	title: string;
	children: React.ReactNode;
	defaultCollapsed?: boolean;
	collapsible?: boolean;
}) {
	const { icon, title, children, defaultCollapsed = false, collapsible = true } = props;
	const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

	/**
	 * 切换折叠状态
	 */
	const toggleCollapse = () => {
		if (collapsible) {
			setIsCollapsed(!isCollapsed);
		}
	};

	return (
		<div className="form--CpsFormSettingGroup">
			<div 
				className={`form--SettingGroupHeader ${collapsible ? 'form--SettingGroupHeader--collapsible' : ''}`}
				onClick={toggleCollapse}
				style={{ cursor: collapsible ? 'pointer' : 'default' }}
			>
				{icon}
				{title}
				{collapsible && (
					<div className="form--SettingGroupCollapseIcon">
						{isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
					</div>
				)}
			</div>
			{!isCollapsed && (
				<div className="form--SettingGroupContent">
					{children}
				</div>
			)}
		</div>
	);
}
