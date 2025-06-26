---
tags: 
date: 2025-05-11
---
# 通用AI大模型的Python调用方法综合研究

## 1. 概述

### 1.1 研究背景与目的

近年来，通用人工智能（AGI）大模型取得了显著进展，并在自然语言处理、代码生成、图像理解等多个领域展现出强大能力。国内外众多科技企业和研究机构纷纷推出各自的大模型平台，并通过API（应用程序编程接口）或SDK（软件开发工具包）的形式向开发者开放。然而，各平台API在设计、认证、调用流程及功能参数上存在差异，给开发者在选择、集成和切换不同模型时带来了挑战。

本研究旨在全面梳理并系统比较国内外主流通用AI大模型的Python调用方法。通过深入分析各平台的API接口特点、调用流程、关键参数、高级功能及错误处理机制，结合代码示例和最佳实践，为Python开发者提供一份结构清晰、实用性强的技术参考文档。本文档致力于帮助开发者快速理解并掌握不同大模型的调用方式，优化开发效率，降低集成成本，并为跨平台模型应用提供技术支持。

### 1.2 研究范围与方法

本研究覆盖了国内外主流的通用AI大模型，包括国内的千问（阿里巴巴）、智谱GLM（智谱AI）、文心一言（百度千帆）、百川（百川智能）、DeepSeek系列模型，以及国外的ChatGPT系列（OpenAI）、Claude系列（Anthropic）、Grok（xAI）、Gemini系列（Google）、Llama系列（Meta）。技术范围聚焦于Python编程环境下的API调用方法，涵盖截至研究时间点的最新API版本。

研究方法主要包括：

1. 收集并研读各大模型提供商发布的官方API文档、SDK文档及技术博客。
2. 实际注册并测试各平台API的调用过程，包括环境配置、认证、基础调用、参数调整及高级功能使用。
3. 构建统一的比较分析框架，从易用性、功能性、稳定性、成本等多个维度对比各平台API的异同点。
4. 编写标准化的Python代码示例，确保其完整可运行，并覆盖典型应用场景。
5. 总结开发者在实际应用中可能遇到的常见问题，并提供相应的解决方案和最佳实践。

### 1.3 文档结构

本文档结构如下：

- **概述**：介绍研究背景、目的、范围及方法。
- **环境准备**：通用Python环境配置及依赖安装建议。
- **模型调用核心特性对比表**：简明扼要地对比各模型API的关键特性。
- **详细调用指南**：按模型提供商分章节详述，每章节包含模型概述、API接入、SDK安装配置、基础调用、异步与流式、核心参数、高级功能（如函数调用）、错误处理及代码示例。
- **跨平台集成方案探讨**：讨论在同一项目中灵活切换和管理不同模型API的策略。
- **开发者最佳实践与优化建议**：总结API调用中的通用最佳实践和优化技巧。
- **总结与展望**：回顾主要发现，展望未来趋势。
- **附录**：包含术语表、官方资源链接等。

## 2. 环境准备

### 2.1 Python环境配置

建议使用Python 3.8或更高版本进行开发，以确保对各平台最新SDK的兼容性。使用虚拟环境（如`venv`或`conda`）是管理项目依赖、避免包版本冲突的推荐做法 1。

创建并激活`venv`虚拟环境的通用步骤如下：

1. 创建虚拟环境（例如，命名为`.venv`）：
    
    Bash
    
    ```
    python -m venv.venv
    ```
    
    或在某些系统上使用 `python3`：
    
    Bash
    
    ```
    python3 -m venv.venv
    ```
    
2. 激活虚拟环境：
    
    - Windows系统：
    
    .venv\Scripts\activate ```
    - macOS或Linux系统：
        
        Bash
        
        ```
        source.venv/bin/activate
        ```
        

### 2.2 通用依赖库

虽然各模型的SDK有其特定依赖，但一些通用库在与AI大模型API交互时非常有用：

- `requests`: 用于直接进行HTTP API调用（如果SDK不可用或不适用）。
- `python-dotenv`: 用于从`.env`文件加载环境变量，如API密钥，避免硬编码敏感信息 3。
- `asyncio`: Python标准库，用于支持异步编程，对于并发API调用非常重要。
- `aiohttp`: 异步HTTP客户端，常与`asyncio`配合使用。

### 2.3 API密钥管理

几乎所有大模型API都依赖API密钥进行认证。安全管理API密钥至关重要：

1. **环境变量**：将API密钥存储在环境变量中是最常见的推荐做法 3。例如，设置`OPENAI_API_KEY`、`DASHSCOPE_API_KEY`、`ZHIPUAI_API_KEY`等。
2. **配置文件/Secrets Management**: 对于更复杂的应用或生产环境，应考虑使用专门的配置文件管理工具或云服务提供商的密钥管理服务（如AWS Secrets Manager, Azure Key Vault, Google Secret Manager）。
3. **避免硬编码**: 绝对不要将API密钥直接写入代码库中 3。

## 3. 模型调用核心特性对比表

下表概述了本报告研究范围内各大模型API的核心特性。详细信息将在后续各模型专属章节中展开。

|   |   |   |   |   |   |   |   |   |   |   |
|---|---|---|---|---|---|---|---|---|---|---|
|**特性**|**千问 (DashScope)**|**智谱 GLM (ZhipuAI)**|**文心一言 (Qianfan)**|**百川 (DashScope)**|**DeepSeek**|**ChatGPT (OpenAI)**|**Claude (Anthropic)**|**Grok (xAI)**|**Gemini (Google)**|**Llama (Meta API)**|
|**主要API架构**|REST, SDK|REST, SDK|REST, SDK|REST, SDK|REST (OpenAI兼容)|REST, SDK|REST, SDK|REST (OpenAI兼容)|REST, SDK|REST, SDK|
|**Python SDK**|`dashscope`|`zhipuai`|`qianfan`|`dashscope`|`openai` (兼容)|`openai`|`anthropic`|`openai` (兼容)|`google-genai`|`llama-api-client`|
|**身份验证**|API Key|API Key|AK/SK, OAuth|API Key|API Key|API Key|API Key|API Key|API Key|API Key|
|**OpenAI兼容性**|是 (部分) 1|计划中/部分 10|否 (但Zenlayer等第三方网关可提供兼容层) 11|是 (通过DashScope)|是 12|原生|是 (部分) 13|是 14|否|否|
|**异步调用 (SDK)**|待查证原生支持 [Insight 4.1.1]|是 (`asyncCompletions`) 15|是 (`ado`, `arequest`) 16|待查证原生支持|是 (OpenAI SDK) 12|是 (`AsyncOpenAI`) 9|是 (`AsyncAnthropic`) 18|是 (OpenAI SDK)|是 (`aio.models`) 19|是 (`AsyncLlamaAPIClient`) 8|
|**流式输出 (SDK)**|是 (`stream=True`)|是 (`stream=True`)|是 (`stream=True`) 20|是 (`stream=True`)|是 (OpenAI SDK) 12|是 (`stream=True`) 9|是 (`stream=True`) 21|是 (OpenAI SDK)|是 (`streamGenerateContent`, `generate_content_stream`) 19|是 (`stream=True`) 8|
|**函数调用/工具使用**|支持 23|支持 (`tools`) 24|支持 (ERNIE 4.0)|依赖DashScope模型|支持 (`tools`) 25|支持 (`tools`) 26|支持 (`tools`) 18|支持 (`tools`) 27|支持 (`tools`) 22|支持 (`tools`) 29|
|**多模态能力 (API)**|图/文/音/视频 23|图/音/视频 (GLM-4V, GLM-4-Voice) 30|图/文 (部分模型)|依赖DashScope模型|图/文 (部分模型)|图/文/音 (GPT-4o等) 32|图/文 33|图/文 (Grok-2 Vision) 34|图/文/音/视频 22|图/文 (Llama 4) 35|
|**主要计费单位**|Tokens|Tokens|Tokens|Tokens|Tokens|Tokens|Tokens|Tokens|Tokens, Characters|Tokens|
|**官方文档质量**|良好|良好|良好|(DashScope)|良好|优秀|优秀|一般|优秀|良好|

_注：上表基于截至研究时间点的信息，具体功能和支持情况可能随API版本更新而变化。“待查证原生支持”表示在提供的材料中未找到明确的Python原生SDK异步调用示例。_

## 4. 详细调用指南

本章节将分别详细介绍各个主流AI大模型的Python API调用方法。

---

### 4.1 千问 (Qwen) - 阿里云灵积平台 (DashScope)

- A. Provider Overview and Key Model Variants:
    
    阿里云灵积平台（DashScope）提供了通义千问（Qwen）系列模型，包括文本生成模型（如 qwen-turbo, qwen-plus, qwen-max, qwen-long）、视觉理解模型（qwen-vl-plus, qwen-vl-max）、音频理解模型（qwen-audio-turbo）以及代码生成、数学等专用模型 1。这些模型支持广泛的应用场景。
    
- **B. API Access Setup**:
    
    1. 注册阿里云账号并在阿里云官网完成实名认证 3。
    2. 访问DashScope控制台，开通模型服务（如百炼 Model Studio）1。
    3. 在DashScope控制台或百炼平台的API-KEY管理页面创建并获取API Key 1。建议选择“主账号空间”创建API Key 1。
- **C. Python SDK: Installation and Environment Configuration**:
    
    - **DashScope SDK (原生)**:
        
        Bash
        
        ```
        pip install dashscope --upgrade -i https://pypi.tuna.tsinghua.edu.cn/simple
        ```
        
        3
    - **OpenAI-Compatible SDK**: DashScope也提供OpenAI兼容的API接口，因此可以使用OpenAI的Python SDK进行调用。
        
        Bash
        
        ```
        pip install openai --upgrade
        ```
        
        1
    - **API Key配置**: 推荐将API Key设置为环境变量`DASHSCOPE_API_KEY` 1。
        
        Bash
        
        ```
        export DASHSCOPE_API_KEY="YOUR_DASHSCOPE_API_KEY"
        ```
        
        或者在代码中通过`api_key`参数传递。
- **D. Foundational API Call (Synchronous)**:
    
    - **Minimal Runnable Code Example (DashScope SDK)**:
        
        Python
        
        ```
        import os
        from http import HTTPStatus
        import dashscope
        
        # 确保 DASHSCOPE_API_KEY 已设置在环境变量中
        # 或在 call 方法中传递 api_key='YOUR_DASHSCOPE_API_KEY'
        
        def call_qwen_sync():
            messages = [
                {'role': 'system', 'content': 'You are a helpful assistant.'},
                {'role': 'user', 'content': '请介绍一下通义千问'}
            ]
            response = dashscope.Generation.call(
                model=dashscope.Generation.Models.qwen_turbo, # 或者 'qwen-turbo'
                messages=messages,
                result_format='message' # 获取结构化的消息响应
            )
            if response.status_code == HTTPStatus.OK:
                print("Request ID:", response.request_id)
                print("Output:", response.output.choices.message.content)
                print("Usage:", response.usage)
            else:
                print(f"Request failed!")
                print(f"Request ID: {response.request_id}")
                print(f"Status Code: {response.status_code}")
                print(f"Error Code: {response.code}")
                print(f"Error Message: {response.message}")
        
        if __name__ == '__main__':
            call_qwen_sync()
        ```
        
        此示例基于 1 构建。
        
    - **Minimal Runnable Code Example (OpenAI-Compatible API)**:
        
        Python
        
        ```
        import os
        from openai import OpenAI
        
        # 确保 DASHSCOPE_API_KEY 已设置为环境变量 OPENAI_API_KEY 
        # 或者直接传递 api_key
        # 或者设置 DASHSCOPE_API_KEY 并在代码中使用它
        
        client = OpenAI(
            api_key=os.environ.get("DASHSCOPE_API_KEY"), # 或者您的特定密钥
            base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
        )
        
        def call_qwen_openai_sync():
            chat_completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": "请用Python写一个快速排序算法"},
                ],
                model="qwen-plus", # 使用兼容端点支持的Qwen模型名称
            )
            print(chat_completion.choices.message.content)
        
        if __name__ == '__main__':
            call_qwen_openai_sync()
        ```
        
        此示例基于 1 中关于使用OpenAI SDK调用Qwen的描述。
        
- E. Asynchronous API Calls:
    
    阿里云DashScope的文档 23 在描述Qwen API的消息结构时提到了“异步调用”，但这些上下文主要指的是API请求体参数的配置，并未直接提供使用Python async/await语法的SDK执行示例。基础调用文档 1 也主要集中于同步示例。
    
    这种表述可能暗示了API某些操作（如提交批量处理任务）的非阻塞特性，而非针对单次补全请求的`asyncio`风格的并发调用。如果开发者需要在高并发场景下使用DashScope原生SDK，可能需要自行管理线程，或依赖OpenAI兼容端点（如果其底层实现或OpenAI SDK本身能更好地处理异步）。若原生SDK的异步支持有限，可能会促使开发者在需要高I/O并发的应用中转向OpenAI兼容接口，但这可能意味着无法利用某些原生SDK特有的功能或优化。对DashScope Python SDK的`asyncio`支持程度，需要查阅其GitHub仓库或更详尽的官方文档（当前材料中 2 为通用SDK安装/仓库链接，101 为不可访问的示例链接）。
    
    若使用OpenAI SDK及兼容端点，异步调用将遵循标准的OpenAI异步模式：
    
    Python
    
    ```
    import os
    import asyncio
    from openai import AsyncOpenAI
    
    client = AsyncOpenAI(
        api_key=os.environ.get("DASHSCOPE_API_KEY"),
        base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
    )
    
    async def call_qwen_openai_async():
        chat_completion = await client.chat.completions.create(
            messages=,
            model="qwen-plus",
        )
        print(chat_completion.choices.message.content)
    
    if __name__ == '__main__':
        asyncio.run(call_qwen_openai_async())
    ```
    
- F. Streaming Responses:
    
    DashScope SDK支持流式输出。通常通过在call方法中设置stream=True并迭代响应来实现。
    
    - **Minimal Runnable Code Example (DashScope SDK Streaming)**:
        
        Python
        
        ```
        import os
        from http import HTTPStatus
        import dashscope
        
        def call_qwen_stream():
            messages = [
                {'role': 'system', 'content': 'You are a helpful assistant.'},
                {'role': 'user', 'content': '给我讲一个关于旅行的短故事'}
            ]
            responses = dashscope.Generation.call(
                model=dashscope.Generation.Models.qwen_turbo,
                messages=messages,
                result_format='message',
                stream=True,  # 启用流式输出
                incremental_output=True  # 仅输出增量变化
            )
            full_content = ""
            print("Streamed Response: ", end='')
            for response in responses:
                if response.status_code == HTTPStatus.OK:
                    content = response.output.choices.message.content
                    full_content += content
                    print(content, end='', flush=True)
                else:
                    print(f"\nRequest failed! Request ID: {response.request_id}, Status Code: {response.status_code}, Error Code: {response.code}, Error Message: {response.message}")
                    break
            print("\nFull streamed response after completion:", full_content)
            if response.status_code == HTTPStatus.OK: # Print usage after successful stream
                 print("Usage:", response.usage)
        
        
        if __name__ == '__main__':
            call_qwen_stream()
        ```
        
        此示例基于通用流式模式和DashScope常见的`incremental_output`参数合成。提供的材料 1 主要覆盖安装、非流式调用或异步概念，缺乏Python代码的直接流式示例。
        
    - 若使用OpenAI SDK及兼容端点，流式输出遵循标准的OpenAI流式模式：
        
        Python
        
        ```
        import os
        from openai import OpenAI
        
        client = OpenAI(
            api_key=os.environ.get("DASHSCOPE_API_KEY"),
            base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
        )
        
        def call_qwen_openai_stream():
            stream = client.chat.completions.create(
                messages=[
                    {"role": "user", "content": "给我讲一个关于旅行的短故事"},
                ],
                model="qwen-plus",
                stream=True,
            )
            full_content = ""
            print("Streamed Response: ", end='')
            for chunk in stream:
                if chunk.choices and chunk.choices.delta and chunk.choices.delta.content:
                    content_piece = chunk.choices.delta.content
                    full_content += content_piece
                    print(content_piece, end="", flush=True)
            print("\nFull streamed response after completion:", full_content)
        
        if __name__ == '__main__':
            call_qwen_openai_stream()
        ```
        
- **G. Mastering Core Parameters & Advanced Features**:
    
    - **Essential Parameters** 43:
        
        - `model`: 指定调用的模型，如 `qwen-turbo`, `qwen-plus`。
        - `messages`: 对话消息列表。
        - `temperature`: 控制随机性，范围 `[0, 2)`。默认值因模型而异（例如 `qwen-turbo/plus/max` 为0.7）。
        - `top_p`: 核采样参数，范围 `(0, 1.0]`。默认值因模型而异（例如 `qwen-turbo/plus/max` 为0.8）。
        - `max_tokens` (或 `max_length` for some DashScope models/SDK versions): 生成响应的最大token数。默认值为模型的最大输出长度。
        - `seed`: (可选) 整数，用于可复现输出（尽力而为）。
        - `stop`: (可选) 字符串或字符串列表，指定停止生成的序列。
        - `presence_penalty`, `frequency_penalty`: (可选) 分别控制新主题的引入和重复短语的抑制。
        - `result_format`: (可选) 'message' 或 'text'，指定输出格式。
        - `enable_search`: (可选) 布尔值，部分模型支持，指示是否启用搜索增强。
        - `incremental_output`: (可选) 布尔值，流式输出时，控制是输出增量还是全量。
        - 示例:
            
            Python
            
            ```
            response = dashscope.Generation.call(
                model='qwen-plus',
                messages=[{'role': 'user', 'content': '写一首关于春天的诗'}],
                temperature=0.9,
                top_p=0.8,
                max_tokens=150, # 在DashScope原生SDK中，此参数可能名为 'max_length' 或通过 'parameters' 字典传递
                seed=42,
                stop=['\n\n'],
                result_format='message'
            )
            #... 处理响应
            ```
            
    - System Prompts and Role Management:
        
        在 messages 列表中，将第一条消息的角色设置为 system，内容为对模型的指示 3。例如：
        
        {'role': 'system', 'content': '你是一个乐于助人的AI助手。'}
        
    - Managing Multi-Turn Conversations:
        
        通过在每次API请求的 messages 列表中包含完整的对话历史（用户和助手的交替发言）来维持上下文 3。
        
        Python
        
        ```
        # Turn 1
        messages = [
            {'role': 'system', 'content': '你是一个专业的旅行顾问。'},
            {'role': 'user', 'content': '推荐一个适合夏天度假的地方。'}
        ]
        # response = dashscope.Generation.call(model='qwen-plus', messages=messages, result_format='message')
        # assistant_response_content = response.output.choices.message.content
        # messages.append({'role': 'assistant', 'content': assistant_response_content})
        
        # Turn 2
        # messages.append({'role': 'user', 'content': '那里有什么好玩的活动吗？'})
        # response = dashscope.Generation.call(model='qwen-plus', messages=messages, result_format='message')
        #...
        ```
        
    - Function Calling / Tool Integration:
        
        DashScope Qwen模型支持函数调用或工具使用。当通过OpenAI兼容接口调用或在原生SDK中使用特定参数时，可以实现此功能。消息结构包含来自助手的 tool_calls 和用户提供的 tool 角色消息（用于返回工具输出）23。一个工具调用通常包含 id, type: 'function', 以及 function: {'name': '函数名', 'arguments': 'JSON字符串格式的参数'} 23。
        
        以下为使用OpenAI SDK调用Qwen兼容端点实现函数调用的概念性示例：
        
        Python
        
        ```
        # 使用 OpenAI SDK 调用 Qwen 的兼容端点
        # client = OpenAI(api_key=os.environ.get("DASHSCOPE_API_KEY"), base_url="https://dashscope.aliyuncs.com/compatible-mode/v1")
        # messages = [{"role": "user", "content": "查询北京今天的天气怎么样？"}]
        # tools =},
        #                 },
        #                 "required": ["location"],
        #             },
        #         },
        #     }
        # ]
        # response = client.chat.completions.create(
        #     model="qwen-plus", # 确保模型支持函数调用
        #     messages=messages,
        #     tools=tools,
        #     tool_choice="auto",  # 或指定特定函数
        # )
        # message_content = response.choices.message
        # if message_content.tool_calls:
        #     tool_call = message_content.tool_calls
        #     function_name = tool_call.function.name
        #     function_args = json.loads(tool_call.function.arguments)
        #     #... 根据 function_name 和 function_args 执行本地函数...
        #     # function_response_content =... (本地函数执行结果)
        #     # messages.append(message_content) # 添加模型的回复（包含tool_calls）
        #     # messages.append({
        #     #     "tool_call_id": tool_call.id,
        #     #     "role": "tool",
        #     #     "name": function_name,
        #     #     "content": function_response_content, # 工具执行结果
        #     # })
        #     # second_response = client.chat.completions.create(model="qwen-plus", messages=messages)
        #     # print(second_response.choices.message.content)
        # else:
        # print(message_content.content)
        ```
        
- H. Robust Error Handling:
    
    检查响应中的 status_code。常见的错误状态码包括 400 (InvalidParameter)，401 (NoApiKey/InvalidApiKey)，以及 429 (Throttling) 1。DashScope在响应的 code 和 message 字段中提供详细的错误代码和信息 1。对于 429 错误，应实施带有指数退避的重试机制。
    
- I. Rate Limits and Quota Management:
    
    Qwen模型在DashScope上的调用受到QPM（每分钟查询数）和TPM（每分钟Token数）的限制 36。
    
    例如 36：
    
    - `qwen-plus`: 15,000 QPM, 1,200,000 TPM (批量API调用不受这些限制)。
    - `qwen-plus-2025-04-28` (特定版本): 60 QPM, 1,000,000 TPM。
    - `qwen-turbo`: 1,200 QPM, 5,000,000 TPM。 通常提供免费额度（例如，某些模型有100万Token的免费额度）37。免费额度用尽后，将按量计费，开发者应通过DashScope控制台监控用量 1。
- **J. Noteworthy Platform-Specific Features or Multimodal Capabilities**:
    
    - **双API风格的灵活性与考量**：Qwen可以通过其原生的DashScope SDK 1 和一个OpenAI兼容的REST API 1 进行访问。这为开发者提供了选择：OpenAI兼容路径带来了熟悉度，并可能复用现有的OpenAI集成代码；原生SDK则可能提供更细致的控制或对DashScope特定功能的访问。然而，这意味着开发者需要注意两种接入方式在速率限制、特定参数名称/行为以及高级功能支持（如精细的工具调用或特定的多模态处理）上可能存在的差异。例如，某些上下文中参数名为`max_gen_len`，在另一些上下文中则为`max_tokens` 43。因此，开发者需要评估哪种接口最符合其需求。如果目标是与其他类OpenAI模型实现最大程度的可移植性，兼容API具有吸引力。如果需要与阿里云生态系统深度集成或利用兼容层未暴露的特定Qwen功能，则原生SDK更优。此外，原生SDK提供的批量API调用在某些模型上不受常规QPM/TPM限制 36，这对特定类型的大规模离线处理任务是一个显著优势。
    - **多模态输入**: `qwen-vl` 系列模型可以处理图像（通过内容中的 `image_url`）和视频（通过 `video_url` 或图像URL列表）23。`qwen-audio` 系列可以处理音频（通过 `input_audio`）23。
    - **DashScope生态系统**: 与其他阿里云服务的集成潜力。
    - **批量API**: 如前所述，特定模型（如`qwen-max`, `qwen-plus`）的批量API调用不受标准QPM/TPM限制 36，这对于大规模离线处理任务是一个重要特性。

---

### 4.2 智谱 GLM (Zhipu GLM)

- A. Provider Overview and Key Model Variants:
    
    智谱AI提供了一系列GLM（General Language Model）大模型，包括GLM-4、GLM-3-Turbo等文本生成模型 4。此外，还有针对特定任务的变体，如GLM-4-Voice（语音交互）、GLM-4-AllTools（强化工具调用能力）、CogView（图像生成）和CogVideo（视频生成）等 10。
    
- **B. API Access Setup**:
    
    1. 访问智谱AI开放平台（bigmodel.cn）并注册账户 4。
    2. 在开发工作台或API管理列表中创建应用并获取API Key 4。
    3. 新注册用户通常会获得一定量的免费体验Token额度 4。
- **C. Python SDK: Installation and Environment Configuration**:
    
    - **SDK安装**: 虽然具体命令在提供的片段中未直接给出，但标准的Python包安装方式是使用`pip`。推测安装命令为：
        
        Bash
        
        ```
        pip install zhipuai
        ```
        
    - **API Key配置**: 推荐将获取到的API Key设置在名为`.env`的文件中，变量名为`ZHIPUAI_API_KEY`，并通过`python-dotenv`库加载 4。也可以在初始化客户端时直接传入。
        
        Python
        
        ```
        #.env 文件内容示例
        # ZHIPUAI_API_KEY="YOUR_ZHIPUAI_API_KEY"
        ```
        
        Python
        
        ```
        import os
        from dotenv import load_dotenv, find_dotenv
        _ = load_dotenv(find_dotenv()) # 加载.env 文件中的环境变量
        ```
        
        4
    - 智谱AI同时支持SDK调用和原生HTTP请求，但建议使用SDK以获得更好的编程体验 4。
- **D. Foundational API Call (Synchronous)**:
    
    - **Minimal Runnable Code Example**:
        
        Python
        
        ```
        import os
        from zhipuai import ZhipuAI
        from dotenv import load_dotenv, find_dotenv
        
        # 加载环境变量（如果API Key存储在.env文件中）
        _ = load_dotenv(find_dotenv())
        
        # 初始化客户端
        # API Key会从环境变量 ZHIPUAI_API_KEY 中自动读取
        # 如果未设置环境变量，可以显式传入: api_key="YOUR_KEY"
        client = ZhipuAI() 
        
        def call_glm_sync():
            try:
                response = client.chat.completions.create(
                    model="glm-4",  # 或者 glm-3-turbo, glm-4-0520 等
                    messages=[
                        {"role": "user", "content": "你好，请介绍一下你自己。"}
                    ],
                    temperature=0.95 # 可选参数，示例值
                )
                if response.choices:
                    print("Model Response:", response.choices.message.content)
                    print("Usage:", response.usage)
                else:
                    print("No choices returned.")
            except Exception as e:
                print(f"An error occurred: {e}")
        
        if __name__ == '__main__':
            call_glm_sync()
        ```
        
        此示例基于 4 构建。
- E. Asynchronous API Calls:
    
    智谱AI的Python SDK明确支持异步调用。这对于构建高并发、I/O密集型应用（如处理大量并发用户请求的Web服务）非常关键，因为它允许程序在等待API响应时执行其他任务，而不是阻塞整个线程。
    
    - **Minimal Runnable Code Example (Async)**:
        
        Python
        
        ```
        import os
        import asyncio
        from zhipuai import ZhipuAI
        from dotenv import load_dotenv, find_dotenv
        
        _ = load_dotenv(find_dotenv())
        client = ZhipuAI() # API Key从环境变量读取
        
        async def call_glm_async():
            try:
                response = await client.chat.asyncCompletions.create( # 注意是 asyncCompletions
                    model="glm-4-0520", 
                    messages=[
                        {
                            "role": "user",
                            "content": "请用Python写一个异步函数示例。"
                        }
                    ],
                )
                if response.choices:
                    print("Model Async Response:", response.choices.message.content)
                    print("Usage:", response.usage)
                else:
                    print("No choices returned in async call.")
            except Exception as e:
                print(f"An async error occurred: {e}")
        
        if __name__ == '__main__':
            asyncio.run(call_glm_async())
        ```
        
        此异步调用示例基于 15 中的代码片段。这种明确的异步支持简化了开发者的工作，无需为API调用手动管理线程池，并且能够更好地与现代Python异步框架（如FastAPI, aiohttp）集成。
- F. Streaming Responses:
    
    通过在create方法中设置stream=True参数，可以启用流式响应。这允许逐步接收模型生成的内容，而不是等待整个响应完成后一次性接收，对于交互式应用和长文本生成非常有用。
    
    - **Minimal Runnable Code Example (Streaming)**: 虽然 15 中Python的流式示例不完整，但Java示例和 30 中对`stream`布尔型参数的提及表明了其存在。以下是基于通用模式推断的Python流式调用示例：
        
        Python
        
        ```
        import os
        from zhipuai import ZhipuAI
        from dotenv import load_dotenv, find_dotenv
        
        _ = load_dotenv(find_dotenv())
        client = ZhipuAI()
        
        def call_glm_stream():
            try:
                response_stream = client.chat.completions.create(
                    model="glm-4",
                    messages=[
                        {"role": "user", "content": "给我讲一个很长的故事，关于未来的机器人。"}
                    ],
                    stream=True
                )
                full_response_content = ""
                print("Streamed Response: ", end='')
                for chunk in response_stream:
                    if chunk.choices:
                        content_piece = chunk.choices.delta.content
                        if content_piece:
                            full_response_content += content_piece
                            print(content_piece, end='', flush=True)
                print("\nFull streamed response after completion:", full_response_content)
                # 注意：流式输出的 usage 信息可能在最后一个 chunk 中，或需要特殊处理
                # print("Usage (may need specific handling for streams):", response_stream.usage if hasattr(response_stream, 'usage') else "N/A for stream iteration")
        
            except Exception as e:
                print(f"A streaming error occurred: {e}")
        
        if __name__ == '__main__':
            call_glm_stream()
        ```
        
- **G. Mastering Core Parameters & Advanced Features**:
    
    - **Essential Parameters**:
        - `model`: (必选) String，指定调用的模型，如 `glm-4`, `glm-3-turbo` 4。
        - `messages`: (必选) List，对话消息列表，包含 `role` 和 `content` 4。
        - `temperature`: (可选) Float，采样温度，控制输出随机性，范围 `(0.0, 1.0)`，默认0.95 4。值越大输出越随机。
        - `top_p`: (可选) Float，核采样参数，控制输出多样性，范围 `(0.0, 1.0)` 开区间，默认0.7 4。不建议同时调整 `temperature` 和 `top_p` 4。
        - `max_tokens`: (可选) Integer，生成响应的最大token数。具体参数名和支持情况需查阅最新文档，通用LLM参数。
        - `request_id`: (可选) String，用户端传入的唯一请求标识 4。
        - `do_sample`: (可选) Boolean，控制是否启用采样策略，默认为`true`。若为`false`，则`temperature`和`top_p`不生效 30。
        - `stream`: (可选) Boolean，是否流式输出 30。
    - **System Prompts and Role Management**: 通过在 `messages` 列表中设置 `role: "system"` 来实现系统提示，引导模型行为。例如： `messages = [{"role": "system", "content": "你是一个精通历史的导游。"}, {"role": "user", "content": "介绍一下故宫。"}]` (此为标准用法，虽未在 4 中明确展示system角色的Python示例，但在 15 的一个Python示例中可见system角色。)
    - **Managing Multi-Turn Conversations**: 将完整的对话历史（用户和模型的交替消息）按顺序放入 `messages` 列表传递给API 4。
    - **Function Calling / Tool Integration**: GLM-4模型支持函数调用（Function Calling）或工具使用（Tool Use）。通过在API请求中传递 `tools` 参数来定义可用函数及其参数结构（JSON Schema格式）24。模型会判断是否需要调用函数，并在响应中返回待调用函数的名称和参数。开发者需自行执行函数，并将结果返回给模型继续对话。`GLM-4-AllTools` 模型是为此功能特化的版本 10。 可以通过 `tool_choice` 参数控制模型的函数调用行为（如强制调用特定函数或禁止调用），但目前函数调用仅支持 `auto` 模式 24。
        
        Python
        
        ```
        # 概念性示例，具体参数和响应结构请参考官方文档
        # tools = [
        #     {
        #         "type": "function",
        #         "function": {
        #             "name": "query_weather",
        #             "description": "根据城市名称查询天气信息",
        #             "parameters": {
        #                 "type": "object",
        #                 "properties": {
        #                     "city": {"type": "string", "description": "城市名称"}
        #                 },
        #                 "required": ["city"]
        #             }
        #         }
        #     }
        # ]
        # response = client.chat.completions.create(
        #     model="glm-4-alltools", # 或支持函数调用的glm-4
        #     messages=[{"role": "user", "content": "北京天气怎么样？"}],
        #     tools=tools,
        #     tool_choice="auto" # 目前仅支持auto
        # )
        # message = response.choices.message
        # if message.tool_calls:
        #     #... 处理 tool_calls...
        ```
        
        24
- H. Robust Error Handling:
    
    API调用可能返回标准的HTTP错误码。SDK通常会将这些错误封装为Python异常。开发者应使用 try-except 块捕获并处理这些异常。
    
- I. Rate Limits and Quota Management:
    
    智谱AI对API调用设有速率限制，通常以RPM（每分钟请求数）为单位，并根据用户的使用级别（Free, Usage Level 1 至 5）区分。不同模型的RPM限制不同 31。例如：
    
    - `GLM-4`: Free版 5 RPM, Level 5 版 200 RPM。
    - `GLM-3-Turbo`: Free版 5 RPM, Level 5 版 1000 RPM。
    - `CogView-3.5` (文生图): Free版 5 RPM, Level 5 版 40 RPM。 新用户注册后会获得免费的Token体验包，完成实名认证可获得额外额度 4。部分信息源提及免费模型的每日调用次数限制有所调整 49，但官方文档的速率限制表 31 更具参考性。对于音频/视频实时API (`GLM-Realtime`)，目前是限时免费 47。
- **J. Noteworthy Platform-Specific Features**:
    
    - **多模态能力**: `GLM-4V` 支持视觉输入，`GLM-4-Voice` 支持语音输入输出和实时对话 30。
    - **专用模型**: `GLM-ASR` (语音识别) 10, `CodeGeeX-4` (代码生成) 31, `CharGLM` (角色扮演) 10。
    - **智能体与搜索**: `Web Search API`, `Search Agent`, `qingliuagent` 等与智能体和搜索相关的功能 10。
    - **OpenAI SDK兼容性**: 智谱AI也提供了通过OpenAI SDK调用其模型的兼容方式，具体配置需参考其文档 10。

---

### 4.3 文心一言 (Wenxin Yiyan) - 百度智能云千帆 (Baidu Qianfan)

- A. Provider Overview and Key Model Variants:
    
    百度智能云千帆大模型平台提供文心（ERNIE）系列大模型，包括ERNIE-Bot（文心一言）、ERNIE-Bot-turbo、ERNIE 4.0 8K、ERNIE 3.5 8K、ERNIE Speed-AppBuilder等 16。千帆平台不仅提供百度自研模型，也支持第三方开源模型，并提供模型训练、部署、应用集成等全流程工具链 16。
    
- **B. API Access Setup**:
    
    1. 注册百度智能云账号并完成认证。
    2. 登录千帆控制台（[console.bce.baidu.com/qianfan/](https://console.bce.baidu.com/qianfan/)）。
    3. 在“应用接入”或相关管理页面创建应用，并获取Access Key (AK) 和 Secret Key (SK) 16。这是推荐的、功能更全面的认证方式。
    4. 旧版的API Key (AK) 和 Secret Key (SK) 认证方式仍可用，但功能受限且未来可能移除 16。
- **C. Python SDK: Installation and Environment Configuration**:
    
    - **SDK安装**: 需要Python 3.7.0或更高版本 16。
        
        Bash
        
        ```
        pip install qianfan
        ```
        
        16
    - **API Key配置**: 推荐将Access Key和Secret Key设置为环境变量 `QIANFAN_ACCESS_KEY` 和 `QIANFAN_SECRET_KEY` 16。
        
        Bash
        
        ```
        export QIANFAN_ACCESS_KEY="YOUR_ACCESS_KEY"
        export QIANFAN_SECRET_KEY="YOUR_SECRET_KEY"
        ```
        
        SDK会自动从环境变量中读取。也可以在代码中初始化`qianfan.ChatCompletion`等类时传入。
- **D. Foundational API Call (Synchronous)**:
    
    - **Minimal Runnable Code Example (Qianfan SDK)**:
        
        Python
        
        ```
        import os
        import qianfan
        
        # 确保 QIANFAN_ACCESS_KEY 和 QIANFAN_SECRET_KEY 已设置在环境变量中
        # 或者在初始化 ChatCompletion 时通过 ak 和 sk 参数传入
        # os.environ = "YOUR_ACCESS_KEY"
        # os.environ = "YOUR_SECRET_KEY"
        
        def call_ernie_sync():
            try:
                # 默认模型可能是 ERNIE-Bot-turbo 或其他，可指定 model 参数
                chat_comp = qianfan.ChatCompletion() 
                # 或者指定特定模型 chat_comp = qianfan.ChatCompletion(model="ERNIE-Bot-4")
        
                messages = [{"role": "user", "content": "你好，请介绍一下文心一言。"}]
        
                # 通过 top_p, temperature, penalty_score 等参数控制模型行为
                # 这些参数也可以在初始化 ChatCompletion 时指定
                resp = chat_comp.do(
                    messages=messages,
                    top_p=0.8,       # 示例参数
                    temperature=0.9, # 示例参数
                    penalty_score=1.0 # 示例参数
                )
        
                if resp and resp.get("result"):
                    print("Model Response:", resp["result"])
                    if resp.get("usage"):
                         print("Usage:", resp["usage"])
                else:
                    print("Failed to get response or empty result.")
                    if resp:
                        print("Raw Response:", resp)
        
            except Exception as e:
                print(f"An error occurred: {e}")
        
        if __name__ == '__main__':
            call_ernie_sync()
        ```
        
        此示例基于 16 构建。LangChain社区也提供了`QianfanChatEndpoint`集成 20。
- E. Asynchronous API Calls:
    
    千帆Python SDK支持异步调用，这对于需要高并发处理的场景至关重要。
    
    - `qianfan.ChatCompletion` 类提供了异步方法如 `ado()` 和 `abatch_do()` 16。
    - 底层的 `qianfan.resources.http_client.HTTPClient` 也包含 `arequest()` (异步单次请求) 和 `arequest_stream()` (异步流式请求) 方法 17。
    - **Minimal Runnable Code Example (Async)**:
        
        Python
        
        ```
        import os
        import asyncio
        import qianfan
        
        # os.environ = "YOUR_ACCESS_KEY"
        # os.environ = "YOUR_SECRET_KEY"
        
        async def call_ernie_async():
            try:
                chat_comp = qianfan.ChatCompletion() # 默认模型
                messages = [{"role": "user", "content": "用Python写一个异步的hello world。"}]
        
                resp = await chat_comp.ado(messages=messages) # 注意 await 和 ado
        
                if resp and resp.get("result"):
                    print("Model Async Response:", resp["result"])
                    if resp.get("usage"):
                         print("Usage:", resp["usage"])
                else:
                    print("Failed to get async response or empty result.")
                    if resp:
                        print("Raw Async Response:", resp)
            except Exception as e:
                print(f"An async error occurred: {e}")
        
        if __name__ == '__main__':
            asyncio.run(call_ernie_async())
        ```
        
- F. Streaming Responses:
    
    千帆SDK支持流式响应，允许逐步接收模型生成的文本。
    
    - 在 `ChatCompletion.do()` 或 `ado()` 方法中设置 `stream=True`。
    - 然后迭代返回的响应对象以获取数据块。
    - LangChain集成的 `QianfanChatEndpoint` 也支持流式，如 `chat.stream(messages)` 20。
    - **Minimal Runnable Code Example (Streaming)**:
        
        Python
        
        ```
        import os
        import qianfan
        
        # os.environ = "YOUR_ACCESS_KEY"
        # os.environ = "YOUR_SECRET_KEY"
        
        def call_ernie_stream():
            try:
                chat_comp = qianfan.ChatCompletion() # 默认模型
                messages = [{"role": "user", "content": "写一个关于太空旅行的短篇故事。"}]
        
                response_stream = chat_comp.do(messages=messages, stream=True)
        
                full_response_content = ""
                print("Streamed Response: ", end='')
                for resp_part in response_stream:
                    if resp_part and resp_part.get("result"):
                        content_piece = resp_part["result"]
                        full_response_content += content_piece
                        print(content_piece, end='', flush=True)
                    # 流式响应中，错误处理和usage信息可能需要特殊处理
                    elif resp_part and resp_part.get("error_code"):
                        print(f"\nError in stream: {resp_part.get('error_msg')}")
                        break
                print("\nFull streamed response after completion:", full_response_content)
                # Usage信息通常在流结束后的最后一个包或特定事件中，具体需查SDK文档
                # if hasattr(response_stream, 'usage'): print("Usage:", response_stream.usage)
        
            except Exception as e:
                print(f"A streaming error occurred: {e}")
        
        if __name__ == '__main__':
            call_ernie_stream()
        ```
        
- **G. Mastering Core Parameters & Advanced Features**:
    
    - **Essential Parameters** (部分模型如ERNIE-Bot, ERNIE-Bot-turbo支持) 1111:
        - `model`: (可选) String，指定模型名称，如 `ERNIE-Bot`, `ERNIE-Bot-turbo`, `ERNIE-4.0-8K`。默认为某个版本（如ERNIE-Bot-turbo）。
        - `endpoint`: (可选) String，用于指定自定义部署的模型服务接入点，如果设置了此参数，`model`参数会被忽略 20。
        - `messages`: (必选) List，对话消息列表。
        - `temperature`: (可选) Float，采样温度，控制输出随机性 (例如0到2之间，具体范围查文档)。
        - `top_p`: (可选) Float，核采样参数 (例如0到1之间)。
        - `penalty_score`: (可选) Float，用于调整重复度。
        - `max_tokens` (或类似参数如 `max_output_tokens`): (可选) Integer，限制输出长度。
        - `user_id`: (可选) String，用于计费和监控的用户标识。
    - **System Prompts and Role Management**: 通过 `messages` 列表中的 `role: "system"` (或SDK中对应的 `SystemMessage`) 来设置系统级指令。
        
        Python
        
        ```
        messages = [
            {"role": "system", "content": "你是一个AI助手，擅长解答历史问题。"},
            {"role": "user", "content": "请解释一下文艺复兴的核心思想。"}
        ]
        ```
        
        53 (Langchain示例中间接体现)
    - **Managing Multi-Turn Conversations**: 将包含用户和助手交替发言的完整对话历史传递给 `messages` 参数。
    - **Function Calling / Tool Integration**: ERNIE 4.0等高级模型具备强大的工具使用和函数调用能力 54。千帆SDK应支持此功能，但具体实现细节（如参数名称`tools`, `tool_choice`）在提供的摘要中不突出。开发者需查阅千帆SDK关于函数调用的最新文档。千帆AppBuilder平台本身也强调了Agent应用和组件调用 51。
- H. Robust Error Handling:
    
    SDK会进行错误处理和重试。API调用失败时，会返回包含错误码和错误信息的响应。开发者应检查响应状态，并根据需要实现自定义错误处理逻辑。
    
- I. Rate Limits and Quota Management:
    
    百度千帆平台对API调用设有QPS（每秒查询数）限制和流量控制 16。具体的QPS、RPM（每分钟请求数）、TPM（每分钟Token数）等限制值，在提供的材料中并未明确给出统一的表格 16。这些信息通常可以在百度智能云控制台的配额管理部分查看，或需要联系客服获取。TPM是千帆平台管理配额的一个关键指标 61。
    
    ERNIE 4.5在千帆平台上的API价格约为每千Token输入0.004元人民币，输出0.016元人民币 (按$0.55/1M tokens输入，$2.2/1M tokens输出，汇率1 RMB ≈ 0.14 USD换算) 54。平台通常提供一定的免费额度或试用次数 51。
    
    由于缺乏一个集中的、公开的速率限制表，开发者在进行容量规划和成本预估时可能面临初步挑战。透明的速率限制对于构建可扩展和可预测的应用至关重要。
    
- **J. Noteworthy Platform-Specific Features**:
    
    - **千帆平台 (Qianfan Platform)**: 提供一站式大模型开发与服务运营能力，包括数据管理、模型微调与训练、模型评估、服务部署等 16。
    - **知识库集成**: 支持与知识库结合，实现基于私有数据的问答 62。
    - **插件市场**: 计划支持文心一言插件商城的插件调用 62。
    - **AppBuilder**: 提供AI原生应用搭建平台，简化应用开发流程 51。

---

### 4.4 百川 (Baichuan)

- A. Provider Overview and Key Model Variants:
    
    百川智能研发了多个大语言模型，如Baichuan2-Turbo, Baichuan2-Turbo-192k, 以及早期的开源版本如 baichuan-7b-v1, baichuan2-7b-chat-v1, baichuan2-13b-chat-v1 5。这些模型通常可以通过阿里云灵积平台DashScope进行API访问。
    
- **B. API Access Setup (via DashScope)**:
    
    1. 与调用通义千问模型类似，需要在阿里云官网注册账户并完成实名认证。
    2. 登录百炼（Model Studio）控制台或DashScope控制台 5。
    3. 在模型广场找到百川系列模型（如Baichuan2-Turbo），点击“立即申请”并等待申请通过 5。
    4. 获取DashScope API Key，用于身份验证 5。
- **C. Python SDK: Installation and Environment Configuration (via DashScope)**:
    
    - **SDK安装**: 使用DashScope Python SDK。
        
        Bash
        
        ```
        pip install dashscope --upgrade -i https://pypi.tuna.tsinghua.edu.cn/simple
        ```
        
        5 (与千问共用DashScope SDK)
    - **API Key配置**: 将获取的DashScope API Key设置为环境变量 `DASHSCOPE_API_KEY` 5。
- **D. Foundational API Call (Synchronous) (via DashScope SDK)**:
    
    - **Minimal Runnable Code Example**:
        
        Python
        
        ```
        import os
        from http import HTTPStatus
        import dashscope
        
        # 确保 DASHSCOPE_API_KEY 已设置在环境变量中
        # os.environ = "YOUR_DASHSCOPE_API_KEY"
        
        def call_baichuan_sync():
            # 使用 messages 格式 (适用于聊天模型如 baichuan2-7b-chat-v1)
            messages_chat = [
                {'role': 'system', 'content': 'You are a helpful assistant.'},
                {'role': 'user', 'content': '你好，请介绍一下百川大模型。'}
            ]
            try:
                response_chat = dashscope.Generation.call(
                    model='baichuan2-7b-chat-v1', # 示例模型，请选用当前可用的模型
                    messages=messages_chat,
                    result_format='message', # 推荐聊天模型使用 message 格式
                    api_key=os.getenv('DASHSCOPE_API_KEY') # 或者直接传入 api_key
                )
                if response_chat.status_code == HTTPStatus.OK:
                    print("Baichuan Chat Model Response:")
                    print("Request ID:", response_chat.request_id)
                    print("Output:", response_chat.output.choices.message.content)
                    print("Usage:", response_chat.usage)
                else:
                    print(f"Baichuan Chat Request failed! Request ID: {response_chat.request_id}, Status Code: {response_chat.status_code}, Error Code: {response_chat.code}, Error Message: {response_chat.message}")
        
                print("-" * 30)
        
                # 使用 prompt 格式 (适用于部分非聊天模型或兼容prompt模式的模型)
                # prompt_text = "介绍一下长城。"
                # response_prompt = dashscope.Generation.call(
                #     model='baichuan-7b-v1', # 示例模型，请选用当前可用的模型
                #     prompt=prompt_text,
                #     api_key=os.getenv('DASHSCOPE_API_KEY')
                # )
                # if response_prompt.status_code == HTTPStatus.OK:
                #     print("\nBaichuan Prompt Model Response:")
                #     print("Request ID:", response_prompt.request_id)
                #     print("Output:", response_prompt.output.text)
                #     print("Usage:", response_prompt.usage)
                # else:
                #     print(f"Baichuan Prompt Request failed! Request ID: {response_prompt.request_id}, Status Code: {response_prompt.status_code}, Error Code: {response_prompt.code}, Error Message: {response_prompt.message}")
        
            except Exception as e:
                print(f"An error occurred: {e}")
        
        if __name__ == '__main__':
            call_baichuan_sync()
        ```
        
        此示例基于 39 构建。注意，模型列表和可用性会变化，应查阅DashScope官方文档获取最新支持的模型名称。
- E. Asynchronous API Calls (via DashScope SDK):
    
    与通义千问通过DashScope调用类似，目前提供的材料中未明确展示百川模型通过原生DashScope SDK进行Python async/await异步调用的示例。如果百川模型也通过DashScope的OpenAI兼容端点暴露，则可以使用OpenAI SDK的异步功能。
    
- F. Streaming Responses (via DashScope SDK):
    
    同样，通过DashScope SDK调用百川模型时，可以通过设置stream=True来实现流式响应。具体实现方式与调用通义千问的流式响应类似。
    
- G. Mastering Core Parameters & Advanced Features (via DashScope):
    
    通过DashScope平台调用百川模型时，可用的核心参数与DashScope文本生成API的通用参数一致 43。
    
    - `model`: 指定百川模型的ID，如 `baichuan2-turbo`, `baichuan2-7b-chat-v1`。
    - `input.messages` 或 `input.prompt`: 根据模型类型选择输入格式。聊天模型（如`baichuan2-7b-chat-v1`）支持`messages`列表 39。
    - `parameters.result_format`: 可选 `'text'` 或 `'message'`。当输入格式为`messages`时可配置为`message` 39。
    - 其他通用参数如 `temperature`, `top_p`, `max_tokens` (或 `max_length`) 等也适用，具体默认值和范围需参考DashScope通用参数文档及百川模型自身的特性。
    - **System Prompt**: 通过在`messages`列表中设置`role: "system"`实现 39。
    - **Multi-Turn Conversation**: 通过在`messages`列表中维护对话历史实现 39。
    - **Function Calling**: 在提供的材料中未明确说明百川模型通过DashScope接口支持函数调用的细节。这通常依赖于模型本身的能力以及DashScope平台的适配程度。
- H. Robust Error Handling (via DashScope):
    
    错误处理机制与DashScope平台通用，检查响应的status_code, code, message字段。
    
- I. Rate Limits and Quota Management (via DashScope):
    
    百川模型在DashScope平台上的速率限制遵循DashScope的配额管理。
    
    - `Baichuan2-Turbo-192k`: 60 QPM, 100,000 TPM 36。
    - 早期的开源版本如 `baichuan2-13b-chat-v1` 和 `baichuan2-7b-chat-v1` 曾有免费额度（如各100万Token），但部分模型在 36 中被列为“下线中”。
    - `baichuan-7b-v1` 曾为免费试用 39。 开发者应查阅最新的DashScope文档或控制台了解具体模型的当前速率限制和计费策略。
- J. Noteworthy Platform-Specific Features:
    
    百川模型主要通过阿里云DashScope等平台提供服务，因此其API调用特性很大程度上受益于（也受限于）所接入平台的功能。百川模型本身以其开源版本和在中文处理上的表现受到关注。
    

---

### 4.5 DeepSeek

- A. Provider Overview and Key Model Variants:
    
    DeepSeek AI研发了一系列模型，包括通用对话模型（如deepseek-chat）、代码模型（DeepSeek-Coder系列）和推理模型（如deepseek-reasoner）12。其API设计与OpenAI API高度兼容 12。
    
- **B. API Access Setup**:
    
    1. 访问DeepSeek开放平台（platform.deepseek.com）并注册账户。
    2. 在API密钥管理页面申请并获取API Key 12。
- **C. Python SDK: Installation and Environment Configuration**:
    
    - **SDK安装**: DeepSeek API兼容OpenAI的SDK，因此直接安装OpenAI Python库即可。
        
        Bash
        
        ```
        pip install openai --upgrade
        ```
        
        12
    - **API Key配置**: 将获取的DeepSeek API Key设置为环境变量（如`DEEPSEEK_API_KEY`），或在代码中初始化OpenAI客户端时传入。
    - **Base URL配置**: 初始化OpenAI客户端时，需将`base_url`参数指定为DeepSeek的API端点：`https://api.deepseek.com` 或 `https://api.deepseek.com/v1` 12。`/v1` 后缀与模型版本无关，仅为兼容路径。
- **D. Foundational API Call (Synchronous) (via OpenAI SDK)**:
    
    - **Minimal Runnable Code Example**:
        
        Python
        
        ```
        import os
        from openai import OpenAI
        
        # 确保 DEEPSEEK_API_KEY 已设置在环境变量中
        # os.environ = "YOUR_DEEPSEEK_API_KEY"
        
        client = OpenAI(
            api_key=os.environ.get("DEEPSEEK_API_KEY"), 
            base_url="https://api.deepseek.com/v1" # 或者 https://api.deepseek.com
        )
        
        def call_deepseek_sync():
            try:
                response = client.chat.completions.create(
                    model="deepseek-chat",  # 或 deepseek-coder, deepseek-reasoner
                    messages=,
                    max_tokens=500, # 示例参数
                    temperature=0.7   # 示例参数
                )
                print("Model Response:", response.choices.message.content)
                if hasattr(response, 'usage') and response.usage:
                    print("Usage:", response.usage)
            except Exception as e:
                print(f"An error occurred: {e}")
        
        if __name__ == '__main__':
            call_deepseek_sync()
        ```
        
        此示例基于 12 构建。
- E. Asynchronous API Calls (via OpenAI SDK):
    
    使用OpenAI SDK的异步客户端AsyncOpenAI，并配置相应的base_url。
    
    - **Minimal Runnable Code Example (Async)**:
        
        Python
        
        ```
        import os
        import asyncio
        from openai import AsyncOpenAI
        
        # os.environ = "YOUR_DEEPSEEK_API_KEY"
        
        client = AsyncOpenAI(
            api_key=os.environ.get("DEEPSEEK_API_KEY"),
            base_url="https://api.deepseek.com/v1"
        )
        
        async def call_deepseek_async():
            try:
                response = await client.chat.completions.create(
                    model="deepseek-chat",
                    messages=[
                        {"role": "user", "content": "请解释一下什么是深度学习。"}
                    ],
                    max_tokens=500
                )
                print("Model Async Response:", response.choices.message.content)
            except Exception as e:
                print(f"An async error occurred: {e}")
        
        if __name__ == '__main__':
            asyncio.run(call_deepseek_async())
        ```
        
        此示例基于 12 的同步示例和OpenAI SDK的异步模式推断。
- F. Streaming Responses (via OpenAI SDK):
    
    在create方法中设置stream=True，并迭代响应流。
    
    - **Minimal Runnable Code Example (Streaming)**:
        
        Python
        
        ```
        import os
        from openai import OpenAI
        
        # os.environ = "YOUR_DEEPSEEK_API_KEY"
        
        client = OpenAI(
            api_key=os.environ.get("DEEPSEEK_API_KEY"),
            base_url="https://api.deepseek.com/v1"
        )
        
        def call_deepseek_stream():
            try:
                stream = client.chat.completions.create(
                    model="deepseek-chat",
                    messages=[
                        {"role": "user", "content": "写一首关于星空的诗。"}
                    ],
                    stream=True,
                    max_tokens=300
                )
                full_response_content = ""
                print("Streamed Response: ", end='')
                for chunk in stream:
                    if chunk.choices and chunk.choices.delta and chunk.choices.delta.content:
                        content_piece = chunk.choices.delta.content
                        full_response_content += content_piece
                        print(content_piece, end='', flush=True)
                print("\nFull streamed response after completion:", full_response_content)
            except Exception as e:
                print(f"A streaming error occurred: {e}")
        
        if __name__ == '__main__':
            call_deepseek_stream()
        ```
        
        此示例基于 12 的流式示例。
- G. Mastering Core Parameters & Advanced Features:
    
    由于DeepSeek API与OpenAI兼容，其核心参数也与OpenAI类似。
    
    - **Essential Parameters**:
        - `model`: (必选) String，指定模型ID，如 `deepseek-chat`, `deepseek-coder` 12。
        - `messages`: (必选) List，对话消息列表 12。
        - `temperature`: (可选) Float，控制随机性，默认1.0。DeepSeek官方文档建议根据用例调整，例如编码/数学用0.0，一般对话用1.3 64。
        - `top_p`: (可选) Float，核采样参数 64。
        - `max_tokens`: (可选) Integer，最大生成token数，上限通常较高（如32768）64。
        - `stream`: (可选) Boolean，是否流式输出 12。
        - `stop`: (可选) String或List，停止序列 64。
        - `frequency_penalty`, `presence_penalty`: (可选) 控制重复性。
    - **System Prompts and Role Management**: 通过`messages`列表中的`{"role": "system", "content": "..."}`来设置系统提示 12。
    - **Managing Multi-Turn Conversations**: 将完整的对话历史（用户、助手、系统消息）按顺序放入`messages`列表 12。
    - **Function Calling / Tool Integration**: DeepSeek API支持函数调用。通过在请求中传递`tools`参数（包含函数定义列表）和可选的`tool_choice`参数来实现 25。模型会在响应的`tool_calls`字段中返回需要调用的函数名和参数。
        
        Python
        
        ```
        # 概念性示例，参考 [25]
        # tools = [
        #     {
        #         "type": "function",
        #         "function": {
        #             "name": "get_stock_price",
        #             "description": "Get the current stock price for a given symbol",
        #             "parameters": {
        #                 "type": "object",
        #                 "properties": {"symbol": {"type": "string"}},
        #                 "required": ["symbol"]
        #             }
        #         }
        #     }
        # ]
        # response = client.chat.completions.create(
        #     model="deepseek-chat", # 或其他支持函数调用的模型
        #     messages=[{"role": "user", "content": "腾讯的股价是多少？"}],
        #     tools=tools
        # )
        # message = response.choices.message
        # if message.tool_calls:
        #     #... 处理 tool_calls...
        ```
        
- H. Robust Error Handling:
    
    API会返回标准的HTTP错误码。使用OpenAI SDK时，SDK会处理部分错误并可能抛出特定异常。开发者应捕获这些异常并实现重试逻辑。
    
- I. Rate Limits and Quota Management:
    
    关于DeepSeek的速率限制，存在一些不一致的信息。DeepSeek官方API文档 66 声称“DeepSeek API不对用户的速率限制进行约束。我们将尽力服务好每一条请求。”但同时警告在高流量压力下，请求响应可能耗时较长，且连接会在30分钟后关闭。这表明虽然没有明确的RPM/TPM限制，但存在隐性的容量和服务质量约束。
    
    另一方面，第三方平台（如Together AI）在提供DeepSeek模型（如DeepSeek R1）时，会标明具体的RPM限制，这些限制可能因用户层级而异（例如，免费/Tier 1用户0.3-4 RPM，Build Tiers 2-5用户240-480 RPM）67。
    
    这种信息差异可能源于：官方“无限制”策略指的是其直接API接口的理想状态或通用政策，而实际部署中（无论是在DeepSeek自身平台高负载时，还是通过第三方集成商）都可能存在实际的吞吐量瓶颈或为保证服务公平性而设置的限制。开发者应采取防御性编程策略，实施重试机制并监控API性能，因为“无明确限制”不等于“无限容量”。
    
- **J. Noteworthy Platform-Specific Features**:
    
    - **OpenAI兼容性**: 这是DeepSeek API的一大特点，极大地降低了开发者的学习和迁移成本 12。
    - **专用模型**: 提供了在编码（DeepSeek-Coder）和复杂推理（deepseek-reasoner）方面表现突出的模型。
    - **上下文缓存 (Context Caching)**: DeepSeek API文档中提及了上下文缓存功能，这可能有助于在多轮对话中降低成本和延迟 25。
    - **成本效益**: DeepSeek模型通常以其较高的性价比吸引开发者 63。

---

### 4.6 ChatGPT (OpenAI)

- A. Provider Overview and Key Model Variants:
    
    OpenAI提供了一系列业界领先的大模型，包括GPT-4系列（如GPT-4, GPT-4 Turbo, GPT-4o）、GPT-3.5-Turbo，以及用于图像生成的DALL-E、语音转文本的Whisper和文本转语音（TTS）的模型 32。这些模型通过OpenAI API提供服务。
    
- **B. API Access Setup**:
    
    1. 访问OpenAI官网（platform.openai.com）并注册账户。
    2. 在账户仪表盘的API密钥管理页面创建并获取API Key 9。
- **C. Python SDK: Installation and Environment Configuration**:
    
    - **SDK安装**:
        
        Bash
        
        ```
        pip install openai --upgrade
        ```
        
        9
    - **API Key配置**: 推荐将API Key设置为环境变量 `OPENAI_API_KEY` 9。SDK会自动读取。
        
        Bash
        
        ```
        export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
        ```
        
- D. Foundational API Call (Synchronous):
    
    OpenAI提供了多个API端点，其中Chat Completions API (client.chat.completions.create) 是与GPT系列模型进行对话交互的主要方式。较新的Responses API (client.responses.create) 整合了Chat Completions的简易性与Assistants API的工具使用能力 32。以下示例使用更通用的Chat Completions API。
    
    - **Minimal Runnable Code Example (Chat Completions API)**:
        
        Python
        
        ```
        import os
        from openai import OpenAI
        
        # API Key 会从环境变量 OPENAI_API_KEY 自动读取
        client = OpenAI() 
        
        def call_chatgpt_sync():
            try:
                response = client.chat.completions.create(
                    model="gpt-4o", # 或 "gpt-3.5-turbo" 等
                    messages=[
                        {"role": "system", "content": "You are a knowledgeable and friendly assistant."},
                        {"role": "user", "content": "What is the capital of France?"}
                    ]
                )
                print("Model Response:", response.choices.message.content)
                if hasattr(response, 'usage') and response.usage:
                    print("Usage:", response.usage)
            except Exception as e:
                print(f"An error occurred: {e}")
        
        if __name__ == '__main__':
            call_chatgpt_sync()
        ```
        
        此示例基于 [32 (通用结构), 9 (Chat Completions API)] 构建。
- E. Asynchronous API Calls:
    
    OpenAI Python SDK提供了异步客户端 AsyncOpenAI。
    
    - **Minimal Runnable Code Example (Async)**:
        
        Python
        
        ```
        import os
        import asyncio
        from openai import AsyncOpenAI
        
        client = AsyncOpenAI() # API Key 从环境变量读取
        
        async def call_chatgpt_async():
            try:
                response = await client.chat.completions.create(
                    model="gpt-4o",
                    messages=[
                        {"role": "user", "content": "Write a short poem about the ocean."}
                    ]
                )
                print("Model Async Response:", response.choices.message.content)
            except Exception as e:
                print(f"An async error occurred: {e}")
        
        if __name__ == '__main__':
            asyncio.run(call_chatgpt_async())
        ```
        
        此示例基于 [9 (结构)]。
- F. Streaming Responses:
    
    在create方法中设置stream=True。
    
    - **Minimal Runnable Code Example (Streaming)**:
        
        Python
        
        ```
        import os
        from openai import OpenAI
        
        client = OpenAI()
        
        def call_chatgpt_stream():
            try:
                stream = client.chat.completions.create(
                    model="gpt-4o",
                    messages=,
                    stream=True
                )
                full_response_content = ""
                print("Streamed Response: ", end='')
                for chunk in stream:
                    if chunk.choices and chunk.choices.delta and chunk.choices.delta.content:
                        content_piece = chunk.choices.delta.content
                        full_response_content += content_piece
                        print(content_piece, end='', flush=True)
                print("\nFull streamed response after completion:", full_response_content)
            except Exception as e:
                print(f"A streaming error occurred: {e}")
        
        if __name__ == '__main__':
            call_chatgpt_stream()
        ```
        
        此示例基于 [9 (结构)]。
- **G. Mastering Core Parameters & Advanced Features**:
    
    - **Essential Parameters** (Chat Completions API) 9:
        - `model`: (必选) String，模型ID。
        - `messages`: (必选) List，对话消息列表。
        - `temperature`: (可选) Float，0到2之间，控制随机性。
        - `top_p`: (可选) Float，核采样参数。
        - `max_tokens`: (可选) Integer，限制生成token数。
        - `n`: (可选) Integer，为每条输入消息生成多少个回复。
        - `stream`: (可选) Boolean，是否流式输出。
        - `stop`: (可选) String或List，停止序列。
        - `presence_penalty`, `frequency_penalty`: (可选) Float，调整新主题和重复内容的倾向。
        - `logit_bias`: (可选) Dict，修改特定token出现的概率。
        - `seed`: (可选, Beta) Integer, 用于可复现采样。
    - **System Prompts and Role Management**: 在`messages`列表中使用`{"role": "system", "content": "..."}`设置系统指令 26。支持的角色还包括`user`, `assistant`, `tool`。
    - **Managing Multi-Turn Conversations**: 将包含系统、用户和助手消息的完整对话历史按顺序传递给`messages`参数 26。
    - **Function Calling / Tool Integration**: Chat Completions API支持强大的函数调用（现称为工具使用）。通过`tools`参数定义可用工具列表（可以是自定义函数或OpenAI提供的内置工具如网页搜索、代码解释器），并通过`tool_choice`参数控制模型如何选择工具 26。模型会在响应的`tool_calls`字段中指示需要调用的工具。应用执行工具后，将结果以`role: "tool"`的消息形式发送回模型。
        
        Python
        
        ```
        # 概念性示例，参考 [26]
        # tools =
        # response = client.chat.completions.create(
        #     model="gpt-4o",
        #     messages=[{"role": "user", "content": "What's the weather like where I am and what was a positive news story from today?"}],
        #     tools=tools,
        #     tool_choice="auto"
        # )
        # message = response.choices.message
        # if message.tool_calls:
        #     #... 处理 tool_calls, 执行函数, 将结果以 role="tool" 发回...
        ```
        
- H. Robust Error Handling:
    
    API返回标准的HTTP错误码，如400, 401, 403, 404, 422, 429, >=500 8。SDK会将这些错误封装为特定的Python异常（如openai.APIError, openai.RateLimitError）。建议实现带有指数退避的重试逻辑，特别是针对429 RateLimitError和服务器端错误（>=500）8。
    
- I. Rate Limits and Quota Management:
    
    OpenAI的API调用受到速率限制，主要指标包括RPM（每分钟请求数）、RPD（每日请求数）、TPM（每分钟Token数）、TPD（每日Token数）和IPM（每分钟图像数，适用于图像模型）70。这些限制因模型、用户账户的用量层级（Usage Tiers, 如Free, Tier 1至Tier 5）以及请求是否针对长上下文模型而异 70。用户可以在其OpenAI开发者控制台的账户设置中查看具体的速率限制，并且API响应头中也包含相关的速率限制信息（如x-ratelimit-limit-requests, x-ratelimit-remaining-tokens, x-ratelimit-reset-requests等）9。
    
    虽然通用速率限制文档 70 解释了机制和层级，但并未直接列出如GPT-4、GPT-4o、GPT-3.5-Turbo等关键模型在不同层级下的具体RPM/TPM数值。这些详细数值通常在“模型(Models)”页面或用户个人账户的限制部分显示 69。第三方信息源 72 或Azure OpenAI的文档 73 可能提供相关或类似的限制数据，但不完全等同于OpenAI直接API的限制。
    
- **J. Noteworthy Platform-Specific Features**:
    
    - **Assistants API**: 用于构建更复杂、有状态的AI助手，能够调用模型、工具和知识库来执行多步骤任务 32。
    - **Batch API**: 允许用户以异步方式提交大量请求，并在24小时内获得结果，成本通常低于实时API 68。
    - **Fine-tuning**: 支持用户根据自己的数据对部分模型进行微调。
    - **多模态能力**: GPT-4o等新模型支持文本、图像、音频的综合处理 32。
    - **Playground**: 提供一个无需编码即可探索模型和API功能的Web界面 68。
    - **Responses API**: 一个较新的API原语，旨在简化代理的构建，结合了Chat Completions的易用性和Assistants API的内置工具使用能力 68。

---

### 4.7 Claude (Anthropic)

- A. Provider Overview and Key Model Variants:
    
    Anthropic提供Claude系列模型，以其强大的语言理解、生成能力以及对安全性的关注而闻名。主要模型家族包括Claude 3（Opus、Sonnet、Haiku）、Claude 3.5 Sonnet以及最新的Claude 3.7 Sonnet 74。这些模型可以通过Anthropic的官方API、AWS Bedrock以及Google Cloud Vertex AI等平台进行访问 74。
    
- **B. API Access Setup**:
    
    1. 访问Anthropic Console (console.anthropic.com) 并创建账户 6。
    2. 在控制台中生成API密钥 6。
- **C. Python SDK: Installation and Environment Configuration**:
    
    - **SDK安装**: 需要Python 3.7+ 6。
        
        Bash
        
        ```
        pip install anthropic --upgrade
        ```
        
        18
    - **API Key配置**: 推荐将API Key设置为环境变量 `ANTHROPIC_API_KEY` 6。SDK会自动读取。
        
        Bash
        
        ```
        export ANTHROPIC_API_KEY="YOUR_ANTHROPIC_API_KEY"
        ```
        
    - **OpenAI SDK兼容性**: Anthropic提供了一定程度的OpenAI SDK兼容性，允许用户通过修改基础URL和模型名称，使用OpenAI SDK调用Claude模型 13。
- **D. Foundational API Call (Synchronous)**:
    
    - **Minimal Runnable Code Example**:
        
        Python
        
        ```
        import os
        from anthropic import Anthropic
        
        # API Key 会从环境变量 ANTHROPIC_API_KEY 自动读取
        client = Anthropic() 
        
        def call_claude_sync():
            try:
                message = client.messages.create(
                    model="claude-3-opus-20240229", # 或 "claude-3-5-sonnet-latest" 等
                    max_tokens=1024,
                    messages=[
                        {"role": "user", "content": "Hello, Claude. Can you explain the concept of emergence?"}
                    ]
                )
                # 响应内容是一个 ContentBlock 对象的列表，通常第一个是文本
                if message.content and isinstance(message.content, list) and hasattr(message.content, 'text'):
                    print("Model Response:", message.content.text)
                else:
                    print("Model Response (raw):", message.content)
        
                if hasattr(message, 'usage') and message.usage: # 检查 usage 属性是否存在
                    print("Usage:", message.usage)
        
            except Exception as e:
                print(f"An error occurred: {e}")
        
        if __name__ == '__main__':
            call_claude_sync()
        ```
        
        此示例基于 18 构建。
- E. Asynchronous API Calls:
    
    Anthropic Python SDK提供了异步客户端 AsyncAnthropic。
    
    - **Minimal Runnable Code Example (Async)**:
        
        Python
        
        ```
        import os
        import asyncio
        from anthropic import AsyncAnthropic
        
        client = AsyncAnthropic() # API Key 从环境变量读取
        
        async def call_claude_async():
            try:
                message = await client.messages.create(
                    model="claude-3-sonnet-20240229",
                    max_tokens=1024,
                    messages=[
                        {"role": "user", "content": "Write a haiku about a sunrise."}
                    ]
                )
                if message.content and isinstance(message.content, list) and hasattr(message.content, 'text'):
                    print("Model Async Response:", message.content.text)
                else:
                    print("Model Async Response (raw):", message.content)
        
            except Exception as e:
                print(f"An async error occurred: {e}")
        
        if __name__ == '__main__':
            asyncio.run(call_claude_async())
        ```
        
        此示例基于 18。
- F. Streaming Responses:
    
    SDK支持通过client.messages.stream()（同步）或await client.messages.stream()（异步）并结合上下文管理器（with或async with）来实现流式响应。可以迭代stream.text_stream获取文本增量，或迭代stream获取完整的事件对象。
    
    - **Minimal Runnable Code Example (Async Streaming)**:
        
        Python
        
        ```
        import os
        import asyncio
        from anthropic import AsyncAnthropic
        
        client = AsyncAnthropic()
        
        async def call_claude_async_stream():
            try:
                async with client.messages.stream(
                    model="claude-3-haiku-20240307",
                    max_tokens=1024,
                    messages=
                ) as stream:
                    full_response_content = ""
                    print("Streamed Response: ", end='')
                    async for text_delta in stream.text_stream:
                        full_response_content += text_delta
                        print(text_delta, end="", flush=True)
                    print("\nFull streamed response after completion:", full_response_content)
        
                    # 获取最终消息对象和 usage (如果API在流结束后提供)
                    final_message = await stream.get_final_message()
                    if final_message.content and isinstance(final_message.content, list) and hasattr(final_message.content, 'text'):
                         print("\nFinal message content from stream object:", final_message.content.text)
                    if hasattr(final_message, 'usage') and final_message.usage:
                         print("Usage from final message:", final_message.usage)
        
        
            except Exception as e:
                print(f"\nA streaming error occurred: {e}")
        
        if __name__ == '__main__':
            asyncio.run(call_claude_async_stream())
        ```
        
        此示例基于 18。同步流式调用接口类似，只是没有`async/await`。
- **G. Mastering Core Parameters & Advanced Features**:
    
    - **Essential Parameters**:
        - `model`: (必选) String，模型ID，如 `claude-3-opus-20240229` 18。
        - `messages`: (必选) List，对话消息列表 18。
        - `max_tokens`: (必选) Integer，最大生成token数 18。不同模型有不同上限。
        - `system`: (可选) String，系统提示，用于指导模型整体行为 18。
        - `temperature`: (可选) Float，控制随机性 (通常0-1) 76。
        - `top_p`: (可选) Float，核采样参数。
        - `top_k`: (可选) Integer，另一种采样方式。
        - `stop_sequences`: (可选) List of strings，遇到这些序列时停止生成 33。
    - **System Prompts and Role Management**: 通过`messages.create()`方法中的`system`参数直接提供系统级指令 18。`messages`列表中的角色主要是`user`和`assistant`。
    - **Managing Multi-Turn Conversations**: 在`messages`列表中按顺序包含用户和助手的历史消息，以维持对话上下文 18。
        
        Python
        
        ```
        # response = client.messages.create(
        #     model="claude-3-5-sonnet-latest",
        #     max_tokens=1024,
        #     system="You are a poetic assistant.",
        #     messages=[
        #         {"role": "user", "content": "What is your favorite season?"},
        #         {"role": "assistant", "content": "I find beauty in all seasons, but the gentle bloom of spring holds a special charm."},
        #         {"role": "user", "content": "Can you write a short poem about it?"}
        #     ]
        # )
        ```
        
    - **Tool Use (Function Calling)**: Claude API支持工具使用。在`messages.create()`请求中通过`tools`参数定义可用工具的名称、描述和参数模式（JSON Schema）。模型会在响应中指示需要调用的工具（`tool_use`内容块）。应用执行工具后，将结果以包含`type: "tool_result"`、`tool_use_id`和`content`（工具输出）的消息块加回到`messages`列表，再次调用API [33 (Bedrock上下文，但描述了Claude工具结构), 33 (Bedrock), 18]。
        
        Python
        
        ```
        # 概念性示例，参考 [18]
        # tools =
        #         }
        #     }
        # ]
        # initial_response = client.messages.create(
        #     model="claude-3-opus-20240229", # 确保模型支持工具使用
        #     max_tokens=2000,
        #     messages=[{"role": "user", "content": "What's the stock price for Anthropic (if it were public)?"}],
        #     tools=tools
        # )
        # #... 检查 initial_response 是否包含 tool_use 请求...
        # # if tool_use_block:
        # #     tool_name = tool_use_block.name
        # #     tool_input = tool_use_block.input
        # #     tool_use_id = tool_use_block.id
        # #     #... 执行函数...
        # #     tool_result_content = "..." # 函数执行结果
        # #     
        # #     follow_up_messages = [
        # #         {"role": "user", "content": "What's the stock price for Anthropic (if it were public)?"},
        # #         {"role": "assistant", "content": [initial_response.content]}, # 原始模型的回复（包含tool_use请求）
        # #         {
        # #             "role": "user", 
        # #             "content": [
        # #                 {
        # #                     "type": "tool_result",
        # #                     "tool_use_id": tool_use_id,
        # #                     "content": tool_result_content 
        # #                     # "is_error": False (可选)
        # #                 }
        # #             ]
        # #         }
        # #     ]
        # #     final_response = client.messages.create(model="claude-3-opus-20240229", max_tokens=2000, messages=follow_up_messages)
        ```
        
- H. Robust Error Handling:
    
    SDK会处理常见的网络错误并支持重试。API会返回HTTP状态码，429 Too Many Requests表示速率超限 77。开发者应捕获SDK抛出的异常，并根据错误类型（如APIStatusError, RateLimitError）采取相应措施。
    
- I. Rate Limits and Quota Management:
    
    Anthropic API的速率限制基于RPM（每分钟请求数）、ITPM（每分钟输入Token数）和OTPM（每分钟输出Token数），这些限制针对每个模型类别分别设置 77。例如，Claude 3.7 Sonnet 的标准限制为50 RPM, 20,000 ITPM, 8,000 OTPM 77。
    
    存在一个基于消费额度的用量层级系统（Tier 1至Tier 4，以及月度发票用户），不同层级对应不同的月度最大消费上限 77。API响应头中会包含速率限制相关信息，如anthropic-ratelimit-requests-limit, anthropic-ratelimit-requests-remaining, retry-after等，帮助开发者监控用量 77。
    
    Message Batches API有其独立的速率限制 77。
    
- **J. Noteworthy Platform-Specific Features**:
    
    - **安全性与可靠性**: Anthropic强调其模型在“有用、无害、诚实”方面的设计原则 33。
    - **多模态输入**: 支持图像输入（例如，在`messages`的内容块中指定`type: "image"`）33。
    - **Claude for Sheets**: 一个Google Sheets插件，方便用户在电子表格中直接与Claude交互 76。
    - **Workbench**: Anthropic Console中提供的Web界面，用于测试提示、生成代码片段等 6。
    - **Vertex AI和AWS Bedrock集成**: Claude模型也可以通过Google Cloud Vertex AI和AWS Bedrock平台调用，这些平台可能有其自身的API封装和特性 33。

---

### 4.8 Grok (xAI)

- A. Provider Overview and Key Model Variants:
    
    xAI公司由埃隆·马斯克创立，其旗舰大语言模型为Grok。Grok系列模型包括Grok-3（及其变体如beta, fast-beta, mini-beta, mini-fast-beta）和Grok-2（及其视觉版本如vision）34。Grok API旨在提供对这些模型的编程访问。
    
- **B. API Access Setup**:
    
    1. 访问xAI开发者门户（docs.x.ai或类似地址）并创建xAI账户 7。
    2. 登录xAI API控制台，在API密钥页面生成API Key 7。
- **C. Python SDK: Installation and Environment Configuration**:
    
    - **SDK**: xAI Grok API与OpenAI API格式兼容 14。因此，推荐使用OpenAI的Python SDK进行调用 7。
        
        Bash
        
        ```
        pip install openai --upgrade
        ```
        
    - **API Key配置**: 将获取的xAI API Key设置为环境变量，例如`XAI_API_KEY` 7。
    - **Base URL配置**: 初始化OpenAI客户端时，`base_url`参数需指定为xAI的API端点：`https://api.x.ai/v1` 7。
    - 部分非官方资料提及了原生的`grok_api` Python客户端 83，但官方文档更侧重于OpenAI兼容性。
- **D. Foundational API Call (Synchronous) (via OpenAI SDK)**:
    
    - **Minimal Runnable Code Example**:
        
        Python
        
        ```
        import os
        from openai import OpenAI
        
        # 确保 XAI_API_KEY 已设置在环境变量中
        # os.environ["XAI_API_KEY"] = "YOUR_XAI_API_KEY"
        
        client = OpenAI(
            api_key=os.environ.get("XAI_API_KEY"), 
            base_url="https://api.x.ai/v1"
        )
        
        def call_grok_sync():
            try:
                completion = client.chat.completions.create(
                    model="grok-3-beta",  # 或 "grok-3-mini-beta" 等可用模型
                    messages=[
                        {"role": "system", "content": "You are Grok, a helpful AI assistant from xAI."},
                        {"role": "user", "content": "What is the airspeed velocity of an unladen swallow?"}
                    ],
                    max_tokens=150, # 示例参数
                    temperature=0.7   # 示例参数
                )
                print("Model Response:", completion.choices.message.content)
                if hasattr(completion, 'usage') and completion.usage:
                    print("Usage:", completion.usage)
            except Exception as e:
                print(f"An error occurred: {e}")
        
        if __name__ == '__main__':
            call_grok_sync()
        ```
        
        此示例基于 7 构建。
- E. Asynchronous API Calls (via OpenAI SDK):
    
    使用OpenAI SDK的异步客户端AsyncOpenAI，并配置xAI的base_url。目前提供的官方文档片段中未包含Python异步示例 7。
    
    Python
    
    ```
    import os
    import asyncio
    from openai import AsyncOpenAI
    
    # os.environ["XAI_API_KEY"] = "YOUR_XAI_API_KEY"
    
    client = AsyncOpenAI(
        api_key=os.environ.get("XAI_API_KEY"),
        base_url="https://api.x.ai/v1"
    )
    
    async def call_grok_async():
        try:
            completion = await client.chat.completions.create(
                model="grok-3-beta",
                messages=
            )
            print("Model Async Response:", completion.choices.message.content)
        except Exception as e:
            print(f"An async error occurred: {e}")
    
    if __name__ == '__main__':
        asyncio.run(call_grok_async())
    ```
    
- F. Streaming Responses (via OpenAI SDK):
    
    在create方法中设置stream=True。官方文档片段中未包含Python流式示例 7。
    
    Python
    
    ```
    import os
    from openai import OpenAI
    
    # os.environ["XAI_API_KEY"] = "YOUR_XAI_API_KEY"
    
    client = OpenAI(
        api_key=os.environ.get("XAI_API_KEY"),
        base_url="https://api.x.ai/v1"
    )
    
    def call_grok_stream():
        try:
            stream = client.chat.completions.create(
                model="grok-3-beta",
                messages=[
                    {"role": "user", "content": "Write a short story about a time-traveling historian."}
                ],
                stream=True
            )
            full_response_content = ""
            print("Streamed Response: ", end='')
            for chunk in stream:
                if chunk.choices and chunk.choices.delta and chunk.choices.delta.content:
                    content_piece = chunk.choices.delta.content
                    full_response_content += content_piece
                    print(content_piece, end='', flush=True)
            print("\nFull streamed response after completion:", full_response_content)
        except Exception as e:
            print(f"A streaming error occurred: {e}")
    
    if __name__ == '__main__':
        call_grok_stream()
    ```
    
- G. Mastering Core Parameters & Advanced Features:
    
    由于API与OpenAI兼容，核心参数也类似。
    
    - **Essential Parameters**:
        - `model`: (必选) String，模型ID，如 `grok-3-beta` 82。
        - `messages`: (必选) List，对话消息列表 82。
        - `temperature`: (可选) Float，控制随机性 82。
        - `max_tokens`: (可选) Integer，限制输出长度 82。
        - `top_p`: (可选) Float，核采样参数 (OpenAI兼容API通常支持)。
        - `reasoning_effort`: (可选) String，仅适用于`grok-3-mini`模型，可设为`'low'`或`'high'`，影响模型的思考时间和token消耗 34。
    - **System Prompts and Role Management**: 通过`messages`列表中的`{"role": "system", "content": "..."}`设置系统提示 7。
    - **Managing Multi-Turn Conversations**: 将包含对话历史的`messages`列表传递给API 7。
    - **Function Calling / Tool Integration**: Grok API支持函数调用。开发者可以在请求中定义工具（函数），模型会在需要时请求调用这些工具，并在响应中返回工具调用的ID和参数 27。应用执行函数后，将结果返回给模型。可以通过`tool_choice: "required"`强制模型调用函数 27。
- H. Robust Error Handling:
    
    API会返回标准的HTTP错误码，如401（认证失败）、429（速率超限）、500（服务器错误）83。使用OpenAI SDK时，这些错误会被封装。
    
- I. Rate Limits and Quota Management:
    
    xAI Grok API的速率限制信息在官方主要文档片段中不够明确和集中。官方文档 84 指出，不同Grok模型有不同的速率限制，用户应查阅其xAI控制台的模型页面了解团队的具体限制，并可通过邮件（support@x.ai）申请更高的限制。
    
    一些第三方或社区信息源 83 尝试给出具体的RPM或每日配额，但这些数据可能并非官方最新或不完全准确。例如，有提及免费用户可能是10 RPM，每日1000请求 86，或20请求/2小时 88；付费层级（如Professional, Enterprise, X Premium+订阅, SuperGrok订阅）则有更高的限制。
    
    这种信息的分散性使得开发者在初步评估和规划时，难以获得一个清晰、官方的速率限制全景。建议以用户在xAI控制台看到的具体配额为准。
    
- **J. Noteworthy Platform-Specific Features**:
    
    - **Grok特性**: 模型被设计为“最大限度地寻求真理”的AI，并具有一定的叛逆和幽默感 81。
    - **与X平台的关系**: Grok模型为X（前Twitter）平台上的部分功能提供支持，但其API服务是独立的 79。
    - **`reasoning_effort`参数**: 特定模型（如grok-3-mini）支持此参数，允许开发者调整模型的推理深度和资源消耗 34。
    - **OpenAI兼容性**: 使得熟悉OpenAI生态的开发者能较快上手。

---

### 4.9 Gemini (Google)

- A. Provider Overview and Key Model Variants:
    
    Google提供Gemini系列多模态模型，包括Gemini 1.0 Pro, Gemini 1.5 Pro, Gemini 1.5 Flash, Gemini 2.0 Flash等 22。这些模型支持文本、图像、音频和视频等多种输入类型。
    
- **B. API Access Setup**:
    
    1. 通过Google AI Studio或Google Cloud Console获取API密钥 91。
    2. 对于Google Cloud Vertex AI上的Gemini模型，需要设置Google Cloud项目并启用相关API。
- **C. Python SDK: Installation and Environment Configuration**:
    
    - **SDK安装**:
        
        Bash
        
        ```
        pip install google-generativeai --upgrade
        ```
        
        [91 (提及安装命令), 93]
    - **API Key配置**: 在初始化客户端时传入API Key，或设置为环境变量 `GOOGLE_API_KEY`。
        
        Python
        
        ```
        import google.generativeai as genai
        # genai.configure(api_key="YOUR_GOOGLE_API_KEY") # 或者在Client初始化时传入
        ```
        
        91
- **D. Foundational API Call (Synchronous)**:
    
    - **Minimal Runnable Code Example (Text Generation)**:
        
        Python
        
        ```
        import os
        import google.generativeai as genai
        
        # 从环境变量读取 API Key
        # genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))
        
        # 或者在创建 Client 时传入，但通常 configure 更方便
        # client = genai.Client(api_key="YOUR_API_KEY") # [91, 93] 提及的旧版初始化方式
        # 新版 SDK (google-generativeai) 通常使用 configure 或直接使用 GenerativeModel
        
        def call_gemini_sync_text():
            try:
                # 配置API Key (如果尚未通过环境变量或其他方式配置)
                api_key_env = os.environ.get("GOOGLE_API_KEY")
                if not api_key_env:
                    print("GOOGLE_API_KEY not set. Please set it or pass directly.")
                    # return # 在实际应用中，这里应该处理错误或提示用户
                    # 为使示例可运行，若无环境变量，可临时硬编码，但不推荐生产使用：
                    api_key_env = "YOUR_API_KEY_HERE_FOR_TESTING_ONLY" 
                    if api_key_env == "YOUR_API_KEY_HERE_FOR_TESTING_ONLY":
                         print("Warning: Using a placeholder API key. Replace with your actual key.")
        
                genai.configure(api_key=api_key_env)
        
                model = genai.GenerativeModel('gemini-1.5-flash-latest') # 或 'gemini-pro'
        
                prompt = "Explain the theory of relativity in simple terms."
                response = model.generate_content(prompt)
        
                print("Model Response:", response.text)
                # Gemini API 响应中通常不直接包含 token usage，需另行计算或查看控制台
            except Exception as e:
                print(f"An error occurred: {e}")
        
        if __name__ == '__main__':
            call_gemini_sync_text()
        ```
        
        此示例基于 93 (调整为新版SDK风格)。
- E. Asynchronous API Calls:
    
    Google Gemini Python SDK支持异步操作，通常通过GenerativeModel的异步版本或genai.ChatSession的异步方法实现。
    
    - **Minimal Runnable Code Example (Async Text Generation)**:
        
        Python
        
        ```
        import os
        import asyncio
        import google.generativeai as genai
        
        # genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))
        
        async def call_gemini_async_text():
            try:
                api_key_env = os.environ.get("GOOGLE_API_KEY")
                if not api_key_env:
                    print("GOOGLE_API_KEY not set.")
                    api_key_env = "YOUR_API_KEY_HERE_FOR_TESTING_ONLY"
                    if api_key_env == "YOUR_API_KEY_HERE_FOR_TESTING_ONLY":
                         print("Warning: Using a placeholder API key.")
                genai.configure(api_key=api_key_env)
        
                model = genai.GenerativeModel('gemini-1.5-flash-latest')
                prompt = "What are the main benefits of asynchronous programming?"
        
                # SDK v0.3.0+ 提供了 model.generate_content_async()
                response = await model.generate_content_async(prompt) 
        
                print("Model Async Response:", response.text)
            except Exception as e:
                print(f"An async error occurred: {e}")
        
        if __name__ == '__main__':
            asyncio.run(call_gemini_async_text())
        ```
        
        19 提供了`client.aio.models.generate_content_stream`的异步流式示例，这里改编为非流式异步。
- F. Streaming Responses:
    
    Gemini SDK支持同步和异步流式响应。
    
    - 同步流式: `model.generate_content(..., stream=True)` 或 `chat.send_message(..., stream=True)`。
    - 异步流式: `await model.generate_content_async(..., stream=True)` 或 `await chat.send_message_async(..., stream=True)`。或者如 19 所示的 `client.aio.models.generate_content_stream(...)` (旧版SDK风格)。
    - **Minimal Runnable Code Example (Async Streaming for Chat)**:
        
        Python
        
        ```
        import os
        import asyncio
        import google.generativeai as genai
        
        # genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))
        
        async def call_gemini_async_chat_stream():
            try:
                api_key_env = os.environ.get("GOOGLE_API_KEY")
                if not api_key_env:
                    print("GOOGLE_API_KEY not set.")
                    api_key_env = "YOUR_API_KEY_HERE_FOR_TESTING_ONLY"
                    if api_key_env == "YOUR_API_KEY_HERE_FOR_TESTING_ONLY":
                         print("Warning: Using a placeholder API key.")
                genai.configure(api_key=api_key_env)
        
                model = genai.GenerativeModel('gemini-1.5-flash-latest')
                chat = model.start_chat(history=) # Start a new chat session
        
                prompt = "Tell me a story about a friendly robot that explores a new planet."
        
                # For streaming chat responses
                response_stream = await chat.send_message_async(prompt, stream=True)
        
                full_response_content = ""
                print("Streamed Chat Response: ", end='')
                async for chunk in response_stream:
                    if chunk.text: # Check if text content exists in the chunk
                        full_response_content += chunk.text
                        print(chunk.text, end='', flush=True)
                print("\nFull streamed chat response after completion:", full_response_content)
            except Exception as e:
                print(f"\nA streaming chat error occurred: {e}")
        
        if __name__ == '__main__':
            asyncio.run(call_gemini_async_chat_stream())
        ```
        
        此示例结合了 19 的概念。
- **G. Mastering Core Parameters & Advanced Features**:
    
    - **Essential Parameters** (via `generation_config`):
        
        - `temperature`: (可选) Float, 控制随机性。
        - `top_p`: (可选) Float, 核采样。
        - `top_k`: (可选) Integer。
        - `max_output_tokens`: (可选) Integer，限制输出token数。
        - `stop_sequences`: (可选) List of strings，停止序列。
        - `candidate_count`: (可选) Integer, 要返回的候选响应数量。
        
        Python
        
        ```
        # generation_config = genai.types.GenerationConfig(
        #     temperature=0.7,
        #     top_p=0.9,
        #     max_output_tokens=1000
        # )
        # response = model.generate_content(prompt, generation_config=generation_config)
        ```
        
    - **System Prompts and Role Management**: 对于`GenerativeModel.generate_content`，可以通过在`contents`列表中包含一个具有特定结构的部分来模拟系统提示，或者对于支持`system_instruction`参数的模型（如`gemini-2.0-flash`）直接使用它 22。 对于`ChatSession` (`model.start_chat()`)，可以在初始化时传入`history`，其中可以包含代表系统设定的初始模型消息：
        
        Python
        
        ```
        # chat = model.start_chat(history=},
        #     {'role':'model', 'parts': [{'text': "Understood. I will maintain a formal tone."}]}
        # ])
        ```
        
        28 描述了`user`和`model`角色。
    - **Managing Multi-Turn Conversations**: 使用`GenerativeModel.start_chat()`创建`ChatSession`对象，该对象会自动管理对话历史。通过`chat.send_message()`或`chat.send_message_async()`发送新消息 28。 如果直接使用`generate_content`，则需要在`contents`参数中手动维护和传递包含`role: "user"`和`role: "model"`的完整对话历史列表 22。
    - **Function Calling / Tool Integration**: Gemini API支持函数调用（工具使用）。开发者可以在请求中定义工具（函数声明），模型可以预测何时调用这些函数并返回`FunctionCall`对象，包含函数名和参数。应用执行函数后，将`FunctionResponse`结果返回给模型以继续生成 22。
        
        Python
        
        ```
        # from google.generativeai.types import HarmCategory, HarmBlockThreshold, Tool, FunctionDeclaration
        # get_weather_func = FunctionDeclaration(
        #     name="get_current_weather",
        #     description="Get the current weather in a specific location",
        #     parameters={
        #         "type": "object",
        #         "properties": {
        #             "location": {"type": "string", "description": "The city and state, e.g., San Francisco, CA"}
        #         }
        #     }
        # )
        # tool_config = Tool(function_declarations=[get_weather_func])
        # model_with_tools = genai.GenerativeModel('gemini-1.5-pro-latest', tools=[tool_config]) # Or use tools parameter in generate_content
        # chat = model_with_tools.start_chat()
        # response = chat.send_message("What is the weather like in Boston?")
        # if response.candidates.content.parts.function_call:
        #     fc = response.candidates.content.parts.function_call
        #     #... execute function fc.name with fc.args...
        #     # weather_data =...
        #     # response = chat.send_message(
        #     #     Part.from_function_response(name=fc.name, response={"weather": weather_data})
        #     # )
        #     # print(response.text)
        ```
        
- H. Robust Error Handling:
    
    SDK会抛出异常，如google.api_core.exceptions.GoogleAPIError的子类。应捕获这些异常并根据错误类型进行处理（例如，速率限制错误、无效参数错误）。
    
- I. Rate Limits and Quota Management:
    
    Gemini API的速率限制按RPM（每分钟请求数）、RPD（每日请求数）、TPM（每分钟Token数）和TPD（每日Token数）四个维度衡量 91。限制因模型和项目的用量层级（Free, Tier 1, Tier 2, Tier 3）而异。例如，Gemini 1.5 Flash在免费层级的限制为15 RPM, 250,000 TPM, 500 RPD 91。通过关联结算账户并增加API使用和支出，可以升级到更高层级以获得更高的速率限制 91。
    
- **J. Noteworthy Platform-Specific Features**:
    
    - **强大的多模态能力**: Gemini模型原生支持文本、图像、音频、视频等多种输入模态 22。
    - **Vertex AI集成**: 与Google Cloud Vertex AI平台深度集成，提供企业级MLOps能力，如模型部署、监控和管理。
    - **Firebase SDK**: 为移动和Web应用开发者提供了便捷的Gemini API集成方式，包含App Check等安全特性 28。
    - **Google AI Studio**: 提供了一个用户友好的Web界面，用于快速实验Gemini模型、构建提示和获取API密钥 91。
    - **上下文长度**: 部分Gemini模型（如Gemini 1.5 Pro）支持超长上下文窗口（例如100万tokens）。

---

### 4.10 Llama (Meta)

- A. Provider Overview and Key Model Variants:
    
    Meta推出了Llama系列开源模型，并在近期开始通过官方“Llama API”提供托管服务。关键模型包括Llama 3系列（如Llama-3.3-8B-Instruct, Llama-3.3-70B-Instruct）和最新的Llama 4系列（如Llama-4-Scout, Llama-4-Maverick），后者具备原生多模态能力 35。本节主要关注Meta官方提供的Llama API。Llama模型也可通过Hugging Face、AWS Bedrock 98、Groq控制台 99 等第三方平台获取和部署。
    
- **B. API Access Setup (Meta Llama API)**:
    
    1. 访问Meta的Llama开发者门户（llama.developer.meta.com或llama.com）8。
    2. 可能需要加入Llama API的等待列表或遵循特定申请流程以获取API访问权限和API密钥 8。
- **C. Python SDK: Installation and Environment Configuration**:
    
    - **SDK安装**: Meta提供了官方的Python SDK `llama-api-client`。需要Python 3.8或更高版本 8。
        
        Bash
        
        ```
        pip install llama-api-client --upgrade
        ```
        
        8
    - **API Key配置**: 推荐将获取的Llama API Key设置为环境变量 `LLAMA_API_KEY` 8。SDK会自动读取。
        
        Bash
        
        ```
        export LLAMA_API_KEY="YOUR_LLAMA_API_KEY"
        ```
        
- **D. Foundational API Call (Synchronous)**:
    
    - **Minimal Runnable Code Example**:
        
        Python
        
        ```
        import os
        from llama_api_client import LlamaAPIClient
        
        # API Key 会从环境变量 LLAMA_API_KEY 自动读取
        # 如果未设置，可以在初始化时传入 api_key=os.environ.get("LLAMA_API_KEY", "YOUR_FALLBACK_KEY")
        client = LlamaAPIClient() 
        
        def call_llama_sync():
            try:
                # 使用 llama.developer.meta.com/docs/models 中列出的模型ID
                # 例如：Llama-4-Scout-17B-16E-Instruct-FP8 或 Llama-3.3-8B-Instruct
                response = client.chat.completions.create(
                    model="Llama-3.3-8B-Instruct", 
                    messages=[
                        {"role": "user", "content": "Hello Llama! What are your capabilities?"}
                    ]
                    # temperature=0.6, # 示例参数，来自 [103]
                    # max_tokens=1024  # 示例参数，来自 [103]
                )
                # 响应结构可能类似OpenAI，具体需查SDK文档或API返回
                # [8] 示例是 response.completion_message，但更可能是 response.choices.message.content
                if hasattr(response, 'choices') and response.choices:
                     print("Model Response:", response.choices.message.content)
                elif hasattr(response, 'completion_message') and response.completion_message: # 兼容旧版或特定响应结构
                     print("Model Response (completion_message):", response.completion_message)
                else:
                     print("Model Response (raw):", response)
        
                # Usage信息通常在响应对象中，具体字段名需查SDK文档
                # if hasattr(response, 'usage'): print("Usage:", response.usage)
        
            except Exception as e:
                print(f"An error occurred: {e}")
        
        if __name__ == '__main__':
            call_llama_sync()
        ```
        
        此示例基于 8 构建，并参考了 35 中的模型ID。
- E. Asynchronous API Calls:
    
    llama-api-client SDK提供了异步客户端 AsyncLlamaAPIClient。
    
    - **Minimal Runnable Code Example (Async)**:
        
        Python
        
        ```
        import os
        import asyncio
        from llama_api_client import AsyncLlamaAPIClient
        
        client = AsyncLlamaAPIClient() # API Key 从环境变量读取
        
        async def call_llama_async():
            try:
                response = await client.chat.completions.create(
                    model="Llama-3.3-8B-Instruct",
                    messages=[
                        {"role": "user", "content": "Write a short sci-fi story."}
                    ]
                )
                if hasattr(response, 'choices') and response.choices:
                     print("Model Async Response:", response.choices.message.content)
                elif hasattr(response, 'completion_message'):
                     print("Model Async Response (completion_message):", response.completion_message)
                else:
                     print("Model Async Response (raw):", response)
        
            except Exception as e:
                print(f"An async error occurred: {e}")
        
        if __name__ == '__main__':
            asyncio.run(call_llama_async())
        ```
        
        此示例基于 8。
- F. Streaming Responses:
    
    SDK支持同步和异步流式响应，通过在create方法中设置stream=True。
    
    - **Minimal Runnable Code Example (Async Streaming)**:
        
        Python
        
        ```
        import os
        import asyncio
        from llama_api_client import AsyncLlamaAPIClient
        
        client = AsyncLlamaAPIClient()
        
        async def call_llama_async_stream():
            try:
                stream = await client.chat.completions.create(
                    model="Llama-3.3-8B-Instruct",
                    messages=[
                        {"role": "user", "
        ```