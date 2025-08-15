// English language pack for Obsidian Git Plugin
export const en = {
    // Plugin meta information
    plugin: {
        name: "Git Master",
        description: "AI-powered Git commit message generation",
        author: "Your Name",
        authorUrl: "https://github.com/yourusername",
        fundingUrl: "https://buymeacoffee.com/yourusername"
    },

    // Commands
    commands: {
        // File operations
        editGitignore: "Edit .gitignore",
        stageCurrentFile: "Stage current file", 
        unstageCurrentFile: "Unstage current file",
        addFileToGitignore: "Add file to .gitignore",
        
        // Views
        openSourceControlView: "Open source control view",
        openHistoryView: "Open history view", 
        openDiffView: "Open diff view",
        
        // GitHub integration
        openFileOnGitHub: "Open file on GitHub",
        openFileHistoryOnGitHub: "Open file history on GitHub",
        
        // Git operations
        pull: "Pull",
        fetch: "Fetch",
        push: "Push",
        commitAllChanges: "Commit all changes",
        commitAllChangesWithMessage: "Commit all changes with specific message",
        commit: "Commit",
        commitStaged: "Commit staged",
        commitWithMessage: "Commit with specific message",
        commitStagedWithMessage: "Commit staged with specific message",
        amendStaged: "Amend staged",
        
        // Commit and sync operations
        commitAndSync: "Commit-and-sync",
        commitAndSyncAndClose: "Commit-and-sync and then close Obsidian",
        commitAndSyncWithMessage: "Commit-and-sync with specific message",
        
        // Branch operations
        switchBranch: "Switch branch",
        switchToRemoteBranch: "Switch to remote branch",
        createBranch: "Create new branch",
        deleteBranch: "Delete branch",
        
        // Remote operations
        editRemotes: "Edit remotes",
        removeRemote: "Remove remote",
        setUpstreamBranch: "Set upstream branch",
        
        // Repository operations
        initRepo: "Initialize a new repo",
        cloneRepo: "Clone an existing remote repo",
        deleteRepository: "CAUTION: Delete repository",
        
        // File management
        listChangedFiles: "List changed files",
        discardAllChanges: "CAUTION: Discard all changes",
        
        // System operations
        toggleAutomaticRoutines: "Pause/Resume automatic routines",
        rawCommand: "Raw command",
        
        // Line authoring
        toggleLineAuthor: "Toggle line author information"
    },

    // UI Components
    ui: {
        // Source Control View
        sourceControl: {
            title: "Source Control",
            noChanges: "No changes",
            changedFiles: "Changed files",
            stagedFiles: "Staged files",
            unstagedFiles: "Unstaged files",
            commitMessage: "Commit message",
            commit: "Commit",
            commitAndPush: "Commit & Push",
            refresh: "Refresh",
            stageAll: "Stage all",
            unstageAll: "Unstage all",
            discardAll: "Discard all changes",
            viewChanges: "View changes",
            stage: "Stage",
            unstage: "Unstage",
            discard: "Discard"
        },

        // History View  
        history: {
            title: "History",
            noCommits: "No commits",
            commitHistory: "Commit history",
            author: "Author",
            date: "Date", 
            message: "Message",
            hash: "Hash",
            viewCommit: "View commit",
            viewFile: "View file",
            copyHash: "Copy hash",
            checkoutCommit: "Checkout commit",
            revertCommit: "Revert commit"
        },

        // Diff View
        diff: {
            title: "Diff View",
            noDiff: "No differences",
            sideBySide: "Side by side",
            inline: "Inline",
            additions: "Additions",
            deletions: "Deletions",
            modifications: "Modifications",
            previousVersion: "Previous version",
            currentVersion: "Current version"
        },

        // Common UI elements
        common: {
            ok: "OK",
            cancel: "Cancel",
            save: "Save",
            delete: "Delete",
            edit: "Edit",
            create: "Create",
            close: "Close",
            back: "Back",
            next: "Next",
            previous: "Previous",
            loading: "Loading...",
            error: "Error",
            warning: "Warning",
            info: "Info",
            success: "Success"
        }
    },

    // Settings
    settings: {
        // Section headers
        sections: {
            general: "General",
            autoBackup: "Auto Backup",
            commitMessage: "Commit Message", 
            sync: "Sync",
            advanced: "Advanced",
            lineAuthor: "Line Author",
            appearance: "Appearance"
        },

        // Auto backup settings
        autoBackup: {
            enable: "Enable auto backup",
            interval: "Auto backup interval (minutes)",
            intervalDesc: "Set to 0 to disable auto backup",
            onFileChange: "Auto backup after file change",
            onFileChangeDesc: "Automatically backup when files are changed",
            customMessage: "Use custom message for auto backup",
            customMessageDesc: "Use custom commit message instead of default"
        },

        // Commit message settings
        commitMessage: {
            template: "Commit message template",
            templateDesc: "Template for commit messages. Use {{date}} for current date",
            autoTemplate: "Auto backup message template", 
            autoTemplateDesc: "Template for automatic backup commits",
            dateFormat: "Date format",
            dateFormatDesc: "Format for {{date}} placeholder",
            listChangedFiles: "List changed files in commit body",
            listChangedFilesDesc: "Add list of changed files to commit message body"
        },

        // Sync settings  
        sync: {
            method: "Sync method",
            methodDesc: "How to sync with remote repository",
            pullBeforePush: "Pull before push",
            pullBeforePushDesc: "Always pull before pushing changes",
            autoPull: "Auto pull on startup",
            autoPullDesc: "Automatically pull when Obsidian starts",
            autoPush: "Auto push", 
            autoPushDesc: "Automatically push after commits",
            disablePush: "Disable push",
            disablePushDesc: "Disable push operations (local only)",
            updateSubmodules: "Update submodules",
            updateSubmodulesDesc: "Update submodules when pulling"
        },

        // Advanced settings
        advanced: {
            gitPath: "Git path",
            gitPathDesc: "Path to Git executable",
            basePath: "Base path",
            basePathDesc: "Base path for Git operations", 
            gitDir: "Git directory",
            gitDirDesc: "Custom .git directory path",
            refreshInterval: "Refresh interval",
            refreshIntervalDesc: "How often to refresh source control view (seconds)",
            showStatusBar: "Show status bar",
            showStatusBarDesc: "Show Git status in status bar",
            showChangedFilesCount: "Show changed files count",
            showChangedFilesCountDesc: "Show number of changed files in status bar",
            showBranchInStatusBar: "Show branch in status bar",
            showBranchInStatusBarDesc: "Show current branch name in status bar"
        },

        // Line author settings
        lineAuthor: {
            enable: "Enable line author",
            enableDesc: "Show author information for each line",
            followMovement: "Follow movement",
            followMovementDesc: "Track line movements across commits",
            authorDisplay: "Author display",
            authorDisplayDesc: "How to display author names",
            showCommitHash: "Show commit hash",
            showCommitHashDesc: "Show commit hash in line author view",
            dateFormat: "Date format",
            dateFormatDesc: "Format for displaying dates",
            colorNew: "Color for new lines",
            colorOld: "Color for old lines",
            ignoreWhitespace: "Ignore whitespace",
            ignoreWhitespaceDesc: "Ignore whitespace changes when tracking authors"
        }
    },

    // Modals
    modals: {
        // General modal
        general: {
            selectOption: "Select an option",
            enterValue: "Enter a value",
            noOptionsAvailable: "No options available"
        },

        // Changed files modal
        changedFiles: {
            title: "Changed Files",
            noChangedFiles: "No changed files",
            stageSelected: "Stage selected",
            unstageSelected: "Unstage selected",
            discardSelected: "Discard selected"
        },

        // Custom message modal
        customMessage: {
            title: "Custom Commit Message",
            placeholder: "Enter commit message...",
            commitAndPush: "Commit and Push"
        },

        // Branch modal
        branch: {
            title: "Branch Operations",
            switchTo: "Switch to branch",
            createNew: "Create new branch",
            deleteBranch: "Delete branch",
            branchName: "Branch name",
            currentBranch: "Current branch",
            selectBranch: "Select branch",
            createBranchName: "New branch name",
            deleteBranchConfirm: "Are you sure you want to delete this branch?"
        },

        // Ignore modal
        ignore: {
            title: "Edit .gitignore",
            description: "Add files or patterns to ignore",
            save: "Save changes",
            syntaxHelp: "Gitignore syntax help"
        },

        // Discard modal
        discard: {
            title: "Discard Changes",
            warning: "Are you sure you want to discard all changes?",
            warningDesc: "This action cannot be undone.",
            discardAll: "Discard all changes",
            discardFile: "Discard changes to this file"
        }
    },

    // Status messages
    status: {
        // Success messages
        success: {
            committed: "Changes committed successfully",
            committedFiles: "Committed {{count}} file{{count === 1 ? '' : 's'}}",
            committedApprox: "Committed approx. {{count}} file{{count === 1 ? '' : 's'}}",
            pushed: "Changes pushed successfully", 
            pulled: "Changes pulled successfully",
            staged: "Files staged successfully",
            unstaged: "Files unstaged successfully",
            discarded: "Changes discarded successfully",
            branchSwitched: "Switched to branch",
            branchCreated: "Branch created successfully",
            branchDeleted: "Branch deleted successfully",
            initializedRepo: "Repository initialized",
            clonedRepo: "Repository cloned",
            deletedRepoReloading: "Repository deleted successfully. Reloading plugin...",
            discardedAllTrackedFiles: "Discarded all changes in tracked files.",
            discardedAllFiles: "Discarded all files.",
            stagedFile: "Staged {{file}}",
            unstagedFile: "Unstaged {{file}}"
        },

        // Error messages
        error: {
            commitFailed: "Failed to commit changes",
            pushFailed: "Failed to push changes",
            pullFailed: "Failed to pull changes", 
            stageFailed: "Failed to stage files",
            unstageFailed: "Failed to unstage files",
            discardFailed: "Failed to discard changes",
            branchSwitchFailed: "Failed to switch branch",
            branchCreateFailed: "Failed to create branch",
            branchDeleteFailed: "Failed to delete branch",
            gitNotFound: "Git not found",
            notGitRepo: "Not a Git repository",
            noChangesToCommit: "No changes to commit",
            conflictDetected: "Merge conflict detected",
            networkError: "Network error",
            authenticationFailed: "Authentication failed",
            fileNotFound: "File not found",
            noRepositoryFound: "No repository found",
            invalidDepthAbortingClone: "Invalid depth setting. Aborted clone.",
            abortedClone: "Aborted clone",
            noUpstreamBranchSetPleaseSelectOne: "No upstream branch set. Please select one.",
            tooManyChangesToDisplay: "Too many changes to display",
            cantFindValidGitRepository: "Cannot find valid Git repository. Please create one with the given commands or clone an existing repository.",
            automaticRoutinesCurrentlyPaused: "Automatic routines are currently paused.",
            somethingWeirdHappened: "Something weird happened. 'checkRequirements' result is ",
            deleteLocalConfigWarning: "Delete all local config and plugins",
            abortCloneOption: "Abort clone",
            conflictWarning: "To avoid conflicts, local {{configDir}} directory needs to be deleted.",
            goingOfflineMode: "Git: Going offline mode. Future network errors will not be shown.",
            alreadyInOfflineMode: "Network error encountered, but already in offline mode",
            userCanceled: "Aborted",
            aborted: "Aborted"
        },

        // Advanced settings
        advanced: {
            gitPath: "Git path",
            gitPathDesc: "Path to Git executable",
            basePath: "Base path",
            basePathDesc: "Base path for Git operations",
            gitDir: "Git directory",
            gitDirDesc: "Custom .git directory path",
            refreshInterval: "Refresh interval",
            refreshIntervalDesc: "Source control view refresh frequency (seconds)",
            showStatusBar: "Show status bar",
            showStatusBarDesc: "Show Git status in status bar",
            showChangedFilesCount: "Show changed files count",
            showChangedFilesCountDesc: "Show number of changed files in status bar",
            showBranchInStatusBar: "Show branch in status bar",
            showBranchInStatusBarDesc: "Show current branch name in status bar",
            disableErrorNotifications: "Disable error notifications",
            disableErrorNotificationsDesc: "Disable any type of error notifications to reduce distraction (see status bar for updates).",
            hideNoChangesNotifications: "Hide no changes notifications",
            hideNoChangesNotificationsDesc: "Do not show notifications when there are no changes to commit or push.",
            
            // Auto refresh settings
            autoRefresh: "Auto refresh source control view",
            autoRefreshDesc: "Automatically refresh source control view on file changes. This may cause lag on slower machines. If so, disable this option.",
            refreshIntervalMs: "Source control view refresh interval",
            refreshIntervalMsDesc: "How many milliseconds to wait after file changes before refreshing the source control view.",
            
            // Miscellaneous settings
            miscellaneous: "Miscellaneous",
            diffViewStyle: "Diff view style",
            diffViewStyleDesc: "Set the style of the diff view. Note that the actual diff in 'split' mode is not generated by Git but by the editor itself, so it might differ from the Git-generated diff. One benefit of this is that you can edit the text in that view.",
            diffViewStyleOptions: {
                split: "Split",
                unified: "Unified"
            },
            disableNotifications: "Disable informational notifications",
            disableNotificationsDesc: "Disable informational notifications for git operations to reduce distraction (see status bar for updates).",
            
            // File menu integration
            fileMenuIntegration: "File menu integration",
            fileMenuIntegrationDesc: "Add 'Stage', 'Unstage', and 'Add to .gitignore' actions to the file menu.",
            
            // Branch status bar
            branchStatusBar: "Show branch status bar",
            branchStatusBarDesc: "Obsidian must be restarted for changes to take effect.",
            showFileCountInStatusBar: "Show number of changed files in status bar",
            
            // Author settings
            commitAuthor: "Commit author",
            username: "Username",
            usernameDesc: "Your username on git server. For example your username on GitHub",
            password: "Password/Personal access token",
            passwordDesc: "Enter your password. You will not be able to see it again.",
            authorName: "Author name for commits",
            authorEmail: "Author email for commits",
            
            // Advanced settings description
            advancedDesc: "These settings usually don't need to be changed, but may be required for special setups.",
            updateSubmodules: "Update submodules",
            updateSubmodulesDesc: "'Commit and sync' and 'Pull' will handle submodules. Missing features: Conflicted files, count of pulled/pushed/committed files. Tracking branch needs to be set for each submodule.",
            submoduleRecurse: "Submodule recursive checkout/switch",
            submoduleRecurseDesc: "Recursively checkout submodules whenever a checkout happens on the root repository (if the branch exists).",
            customGitPath: "Custom Git binary path",
            additionalEnvVars: "Additional environment variables",
            additionalEnvVarsDesc: "Use one new environment variable per line with the format KEY=VALUE.",
            additionalPaths: "Additional PATH environment variable paths",
            additionalPathsDesc: "Use one path per line",
            reloadEnvVars: "Reload new environment variables",
            reloadEnvVarsDesc: "Removing previously added environment variables will not take effect until Obsidian is restarted.",
            customBasePath: "Custom base path (Git repository path)",
            customBasePathDesc: "Set the path relative to the vault where the Git binary should execute. Mainly used for setting the Git repository path. Only use if the Git repository is under the vault root. Use '\\' instead of '/' on Windows.",
            customGitDir: "Custom Git directory path (instead of '.git')",
            customGitDirDesc: "Obsidian needs to be restarted for changes to take effect. Use '\\' instead of '/' on Windows.",
            disableOnDevice: "Disable on this device",
            disableOnDeviceDesc: "Disable the plugin on this device. This setting will not sync.",
            disableRestart: "Obsidian must be restarted for changes to take effect.",
            
            // Additional setting translations
            dateFormatPlaceholder: "Specify custom date format. E.g. YYYY-MM-DD HH:mm:ss. See Moment.js for more formats.",
            mergeStrategyDefault: "Merge",
            mergeStrategyRebase: "Rebase",
            mergeStrategyReset: "Other sync service (Only updates the HEAD without touching the working directory)",
            languageChangeNotice: "Language changed to {{language}}",
            
            // Reload related
            obsidianMustRestart: "Obsidian must be restarted for changes to take effect.",
            reload: "Reload",
            reloadingSettings: "Reloading settings",
            
            // Support information
            support: "Support",
            donate: "Donate",
            donateDesc: "If you like this plugin, please consider donating to support continued development.",
            copyDebugInfo: "Copy debug info",
            debugInfoCopied: "Debug info copied to clipboard. May contain sensitive information!",
            debuggingLogging: "Debugging and logging: You can always view logs for this plugin and every other plugin by opening the developer tools (Ctrl+Shift+I) and going to the console tab."
        },
    },

    // Settings
    settings: {
        // Section headers
        sections: {
            general: "General",
            autoBackup: "Auto Backup",
            commitMessage: "Commit Message", 
            sync: "Sync",
            pull: "Pull",
            advanced: "Advanced",
            lineAuthor: "Line Author",
            appearance: "Appearance",
            language: "Display Language",
            historyView: "History View",
            sourceControlView: "Source Control View"
        },

        // Language settings
        language: {
            description: "Choose the language for the plugin interface"
        },

        // Basic settings
        gitNotReady: "Git is not ready. When all settings are correct, you can configure commit sync etc.",

        // Auto backup settings
        autoBackup: {
            enable: "Enable auto backup",
            interval: "Auto backup interval (minutes)",
            intervalDesc: "Set to 0 to disable auto backup",
            onFileChange: "Auto backup after file change",
            onFileChangeDesc: "Automatically create backup when files change",
            customMessage: "Use custom auto backup message",
            customMessageDesc: "Use custom commit message instead of default message",
            splitTimers: "Split timers for auto commit and sync",
            splitTimersDesc: "Enable to use different intervals for commits and syncs.",
            autoIntervalTitle: "Auto interval (minutes)",
            autoIntervalDesc: "Automatically do changes every X minutes. Set to 0 (default) to disable. (See settings below for further configuration!)"
        },

        // Commit message settings
        commitMessage: {
            template: "Commit message template for manual commits",
            templateDesc: "Available placeholders: {{date}} (see below), {{hostname}} (see below), {{numFiles}} (number of changed files in the commit) and {{files}} (changed files in commit message).",
            templateDescPlaceholders: "Available placeholders: {{date}} (see below), {{hostname}} (see below), {{numFiles}} (number of changed files in the commit) and {{files}} (changed files in commit message).",
            autoTemplate: "Auto backup message template", 
            autoTemplateDesc: "Message template for auto backup commits",
            script: "Commit message script",
            scriptDesc: "Script run with 'sh -c' to generate commit message. Can be used to use AI tools for generating commit messages. Available placeholders: {{hostname}}, {{date}}.",
            dateFormat: "{{date}} placeholder format",
            dateFormatDesc: "Format for the {{date}} placeholder",
            hostname: "{{hostname}} placeholder replacement",
            hostnameDesc: "Specify a custom hostname for each device.",
            listChangedFiles: "List changed files in commit body",
            listChangedFilesDesc: "Add list of changed files to commit message body",
            previewMessage: "Preview commit message",
            
            // Auto commit related settings
            autoCommitAfterStop: "Auto commit after stopping file editing",
            autoCommitAfterStopDesc: "Requires commit interval to be non-zero. If enabled, auto commit after stopping file editing for 0 minutes. This also prevents auto commits while editing files. If disabled, it's independent of last file edit.",
            autoCommitAfterLatest: "Auto commit after latest commit", 
            autoCommitAfterLatestDesc: "If enabled, set last auto commit timestamp to latest commit timestamp. This reduces auto commit frequency when manual commits are made.",
            autoCommitOnlyStaged: "Auto commit only staged files",
            autoCommitOnlyStagedDesc: "If enabled, only staged files will be committed during commits. If disabled, all changed files will be committed.",
            customMessageOnAuto: "Specify custom commit message on auto commit",
            customMessageOnAutoDesc: "You will get a popup to specify your message.",
            commitMessageOnAuto: "Commit message for auto commits",
            
            // Dynamic titles (parameterized support)
            autoActionAfterStoppingEdits: "Auto {{action}} after stopping file editing",
            autoActionAfterStoppingEditsDesc: "Requires {{action}} interval to be non-zero. If enabled, auto {{action}} after stopping file editing for {{interval}} minutes. This also prevents auto {{action}} while editing files. If disabled, it's independent of last file edit.",
            autoActionAfterLatestCommit: "Auto {{action}} after latest commit",
            autoActionAfterLatestCommitDesc: "If enabled, set last auto {{action}} timestamp to latest commit timestamp. This reduces auto {{action}} frequency when manual commits are made.",
            autoActionOnlyStaged: "Auto {{action}} only staged files", 
            autoActionOnlyStagedDesc: "If enabled, only staged files will be {{action}}ed during {{action}}. If disabled, all changed files will be {{action}}ed.",
            customMessageOnAutoAction: "Specify custom commit message on auto {{action}}",
            messageOnAutoAction: "Commit message for auto {{action}}"
        },

        // Sync settings  
        sync: {
            method: "Sync method",
            methodDesc: "Method for syncing with remote repository",
            autoPushInterval: "Auto push interval (minutes)",
            autoPushIntervalDesc: "Push commits every X minutes. Set to 0 (default) to disable.",
            autoPullInterval: "Auto pull interval (minutes)",
            autoPullIntervalDesc: "Pull changes every X minutes. Set to 0 (default) to disable.",
            mergeStrategy: "Merge strategy",
            mergeStrategyDesc: "Decides how to integrate commits from remote branch into local branch.",
            mergeStrategyOptions: {
                merge: "Merge",
                rebase: "Rebase", 
                reset: "Reset",
                otherSyncService: "Other sync service (Only updates HEAD without touching working directory)"
            },
            pullOnStartup: "Pull on startup",
            pullOnStartupDesc: "Automatically pull commits when Obsidian starts.",
            commitAndSyncDesc: "Default commit and sync as configured means stage all -> commit -> pull -> push. Ideally this is the single operation you do regularly to keep local and remote repository in sync.",
            pushOnCommitAndSync: "Push on commit and sync",
            pushOnCommitAndSyncDesc: "Most of the time you want to push after committing. Turning this off will make commit and sync operation commit only. It will still be called commit and sync.",
            pullOnCommitAndSync: "Pull on commit and sync",
            pullOnCommitAndSyncDesc: "During commit and sync, also pull commits. Turning this off will make commit and sync operation commit only.",
            pullBeforePush: "Pull before push",
            pullBeforePushDesc: "Always pull before pushing changes",
            autoPull: "Auto pull on startup",
            autoPullDesc: "Automatically pull when Obsidian starts",
            autoPush: "Auto push", 
            autoPushDesc: "Automatically push after committing",
            disablePush: "Disable push",
            disablePushDesc: "Disable push operations (local only)",
            updateSubmodules: "Update submodules",
            updateSubmodulesDesc: "Update submodules when pulling"
        },

        // Advanced settings (already defined above)
        advanced: {
            // (content already defined above)
        },

        // History view settings
        historyView: {
            showAuthor: "Show author",
            showAuthorDesc: "Show commit author in history view.",
            showDate: "Show date",
            showDateDesc: "Show commit date in history view. Uses {{date}} placeholder format to display date."
        },

        // UI settings
        ui: {
            showStatusBar: "Show status bar",
            showStatusBarDesc: "Obsidian must be restarted for changes to take effect.",
            showBranchStatusBar: "Show branch status bar",
            showBranchStatusBarDesc: "Obsidian must be restarted for changes to take effect.",
            showChangedFilesCount: "Show number of changed files in status bar"
        },

        // Line author settings
        lineAuthor: {
            enable: "Show commit author information",
            enableDesc: "Show author information for each line",
            onlyDesktop: "Currently only available on desktop.",
            followMovement: "Follow movement and copying",
            followMovementDesc: "Track code line movement across commits",
            followMovementInactive: "Don't follow (default)",
            followMovementSameCommit: "Follow within same commit",
            followMovementAllCommits: "Follow across all commits (may be slower)",
            showCommitHash: "Show commit hash",
            showCommitHashDesc: "Show commit hash in line author view",
            authorDisplay: "Author name display",
            authorDisplayDesc: "Whether and how to show author",
            authorDisplayHide: "Hide",
            authorDisplayInitials: "Initials (default)",
            authorDisplayFirstName: "First name",
            authorDisplayLastName: "Last name",
            authorDisplayFull: "Full name",
            dateFormat: "Date format",
            dateFormatDesc: "Date display format",
            colorNew: "New line color",
            colorOld: "Old line color",
            ignoreWhitespace: "Ignore whitespace",
            ignoreWhitespaceDesc: "Ignore whitespace changes when tracking authors",
            
            // Show author info related
            showAuthorInfo: "Show commit author information",
            showAuthorInfoDesc: "Commit hash, author name and authoring date can all be toggled individually.",
            authorInfoFeatureGuide: "Feature guide and quick examples",
            hideEverything: "Hide everything, show only age-colored sidebar.",
            
            // Authoring date display
            authoringDateDisplay: "Authoring date display",
            authoringDateDisplayDesc: "Whether and how to display the date and time when the line was authored",
            authoringDateDisplayOptions: {
                hide: "Hide",
                date: "Date",
                datetime: "Date and time",
                natural: "Natural language",
                custom: "Custom"
            },
            customAuthoringDateFormat: "Custom authoring date format",
            authoringDateTimezone: "Authoring date display timezone",
            authoringDateTimezoneOptions: {
                authorLocal: "Author's local timezone",
                utc: "UTC+0000/Z"
            },
            oldestAgeColoring: "Oldest age in coloring",
            ignoreWhitespaceChanges: "Ignore whitespace and newlines in changes"
        }
    },

    // Status bar
    statusBar: {
        branch: "Branch",
        changes: "changes",
        commits: "commits",
        ahead: "ahead",
        behind: "behind",
        noRepo: "No Git repo",
        upToDate: "Up to date",
        syncing: "Syncing...",
        error: "Git error",
        
        // Status bar tooltip information
        tooltips: {
            mergeConflicts: "You have merge conflicts. Please resolve conflicts and commit.",
            pausedAutomatics: "Automatic routines are currently paused.",
            checkingStatus: "Checking repository status...",
            addingFiles: "Adding files...",
            committingChanges: "Committing changes...",
            pushingChanges: "Pushing changes...",
            pullingChanges: "Pulling changes...",
            failedInit: "Failed to initialize!",
            offline: "Offline: ",
            lastCommit: "Last commit: ",
            unpushedCommits: "unpushed commits",
            gitOffline: "Git offline",
            gitReady: "Git ready"
        }
    },

    // Modals
    modals: {
        // Remote repository related
        remote: {
            selectOrCreateRemote: "Select or create new remote by typing name and selecting",
            selectOrCreateRemoteBranch: "Select or create new remote branch by typing name and selecting",
            selectRemote: "Select a remote",
            enterRemoteUrl: "Enter remote repository URL",
            enterDirectoryForClone: "Enter directory for clone. It needs to be empty or not exist.",
            specifyDepthOfClone: "Specify depth of clone. Leave empty for full clone."
        },

        // Branch related  
        branch: {
            title: "Branch operations",
            switchTo: "Switch to branch",
            createNew: "Create new branch",
            createNewBranch: "Create new branch",
            deleteBranch: "Delete branch",
            branchName: "Branch name",
            currentBranch: "Current branch",
            selectBranch: "Select branch to checkout",
            createBranchName: "New branch name",
            deleteBranchConfirm: "Are you sure you want to delete this branch?"
        },

        // General modals
        general: {
            selectOption: "Select an option",
            enterValue: "Enter a value",
            noOptionsAvailable: "No options available",
            defaultPlaceholder: "..."
        },

        // Changed files modal
        changedFiles: {
            title: "Changed files",
            noChangedFiles: "No changed files",
            stageSelected: "Stage selected",
            unstageSelected: "Unstage selected",
            discardSelected: "Discard selected",
            notSupportedFilesWarning: "Unsupported files will be opened with default app!",
            untracked: "Untracked",
            workingDir: "Working dir: ",
            index: "Index: "
        },

        // Custom message modal
        customMessage: {
            title: "Custom commit message",
            placeholder: "Enter your message and optionally include the version with the date.",
            commitAndPush: "Commit and push"
        },

        // Ignore files modal
        ignore: {
            title: "Edit .gitignore",
            description: "Add files or patterns to ignore",
            save: "Save",
            syntaxHelp: "Gitignore syntax help"
        },

        // Discard changes modal
        discard: {
            title: "Discard changes",
            warning: "Are you sure you want to discard all changes?",
            warningDesc: "This action cannot be undone.",
            discardAll: "Discard all changes",
            discardFile: "Discard changes in this file",
            delete: "Delete",
            discard: "Discard",
            cancel: "Cancel",
            filesIn: "Files in",
            deleteUntrackedWarning: "Are you sure you want to delete {{count}} untracked files? They will be deleted according to your Obsidian trash settings.",
            discardTrackedWarning: "Are you sure you want to discard all changes in {{count}} tracked files?",
            discardAllFiles: "Discard all {{count}} files",
            deleteAllFiles: "Delete all {{count}} files",
            discardTrackedFiles: "Discard all {{count}} tracked files"
        }
    },

    // Status messages - moved to already existing location above

    // GitHub integration
    openInGitHub: {
        notUsingGitHub: "It looks like you are not using GitHub"
    },

    // Conflict resolution
    conflictResolution: {
        conflictedFilesInstructions: "I strongly recommend viewing conflicted files in 'source mode'. For simple conflicts, in each of the files listed above, replace every occurrence of the following text blocks with the desired text."
    }
};

export type TranslationKey = keyof typeof en;
export type TranslationValue = typeof en;
