import { FormActionType } from "../enums/FormActionType";
import { IFormAction } from "./IFormAction";

/**
 * 转换图片链接动作配置接口
 * 将Obsidian内部图片链接（![[image.png]]）转换为标准Markdown链接（![image.png](file:///path/to/image.png)）
 */
export interface ConvertImageLinksFormAction extends IFormAction {
    type: FormActionType.CONVERT_IMAGE_LINKS;
    
    /**
     * 目标文件模式
     * current - 当前活动编辑器文件
     * specified - 指定文件路径
     */
    targetMode: 'current' | 'specified';
    
    /**
     * 指定文件路径（当targetMode为'specified'时必填）
     * 支持模板变量
     */
    filePath?: string;
    
    /**
     * 是否备份原文件
     * 如果为true，将在同目录下创建.backup文件
     */
    backupOriginal: boolean;
    
    /**
     * 是否保留显示文本
     * 处理 ![[image.png|显示文本]] 格式时是否保留显示文本
     */
    preserveDisplayText: boolean;
}