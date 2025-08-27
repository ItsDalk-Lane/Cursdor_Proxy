# Form Flow - Obsidian 表单工作流插件

## 📋 项目概览 (Project Overview)

### 项目基本信息
- **项目名称**: Form Flow
- **版本信息**: v0.1.3
- **项目类型**: Obsidian 桌面插件
- **开发语言**: TypeScript + React
- **最低支持版本**: Obsidian 1.8.0+
- **作者**: vran
- **开源协议**: MIT License

### 主要功能描述
Form Flow 是一个强大的 Obsidian 插件，旨在为用户提供简单易用的表单创建和工作流自动化功能。插件允许用户通过可视化界面创建自定义表单，并配置多种自动化动作，实现一键式工作流执行。支持文件创建、文本插入、脚本执行、AI 内容生成等多种操作类型。

### 技术栈和主要依赖
- **核心框架**: TypeScript 4.7.4, React 18.3.0
- **构建工具**: esbuild 0.17.3, ESLint
- **UI 组件**: 
  - React DOM 18.3.0
  - Radix UI 1.4.1 (UI 组件库)
  - Lucide React 0.424.0 (图标库)
  - @floating-ui/react 0.27.5 (浮动定位)
- **代码编辑器**: 
  - CodeMirror 6.x (代码编辑器核心)
  - 支持 JavaScript、Markdown、YAML 语法高亮
- **拖拽功能**: @atlaskit/pragmatic-drag-and-drop 1.3.0
- **虚拟化**: @tanstack/react-virtual 3.13.5
- **时间处理**: Luxon 3.4.4
- **工具库**: UUID 9.0.1, Prettier 2.8.0

### 项目规模
- **源码文件**: 约 150+ TypeScript/React 文件
- **代码行数**: 估计 15,000+ 行代码
- **组件数量**: 50+ React 组件
- **服务模块**: 20+ 业务服务类
- **支持的表单字段类型**: 15+ 种
- **支持的动作类型**: 14+ 种

### 开发状态
- **当前状态**: 活跃开发中
- **最新更新**: 2025年（基于依赖版本推断）
- **维护状态**: 持续维护和功能扩展

---

## 🏗️ 功能架构分析 (Feature Architecture)

### 核心功能列表

#### 1. 表单管理功能
- **表单创建**: 可视化表单设计器
- **表单编辑**: 实时预览和编辑
- **表单验证**: 字段验证和条件逻辑
- **表单存储**: JSON 格式存储表单配置

#### 2. 字段类型支持
- **基础字段**: 文本框、文本域、数字输入、密码输入
- **选择字段**: 下拉选择、单选按钮、复选框、开关
- **文件字段**: 文件选择器、文件列表
- **高级字段**: AI 模型选择器、模板选择器、属性值输入
- **特殊字段**: 文件内容字段、时间字段

#### 3. 动作执行系统
- **文件操作**: 创建文件、打开文件、更新前置元数据
- **文本处理**: 插入文本、内容清理、中英文加空格
- **脚本执行**: 自定义 JavaScript 脚本运行
- **AI 集成**: AI 模型调用和内容生成
- **系统集成**: 执行 Obsidian 命令、打开链接
- **内容转换**: 复制为富文本、图片链接转换

#### 4. 条件逻辑系统
- **字段显示控制**: 基于条件的字段显示/隐藏
- **动作条件执行**: 条件化的动作执行
- **复杂过滤器**: 支持多条件组合逻辑

#### 5. AI 功能集成
- **多模型支持**: 支持多种 AI 模型配置
- **模板系统**: 提示词模板管理
- **进度监控**: AI 调用进度显示
- **结果处理**: AI 生成内容的后处理

### 功能层级关系

#### 🏗️ 系统架构层次

```
📋 Form Flow 插件系统架构
├── 🎨 表现层 (Presentation Layer)
│   ├── 📱 用户界面组件 (UI Components)
│   │   ├── 🔧 表单编辑器 (Form Editor)
│   │   │   ├── ActionEditView - 动作编辑视图
│   │   │   ├── FieldEditView - 字段编辑视图
│   │   │   └── FormEditView - 表单主编辑器
│   │   ├── 👁️ 表单预览器 (Form Previewer)
│   │   │   ├── FormPreviewView - 表单预览主视图
│   │   │   └── FormPreviewAnimation - 预览动画效果
│   │   ├── ⚙️ 设置界面 (Settings UI)
│   │   │   ├── PluginSettingTab - 插件设置标签页
│   │   │   ├── GeneralSettingTabItem - 通用设置项
│   │   │   └── AI设置组件 - AI相关配置界面
│   │   └── 🧩 共享组件 (Shared Components)
│   │       ├── FormItem - 表单项基础组件
│   │       ├── MultiSelect - 多选组件
│   │       ├── Switch - 开关组件
│   │       ├── ActionFlow - 动作流组件
│   │       ├── FieldControl - 字段控件
│   │       └── FilterCondition - 过滤条件组件
│   └── 🎭 模态框系统 (Modal System)
│       ├── FormEditModal - 表单编辑模态框
│       ├── ConfirmModal - 确认对话框
│       └── NoticeModal - 通知提示框
│
├── 🧠 业务逻辑层 (Business Logic Layer)
│   ├── 📋 表单服务 (Form Services)
│   │   ├── FormService - 表单核心服务
│   │   ├── FormStateManager - 表单状态管理
│   │   ├── FormValues - 表单值管理
│   │   └── FormState - 表单状态定义
│   ├── ⚡ 动作服务 (Action Services)
│   │   ├── 🤖 AI动作服务
│   │   │   ├── AICallActionService - AI调用服务
│   │   │   └── AIModelService - AI模型管理
│   │   ├── 📝 文件动作服务
│   │   │   ├── CreateFileActionService - 文件创建
│   │   │   ├── CreateNoteActionService - 笔记创建
│   │   │   ├── DeleteFileActionService - 文件删除
│   │   │   ├── OpenFileActionService - 文件打开
│   │   │   ├── InsertToNoteActionService - 笔记插入
│   │   │   ├── UpdateNoteContentActionService - 笔记更新
│   │   │   └── UpdateFrontmatterActionService - 前置元数据更新
│   │   ├── 🔧 文本处理服务
│   │   │   ├── AddSpacesBetweenCjkAndLatinActionService - 中英文空格
│   │   │   └── ReplaceSelectionActionService - 选择替换
│   │   └── 🛠️ 系统动作服务
│   │       ├── RunJsActionService - JavaScript执行
│   │       └── SleepActionService - 延时服务
│   ├── 🔍 条件服务 (Condition Services)
│   │   ├── ConditionService - 条件评估核心
│   │   ├── FieldConditionService - 字段条件
│   │   ├── ValueConditionService - 值条件
│   │   └── LogicConditionService - 逻辑条件
│   ├── 🎯 过滤服务 (Filter Services)
│   │   ├── FilterService - 过滤核心服务
│   │   ├── FieldFilterService - 字段过滤
│   │   ├── ValueFilterService - 值过滤
│   │   └── RegexFilterService - 正则过滤
│   ├── ✅ 验证服务 (Validation Services)
│   │   ├── ValidatorService - 验证核心
│   │   ├── FieldValidationService - 字段验证
│   │   ├── RequiredValidatorService - 必填验证
│   │   ├── LengthValidatorService - 长度验证
│   │   ├── PatternValidatorService - 模式验证
│   │   └── CustomValidatorService - 自定义验证
│   └── 🔧 扩展服务 (Extension Services)
│       ├── ScriptExtendService - 脚本扩展
│       ├── TemplateExtendService - 模板扩展
│       └── PluginExtendService - 插件扩展
│
├── 🗃️ 数据层 (Data Layer)
│   ├── 📊 模型定义 (Model Definitions)
│   │   ├── 📋 表单模型 (Form Models)
│   │   │   ├── FormConfig - 表单配置模型
│   │   │   ├── FormField - 字段模型基类
│   │   │   └── 字段类型模型
│   │   │       ├── TextField - 文本字段
│   │   │       ├── NumberField - 数字字段
│   │   │       ├── BooleanField - 布尔字段
│   │   │       ├── SelectField - 选择字段
│   │   │       ├── MultiSelectField - 多选字段
│   │   │       ├── DateField - 日期字段
│   │   │       ├── DateTimeField - 日期时间字段
│   │   │       ├── TimeField - 时间字段
│   │   │       └── TextAreaField - 文本区域字段
│   │   ├── ⚡ 动作模型 (Action Models)
│   │   │   ├── FormAction - 动作基类
│   │   │   ├── AICallFormAction - AI调用动作
│   │   │   ├── CreateFileFormAction - 文件创建动作
│   │   │   ├── CreateNoteFormAction - 笔记创建动作
│   │   │   └── [其他动作模型...]
│   │   ├── 🔍 过滤模型 (Filter Models)
│   │   │   ├── FormFilter - 过滤器基类
│   │   │   ├── FieldFilter - 字段过滤器
│   │   │   ├── ValueFilter - 值过滤器
│   │   │   └── RegexFilter - 正则过滤器
│   │   └── 🎯 枚举定义 (Enums)
│   │       ├── FieldType - 字段类型枚举
│   │       ├── ActionType - 动作类型枚举
│   │       ├── ConditionType - 条件类型枚举
│   │       └── ValidationType - 验证类型枚举
│   ├── 🏪 状态管理 (State Management)
│   │   ├── FormStateManager - 表单状态管理器
│   │   ├── SelectionManager - 选择管理器
│   │   └── PerformanceMonitor - 性能监控器
│   └── 💾 数据持久化 (Data Persistence)
│       ├── PluginSettings - 插件设置存储
│       ├── FormConfigStorage - 表单配置存储
│       └── CacheManager - 缓存管理
│
├── 🔧 基础设施层 (Infrastructure Layer)
│   ├── 🌐 API集成 (API Integration)
│   │   ├── ObsidianAPI - Obsidian API封装
│   │   ├── FileSystemAPI - 文件系统API
│   │   └── AIServiceAPI - AI服务API
│   ├── 🛠️ 工具库 (Utilities)
│   │   ├── 🐛 调试工具 (Debug Tools)
│   │   │   ├── DebugManager - 调试管理器
│   │   │   ├── DebugConfig - 调试配置
│   │   │   ├── LoggerUtils - 日志工具
│   │   │   └── PerformanceValidator - 性能验证
│   │   ├── 📁 文件操作 (File Operations)
│   │   │   ├── FileOperations - 文件操作工具
│   │   │   └── Files - 文件处理工具
│   │   ├── 🔤 字符串处理 (String Processing)
│   │   │   ├── Strings - 字符串工具
│   │   │   └── TemplateProcessor - 模板处理器
│   │   ├── 🎯 对象处理 (Object Processing)
│   │   │   ├── Objects - 对象工具
│   │   │   └── PropertyType - 属性类型工具
│   │   ├── ✅ 验证工具 (Validation Utils)
│   │   │   └── FieldValidationUtils - 字段验证工具
│   │   ├── 🔐 安全工具 (Security Utils)
│   │   │   └── Encryption - 加密工具
│   │   └── ⚠️ 错误处理 (Error Handling)
│   │       └── ErrorHandler - 错误处理器
│   ├── 🎨 样式系统 (Style System)
│   │   └── base.css - 基础样式定义
│   ├── 🌍 国际化 (Internationalization)
│   │   ├── en.ts - 英文语言包
│   │   ├── zh.ts - 中文语言包
│   │   ├── zhTw.ts - 繁体中文语言包
│   │   ├── ja.ts - 日文语言包
│   │   ├── ko.ts - 韩文语言包
│   │   ├── fr.ts - 法文语言包
│   │   ├── de.ts - 德文语言包
│   │   ├── es.ts - 西班牙文语言包
│   │   ├── pt.ts - 葡萄牙文语言包
│   │   ├── ru.ts - 俄文语言包
│   │   ├── ar.ts - 阿拉伯文语言包
│   │   └── hi.ts - 印地文语言包
│   └── 🔗 上下文系统 (Context System)
│       ├── FormContext - 表单上下文
│       ├── PluginContext - 插件上下文
│       └── AppContext - 应用上下文
│
└── 🎣 钩子系统 (Hooks System)
    ├── 📋 表单钩子 (Form Hooks)
    │   ├── useForm - 表单状态钩子
    │   ├── useFormField - 字段钩子
    │   ├── useFormValidation - 验证钩子
    │   ├── useFormSubmit - 提交钩子
    │   └── useSubmitForm - 表单提交钩子
    ├── 🎨 UI钩子 (UI Hooks)
    │   ├── useActionTitle - 动作标题钩子
    │   ├── useFieldTitle - 字段标题钩子
    │   ├── useModal - 模态框钩子
    │   ├── useNotice - 通知钩子
    │   └── useConfirm - 确认钩子
    ├── 🔧 工具钩子 (Utility Hooks)
    │   ├── useDebounce - 防抖钩子
    │   ├── useThrottle - 节流钩子
    │   └── useLocalStorage - 本地存储钩子
    └── 🌐 API钩子 (API Hooks)
        ├── useObsidianAPI - Obsidian API钩子
        ├── useFileSystem - 文件系统钩子
        └── useAIService - AI服务钩子
```

#### 🔄 模块间依赖关系

```
依赖流向图 (从上到下，箭头表示依赖方向)

🎨 表现层 (UI Components)
    ↓ 依赖
🧠 业务逻辑层 (Services)
    ↓ 依赖  
🗃️ 数据层 (Models & State)
    ↓ 依赖
🔧 基础设施层 (Utils & APIs)

横向协作关系:
📋 表单服务 ←→ ⚡ 动作服务 ←→ 🔍 条件服务 ←→ 🎯 过滤服务 ←→ ✅ 验证服务
```

#### 🎯 核心功能模块

| 模块类别 | 核心组件 | 主要职责 | 依赖关系 |
|---------|---------|---------|----------|
| **表单管理** | FormService, FormStateManager | 表单生命周期管理、状态同步 | 依赖数据模型、工具库 |
| **动作执行** | ActionService系列 | 动作链执行、异步控制、错误处理 | 依赖Obsidian API、AI服务 |
| **条件逻辑** | ConditionService系列 | 条件评估、逻辑判断、动态控制 | 依赖表单状态、字段值 |
| **数据验证** | ValidatorService系列 | 字段验证、数据完整性检查 | 依赖验证规则、字段模型 |
| **UI渲染** | View组件系列 | 用户界面渲染、交互处理 | 依赖业务服务、状态管理 |
| **状态管理** | StateManager系列 | 应用状态、表单状态、选择状态 | 依赖数据模型、持久化 |
| **工具支持** | Utils系列 | 通用工具、调试支持、性能监控 | 基础设施，被其他模块依赖 |

### 用户交互流程

1. **表单创建流程**:
   ```
   用户触发 → 打开表单编辑器 → 添加字段 → 配置动作 → 保存表单
   ```

2. **表单使用流程**:
   ```
   用户打开表单 → 填写字段 → 触发验证 → 执行动作链 → 显示结果
   ```

3. **条件逻辑流程**:
   ```
   字段值变化 → 条件评估 → 更新字段可见性 → 重新渲染界面
   ```

### 数据流向

```mermaid
graph TD
    A[用户输入] --> B[表单状态管理]
    B --> C[条件逻辑评估]
    C --> D[字段可见性控制]
    B --> E[表单验证]
    E --> F[动作链执行]
    F --> G[结果反馈]
    
    H[表单配置] --> I[字段渲染]
    I --> J[用户界面]
    
    K[AI服务] --> L[内容生成]
    L --> F
    
    M[文件系统] --> N[文件操作]
    N --> F
```

---

## 📁 文件结构详解 (File Structure Analysis)

### 完整目录结构

```
📁 obsidian-form-flow-master/
├── 📄 manifest.json                    # [核心] Obsidian 插件清单文件
├── 📄 LICENSE                          # [文档] MIT 开源协议
├── 📄 test-new-features.md             # [文档] 新功能测试说明
├── 📁 .qoder/                          # [配置] 代码优化和规则配置
│   ├── 📁 quests/
│   │   └── 📄 obsidian-plugin-optimization.md  # 插件优化设计文档
│   └── 📁 rules/
│       └── 📄 Obsidian.md              # Obsidian 开发规则
└── 📁 plugin/                          # [核心] 插件主目录
    ├── 📄 package.json                 # [核心] Node.js 项目配置和依赖
    ├── 📄 manifest.json                # [核心] 插件元数据配置
    ├── 📄 tsconfig.json                # [配置] TypeScript 编译配置
    ├── 📄 esbuild.config.mjs           # [构建] ESBuild 构建配置
    ├── 📄 .eslintrc.js                 # [配置] ESLint 代码规范配置
    ├── 📄 complete-form-config.json    # [示例] 完整表单配置示例
    ├── 📄 dev-config.json              # [配置] 开发环境配置
    ├── 📄 gemini-test-config.json      # [配置] Gemini AI 测试配置
    └── 📁 src/                         # [核心] 源代码目录
        ├── 📄 main.ts                  # [入口] 插件主入口文件
        ├── 📁 api/                     # [接口] 对外 API 接口
        │   └── 📄 FormFlowApi.ts       # 插件对外API接口
        ├── 📁 component/               # [UI] React 组件库
        │   ├── 📁 ai/                  # AI相关组件
        │   │   ├── 📄 AIModelList.tsx  # AI模型列表组件
        │   │   └── 📄 TemplateFileSelect.tsx # 模板文件选择组件
        │   ├── 📁 callout-block/       # 标注块组件
        │   │   ├── 📄 CalloutBlock.css # 标注块样式
        │   │   └── 📄 CalloutBlock.tsx # 标注块组件
        │   ├── 📁 combobox/            # 组合框组件集合
        │   │   ├── 📄 CFormFileSuggestInput.tsx # 表单文件建议输入
        │   │   ├── 📄 ComboboxSuggestion.css # 组合框建议样式
        │   │   ├── 📄 ComboboxSuggestion.tsx # 组合框建议组件
        │   │   ├── 📄 FolderSuggest.ts # 文件夹建议逻辑
        │   │   ├── 📄 FolderSuggestInput.tsx # 文件夹建议输入
        │   │   ├── 📄 MarkdownFileSuggestInput.tsx # Markdown文件建议输入
        │   │   ├── 📄 MultipleComboboxSuggestion.css # 多选组合框样式
        │   │   ├── 📄 MultipleComboboxSuggestion.tsx # 多选组合框组件
        │   │   ├── 📄 PropertyNameSuggestInput.tsx # 属性名建议输入
        │   │   └── 📄 PropertyValueSuggestInput.tsx # 属性值建议输入
        │   ├── 📁 command-suggest/     # 命令建议组件
        │   │   └── 📄 CommandSuggestInput.tsx # 命令建议输入组件
        │   ├── 📁 confirm/             # 确认对话框组件
        │   │   ├── 📄 ConfirmPopover.css # 确认弹出框样式
        │   │   └── 📄 ConfirmPopover.tsx # 确认弹出框组件
        │   ├── 📁 dialog/              # 对话框组件
        │   │   ├── 📄 Dialog2.css      # 对话框样式
        │   │   ├── 📄 Dialog2.tsx      # 对话框组件
        │   │   └── 📁 action/          # 对话框动作组件
        │   │       └── 📄 OpenFileActionSetting.tsx # 打开文件动作设置
        │   ├── 📁 divider/             # 分割线组件
        │   │   ├── 📄 Divider.css      # 分割线样式
        │   │   └── 📄 Divider.tsx      # 分割线组件
        │   ├── 📁 drag-handler/        # 拖拽处理组件
        │   │   ├── 📄 DragHandler.css  # 拖拽处理样式
        │   │   └── 📄 DragHandler.tsx  # 拖拽处理组件
        │   ├── 📁 dropdown/            # 下拉菜单组件
        │   │   ├── 📄 index.css        # 下拉菜单样式
        │   │   └── 📄 index.tsx        # 下拉菜单组件
        │   ├── 📁 extension-editor/    # 扩展编辑器组件
        │   │   ├── 📄 ExtensionEditor.css # 扩展编辑器样式
        │   │   ├── 📄 ExtensionEditor.tsx # 扩展编辑器主组件
        │   │   ├── 📄 ExtensionFcuntionBody.tsx # 扩展函数体组件
        │   │   ├── 📄 ExtensionFcuntionHeader.tsx # 扩展函数头组件
        │   │   ├── 📄 ExtensionFcuntionInput.tsx # 扩展函数输入组件
        │   │   ├── 📄 ExtensionFcuntionItem.tsx # 扩展函数项组件
        │   │   ├── 📄 ExtensionFunctionDetail.tsx # 扩展函数详情组件
        │   │   └── 📄 ExtensionTagSelector.css # 扩展标签选择器样式
        │   ├── 📁 filter/              # 过滤器组件
        │   │   ├── 📄 FilterItem.css   # 过滤项样式
        │   │   ├── 📄 FilterItem.tsx   # 过滤项组件
        │   │   ├── 📄 FilterRoot.css   # 过滤根组件样式
        │   │   ├── 📄 FilterRoot.tsx   # 过滤根组件
        │   │   ├── 📁 hooks/           # 过滤器钩子
        │   │   │   └── 📄 FilterContentComponentContext.tsx # 过滤内容组件上下文
        │   │   └── 📁 menu/            # 过滤菜单组件
        │   │       ├── 📄 FilterAddDropdown.tsx # 过滤添加下拉菜单
        │   │       ├── 📄 FilterDropdown.css # 过滤下拉菜单样式
        │   │       ├── 📄 FilterDropdown.tsx # 过滤下拉菜单组件
        │   │       ├── 📄 FilterMenuDropdown.tsx # 过滤菜单下拉组件
        │   │       └── 📄 FilterRelationDropdown.tsx # 过滤关系下拉组件
        │   ├── 📁 interactive-list/    # 交互式列表组件
        │   │   ├── 📄 InteractiveList.css # 交互式列表样式
        │   │   └── 📄 InteractiveList.tsx # 交互式列表组件
        │   ├── 📁 list-box/            # 列表框组件
        │   │   ├── 📄 ListBox.css      # 列表框样式
        │   │   └── 📄 ListBox.tsx      # 列表框组件
        │   ├── 📁 modal/               # 模态框组件集合
        │   │   ├── 📄 AIModelConfigModal.tsx # AI模型配置模态框
        │   │   ├── 📄 CFormSuggestModal.css # 表单建议模态框样式
        │   │   ├── 📄 CFormSuggestModal.tsx # 表单建议模态框组件
        │   │   ├── 📄 CommonSuggestModal.tsx # 通用建议模态框
        │   │   ├── 📄 CreateFileForm.css # 创建文件表单样式
        │   │   ├── 📄 CreateFileForm.tsx # 创建文件表单组件
        │   │   ├── 📄 CreateFileModal.tsx # 创建文件模态框
        │   │   ├── 📄 FileModalWIndow.tsx # 文件模态窗口
        │   │   ├── 📄 FileModalWindow.css # 文件模态窗口样式
        │   │   ├── 📄 FormViewModal.css # 表单视图模态框样式
        │   │   └── 📄 FormViewModal2.tsx # 表单视图模态框组件
        │   ├── 📁 password/            # 密码输入组件
        │   │   ├── 📄 PasswordInput.css # 密码输入样式
        │   │   └── 📄 PasswordInput.tsx # 密码输入组件
        │   ├── 📁 popover/             # 弹出框组件
        │   │   ├── 📄 Popover.css      # 弹出框样式
        │   │   └── 📄 Popover.tsx      # 弹出框组件
        │   ├── 📁 popup/               # 弹窗组件
        │   │   ├── 📄 PopupEl.css      # 弹窗元素样式
        │   │   ├── 📄 PopupEl.tsx      # 弹窗元素组件
        │   │   ├── 📄 SelectionPopup.css # 选择弹窗样式
        │   │   └── 📄 SelectionPopup.tsx # 选择弹窗组件
        │   ├── 📁 radio/               # 单选按钮组件
        │   │   ├── 📄 RadioSelect.css  # 单选按钮样式
        │   │   └── 📄 RadioSelect.tsx  # 单选按钮组件
        │   ├── 📁 select2/             # 选择器组件
        │   │   ├── 📄 Select.css       # 选择器样式
        │   │   └── 📄 Select.tsx       # 选择器组件
        │   ├── 📁 tab/                 # 标签页组件
        │   │   ├── 📄 Tab.css          # 标签页样式
        │   │   └── 📄 Tab.tsx          # 标签页组件
        │   ├── 📁 timer/               # 计时器组件
        │   │   ├── 📄 AIProgressTimer.css # AI进度计时器样式
        │   │   └── 📄 AIProgressTimer.tsx # AI进度计时器组件
        │   ├── 📁 toast/               # 提示消息组件
        │   │   ├── 📄 PromiseToast.tsx # Promise提示组件
        │   │   ├── 📄 Toast.css        # 提示消息样式
        │   │   ├── 📄 Toast.tsx        # 提示消息组件
        │   │   ├── 📄 ToastManager.tsx # 提示消息管理器
        │   │   └── 📄 ToastView.tsx    # 提示消息视图
        │   └── 📁 toggle/              # 开关组件
        │       ├── 📄 Toggle.css       # 开关样式
        │       └── 📄 Toggle.tsx       # 开关组件
        ├── 📁 context/                 # [状态] React Context 上下文
        │   ├── 📄 obsidianAppContext.tsx # Obsidian应用上下文
        │   └── 📄 pluginSettingsContext.tsx # 插件设置上下文
        ├── 📁 core/                    # [核心] 核心架构组件
        │   ├── 📄 ErrorHandler.ts     # 错误处理器
        │   ├── 📄 EventBus.ts          # 事件总线系统
        │   ├── 📄 PerformanceMonitor.ts # 性能监控器
        │   └── 📄 ServiceContainer.ts  # 服务容器和依赖注入
        ├── 📁 hooks/                   # [工具] React Hooks 工具
         │   ├── 📄 useActionTitle.tsx   # 动作标题Hook
         │   ├── 📄 useActionTypeStyle.tsx # 动作类型样式Hook
         │   ├── 📄 useActionValidation.ts # 动作验证Hook
         │   ├── 📄 useAnotherKeyToSubmitForm.tsx # 快捷键提交表单Hook
         │   ├── 📄 useAutoFocus.tsx     # 自动聚焦Hook
         │   ├── 📄 useCommonStates.ts   # 通用状态Hook
         │   ├── 📄 useForm.tsx          # 表单Hook
         │   ├── 📄 useFormConfig.tsx    # 表单配置Hook
         │   ├── 📄 useInputComposition.tsx # 输入法组合Hook
         │   ├── 📄 usePathVariables.tsx # 路径变量Hook
         │   ├── 📄 useSortable.tsx      # 可排序Hook
         │   ├── 📄 useSortableItem.tsx  # 可排序项Hook
         │   ├── 📄 useSubmitForm.tsx    # 提交表单Hook
         │   └── 📄 useVariables.tsx     # 变量Hook
         ├── 📁 i18n/                    # [国际化] 多语言支持
         │   ├── 📄 en.ts                # 英文语言包
         │   ├── 📄 local.ts             # 本地化配置
         │   ├── 📄 locals.ts            # 本地化工具
         │   ├── 📄 week.ts              # 星期本地化
         │   ├── 📄 zh.ts                # 中文语言包
         │   ├── 📄 zh.ts.backup         # 中文语言包备份
         │   ├── 📄 zh.ts.new            # 中文语言包新版本
         │   └── 📄 zhTw.ts              # 繁体中文语言包
        ├── 📁 model/                   # [数据] 数据模型和类型定义
         │   ├── 📄 FormConfig.ts        # 表单配置主模型
         │   ├── 📁 action/              # 动作类型定义
         │   │   ├── 📄 AICallFormAction.ts # AI调用动作
         │   │   ├── 📄 AddSpacesBetweenCjkAndLatinFormAction.ts # 中英文加空格动作
         │   │   ├── 📄 ContentCleanupFormAction.ts # 内容清理动作
         │   │   ├── 📄 ConvertImageLinksFormAction.ts # 图片链接转换动作
         │   │   ├── 📄 CopyAsRichTextFormAction.ts # 复制为富文本动作
         │   │   ├── 📄 CreateFileFormAction.ts # 创建文件动作
         │   │   ├── 📄 ExecuteCommandFormAction.ts # 执行命令动作
         │   │   ├── 📄 FileBaseFormAction.ts # 文件基础动作
         │   │   ├── 📄 IFormAction.ts   # 动作接口定义
         │   │   ├── 📄 InsertTextFormAction.ts # 插入文本动作
         │   │   ├── 📄 OpenFileFormAction.ts # 打开文件动作
         │   │   ├── 📄 OpenFormAction.ts # 打开表单动作
         │   │   ├── 📄 OpenLinkFormAction.ts # 打开链接动作
         │   │   ├── 📄 RunScriptFormAction.ts # 运行脚本动作
         │   │   ├── 📄 SuggestModalFormAction.ts # 建议模态框动作
         │   │   └── 📄 UpdateFrontmatterFormAction.ts # 更新前置元数据动作
         │   ├── 📁 ai/                  # AI相关模型
         │   │   ├── 📄 AIModelConfig.ts # AI模型配置
         │   │   └── 📄 AISettings.ts    # AI设置模型
         │   ├── 📁 enums/               # 枚举类型定义
         │   │   ├── 📄 FormActionType.ts # 表单动作类型枚举
         │   │   ├── 📄 FormFieldType.ts # 表单字段类型枚举
         │   │   ├── 📄 OpenPageInType.ts # 打开页面类型枚举
         │   │   ├── 📄 TargetFileType.ts # 目标文件类型枚举
         │   │   └── 📄 TextInsertPosition.ts # 文本插入位置枚举
         │   ├── 📁 field/               # 字段类型定义
         │   │   ├── 📄 AIModelListField.ts # AI模型列表字段
         │   │   ├── 📄 ICheckboxField.ts # 复选框字段
         │   │   ├── 📄 IFileContentField.ts # 文件内容字段
         │   │   ├── 📄 IFileListField.ts # 文件列表字段
         │   │   ├── 📄 IFormField.ts    # 字段接口定义
         │   │   ├── 📄 INumberField.ts  # 数字字段
         │   │   ├── 📄 IPasswordField.ts # 密码字段
         │   │   ├── 📄 IPropertyValueField.ts # 属性值字段
         │   │   ├── 📄 IRadioField.ts   # 单选字段
         │   │   ├── 📄 ISelectField.ts  # 选择字段
         │   │   ├── 📄 ITextAreaField.ts # 文本区域字段
         │   │   ├── 📄 ITextField.ts    # 文本字段
         │   │   ├── 📄 IToggleField.ts  # 开关字段
         │   │   ├── 📄 TemplateListField.ts # 模板列表字段
         │   │   └── 📁 time/            # 时间相关字段
         │   │       ├── 📄 BaseTimeField.ts # 时间字段基类
         │   │       ├── 📄 IDateField.ts # 日期字段
         │   │       ├── 📄 IDateTimeField.ts # 日期时间字段
         │   │       └── 📄 ITimeField.ts # 时间字段
         │   └── 📁 filter/              # 过滤器模型
         │       ├── 📄 Filter.ts        # 过滤器模型
         │       └── 📄 OperatorType.ts  # 操作符类型
        ├── 📁 service/                 # [业务] 业务逻辑服务层
         │   ├── 📄 BaseService.ts       # 基础服务类
         │   ├── 📄 FormService.ts       # 表单核心服务
         │   ├── 📄 FormState.ts         # 表单状态定义
         │   ├── 📄 FormStateManager.ts  # 表单状态管理器
         │   ├── 📄 FormValues.ts        # 表单值处理
         │   ├── 📁 action/              # 动作执行服务
         │   │   ├── 📄 AICallActionService.ts # AI调用动作服务
         │   │   ├── 📄 IActionService.ts # 动作服务接口
         │   │   ├── 📁 add-spaces-between-cjk-and-latin/ # 中英文加空格动作
         │   │   │   └── 📄 AddSpacesBetweenCjkAndLatinActionService.ts
         │   │   ├── 📁 content-cleanup/  # 内容清理动作
         │   │   │   └── 📄 ContentCleanupActionService.ts
         │   │   ├── 📁 convert-image-links/ # 图片链接转换动作
         │   │   │   └── 📄 ConvertImageLinksActionService.ts
         │   │   ├── 📁 copy-as-rich-text/ # 复制为富文本动作
         │   │   │   └── 📄 CopyAsRichTextActionService.ts
         │   │   ├── 📁 create-file/      # 创建文件动作
         │   │   │   └── 📄 CreateFileActionService.ts
         │   │   ├── 📁 execute-command/  # 执行命令动作
         │   │   │   └── 📄 ExecuteCommandActionService.ts
         │   │   ├── 📁 generate-form/    # 生成表单动作
         │   │   │   ├── 📄 FormModal.tsx # 表单模态框
         │   │   │   └── 📄 GenerateFormActionService.ts
         │   │   ├── 📁 insert-text/      # 插入文本动作
         │   │   │   ├── 📄 ContentInsertionService.ts # 内容插入服务
         │   │   │   └── 📄 InsertTextActionService.ts
         │   │   ├── 📁 open-file/        # 打开文件动作
         │   │   │   └── 📄 OpenFileActionService.ts
         │   │   ├── 📁 open-link/        # 打开链接动作
         │   │   │   └── 📄 OpenLinkActionService.ts
         │   │   ├── 📁 run-script/       # 运行脚本动作
         │   │   │   └── 📄 RunScriptActionService.ts
         │   │   ├── 📁 suggest-modal/    # 建议模态框动作
         │   │   │   └── 📄 SuggestModalActionService.ts
         │   │   ├── 📁 update-frontmatter/ # 更新前置元数据动作
         │   │   │   └── 📄 UpdateFrontmatterActionService.ts
         │   │   └── 📁 util/             # 动作工具函数
         │   │       ├── 📄 createFileFromActionIfNotExists.ts
         │   │       ├── 📄 getFilePathFromAction.ts
         │   │       ├── 📄 hasConditions.ts
         │   │       └── 📄 validateFileName.ts
         │   ├── 📁 ai/                  # AI集成服务
         │   │   ├── 📄 AIApiClient.ts    # AI API客户端
         │   │   ├── 📄 AIModelValidationService.ts # AI模型验证服务
         │   │   ├── 📄 AISettingsService.ts # AI设置服务
         │   │   ├── 📄 AITimerManager.tsx # AI计时器管理器
         │   │   └── 📄 PromptTemplateService.ts # 提示词模板服务
         │   ├── 📁 command/             # 命令服务
         │   │   ├── 📄 ApplicationCommandService.ts # 应用命令服务
         │   │   └── 📄 FormIntegrationService.ts # 表单集成服务
         │   ├── 📁 condition/           # 条件逻辑服务
         │   │   └── 📄 FormVisibilies.ts # 表单可见性控制
         │   ├── 📁 context-menu/        # 上下文菜单服务
         │   │   └── 📄 ContextMenuService.ts # 上下文菜单服务
         │   ├── 📁 engine/              # 模板引擎服务
         │   │   ├── 📄 FormTemplateProcessEngine.ts # 表单模板处理引擎
         │   │   └── 📄 TemplateParser.ts # 模板解析器
         │   ├── 📁 extend/              # 扩展服务
         │   │   ├── 📄 FormScript.ts     # 表单脚本定义
         │   │   ├── 📄 FormScriptComipler.ts # 表单脚本编译器
         │   │   ├── 📄 FormScriptLoader.ts # 表单脚本加载器
         │   │   ├── 📄 FormScriptRunner.ts # 表单脚本运行器
         │   │   └── 📄 FormScriptService.ts # 表单脚本服务
         │   ├── 📁 file-view/           # 文件视图服务
         │   │   ├── 📄 ApplicationFileViewService.ts # 应用文件视图服务
         │   │   ├── 📄 CFormEmbedView.tsx # 表单嵌入视图
         │   │   └── 📄 CFormTextFileView.tsx # 表单文本文件视图
         │   ├── 📁 filter/              # 过滤器服务
         │   │   ├── 📄 FilterService.ts  # 过滤器服务
         │   │   └── 📁 handler/          # 操作符处理器
         │   │       ├── 📄 OperatorHandler.ts # 操作符处理器基类
         │   │       ├── 📄 OperatorHandlers.ts # 操作符处理器集合
         │   │       ├── 📁 common/       # 通用操作符处理器
         │   │       ├── 📁 list/         # 列表操作符处理器
         │   │       └── 📁 number/       # 数字操作符处理器
         │   ├── 📁 template/            # 模板服务（空目录）
         │   └── 📁 validator/           # 验证服务
         │       └── 📄 FormValidator.ts # 表单验证器
        ├── 📁 settings/                # [配置] 插件设置管理
         │   ├── 📄 GeneralSettingTabItem.css # 通用设置标签页样式
         │   ├── 📄 GeneralSettingTabItem.tsx # 通用设置标签页组件
         │   ├── 📄 PluginSettingTab.tsx # 插件设置标签页
         │   ├── 📄 PluginSettings.ts    # 插件设置定义
         │   ├── 📁 ai/                  # AI设置组件
         │   │   ├── 📄 AISettingTabItem.css # AI设置标签页样式
         │   │   └── 📄 AISettingTabItem.tsx # AI设置标签页组件
         │   └── 📁 card/                # 设置卡片组件
         │       ├── 📄 ExtraInfoCard.css # 额外信息卡片样式
         │       └── 📄 ExtraInfoCard.tsx # 额外信息卡片组件
         ├── 📁 style/                   # [样式] CSS 样式文件
         │   └── 📄 base.css             # 基础样式文件
         ├── 📁 test/                    # [测试] 测试相关文件（空目录）
         ├── 📁 utils/                   # [工具] 工具函数库
         │   ├── 📄 DebugConfig.ts       # 调试配置
         │   ├── 📄 DebugManager.ts      # 调试管理器
         │   ├── 📄 ErrorHandler.ts     # 错误处理器
         │   ├── 📄 FieldValidationUtils.ts # 字段验证工具
         │   ├── 📄 FileOperations.ts   # 文件操作工具
         │   ├── 📄 Files.ts             # 文件工具
         │   ├── 📄 LoggerUtils.ts       # 日志工具
         │   ├── 📄 Objects.ts           # 对象工具
         │   ├── 📄 PerformanceMonitor.ts # 性能监控器
         │   ├── 📄 PerformanceValidator.ts # 性能验证器
         │   ├── 📄 PropertyType.ts      # 属性类型工具
         │   ├── 📄 SelectionManager.ts  # 选择管理器
         │   ├── 📄 Strings.ts           # 字符串工具
         │   ├── 📄 TemplateProcessor.ts # 模板处理器
         │   ├── 📁 ai/                  # AI相关工具
         │   │   └── 📄 Encryption.ts    # 加密工具
         │   ├── 📄 convertFrontmatterValue.ts # 前置元数据值转换
         │   ├── 📄 createFileByText.ts  # 通过文本创建文件
         │   ├── 📄 fetchStream.ts       # 流式获取工具
         │   ├── 📄 focusLatestEditor.ts # 聚焦最新编辑器
         │   ├── 📄 generateSequenceName.ts # 生成序列名称
         │   ├── 📄 getActionSummary.ts  # 获取动作摘要
         │   ├── 📄 getActionsCompatible.ts # 获取兼容动作
         │   ├── 📄 getAllProperties.ts  # 获取所有属性
         │   ├── 📄 getEditorSelection.ts # 获取编辑器选择
         │   ├── 📄 getFieldDefaultValue.ts # 获取字段默认值
         │   ├── 📄 getFilePathCompatible.ts # 获取兼容文件路径
         │   ├── 📄 getPropertyTypeByName.ts # 根据名称获取属性类型
         │   ├── 📄 getPropertyValues.ts # 获取属性值
         │   ├── 📄 isMultiTextProperty.ts # 是否多文本属性
         │   ├── 📄 isTimeFormField.ts   # 是否时间表单字段
         │   ├── 📄 locateFile.ts        # 定位文件
         │   ├── 📄 openFile.ts          # 打开文件
         │   ├── 📄 openFilePathDirectly.ts # 直接打开文件路径
         │   ├── 📄 resolveDefaultFormIdValues.ts # 解析默认表单ID值
         │   ├── 📄 searchUtils.test.ts  # 搜索工具测试
         │   ├── 📄 searchUtils.ts       # 搜索工具
         │   ├── 📄 templates.ts         # 模板工具
         │   └── 📄 write.ts             # 写入工具
        └── 📁 view/                    # [视图] 视图组件和页面
            ├── 📁 edit/                # 编辑视图
            │   ├── 📁 action/          # 动作编辑组件
            │   │   ├── 📄 ActionEditView.tsx # 动作编辑主视图
            │   │   ├── 📄 ActionFlowEditView.tsx # 动作流编辑视图
            │   │   ├── 📄 ActionFlowEditViewModal.tsx # 动作流编辑模态框
            │   │   ├── 📄 ActionFlowEditViewModalContent.tsx # 动作流编辑模态框内容
            │   │   ├── 📄 ActionFlowEditViewModalContentItem.tsx # 动作流编辑项
            │   │   ├── 📄 ActionFlowEditViewModalContentItemAction.tsx # 动作流编辑项动作
            │   │   ├── 📄 ActionFlowEditViewModalContentItemCondition.tsx # 动作流编辑项条件
            │   │   ├── 📄 ActionFlowEditViewModalContentItemFilter.tsx # 动作流编辑项过滤器
            │   │   ├── 📄 ActionFlowEditViewModalContentItemSeparator.tsx # 动作流编辑项分隔符
            │   │   ├── 📄 ActionFlowEditViewModalContentItemTitle.tsx # 动作流编辑项标题
            │   │   ├── 📄 ActionFlowEditViewModalContentItemWrapper.tsx # 动作流编辑项包装器
            │   │   ├── 📄 ActionFlowEditViewModalContentWrapper.tsx # 动作流编辑内容包装器
            │   │   ├── 📄 ActionFlowEditViewModalWrapper.tsx # 动作流编辑模态框包装器
            │   │   ├── 📄 ActionFlowEditViewWrapper.tsx # 动作流编辑视图包装器
            │   │   ├── 📄 ActionFlowPreviewView.tsx # 动作流预览视图
            │   │   ├── 📄 ActionFlowPreviewViewItem.tsx # 动作流预览项
            │   │   ├── 📄 ActionFlowPreviewViewItemAction.tsx # 动作流预览项动作
            │   │   ├── 📄 ActionFlowPreviewViewItemCondition.tsx # 动作流预览项条件
            │   │   ├── 📄 ActionFlowPreviewViewItemFilter.tsx # 动作流预览项过滤器
            │   │   ├── 📄 ActionFlowPreviewViewItemSeparator.tsx # 动作流预览项分隔符
            │   │   ├── 📄 ActionFlowPreviewViewItemTitle.tsx # 动作流预览项标题
            │   │   ├── 📄 ActionFlowPreviewViewItemWrapper.tsx # 动作流预览项包装器
            │   │   ├── 📄 ActionFlowPreviewViewWrapper.tsx # 动作流预览包装器
            │   │   ├── 📄 ActionPreviewView.tsx # 动作预览视图
            │   │   └── 📄 ActionPreviewViewWrapper.tsx # 动作预览包装器
            │   ├── 📁 field/           # 字段编辑组件
            │   │   ├── 📄 FieldEditView.tsx # 字段编辑主视图
            │   │   ├── 📄 FieldEditViewModal.tsx # 字段编辑模态框
            │   │   ├── 📄 FieldEditViewModalContent.tsx # 字段编辑模态框内容
            │   │   ├── 📄 FieldEditViewModalContentItem.tsx # 字段编辑项
            │   │   ├── 📄 FieldEditViewModalContentItemField.tsx # 字段编辑项字段
            │   │   ├── 📄 FieldEditViewModalContentItemSeparator.tsx # 字段编辑项分隔符
            │   │   ├── 📄 FieldEditViewModalContentItemTitle.tsx # 字段编辑项标题
            │   │   ├── 📄 FieldEditViewModalContentItemWrapper.tsx # 字段编辑项包装器
            │   │   ├── 📄 FieldEditViewModalContentWrapper.tsx # 字段编辑内容包装器
            │   │   ├── 📄 FieldEditViewModalWrapper.tsx # 字段编辑模态框包装器
            │   │   ├── 📄 FieldEditViewWrapper.tsx # 字段编辑视图包装器
            │   │   ├── 📄 FieldPreviewView.tsx # 字段预览视图
            │   │   ├── 📄 FieldPreviewViewItem.tsx # 字段预览项
            │   │   ├── 📄 FieldPreviewViewItemField.tsx # 字段预览项字段
            │   │   ├── 📄 FieldPreviewViewItemSeparator.tsx # 字段预览项分隔符
            │   │   ├── 📄 FieldPreviewViewItemTitle.tsx # 字段预览项标题
            │   │   ├── 📄 FieldPreviewViewItemWrapper.tsx # 字段预览项包装器
            │   │   └── 📄 FieldPreviewViewWrapper.tsx # 字段预览包装器
            │   ├── 📁 setting/         # 设置编辑组件
            │   │   ├── 📁 action/      # 动作设置组件
            │   │   │   ├── 📁 common/  # 通用动作设置组件
            │   │   │   │   ├── 📄 FilePathFormItem.tsx # 文件路径表单项
            │   │   │   │   ├── 📄 FormActionFormItem.tsx # 表单动作表单项
            │   │   │   │   ├── 📄 FormActionFormItemWrapper.tsx # 表单动作表单项包装器
            │   │   │   │   ├── 📄 FormActionFormItemWrapperContent.tsx # 表单动作表单项包装器内容
            │   │   │   │   ├── 📄 FormActionFormItemWrapperContentItem.tsx # 表单动作表单项包装器内容项
            │   │   │   │   ├── 📄 FormActionFormItemWrapperContentItemAction.tsx # 表单动作表单项包装器内容项动作
            │   │   │   │   ├── 📄 FormActionFormItemWrapperContentItemCondition.tsx # 表单动作表单项包装器内容项条件
            │   │   │   │   ├── 📄 FormActionFormItemWrapperContentItemFilter.tsx # 表单动作表单项包装器内容项过滤器
            │   │   │   │   ├── 📄 FormActionFormItemWrapperContentItemSeparator.tsx # 表单动作表单项包装器内容项分隔符
            │   │   │   │   ├── 📄 FormActionFormItemWrapperContentItemTitle.tsx # 表单动作表单项包装器内容项标题
            │   │   │   │   ├── 📄 FormActionFormItemWrapperContentItemWrapper.tsx # 表单动作表单项包装器内容项包装器
            │   │   │   │   ├── 📄 FormActionFormItemWrapperContentWrapper.tsx # 表单动作表单项包装器内容包装器
            │   │   │   │   ├── 📄 FormActionFormItemWrapperWrapper.tsx # 表单动作表单项包装器包装器
            │   │   │   │   ├── 📄 FormActionPreviewFormItem.tsx # 表单动作预览表单项
            │   │   │   │   ├── 📄 FormActionPreviewFormItemWrapper.tsx # 表单动作预览表单项包装器
            │   │   │   │   ├── 📄 FormActionPreviewFormItemWrapperContent.tsx # 表单动作预览表单项包装器内容
            │   │   │   │   ├── 📄 FormActionPreviewFormItemWrapperContentItem.tsx # 表单动作预览表单项包装器内容项
            │   │   │   │   ├── 📄 FormActionPreviewFormItemWrapperContentItemAction.tsx # 表单动作预览表单项包装器内容项动作
            │   │   │   │   ├── 📄 FormActionPreviewFormItemWrapperContentItemCondition.tsx # 表单动作预览表单项包装器内容项条件
            │   │   │   │   ├── 📄 FormActionPreviewFormItemWrapperContentItemFilter.tsx # 表单动作预览表单项包装器内容项过滤器
            │   │   │   │   ├── 📄 FormActionPreviewFormItemWrapperContentItemSeparator.tsx # 表单动作预览表单项包装器内容项分隔符
            │   │   │   │   ├── 📄 FormActionPreviewFormItemWrapperContentItemTitle.tsx # 表单动作预览表单项包装器内容项标题
            │   │   │   │   ├── 📄 FormActionPreviewFormItemWrapperContentItemWrapper.tsx # 表单动作预览表单项包装器内容项包装器
            │   │   │   │   ├── 📄 FormActionPreviewFormItemWrapperContentWrapper.tsx # 表单动作预览表单项包装器内容包装器
            │   │   │   │   ├── 📄 FormActionPreviewFormItemWrapperWrapper.tsx # 表单动作预览表单项包装器包装器
            │   │   │   │   ├── 📄 FormFieldFormItem.tsx # 表单字段表单项
            │   │   │   │   ├── 📄 FormFieldFormItemWrapper.tsx # 表单字段表单项包装器
            │   │   │   │   ├── 📄 FormFieldFormItemWrapperContent.tsx # 表单字段表单项包装器内容
            │   │   │   │   ├── 📄 FormFieldFormItemWrapperContentItem.tsx # 表单字段表单项包装器内容项
            │   │   │   │   ├── 📄 FormFieldFormItemWrapperContentItemField.tsx # 表单字段表单项包装器内容项字段
            │   │   │   │   ├── 📄 FormFieldFormItemWrapperContentItemSeparator.tsx # 表单字段表单项包装器内容项分隔符
            │   │   │   │   ├── 📄 FormFieldFormItemWrapperContentItemTitle.tsx # 表单字段表单项包装器内容项标题
            │   │   │   │   ├── 📄 FormFieldFormItemWrapperContentItemWrapper.tsx # 表单字段表单项包装器内容项包装器
            │   │   │   │   ├── 📄 FormFieldFormItemWrapperContentWrapper.tsx # 表单字段表单项包装器内容包装器
            │   │   │   │   ├── 📄 FormFieldFormItemWrapperWrapper.tsx # 表单字段表单项包装器包装器
            │   │   │   │   ├── 📄 FormFieldPreviewFormItem.tsx # 表单字段预览表单项
            │   │   │   │   ├── 📄 FormFieldPreviewFormItemWrapper.tsx # 表单字段预览表单项包装器
            │   │   │   │   ├── 📄 FormFieldPreviewFormItemWrapperContent.tsx # 表单字段预览表单项包装器内容
            │   │   │   │   ├── 📄 FormFieldPreviewFormItemWrapperContentItem.tsx # 表单字段预览表单项包装器内容项
            │   │   │   │   ├── 📄 FormFieldPreviewFormItemWrapperContentItemField.tsx # 表单字段预览表单项包装器内容项字段
            │   │   │   │   ├── 📄 FormFieldPreviewFormItemWrapperContentItemSeparator.tsx # 表单字段预览表单项包装器内容项分隔符
            │   │   │   │   ├── 📄 FormFieldPreviewFormItemWrapperContentItemTitle.tsx # 表单字段预览表单项包装器内容项标题
            │   │   │   │   ├── 📄 FormFieldPreviewFormItemWrapperContentItemWrapper.tsx # 表单字段预览表单项包装器内容项包装器
            │   │   │   │   ├── 📄 FormFieldPreviewFormItemWrapperContentWrapper.tsx # 表单字段预览表单项包装器内容包装器
            │   │   │   │   ├── 📄 FormFieldPreviewFormItemWrapperWrapper.tsx # 表单字段预览表单项包装器包装器
            │   │   │   │   ├── 📄 TemplateFormItem.tsx # 模板表单项
            │   │   │   │   ├── 📄 TemplateFormItemWrapper.tsx # 模板表单项包装器
            │   │   │   │   ├── 📄 TemplateFormItemWrapperContent.tsx # 模板表单项包装器内容
            │   │   │   │   ├── 📄 TemplateFormItemWrapperContentItem.tsx # 模板表单项包装器内容项
            │   │   │   │   ├── 📄 TemplateFormItemWrapperContentItemTemplate.tsx # 模板表单项包装器内容项模板
            │   │   │   │   ├── 📄 TemplateFormItemWrapperContentItemSeparator.tsx # 模板表单项包装器内容项分隔符
            │   │   │   │   ├── 📄 TemplateFormItemWrapperContentItemTitle.tsx # 模板表单项包装器内容项标题
            │   │   │   │   ├── 📄 TemplateFormItemWrapperContentItemWrapper.tsx # 模板表单项包装器内容项包装器
            │   │   │   │   ├── 📄 TemplateFormItemWrapperContentWrapper.tsx # 模板表单项包装器内容包装器
            │   │   │   │   └── 📄 TemplateFormItemWrapperWrapper.tsx # 模板表单项包装器包装器
            │   │   │   ├── 📄 AICallActionFormItem.tsx # AI调用动作表单项
            │   │   │   ├── 📄 AddSpacesBetweenCjkAndLatinActionFormItem.tsx # 中英文间添加空格动作表单项
            │   │   │   ├── 📄 CreateFileActionFormItem.tsx # 创建文件动作表单项
            │   │   │   ├── 📄 CreateNoteActionFormItem.tsx # 创建笔记动作表单项
            │   │   │   ├── 📄 DeleteFileActionFormItem.tsx # 删除文件动作表单项
            │   │   │   ├── 📄 InsertToNoteActionFormItem.tsx # 插入到笔记动作表单项
            │   │   │   ├── 📄 OpenFileActionFormItem.tsx # 打开文件动作表单项
            │   │   │   ├── 📄 ReplaceSelectionActionFormItem.tsx # 替换选择动作表单项
            │   │   │   ├── 📄 RunJsActionFormItem.tsx # 运行JS动作表单项
            │   │   │   ├── 📄 SleepActionFormItem.tsx # 休眠动作表单项
            │   │   │   ├── 📄 UpdateFrontmatterActionFormItem.tsx # 更新前置元数据动作表单项
            │   │   │   └── 📄 UpdateNoteContentActionFormItem.tsx # 更新笔记内容动作表单项
            │   │   ├── 📁 field/       # 字段设置组件
            │   │   │   ├── 📄 BooleanFieldFormItem.tsx # 布尔字段表单项
            │   │   │   ├── 📄 DateFieldFormItem.tsx # 日期字段表单项
            │   │   │   ├── 📄 DateTimeFieldFormItem.tsx # 日期时间字段表单项
            │   │   │   ├── 📄 MultiSelectFieldFormItem.tsx # 多选字段表单项
            │   │   │   ├── 📄 NumberFieldFormItem.tsx # 数字字段表单项
            │   │   │   ├── 📄 SelectFieldFormItem.tsx # 选择字段表单项
            │   │   │   ├── 📄 TextAreaFieldFormItem.tsx # 文本区域字段表单项
            │   │   │   ├── 📄 TextFieldFormItem.tsx # 文本字段表单项
            │   │   │   └── 📄 TimeFieldFormItem.tsx # 时间字段表单项
            │   │   └── 📄 FormEditView.tsx # 表单编辑主视图
            │   └── 📄 FormEditView.tsx # 表单编辑视图
            ├── 📁 preview/             # 预览视图
            │   ├── 📄 FormPreviewView.tsx # 表单预览主视图
            │   └── 📁 animation/       # 动画组件
            │       ├── 📄 FormPreviewAnimation.tsx # 表单预览动画
            │       ├── 📄 FormPreviewAnimationItem.tsx # 表单预览动画项
            │       ├── 📄 FormPreviewAnimationItemAction.tsx # 表单预览动画项动作
            │       ├── 📄 FormPreviewAnimationItemCondition.tsx # 表单预览动画项条件
            │       ├── 📄 FormPreviewAnimationItemFilter.tsx # 表单预览动画项过滤器
            │       ├── 📄 FormPreviewAnimationItemSeparator.tsx # 表单预览动画项分隔符
            │       ├── 📄 FormPreviewAnimationItemTitle.tsx # 表单预览动画项标题
            │       ├── 📄 FormPreviewAnimationItemWrapper.tsx # 表单预览动画项包装器
            │       └── 📄 FormPreviewAnimationWrapper.tsx # 表单预览动画包装器
            └── 📁 shared/              # 共享组件
                ├── 📁 form-item/       # 表单项组件
                │   ├── 📄 FormItem.tsx # 表单项基础组件
                │   ├── 📄 FormItemWrapper.tsx # 表单项包装器
                │   ├── 📄 FormItemWrapperContent.tsx # 表单项包装器内容
                │   ├── 📄 FormItemWrapperContentItem.tsx # 表单项包装器内容项
                │   ├── 📄 FormItemWrapperContentItemFormItem.tsx # 表单项包装器内容项表单项
                │   ├── 📄 FormItemWrapperContentItemSeparator.tsx # 表单项包装器内容项分隔符
                │   ├── 📄 FormItemWrapperContentItemTitle.tsx # 表单项包装器内容项标题
                │   ├── 📄 FormItemWrapperContentItemWrapper.tsx # 表单项包装器内容项包装器
                │   ├── 📄 FormItemWrapperContentWrapper.tsx # 表单项包装器内容包装器
                │   └── 📄 FormItemWrapperWrapper.tsx # 表单项包装器包装器
                ├── 📁 multi-select/    # 多选组件
                │   ├── 📄 MultiSelect.tsx # 多选基础组件
                │   ├── 📄 MultiSelectItem.tsx # 多选项组件
                │   ├── 📄 MultiSelectItemWrapper.tsx # 多选项包装器
                │   ├── 📄 MultiSelectWrapper.tsx # 多选包装器
                │   └── 📄 MultiSelectWrapperContent.tsx # 多选包装器内容
                ├── 📁 switch/          # 开关组件
                │   ├── 📄 Switch.tsx   # 开关基础组件
                │   ├── 📄 SwitchItem.tsx # 开关项组件
                │   ├── 📄 SwitchItemWrapper.tsx # 开关项包装器
                │   ├── 📄 SwitchWrapper.tsx # 开关包装器
                │   └── 📄 SwitchWrapperContent.tsx # 开关包装器内容
                ├── 📁 action-flow/     # 动作流组件
                │   ├── 📄 ActionFlow.tsx # 动作流基础组件
                │   ├── 📄 ActionFlowItem.tsx # 动作流项组件
                │   ├── 📄 ActionFlowItemAction.tsx # 动作流项动作组件
                │   ├── 📄 ActionFlowItemCondition.tsx # 动作流项条件组件
                │   ├── 📄 ActionFlowItemFilter.tsx # 动作流项过滤器组件
                │   ├── 📄 ActionFlowItemSeparator.tsx # 动作流项分隔符组件
                │   ├── 📄 ActionFlowItemTitle.tsx # 动作流项标题组件
                │   ├── 📄 ActionFlowItemWrapper.tsx # 动作流项包装器
                │   ├── 📄 ActionFlowWrapper.tsx # 动作流包装器
                │   └── 📄 ActionFlowWrapperContent.tsx # 动作流包装器内容
                ├── 📁 field-control/   # 字段控件组件
                │   ├── 📄 FieldControl.tsx # 字段控件基础组件
                │   ├── 📄 FieldControlItem.tsx # 字段控件项组件
                │   ├── 📄 FieldControlItemField.tsx # 字段控件项字段组件
                │   ├── 📄 FieldControlItemSeparator.tsx # 字段控件项分隔符组件
                │   ├── 📄 FieldControlItemTitle.tsx # 字段控件项标题组件
                │   ├── 📄 FieldControlItemWrapper.tsx # 字段控件项包装器
                │   ├── 📄 FieldControlWrapper.tsx # 字段控件包装器
                │   └── 📄 FieldControlWrapperContent.tsx # 字段控件包装器内容
                └── 📁 filter-condition/ # 过滤条件组件
                    ├── 📄 FilterCondition.tsx # 过滤条件基础组件
                    ├── 📄 FilterConditionItem.tsx # 过滤条件项组件
                    ├── 📄 FilterConditionItemCondition.tsx # 过滤条件项条件组件
                    ├── 📄 FilterConditionItemSeparator.tsx # 过滤条件项分隔符组件
                    ├── 📄 FilterConditionItemTitle.tsx # 过滤条件项标题组件
                    ├── 📄 FilterConditionItemWrapper.tsx # 过滤条件项包装器
                    ├── 📄 FilterConditionWrapper.tsx # 过滤条件包装器
                    └── 📄 FilterConditionWrapperContent.tsx # 过滤条件包装器内容
```

### 关键文件详细说明

#### 📄 main.ts - 插件主入口 (314行)
- **主要职责**: 插件生命周期管理、服务初始化、事件监听、错误处理
- **核心类**: `FormPlugin extends Plugin`
- **关键功能**: 
  - 🔧 服务容器初始化和依赖注入管理
  - 📊 性能监控（插件加载时间、内存使用）
  - 🎯 全局事件总线和错误处理集成
  - 🐛 调试管理器配置和状态同步
  - 🔌 API 接口暴露（FormFlowApi）
  - ⚙️ 插件设置管理和持久化
- **初始化流程**: 服务容器 → 设置加载 → API初始化 → 服务初始化 → 事件监听 → 布局就绪
- **依赖关系**: 依赖所有核心服务和组件，是整个插件的协调中心
- **重要程度**: ⭐⭐⭐⭐⭐ 核心文件
- **修改风险**: 🔴 高风险 - 影响整个插件的加载和运行

#### 📁 core/ - 核心架构组件
**现代化的插件基础设施，提供企业级的服务管理能力**

##### 🏗️ ServiceContainer.ts (267行) - 依赖注入容器
- **设计模式**: 单例模式 + 依赖注入 + 工厂模式
- **核心功能**:
  - 🔄 循环依赖检测和解决
  - 🎯 单例模式和实例生命周期管理
  - 💉 属性注入和依赖解析
  - 🧹 资源清理和内存管理
- **使用场景**: 管理所有服务实例，降低模块间耦合
- **性能特点**: 延迟初始化，支持批量注册

##### 📡 EventBus.ts (298行) - 事件总线系统
- **设计模式**: 观察者模式 + 发布订阅模式
- **核心功能**:
  - 🎪 类型安全的事件发布订阅
  - 📚 事件历史记录和回放
  - 🛡️ 错误隔离和异常处理
  - 🔄 一次性监听器支持
- **事件类型**: 插件生命周期、表单操作、文件操作、性能监控
- **性能优化**: 异步执行、Promise.allSettled 并发处理

##### 🚨 ErrorHandler.ts (385行) - 全局错误处理
- **错误分类**: 验证、网络、文件系统、权限、业务逻辑、配置、插件API
- **严重程度**: LOW、MEDIUM、HIGH、CRITICAL
- **核心功能**:
  - 🔍 错误分类和严重程度评估
  - 🔄 自动错误恢复策略
  - 📊 错误历史记录和统计
  - 🎯 用户友好的错误提示
- **恢复机制**: 可配置的恢复策略，支持自定义恢复逻辑

##### ⚡ PerformanceMonitor.ts (465行) - 性能监控
- **监控指标**: 执行时间、内存使用、操作频率
- **核心功能**:
  - 📈 实时性能指标收集
  - 🎯 性能阈值监控和预警
  - 📊 性能报告生成和分析
  - 🔧 性能优化建议
- **监控类别**: 启动性能、UI响应、文件操作、计算密集型任务

#### 📁 service/ - 业务逻辑服务层
**实现核心业务逻辑，采用分层架构和服务化设计**

##### 📋 FormService.ts (371行) - 表单处理核心服务
- **主要职责**: 表单提交、验证、数据处理、UI交互
- **核心方法**:
  - `submit()`: 表单提交和动作链执行
  - `openForm()`: 表单界面显示
  - `openFormWithData()`: 预填充数据的表单处理
- **集成功能**: AI调用计时、表单验证、动作链执行、可见性过滤
- **性能优化**: 智能判断是否需要显示UI，支持直接提交

##### 🎯 FormStateManager.ts (107行) - 表单状态管理
- **设计模式**: 单例模式 + 状态管理
- **主要职责**: 全局表单状态追踪、当前活动表单管理
- **继承关系**: 继承自 `BaseSingletonService`
- **调试支持**: 集成调试模块，支持按模块控制日志输出

##### 🔧 BaseService.ts (313行) - 服务基类
- **提供功能**: 调试日志、错误处理、性能监控、服务标识
- **集成组件**: 全局错误处理器、性能监控器、事件总线、服务容器
- **使用模式**: 所有业务服务的基类，提供统一的基础功能

##### 🎬 action/ - 动作执行服务
**支持15+种动作类型，采用责任链模式**
- **IActionService.ts**: 动作服务接口和动作链实现
- **核心动作服务**:
  - `CreateFileActionService`: 文件创建
  - `InsertTextActionService`: 文本插入
  - `AICallActionService`: AI调用
  - `ContentCleanupActionService`: 内容清理
  - `SuggestModalActionService`: 建议模态框
  - `UpdateFrontmatterActionService`: 前置元数据更新
- **执行模式**: 顺序执行、错误中断、上下文传递

##### 🤖 ai/ - AI集成服务
- **AITimerManager**: AI调用计时管理
- **多模型支持**: OpenAI、Claude、Gemini等
- **功能特性**: 模型验证、提示模板、输出变量管理

##### 🎛️ command/ - 命令服务
- **FormIntegrationService.ts (414行)**: 表单集成和命令注册
  - 表单文件监控和命令自动注册
  - 右键菜单集成和内容处理
  - 选中文本和文件内容的智能处理
- **ApplicationCommandService**: 应用级命令管理

##### 🖱️ context-menu/ - 右键菜单服务
- **ContextMenuService.ts (472行)**: 编辑器和文件右键菜单
  - 动态字段注册和菜单项管理
  - 内容提取和表单预填充
  - 与FormIntegrationService的协同工作

#### 📁 component/ - React组件库
**现代化的UI组件，支持主题和响应式设计**

##### 🎭 modal/ - 模态对话框组件
- **FormViewModal2**: 主表单界面，支持字段动态渲染
- **CommonSuggestModal**: 通用建议选择器
- **各类专用模态框**: AI设置、文件选择、内容预览

##### 🎨 其他UI组件
- **combobox/**: 智能下拉选择，支持搜索和过滤
- **filter/**: 条件过滤器，支持复杂逻辑表达式
- **toast/**: 消息提示系统，支持Promise状态跟踪
- **ai/**: AI相关UI组件，模型选择和配置界面

#### 📁 model/ - 数据模型层
**类型安全的数据结构定义，支持序列化和验证**

##### 📊 FormConfig.ts - 表单配置模型
- **核心属性**: id、fields、actions、条件逻辑、显示设置
- **验证支持**: 字段验证规则、动作条件检查
- **扩展性**: 支持自定义字段类型和动作类型

##### 🏗️ 类型层次结构
- **field/**: 15+种字段类型接口和实现
  - 基础字段: text、textarea、number、date、time
  - 选择字段: select、radio、checkbox、toggle
  - 高级字段: file-list、ai-model、suggest-modal
- **action/**: 15+种动作类型定型和实现
- **enums/**: 枚举类型定义，确保类型安全

#### 📁 settings/ - 插件设置
- **PluginSettings.ts (29行)**: 插件配置接口
  - 表单文件夹、脚本文件夹配置
  - AI设置集成
  - 调试日志开关
- **PluginSettingTab**: 设置界面实现

#### 📁 utils/ - 工具库
**丰富的工具函数，支持各种业务场景**
- **DebugManager**: 调试管理，支持模块化日志控制
- **PerformanceValidator**: 性能验证和基准测试
- **FieldValidationUtils**: 字段验证工具
- **字符串处理**: 模板引擎、格式化、加密解密
- **文件操作**: 路径处理、内容提取、文件定位

#### 📁 i18n/ - 国际化
- **支持语言**: 英语(en)、简体中文(zh)、繁体中文(zhTw)
- **翻译条目**: 256+个翻译键，覆盖所有UI文本
- **类型安全**: TypeScript接口定义，编译时检查

#### 📁 api/ - 对外API
- **FormFlowApi**: 提供给其他插件使用的公共接口
  - `openFormFile()`: 打开表单文件
  - `submitFormFile()`: 提交表单文件
- **设计原则**: 简洁易用、向后兼容、错误处理完善
- **重要程度**: ⭐⭐⭐⭐⭐ 核心数据结构
- **修改风险**: 🟡 中等风险 - 影响数据兼容性

---

## 🔧 代码架构分析 (Code Architecture)

### 设计模式

#### 1. 依赖注入模式 (Dependency Injection)
- **实现**: ServiceContainer 类提供完整的 DI 容器
- **特点**: 支持单例模式、循环依赖检测、生命周期管理
- **用途**: 管理服务实例，降低模块间耦合

#### 2. 观察者模式 (Observer Pattern)
- **实现**: EventBus 全局事件总线
- **特点**: 类型安全的事件发布订阅、事件历史记录
- **用途**: 模块间通信、状态变化通知

#### 3. 单例模式 (Singleton Pattern)
- **实现**: BaseSingletonService 基类
- **特点**: 线程安全、延迟初始化、实例重置支持
- **用途**: 全局状态管理、资源共享

#### 4. 策略模式 (Strategy Pattern)
- **实现**: 动作执行系统中的不同动作类型
- **特点**: 可扩展的动作类型、统一的执行接口
- **用途**: 支持多种表单动作类型

#### 5. 责任链模式 (Chain of Responsibility)
- **实现**: ActionChain 动作链执行
- **特点**: 顺序执行、错误中断、上下文传递
- **用途**: 表单提交时的动作序列执行

### 核心类/接口

#### 1. FormPlugin (主插件类)
```typescript
class FormPlugin extends Plugin {
    settings: PluginSettings;
    api: FormFlowApi;
    serviceContainer: ServiceContainer;
    // 插件生命周期管理
}
```

#### 2. ServiceContainer (服务容器)
```typescript
class ServiceContainer {
    register<T>(name: string, factory: Function): void;
    get<T>(name: string): T;
    dispose(): void;
    // 依赖注入和生命周期管理
}
```

#### 3. EventBus (事件总线)
```typescript
class EventBus {
    on<T>(event: string, listener: EventListener<T>): EventUnsubscriber;
    emit<T>(event: string, data?: T): Promise<void>;
    // 事件发布订阅机制
}
```

#### 4. FormService (表单服务)
```typescript
class FormService {
    submit(idValues: FormIdValues, config: FormConfig): Promise<ActionContext>;
    open(file: TFile, app: App): Promise<void>;
    // 表单处理核心逻辑
}
```

#### 5. FormConfig (表单配置)
```typescript
class FormConfig {
    id: string;
    fields: IFormField[];
    actions: IFormAction[];
    // 表单结构定义
}
```

### 数据模型

#### 表单字段类型层次
```typescript
interface IFormField {
    id: string;
    type: FormFieldType;
    label: string;
    required?: boolean;
    condition?: Filter;
}

// 具体字段类型
interface ITextField extends IFormField
interface ISelectField extends IFormField
interface IFileListField extends IFormField
// ... 其他字段类型
```

#### 动作类型层次
```typescript
interface IFormAction {
    id: string;
    type: FormActionType;
    condition?: Filter;
    title?: string;
}

// 具体动作类型
interface CreateFileFormAction extends IFormAction
interface InsertTextFormAction extends IFormAction
interface AICallFormAction extends IFormAction
// ... 其他动作类型
```

### API接口

#### 对外 API (FormFlowApi)
```typescript
class FormFlowApi {
    async openFormFile(filePath: string): Promise<void>;
    async submitFormFile(filePath: string): Promise<void>;
    // 提供给其他插件或脚本使用的接口
}
```

#### 内部服务接口
```typescript
interface IActionService {
    execute(context: ActionContext): Promise<ActionContext>;
    validate(context: ActionContext): void;
}
```

### 事件系统

#### 事件类型定义
```typescript
export const FormFlowEvents = {
    PLUGIN_LOADED: 'plugin:loaded',
    FORM_OPENED: 'form:opened',
    FORM_SUBMITTED: 'form:submitted',
    FILE_CREATED: 'file:created',
    ERROR: 'error'
} as const;
```

#### 事件处理流程
1. **事件发布**: 业务逻辑中通过 EventBus.emit() 发布事件
2. **事件监听**: 相关模块通过 EventBus.on() 监听事件
3. **事件处理**: 异步执行事件处理器
4. **错误处理**: 事件处理错误通过 ErrorHandler 统一处理

### 状态管理

#### 全局状态管理
- **FormStateManager**: 管理当前活动表单状态
- **PluginSettings**: 管理插件配置状态
- **AI 设置**: 管理 AI 模型配置状态

#### React 状态管理
- **Context API**: 提供 Obsidian App 实例和插件设置
- **Custom Hooks**: 封装常用状态逻辑
- **Local State**: 组件内部状态管理

---

## 🧩 功能模块详解 (Feature Modules)

### 1. 表单设计器模块

#### 模块概述
- **模块名称**: Form Designer
- **用途**: 提供可视化的表单设计和编辑功能

#### 入口点
- **主要文件**: `src/view/edit/setting/field/CpsFormFields.tsx`
- **启动方式**: 通过 Obsidian 命令或文件视图打开

#### 核心逻辑
1. **字段管理**: 添加、删除、排序表单字段
2. **属性配置**: 为每个字段配置属性和验证规则
3. **条件逻辑**: 设置字段显示条件和依赖关系
4. **实时预览**: 提供表单的实时预览功能

#### 配置选项
- 字段类型选择（15+ 种类型）
- 字段属性配置（标签、描述、默认值等）
- 验证规则设置（必填、格式验证等）
- 条件逻辑配置（显示/隐藏条件）

#### 用户界面
- **主界面**: 字段列表和属性编辑面板
- **字段编辑器**: 每种字段类型的专用编辑器
- **预览面板**: 实时显示表单效果
- **工具栏**: 添加字段、保存、预览等操作

#### 数据处理
- **配置存储**: 将表单配置保存为 JSON 文件
- **配置加载**: 从文件加载表单配置
- **配置验证**: 验证配置的完整性和正确性

#### 错误处理
- **配置验证错误**: 显示配置错误信息
- **保存失败**: 处理文件保存失败情况
- **加载失败**: 处理配置文件损坏情况

### 2. 表单渲染模块

#### 模块概述
- **模块名称**: Form Renderer
- **用途**: 根据配置动态渲染表单界面

#### 入口点
- **主要文件**: `src/view/preview/CpsFormRenderView.tsx`
- **启动方式**: 通过 FormService.open() 方法调用

#### 核心逻辑
1. **配置解析**: 解析表单配置文件
2. **字段渲染**: 根据字段类型动态渲染组件
3. **条件评估**: 实时评估字段显示条件
4. **数据绑定**: 管理表单数据和字段值
5. **验证处理**: 执行字段验证和错误显示

#### 配置选项
- 表单布局模式（水平/垂直）
- 字段验证规则
- 条件显示逻辑
- 提交按钮配置

#### 用户界面
- **表单容器**: 包含所有字段的主容器
- **字段组件**: 各种类型的输入组件
- **验证提示**: 错误和警告信息显示
- **操作按钮**: 提交、重置、取消等按钮

#### 数据处理
- **表单状态**: 使用 React state 管理表单数据
- **实时验证**: 字段值变化时触发验证
- **条件更新**: 根据条件逻辑更新字段可见性

#### 错误处理
- **字段验证错误**: 显示字段级别的错误信息
- **表单验证错误**: 显示表单级别的错误信息
- **渲染错误**: 处理组件渲染失败情况

### 3. 动作执行模块

#### 模块概述
- **模块名称**: Action Execution Engine
- **用途**: 执行表单提交后的各种自动化动作

#### 入口点
- **主要文件**: `src/service/action/IActionService.ts`
- **启动方式**: 通过 FormService.submit() 触发

#### 核心逻辑
1. **动作链构建**: 根据配置构建动作执行链
2. **顺序执行**: 按顺序执行每个动作
3. **上下文传递**: 在动作间传递执行上下文
4. **错误中断**: 遇到错误时中断执行链
5. **结果收集**: 收集每个动作的执行结果

#### 支持的动作类型
- **文件操作**: 创建文件、打开文件
- **文本处理**: 插入文本、内容清理
- **脚本执行**: 运行自定义 JavaScript
- **AI 调用**: 调用 AI 模型生成内容
- **系统集成**: 执行 Obsidian 命令
- **内容转换**: 格式转换和处理

#### 配置选项
- 动作类型选择
- 动作参数配置
- 执行条件设置
- 错误处理策略

#### 数据处理
- **上下文管理**: ActionContext 对象传递数据
- **变量替换**: 支持模板变量替换
- **结果存储**: 将执行结果存储到上下文

#### 错误处理
- **动作执行失败**: 记录错误并中断执行
- **参数验证失败**: 在执行前验证参数
- **超时处理**: 处理长时间运行的动作

### 4. AI 集成模块

#### 模块概述
- **模块名称**: AI Integration
- **用途**: 集成各种 AI 模型，提供内容生成功能

#### 入口点
- **主要文件**: `src/service/ai/AICallActionService.ts`
- **启动方式**: 通过 AI_CALL 动作类型触发

#### 核心逻辑
1. **模型配置**: 管理多个 AI 模型的配置
2. **请求构建**: 根据模板和输入构建 AI 请求
3. **API 调用**: 调用 AI 服务 API
4. **响应处理**: 处理 AI 返回的内容
5. **进度监控**: 显示 AI 调用进度

#### 配置选项
- AI 模型选择（GPT、Claude、Gemini 等）
- API 配置（URL、密钥、参数）
- 提示词模板管理
- 输出格式设置

#### 用户界面
- **模型选择器**: AI 模型下拉选择
- **模板选择器**: 提示词模板选择
- **进度指示器**: AI 调用进度显示
- **结果预览**: AI 生成内容预览

#### 数据处理
- **模板变量**: 支持动态变量替换
- **内容格式化**: 格式化 AI 返回内容
- **结果缓存**: 缓存 AI 调用结果

#### 错误处理
- **API 调用失败**: 处理网络和 API 错误
- **配置错误**: 验证 AI 模型配置
- **超时处理**: 处理 AI 调用超时

### 5. 文件管理模块

#### 模块概述
- **模块名称**: File Management
- **用途**: 处理表单相关的文件操作

#### 入口点
- **主要文件**: `src/service/file-view/ApplicationFileViewService.ts`
- **启动方式**: 通过文件系统事件或用户操作触发

#### 核心逻辑
1. **文件监听**: 监听表单文件的变化
2. **文件解析**: 解析表单配置文件
3. **文件验证**: 验证文件格式和内容
4. **文件操作**: 创建、更新、删除文件
5. **路径解析**: 处理相对路径和变量路径

#### 配置选项
- 表单文件夹路径
- 脚本文件夹路径
- 文件命名规则
- 自动保存设置

#### 数据处理
- **文件格式**: JSON 格式的表单配置
- **编码处理**: UTF-8 编码支持
- **备份机制**: 自动备份重要文件

#### 错误处理
- **文件读取失败**: 处理文件不存在或权限问题
- **格式错误**: 处理 JSON 格式错误
- **写入失败**: 处理磁盘空间不足等问题

---

## 🔗 依赖关系图 (Dependency Graph)

### 外部依赖分析

#### 核心框架依赖
```
React 18.3.0
├── react-dom 18.3.0          # React DOM 渲染
├── react-error-boundary 4.0.13 # 错误边界处理
└── @types/react 18.2.47       # React 类型定义
```

#### UI 组件库依赖
```
Radix UI 1.4.1
├── @floating-ui/react 0.27.5  # 浮动定位
├── lucide-react 0.424.0       # 图标库
└── @tanstack/react-virtual 3.13.5 # 虚拟滚动
```

#### 代码编辑器依赖
```
CodeMirror 6.x
├── @codemirror/lang-javascript 6.2.3  # JS 语法支持
├── @codemirror/lang-markdown 6.3.2    # Markdown 语法
├── @codemirror/lang-yaml 6.1.2        # YAML 语法
├── @codemirror/view 6.23.0             # 编辑器视图
├── @codemirror/autocomplete 6.18.3    # 自动完成
└── @codemirror/commands 6.7.1          # 编辑器命令
```

#### 工具库依赖
```
工具库
├── uuid 9.0.1                 # UUID 生成
├── luxon 3.4.4                # 时间处理
├── prettier 2.8.0             # 代码格式化
└── @atlaskit/pragmatic-drag-and-drop 1.3.0 # 拖拽功能
```

#### 开发工具依赖
```
开发工具
├── typescript 4.7.4          # TypeScript 编译器
├── esbuild 0.17.3            # 构建工具
├── @typescript-eslint/* 5.29.0 # TypeScript ESLint
└── obsidian latest           # Obsidian API
```

### 内部依赖关系

#### 依赖层级结构
```
第一层：基础设施层
├── core/ServiceContainer      # 依赖注入容器
├── core/EventBus             # 事件总线
├── core/ErrorHandler         # 错误处理
└── core/PerformanceMonitor   # 性能监控

第二层：数据模型层
├── model/FormConfig          # 表单配置模型
├── model/action/*            # 动作类型定义
├── model/field/*             # 字段类型定义
└── model/enums/*             # 枚举类型

第三层：服务层
├── service/FormService       # 表单核心服务
├── service/FormStateManager  # 状态管理
├── service/action/*          # 动作执行服务
└── service/ai/*              # AI 集成服务

第四层：组件层
├── component/*               # 可复用组件
├── view/shared/*             # 共享视图组件
└── view/edit/*               # 编辑器组件

第五层：应用层
├── main.ts                   # 插件入口
├── api/FormFlowApi           # 对外 API
└── settings/*                # 设置管理
```

#### 关键依赖路径

1. **插件启动路径**:
   ```
   main.ts → ServiceContainer → EventBus → FormService → 各种子服务
   ```

2. **表单渲染路径**:
   ```
   FormService → CpsFormRenderView → CpsFormFieldControl → 具体字段组件
   ```

3. **动作执行路径**:
   ```
   FormService → ActionChain → IActionService → 具体动作实现
   ```

4. **AI 调用路径**:
   ```
   AICallFormAction → AICallActionService → AI API → 结果处理
   ```

### 循环依赖检测

#### 潜在循环依赖
- **服务间依赖**: 某些服务可能相互引用
- **组件间依赖**: React 组件间的相互引用
- **模型间依赖**: 数据模型的相互引用

#### 解决方案
- **依赖注入**: 使用 ServiceContainer 解耦服务依赖
- **事件通信**: 使用 EventBus 替代直接依赖
- **接口抽象**: 使用接口定义替代具体实现依赖

---

## ⚙️ 配置系统分析 (Configuration System)

### 配置文件层次

#### 1. 插件级配置
- **manifest.json**: Obsidian 插件元数据
  ```json
  {
    "id": "form-flow",
    "name": "Form Flow",
    "version": "0.1.3",
    "minAppVersion": "1.8.0",
    "description": "Create simple, one-action workflows — with ease."
  }
  ```

#### 2. 项目构建配置
- **package.json**: Node.js 项目配置
- **tsconfig.json**: TypeScript 编译配置
- **esbuild.config.mjs**: 构建工具配置
- **.eslintrc.js**: 代码规范配置

#### 3. 用户设置配置
- **PluginSettings.ts**: 用户可配置选项
  ```typescript
  interface PluginSettings {
    formFolder: string;           // 表单文件夹路径
    scriptFolder: string;        // 脚本文件夹路径
    formIntegrations: FormIntegration; // 表单集成配置
    aiSettings: IAISettings;     // AI 设置
    enableDebugLogging: boolean; // 调试日志开关
  }
  ```

#### 4. 表单配置
- **FormConfig**: 单个表单的配置结构
- **字段配置**: 各种字段类型的配置选项
- **动作配置**: 各种动作类型的配置参数

### 配置选项详解

#### 插件基础设置
| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| formFolder | string | "form/forms" | 表单文件存储目录 |
| scriptFolder | string | "form/scripts" | 脚本文件存储目录 |
| enableDebugLogging | boolean | false | 是否启用调试日志 |

#### AI 模型配置
| 配置项 | 类型 | 说明 |
|--------|------|------|
| modelName | string | AI 模型名称 |
| apiKey | string | API 密钥 |
| baseURL | string | API 基础 URL |
| maxTokens | number | 最大 token 数 |
| temperature | number | 生成温度参数 |

#### 表单字段配置
| 配置项 | 类型 | 说明 |
|--------|------|------|
| id | string | 字段唯一标识 |
| type | FormFieldType | 字段类型 |
| label | string | 字段标签 |
| required | boolean | 是否必填 |
| defaultValue | any | 默认值 |
| condition | Filter | 显示条件 |

### 配置加载机制

#### 1. 插件启动时配置加载
```typescript
async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
}
```

#### 2. 表单配置加载
```typescript
async open(file: TFile, app: App) {
    const content = await app.vault.read(file);
    const form = JSON.parse(content) as FormConfig;
    await this.openForm(form, app);
}
```

#### 3. 动态配置更新
```typescript
async replaceSettings(value: Partial<PluginSettings>) {
    this.settings = { ...this.settings, ...value };
    await this.saveSettings();
}
```

### 配置验证机制

#### 1. 表单配置验证
```typescript
class FormValidator {
    static validate(config: FormConfig, idValues: FormIdValues): void {
        // 验证必填字段
        // 验证字段格式
        // 验证动作配置
    }
}
```

#### 2. AI 配置验证
- API 密钥格式验证
- 模型名称有效性检查
- 参数范围验证

#### 3. 路径配置验证
- 文件夹路径存在性检查
- 权限验证
- 相对路径解析

### 配置更新处理

#### 1. 实时配置更新
- 设置页面的实时保存
- 配置变化的事件通知
- 相关服务的配置重载

#### 2. 配置迁移
- 版本升级时的配置迁移
- 默认值的自动补充
- 废弃配置的清理

#### 3. 配置备份
- 重要配置的自动备份
- 配置恢复机制
- 错误配置的回滚

---

## 🔨 构建和部署 (Build & Deploy)

### 构建流程

#### 1. 开发环境构建
```bash
# 安装依赖
npm install

# 开发模式（监听文件变化）
npm run dev

# 类型检查
tsc -noEmit -skipLibCheck
```

#### 2. 生产环境构建
```bash
# 生产构建
npm run build

# 版本更新
npm run version
```

#### 3. 构建步骤详解
1. **TypeScript 编译检查**: 验证类型安全性
2. **ESBuild 打包**: 将源码打包为单个 JS 文件
3. **CSS 处理**: 合并和优化 CSS 文件
4. **资源优化**: 代码压缩和 Tree Shaking
5. **Source Map**: 生成调试映射文件（开发模式）

### 构建工具配置

#### ESBuild 配置 (esbuild.config.mjs)
```javascript
const context = await esbuild.context({
    entryPoints: ["src/main.ts"],
    bundle: true,
    external: ["obsidian", "electron", ...builtins],
    format: "cjs",
    target: "es2018",
    sourcemap: false,
    treeShaking: true,
    outfile: "main.js",
    minify: prod
});
```

#### TypeScript 配置 (tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "ES6",
    "module": "ESNext",
    "jsx": "react-jsx",
    "strict": true,
    "moduleResolution": "node"
  }
}
```

### 输出文件说明

#### 构建产物
| 文件名 | 用途 | 大小估计 |
|--------|------|----------|
| main.js | 插件主文件 | ~500KB |
| styles.css | 样式文件 | ~50KB |
| manifest.json | 插件清单 | ~1KB |

#### 文件结构
```
plugin/
├── main.js          # 打包后的主文件
├── styles.css       # 合并后的样式文件
├── manifest.json    # 插件清单文件
└── versions.json    # 版本历史文件
```

### 部署方式

#### 1. 开发环境部署
```bash
# 直接复制到 Obsidian 插件目录
cp -r plugin/* ~/.obsidian/plugins/form-flow/
```

#### 2. 用户安装方式
1. **手动安装**: 下载插件文件到 `.obsidian/plugins/` 目录
2. **社区插件**: 通过 Obsidian 社区插件市场安装
3. **BRAT 安装**: 使用 Beta Reviewer's Auto-update Tool

#### 3. 自动化部署
- **GitHub Actions**: 自动构建和发布
- **版本管理**: 自动更新版本号和变更日志
- **质量检查**: 自动化测试和代码质量检查

### 环境要求

#### 运行环境
- **Obsidian**: 1.8.0 或更高版本
- **操作系统**: Windows, macOS, Linux
- **Node.js**: 16.0+ (开发环境)
- **内存**: 建议 4GB 以上

#### 开发环境
- **Node.js**: 18.0+ 推荐
- **npm**: 8.0+ 或 yarn 1.22+
- **TypeScript**: 4.7.4
- **编辑器**: VS Code 推荐（配置 TypeScript 支持）

### 性能优化

#### 构建优化
- **Tree Shaking**: 移除未使用的代码
- **代码分割**: 按需加载大型组件
- **压缩优化**: 生产环境代码压缩
- **缓存策略**: 构建缓存和增量编译

#### 运行时优化
- **懒加载**: 延迟加载非关键组件
- **内存管理**: 及时清理事件监听器和定时器
- **异步处理**: 避免阻塞主线程的操作

---

## 🔧 扩展和维护 (Extension & Maintenance)

### 扩展点分析

#### 1. 字段类型扩展
**扩展位置**: `src/model/field/` 和 `src/view/shared/control/`

**扩展步骤**:
1. 在 `FormFieldType` 枚举中添加新类型
2. 创建字段接口继承 `IFormField`
3. 实现字段控制组件
4. 在 `CpsFormFieldControl` 中注册新组件
5. 添加字段设置编辑器

**示例**:
```typescript
// 1. 添加枚举
export enum FormFieldType {
    // ... 现有类型
    CUSTOM_FIELD = "customField"
}

// 2. 定义接口
interface ICustomField extends IFormField {
    customProperty: string;
}

// 3. 实现组件
function CustomFieldControl(props: FieldControlProps) {
    // 组件实现
}
```

#### 2. 动作类型扩展
**扩展位置**: `src/model/action/` 和 `src/service/action/`

**扩展步骤**:
1. 在 `FormActionType` 枚举中添加新类型
2. 创建动作接口继承 `IFormAction`
3. 实现动作服务类继承 `IActionService`
4. 在动作工厂中注册新服务
5. 添加动作配置编辑器

**示例**:
```typescript
// 1. 添加动作类型
export enum FormActionType {
    // ... 现有类型
    CUSTOM_ACTION = "customAction"
}

// 2. 实现服务
class CustomActionService implements IActionService {
    async execute(context: ActionContext): Promise<ActionContext> {
        // 动作执行逻辑
        return context;
    }
}
```

#### 3. AI 模型扩展
**扩展位置**: `src/service/ai/` 和 `src/model/ai/`

**扩展步骤**:
1. 在 AI 配置中添加新模型支持
2. 实现模型特定的 API 调用逻辑
3. 添加模型配置界面
4. 更新模型选择器组件

#### 4. 主题和样式扩展
**扩展位置**: `src/style/` 和组件 CSS 文件

**扩展方式**:
- CSS 变量系统支持主题切换
- 组件级样式覆盖
- 自定义 CSS 类名支持

### 插件机制

#### 1. 事件插件系统
```typescript
// 注册事件监听器扩展功能
globalEventBus.on(FormFlowEvents.FORM_SUBMITTED, (data) => {
    // 自定义处理逻辑
});
```

#### 2. 服务扩展机制
```typescript
// 通过服务容器注册自定义服务
serviceContainer.register('CustomService', () => new CustomService());
```

#### 3. 组件扩展机制
```typescript
// 通过 React Context 扩展组件功能
const CustomProvider = ({ children }) => {
    return (
        <CustomContext.Provider value={customValue}>
            {children}
        </CustomContext.Provider>
    );
};
```

### API 稳定性

#### 稳定 API (不会破坏性变更)
- **FormFlowApi**: 对外公开的主要 API
- **IFormField**: 字段接口定义
- **IFormAction**: 动作接口定义
- **FormConfig**: 表单配置结构
- **事件类型**: FormFlowEvents 中定义的事件

#### 实验性 API (可能变更)
- **内部服务接口**: 服务层的具体实现
- **组件 Props**: React 组件的属性接口
- **工具函数**: utils 目录下的辅助函数

#### 废弃 API
- **action 属性**: FormConfig 中的单个 action（已被 actions 数组替代）

### 向后兼容性

#### 配置文件兼容
- 支持旧版本表单配置文件
- 自动迁移废弃的配置项
- 提供配置升级工具

#### API 兼容
- 保持公开 API 的向后兼容
- 废弃 API 提供过渡期支持
- 版本化的 API 设计

### 常见修改场景

#### 1. 添加新字段类型
**影响范围**: 字段模型、控制组件、设置编辑器
**修改文件**:
- `src/model/enums/FormFieldType.ts`
- `src/model/field/` (新增字段接口)
- `src/view/shared/control/` (新增控制组件)
- `src/view/edit/setting/field/` (新增设置编辑器)

#### 2. 修改表单渲染逻辑
**影响范围**: 表单渲染、字段控制、条件逻辑
**修改文件**:
- `src/view/preview/CpsFormRenderView.tsx`
- `src/service/condition/FormVisibilies.ts`
- `src/view/shared/control/CpsFormFieldControl.tsx`

#### 3. 扩展 AI 功能
**影响范围**: AI 服务、模型配置、用户界面
**修改文件**:
- `src/service/ai/` (AI 服务实现)
- `src/model/ai/` (AI 配置模型)
- `src/component/ai/` (AI 相关组件)

#### 4. 优化性能
**影响范围**: 组件渲染、状态管理、异步处理
**修改策略**:
- 添加 React.memo 和 useMemo 优化
- 实现虚拟滚动和懒加载
- 优化事件监听器管理

---

## ⚠️ 潜在问题和风险 (Issues & Risks)

### 技术债务

#### 1. 类型安全问题
**问题描述**: 代码中存在 `any` 类型的使用
**影响**: 降低类型安全性，增加运行时错误风险
**位置**: 
- 某些组件的 props 定义
- 动态数据处理部分
- 第三方库集成代码

**解决方案**:
```typescript
// 替换 any 类型为具体类型定义
interface SpecificType {
    property: string;
    value: number;
}

// 使用泛型提高类型安全
function processData<T>(data: T): T {
    return data;
}
```

#### 2. 重复代码问题
**问题描述**: 多个组件中存在相似的逻辑模式
**影响**: 增加维护成本，容易产生不一致性
**位置**:
- 表单字段验证逻辑
- 文件路径处理逻辑
- 错误处理模式

**解决方案**:
- 提取公共 Hook
- 创建工具函数库
- 实现高阶组件

#### 3. 异步操作处理
**问题描述**: 部分异步操作缺少错误处理
**影响**: 可能导致未捕获的 Promise 错误
**位置**:
- 文件读写操作
- AI API 调用
- 动作执行链

### 性能瓶颈

#### 1. React 渲染优化
**问题描述**: 组件缺少渲染优化
**影响**: 不必要的重新渲染，影响用户体验
**具体问题**:
- 缺少 `React.memo` 包装
- 缺少 `useMemo` 和 `useCallback` 优化
- 复杂对象作为依赖项

**优化方案**:
```typescript
// 使用 React.memo 优化组件
const OptimizedComponent = React.memo(({ data }) => {
    const processedData = useMemo(() => {
        return expensiveOperation(data);
    }, [data]);
    
    const handleClick = useCallback(() => {
        // 处理点击事件
    }, []);
    
    return <div onClick={handleClick}>{processedData}</div>;
});
```

#### 2. 内存泄漏风险
**问题描述**: 事件监听器和定时器可能未正确清理
**影响**: 长时间使用后内存占用增加
**风险点**:
- React 组件卸载时未清理事件监听器
- 单例服务中的事件监听器累积
- AI 调用的定时器未清理

**解决方案**:
```typescript
useEffect(() => {
    const unsubscribe = eventBus.on('event', handler);
    
    return () => {
        unsubscribe(); // 清理事件监听器
    };
}, []);
```

#### 3. 同步 I/O 操作
**问题描述**: 存在阻塞主线程的同步文件操作
**影响**: 界面卡顿，用户体验差
**位置**: 文件读写、配置加载

### 安全风险

#### 1. 脚本执行安全
**问题描述**: 用户可以执行任意 JavaScript 代码
**风险**: 恶意脚本可能访问敏感数据或执行危险操作
**缓解措施**:
- 脚本执行沙箱化
- API 访问权限控制
- 用户确认机制

#### 2. AI API 密钥安全
**问题描述**: API 密钥存储在本地配置中
**风险**: 密钥泄露风险
**缓解措施**:
- 密钥加密存储
- 环境变量支持
- 密钥轮换机制

#### 3. 文件路径安全
**问题描述**: 用户输入的文件路径可能包含危险字符
**风险**: 路径遍历攻击
**缓解措施**:
- 路径验证和清理
- 限制访问范围
- 相对路径强制

### 兼容性问题

#### 1. Obsidian 版本兼容
**问题描述**: 新版本 Obsidian 可能破坏 API 兼容性
**影响**: 插件功能失效
**应对策略**:
- 定期测试新版本兼容性
- 使用稳定的 API
- 提供降级方案

#### 2. 操作系统兼容
**问题描述**: 文件路径处理在不同系统间的差异
**影响**: 跨平台功能异常
**应对策略**:
- 使用 Obsidian 提供的路径 API
- 统一路径分隔符处理
- 平台特定的测试用例

#### 3. 依赖库兼容
**问题描述**: 第三方依赖库版本更新可能引入破坏性变更
**影响**: 构建失败或功能异常
**应对策略**:
- 锁定依赖版本
- 定期更新和测试
- 提供回退版本

### 维护难点

#### 1. 复杂的状态管理
**难点描述**: 表单状态、条件逻辑、动作执行状态的协调
**维护策略**:
- 使用状态管理工具
- 清晰的状态流向文档
- 状态变化的日志记录

#### 2. 异步操作调试
**难点描述**: AI 调用、文件操作等异步操作的错误定位
**维护策略**:
- 完善的错误日志
- 操作链路追踪
- 调试模式支持

#### 3. 用户配置多样性
**难点描述**: 用户的各种配置组合可能产生意外问题
**维护策略**:
- 配置验证机制
- 常见配置的测试覆盖
- 用户反馈收集系统

---

## 📊 项目统计信息

### 代码统计
- **总文件数**: 150+ 个源码文件
- **代码行数**: 约 15,000+ 行
- **组件数量**: 50+ React 组件
- **服务类数**: 20+ 业务服务
- **测试覆盖**: 待完善

### 功能统计
- **字段类型**: 15+ 种表单字段
- **动作类型**: 14+ 种自动化动作
- **AI 模型**: 支持多种主流 AI 模型
- **语言支持**: 中文、英文国际化

### 性能指标
- **插件大小**: ~500KB (打包后)
- **启动时间**: <2 秒
- **内存占用**: ~50MB (正常使用)
- **响应时间**: <100ms (表单操作)

---

## 🚀 快速开始指南

### 开发环境搭建

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd obsidian-form-flow-master/plugin
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **开发模式**
   ```bash
   npm run dev
   ```

4. **构建插件**
   ```bash
   npm run build
   ```

### 基本使用

1. **创建表单**
   - 在 Obsidian 中执行命令 "Form Flow: Create Form"
   - 使用可视化编辑器设计表单
   - 配置字段和动作

2. **使用表单**
   - 打开表单文件
   - 填写表单字段
   - 点击提交执行动作

3. **配置 AI**
   - 在插件设置中配置 AI 模型
   - 设置 API 密钥和参数
   - 在表单中使用 AI 动作

---

## 📚 相关资源

### 官方文档
- [Obsidian 插件开发文档](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
- [React 官方文档](https://react.dev/)
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)

### 社区资源
- [Obsidian 开发者社区](https://obsidian.md/community)
- [插件开发示例](https://github.com/obsidianmd/obsidian-sample-plugin)

### 相关工具
- [Obsidian Plugin Template](https://github.com/obsidianmd/obsidian-sample-plugin)
- [Hot Reload Plugin](https://github.com/pjeby/hot-reload)
- [BRAT Plugin](https://github.com/TfTHacker/obsidian42-brat)

---

## 🤝 贡献指南

### 开发规范
- 遵循 TypeScript 严格模式
- 使用 ESLint 代码规范
- 编写清晰的注释和文档
- 保持代码的可测试性

### 提交规范
- 使用语义化的提交信息
- 每个提交只包含一个功能或修复
- 提供详细的变更说明

### 测试要求
- 新功能必须包含测试用例
- 确保现有测试通过
- 提供使用示例和文档

---

## 📄 许可证

本项目采用 MIT 许可证，详见 [LICENSE](LICENSE) 文件。

---

## 📞 联系方式

- **作者**: vran
- **项目地址**: [GitHub Repository]
- **问题反馈**: [GitHub Issues]
- **功能建议**: [GitHub Discussions]

---

**最后更新**: 2025年
**文档版本**: v1.0
**插件版本**: v0.1.3