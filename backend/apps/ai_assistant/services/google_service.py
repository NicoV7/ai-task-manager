import google.generativeai as genai
from google.auth.credentials import Credentials
from google.oauth2 import service_account
import json
from typing import List, Optional, AsyncGenerator, Union
from .base import (
    BaseAIService, AIProvider, AIMessage, AIModelInfo, 
    AIResponse, AIStreamChunk, AIServiceError
)


class GoogleAIService(BaseAIService):
    def get_provider(self) -> AIProvider:
        return AIProvider.GOOGLE

    def _initialize_client(self, **kwargs) -> None:
        try:
            # Check if API key is a service account JSON
            if self._is_service_account_json(self.api_key):
                # Use service account credentials
                service_account_info = json.loads(self.api_key)
                credentials = service_account.Credentials.from_service_account_info(
                    service_account_info,
                    scopes=['https://www.googleapis.com/auth/generative-language']
                )
                genai.configure(credentials=credentials)
            else:
                # Use API key directly
                genai.configure(api_key=self.api_key)
            
            self._client = genai
        except Exception as e:
            raise AIServiceError(f"Failed to initialize Google AI client: {str(e)}", self.provider)

    def _is_service_account_json(self, api_key: str) -> bool:
        """Check if the API key is a service account JSON"""
        try:
            data = json.loads(api_key.strip())
            return (
                isinstance(data, dict) and
                data.get('type') == 'service_account' and
                'private_key' in data
            )
        except (json.JSONDecodeError, AttributeError):
            return False

    def get_available_models(self) -> List[AIModelInfo]:
        return [
            AIModelInfo(
                id="gemini-1.5-pro",
                name="Gemini 1.5 Pro",
                description="Most capable multimodal model",
                max_tokens=2097152,  # 2M tokens
                supports_streaming=True,
                supports_vision=True
            ),
            AIModelInfo(
                id="gemini-1.5-flash",
                name="Gemini 1.5 Flash",
                description="Fast and efficient multimodal model",
                max_tokens=1048576,  # 1M tokens
                supports_streaming=True,
                supports_vision=True
            ),
            AIModelInfo(
                id="gemini-pro",
                name="Gemini Pro",
                description="Previous generation text model",
                max_tokens=32768,
                supports_streaming=True,
                supports_vision=False
            ),
            AIModelInfo(
                id="gemini-pro-vision",
                name="Gemini Pro Vision",
                description="Previous generation multimodal model",
                max_tokens=16384,
                supports_streaming=True,
                supports_vision=True
            )
        ]

    def _format_messages(self, messages: List[AIMessage]) -> List[dict]:
        """Convert AIMessage objects to Google AI format"""
        formatted = []
        
        for msg in messages:
            role = msg.role
            if role == "assistant":
                role = "model"
            elif role == "system":
                # Google AI doesn't have system role, prepend to first user message
                if formatted and formatted[-1]["role"] == "user":
                    formatted[-1]["parts"][0] = msg.content + "\n\n" + formatted[-1]["parts"][0]
                else:
                    formatted.append({
                        "role": "user",
                        "parts": [msg.content]
                    })
                continue
            
            formatted.append({
                "role": role,
                "parts": [msg.content]
            })
        
        return formatted

    async def generate_response(
        self,
        messages: List[AIMessage],
        model: str,
        max_tokens: Optional[int] = None,
        temperature: float = 0.7,
        **kwargs
    ) -> AIResponse:
        try:
            if not self.validate_model(model):
                raise AIServiceError(f"Invalid model: {model}", self.provider, "INVALID_MODEL")

            formatted_messages = self._format_messages(messages)
            
            # Initialize the model
            generation_config = genai.types.GenerationConfig(
                temperature=temperature,
                max_output_tokens=max_tokens,
                **kwargs
            )
            
            model_instance = genai.GenerativeModel(
                model_name=model,
                generation_config=generation_config
            )

            # Convert messages to chat format
            if len(formatted_messages) > 1:
                # Multi-turn conversation
                chat = model_instance.start_chat(
                    history=formatted_messages[:-1]
                )
                response = await chat.send_message_async(
                    formatted_messages[-1]["parts"][0]
                )
            else:
                # Single message
                response = await model_instance.generate_content_async(
                    formatted_messages[0]["parts"][0]
                )

            usage = None
            if hasattr(response, 'usage_metadata') and response.usage_metadata:
                metadata = response.usage_metadata
                usage = {
                    "prompt_tokens": metadata.prompt_token_count,
                    "completion_tokens": metadata.candidates_token_count,
                    "total_tokens": metadata.total_token_count
                }

            content = ""
            if response.candidates and response.candidates[0].content.parts:
                content = "".join([part.text for part in response.candidates[0].content.parts])

            finish_reason = None
            if response.candidates and response.candidates[0].finish_reason:
                finish_reason = str(response.candidates[0].finish_reason)

            return AIResponse(
                content=content,
                model=model,
                provider=self.provider,
                usage=usage,
                finish_reason=finish_reason
            )

        except Exception as e:
            if "API_KEY_INVALID" in str(e) or "authentication" in str(e).lower():
                raise AIServiceError("Invalid API key", self.provider, "AUTHENTICATION_ERROR")
            elif "quota" in str(e).lower() or "rate" in str(e).lower():
                raise AIServiceError("Rate limit or quota exceeded", self.provider, "RATE_LIMIT_ERROR")
            else:
                raise self._handle_error(e, "Google AI API error")

    async def generate_stream(
        self,
        messages: List[AIMessage],
        model: str,
        max_tokens: Optional[int] = None,
        temperature: float = 0.7,
        **kwargs
    ) -> AsyncGenerator[AIStreamChunk, None]:
        try:
            if not self.validate_model(model):
                raise AIServiceError(f"Invalid model: {model}", self.provider, "INVALID_MODEL")

            formatted_messages = self._format_messages(messages)
            
            # Initialize the model
            generation_config = genai.types.GenerationConfig(
                temperature=temperature,
                max_output_tokens=max_tokens,
                **kwargs
            )
            
            model_instance = genai.GenerativeModel(
                model_name=model,
                generation_config=generation_config
            )

            # Convert messages to chat format
            if len(formatted_messages) > 1:
                # Multi-turn conversation
                chat = model_instance.start_chat(
                    history=formatted_messages[:-1]
                )
                response_stream = await chat.send_message_async(
                    formatted_messages[-1]["parts"][0],
                    stream=True
                )
            else:
                # Single message
                response_stream = await model_instance.generate_content_async(
                    formatted_messages[0]["parts"][0],
                    stream=True
                )

            async for chunk in response_stream:
                if chunk.candidates and chunk.candidates[0].content.parts:
                    content = "".join([part.text for part in chunk.candidates[0].content.parts])
                    
                    finish_reason = None
                    if chunk.candidates[0].finish_reason:
                        finish_reason = str(chunk.candidates[0].finish_reason)
                    
                    usage = None
                    if hasattr(chunk, 'usage_metadata') and chunk.usage_metadata:
                        metadata = chunk.usage_metadata
                        usage = {
                            "prompt_tokens": metadata.prompt_token_count,
                            "completion_tokens": metadata.candidates_token_count,
                            "total_tokens": metadata.total_token_count
                        }
                    
                    yield AIStreamChunk(
                        content=content,
                        finish_reason=finish_reason,
                        usage=usage
                    )

        except Exception as e:
            if "API_KEY_INVALID" in str(e) or "authentication" in str(e).lower():
                raise AIServiceError("Invalid API key", self.provider, "AUTHENTICATION_ERROR")
            elif "quota" in str(e).lower() or "rate" in str(e).lower():
                raise AIServiceError("Rate limit or quota exceeded", self.provider, "RATE_LIMIT_ERROR")
            else:
                raise self._handle_error(e, "Google AI streaming error")

    async def test_connection(self) -> bool:
        try:
            # Test with a simple completion
            model_instance = genai.GenerativeModel(model_name="gemini-pro")
            response = await model_instance.generate_content_async("Hi")
            return bool(response.candidates and response.candidates[0].content.parts)
        except Exception:
            return False