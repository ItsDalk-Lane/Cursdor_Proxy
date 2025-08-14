# Git 自动提交插件 - 数据存储说明

## 新的数据存储结构

从版本 1.0.0 开始，插件使用独立的数据文件来存储所有配置信息，而不再依赖于 main.js 文件内置的数据。

### 数据文件位置
```
.obsidian/plugins/git-auto/plugin-data.json
```

### 文件结构
```json
{
  "settings": {
    "defaultCommitScope": "all",
    "defaultMessageType": "ai",
    "pushToRemote": true,
    "remoteBranch": "main",
    "autoCommit": false,
    "includeFileTypes": [".md", ".txt", ".canvas", ".json"],
    "excludePatterns": [".obsidian/", "node_modules/", ".git/"],
    "showNotifications": true
  },
  "models": {
    "configs": [],
    "defaultModelId": null
  },
  "preferences": {},
  "version": "1.0.0",
  "lastModified": 1643000000000
}
```

### 安全特性

1. **API密钥加密存储**: 所有API密钥都会进行Base64编码后存储，不以明文形式保存
2. **独立数据文件**: 配置数据与插件代码完全分离
3. **自动数据迁移**: 从旧版本升级时会自动迁移localStorage中的数据

### 分享插件

要分享插件给其他人，只需要复制以下三个核心文件：
- `main.js`
- `styles.css` 
- `manifest.json`

**不要复制** `plugin-data.json` 文件，这样其他人获得的就是一个干净的初始状态插件。

### 重置到初始状态

如果需要将插件重置为初始状态，可以：

1. **通过命令**: 使用命令面板搜索"重置插件数据"
2. **删除数据文件**: 直接删除 `plugin-data.json` 文件
3. **通过设置界面**: 在插件设置页面点击"重置设置"按钮

### 调试命令

插件提供了以下调试命令：

- **调试AI配置**: 输出当前模型配置到控制台
- **调试数据状态**: 输出完整的数据状态信息
- **重置插件数据**: 将所有数据重置为默认值

### 数据迁移

插件会自动检测并迁移旧版本的数据：

1. 检查localStorage中是否有旧的模型配置
2. 将旧数据迁移到新的数据文件中
3. 对API密钥进行编码存储
4. 清理localStorage中的旧数据

### 注意事项

1. 删除 `plugin-data.json` 文件后，插件会自动创建新的默认配置文件
2. API密钥会自动编码存储，但在内存中使用时会自动解码
3. 所有设置更改都会立即保存到数据文件中
4. 数据文件使用JSON格式，具有良好的可读性和可编辑性

### 开发者说明

如果您是开发者，可以通过以下方式访问数据管理器：

```typescript
// 获取数据管理器
const dataManager = plugin.dataManager;

// 读取设置
const settings = dataManager.getSettings();

// 更新设置
await dataManager.updateSettings({ autoCommit: true });

// 获取所有模型
const models = dataManager.getAllModels();

// 添加新模型
const modelId = await dataManager.addModel({
    displayName: "My Model",
    modelName: "gpt-4",
    provider: "openai",
    baseURL: "https://api.openai.com/v1",
    apiKey: "sk-...",
    maxContextTokens: 32000,
    maxOutputTokens: 4000
});
```

数据管理器提供了完整的CRUD操作接口，支持设置管理、模型配置管理和个性化偏好设置。
