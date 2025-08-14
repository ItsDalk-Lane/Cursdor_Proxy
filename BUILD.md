# Git Auto Commit Plugin - 构建指南

## 🚀 快速开始

### 一次性构建
直接双击 `build-to-obsidian.bat` 文件，或在终端中运行：
```bash
npm run build:test
```

### 开发模式（自动重新构建）
双击 `dev-watch.bat` 文件，或在终端中运行：
```bash
npm run dev:test
```

## 📁 输出目录
所有构建文件都会输出到：
```
C:\Code\Obsidian沙箱仓库\.obsidian\plugins\git-auto\
```

## 📋 构建产物
- `main.js` - 编译后的插件代码
- `manifest.json` - 插件配置文件
- `styles.css` - 样式文件

## 🔧 构建脚本说明

### npm 脚本
- `npm run build:test` - 构建并部署到测试目录
- `npm run dev:test` - 开发模式，监听文件变化并自动重新构建
- `npm run build` - 标准生产构建（输出到当前目录）
- `npm run dev` - 标准开发模式（输出到当前目录）

### 批处理文件
- `build-to-obsidian.bat` - 用户友好的构建脚本
- `dev-watch.bat` - 用户友好的开发监听脚本

## 🧪 在 Obsidian 中测试

1. 构建完成后，打开 Obsidian
2. 进入设置 → 社区插件
3. 找到 "Git自动提交" 插件并启用
4. 开始测试功能

### 重新加载插件
当你在开发模式下修改代码时：
1. 保存文件（会自动重新构建）
2. 在 Obsidian 中按 `Ctrl+P`
3. 搜索并选择 "重新加载插件"
4. 或者完全重启 Obsidian

## 🛠️ 开发工作流程

1. 首次开发：运行 `dev-watch.bat`
2. 修改代码并保存
3. 在 Obsidian 中重新加载插件
4. 测试功能
5. 重复步骤 2-4

## ⚠️ 注意事项

- 确保目标 Obsidian 仓库路径正确
- 在开发模式下，保持批处理窗口开启
- 如果遇到权限问题，以管理员身份运行批处理文件
