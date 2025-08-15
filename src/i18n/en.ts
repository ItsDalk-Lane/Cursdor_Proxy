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
            pushed: "Changes pushed successfully", 
            pulled: "Changes pulled successfully",
            staged: "Files staged successfully",
            unstaged: "Files unstaged successfully",
            discarded: "Changes discarded successfully",
            branchSwitched: "Switched to branch",
            branchCreated: "Branch created successfully",
            branchDeleted: "Branch deleted successfully"
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
            authenticationFailed: "Authentication failed"
        },

        // Info messages
        info: {
            noChanges: "No changes detected",
            upToDate: "Repository is up to date",
            checkingStatus: "Checking Git status...",
            refreshing: "Refreshing...",
            syncing: "Syncing with remote...",
            pulling: "Pulling changes...",
            pushing: "Pushing changes...",
            committing: "Committing changes..."
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
        error: "Git error"
    }
};

export type TranslationKey = keyof typeof en;
export type TranslationValue = typeof en;
