import { AIProgressTimer } from "../../component/timer/AIProgressTimer";
import { createRoot, Root } from "react-dom/client";
import React from "react";
import { debugManager } from "../../utils/DebugManager";

class AITimerManager {
    private static instance: AITimerManager;
    private container: HTMLElement | null = null;
    private root: Root | null = null;
    private isRunning = false;

    static getInstance(): AITimerManager {
        if (!AITimerManager.instance) {
            AITimerManager.instance = new AITimerManager();
        }
        return AITimerManager.instance;
    }

    startTimer(): void {
        if (this.isRunning) {
            return; // 已经在运行，不重复启动
        }


        this.isRunning = true;
        this.createTimerElement();
    }

    stopTimer(): void {
        if (!this.isRunning) {
            return; // 未在运行，无需停止
        }


        this.isRunning = false;
        this.updateTimer();

        // 2秒后自动移除计时器
        setTimeout(() => {
            this.removeTimer();
        }, 2000);
    }

    private createTimerElement(): void {
        if (this.container) {
            this.updateTimer();
            return;
        }

        // 创建计时器容器
        this.container = document.createElement("div");
        this.container.className = "ai-timer-global-container";
        document.body.appendChild(this.container);

        // 创建React根
        this.root = createRoot(this.container);
        this.updateTimer();
    }

    private updateTimer(): void {
        if (!this.root || !this.container) {
            return;
        }

        this.root.render(
            React.createElement(AIProgressTimer, {
                isRunning: this.isRunning,
                onComplete: () => {
        
                }
            })
        );
    }

    private removeTimer(): void {
        if (this.root) {
            try {
                this.root.unmount();
            } catch (e) {
                debugManager.error('AITimerManager', 'Error unmounting timer root:', e);
            }
            this.root = null;
        }

        if (this.container) {
            this.container.remove();
            this.container = null;
        }
    }

    // 强制清理方法，用于插件卸载时
    cleanup(): void {
        this.isRunning = false;
        this.removeTimer();
    }
}

export const AITimer = AITimerManager.getInstance();
