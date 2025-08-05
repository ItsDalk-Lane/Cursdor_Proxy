# AI 对话助手 (AI Chat Assistant)

一个简洁而强大的 Obsidian 插件，提供浮动式 AI 对话界面，支持多种 AI 服务提供商，让您在阅读和写作时轻松与 AI 进行交互。

## ✨ 核心功能

### 🎨 浮动式对话窗口
- **智能浮动窗口**：可拖拽、可调整大小的对话界面
- **上下文感知**：自动提取文档高亮内容作为对话上下文
- **快速切换**：一键快速切换不同的 AI 模型
- **状态保持**：对话历史和窗口状态自动保存

### 🤖 多 AI 服务支持
支持主流 AI 服务提供商：
- **OpenAI** - GPT-4, GPT-4 Turbo, GPT-3.5 等
- **Anthropic** - Claude 3.5 Sonnet, Claude 3 Opus 等
- **Google Gemini** - Gemini Pro, Gemini Flash 等
- **DeepSeek** - DeepSeek Chat 等
- **SiliconFlow** - 硅基流动平台
- **Ollama** - 本地模型支持

### 🎯 智能上下文管理
- **多种提取策略**：
  - 智能模式：自动选择最佳上下文策略
  - 段落模式：提取完整段落
  - 章节模式：提取整个章节内容
  - 周围行模式：指定前后行数
- **实时预览**：上下文提取预览和设置调整
- **长度控制**：自定义上下文最大长度
- **标题包含**：可选择是否包含文档标题

### ⚙️ 灵活的配置系统
- **多模型管理**：支持配置多个 AI 模型并快速切换
- **自定义模型**：支持添加自定义模型和 API 端点
- **增强设置**：提供简化和高级两种配置模式
- **导入导出**：配置文件的导入导出功能

## 📥 安装方法

### 方法一：手动安装
1. 下载最新版本的插件文件
2. 将文件解压到 `.obsidian/plugins/ai-chat/` 目录
3. 在 Obsidian 设置中启用插件

### 方法二：社区插件安装（待上架）
1. 打开 Obsidian 设置
2. 进入"第三方插件"页面
3. 搜索"AI 对话助手"
4. 点击安装并启用

## 🚀 快速开始

### 1. 配置 AI 服务
1. 打开插件设置
2. 选择您偏好的 AI 服务提供商
3. 输入对应的 API Key
4. 测试连接确保配置正确

### 2. 基础使用
1. **选择文本**：在文档中高亮您想讨论的内容
2. **打开对话**：点击浮动按钮或使用快捷键
3. **开始对话**：在对话窗口中输入您的问题
4. **获取回复**：AI 会基于上下文内容回复您的问题

### 3. 高级功能
- **模型切换**：点击对话窗口标题栏的模型名称快速切换
- **上下文设置**：点击设置按钮调整上下文提取策略
- **多轮对话**：插件会保持对话历史，支持连续交流

## ⚙️ 详细配置

### AI 服务配置

#### OpenAI 配置
```json
{
  "apiKey": "sk-...",
  "model": "gpt-4o",
  "baseUrl": "https://api.openai.com/v1" // 可选，支持代理
}
```

#### Anthropic 配置
```json
{
  "apiKey": "sk-ant-...",
  "model": "claude-3-5-sonnet-20241022",
  "apiAddress": "https://api.anthropic.com" // 可选
}
```

#### Ollama 配置（本地模型）
```json
{
  "host": "http://localhost:11434",
  "model": "llama2" // 需要先下载模型
}
```

### 上下文选项
- **策略选择**：智能/段落/章节/周围行
- **最大长度**：控制发送给 AI 的文本长度
- **包含标题**：是否在上下文中包含文档标题
- **周围行数**：周围行模式的前后行数设置

## 🎛️ 高级功能

### 多模型管理
插件支持配置多个 AI 模型，您可以：
- 为不同任务配置不同的模型
- 快速在模型间切换
- 设置活跃模型和备用模型
- 批量管理模型配置

### 自定义模型
支持添加自定义模型：
- 自定义 API 端点
- 自定义模型参数
- 支持企业内部 AI 服务
- 兼容 OpenAI API 格式的服务

### 配置导入导出
- **导出配置**：备份您的所有设置
- **导入配置**：在不同设备间同步设置
- **重置设置**：一键恢复默认配置
- **使用统计**：查看模型使用情况

## 🛠️ 开发信息

### 技术栈
- **TypeScript** - 主要开发语言
- **Obsidian API** - 插件框架
- **ESBuild** - 构建工具
- **CSS** - 样式定制

### 项目结构
```
src/
├── components/           # UI 组件
│   ├── ChatView.ts      # 主对话界面
│   └── ModelConfigurationWizard.ts
├── services/            # 服务层
│   ├── AIService.ts     # AI 服务总控
│   ├── ChatService.ts   # 对话服务
│   ├── ContextService.ts # 上下文服务
│   └── [各AI服务实现]
├── settings/            # 设置界面
│   ├── EnhancedSettingTab.ts
│   ├── SimpleMultiModelTab.ts
│   └── ai/             # AI 服务设置
└── types.ts            # 类型定义
```

### 构建命令
```bash
# 开发模式
npm run dev

# 生产构建
npm run build

# 复制文件到插件目录
npm run copy-files
```

## 🤝 贡献指南

欢迎贡献代码和提出建议！

### 开发环境设置
1. Fork 本仓库
2. 克隆到本地：`git clone [your-fork-url]`
3. 安装依赖：`npm install`
4. 开始开发：`npm run dev`

### 提交规范
- 使用清晰的提交信息
- 遵循现有的代码风格
- 添加必要的测试和文档
- 确保 ESLint 检查通过

## 📝 更新日志

### v1.0.0
- ✨ 首次发布
- 🎯 支持 6 种主流 AI 服务
- 🎨 浮动式对话界面
- ⚙️ 智能上下文管理
- 🔧 多模型配置支持

## ❓ 常见问题

### Q: 如何获取 API Key？
A: 
- **OpenAI**: 访问 [platform.openai.com](https://platform.openai.com)
- **Anthropic**: 访问 [console.anthropic.com](https://console.anthropic.com)
- **Google**: 访问 [ai.google.dev](https://ai.google.dev)
- **DeepSeek**: 访问 [platform.deepseek.com](https://platform.deepseek.com)

### Q: 支持离线使用吗？
A: 通过 Ollama 可以使用本地模型，实现完全离线的 AI 对话。

### Q: 如何备份配置？
A: 在设置页面的"导出/导入"选项卡中可以导出配置文件。

### Q: 对话历史会保存吗？
A: 是的，对话历史会自动保存，重启 Obsidian 后会自动恢复。

## 📄 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- 基于 [HiNote](https://github.com/CatMuse) 项目修改
- 感谢 Obsidian 社区的支持
- 感谢所有贡献者的努力

## 📧 联系方式

- **GitHub Issues**: [提交问题或建议](https://github.com/[your-username]/ai-chat/issues)
- **讨论区**: [加入讨论](https://github.com/[your-username]/ai-chat/discussions)

---

**让 AI 成为您知识管理的得力助手！**