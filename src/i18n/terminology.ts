// 术语词典 - Obsidian Git Plugin 汉化标准
// Terminology Dictionary for Obsidian Git Plugin Localization

/**
 * Git 相关术语对照表
 * Git-related terminology mapping
 */
export const gitTerminology = {
    // 核心概念 Core Concepts
    "repository": "仓库",
    "repo": "仓库",
    "commit": "提交",
    "branch": "分支",
    "merge": "合并",
    "pull": "拉取",
    "push": "推送",
    "fetch": "获取",
    "clone": "克隆",
    "fork": "复刻",
    "tag": "标签",
    "remote": "远程",
    "origin": "源仓库",
    "upstream": "上游",
    "head": "HEAD",
    "master": "主分支",
    "main": "主分支",
    "develop": "开发分支",

    // 状态和操作 Status and Operations  
    "staged": "已暂存",
    "unstaged": "未暂存",
    "stage": "暂存",
    "unstage": "取消暂存",
    "stash": "储藏",
    "pop": "弹出",
    "apply": "应用",
    "reset": "重置",
    "revert": "撤销",
    "checkout": "检出",
    "switch": "切换",
    "diff": "差异",
    "patch": "补丁",
    "conflict": "冲突",
    "resolution": "解决",
    "rebase": "变基",
    "cherry-pick": "挑拣",

    // 文件状态 File Status
    "modified": "已修改",
    "added": "已添加", 
    "deleted": "已删除",
    "renamed": "已重命名",
    "copied": "已复制",
    "untracked": "未跟踪",
    "ignored": "已忽略",
    "conflicted": "冲突中",

    // 同步状态 Sync Status
    "up-to-date": "已是最新",
    "ahead": "领先",
    "behind": "落后",
    "diverged": "分歧",
    "syncing": "同步中",
    "pulling": "拉取中",
    "pushing": "推送中",
    "committing": "提交中"
} as const;

/**
 * UI 组件术语对照表
 * UI component terminology mapping
 */
export const uiTerminology = {
    // 视图和面板 Views and Panels
    "source control": "源代码控制",
    "history view": "历史视图",
    "diff view": "差异视图",
    "split view": "分割视图",
    "sidebar": "侧边栏",
    "status bar": "状态栏",
    "toolbar": "工具栏",
    "panel": "面板",
    "tab": "标签页",
    "window": "窗口",

    // 操作按钮 Action Buttons
    "refresh": "刷新",
    "reload": "重新加载",
    "save": "保存",
    "cancel": "取消",
    "confirm": "确认",
    "delete": "删除",
    "edit": "编辑",
    "create": "创建",
    "copy": "复制",
    "paste": "粘贴",
    "cut": "剪切",
    "undo": "撤销",
    "redo": "重做",

    // 表单元素 Form Elements
    "input": "输入",
    "textarea": "文本区域",
    "dropdown": "下拉菜单", 
    "checkbox": "复选框",
    "radio": "单选按钮",
    "toggle": "切换",
    "slider": "滑块",
    "button": "按钮",
    "link": "链接",
    "label": "标签",
    "placeholder": "占位符",

    // 状态指示 Status Indicators
    "loading": "加载中",
    "success": "成功",
    "error": "错误",
    "warning": "警告",
    "info": "信息",
    "pending": "待处理",
    "completed": "已完成",
    "failed": "失败",
    "in progress": "进行中",
    "disabled": "已禁用",
    "enabled": "已启用"
} as const;

/**
 * 技术术语对照表
 * Technical terminology mapping
 */
export const technicalTerminology = {
    // 软件开发 Software Development
    "plugin": "插件",
    "extension": "扩展",
    "addon": "附加组件",
    "library": "库",
    "framework": "框架",
    "api": "API",
    "endpoint": "端点",
    "interface": "接口",
    "component": "组件",
    "module": "模块",
    "package": "包",
    "dependency": "依赖",

    // 配置和设置 Configuration and Settings
    "settings": "设置",
    "preferences": "偏好设置",
    "configuration": "配置",
    "options": "选项",
    "properties": "属性",
    "parameters": "参数",
    "variables": "变量",
    "constants": "常量",
    "defaults": "默认值",
    "custom": "自定义",

    // 文件和路径 Files and Paths
    "file": "文件",
    "folder": "文件夹",
    "directory": "目录",
    "path": "路径",
    "filename": "文件名",
    "extension": "扩展名",
    "basename": "基础名称",
    "absolute path": "绝对路径",
    "relative path": "相对路径",
    "workspace": "工作区",
    "vault": "库",

    // 网络和连接 Network and Connection
    "connection": "连接",
    "network": "网络",
    "offline": "离线",
    "online": "在线",
    "sync": "同步",
    "authentication": "身份验证",
    "authorization": "授权",
    "credentials": "凭据",
    "token": "令牌",
    "session": "会话",

    // 操作系统 Operating System
    "windows": "Windows",
    "macos": "macOS", 
    "linux": "Linux",
    "desktop": "桌面",
    "mobile": "移动端",
    "cross-platform": "跨平台",
    "executable": "可执行文件",
    "command line": "命令行",
    "terminal": "终端",
    "shell": "Shell"
} as const;

/**
 * 特殊术语和缩写对照表
 * Special terms and abbreviations mapping
 */
export const specialTerminology = {
    // 缩写 Abbreviations
    "url": "URL",
    "uri": "URI",
    "http": "HTTP",
    "https": "HTTPS",
    "ssh": "SSH",
    "ftp": "FTP",
    "json": "JSON",
    "xml": "XML",
    "html": "HTML",
    "css": "CSS",
    "js": "JavaScript",
    "ts": "TypeScript",
    "md": "Markdown",

    // 版本控制 Version Control
    "vcs": "版本控制系统",
    "scm": "源代码管理",
    "dvcs": "分布式版本控制系统",
    "sha": "SHA哈希值",
    "hash": "哈希值",
    "checksum": "校验和",

    // 时间和日期 Time and Date
    "timestamp": "时间戳",
    "datetime": "日期时间",
    "timezone": "时区",
    "utc": "UTC",
    "iso": "ISO格式",
    "format": "格式",

    // 数据和编码 Data and Encoding
    "encoding": "编码",
    "utf-8": "UTF-8",
    "ascii": "ASCII",
    "binary": "二进制",
    "base64": "Base64",
    "metadata": "元数据"
} as const;

/**
 * 上下文相关术语
 * Context-specific terminology
 */
export const contextTerminology = {
    // Obsidian 特定术语
    obsidian: {
        "vault": "库",
        "note": "笔记",
        "link": "链接",
        "backlink": "反向链接",
        "graph": "关系图",
        "canvas": "画布",
        "template": "模板",
        "hotkey": "快捷键",
        "command palette": "命令面板",
        "workspace": "工作区",
        "pane": "窗格",
        "leaf": "页面"
    },

    // 消息和通知
    messages: {
        "backup": "备份",
        "auto backup": "自动备份",
        "manual backup": "手动备份",
        "scheduled backup": "定时备份",
        "snapshot": "快照",
        "archive": "归档",
        "restore": "恢复",
        "recovery": "恢复"
    }
} as const;

/**
 * 术语一致性检查规则
 * Terminology consistency rules
 */
export const consistencyRules = {
    // 必须使用的标准翻译
    mandatory: {
        "Git": "Git", // 专有名词保持原文
        "GitHub": "GitHub",
        "GitLab": "GitLab", 
        "Obsidian": "Obsidian",
        "repository": "仓库", // 统一使用"仓库"而非"存储库"
        "commit": "提交", // 统一使用"提交"而非"承诺"
        "merge": "合并", // 统一使用"合并"而非"归并"
        "branch": "分支", // 统一使用"分支"
        "source control": "源代码控制" // 全称，不使用"源控"
    },

    // 避免使用的翻译
    avoid: {
        "存储库": "应使用'仓库'",
        "承诺": "应使用'提交'",
        "归并": "应使用'合并'",
        "源控": "应使用'源代码控制'",
        "代码库": "应使用'仓库'",
        "提交点": "应使用'提交'"
    },

    // 上下文敏感的翻译
    contextSensitive: {
        "file": {
            "in git context": "文件",
            "in obsidian context": "文件",
            "as action": "归档"
        },
        "stage": {
            "as noun": "暂存区",
            "as verb": "暂存"
        },
        "branch": {
            "as noun": "分支",
            "as verb": "创建分支"
        }
    }
} as const;

/**
 * 翻译质量检查函数
 * Translation quality check functions
 */
export class TerminologyChecker {
    /**
     * 检查文本中是否使用了不推荐的术语
     */
    static checkAvoidedTerms(text: string): string[] {
        const issues: string[] = [];
        
        Object.entries(consistencyRules.avoid).forEach(([avoided, suggestion]) => {
            if (text.includes(avoided)) {
                issues.push(`发现不推荐术语: "${avoided}" - ${suggestion}`);
            }
        });
        
        return issues;
    }

    /**
     * 检查术语一致性
     */
    static checkConsistency(text: string, context?: string): string[] {
        const issues: string[] = [];
        
        // 检查必须使用的标准翻译
        Object.entries(consistencyRules.mandatory).forEach(([english, chinese]) => {
            const regex = new RegExp(`\\b${english}\\b`, 'gi');
            const matches = text.match(regex);
            
            if (matches && !text.includes(chinese)) {
                issues.push(`术语"${english}"应翻译为"${chinese}"`);
            }
        });
        
        return issues;
    }

    /**
     * 获取推荐翻译
     */
    static getRecommendedTranslation(english: string, context?: string): string | null {
        // 优先检查Git术语
        if (english.toLowerCase() in gitTerminology) {
            return gitTerminology[english.toLowerCase() as keyof typeof gitTerminology];
        }
        
        // 检查UI术语
        if (english.toLowerCase() in uiTerminology) {
            return uiTerminology[english.toLowerCase() as keyof typeof uiTerminology];
        }
        
        // 检查技术术语
        if (english.toLowerCase() in technicalTerminology) {
            return technicalTerminology[english.toLowerCase() as keyof typeof technicalTerminology];
        }
        
        // 检查特殊术语
        if (english.toLowerCase() in specialTerminology) {
            return specialTerminology[english.toLowerCase() as keyof typeof specialTerminology];
        }
        
        return null;
    }
}

// 导出所有术语集合
export const allTerminology = {
    git: gitTerminology,
    ui: uiTerminology,
    technical: technicalTerminology,
    special: specialTerminology,
    context: contextTerminology,
    rules: consistencyRules
} as const;

// 类型导出
export type GitTerminology = typeof gitTerminology;
export type UITerminology = typeof uiTerminology;
export type TechnicalTerminology = typeof technicalTerminology;
export type SpecialTerminology = typeof specialTerminology;
export type ContextTerminology = typeof contextTerminology;
