from typing import Optional, Dict, Type
from .base import BaseAIService, AIProvider, AIServiceError
from .openai_service import OpenAIService
from .anthropic_service import AnthropicService
from .google_service import GoogleAIService
from ..utils.provider_detection import ProviderDetector


class AIServiceFactory:
    """Factory class for creating AI service instances"""
    
    # Registry of available service classes
    _service_registry: Dict[AIProvider, Type[BaseAIService]] = {
        AIProvider.OPENAI: OpenAIService,
        AIProvider.ANTHROPIC: AnthropicService,
        AIProvider.GOOGLE: GoogleAIService,
    }

    @classmethod
    def create_service(
        cls, 
        api_key: str, 
        provider: Optional[AIProvider] = None,
        **kwargs
    ) -> BaseAIService:
        """
        Create an AI service instance
        
        Args:
            api_key: The API key for the service
            provider: Optional specific provider to use. If None, auto-detect from API key
            **kwargs: Additional arguments to pass to the service constructor
            
        Returns:
            An instance of the appropriate AI service
            
        Raises:
            AIServiceError: If provider cannot be determined or is not supported
        """
        if not api_key:
            raise AIServiceError("API key is required", AIProvider.OPENAI, "MISSING_API_KEY")
        
        # Auto-detect provider if not specified
        if provider is None:
            provider = ProviderDetector.detect_provider(api_key)
            
        if provider is None:
            raise AIServiceError(
                "Unable to determine AI provider from API key format",
                AIProvider.OPENAI,  # Default for error reporting
                "UNKNOWN_PROVIDER"
            )
        
        # Get the service class for the provider
        service_class = cls._service_registry.get(provider)
        if service_class is None:
            raise AIServiceError(
                f"Provider {provider.value} is not supported",
                provider,
                "UNSUPPORTED_PROVIDER"
            )
        
        try:
            return service_class(api_key=api_key, **kwargs)
        except Exception as e:
            if isinstance(e, AIServiceError):
                raise e
            raise AIServiceError(
                f"Failed to create {provider.value} service: {str(e)}",
                provider,
                "SERVICE_CREATION_ERROR"
            )

    @classmethod
    def create_service_by_provider(
        cls, 
        provider: AIProvider, 
        api_key: str, 
        **kwargs
    ) -> BaseAIService:
        """
        Create an AI service instance for a specific provider
        
        Args:
            provider: The AI provider to use
            api_key: The API key for the service
            **kwargs: Additional arguments to pass to the service constructor
            
        Returns:
            An instance of the specified AI service
        """
        return cls.create_service(api_key=api_key, provider=provider, **kwargs)

    @classmethod
    def get_supported_providers(cls) -> list[AIProvider]:
        """Get list of supported AI providers"""
        return list(cls._service_registry.keys())

    @classmethod
    def register_service(cls, provider: AIProvider, service_class: Type[BaseAIService]):
        """
        Register a new AI service class
        
        Args:
            provider: The AI provider enum
            service_class: The service class to register
        """
        if not issubclass(service_class, BaseAIService):
            raise ValueError("Service class must inherit from BaseAIService")
        
        cls._service_registry[provider] = service_class

    @classmethod
    def validate_api_key_for_provider(cls, api_key: str, provider: AIProvider) -> bool:
        """
        Validate that an API key is compatible with a specific provider
        
        Args:
            api_key: The API key to validate
            provider: The expected provider
            
        Returns:
            True if the API key format matches the expected provider
        """
        return ProviderDetector.validate_api_key_format(api_key, provider)

    @classmethod
    def get_provider_info(cls, provider: AIProvider) -> dict:
        """
        Get information about a specific provider
        
        Args:
            provider: The AI provider
            
        Returns:
            Dictionary with provider information
        """
        service_class = cls._service_registry.get(provider)
        if not service_class:
            return {}
        
        # Create a temporary instance to get model info
        try:
            # Use a dummy API key for getting model list
            temp_instance = service_class(api_key="dummy")
            models = temp_instance.get_available_models()
        except:
            models = []
        
        requirements = ProviderDetector.get_api_key_requirements(provider)
        
        return {
            "provider": provider.value,
            "name": ProviderDetector.get_provider_name(provider),
            "models": [
                {
                    "id": model.id,
                    "name": model.name,
                    "description": model.description,
                    "max_tokens": model.max_tokens,
                    "supports_streaming": model.supports_streaming,
                    "supports_vision": model.supports_vision
                }
                for model in models
            ],
            "api_key_requirements": requirements
        }

    @classmethod
    async def test_service_connection(cls, api_key: str, provider: Optional[AIProvider] = None) -> dict:
        """
        Test connection to an AI service
        
        Args:
            api_key: The API key to test
            provider: Optional specific provider. If None, auto-detect
            
        Returns:
            Dictionary with test results
        """
        try:
            service = cls.create_service(api_key=api_key, provider=provider)
            is_connected = await service.test_connection()
            
            return {
                "success": is_connected,
                "provider": service.provider.value,
                "provider_name": ProviderDetector.get_provider_name(service.provider),
                "error": None
            }
        except AIServiceError as e:
            return {
                "success": False,
                "provider": e.provider.value if e.provider else "unknown",
                "provider_name": ProviderDetector.get_provider_name(e.provider) if e.provider else "Unknown",
                "error": str(e),
                "error_code": e.error_code
            }
        except Exception as e:
            return {
                "success": False,
                "provider": "unknown",
                "provider_name": "Unknown",
                "error": f"Unexpected error: {str(e)}",
                "error_code": "UNEXPECTED_ERROR"
            }