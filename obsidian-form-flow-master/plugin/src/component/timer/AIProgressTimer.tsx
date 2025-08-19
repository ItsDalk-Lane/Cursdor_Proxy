import React, { useState, useEffect, useRef } from 'react';
import './AIProgressTimer.css';

interface AIProgressTimerProps {
    isRunning: boolean;
    onComplete?: () => void;
}

export function AIProgressTimer({ isRunning, onComplete }: AIProgressTimerProps) {
    const [seconds, setSeconds] = useState(0);
    const [milliseconds, setMilliseconds] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isRunning) {
            // 开始计时
            setSeconds(0);
            setMilliseconds(0);
            
            intervalRef.current = setInterval(() => {
                setMilliseconds(prev => {
                    if (prev >= 90) {
                        setSeconds(s => s + 1);
                        return 0;
                    }
                    return prev + 10;
                });
            }, 100); // 每100ms更新一次
        } else {
            // 停止计时
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            if (onComplete) {
                onComplete();
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, onComplete]);

    const formatTime = () => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        const ms = Math.floor(milliseconds / 10);
        
        if (mins > 0) {
            return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
        } else {
            return `${secs}.${ms.toString().padStart(2, '0')}s`;
        }
    };

    if (!isRunning && seconds === 0) {
        return null;
    }

    return (
        <div className="ai-progress-timer">
            <div className="ai-progress-timer__icon">
                {isRunning ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12,6 12,12 16,14"/>
                    </svg>
                ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20,6 9,17 4,12"/>
                    </svg>
                )}
            </div>
            <div className="ai-progress-timer__text">
                {isRunning ? 'AI处理中' : 'AI处理完成'}
            </div>
            <div className="ai-progress-timer__time">
                {formatTime()}
            </div>
        </div>
    );
}
