// Git相关类型定义
export interface GitChangeInfo {
    filePath: string;
    status: 'M' | 'A' | 'D' | 'R' | '??' | 'MM';
    statusText: string;
    diff?: string;
    selected?: boolean; // 是否被选择用于提交
}
