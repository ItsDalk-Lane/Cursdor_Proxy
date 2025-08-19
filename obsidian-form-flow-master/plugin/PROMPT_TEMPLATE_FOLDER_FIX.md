# 提示模板目录问题修复说明

## 问题根源分析

### 发现的问题
1. **双重设置系统冲突**：
   - `ai-settings.json` - AISettingsService管理的独立设置文件
   - `data.json` - 主插件管理的设置文件，包含默认的AI设置

2. **具体冲突流程**：
   ```
   用户修改提示模板目录 → aiSettingsService.updatePromptTemplateFolder() 
   → 保存到 ai-settings.json ✅
   → 用户离开设置界面 → 主插件重新加载设置 
   → loadSettings() 用 DEFAULT_SETTINGS 覆盖 → 目录重置为 "form/prompts" ❌
   ```

3. **文件内容对比**：
   - `ai-settings.json`: 包含用户实际设置
   - `data.json`: aiSettings部分始终是默认值

## 修复方案

### 1. 修改主插件加载逻辑 (`main.ts`)
```typescript
async loadSettings() {
    // 先加载主插件设置
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());

    // 然后同步AI设置，用实际设置覆盖默认值
    try {
        const aiSettingsService = new AISettingsService(this.app);
        const aiSettings = await aiSettingsService.loadSettings();
        this.settings.aiSettings = aiSettings; // 关键修复
    } catch (error) {
        console.warn('同步AI设置失败，使用默认值:', error);
    }
}
```

### 2. 移除冲突的同步逻辑 (`AISettingTabItem.tsx`)
- 移除了会导致循环更新的 useEffect
- AI设置完全由 AISettingsService 管理
- 主插件在启动时自动同步这些设置

### 3. 添加立即更新机制
- 在设置更改时立即更新主插件内存中的设置
- 确保设置更改立即生效

## 测试验证

### 测试步骤
1. 在AI设置界面修改提示模板目录
2. 离开设置界面
3. 重新进入设置界面
4. 验证目录是否保持用户设置的值

### 预期结果
- ✅ 提示模板目录设置能够正确保存
- ✅ 离开设置界面后设置不会被重置
- ✅ 重启插件后设置依然保持

## 技术细节

### 设置优先级
1. **AI设置文件** (`ai-settings.json`) - 最高优先级，用户实际设置
2. **主插件设置** (`data.json`) - 其他插件设置，AI部分作为缓存

### 同步机制
- 启动时：主插件从AI设置文件同步设置
- 运行时：设置更改立即同步到内存
- 保存时：只通过AISettingsService保存，避免冲突

### 调试信息
添加了详细的console.log，可以在浏览器控制台查看：
- 设置加载过程
- 目录更新操作
- 同步状态

## 部署状态
✅ 修复已应用到：`C:\Code\Obsidian沙箱仓库\.obsidian\plugins\form-flow\`

现在可以测试提示模板目录设置功能了！
