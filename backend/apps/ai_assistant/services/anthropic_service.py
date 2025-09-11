import anthropic
from typing import List, Optional, AsyncGenerator
from .base import (
    BaseAIService, AIProvider, AIMessage, AIModelInfo, 
    AIResponse, AIStreamChunk, AIServiceError
)


class AnthropicService(BaseAIService):
    def get_provider(self) -> AIProvider:
        return AIProvider.ANTHROPIC

    def _initialize_client(self, **kwargs) -> None:
        try:
            self._client = anthropic.AsyncAnthropic(
                api_key=self.api_key,
                **kwargs
            )
        except Exception as e:
            raise AIServiceError(f"Failed to initialize Anthropic client: {str(e)}", self.provider)

    def get_available_models(self) -> List[AIModelInfo]:
        return [
            AIModelInfo(
                id="claude-3-5-sonnet-20241022",
                name="Claude 3.5 Sonnet",
                description="Most capable model, best for complex tasks",
                max_tokens=200000,
                supports_streaming=True,
                supports_vision=True
            ),
            AIModelInfo(
                id="claude-3-5-haiku-20241022",
                name="Claude 3.5 Haiku",
                description="Fastest model for simple tasks",
                max_tokens=200000,
                supports_streaming=True,
                supports_vision=True
            ),
            AIModelInfo(
                id="claude-3-opus-20240229",
                name="Claude 3 Opus",
                description="Previous generation most capable model",
                max_tokens=200000,
                supports_streaming=True,
                supports_vision=True
            ),
            AIModelInfo(
                id="claude-3-sonnet-20240229",
                name="Claude 3 Sonnet",
                description="Balanced performance and speed",
                max_tokens=200000,
                supports_streaming=True,
                supports_vision=True
            ),
            AIModelInfo(
                id="claude-3-haiku-20240307",
                name="Claude 3 Haiku",
                description="Fastest model in previous generation",
                max_tokens=200000,
                supports_streaming=True,
                supports_vision=True
            )
        ]

    def _format_messages(self, messages: List[AIMessage]) -> List[dict]:
        """Convert AIMessage objects to Anthropic format"""
        formatted = []
        system_messages = []
        
        for msg in messages:
            if msg.role == "system":
                system_messages.append(msg.content)
            else:
                formatted.append({
                    "role": msg.role,
                    "content": msg.content
                })
        
        # Return both formatted messages and system prompt
        return formatted, "\n\n".join(system_messages) if system_messages else None

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

            formatted_messages, system_prompt = self._format_messages(messages)
            
            # Set default max_tokens if not provided
            if max_tokens is None:
                max_tokens = 4096
            
            request_params = {
                "model": model,
                "messages": formatted_messages,
                "max_tokens": max_tokens,
                "temperature": temperature,
                **kwargs
            }
            
            if system_prompt:
                request_params["system"] = system_prompt

            response = await self._client.messages.create(**request_params)

            usage = None
            if hasattr(response, 'usage') and response.usage:
                usage = {
                    "prompt_tokens": response.usage.input_tokens,
                    "completion_tokens": response.usage.output_tokens,
                    "total_tokens": response.usage.input_tokens + response.usage.output_tokens
                }

            content = ""
            if response.content:
                for block in response.content:
                    if hasattr(block, 'text'):
                        content += block.text

            return AIResponse(
                content=content,
                model=model,
                provider=self.provider,
                usage=usage,
                finish_reason=response.stop_reason
            )

        except anthropic.AuthenticationError as e:
            raise AIServiceError("Invalid API key", self.provider, "AUTHENTICATION_ERROR")
        except anthropic.RateLimitError as e:
            raise AIServiceError("Rate limit exceeded", self.provider, "RATE_LIMIT_ERROR")
        except anthropic.BadRequestError as e:
            raise AIServiceError(f"Bad request: {str(e)}", self.provider, "BAD_REQUEST")
        except Exception as e:
            raise self._handle_error(e, "Anthropic API error")

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

            formatted_messages, system_prompt = self._format_messages(messages)
            
            # Set default max_tokens if not provided
            if max_tokens is None:
                max_tokens = 4096
            
            request_params = {
                "model": model,
                "messages": formatted_messages,
                "max_tokens": max_tokens,
                "temperature": temperature,
                "stream": True,
                **kwargs
            }
            
            if system_prompt:
                request_params["system"] = system_prompt

            stream = await self._client.messages.create(**request_params)

            async for event in stream:
                if event.type == "content_block_delta":
                    if hasattr(event.delta, 'text'):
                        yield AIStreamChunk(
                            content=event.delta.text,
                            finish_reason=None
                        )
                elif event.type == "message_stop":
                    usage = None
                    if hasattr(event, 'message') and hasattr(event.message, 'usage'):
                        usage_data = event.message.usage
                        usage = {
                            "prompt_tokens": usage_data.input_tokens,
                            "completion_tokens": usage_data.output_tokens,
                            "total_tokens": usage_data.input_tokens + usage_data.output_tokens
                        }
                    
                    yield AIStreamChunk(
                        content="",
                        finish_reason="stop",
                        usage=usage
                    )

        except anthropic.AuthenticationError as e:
            raise AIServiceError("Invalid API key", self.provider, "AUTHENTICATION_ERROR")
        except anthropic.RateLimitError as e:
            raise AIServiceError("Rate limit exceeded", self.provider, "RATE_LIMIT_ERROR")
        except anthropic.BadRequestError as e:
            raise AIServiceError(f"Bad request: {str(e)}", self.provider, "BAD_REQUEST")
        except Exception as e:
            raise self._handle_error(e, "Anthropic streaming error")

    async def test_connection(self) -> bool:
        try:
            # Test with a simple completion
            test_response = await self._client.messages.create(
                model="claude-3-haiku-20240307",
                messages=[{"role": "user", "content": "Hi"}],
                max_tokens=5
            )
            return bool(test_response.content)
        except anthropic.AuthenticationError:
            return False
        except Exception:
            return False