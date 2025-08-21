import { FormActionType } from "../enums/FormActionType";
import { IFormAction } from "./IFormAction";

/**
 * 清理类型枚举
 */
export enum CleanupType {
    DELETE_FILES = "deleteFiles",
    DELETE_FOLDERS = "deleteFolders", 
    DELETE_HEADING_CONTENT = "deleteHeadingContent",
    CLEAR_TEXT_FORMAT = "clearTextFormat"
}

/**
 * 内容清理动作配置
 */
export interface ContentCleanupFormAction extends IFormAction {
    type: FormActionType.CONTENT_CLEANUP;
    
    /**
     * 清理类型
     */
    cleanupType: CleanupType;
    
    /**
     * 目标文件路径列表（用于删除文件）
     * 支持模板变量
     */
    targetFiles?: string[];
    
    /**
     * 目标文件夹路径列表（用于删除文件夹）
     * 支持模板变量
     */
    targetFolders?: string[];
    
    /**
     * 目标文件路径（用于删除标题内容、属性或清除格式）
     * 支持模板变量，如果为空则使用当前文件
     */
    targetFilePath?: string;
    
    /**
     * 要删除的标题名称（用于删除标题下的内容）
     * 支持模板变量
     */
    headingName?: string;
    
    /**
     * 删除标题下内容的模式
     * true: 删除到同级或更高级标题为止（默认行为）
     * false: 只删除正文内容，遇到任何标题就停止
     */
    deleteToSameLevelHeading?: boolean;
    
    /**
     * 是否递归删除文件夹内容
     */
    recursive?: boolean;
    
    /**
     * 是否需要确认删除
     */
    requireConfirmation?: boolean;
    
    /**
     * 确认提示信息
     * 支持模板变量
     */
    confirmationMessage?: string;
    
    /**
     * 是否启用调试模式
     */
    enableDebug?: boolean;
    
    /**
     * 文本格式清除配置
     */
    formatClearOptions?: {
        /**
         * 是否清除粗体格式
         */
        clearBold?: boolean;
        
        /**
         * 是否清除斜体格式
         */
        clearItalic?: boolean;
        
        /**
         * 是否清除删除线格式
         */
        clearStrikethrough?: boolean;
        
        /**
         * 是否清除高亮格式
         */
        clearHighlight?: boolean;
        
        /**
         * 是否清除行内代码格式
         */
        clearInlineCode?: boolean;
        
        /**
         * 是否清除链接格式（保留链接文本）
         */
        clearLinks?: boolean;
        
        /**
         * 是否清除图片格式
         */
        clearImages?: boolean;
        
        /**
         * 是否清除引用格式
         */
        clearQuotes?: boolean;
        
        /**
         * 是否清除列表格式
         */
        clearLists?: boolean;
        
        /**
         * 是否清除标题格式
         */
        clearHeadings?: boolean;
        
        /**
         * 是否清除注释
         */
        clearComments?: boolean;
        
        /**
         * 是否清除脚注
         */
        clearFootnotes?: boolean;
        
        /**
         * 是否清除表格
         */
        clearTables?: boolean;
        
        /**
         * 是否清除数学块格式
         */
        clearMathBlocks?: boolean;
        
        /**
         * 是否清除属性（frontmatter）
         */
        clearProperties?: boolean;
        
        /**
         * 是否一键清除所有格式
         */
        clearAll?: boolean;
    };
}