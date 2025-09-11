import re
import json
from typing import Optional
from ..services.base import AIProvider


class ProviderDetector:
    """Utility class to detect AI provider from API key format"""
    
    # API key patterns for different providers
    PATTERNS = {
        AIProvider.OPENAI: [
            r'^sk-proj-[A-Za-z0-9_-]+$',  # New project-based keys
            r'^sk-[A-Za-z0-9_-]{48,}$',   # Legacy OpenAI keys
        ],
        AIProvider.ANTHROPIC: [
            r'^sk-ant-api03-[A-Za-z0-9_-]+$',  # Anthropic API keys
        ],
        AIProvider.GOOGLE: [
            r'^AIza[A-Za-z0-9_-]{35}$',  # Google AI API keys
        ]
    }
    
    @classmethod
    def detect_provider(cls, api_key: str) -> Optional[AIProvider]:
        """
        Detect the AI provider based on API key format
        
        Args:
            api_key: The API key string
            
        Returns:
            AIProvider enum value or None if no pattern matches
        """
        if not api_key:
            return None
            
        # Check if it's a JSON string (Google service account)
        if cls._is_google_service_account(api_key):
            return AIProvider.GOOGLE
            
        # Check against known patterns
        for provider, patterns in cls.PATTERNS.items():
            for pattern in patterns:
                if re.match(pattern, api_key.strip()):
                    return provider
                    
        return None
    
    @classmethod
    def _is_google_service_account(cls, api_key: str) -> bool:
        """Check if the key is a Google service account JSON"""
        try:
            data = json.loads(api_key.strip())
            required_fields = ['type', 'project_id', 'private_key_id', 'private_key', 'client_email']
            return (
                isinstance(data, dict) and
                data.get('type') == 'service_account' and
                all(field in data for field in required_fields)
            )
        except (json.JSONDecodeError, AttributeError):
            return False
    
    @classmethod
    def get_provider_name(cls, provider: AIProvider) -> str:
        """Get human-readable provider name"""
        names = {
            AIProvider.OPENAI: "OpenAI",
            AIProvider.ANTHROPIC: "Anthropic",
            AIProvider.GOOGLE: "Google AI"
        }
        return names.get(provider, provider.value)
    
    @classmethod
    def get_supported_providers(cls) -> list[AIProvider]:
        """Get list of all supported providers"""
        return list(cls.PATTERNS.keys())
    
    @classmethod
    def validate_api_key_format(cls, api_key: str, expected_provider: AIProvider) -> bool:
        """
        Validate that an API key matches the expected provider format
        
        Args:
            api_key: The API key to validate
            expected_provider: The expected provider
            
        Returns:
            True if the key format matches the expected provider
        """
        detected_provider = cls.detect_provider(api_key)
        return detected_provider == expected_provider
    
    @classmethod
    def get_api_key_requirements(cls, provider: AIProvider) -> dict:
        """Get API key requirements and format information for a provider"""
        requirements = {
            AIProvider.OPENAI: {
                "format": "sk-proj-... or sk-...",
                "description": "OpenAI API key from platform.openai.com",
                "example_format": "sk-proj-ABC123...",
                "min_length": 20,
                "docs_url": "https://platform.openai.com/api-keys"
            },
            AIProvider.ANTHROPIC: {
                "format": "sk-ant-api03-...",
                "description": "Anthropic API key from console.anthropic.com",
                "example_format": "sk-ant-api03-ABC123...",
                "min_length": 20,
                "docs_url": "https://console.anthropic.com/"
            },
            AIProvider.GOOGLE: {
                "format": "AIza... or Service Account JSON",
                "description": "Google AI API key or service account JSON",
                "example_format": "AIzaABC123... or {\"type\": \"service_account\", ...}",
                "min_length": 20,
                "docs_url": "https://ai.google.dev/"
            }
        }
        return requirements.get(provider, {})