# Obsidian Form Flow Plugin

一个为 Obsidian 设计的强大表单工作流插件，让您能够创建自定义表单并执行各种自动化操作。

## 🌟 项目概览

Form Flow 是一个功能丰富的 Obsidian 插件，旨在简化用户的工作流程。通过创建自定义表单，用户可以快速收集信息并执行预定义的操作，从而提高工作效率。插件支持多种动作类型、字段类型，并提供了强大的AI集成功能。

### 版本信息
- **插件名称**: obsidian-form-flow
- **当前版本**: 1.0.0
- **描述**: Create powerful form workflows with AI integration and automation
- **许可证**: MIT
- **作者**: Trae AI

## 🏗️ 功能架构

### 核心功能模块

1. **表单系统**
   - 动态表单创建和编辑
   - 12种字段类型支持（文本、多行文本、数字、日期、选择框等）
   - 条件显示逻辑和执行条件
   - 表单验证机制和右键提交功能
   - 表单注册为命令，支持快捷键

2. **动作执行引擎**
   - 14种动作类型支持
   - 文件操作（创建、打开、更新前置元数据）
   - 文本处理（插入文本、内容清理、复制功能）
   - AI集成（调用AI模型进行内容生成）
   - 脚本执行和命令调用
   - 建议模态框和表单生成

3. **AI集成系统**
   - 多AI提供商支持
   - 自定义AI模型管理
   - 提示词模板系统
   - AI模型验证功能
   - 高级参数配置（温度、top_p、top_k等）

4. **用户界面**
   - 直观的表单编辑器
   - 实时预览功能
   - 响应式设计
   - 拖拽排序支持
   - 多语言支持（中文/英文）

5. **扩展系统**
   - 自定义脚本支持
   - 插件 API 集成
   - 模板系统
   - 虚拟化长列表支持

## 📁 文件结构

```
obsidian-form-flow-master/
├── plugin/                     # 插件主目录
│   ├── src/                   # 源代码目录
│   │   ├── api/              # API 接口层
│   │   ├── component/        # React 组件
│   │   ├── context/          # React 上下文
│   │   ├── core/             # 核心业务逻辑
│   │   ├── hooks/            # React Hooks
│   │   ├── i18n/             # 国际化文件
│   │   │   ├── en.ts         # 英文翻译
│   │   │   ├── zh.ts         # 中文翻译
│   │   │   └── local.ts      # 翻译接口定义
│   │   ├── model/            # 数据模型
│   │   │   ├── enums/        # 枚举定义
│   │   │   │   ├── FormActionType.ts    # 动作类型枚举
│   │   │   │   └── FormFieldType.ts     # 字段类型枚举
│   │   │   └── interfaces/   # 接口定义
│   │   ├── service/          # 业务服务层
│   │   │   └── action/       # 动作服务
│   │   │       ├── AICallActionService.ts           # AI调用服务
│   │   │       ├── IActionService.ts                # 动作服务接口
│   │   │       ├── add-spaces-between-cjk-and-latin/ # 中英文加空格
│   │   │       ├── content-cleanup/                 # 内容清理
│   │   │       ├── convert-image-links/             # 复制为纯文本格式
│   │   │       ├── copy-as-rich-text/               # 复制为Markdown格式
│   │   │       ├── create-file/                     # 创建文件
│   │   │       ├── execute-command/                 # 执行命令
│   │   │       ├── generate-form/                   # 生成表单
│   │   │       ├── insert-text/                     # 插入文本
│   │   │       ├── open-file/                       # 打开文件
│   │   │       ├── open-link/                       # 打开链接
│   │   │       ├── run-script/                      # 运行脚本
│   │   │       ├── suggest-modal/                   # 建议模态框
│   │   │       ├── update-frontmatter/              # 更新前置元数据
│   │   │       └── util/                            # 工具函数
│   │   ├── settings/         # 设置管理
│   │   ├── style/            # 样式文件
│   │   ├── test/             # 测试文件
│   │   ├── utils/            # 工具函数
│   │   ├── view/             # 视图组件
│   │   │   ├── edit/         # 编辑视图
│   │   │   ├── preview/      # 预览视图
│   │   │   └── shared/       # 共享组件
│   │   └── main.ts           # 插件入口文件
│   ├── manifest.json         # 插件清单文件
│   ├── package.json          # 项目依赖配置
│   ├── esbuild.config.mjs    # 构建配置
│   ├── tsconfig.json         # TypeScript配置
│   └── versions.json         # 版本历史
└── README.md                 # 项目文档
```

## 🔧 核心服务

### 动作服务 (Action Services)

#### 文件操作类
- **CreateFileActionService**: 文件创建服务，支持模板创建和自定义路径
- **OpenFileActionService**: 文件打开服务，支持多种打开方式（当前页、新标签页、分屏等）
- **UpdateFrontmatterActionService**: 前置元数据更新服务，支持属性的增删改

#### 文本处理类
- **InsertTextActionService**: 文本插入服务，支持多种插入位置（光标处、文件开头/结尾、指定标题下等）
- **CopyAsRichTextActionService**: 复制为Markdown格式，保留富文本格式
- **ConvertImageLinksActionService**: 复制为纯文本格式，自动移除frontmatter属性信息
- **ContentCleanupActionService**: 内容清理服务，移除多余格式和字符
- **AddSpacesBetweenCjkAndLatinActionService**: 中英文之间自动添加空格，提升可读性

#### 交互功能类
- **SuggestModalActionService**: 建议模态框服务，提供选择列表界面
- **GenerateFormActionService**: 表单生成服务，动态创建新表单
- **OpenLinkActionService**: 链接打开服务，支持内部链接和外部URL
- **ExecuteCommandActionService**: 命令执行服务，调用Obsidian内置命令

#### 扩展功能类
- **RunScriptActionService**: 脚本执行服务，支持自定义JavaScript脚本
- **AICallActionService**: AI调用服务，支持多种AI提供商和自定义提示词

### 字段类型支持

#### 基础输入字段
- **TEXT**: 单行文本输入，支持占位符和默认值
- **TEXTAREA**: 多行文本输入，支持自定义高度
- **PASSWORD**: 密码输入，自动隐藏输入内容
- **NUMBER**: 数字输入，支持最小值和最大值限制

#### 时间日期字段
- **DATE**: 日期选择器，支持日期格式自定义
- **TIME**: 时间选择器，支持24小时制
- **DATETIME**: 日期时间选择器，组合日期和时间输入

#### 选择控件字段
- **CHECKBOX**: 复选框，支持多选和默认选中状态
- **TOGGLE**: 开关切换，布尔值输入控件
- **RADIO**: 单选按钮组，从多个选项中选择一个
- **SELECT**: 单选列表，下拉选择控件
- **SELECT2**: 高级下拉列表，支持搜索和自定义值

#### 特殊功能字段
- **PROPERTY_VALUE**: 属性值字段，从文件属性中获取值
- **FILE_LIST**: 文件列表字段，选择库中的文件
- **AI_MODEL_LIST**: AI模型列表字段，选择配置的AI模型
- **TEMPLATE_LIST**: 模板列表字段，选择可用的模板文件

## ⚙️ 配置系统

### 插件设置

- **表单文件默认存放路径**: 支持日期变量如 `{{date:YYYY-MM-DD}}`
- **脚本加载目录配置**: 自定义脚本文件存放位置
- **AI提示模板目录**: AI提示词模板文件存放位置
- **多语言界面支持**: 中文/英文切换
- **调试模式开关**: 控制调试信息输出

### AI模型管理

- **多提供商支持**: 支持不同的AI服务提供商
- **模型参数配置**: 温度、top_p、top_k、频率惩罚等
- **API密钥管理**: 安全的密钥存储
- **模型验证功能**: 验证模型可用性

### 表单配置

- **字段类型和属性设置**: 17种字段类型的详细配置
- **条件显示逻辑**: 基于其他字段值的动态显示
- **执行条件**: 控制动作的执行条件
- **验证规则配置**: 必填字段、格式验证等
- **动作流程定义**: 多动作串联执行

## 🚀 开发和部署

### 技术栈

- **前端框架**: React 18.3.0 + React DOM 18.3.0
- **构建工具**: esbuild 0.17.3
- **语言**: TypeScript 4.7.4
- **UI 组件**: 自定义组件 + Radix UI 1.4.1
- **代码编辑器**: CodeMirror 6（支持JavaScript、Markdown、YAML语法高亮）
- **拖拽功能**: Atlaskit Pragmatic Drag and Drop 1.3.0
- **虚拟化**: Tanstack React Virtual 3.13.5（优化长列表性能）
- **图标库**: Lucide React 0.424.0（现代化图标集）
- **日期处理**: Luxon 3.4.4（强大的日期时间库）
- **浮动UI**: Floating UI React 0.27.5（智能定位组件）
- **错误处理**: React Error Boundary 4.0.13
- **代码格式化**: Prettier 2.8.0
- **唯一标识**: UUID 9.0.1

### 开发环境设置

```bash
# 安装依赖
npm install

# 开发模式（热重载）
npm run dev

# 构建生产版本
npm run build

# 版本更新
npm run version
```

### 项目依赖

#### 核心运行时依赖
- `react` (18.3.0) & `react-dom` (18.3.0): React 框架核心
- `obsidian` (latest): Obsidian API 接口
- `lucide-react` (0.424.0): 现代化图标库
- `luxon` (3.4.4): 强大的日期时间处理库
- `uuid` (9.0.1): 唯一标识符生成
- `react-error-boundary` (4.0.13): React 错误边界处理
- `@floating-ui/react` (0.27.5): 智能浮动UI定位
- `@tanstack/react-virtual` (3.13.5): 虚拟化长列表组件
- `radix-ui` (1.4.1): 无障碍UI组件库
- `prettier` (2.8.0): 代码格式化工具

#### CodeMirror 编辑器依赖
- `@codemirror/lang-javascript` (6.2.3): JavaScript 语法支持
- `@codemirror/lang-markdown` (6.3.2): Markdown 语法支持
- `@codemirror/lang-yaml` (6.1.2): YAML 语法支持
- `@codemirror/view` (6.23.0): 编辑器视图组件
- `@codemirror/autocomplete` (6.18.3): 自动补全功能
- `@codemirror/basic-setup` (0.20.0): 基础编辑器设置
- `@codemirror/commands` (6.7.1): 编辑器命令
- `@codemirror/history` (0.19.2): 撤销重做历史

#### 拖拽功能依赖
- `@atlaskit/pragmatic-drag-and-drop` (1.3.0): 拖拽核心库
- `@atlaskit/pragmatic-drag-and-drop-react-drop-indicator` (1.1.1): React 拖拽指示器

#### 开发工具依赖
- `esbuild` (0.17.3): 快速构建工具
- `typescript` (4.7.4): TypeScript 编译器
- `tslib` (2.4.0): TypeScript 运行时库
- `@typescript-eslint/eslint-plugin` (5.29.0): ESLint TypeScript 插件
- `@typescript-eslint/parser` (5.29.0): ESLint TypeScript 解析器
- `builtin-modules` (3.3.0): Node.js 内置模块列表

#### TypeScript 类型定义
- `@types/node` (20.14.14): Node.js 类型定义
- `@types/react` (18.2.47): React 类型定义
- `@types/react-dom` (18.2.18): React DOM 类型定义
- `@types/luxon` (3.4.1): Luxon 类型定义
- `@types/uuid` (9.0.7): UUID 类型定义
- `@types/obsidian-typings` (2.3.4): Obsidian 类型定义

## 🔄 扩展和维护

### 添加新的动作类型

1. 在 `src/service/action/` 目录下创建新的服务目录
2. 实现 `IActionService` 接口
3. 在 `FormActionType` 枚举中添加新类型
4. 更新国际化文件（zh.ts 和 en.ts）
5. 添加相应的设置组件
6. 更新动作选择器组件

### 添加新的字段类型

1. 在 `FormFieldType` 枚举中添加新类型
2. 创建对应的控件组件
3. 更新表单渲染逻辑
4. 添加验证规则
5. 更新国际化文件

### 国际化支持

- **中文**: `src/i18n/zh.ts`
- **英文**: `src/i18n/en.ts`
- **接口定义**: `src/i18n/local.ts`
- 添加新语言需要实现 `Local` 接口

### AI功能扩展

1. 添加新的AI提供商支持
2. 扩展提示词模板功能
3. 增加AI模型参数配置
4. 优化AI调用性能

## 🧪 测试策略

### 测试覆盖范围

- **单元测试**: 核心业务逻辑和工具函数
- **集成测试**: 服务间交互和API调用
- **用户界面测试**: 组件功能验证
- **端到端测试**: 完整工作流验证

### 测试工具

- **Jest**: 单元测试框架
- **React Testing Library**: 组件测试
- **Obsidian 测试环境**: 插件集成测试

## 📝 使用指南

### 创建表单

1. 打开 Obsidian 命令面板（Ctrl/Cmd + P）
2. 搜索 "Create Form" 命令
3. 使用表单编辑器设计表单
4. 添加字段并配置属性
5. 设置动作和执行条件
6. 保存并测试表单

### 配置AI功能

1. 进入插件设置页面
2. 添加AI模型配置
3. 设置API密钥和参数
4. 验证模型可用性
5. 在表单中使用AI调用动作

### 执行工作流

1. 打开已创建的表单
2. 填写表单字段
3. 点击提交按钮或使用快捷键
4. 系统自动执行配置的动作
5. 查看执行结果和通知

## 🆕 核心功能特性

### 📝 文本处理增强
- **复制为Markdown格式**: 保留富文本格式的智能复制功能，支持链接、格式等
- **复制为纯文本格式**: 自动移除frontmatter属性信息，生成纯净的文本内容
- **中英文加空格**: 自动在中文和英文字符之间添加空格，提升文档可读性
- **内容清理**: 移除多余的格式字符和空行，优化文档结构

### 🤖 AI集成功能
- **多AI提供商支持**: 兼容不同的AI服务商API（OpenAI、Claude等）
- **提示词模板系统**: 可重用的提示词模板，支持变量替换
- **AI模型管理**: 统一管理多个AI模型配置和API密钥
- **高级参数配置**: 精细控制温度、top_p、top_k、频率惩罚等生成参数
- **模型验证功能**: 自动验证AI模型的可用性和连接状态

### 🎯 用户体验改进
- **右键提交功能**: 快速将选中内容或整个文件添加到表单字段
- **虚拟化长列表**: 优化大数据量列表的渲染性能
- **拖拽排序**: 直观的表单字段和动作重排功能
- **实时预览**: 表单编辑时的实时预览模式
- **多语言支持**: 完整的中英文界面切换
- **快捷键支持**: 表单注册为命令，支持自定义快捷键

### 🔧 开发者功能
- **自定义脚本**: 支持JavaScript脚本扩展功能
- **模板系统**: 灵活的文件和内容模板机制
- **条件逻辑**: 字段显示条件和动作执行条件
- **变量系统**: 丰富的内置变量和表单变量支持
- **错误处理**: 完善的错误边界和异常处理机制

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 项目仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交代码更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request
6. 等待代码审查

### 代码规范

- 遵循 TypeScript 最佳实践
- 使用 ESLint 和 Prettier 格式化代码
- 添加适当的注释和文档
- 编写单元测试

## 📄 许可证

本项目采用 MIT 许可证。详情请参阅 LICENSE 文件。

---

## 📊 项目状态

- **开发状态**: 活跃开发中
- **稳定性**: Beta 版本，核心功能稳定
- **兼容性**: 支持 Obsidian 最新版本
- **维护状态**: 持续维护和功能更新

## 🔗 相关链接

- **项目仓库**: [GitHub Repository](https://github.com/your-repo/obsidian-form-flow)
- **问题反馈**: [Issues](https://github.com/your-repo/obsidian-form-flow/issues)
- **功能请求**: [Feature Requests](https://github.com/your-repo/obsidian-form-flow/discussions)
- **文档更新**: 请查看项目 Wiki 获取最新文档

---

**注意**: 这是一个活跃开发中的项目，功能和 API 可能会发生变化。建议定期查看更新日志和文档。当前版本包含了完整的表单系统、AI集成、文本处理增强和用户体验优化等核心功能，适合日常使用和工作流自动化。