import { FormActionType } from "../enums/FormActionType";
import { IFormAction } from "./IFormAction";

/**
 * 中英文加空格动作配置接口
 * 自动在中文和英文字符之间添加空格，提高可读性
 */
export interface AddSpacesBetweenCjkAndLatinFormAction extends IFormAction {
    type: FormActionType.ADD_SPACES_BETWEEN_CJK_AND_LATIN;
    
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
     * 缩进宽度（用于代码格式化）
     */
    tabWidth: '2' | '4';
    
    /**
     * 是否格式化内嵌代码
     * 如果为true，将使用Prettier格式化内嵌的代码块
     */
    formatEmbeddedCode: boolean;
    
    /**
     * 是否保护代码块内容
     * 如果为true，不会在代码块内部进行中英文空格处理
     */
    preserveCodeBlocks: boolean;
}