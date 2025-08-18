@echo off
echo ========================================
echo   Git Auto Commit Plugin - 开发模式
echo ========================================
echo.
echo 🚀 启动开发模式，将自动监听文件变化并重新构建...
echo.
echo 目标目录: C:\Code\Obsidian沙箱仓库\.obsidian\plugins\git-auto
echo.
echo 💡 提示：
echo - 保存任何 TypeScript 文件后会自动重新构建
echo - 在 Obsidian 中按 Ctrl+P 搜索"重新加载插件"来测试更改
echo - 按 Ctrl+C 停止监听
echo.

cd /d "%~dp0"
npm run dev:test
