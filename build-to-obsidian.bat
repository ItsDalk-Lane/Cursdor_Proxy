@echo off
echo ========================================
echo     Git Auto Commit Plugin Builder
echo ========================================
echo.
echo 正在构建插件到 Obsidian 沙箱仓库...
echo.

cd /d "%~dp0"

echo [1/3] 检查 TypeScript 类型...
call npm run build:test

if %errorlevel% neq 0 (
    echo.
    echo ❌ 构建失败！请检查代码错误。
    pause
    exit /b 1
)

echo.
echo ✅ 构建完成！
echo.
echo 插件已成功部署到：
echo C:\Code\Obsidian沙箱仓库\.obsidian\plugins\git-auto
echo.
echo 💡 提示：
echo 1. 在 Obsidian 中重新加载插件以查看更改
echo 2. 或者重启 Obsidian 应用程序
echo.
pause
