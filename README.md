# Cursor Proxy 项目集合

这是一个包含多个实用工具和模板的项目集合，旨在提供开发者常用的工具和资源。

## 📁 项目结构

```
Cursor_Proxy/
├── DDCS/                    # Docker Desktop 中文汉化脚本
├── Python_Bag/              # AI模型便捷调用Python包
├── 网页模板/                 # ChatGPT风格静态UI模板
└── README.md               # 本文档
```

## 🚀 项目介绍

### 1. DDCS - Docker Desktop 中文汉化脚本

**功能描述**: Docker Desktop 的中文汉化工具，支持 Windows 和 Mac 系统。

**主要特性**:
- 🌏 完整的 Docker Desktop 界面中文化
- 🔄 支持自动提取和翻译新版本内容
- 🛠️ 提供手动翻译配置选项
- 📱 支持 Windows 和 Mac 双平台

**环境要求**:
- Python 3.10+
- Node.js
- 管理员权限

**快速使用**:
```bash
cd DDCS
npm install -g asar  # 如果需要
python ddcs.py
```

### 2. Python_Bag - AI模型便捷调用包

**功能描述**: 提供统一接口调用多种大语言模型API的Python包。

**支持的模型提供商**:
- 🤖 OpenAI (GPT系列)
- 🧠 智谱AI (GLM系列)
- 🔍 DeepSeek
- 🌟 阿里千问

**主要特性**:
- 🔌 统一的调用接口
- 💬 支持单次调用和连续对话
- 🔄 自动错误处理和重试
- 📝 配置文件管理
- 💾 对话历史自动保存

**快速开始**:
```python
from AI_caller.ai_caller import AICaller

ai = AICaller()
response, dialog_id, tokens = ai.openai().invoke(
    model_type='gpt-3.5-turbo',
    prompt_id='翻译为英文',
    call_mode='single_response',
    data='这是一段需要翻译的中文文本'
)
```

### 3. 网页模板 - ChatGPT风格静态UI

**功能描述**: 高保真的ChatGPT风格静态UI页面，采用Bento Grid布局。

**主要特性**:
- 🎨 Bento Grid 现代布局风格
- 💡 浅色模式设计
- 📱 响应式交互设计
- 🎯 图标化操作界面
- 🔧 可折叠侧边栏

**页面组件**:
- 左侧边栏（新建对话、历史记录）
- 主聊天界面
- 聊天输入区域
- 右侧滑出选择面板

**技术栈**:
- HTML5 + CSS3 + JavaScript
- Grid布局 + Flexbox
- 原生JavaScript交互

## 🛠️ 安装和使用

### 克隆仓库
```bash
git clone https://github.com/ItsDalk-Lane/Cursdor_Proxy.git
cd Cursdor_Proxy
```

### 各项目独立使用
每个子项目都有独立的README文档和使用说明，请参考各自目录下的文档：
- [DDCS使用说明](./DDCS/ReadMe.md)
- [Python_Bag使用说明](./Python_Bag/README.md)
- [网页模板使用说明](./网页模板/README.md)

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进这些项目！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用多种许可证，具体请查看各子项目的许可证文件。

## 📞 联系方式

如有问题或建议，欢迎通过以下方式联系：
- 提交 GitHub Issue
- 发送邮件或其他联系方式

## ⭐ 支持项目

如果这些项目对你有帮助，欢迎给个Star ⭐！

---

**最后更新**: 2024年12月
**维护者**: ItsDalk-Lane