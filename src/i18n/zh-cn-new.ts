// 简体中文语言包 - Obsidian Git Plugin
export const zhCN = {
    // 插件元信息
    plugin: {
        name: "Git自动化",
        description: "AI自动生成Git提交信息",
        author: "开发者姓名",
        authorUrl: "https://github.com/yourusername",
        fundingUrl: "https://buymeacoffee.com/yourusername"
    },

    // 命令
    commands: {
        // 文件操作
        editGitignore: "编辑 .gitignore",
        stageCurrentFile: "暂存当前文件", 
        unstageCurrentFile: "取消暂存当前文件",
        addFileToGitignore: "添加文件到 .gitignore",
        
        // 视图
        openSourceControlView: "打开源代码控制视图",
        openHistoryView: "打开历史视图", 
        openDiffView: "打开差异视图",
        
        // GitHub 集成
        openFileOnGitHub: "在 GitHub 中打开文件",
        openFileHistoryOnGitHub: "在 GitHub 中查看文件历史",
        
        // Git 操作
        pull: "拉取",
        fetch: "获取",
        push: "推送",
        commitAllChanges: "提交所有更改",
        commitAllChangesWithMessage: "使用自定义消息提交所有更改",
        commit: "提交",
        commitStaged: "提交已暂存",
        commitWithMessage: "使用自定义消息提交",
        commitStagedWithMessage: "使用自定义消息提交已暂存",
        amendStaged: "修改已暂存",
        
        // 提交和同步操作
        commitAndSync: "提交并同步",
        commitAndSyncAndClose: "提交同步后关闭 Obsidian",
        commitAndSyncWithMessage: "使用自定义消息提交并同步",
        
        // 分支操作
        switchBranch: "切换分支",
        switchToRemoteBranch: "切换到远程分支",
        createBranch: "创建新分支",
        deleteBranch: "删除分支",
        
        // 远程操作
        editRemotes: "编辑远程仓库",
        removeRemote: "移除远程仓库",
        setUpstreamBranch: "设置上游分支",
        
        // 仓库操作
        initRepo: "初始化新仓库",
        cloneRepo: "克隆现有远程仓库",
        deleteRepository: "⚠️ 危险：删除仓库",
        
        // 文件管理
        listChangedFiles: "列出更改的文件",
        discardAllChanges: "⚠️ 危险：丢弃所有更改",
        
        // 系统操作
        toggleAutomaticRoutines: "暂停/恢复自动例程",
        rawCommand: "原始命令",
        
        // 行作者功能
        toggleLineAuthor: "切换行作者信息显示",
        
        // 菜单项
        sourceControl: "打开Git源代码控制",
        openInDefaultApp: "在默认应用中打开", 
        showInSystemExplorer: "在系统资源管理器中显示",
        gitAddToGitignore: "Git：添加到 .gitignore",
        
        // 右键菜单 Git 操作
        gitStage: "Git：暂存",
        gitUnstage: "Git：取消暂存", 
        gitAddToIgnore: "Git：添加到 .gitignore"
    },

    // UI 组件
    ui: {
        // 源代码控制视图
        sourceControl: {
            title: "源代码控制",
            noChanges: "无更改",
            changedFiles: "已更改文件",
            stagedFiles: "已暂存文件",
            unstagedFiles: "未暂存文件",
            commitMessage: "提交消息",
            commit: "提交",
            commitAndPush: "提交并推送",
            refresh: "刷新",
            stageAll: "暂存全部",
            unstageAll: "取消暂存全部",
            discardAll: "丢弃所有更改",
            viewChanges: "查看更改",
            stage: "暂存",
            unstage: "取消暂存",
            discard: "丢弃",
            changeLayout: "更改布局",
            recentlyPulledFiles: "最近拉取的文件",
            openFile: "打开文件"
        },

        // 历史视图  
        history: {
            title: "历史",
            noCommits: "无提交记录",
            commitHistory: "提交历史",
            author: "作者",
            date: "日期", 
            message: "消息",
            hash: "哈希值",
            viewCommit: "查看提交",
            viewFile: "查看文件",
            copyHash: "复制哈希值",
            checkoutCommit: "检出提交",
            revertCommit: "撤销提交"
        },

        // 差异视图
        diff: {
            title: "差异视图",
            noDiff: "无差异",
            sideBySide: "并排显示",
            inline: "内联显示",
            additions: "添加",
            deletions: "删除",
            modifications: "修改",
            previousVersion: "上一版本",
            currentVersion: "当前版本"
        },

        // 通用 UI 元素
        common: {
            ok: "确定",
            cancel: "取消",
            save: "保存",
            delete: "删除",
            edit: "编辑",
            create: "创建",
            close: "关闭",
            back: "返回",
            next: "下一个",
            previous: "上一个",
            loading: "加载中...",
            error: "错误",
            warning: "警告",
            info: "信息",
            success: "成功",
            clear: "清除"
        }
    },

    // 设置
    settings: {
        // 分组标题
        sections: {
            general: "常规",
            autoBackup: "自动备份",
            commitMessage: "提交消息", 
            sync: "同步",
            pull: "拉取",
            advanced: "高级",
            lineAuthor: "行作者",
            appearance: "外观",
            language: "显示语言",
            historyView: "历史视图",
            sourceControlView: "源代码控制视图"
        },

        // 语言设置
        language: {
            description: "选择插件界面的语言"
        },

        // 基本设置
        gitNotReady: "Git 尚未就绪。当所有设置正确后，您可以配置提交同步等功能。",

        // 自动备份设置
        autoBackup: {
            enable: "启用自动备份",
            interval: "自动备份间隔（分钟）",
            intervalDesc: "设置为 0 禁用自动备份",
            onFileChange: "文件更改后自动备份",
            onFileChangeDesc: "文件更改时自动创建备份",
            customMessage: "使用自定义自动备份消息",
            customMessageDesc: "使用自定义提交消息而非默认消息",
            splitTimers: "为自动提交和同步分别设置计时器",
            splitTimersDesc: "启用以对提交和同步使用不同的间隔。",
            autoIntervalTitle: "自动间隔（分钟）",
            autoIntervalDesc: "每 X 分钟自动执行更改。设置为 0（默认）以禁用。（请查看下面的设置以进行进一步配置！）"
        },

        // 提交消息设置
        commitMessage: {
            template: "手动提交的提交消息",
            templateDesc: "可用占位符：{{date}}（见下方）、{{hostname}}（见下方）、{{numFiles}}（提交中更改文件的数量）和 {{files}}（提交消息中的更改文件）。",
            templateDescPlaceholders: "可用占位符：{{date}}（见下方）、{{hostname}}（见下方）、{{numFiles}}（提交中更改文件的数量）和 {{files}}（提交消息中的更改文件）。",
            autoTemplate: "自动备份消息模板", 
            autoTemplateDesc: "自动备份提交的消息模板",
            script: "提交消息脚本",
            scriptDesc: "使用 'sh -c' 运行的脚本来生成提交消息。可用于使用 AI 工具生成提交消息。可用占位符：{{hostname}}、{{date}}。",
            dateFormat: "{{date}} 占位符格式",
            dateFormatDesc: "{{date}} 占位符的格式。例如：YYYY-MM-DD HH:mm:ss。请参考 Moment.js 了解更多格式。",
            hostname: "{{hostname}} 占位符替换",
            hostnameDesc: "为每个设备指定自定义主机名。",
            listChangedFiles: "在提交正文中列出更改的文件",
            listChangedFilesDesc: "在提交消息正文中添加更改文件列表",
            previewMessage: "预览提交消息",
            
            // 自动提交相关设置
            autoCommitAfterStop: "文件编辑停止后自动提交",
            autoCommitAfterStopDesc: "需要提交间隔不为0。如果开启，在停止编辑文件0分钟后进行自动提交。这也会阻止在编辑文件时自动提交。如果关闭，它独立于上次文件编辑。",
            autoCommitAfterLatest: "最新提交后自动提交", 
            autoCommitAfterLatestDesc: "如果开启，将最后一次自动提交时间戳设置为最新提交时间戳。这减少了在进行手动提交时自动提交的频率。",
            autoCommitOnlyStaged: "仅自动提交已暂存的文件",
            autoCommitOnlyStagedDesc: "如果开启，只有已暂存的文件会在提交时提交。如果关闭，所有更改的文件都会被提交。",
            customMessageOnAuto: "在自动提交时指定自定义提交消息",
            customMessageOnAutoDesc: "您将获得一个弹出窗口来指定您的消息。",
            commitMessageOnAuto: "自动提交时的提交消息",
            
            // 动态标题（支持参数化）
            autoActionAfterStoppingEdits: "文件编辑停止后自动{{action}}",
            autoActionAfterStoppingEditsDesc: "需要{{action}}间隔不为0。如果开启，在停止编辑文件{{interval}}分钟后进行自动{{action}}。这也会阻止在编辑文件时自动{{action}}。如果关闭，它独立于上次文件编辑。",
            autoActionAfterLatestCommit: "最新提交后自动{{action}}",
            autoActionAfterLatestCommitDesc: "如果开启，将最后一次自动{{action}}时间戳设置为最新提交时间戳。这减少了在进行手动提交时自动{{action}}的频率。",
            autoActionOnlyStaged: "仅自动{{action}}已暂存的文件", 
            autoActionOnlyStagedDesc: "如果开启，只有已暂存的文件会在{{action}}时{{action}}。如果关闭，所有更改的文件都会被{{action}}。",
            customMessageOnAutoAction: "在自动{{action}}时指定自定义提交消息",
            messageOnAutoAction: "自动{{action}}时的提交消息"
        },

        // 同步设置  
        sync: {
            method: "同步方式",
            methodDesc: "与远程仓库同步的方式",
            autoPushInterval: "自动推送间隔（分钟）",
            autoPushIntervalDesc: "每 X 分钟推送提交。设置为 0（默认）以禁用。",
            autoPullInterval: "自动拉取间隔（分钟）",
            autoPullIntervalDesc: "每 X 分钟拉取更改。设置为 0（默认）以禁用。",
            mergeStrategy: "合并策略",
            mergeStrategyDesc: "决定如何将远程分支的提交集成到本地分支中。",
            mergeStrategyOptions: {
                merge: "合并",
                rebase: "变基", 
                reset: "重置",
                otherSyncService: "其他同步服务（仅更新HEAD而不触及工作目录）"
            },
            pullOnStartup: "启动时拉取",
            pullOnStartupDesc: "Obsidian 启动时自动拉取提交。",
            commitAndSyncDesc: "默认设置的提交并同步意味着暂存所有内容 -> 提交 -> 拉取 -> 推送。理想情况下，这是您定期执行的单一操作，以保持本地和远程仓库同步。",
            pushOnCommitAndSync: "提交同步时推送",
            pushOnCommitAndSyncDesc: "大多数时候您希望在提交后推送。关闭此选项会将提交同步操作变为仅提交。它仍将被称为提交同步。",
            pullOnCommitAndSync: "提交同步时拉取",
            pullOnCommitAndSyncDesc: "在提交同步时，也拉取提交。关闭此选项会将提交同步操作变为仅提交。",
            pullBeforePush: "推送前先拉取",
            pullBeforePushDesc: "推送更改前总是先拉取",
            autoPull: "启动时自动拉取",
            autoPullDesc: "Obsidian 启动时自动拉取",
            autoPush: "自动推送", 
            autoPushDesc: "提交后自动推送",
            disablePush: "禁用推送",
            disablePushDesc: "禁用推送操作（仅本地）",
            updateSubmodules: "更新子模块",
            updateSubmodulesDesc: "拉取时更新子模块"
        },

        // 高级设置
        advanced: {
            gitPath: "Git 路径",
            gitPathDesc: "Git 可执行文件的路径",
            basePath: "基础路径",
            basePathDesc: "Git 操作的基础路径", 
            gitDir: "Git 目录",
            gitDirDesc: "自定义 .git 目录路径",
            refreshInterval: "刷新间隔",
            refreshIntervalDesc: "源代码控制视图刷新频率（秒）",
            showStatusBar: "显示状态栏",
            showStatusBarDesc: "在状态栏显示 Git 状态",
            showChangedFilesCount: "显示更改文件数",
            showChangedFilesCountDesc: "在状态栏显示更改文件的数量",
            showBranchInStatusBar: "在状态栏显示分支",
            showBranchInStatusBarDesc: "在状态栏显示当前分支名称",
            disableErrorNotifications: "禁用错误通知",
            disableErrorNotificationsDesc: "禁用任何类型的错误通知以减少干扰（请参考状态栏获取更新）。",
            hideNoChangesNotifications: "隐藏无更改时的通知",
            hideNoChangesNotificationsDesc: "当没有更改需要提交或推送时，不显示通知。",
            
            // 自动刷新设置
            autoRefresh: "自动刷新源代码控制视图",
            autoRefreshDesc: "在文件更改时自动刷新源代码控制视图。在较慢的机器上这可能会导致延迟。如果是这样，请禁用此选项。",
            refreshIntervalMs: "源代码控制视图刷新间隔",
            refreshIntervalMsDesc: "文件更改后等待多少毫秒再刷新源代码控制视图。",
            
            // 杂项设置
            miscellaneous: "杂项",
            diffViewStyle: "差异视图样式",
            diffViewStyleDesc: "设置差异视图的样式。请注意，'分割'模式下的实际差异不是由Git生成的，而是由编辑器本身生成的，因此它可能与Git生成的差异不同。这样做的一个好处是您可以在该视图中编辑文本。",
            diffViewStyleOptions: {
                split: "分割",
                unified: "统一"
            },
            disableNotifications: "禁用信息性通知",
            disableNotificationsDesc: "禁用git操作的信息性通知以减少干扰（请参考状态栏获取更新）。",
            
            // 文件菜单集成
            fileMenuIntegration: "文件菜单集成",
            fileMenuIntegrationDesc: "将\"暂存\"、\"取消暂存\"和\"添加到 .gitignore\"操作添加到文件菜单。",
            
            // 分支状态栏
            branchStatusBar: "显示分支状态栏",
            branchStatusBarDesc: "必须重启 Obsidian 才能使更改生效。",
            showFileCountInStatusBar: "在状态栏显示更改文件的数量",
            
            // 作者设置
            commitAuthor: "提交作者",
            username: "用户名",
            usernameDesc: "您在git服务器上的用户名。例如您在GitHub上的用户名",
            password: "密码/个人访问令牌",
            passwordDesc: "输入您的密码。您将无法再次看到它。",
            authorName: "提交的作者姓名",
            authorEmail: "提交的作者邮箱",
            
            // 高级设置说明
            advancedDesc: "这些设置通常不需要更改，但对于特殊设置可能是必需的。",
            updateSubmodules: "更新子模块",
            updateSubmodulesDesc: "\"提交并同步\"和\"拉取\"会处理子模块。缺少的功能：冲突文件，拉取/推送/提交文件的计数。需要为每个子模块设置跟踪分支。",
            submoduleRecurse: "子模块递归检出/切换",
            submoduleRecurseDesc: "每当在根仓库上发生检出时，递归检出子模块（如果分支存在）。",
            customGitPath: "自定义Git二进制路径",
            additionalEnvVars: "附加环境变量",
            additionalEnvVarsDesc: "每行使用一个新的环境变量，格式为 KEY=VALUE 。",
            additionalPaths: "附加PATH环境变量路径",
            additionalPathsDesc: "每行使用一个路径",
            reloadEnvVars: "重新加载新的环境变量",
            reloadEnvVarsDesc: "移除以前添加的环境变量要到重启Obsidian才会生效。",
            customBasePath: "自定义基础路径（Git仓库路径）",
            customBasePathDesc: "设置Git二进制文件应该执行的相对于vault的路径。主要用于设置Git仓库的路径。如果Git仓库在vault根目录下，则仅在需要时使用。在Windows上使用 \"\\\" 而不是 \"/\" 。",
            customGitDir: "自定义Git目录路径（而不是'.git'）",
            customGitDirDesc: "需要重启Obsidian才能生效。在Windows上使用 \"\\\" 而不是 \"/\" 。",
            disableOnDevice: "在此设备上禁用",
            disableOnDeviceDesc: "在此设备上禁用插件。此设置不会同步。",
            disableRestart: "Obsidian必须重启才能使更改生效。",
            
            // 附加设置翻译
            dateFormatPlaceholder: "指定自定义日期格式。例如：YYYY-MM-DD HH:mm:ss。请参考 Moment.js 了解更多格式。",
            mergeStrategyDefault: "合并",
            mergeStrategyRebase: "变基",
            mergeStrategyReset: "其他同步服务（仅更新HEAD而不触及工作目录）",
            languageChangeNotice: "语言已更改为 {{language}}",
            
            // 重新加载相关
            obsidianMustRestart: "Obsidian必须重启才能使更改生效。",
            reload: "重新加载",
            reloadingSettings: "重新加载设置中",
            
            // 支持信息
            support: "支持",
            donate: "捐赠",
            donateDesc: "如果您喜欢此插件，请考虑捐赠以支持持续开发。",
            copyDebugInfo: "复制调试信息",
            debugInfoCopied: "调试信息已复制到剪贴板。可能包含敏感信息！",
            debuggingLogging: "调试和日志记录：您始终可以通过打开开发者工具（Ctrl+Shift+I）并转到控制台选项卡来查看此插件和其他每个插件的日志。"
        },

        // 历史视图设置
        historyView: {
            showAuthor: "显示作者",
            showAuthorDesc: "在历史视图中显示提交的作者。",
            showDate: "显示日期",
            showDateDesc: "在历史视图中显示提交的日期。使用 {{date}} 占位符格式来显示日期。"
        },

        // UI 设置
        ui: {
            showStatusBar: "显示状态栏",
            showStatusBarDesc: "必须重启 Obsidian 才能使更改生效。",
            showBranchStatusBar: "显示分支状态栏",
            showBranchStatusBarDesc: "必须重启 Obsidian 才能使更改生效。",
            showChangedFilesCount: "在状态栏显示更改文件的数量"
        },

        // 行作者设置
        lineAuthor: {
            enable: "显示提交作者信息",
            enableDesc: "为每行显示作者信息",
            onlyDesktop: "目前仅在桌面版可用。",
            followMovement: "跟踪移动和复制",
            followMovementDesc: "跟踪代码行在提交间的移动",
            followMovementInactive: "不跟踪（默认）",
            followMovementSameCommit: "在同一提交内跟踪",
            followMovementAllCommits: "在所有提交内跟踪（可能较慢）",
            showCommitHash: "显示提交哈希",
            showCommitHashDesc: "在行作者视图中显示提交哈希",
            authorDisplay: "作者姓名显示",
            authorDisplayDesc: "是否以及如何显示作者",
            authorDisplayHide: "隐藏",
            authorDisplayInitials: "首字母（默认）",
            authorDisplayFirstName: "名字",
            authorDisplayLastName: "姓氏",
            authorDisplayFull: "全名",
            dateFormat: "日期格式",
            dateFormatDesc: "日期显示格式",
            colorNew: "新行颜色",
            colorOld: "旧行颜色",
            ignoreWhitespace: "忽略空白字符",
            ignoreWhitespaceDesc: "跟踪作者时忽略空白字符更改",
            
            // 显示作者信息相关
            showAuthorInfo: "显示提交作者信息",
            showAuthorInfoDesc: "提交哈希、作者姓名和创作日期都可以单独切换。",
            authorInfoFeatureGuide: "功能指南和快速示例",
            hideEverything: "隐藏所有内容，只显示年龄着色的侧边栏。",
            
            // 创作日期显示
            authoringDateDisplay: "创作日期显示",
            authoringDateDisplayDesc: "是否以及如何显示撰写该行的日期和时间",
            authoringDateDisplayOptions: {
                hide: "隐藏",
                date: "日期",
                datetime: "日期和时间",
                natural: "自然语言",
                custom: "自定义"
            },
            customAuthoringDateFormat: "自定义创作日期格式",
            authoringDateTimezone: "创作日期显示时区",
            authoringDateTimezoneOptions: {
                authorLocal: "作者的本地时区",
                utc: "UTC+0000/Z"
            },
            oldestAgeColoring: "着色中最旧年龄",
            ignoreWhitespaceChanges: "忽略更改中的空白和换行符"
        }
    },

    // 模态框
    modals: {
        // 远程仓库相关
        remote: {
            selectOrCreateRemote: "通过输入名称并选择来选择或创建新的远程仓库",
            selectOrCreateRemoteBranch: "通过输入名称并选择来选择或创建新的远程分支",
            selectRemote: "选择一个远程仓库",
            enterRemoteUrl: "输入远程仓库URL",
            enterDirectoryForClone: "输入克隆目录。它需要为空或不存在。",
            specifyDepthOfClone: "指定克隆深度。留空以完整克隆。"
        },

        // 分支相关  
        branch: {
            title: "分支操作",
            switchTo: "切换到分支",
            createNew: "创建新分支",
            createNewBranch: "创建新分支",
            deleteBranch: "删除分支",
            branchName: "分支名称",
            currentBranch: "当前分支",
            selectBranch: "选择要检出的分支",
            createBranchName: "新分支名称",
            deleteBranchConfirm: "确定要删除此分支吗？"
        },

        // 通用模态框
        general: {
            selectOption: "选择一个选项",
            enterValue: "输入一个值",
            noOptionsAvailable: "无可用选项",
            defaultPlaceholder: "..."
        },

        // 更改文件模态框
        changedFiles: {
            title: "更改的文件",
            noChangedFiles: "无更改的文件",
            stageSelected: "暂存选中项",
            unstageSelected: "取消暂存选中项",
            discardSelected: "丢弃选中项",
            notSupportedFilesWarning: "不支持的文件将使用默认应用程序打开！",
            untracked: "未跟踪",
            workingDir: "工作目录：",
            index: "索引："
        },

        // 自定义消息模态框
        customMessage: {
            title: "自定义提交消息",
            placeholder: "输入您的消息并可选择包含日期的版本。",
            commitAndPush: "提交并推送"
        },

        // 忽略文件模态框
        ignore: {
            title: "编辑 .gitignore",
            description: "添加要忽略的文件或模式",
            save: "保存",
            syntaxHelp: "Gitignore 语法帮助"
        },

        // 丢弃更改模态框
        discard: {
            title: "丢弃更改",
            warning: "确定要丢弃所有更改吗？",
            warningDesc: "此操作无法撤销。",
            discardAll: "丢弃所有更改",
            discardFile: "丢弃此文件的更改",
            delete: "删除",
            discard: "丢弃",
            cancel: "取消",
            filesIn: "文件位于",
            deleteUntrackedWarning: "确定要删除 {{count}} 个未跟踪文件吗？它们将根据您的 Obsidian 回收站设置被删除。",
            discardTrackedWarning: "确定要丢弃 {{count}} 个跟踪文件中的所有更改吗？",
            discardAllFiles: "丢弃所有 {{count}} 个文件",
            deleteAllFiles: "删除所有 {{count}} 个文件",
            discardTrackedFiles: "丢弃所有 {{count}} 个跟踪文件"
        }
    },

    // 状态消息
    status: {
        // 成功消息
        success: {
            committed: "成功提交更改",
            committedFiles: "已提交 {{count}} 个文件",
            committedApprox: "已提交约 {{count}} 个文件",
            pushed: "成功推送更改", 
            pulled: "成功拉取更改",
            staged: "成功暂存文件",
            unstaged: "成功取消暂存文件",
            discarded: "成功丢弃更改",
            branchSwitched: "已切换到分支",
            branchCreated: "成功创建分支",
            branchDeleted: "成功删除分支",
            initializedRepo: "已初始化新仓库",
            clonedRepo: "已克隆新仓库",
            deletedRepoReloading: "已成功删除仓库。正在重新加载插件...",
            discardedAllTrackedFiles: "已丢弃所有跟踪文件中的更改。",
            discardedAllFiles: "已丢弃所有文件。",
            stagedFile: "已暂存 {{file}}",
            unstagedFile: "已取消暂存 {{file}}"
        },

        // 错误消息
        error: {
            commitFailed: "提交更改失败",
            pushFailed: "推送更改失败",
            pullFailed: "拉取更改失败", 
            stageFailed: "暂存文件失败",
            unstageFailed: "取消暂存文件失败",
            discardFailed: "丢弃更改失败",
            branchSwitchFailed: "切换分支失败",
            branchCreateFailed: "创建分支失败",
            branchDeleteFailed: "删除分支失败",
            gitNotFound: "未找到 Git",
            notGitRepo: "不是 Git 仓库",
            noChangesToCommit: "没有要提交的更改",
            conflictDetected: "检测到合并冲突",
            networkError: "网络错误",
            authenticationFailed: "身份验证失败",
            fileNotFound: "文件未找到",
            noRepositoryFound: "未找到仓库",
            invalidDepthAbortingClone: "深度设置无效。已取消克隆。",
            abortedClone: "已取消克隆",
            noUpstreamBranchSetPleaseSelectOne: "未设置上游分支。请选择一个。",
            tooManyChangesToDisplay: "更改过多，无法显示",
            cantFindValidGitRepository: "无法找到有效的Git仓库。请通过给定命令创建一个或克隆现有仓库。",
            automaticRoutinesCurrentlyPaused: "自动例程当前已暂停。",
            somethingWeirdHappened: "发生了奇怪的事情。'checkRequirements'结果是 ",
            deleteLocalConfigWarning: "删除所有本地配置和插件",
            abortCloneOption: "取消克隆",
            conflictWarning: "为避免冲突，需要删除本地的 {{configDir}} 目录。",
            goingOfflineMode: "Git：进入离线模式。未来的网络错误将不再显示。",
            alreadyInOfflineMode: "遇到网络错误，但已处于离线模式",
            userCanceled: "已取消",
            aborted: "已中止"
        },

        // 信息消息
        info: {
            noChanges: "未检测到更改",
            upToDate: "仓库已是最新",
            checkingStatus: "检查 Git 状态...",
            refreshing: "刷新中...",
            syncing: "与远程同步中...",
            pulling: "拉取更改中...",
            pushing: "推送更改中...",
            committing: "提交更改中...",
            fetchingRemoteBranches: "正在获取远程分支...",
            cloningInto: "正在克隆到 \"{{dir}}\"",
            pleaseRestartObsidian: "请重启 Obsidian",
            pullUpToDate: "拉取：已是最新",
            noCommitsToPush: "没有可推送的提交",
            autoBackupEnterCustomCommitMessage: "自动备份：请输入自定义提交消息。留空以取消",
            stdoutEmptyUsingDefault: "提交消息脚本输出为空，改用默认消息。",
            noChangesToCommit: "没有要提交的更改",
            fetchedFromRemote: "已从远程获取",
            pausedRoutines: "自动例程当前已暂停。",
            resumedRoutines: "已恢复自动例程。",
            reloadingSettings: "重新加载设置中"
        }
    },

    // 状态栏
    statusBar: {
        branch: "分支",
        changes: "更改",
        commits: "提交",
        ahead: "领先",
        behind: "落后",
        noRepo: "无 Git 仓库",
        upToDate: "已是最新",
        syncing: "同步中...",
        error: "Git 错误",
        
        // 状态栏提示信息
        tooltips: {
            mergeConflicts: "您有合并冲突。请解决冲突并提交。",
            pausedAutomatics: "自动例程当前已暂停。",
            checkingStatus: "检查仓库状态中...",
            addingFiles: "添加文件中...",
            committingChanges: "提交更改中...",
            pushingChanges: "推送更改中...",
            pullingChanges: "拉取更改中...",
            failedInit: "初始化失败！",
            offline: "离线：",
            lastCommit: "最后提交：",
            unpushedCommits: "未推送提交",
            gitOffline: "Git 离线",
            gitReady: "Git 就绪"
        }
    },

    // Git 管理器
    gitManager: {
        // 错误消息
        errors: {
            basePathNotExist: "ObsidianGit: 基础路径不存在",
            authenticationFailed: "身份验证失败。请尝试使用不同的凭据",
            configValueNotString: "配置值不是字符串",
            couldNotResolveHost: "无法解析主机",
            unableToResolveHost: "无法解析主机",
            authorNotSet: "Git 作者姓名和邮箱未设置。请在设置中设置这两个字段。",
            pullFailed: "拉取失败 ({{method}}): {{error}}",
            syncFailed: "同步失败 ({{method}}): {{error}}"
        },
        
        // 操作消息
        operations: {
            initializingPull: "初始化拉取",
            finishedPull: "拉取完成",
            initializingPush: "初始化推送",
            initializingClone: "初始化克隆",
            initializingFetch: "初始化获取",
            gettingStatusLong: "这需要较长时间：获取状态中",
            noTrackingBranchPull: "未找到跟踪分支。忽略主仓库的拉取，仅更新子模块。",
            noTrackingBranchPush: "未找到跟踪分支。忽略主仓库的推送，仅更新子模块。"
        },
        
        // 提示消息
        prompts: {
            specifyUsername: "指定您的用户名",
            enterPassword: "输入您的密码",
            enterResponse: "输入对消息的回复。",
            specifyPasswordToken: "指定您的密码/个人访问令牌"
        },
        
        // 通用文本
        common: {
            tooManyFiles: "文件过多，无法列出",
            affectedFiles: "受影响的文件："
        }
    },

    // 工具函数
    tools: {
        fileSizeWarning: "GitHub 不允许大于 100MB 的文件。以下文件将会导致推送失败：",
        largeFileDetected: "检测到大文件",
        continueAnyway: "仍要继续？",
        runningCommand: "正在运行 '{{command}}'...",
        abortedCommitTooBig: "已中止提交，因为以下文件过大：\n- {{files}}\n请删除它们或添加到 .gitignore。",
        rawCommandPlaceholder: "push origin master"
    },

    // Svelte 组件
    components: {
        // 操作按钮 aria-label
        actions: {
            stage: "暂存",
            unstage: "取消暂存", 
            discard: "丢弃"
        },
        // 文件列表
        fileList: {
            andMoreFiles: "以及其他 {{count}} 个文件"
        }
    },

    // GitHub 集成
    openInGitHub: {
        notUsingGitHub: "看起来您未使用 GitHub"
    },

    // 冲突解决
    conflictResolution: {
        conflictedFilesInstructions: "我强烈建议使用'源代码模式'查看冲突文件。对于简单冲突，在上面列出的每个文件中，用所需文本替换以下文本块的每个出现。"
    }
};

export type TranslationKeyCN = keyof typeof zhCN;
export type TranslationValueCN = typeof zhCN;
