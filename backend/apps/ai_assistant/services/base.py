from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Union, AsyncGenerator, Any
from dataclasses import dataclass
from enum import Enum
import asyncio
import json


class AIProvider(Enum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GOOGLE = "google"


@dataclass
class AIMessage:
    role: str  # 'user', 'assistant', 'system'
    content: str


@dataclass
class AIModelInfo:
    id: str
    name: str
    description: str
    max_tokens: int
    supports_streaming: bool = True
    supports_vision: bool = False


@dataclass
class AIResponse:
    content: str
    model: str
    provider: AIProvider
    usage: Optional[Dict[str, int]] = None
    finish_reason: Optional[str] = None


@dataclass
class AIStreamChunk:
    content: str
    finish_reason: Optional[str] = None
    usage: Optional[Dict[str, int]] = None


class AIServiceError(Exception):
    def __init__(self, message: str, provider: AIProvider, error_code: Optional[str] = None):
        self.provider = provider
        self.error_code = error_code
        super().__init__(message)


class BaseAIService(ABC):
    def __init__(self, api_key: str, **kwargs):
        self.api_key = api_key
        self.provider = self.get_provider()
        self._client = None
        self._initialize_client(**kwargs)

    @abstractmethod
    def get_provider(self) -> AIProvider:
        pass

    @abstractmethod
    def _initialize_client(self, **kwargs) -> None:
        pass

    @abstractmethod
    def get_available_models(self) -> List[AIModelInfo]:
        pass

    @abstractmethod
    async def generate_response(
        self,
        messages: List[AIMessage],
        model: str,
        max_tokens: Optional[int] = None,
        temperature: float = 0.7,
        **kwargs
    ) -> AIResponse:
        pass

    @abstractmethod
    async def generate_stream(
        self,
        messages: List[AIMessage],
        model: str,
        max_tokens: Optional[int] = None,
        temperature: float = 0.7,
        **kwargs
    ) -> AsyncGenerator[AIStreamChunk, None]:
        pass

    @abstractmethod
    async def test_connection(self) -> bool:
        pass

    def _format_messages(self, messages: List[AIMessage]) -> Any:
        """Convert AIMessage objects to provider-specific format"""
        return [{"role": msg.role, "content": msg.content} for msg in messages]

    def _handle_error(self, error: Exception, context: str = "") -> AIServiceError:
        """Convert provider-specific errors to AIServiceError"""
        error_msg = f"{context}: {str(error)}" if context else str(error)
        return AIServiceError(error_msg, self.provider)

    def get_model_by_id(self, model_id: str) -> Optional[AIModelInfo]:
        """Get model info by ID"""
        models = self.get_available_models()
        return next((model for model in models if model.id == model_id), None)

    def validate_model(self, model_id: str) -> bool:
        """Check if model ID is valid for this provider"""
        return self.get_model_by_id(model_id) is not None

    def estimate_tokens(self, text: str) -> int:
        """Rough estimation of token count"""
        # Simple estimation: ~4 characters per token
        return len(text) // 4