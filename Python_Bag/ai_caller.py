import os
import yaml
import json
import uuid
import time
import requests
from typing import Union, Dict, List, Tuple, Any
import datetime

class AICallerConfigError(Exception):
    """配置文件相关错误"""
    pass

class AICallerAPIError(Exception):
    """API调用相关错误"""
    pass

class AICallerInputError(Exception):
    """输入参数相关错误"""
    pass

class ConfigManager:
    """配置管理器，处理YAML配置文件的加载和提供配置信息访问"""
    
    def __init__(self, config_path: str = None):
        """
        初始化配置管理器
        
        Args:
            config_path: YAML配置文件的路径，如果为None则在当前目录下寻找ai_caller_config.yaml
        """
        # 默认配置文件路径
        self.config_path = config_path or os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ai_caller_config.yaml')
        self.config = self._load_config()
    
    def _load_config(self) -> dict:
        """
        加载YAML配置文件
        
        Returns:
            dict: 配置信息字典
        
        Raises:
            AICallerConfigError: 配置文件不存在或格式错误
        """
        try:
            if not os.path.exists(self.config_path):
                raise AICallerConfigError(f"配置文件不存在: {self.config_path}")
            
            with open(self.config_path, 'r', encoding='utf-8') as f:
                config = yaml.safe_load(f)
                
            # 验证配置文件基本结构
            if not isinstance(config, dict):
                raise AICallerConfigError("配置文件格式错误，应为YAML字典格式")
                
            # 检查必要的字段
            if 'api_keys' not in config:
                raise AICallerConfigError("配置文件缺少'api_keys'字段")
                
            if 'prompts' not in config:
                raise AICallerConfigError("配置文件缺少'prompts'字段")
                
            return config
        except yaml.YAMLError as e:
            raise AICallerConfigError(f"配置文件YAML解析错误: {str(e)}")
        except Exception as e:
            raise AICallerConfigError(f"加载配置文件时发生错误: {str(e)}")
    
    def get_api_key(self, provider_name: str) -> str:
        """
        获取指定提供商的API密钥
        
        Args:
            provider_name: 提供商名称，如'openai'
            
        Returns:
            str: API密钥字符串
            
        Raises:
            AICallerConfigError: 找不到对应提供商的API密钥
        """
        if provider_name not in self.config.get('api_keys', {}):
            raise AICallerConfigError(f"配置文件中未找到{provider_name}的API密钥")
        return self.config['api_keys'][provider_name]
    
    def get_prompt_template(self, prompt_id: str) -> str:
        """
        获取指定ID的提示词模板
        
        Args:
            prompt_id: 提示词模板ID，如'translate_to_english'
            
        Returns:
            str: 提示词模板字符串
            
        Raises:
            AICallerConfigError: 找不到对应ID的提示词模板
        """
        if prompt_id not in self.config.get('prompts', {}):
            raise AICallerConfigError(f"配置文件中未找到提示词ID: {prompt_id}")
        return self.config['prompts'][prompt_id].get('content', '')
    
    def get_models(self, provider_name: str) -> List[str]:
        """
        获取指定提供商的模型列表
        
        Args:
            provider_name: 提供商名称，如'openai'
            
        Returns:
            List[str]: 模型列表，如果未找到则返回空列表
        """
        return self.config.get('models', {}).get(provider_name, [])
    
    def check_config_validity(self) -> bool:
        """
        检查配置文件格式是否有效
        
        Returns:
            bool: 配置文件是否有效
        """
        try:
            self._load_config()
            return True
        except:
            return False
            
    def list_available_prompt_ids(self) -> List[str]:
        """
        列出所有可用的提示词ID
        
        Returns:
            List[str]: 所有提示词ID的列表
        """
        return list(self.config.get('prompts', {}).keys())


class BaseProvider:
    """AI模型提供商的基类，定义通用接口和共享功能"""
    
    def __init__(self, config_manager: ConfigManager = None):
        """
        初始化基类
        
        Args:
            config_manager: 配置管理器实例，如果为None则创建一个新实例
        """
        self.config_manager = config_manager or ConfigManager()
        self.dialogue_id = None  # 当前对话的唯一ID
        self.dialogue_history = []  # 对话历史记录，用于连续对话模式
        self.dialogue_file_path = None  # 当前对话的历史记录文件路径
        
    def _format_prompt(self, prompt_id: str, data: Union[str, List, Dict]) -> str:
        """
        根据提示词ID和数据，格式化完整的提示词
        
        Args:
            prompt_id: 提示词模板ID
            data: 需要处理的数据
            
        Returns:
            str: 格式化后的完整提示词
            
        Raises:
            AICallerInputError: 提示词ID无效或数据格式不支持
        """
        try:
            prompt_template = self.config_manager.get_prompt_template(prompt_id)
            
            # 如果数据是字符串，直接替换占位符
            if isinstance(data, str):
                return prompt_template.replace('{data}', data)
            
            # 如果数据是列表或字典，转换为JSON字符串再替换
            elif isinstance(data, (list, dict)):
                return prompt_template.replace('{data}', json.dumps(data, ensure_ascii=False))
            
            else:
                raise AICallerInputError(f"不支持的数据类型: {type(data)}，仅支持字符串、列表或字典")
                
        except AICallerConfigError as e:
            # 向上重新抛出配置错误
            raise e
    
    def _get_output_with_matching_type(self, output_content: str, input_data: Union[str, List, Dict]) -> Union[str, List, Dict]:
        """
        根据输入数据类型，处理输出内容使其类型与输入匹配
        
        Args:
            output_content: 模型返回的文本内容
            input_data: 原始输入数据
            
        Returns:
            与输入数据类型匹配的处理后输出
        """
        # 如果输入是字符串，直接返回输出文本
        if isinstance(input_data, str):
            return output_content
        
        # 如果输入是列表或字典，尝试解析输出文本为相同类型
        elif isinstance(input_data, (list, dict)):
            try:
                # 首先尝试直接解析整个输出
                parsed_output = json.loads(output_content)
                
                # 检查解析后的类型是否与输入类型匹配
                if isinstance(parsed_output, type(input_data)):
                    return parsed_output
                else:
                    # 类型不匹配，尝试在输出文本中寻找JSON格式内容
                    import re
                    json_pattern = r'```json\n(.*?)\n```|```(.*?)```|\{.*\}|\[.*\]'
                    matches = re.findall(json_pattern, output_content, re.DOTALL)
                    
                    for match in matches:
                        match_text = match[0] if match[0] else match[1]
                        if match_text:
                            try:
                                parsed_match = json.loads(match_text)
                                if isinstance(parsed_match, type(input_data)):
                                    return parsed_match
                            except:
                                continue
                
                # 如果无法找到匹配的JSON，返回原始文本
                return output_content
                
            except json.JSONDecodeError:
                # 如果无法解析为JSON，返回原始文本
                return output_content
        
        # 默认返回原始文本
        return output_content
    
    def _init_dialogue(self, prompt_id: str) -> None:
        """
        初始化一个新的对话，设置唯一ID和创建历史记录文件
        
        Args:
            prompt_id: 对话使用的提示词ID，用于记录
        """
        # 生成唯一的对话ID
        self.dialogue_id = str(uuid.uuid4())
        
        # 清空对话历史
        self.dialogue_history = []
        
        # 创建历史记录文件
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        dialogues_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dialogues')
        
        # 确保对话目录存在
        os.makedirs(dialogues_dir, exist_ok=True)
        
        # 创建历史记录文件名：提示词ID_时间戳_对话ID.md
        safe_prompt_id = prompt_id.replace('/', '_').replace('\\', '_')
        filename = f"{safe_prompt_id}_{timestamp}_{self.dialogue_id[:8]}.md"
        self.dialogue_file_path = os.path.join(dialogues_dir, filename)
        
        # 创建并初始化历史记录文件
        with open(self.dialogue_file_path, 'w', encoding='utf-8') as f:
            f.write(f"# 对话记录: {prompt_id}\n\n")
            f.write(f"- **对话ID**: {self.dialogue_id}\n")
            f.write(f"- **开始时间**: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"- **提示词ID**: {prompt_id}\n\n")
            f.write("## 对话内容\n\n")
    
    def _update_dialogue_history(self, role: str, content: Any) -> None:
        """
        更新对话历史记录
        
        Args:
            role: 消息角色，如'user'或'assistant'
            content: 消息内容
        """
        if self.dialogue_file_path and os.path.exists(self.dialogue_file_path):
            with open(self.dialogue_file_path, 'a', encoding='utf-8') as f:
                if role == 'user':
                    f.write(f"### 用户\n\n")
                elif role == 'assistant':
                    f.write(f"### 助手\n\n")
                else:
                    f.write(f"### {role}\n\n")
                
                # 如果内容是字典或列表，转为格式化的JSON字符串
                if isinstance(content, (dict, list)):
                    f.write(f"```json\n{json.dumps(content, ensure_ascii=False, indent=2)}\n```\n\n")
                else:
                    f.write(f"{content}\n\n")
    
    def end_dialogue(self) -> None:
        """
        结束当前对话，关闭会话并完成必要的清理
        """
        if self.dialogue_file_path and os.path.exists(self.dialogue_file_path):
            with open(self.dialogue_file_path, 'a', encoding='utf-8') as f:
                f.write(f"\n## 对话结束\n\n")
                f.write(f"- **结束时间**: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        
        # 清空会话状态
        self.dialogue_id = None
        self.dialogue_history = []
        self.dialogue_file_path = None
        
        print("对话已结束")
    
    def invoke(self, model_type: str, prompt_id: str, call_mode: str, data: Union[str, List, Dict]) -> Tuple[Union[str, List, Dict], str, int]:
        """
        调用AI模型处理数据 (需要子类实现)
        
        Args:
            model_type: AI模型型号
            prompt_id: 提示词ID
            call_mode: 调用模式，'single_response'或'continuous_dialogue'
            data: 需要处理的数据，可以是字符串、列表或字典
            
        Returns:
            Tuple: (处理后的数据, 对话ID, 消耗的Token数)
            
        Raises:
            NotImplementedError: 此方法需要由子类实现
        """
        raise NotImplementedError("子类必须实现invoke方法")


class OpenAIProvider(BaseProvider):
    """OpenAI模型提供商的实现类"""
    
    def __init__(self, config_manager: ConfigManager = None):
        """初始化OpenAI提供商"""
        super().__init__(config_manager)
        # 尝试获取API密钥以验证配置
        try:
            self.api_key = self.config_manager.get_api_key('openai')
        except AICallerConfigError as e:
            raise AICallerConfigError(f"OpenAI初始化失败: {str(e)}")
    
    def _make_api_call(self, model_type: str, messages: List[Dict[str, str]], max_retries: int = 3) -> Dict:
        """
        调用OpenAI API
        
        Args:
            model_type: OpenAI模型型号，如'gpt-4o'
            messages: 消息列表
            max_retries: 最大重试次数
            
        Returns:
            Dict: API响应
            
        Raises:
            AICallerAPIError: API调用失败
        """
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        payload = {
            "model": model_type,
            "messages": messages
        }
        
        retries = 0
        
        while retries <= max_retries:
            try:
                response = requests.post(url, headers=headers, json=payload)
                response.raise_for_status()
                return response.json()
            
            except requests.exceptions.RequestException as e:
                retries += 1
                
                # 如果是429错误（速率限制），等待一段时间后重试
                if hasattr(e, 'response') and e.response is not None and e.response.status_code == 429:
                    # 指数退避策略，每次重试等待更长时间
                    wait_time = 2 ** retries
                    print(f"达到API速率限制，等待{wait_time}秒后重试...")
                    time.sleep(wait_time)
                    continue
                
                # 如果已经尝试了最大重试次数，或者是非临时性错误，就放弃
                elif retries > max_retries or (hasattr(e, 'response') and e.response is not None and e.response.status_code != 429):
                    error_message = str(e)
                    if hasattr(e, 'response') and e.response is not None:
                        error_message = f"HTTP错误 {e.response.status_code}: {e.response.text}"
                    raise AICallerAPIError(f"OpenAI API调用失败: {error_message}")
                
                # 其他错误也等待一段时间后重试
                else:
                    wait_time = 2 ** retries
                    print(f"API调用失败，等待{wait_time}秒后重试...")
                    time.sleep(wait_time)
                    continue
    
    def invoke(self, model_type: str, prompt_id: str, call_mode: str, data: Union[str, List, Dict]) -> Tuple[Union[str, List, Dict], str, int]:
        """
        调用OpenAI模型处理数据
        
        Args:
            model_type: OpenAI模型型号，如'gpt-4o'
            prompt_id: 提示词ID
            call_mode: 调用模式，'single_response'或'continuous_dialogue' 
            data: 需要处理的数据，可以是字符串、列表或字典
            
        Returns:
            Tuple: (处理后的数据, 对话ID, 消耗的Token数)
            
        Raises:
            AICallerInputError: 无效的调用模式
            AICallerAPIError: API调用失败
        """
        # 验证调用模式
        if call_mode not in ['single_response', 'continuous_dialogue']:
            raise AICallerInputError(f"无效的调用模式: {call_mode}，仅支持'single_response'或'continuous_dialogue'")
            
        # 格式化提示词
        formatted_prompt = self._format_prompt(prompt_id, data)
        
        # 根据调用模式处理请求
        if call_mode == 'single_response':
            # 单次响应模式
            messages = [{"role": "user", "content": formatted_prompt}]
            
            # 调用API
            response = self._make_api_call(model_type, messages)
            
            # 提取响应内容
            output_content = response['choices'][0]['message']['content']
            
            # 生成唯一ID用于此次调用
            call_id = str(uuid.uuid4())
            
            # 提取Token使用信息
            tokens_used = response['usage']['total_tokens']
            
            # 根据输入类型处理输出
            processed_output = self._get_output_with_matching_type(output_content, data)
            
            return processed_output, call_id, tokens_used
            
        else:  # continuous_dialogue模式
            # 如果是新对话，初始化对话状态
            if not self.dialogue_id:
                self._init_dialogue(prompt_id)
            
            # 更新对话历史(用户输入)
            self.dialogue_history.append({"role": "user", "content": formatted_prompt})
            self._update_dialogue_history('user', formatted_prompt)
            
            # 调用API
            response = self._make_api_call(model_type, self.dialogue_history)
            
            # 提取响应内容
            output_content = response['choices'][0]['message']['content']
            
            # 更新对话历史(AI响应)
            self.dialogue_history.append({"role": "assistant", "content": output_content})
            self._update_dialogue_history('assistant', output_content)
            
            # 提取Token使用信息
            tokens_used = response['usage']['total_tokens']
            
            # 根据输入类型处理输出
            processed_output = self._get_output_with_matching_type(output_content, data)
            
            return processed_output, self.dialogue_id, tokens_used


class ZhipuAIProvider(BaseProvider):
    """智谱AI（ZhipuAI）模型提供商的实现类"""
    
    def __init__(self, config_manager: ConfigManager = None):
        """初始化智谱AI提供商"""
        super().__init__(config_manager)
        # 尝试获取API密钥以验证配置
        try:
            self.api_key = self.config_manager.get_api_key('zhipuai')
        except AICallerConfigError as e:
            raise AICallerConfigError(f"ZhipuAI初始化失败: {str(e)}")
    
    def _make_api_call(self, model_type: str, messages: List[Dict[str, str]], max_retries: int = 3) -> Dict:
        """
        调用智谱AI API
        
        Args:
            model_type: 智谱AI模型型号，如'glm-4'
            messages: 消息列表
            max_retries: 最大重试次数
            
        Returns:
            Dict: API响应
            
        Raises:
            AICallerAPIError: API调用失败
        """
        url = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        payload = {
            "model": model_type,
            "messages": messages,
            "temperature": 0.7,
            "top_p": 0.7
        }
        
        retries = 0
        
        while retries <= max_retries:
            try:
                response = requests.post(url, headers=headers, json=payload)
                response.raise_for_status()
                return response.json()
            
            except requests.exceptions.RequestException as e:
                retries += 1
                
                # 如果是429错误（速率限制），等待一段时间后重试
                if hasattr(e, 'response') and e.response is not None and e.response.status_code == 429:
                    wait_time = 2 ** retries
                    print(f"达到API速率限制，等待{wait_time}秒后重试...")
                    time.sleep(wait_time)
                    continue
                
                # 如果已经尝试了最大重试次数，或者是非临时性错误，就放弃
                elif retries > max_retries or (hasattr(e, 'response') and e.response is not None and e.response.status_code != 429):
                    error_message = str(e)
                    if hasattr(e, 'response') and e.response is not None:
                        error_message = f"HTTP错误 {e.response.status_code}: {e.response.text}"
                    raise AICallerAPIError(f"ZhipuAI API调用失败: {error_message}")
                
                # 其他错误也等待一段时间后重试
                else:
                    wait_time = 2 ** retries
                    print(f"API调用失败，等待{wait_time}秒后重试...")
                    time.sleep(wait_time)
                    continue
    
    def invoke(self, model_type: str, prompt_id: str, call_mode: str, data: Union[str, List, Dict]) -> Tuple[Union[str, List, Dict], str, int]:
        """
        调用智谱AI模型处理数据
        
        Args:
            model_type: 智谱AI模型型号，如'glm-4'
            prompt_id: 提示词ID
            call_mode: 调用模式，'single_response'或'continuous_dialogue' 
            data: 需要处理的数据，可以是字符串、列表或字典
            
        Returns:
            Tuple: (处理后的数据, 对话ID, 消耗的Token数)
            
        Raises:
            AICallerInputError: 无效的调用模式
            AICallerAPIError: API调用失败
        """
        # 验证调用模式
        if call_mode not in ['single_response', 'continuous_dialogue']:
            raise AICallerInputError(f"无效的调用模式: {call_mode}，仅支持'single_response'或'continuous_dialogue'")
            
        # 格式化提示词
        formatted_prompt = self._format_prompt(prompt_id, data)
        
        # 根据调用模式处理请求
        if call_mode == 'single_response':
            # 单次响应模式
            messages = [{"role": "user", "content": formatted_prompt}]
            
            # 调用API
            response = self._make_api_call(model_type, messages)
            
            # 提取响应内容
            output_content = response['choices'][0]['message']['content']
            
            # 生成唯一ID用于此次调用
            call_id = str(uuid.uuid4())
            
            # 提取Token使用信息
            tokens_used = response['usage']['total_tokens']
            
            # 根据输入类型处理输出
            processed_output = self._get_output_with_matching_type(output_content, data)
            
            return processed_output, call_id, tokens_used
            
        else:  # continuous_dialogue模式
            # 如果是新对话，初始化对话状态
            if not self.dialogue_id:
                self._init_dialogue(prompt_id)
            
            # 更新对话历史(用户输入)
            self.dialogue_history.append({"role": "user", "content": formatted_prompt})
            self._update_dialogue_history('user', formatted_prompt)
            
            # 调用API
            response = self._make_api_call(model_type, self.dialogue_history)
            
            # 提取响应内容
            output_content = response['choices'][0]['message']['content']
            
            # 更新对话历史(AI响应)
            self.dialogue_history.append({"role": "assistant", "content": output_content})
            self._update_dialogue_history('assistant', output_content)
            
            # 提取Token使用信息
            tokens_used = response['usage']['total_tokens']
            
            # 根据输入类型处理输出
            processed_output = self._get_output_with_matching_type(output_content, data)
            
            return processed_output, self.dialogue_id, tokens_used


class DeepSeekProvider(BaseProvider):
    """DeepSeek模型提供商的实现类"""
    
    def __init__(self, config_manager: ConfigManager = None):
        """初始化DeepSeek提供商"""
        super().__init__(config_manager)
        # 尝试获取API密钥以验证配置
        try:
            self.api_key = self.config_manager.get_api_key('deepseek')
        except AICallerConfigError as e:
            raise AICallerConfigError(f"DeepSeek初始化失败: {str(e)}")
    
    def _make_api_call(self, model_type: str, messages: List[Dict[str, str]], max_retries: int = 3) -> Dict:
        """
        调用DeepSeek API
        
        Args:
            model_type: DeepSeek模型型号，如'deepseek-chat'
            messages: 消息列表
            max_retries: 最大重试次数
            
        Returns:
            Dict: API响应
            
        Raises:
            AICallerAPIError: API调用失败
        """
        url = "https://api.deepseek.com/v1/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        payload = {
            "model": model_type,
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 1000
        }
        
        retries = 0
        
        while retries <= max_retries:
            try:
                response = requests.post(url, headers=headers, json=payload)
                response.raise_for_status()
                return response.json()
            
            except requests.exceptions.RequestException as e:
                retries += 1
                
                # 如果是429错误（速率限制），等待一段时间后重试
                if hasattr(e, 'response') and e.response is not None and e.response.status_code == 429:
                    wait_time = 2 ** retries
                    print(f"达到API速率限制，等待{wait_time}秒后重试...")
                    time.sleep(wait_time)
                    continue
                
                # 如果已经尝试了最大重试次数，或者是非临时性错误，就放弃
                elif retries > max_retries or (hasattr(e, 'response') and e.response is not None and e.response.status_code != 429):
                    error_message = str(e)
                    if hasattr(e, 'response') and e.response is not None:
                        error_message = f"HTTP错误 {e.response.status_code}: {e.response.text}"
                    raise AICallerAPIError(f"DeepSeek API调用失败: {error_message}")
                
                # 其他错误也等待一段时间后重试
                else:
                    wait_time = 2 ** retries
                    print(f"API调用失败，等待{wait_time}秒后重试...")
                    time.sleep(wait_time)
                    continue
    
    def invoke(self, model_type: str, prompt_id: str, call_mode: str, data: Union[str, List, Dict]) -> Tuple[Union[str, List, Dict], str, int]:
        """
        调用DeepSeek模型处理数据
        
        Args:
            model_type: DeepSeek模型型号，如'deepseek-chat'
            prompt_id: 提示词ID
            call_mode: 调用模式，'single_response'或'continuous_dialogue' 
            data: 需要处理的数据，可以是字符串、列表或字典
            
        Returns:
            Tuple: (处理后的数据, 对话ID, 消耗的Token数)
            
        Raises:
            AICallerInputError: 无效的调用模式
            AICallerAPIError: API调用失败
        """
        # 验证调用模式
        if call_mode not in ['single_response', 'continuous_dialogue']:
            raise AICallerInputError(f"无效的调用模式: {call_mode}，仅支持'single_response'或'continuous_dialogue'")
            
        # 格式化提示词
        formatted_prompt = self._format_prompt(prompt_id, data)
        
        # 根据调用模式处理请求
        if call_mode == 'single_response':
            # 单次响应模式
            messages = [{"role": "user", "content": formatted_prompt}]
            
            # 调用API
            response = self._make_api_call(model_type, messages)
            
            # 提取响应内容
            output_content = response['choices'][0]['message']['content']
            
            # 生成唯一ID用于此次调用
            call_id = str(uuid.uuid4())
            
            # 提取Token使用信息
            tokens_used = response['usage']['total_tokens']
            
            # 根据输入类型处理输出
            processed_output = self._get_output_with_matching_type(output_content, data)
            
            return processed_output, call_id, tokens_used
            
        else:  # continuous_dialogue模式
            # 如果是新对话，初始化对话状态
            if not self.dialogue_id:
                self._init_dialogue(prompt_id)
            
            # 更新对话历史(用户输入)
            self.dialogue_history.append({"role": "user", "content": formatted_prompt})
            self._update_dialogue_history('user', formatted_prompt)
            
            # 调用API
            response = self._make_api_call(model_type, self.dialogue_history)
            
            # 提取响应内容
            output_content = response['choices'][0]['message']['content']
            
            # 更新对话历史(AI响应)
            self.dialogue_history.append({"role": "assistant", "content": output_content})
            self._update_dialogue_history('assistant', output_content)
            
            # 提取Token使用信息
            tokens_used = response['usage']['total_tokens']
            
            # 根据输入类型处理输出
            processed_output = self._get_output_with_matching_type(output_content, data)
            
            return processed_output, self.dialogue_id, tokens_used


class BaiduQianfanProvider(BaseProvider):
    """百度千帆大模型提供商实现类"""
    
    def __init__(self, config_manager: ConfigManager = None):
        """初始化百度千帆提供商"""
        super().__init__(config_manager)
        # 尝试获取API密钥以验证配置
        try:
            self.api_key = self.config_manager.get_api_key('qianfan')
            self.secret_key = self.config_manager.get_api_key('qianfan_secret')
        except AICallerConfigError as e:
            raise AICallerConfigError(f"百度千帆初始化失败: {str(e)}")
        self.access_token = None
        self.token_expire_time = 0

    def _get_access_token(self) -> str:
        """
        获取百度千帆API的access_token
        
        Returns:
            str: access_token
            
        Raises:
            AICallerAPIError: API调用失败
        """
        # 如果token未过期且存在，直接返回
        current_time = time.time()
        if self.access_token and current_time < self.token_expire_time:
            return self.access_token
            
        # 否则重新获取token
        url = "https://aip.baidubce.com/oauth/2.0/token"
        params = {
            "grant_type": "client_credentials",
            "client_id": self.api_key,
            "client_secret": self.secret_key
        }
        
        try:
            response = requests.post(url, params=params)
            response.raise_for_status()
            result = response.json()
            if "access_token" not in result:
                raise AICallerAPIError(f"百度千帆获取access_token失败: {result}")
                
            self.access_token = result["access_token"]
            # token有效期通常为30天，此处设置29天过期
            self.token_expire_time = current_time + 29 * 24 * 60 * 60
            return self.access_token
        except requests.RequestException as e:
            raise AICallerAPIError(f"百度千帆获取access_token网络错误: {str(e)}")
    
    def _make_api_call(self, model_type: str, messages: List[Dict[str, str]], max_retries: int = 3) -> Dict:
        """
        调用百度千帆API
        
        Args:
            model_type: 模型类型，如'ernie-bot-4'
            messages: 消息列表
            max_retries: 最大重试次数
            
        Returns:
            Dict: API响应
            
        Raises:
            AICallerAPIError: API调用失败
        """
        # 获取access_token
        access_token = self._get_access_token()
        
        # 根据模型选择对应的API接口
        url = f"https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/{model_type}"
        url = f"{url}?access_token={access_token}"
        
        headers = {
            "Content-Type": "application/json"
        }
        
        payload = {
            "messages": messages,
            "temperature": 0.7,
            "top_p": 0.9
        }
        
        retries = 0
        last_error = None
        
        while retries <= max_retries:
            try:
                response = requests.post(url, headers=headers, json=payload, timeout=30)
                response.raise_for_status()
                return response.json()
            except requests.RequestException as e:
                last_error = e
                retries += 1
                # 指数退避
                wait_time = 2 ** retries
                time.sleep(wait_time)
                
        raise AICallerAPIError(f"百度千帆API调用失败，已重试{max_retries}次: {str(last_error)}")
    
    def invoke(self, model_type: str, prompt_id: str = None, call_mode: str = 'single_response', 
              data: Any = None, system_prompt: str = None, dialogue_id: str = None, 
              history: List[Dict[str, str]] = None, **kwargs) -> Tuple[str, str, Dict]:
        """
        调用百度千帆API进行对话
        
        Args:
            model_type: 模型类型，如'ernie-bot-4'
            prompt_id: 提示词ID
            call_mode: 调用模式，'single_response'或'continuous_dialogue'
            data: 传入数据
            system_prompt: 系统提示词
            dialogue_id: 对话ID
            history: 历史对话记录
            **kwargs: 其他参数
            
        Returns:
            Tuple[str, str, Dict]: (响应文本, 对话ID, token使用统计)
            
        Raises:
            AICallerAPIError: API调用失败
            AICallerInputError: 输入参数错误
        """
        # 支持的模型列表
        supported_models = ["ernie-bot", "ernie-bot-4", "ernie-bot-turbo", "ernie-speed"]
        if model_type not in supported_models and not model_type.startswith("ernie-"):
            model_type = "ernie-bot-4"  # 默认使用ernie-bot-4
            
        # 构建消息列表
        messages = []
        
        # 添加系统提示词
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        
        # 处理历史记录
        if call_mode == 'continuous_dialogue' and history:
            messages.extend(history)
        
        # 处理提示词
        content = data
        if prompt_id:
            prompt_template = self.config_manager.get_prompt_template(prompt_id)
            content = prompt_template.replace("{data}", str(data)) if data else prompt_template
        
        # 添加用户消息
        messages.append({"role": "user", "content": content})
        
        # 调用API
        response = self._make_api_call(model_type, messages)
        
        # 处理响应
        if "error_code" in response:
            raise AICallerAPIError(f"百度千帆API错误: {response.get('error_msg', '未知错误')}")
            
        result = response.get("result", "")
        
        # 生成对话ID
        if not dialogue_id:
            dialogue_id = str(uuid.uuid4())
            
        # 构建token使用统计
        usage = {
            "prompt_tokens": response.get("usage", {}).get("prompt_tokens", 0),
            "completion_tokens": response.get("usage", {}).get("completion_tokens", 0),
            "total_tokens": response.get("usage", {}).get("total_tokens", 0)
        }
        
        return result, dialogue_id, usage


class AliQwenProvider(BaseProvider):
    """阿里千问大模型提供商实现类"""
    
    def __init__(self, config_manager: ConfigManager = None):
        """初始化阿里千问提供商"""
        super().__init__(config_manager)
        # 尝试获取API密钥以验证配置
        try:
            self.api_key = self.config_manager.get_api_key('aliqwen')
        except AICallerConfigError as e:
            raise AICallerConfigError(f"阿里千问初始化失败: {str(e)}")
    
    def _make_api_call(self, model_type: str, messages: List[Dict[str, str]], max_retries: int = 3) -> Dict:
        """
        调用阿里千问API
        
        Args:
            model_type: 模型类型，如'qwen-turbo-latest'
            messages: 消息列表
            max_retries: 最大重试次数
            
        Returns:
            Dict: API响应
            
        Raises:
            AICallerAPIError: API调用失败
        """
        url = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation"
        
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        payload = {
            "model": model_type,
            "input": {
                "messages": messages
            },
            "parameters": {
                "temperature": 0.7,
                "top_p": 0.8,
                "result_format": "message"
            }
        }
        
        retries = 0
        last_error = None
        
        while retries <= max_retries:
            try:
                response = requests.post(url, headers=headers, json=payload, timeout=30)
                response.raise_for_status()
                return response.json()
            except requests.RequestException as e:
                last_error = e
                retries += 1
                # 指数退避
                wait_time = 2 ** retries
                time.sleep(wait_time)
                
                if hasattr(e, 'response') and e.response is not None and e.response.status_code == 429:
                    wait_time = 5 * retries  # 速率限制时等待更长时间
                    print(f"达到API速率限制，等待{wait_time}秒后重试...")
                    time.sleep(wait_time)
                
                if retries > max_retries:
                    break
        
        error_message = str(last_error)
        if hasattr(last_error, 'response') and last_error.response is not None:
            try:
                error_detail = last_error.response.json()
                error_message = f"HTTP错误 {last_error.response.status_code}: {json.dumps(error_detail)}"
            except:
                error_message = f"HTTP错误 {last_error.response.status_code}: {last_error.response.text}"
                
        raise AICallerAPIError(f"阿里千问API调用失败，已重试{max_retries}次: {error_message}")
    
    def invoke(self, model_type: str, prompt_id: str, call_mode: str, data: Union[str, List, Dict]) -> Tuple[Union[str, List, Dict], str, int]:
        """
        调用阿里千问模型处理数据
        
        Args:
            model_type: 阿里千问模型型号，如'qwen-turbo-latest'
            prompt_id: 提示词ID
            call_mode: 调用模式，'single_response'或'continuous_dialogue' 
            data: 需要处理的数据，可以是字符串、列表或字典
            
        Returns:
            Tuple: (处理后的数据, 对话ID, 消耗的Token数)
            
        Raises:
            AICallerInputError: 无效的调用模式
            AICallerAPIError: API调用失败
        """
        # 验证调用模式
        if call_mode not in ['single_response', 'continuous_dialogue']:
            raise AICallerInputError(f"无效的调用模式: {call_mode}，仅支持'single_response'或'continuous_dialogue'")
            
        # 格式化提示词
        formatted_prompt = self._format_prompt(prompt_id, data)
        
        # 根据调用模式处理请求
        if call_mode == 'single_response':
            # 单次响应模式
            messages = [{"role": "user", "content": formatted_prompt}]
            
            # 调用API
            response = self._make_api_call(model_type, messages)
            
            # 提取响应内容
            output_content = response['output']['choices'][0]['message']['content']
            
            # 生成唯一ID用于此次调用
            call_id = str(uuid.uuid4())
            
            # 提取Token使用信息
            tokens_used = response['usage']['total_tokens']
            
            # 根据输入类型处理输出
            processed_output = self._get_output_with_matching_type(output_content, data)
            
            return processed_output, call_id, tokens_used
            
        else:  # continuous_dialogue模式
            # 如果是新对话，初始化对话状态
            if not self.dialogue_id:
                self._init_dialogue(prompt_id)
            
            # 更新对话历史(用户输入)
            self.dialogue_history.append({"role": "user", "content": formatted_prompt})
            self._update_dialogue_history('user', formatted_prompt)
            
            # 调用API
            response = self._make_api_call(model_type, self.dialogue_history)
            
            # 提取响应内容
            output_content = response['output']['choices'][0]['message']['content']
            
            # 更新对话历史(AI响应)
            self.dialogue_history.append({"role": "assistant", "content": output_content})
            self._update_dialogue_history('assistant', output_content)
            
            # 提取Token使用信息
            tokens_used = response['usage']['total_tokens']
            
            # 根据输入类型处理输出
            processed_output = self._get_output_with_matching_type(output_content, data)
            
            return processed_output, self.dialogue_id, tokens_used


class PackageUtils:
    """提供包的辅助功能"""
    
    def __init__(self, config_manager: ConfigManager):
        """初始化辅助功能类"""
        self.config_manager = config_manager
    
    def check_config_validity(self) -> bool:
        """
        检查配置文件是否有效
        
        Returns:
            bool: 配置文件是否有效
        """
        return self.config_manager.check_config_validity()
    
    def list_available_prompt_ids(self) -> List[str]:
        """
        列出所有可用的提示词ID
        
        Returns:
            List[str]: 提示词ID列表
        """
        return self.config_manager.list_available_prompt_ids()
    
    def test_api_connectivity(self, provider_name: str, model_type: str = None, max_retries: int = 3) -> Tuple[bool, str]:
        """
        测试与指定提供商API的连接性，最多重试三次
        
        Args:
            provider_name: 提供商名称，如'openai'
            model_type: 模型型号，如'gpt-4o'，如果为None则使用默认模型
            max_retries: 最大重试次数
            
        Returns:
            Tuple[bool, str]: (连接是否成功, 状态信息)
        """
        retries = 0
        last_error = None
        
        while retries <= max_retries:
            try:
                if provider_name == 'openai':
                    provider = OpenAIProvider(self.config_manager)
                    # 如果未指定模型，尝试从配置中获取默认模型
                    model = model_type
                    if not model:
                        models = self.config_manager.config.get('models', {}).get('openai', [])
                        model = models[0] if models else 'gpt-3.5-turbo'
                    
                    # 使用简单的提示进行测试
                    test_messages = [{"role": "user", "content": "Hello, this is a connectivity test."}]
                    response = provider._make_api_call(model, test_messages)
                    
                    if 'choices' in response and len(response['choices']) > 0:
                        return True, f"成功连接到OpenAI API，使用模型: {model}"
                    else:
                        return False, "API响应格式不正确"
                
                elif provider_name == 'zhipuai':
                    provider = ZhipuAIProvider(self.config_manager)
                    # 如果未指定模型，尝试从配置中获取默认模型
                    model = model_type
                    if not model:
                        models = self.config_manager.config.get('models', {}).get('zhipuai', [])
                        model = models[0] if models else 'glm-4'
                    
                    # 使用简单的提示进行测试
                    test_messages = [{"role": "user", "content": "你好，这是一个连接测试。"}]
                    response = provider._make_api_call(model, test_messages)
                    
                    if 'choices' in response and len(response['choices']) > 0:
                        return True, f"成功连接到智谱AI API，使用模型: {model}"
                    else:
                        return False, "API响应格式不正确"
                
                elif provider_name == 'deepseek':
                    provider = DeepSeekProvider(self.config_manager)
                    # 如果未指定模型，尝试从配置中获取默认模型
                    model = model_type
                    if not model:
                        models = self.config_manager.config.get('models', {}).get('deepseek', [])
                        model = models[0] if models else 'deepseek-chat'
                    
                    # 使用简单的提示进行测试
                    test_messages = [{"role": "user", "content": "你好，这是一个连接测试。"}]
                    response = provider._make_api_call(model, test_messages)
                    
                    if 'choices' in response and len(response['choices']) > 0:
                        return True, f"成功连接到DeepSeek API，使用模型: {model}"
                    else:
                        return False, "API响应格式不正确"
                
                elif provider_name == 'aliqwen':
                    provider = AliQwenProvider(self.config_manager)
                    # 如果未指定模型，尝试从配置中获取默认模型
                    model = model_type
                    if not model:
                        models = self.config_manager.config.get('models', {}).get('aliqwen', [])
                        model = models[0] if models else 'qwen-turbo-latest'
                    
                    # 使用简单的提示进行测试
                    test_messages = [{"role": "user", "content": "你好，这是一个连接测试。"}]
                    response = provider._make_api_call(model, test_messages)
                    
                    if 'output' in response and 'choices' in response['output']:
                        return True, f"成功连接到阿里千问API，使用模型: {model}"
                    else:
                        return False, "API响应格式不正确"
                
                else:
                    return False, f"未支持的提供商: {provider_name}"
                    
            except Exception as e:
                retries += 1
                last_error = str(e)
                if retries <= max_retries:
                    wait_time = 2 ** retries  # 指数退避
                    print(f"连接测试失败，正在进行第{retries}次重试，等待{wait_time}秒...")
                    time.sleep(wait_time)
                else:
                    break
                
        return False, f"连接测试失败({max_retries}次尝试后): {last_error}"


class AICaller:
    """
    AI调用包主入口类，简化调用流程
    """
    
    def __init__(self, config_path: str = None):
        """
        初始化AI调用器
        
        Args:
            config_path: 可选的配置文件路径
        """
        self.config_manager = ConfigManager(config_path)
        self.utils = PackageUtils(self.config_manager)
        self._providers = {}  # 缓存已创建的提供商实例
    
    def openai(self) -> OpenAIProvider:
        """
        获取OpenAI提供商实例
        
        Returns:
            OpenAIProvider: OpenAI提供商实例
        """
        if 'openai' not in self._providers:
            self._providers['openai'] = OpenAIProvider(self.config_manager)
        return self._providers['openai']
    
    def zhipuai(self) -> ZhipuAIProvider:
        """
        获取智谱AI提供商实例
        
        Returns:
            ZhipuAIProvider: 智谱AI提供商实例
        """
        if 'zhipuai' not in self._providers:
            self._providers['zhipuai'] = ZhipuAIProvider(self.config_manager)
        return self._providers['zhipuai']
    
    def deepseek(self) -> DeepSeekProvider:
        """
        获取DeepSeek提供商实例
        
        Returns:
            DeepSeekProvider: DeepSeek提供商实例
        """
        if 'deepseek' not in self._providers:
            self._providers['deepseek'] = DeepSeekProvider(self.config_manager)
        return self._providers['deepseek']
    
    def aliqwen(self) -> AliQwenProvider:
        """
        获取阿里千问提供商实例
        
        Returns:
            AliQwenProvider: 阿里千问提供商实例
        """
        if 'aliqwen' not in self._providers:
            self._providers['aliqwen'] = AliQwenProvider(self.config_manager)
        return self._providers['aliqwen']
    
    def check_config(self) -> bool:
        """检查配置有效性"""
        return self.utils.check_config_validity()
    
    def list_prompts(self) -> List[str]:
        """列出所有可用提示词"""
        return self.utils.list_available_prompt_ids()
    
    def test_connection(self, provider_name: str, model_type: str = None) -> Tuple[bool, str]:
        """测试API连接"""
        return self.utils.test_api_connectivity(provider_name, model_type)
    
    def list_models(self, provider_name: str) -> List[str]:
        """
        获取指定提供商的可用模型列表
        
        Args:
            provider_name: 提供商名称，如'openai'
            
        Returns:
            List[str]: 模型列表
        """
        return self.config_manager.get_models(provider_name)


def create_provider(provider_name: str, config_path: str = None) -> BaseProvider:
    """
    工厂函数：根据提供商名称创建相应的提供商实例
    
    Args:
        provider_name: 提供商名称，如'openai'
        config_path: 可选的配置文件路径
        
    Returns:
        BaseProvider: 对应的提供商实例
        
    Raises:
        ValueError: 不支持的提供商名称
    """
    config_manager = ConfigManager(config_path)
    
    if provider_name.lower() == 'openai':
        return OpenAIProvider(config_manager)
    elif provider_name.lower() == 'zhipuai':
        return ZhipuAIProvider(config_manager)
    elif provider_name.lower() == 'deepseek':
        return DeepSeekProvider(config_manager)
    elif provider_name.lower() in ['aliqwen', 'qwen']:
        return AliQwenProvider(config_manager)
    # 后续可添加其他提供商
    else:
        raise ValueError(f"不支持的提供商: {provider_name}")

# 使用示例:
# openai = create_provider('openai')
# response, dialogue_id, tokens = openai.invoke(
#     model_type='gpt-3.5-turbo',
#     prompt_id='翻译为英文',
#     call_mode='single_response',
#     data='这是一段需要翻译的中文文本'
# )

