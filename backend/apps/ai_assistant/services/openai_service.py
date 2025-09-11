import openai
from typing import List, Optional, AsyncGenerator
from .base import (
    BaseAIService, AIProvider, AIMessage, AIModelInfo, 
    AIResponse, AIStreamChunk, AIServiceError
)


class OpenAIService(BaseAIService):
    def get_provider(self) -> AIProvider:
        return AIProvider.OPENAI

    def _initialize_client(self, **kwargs) -> None:
        try:
            self._client = openai.AsyncOpenAI(
                api_key=self.api_key,
                **kwargs
            )
        except Exception as e:
            raise AIServiceError(f"Failed to initialize OpenAI client: {str(e)}", self.provider)

    def get_available_models(self) -> List[AIModelInfo]:
        return [
            AIModelInfo(
                id="gpt-4o",
                name="GPT-4o",
                description="Most advanced multimodal model",
                max_tokens=128000,
                supports_streaming=True,
                supports_vision=True
            ),
            AIModelInfo(
                id="gpt-4o-mini",
                name="GPT-4o Mini",
                description="Faster, cheaper version of GPT-4o",
                max_tokens=128000,
                supports_streaming=True,
                supports_vision=True
            ),
            AIModelInfo(
                id="gpt-4-turbo",
                name="GPT-4 Turbo",
                description="High-intelligence model for complex tasks",
                max_tokens=128000,
                supports_streaming=True,
                supports_vision=True
            ),
            AIModelInfo(
                id="gpt-4",
                name="GPT-4",
                description="Previous generation high-intelligence model",
                max_tokens=8192,
                supports_streaming=True,
                supports_vision=False
            ),
            AIModelInfo(
                id="gpt-3.5-turbo",
                name="GPT-3.5 Turbo",
                description="Fast, efficient model for simpler tasks",
                max_tokens=16384,
                supports_streaming=True,
                supports_vision=False
            )
        ]

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
            
            response = await self._client.chat.completions.create(
                model=model,
                messages=formatted_messages,
                max_tokens=max_tokens,
                temperature=temperature,
                **kwargs
            )

            usage = None
            if response.usage:
                usage = {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens
                }

            return AIResponse(
                content=response.choices[0].message.content,
                model=model,
                provider=self.provider,
                usage=usage,
                finish_reason=response.choices[0].finish_reason
            )

        except openai.AuthenticationError as e:
            raise AIServiceError("Invalid API key", self.provider, "AUTHENTICATION_ERROR")
        except openai.RateLimitError as e:
            raise AIServiceError("Rate limit exceeded", self.provider, "RATE_LIMIT_ERROR")
        except openai.BadRequestError as e:
            raise AIServiceError(f"Bad request: {str(e)}", self.provider, "BAD_REQUEST")
        except Exception as e:
            raise self._handle_error(e, "OpenAI API error")

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
            
            stream = await self._client.chat.completions.create(
                model=model,
                messages=formatted_messages,
                max_tokens=max_tokens,
                temperature=temperature,
                stream=True,
                **kwargs
            )

            async for chunk in stream:
                if chunk.choices and chunk.choices[0].delta.content:
                    content = chunk.choices[0].delta.content
                    finish_reason = chunk.choices[0].finish_reason
                    
                    usage = None
                    if hasattr(chunk, 'usage') and chunk.usage:
                        usage = {
                            "prompt_tokens": chunk.usage.prompt_tokens,
                            "completion_tokens": chunk.usage.completion_tokens,
                            "total_tokens": chunk.usage.total_tokens
                        }
                    
                    yield AIStreamChunk(
                        content=content,
                        finish_reason=finish_reason,
                        usage=usage
                    )

        except openai.AuthenticationError as e:
            raise AIServiceError("Invalid API key", self.provider, "AUTHENTICATION_ERROR")
        except openai.RateLimitError as e:
            raise AIServiceError("Rate limit exceeded", self.provider, "RATE_LIMIT_ERROR")
        except openai.BadRequestError as e:
            raise AIServiceError(f"Bad request: {str(e)}", self.provider, "BAD_REQUEST")
        except Exception as e:
            raise self._handle_error(e, "OpenAI streaming error")

    async def test_connection(self) -> bool:
        try:
            # Test with a simple completion
            test_response = await self._client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": "Hi"}],
                max_tokens=5
            )
            return bool(test_response.choices and test_response.choices[0].message.content)
        except openai.AuthenticationError:
            return False
        except Exception:
            return False