# 路径搜索功能改进说明

## 概述

本次更新大幅提升了 Obsidian Form Flow 插件中路径输入框的搜索功能，支持更智能的文件和文件夹搜索体验。

## 主要改进

### 1. 高级搜索算法

新增了 `searchUtils.ts` 工具文件，实现了以下搜索功能：

- **精确匹配**：完全匹配搜索词的结果优先显示
- **模糊搜索**：支持部分字符匹配，如搜索 "doc" 可以找到 "document"
- **首字母匹配**：支持首字母缩写搜索，如搜索 "wd" 可以找到 "web-development"
- **智能排序**：根据匹配程度和相似度自动排序结果

### 2. 搜索匹配高亮

- 搜索结果中的匹配文本会以高亮显示
- 支持多个匹配片段的高亮
- 在不同的 UI 状态下（悬停、选中）提供不同的高亮样式

### 3. 更新的组件

以下组件已更新以使用新的搜索算法：

#### 3.1 FilePathFormItem.tsx
- 文件路径输入框的主要搜索组件
- 支持文件和变量的智能搜索
- 添加了完整路径的提示信息

#### 3.2 FolderSuggest.ts
- 文件夹建议组件
- 改进了文件夹路径的搜索和高亮显示

#### 3.3 CFormSuggestModal.tsx
- 表单文件建议模态框
- 优化了 .cform 文件的搜索体验

#### 3.4 FileListControl.tsx
- 文件列表控件
- 支持 Markdown 文件的高级搜索和高亮

### 4. 样式改进

- 为所有搜索组件添加了统一的高亮样式
- 支持 Obsidian 主题的颜色变量
- 在不同交互状态下提供合适的视觉反馈

## 技术实现

### 搜索算法特性

1. **多种匹配类型**：
   - `EXACT`: 精确匹配
   - `FUZZY`: 模糊匹配
   - `ACRONYM`: 首字母匹配

2. **智能评分系统**：
   - 基于编辑距离（Levenshtein Distance）计算相似度
   - 考虑匹配位置和连续性
   - 优先显示更相关的结果

3. **性能优化**：
   - 限制搜索结果数量避免性能问题
   - 使用高效的字符串匹配算法
   - 支持大量文件的快速搜索

### 高亮显示实现

- 使用 `<mark>` 标签包装匹配的文本片段
- 通过 `dangerouslySetInnerHTML` 安全地渲染 HTML
- CSS 样式与 Obsidian 主题系统集成

## 使用示例

### 搜索示例

假设有以下文件：
- `notes/daily/2024-01-01.md`
- `projects/web-development/readme.md`
- `docs/api-documentation.md`

**搜索 "doc"**：
1. `docs/api-documentation.md` (精确匹配 "doc")
2. `projects/web-development/readme.md` (模糊匹配)

**搜索 "wd"**：
1. `projects/web-development/readme.md` (首字母匹配 "w-d")

**搜索 "api"**：
1. `docs/api-documentation.md` (精确匹配 "api")

## 测试

项目包含了测试文件 `searchUtils.test.ts`，可以验证搜索功能的正确性：

```typescript
import { runTests } from './utils/searchUtils.test';
runTests(); // 运行所有搜索测试
```

## 兼容性

- 完全向后兼容现有功能
- 不影响现有的表单配置
- 支持所有 Obsidian 主题
- 适配移动端和桌面端

## 未来改进

- 支持正则表达式搜索
- 添加搜索历史记录
- 支持自定义搜索权重配置
- 添加搜索性能监控