// Git相关类型定义

// 文件状态结果接口 - 基于obsidian-git-master的实现
export interface FileStatusResult {
    path: string;
    vaultPath: string;
    from?: string;
    // 索引状态 (暂存区)
    index: string;
    // 工作目录状态
    workingDir: string;
}

// Git状态接口
export interface Status {
    all: FileStatusResult[];
    changed: FileStatusResult[];    // 工作目录有变更的文件
    staged: FileStatusResult[];     // 已暂存的文件
    conflicted: string[];           // 冲突文件
}

// 为向后兼容保留的接口
export interface GitChangeInfo {
    filePath: string;
    status: 'M' | 'A' | 'D' | 'R' | '??' | 'MM';
    statusText: string;
    diff?: string;
    selected?: boolean; // 是否被选择用于提交
    isStaged?: boolean; // 是否已暂存
}
