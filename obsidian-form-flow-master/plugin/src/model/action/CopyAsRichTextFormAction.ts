import { FormActionType } from "../enums/FormActionType";
import { IFormAction } from "./IFormAction";

/**
 * 复制为富文本动作配置接口
 */
export interface CopyAsRichTextFormAction extends IFormAction {
    type: FormActionType.COPY_AS_RICH_TEXT;
    
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
     * 是否包含图片（转换为Base64嵌入）
     */
    includeImages: boolean;
    
    /**
     * 图片大小限制（MB），默认10MB
     * 超过限制的图片将被跳过并记录警告
     */
    maxImageSize?: number;
    
    /**
     * 图片质量（0-100），默认85
     * 用于压缩图片以减少Base64大小
     */
    imageQuality?: number;
}