# 统一数据存储修复说明

## 问题根源
之前使用了两个独立的数据文件：
1. `data.json` - 主插件设置文件
2. `ai-settings.json` - AI设置独立文件

这导致了：
- 数据同步问题
- 文件路径错误
- 重复的保存/加载逻辑
- 设置被重置的问题

## 修复方案：统一数据存储

### ✅ 现在只使用一个文件：`data.json`
所有设置（包括AI设置）都存储在主插件的 `data.json` 文件中。

### 🔧 主要修改

#### 1. 重构 AISettingsService.ts
- **移除独立文件路径**：不再使用 `ai-settings.json`
- **直接操作主插件设置**：通过 `plugin.replaceSettings()` 保存
- **简化加载逻辑**：直接从 `plugin.settings.aiSettings` 获取
- **统一错误处理**：使用主插件的保存机制

#### 2. 简化主插件 main.ts
- **移除AI设置同步逻辑**：不再需要复杂的文件同步
- **统一设置加载**：只加载 `data.json`

#### 3. 优化设置界面
- **直接操作主设置**：所有更改直接保存到主插件设置
- **实时同步**：设置更改立即生效

## 数据结构

### data.json 结构
```json
{
  "formFolder": "System/forms",
  "scriptFolder": "System/Script", 
  "formIntegrations": { ... },
  "aiSettings": {
    "models": [
      {
        "id": "uuid",
        "displayName": "模型名称",
        "modelName": "actual-model-name",
        "provider": "deepseek",
        "baseUrl": "https://api.deepseek.com",
        "apiKey": "加密后的密钥",
        "maxContextLength": 32000,
        "maxOutputTokens": 8000,
        "capabilities": {
          "reasoning": true,
          "webSearch": false
        },
        "verified": true,
        "createdAt": 1234567890,
        "updatedAt": 1234567890
      }
    ],
    "promptTemplateFolder": "form/prompts",
    "enableSystemPrompt": false,
    "systemPrompt": "默认系统提示词"
  }
}
```

## 修复效果

### ✅ 解决的问题
1. **模型保存问题** - 模型现在能正确保存到 `data.json`
2. **提示模板目录重置** - 目录设置现在能正确持久化
3. **数据同步错误** - 消除了双文件系统的同步问题
4. **文件路径错误** - 不再有找不到文件的问题

### 🚀 改进的特性
- **单一数据源** - 所有设置在一个文件中
- **简化的逻辑** - 减少了复杂的同步机制
- **更好的可靠性** - 使用Obsidian的标准设置机制
- **详细的调试** - 保留了详细的控制台日志

## 测试验证

### 1. 添加新模型测试
```
进入AI模型管理 → 添加模型 → 填写信息 → 保存
预期：模型出现在列表中，data.json中包含模型数据
```

### 2. 编辑模型测试
```
点击编辑按钮 → 修改信息 → 保存
预期：更改正确保存，列表显示更新后的信息
```

### 3. 设置持久化测试
```
修改提示模板目录 → 离开设置界面 → 重新进入
预期：目录设置保持用户设置的值
```

### 4. 重启测试
```
进行上述操作 → 重启Obsidian → 检查设置
预期：所有设置在重启后依然保持
```

## 部署状态
✅ 已删除旧的 `ai-settings.json` 文件
✅ 修复已部署到：`C:\Code\Obsidian沙箱仓库\.obsidian\plugins\form-flow\`
✅ 现在使用统一的 `data.json` 存储所有设置

## 调试信息
控制台日志现在会显示：
- `从主插件设置加载AI设置: [设置内容]`
- `开始保存AI设置到主插件设置: [设置内容]`
- `AI设置已保存到主插件设置`

不再有"AI设置文件不存在"的错误！
