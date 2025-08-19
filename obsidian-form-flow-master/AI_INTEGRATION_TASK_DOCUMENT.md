# AI集成任务文档

## 项目概述
为Obsidian Form Flow插件添加AI调用功能，包括AI模型管理界面、AI模型列表变量和AI调用提交动作。

## 任务分解

### 第一阶段：AI模型管理数据结构和加密系统

#### 1.1 创建AI模型配置接口和类型定义
- **文件**: `src/model/ai/AIModelConfig.ts`
- **内容**: 
  - AI模型配置接口 `IAIModelConfig`
  - AI提供商枚举 `AIProvider`
  - 高级设置接口 `IAdvancedSettings`

#### 1.2 创建AI设置存储和加密服务
- **文件**: `src/service/ai/AISettingsService.ts`
- **内容**:
  - AI配置数据加密/解密
  - 配置文件读写
  - API密钥安全存储

#### 1.3 更新插件设置结构
- **文件**: `src/settings/PluginSettings.ts`
- **更新**: 添加AI相关设置字段
  - `aiSettings: IAISettings`
  - `promptTemplateFolder: string`
  - `enableSystemPrompt: boolean`
  - `systemPrompt: string`

### 第二阶段：AI设置界面开发

#### 2.1 创建AI设置主界面组件
- **文件**: `src/settings/ai/AISettingTabItem.tsx`
- **功能**:
  - AI模型管理标题和添加按钮
  - 模型列表折叠展示
  - 提示模板目录设置
  - 用户系统提示设置

#### 2.2 创建AI模型配置模态框
- **文件**: `src/component/modal/AIModelConfigModal.tsx`
- **功能**:
  - 模型基本信息配置表单
  - AI提供商选择下拉框
  - 高级设置切换和参数配置
  - 模型验证功能

#### 2.3 创建AI模型列表组件
- **文件**: `src/component/ai/AIModelList.tsx`
- **功能**:
  - 展示已配置模型列表
  - 模型编辑和删除操作
  - 模型功能状态显示

#### 2.4 更新设置标签页
- **文件**: `src/settings/PluginSettingTab.tsx`
- **更新**: 添加AI设置标签页到Tab组件

### 第三阶段：AI模型列表表单变量

#### 3.1 创建AI模型列表字段类型
- **文件**: `src/model/field/AIModelListField.ts`
- **内容**:
  - 扩展IFormField接口
  - AI模型选择相关属性

#### 3.2 更新表单字段类型枚举
- **文件**: `src/model/enums/FormFieldType.ts`
- **更新**: 添加 `AI_MODEL_LIST` 类型

#### 3.3 创建AI模型列表字段编辑组件
- **文件**: `src/view/edit/setting/field/AIModelListFieldSetting.tsx`
- **功能**:
  - 启用AI模型列表选项
  - 自定义值设置
  - 模型预选择

#### 3.4 创建AI模型列表渲染组件
- **文件**: `src/view/preview/field/AIModelListFieldView.tsx`
- **功能**:
  - 运行时模型选择下拉框
  - 与AI调用动作的集成

### 第四阶段：AI调用提交动作

#### 4.1 创建AI调用动作类型和接口
- **文件**: `src/model/action/AICallFormAction.ts`
- **内容**:
  - 扩展IFormAction接口
  - 提示词设置选项
  - 输出变量配置

#### 4.2 更新FormActionType枚举
- **文件**: `src/model/enums/FormActionType.ts`
- **更新**: 添加 `AI_CALL = "aiCall"`

#### 4.3 创建AI调用动作设置组件
- **文件**: `src/view/edit/setting/action/AICallActionSetting.tsx`
- **功能**:
  - 提示词设置（内置模板/自定义）
  - 模板文件选择
  - 输出变量名设置

#### 4.4 创建AI调用执行服务
- **文件**: `src/service/action/AICallActionService.ts`
- **功能**:
  - AI API调用逻辑
  - 提示词变量替换
  - 结果存储到输出变量

#### 4.5 更新动作类型选择器
- **文件**: `src/view/edit/setting/action/common/ActionTypeSelect.tsx`
- **更新**: 添加AI调用动作选项

### 第五阶段：AI服务集成

#### 5.1 创建AI API客户端
- **文件**: `src/service/ai/AIApiClient.ts`
- **功能**:
  - 支持多个AI提供商的API调用
  - 统一的请求/响应处理
  - 错误处理和重试机制

#### 5.2 创建提示词模板服务
- **文件**: `src/service/ai/PromptTemplateService.ts`
- **功能**:
  - 模板文件加载
  - 变量替换处理
  - 模板验证

#### 5.3 创建AI模型验证服务
- **文件**: `src/service/ai/AIModelValidationService.ts`
- **功能**:
  - 模型连接测试
  - 功能检测（推理、联网等）
  - 配置验证

### 第六阶段：国际化和样式

#### 6.1 更新语言文件
- **文件**: `src/i18n/zh.ts`, `src/i18n/en.ts`
- **内容**: 添加AI相关的所有文本

#### 6.2 创建AI组件样式
- **文件**: `src/style/ai.css`
- **内容**: AI设置界面和组件的样式定义

### 第七阶段：集成和测试

#### 7.1 更新主插件类
- **文件**: `src/main.ts`
- **更新**: 初始化AI服务

#### 7.2 更新动作执行链
- **文件**: `src/service/action/ActionChain.ts`
- **更新**: 集成AI调用动作服务

#### 7.3 更新表单服务
- **文件**: `src/service/FormService.ts`
- **更新**: 支持AI模型变量和输出变量

## 文件创建清单

### 新增文件 (26个)
1. `src/model/ai/AIModelConfig.ts`
2. `src/model/ai/AISettings.ts`
3. `src/service/ai/AISettingsService.ts`
4. `src/service/ai/AIApiClient.ts`
5. `src/service/ai/PromptTemplateService.ts`
6. `src/service/ai/AIModelValidationService.ts`
7. `src/settings/ai/AISettingTabItem.tsx`
8. `src/component/modal/AIModelConfigModal.tsx`
9. `src/component/ai/AIModelList.tsx`
10. `src/component/ai/AIProviderSelect.tsx`
11. `src/component/ai/AdvancedSettings.tsx`
12. `src/model/field/AIModelListField.ts`
13. `src/view/edit/setting/field/AIModelListFieldSetting.tsx`
14. `src/view/preview/field/AIModelListFieldView.tsx`
15. `src/model/action/AICallFormAction.ts`
16. `src/view/edit/setting/action/AICallActionSetting.tsx`
17. `src/service/action/AICallActionService.ts`
18. `src/component/ai/PromptTypeSelect.tsx`
19. `src/component/ai/TemplateFileSelect.tsx`
20. `src/utils/ai/VariableReplacer.ts`
21. `src/utils/ai/AIProviderConfig.ts`
22. `src/utils/ai/Encryption.ts`
23. `src/style/ai.css`
24. `src/hooks/useAIModelValidation.ts`
25. `src/hooks/usePromptTemplate.ts`
26. `src/context/aiContext.tsx`

### 修改文件 (12个)
1. `src/settings/PluginSettings.ts`
2. `src/settings/PluginSettingTab.tsx`
3. `src/model/enums/FormFieldType.ts`
4. `src/model/enums/FormActionType.ts`
5. `src/view/edit/setting/action/common/ActionTypeSelect.tsx`
6. `src/service/action/ActionChain.ts`
7. `src/service/FormService.ts`
8. `src/main.ts`
9. `src/i18n/zh.ts`
10. `src/i18n/en.ts`
11. `src/hooks/useActionTypeStyle.tsx`
12. `src/utils/getActionSummary.ts`

## 关键技术要点

### 1. 数据安全
- API密钥使用AES加密存储
- 密钥派生使用PBKDF2
- 配置文件不包含明文敏感信息

### 2. AI提供商支持
- DeepSeek: `https://api.deepseek.com`
- 智谱: `https://open.bigmodel.cn/api/paas`
- 通义千问: `https://dashscope.aliyuncs.com/api`
- 硅基流动: `https://api.siliconflow.cn`
- Openrouter: `https://openrouter.ai/api`
- 自定义模型: 用户输入URL

### 3. 变量系统扩展
- 支持表单变量在提示词中的引用: `{{fieldName}}`
- 支持输出变量的引用: `{{output:variableName}}`
- 支持AI模型变量的自动注入

### 4. 模板系统
- 支持从指定目录加载.md模板文件
- 模板中可使用表单变量
- 支持系统提示词的全局配置

## 开发优先级
1. **高优先级**: 数据结构、基础服务、AI设置界面
2. **中优先级**: AI调用动作、模型列表变量
3. **低优先级**: 样式优化、错误处理、测试

## 预期完成时间
- 第一阶段: 1天
- 第二阶段: 2天  
- 第三阶段: 1天
- 第四阶段: 2天
- 第五阶段: 2天
- 第六阶段: 1天
- 第七阶段: 1天

**总计**: 10天工作量

## 测试计划
1. AI模型配置和验证测试
2. 提示词变量替换测试
3. 多个AI提供商API调用测试
4. 表单集成和数据流测试
5. 安全性和加密测试
