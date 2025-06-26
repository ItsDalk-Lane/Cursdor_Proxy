# AI模型便捷调用Python包

这个Python包提供了一个简单统一的接口，用于调用多种流行的大语言模型API，包括OpenAI、智谱AI、DeepSeek和阿里千问等。

## 功能特性

- 支持多个主流大模型提供商
- 统一的调用接口，简化开发流程
- 支持单次调用和连续对话模式
- 自动处理API错误和重试
- 支持配置文件管理API密钥和提示词模板
- 对话历史自动保存

## 安装方法

1. 克隆本仓库到本地

```bash
git clone https://e.coding.net/g-yupx8159/obsidianbijibeifen/Python_Bag.git
cd Python_Bag
```

2. 安装依赖包和开发模式安装

```bash
pip install -r requirements.txt
```

## 快速开始

### 1. 配置文件设置

首先，在项目根目录下创建或编辑`ai_caller_config.yaml`文件，填入你的API密钥：

```yaml
api_keys:
  openai: "sk-你的OpenAI密钥"
  zhipuai: "你的智谱AI密钥"
  deepseek: "你的DeepSeek密钥"
  aliqwen: "你的阿里千问API密钥"
```

### 2. 基本调用示例

```python
from AI_caller.ai_caller import AICaller

# 初始化调用器
ai = AICaller()

# 调用OpenAI模型
response, dialog_id, tokens = ai.openai().invoke(
    model_type='gpt-3.5-turbo',
    prompt_id='翻译为英文',
    call_mode='single_response',
    data='这是一段需要翻译的中文文本'
)

print(f"翻译结果: {response}")
print(f"对话ID: {dialog_id}")
print(f"消耗的tokens: {tokens}")
```

### 3. 连续对话示例

```python
# 初始化调用器
ai = AICaller()

# 开始连续对话
response1, dialog_id, tokens1 = ai.openai().invoke(
    model_type='gpt-3.5-turbo',
    prompt_id='知识问答',
    call_mode='continuous_dialogue',
    data='什么是人工智能？'
)

print(f"回答1: {response1}")

# 继续同一个对话
response2, dialog_id, tokens2 = ai.openai().invoke(
    model_type='gpt-3.5-turbo',
    prompt_id='知识问答',
    call_mode='continuous_dialogue',
    data='它与机器学习有什么关系？'
)

print(f"回答2: {response2}")

# 结束对话
ai.openai().end_dialogue()
```

### 4. 使用不同的提供商

```python
# 智谱AI调用
response, dialog_id, tokens = ai.zhipuai().invoke(
    model_type='glm-4',
    prompt_id='代码审查',
    call_mode='single_response',
    data='def add(a, b): return a + b'
)

# DeepSeek调用
response, dialog_id, tokens = ai.deepseek().invoke(
    model_type='deepseek-chat',
    prompt_id='总结文本',
    call_mode='single_response',
    data='这是一段需要总结的长文本...'
)

# 阿里千问调用
response, dialog_id, tokens = ai.aliqwen().invoke(
    model_type='qwen-turbo-latest',
    prompt_id='格式化JSON',
    call_mode='single_response',
    data='{"name":"张三", "age":30, "city":"北京"}'
)
```

### 5. 测试API连接

```python
# 测试OpenAI API连接
connection_ok, message = ai.test_connection('openai', 'gpt-3.5-turbo')
print(f"连接状态: {connection_ok}")
print(f"连接信息: {message}")
```

### 6. 查看可用资源

```python
# 列出配置文件中的所有提示词ID
prompts = ai.list_prompts()
print(f"可用提示词: {prompts}")

# 列出特定提供商的可用模型
openai_models = ai.list_models('openai')
print(f"OpenAI可用模型: {openai_models}")
```

## 使用工厂函数

如果你喜欢更直接的方式，也可以使用工厂函数来创建提供商实例：

```python
from AI_caller.ai_caller import create_provider

# 创建OpenAI提供商
openai = create_provider('openai')

# 直接调用
response, dialog_id, tokens = openai.invoke(
    model_type='gpt-3.5-turbo',
    prompt_id='翻译为英文',
    call_mode='single_response',
    data='这是一段需要翻译的文本'
)
```

## 错误处理

```python
from AI_caller.ai_caller import AICaller, AICallerAPIError, AICallerConfigError, AICallerInputError

ai = AICaller()

try:
    response, dialog_id, tokens = ai.openai().invoke(
        model_type='gpt-3.5-turbo',
        prompt_id='翻译为英文',
        call_mode='single_response',
        data='这是一段需要翻译的文本'
    )
except AICallerConfigError as e:
    print(f"配置错误: {e}")
except AICallerAPIError as e:
    print(f"API调用错误: {e}")
except AICallerInputError as e:
    print(f"输入参数错误: {e}")
```

## 自定义提示词模板

你可以在`ai_caller_config.yaml`文件中添加自定义的提示词模板：

```yaml
prompts:
  我的自定义提示:
    content: "这是我的自定义提示模板: {data}"
```

然后在代码中使用这个提示词ID：

```python
response, dialog_id, tokens = ai.openai().invoke(
    model_type='gpt-3.5-turbo',
    prompt_id='我的自定义提示',
    call_mode='single_response',
    data='要处理的数据'
)
```

## 扩展支持的模型

如果你需要添加新的模型提供商，可以参考现有的提供商类实现。基本步骤包括：

1. 创建一个继承自`BaseProvider`的新类
2. 实现`_make_api_call`方法处理API调用
3. 实现`invoke`方法提供统一的调用接口
4. 在`AICaller`类中添加对应的快捷方法
5. 在`create_provider`函数中添加对应的分支

## 许可证

[MIT](LICENSE)
