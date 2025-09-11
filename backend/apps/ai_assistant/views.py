from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.utils import timezone
from django.shortcuts import get_object_or_404
from asgiref.sync import sync_to_async
import asyncio
import json

from .models import AIProvider, UserAISettings, UserAPIKey
from .services.factory import AIServiceFactory
from .services.base import AIProvider as ServiceProvider, AIServiceError
from .utils.provider_detection import ProviderDetector


class AIProviderViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for AI provider information"""
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        """Get list of all supported AI providers with their models"""
        providers_info = []
        
        for provider in AIServiceFactory.get_supported_providers():
            provider_info = AIServiceFactory.get_provider_info(provider)
            providers_info.append(provider_info)
        
        return Response(providers_info)
    
    def retrieve(self, request, pk=None):
        """Get detailed information about a specific provider"""
        try:
            provider_enum = ServiceProvider(pk)
            provider_info = AIServiceFactory.get_provider_info(provider_enum)
            
            if not provider_info:
                return Response(
                    {"error": "Provider not found"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            return Response(provider_info)
        except ValueError:
            return Response(
                {"error": "Invalid provider"}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class UserAISettingsView(APIView):
    """API view for managing user AI settings"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get user's AI settings"""
        try:
            settings = UserAISettings.objects.get(user=request.user)
            return Response({
                "preferred_provider": settings.preferred_provider,
                "preferred_model": settings.preferred_model,
                "default_temperature": settings.default_temperature,
                "default_max_tokens": settings.default_max_tokens,
            })
        except UserAISettings.DoesNotExist:
            # Return default settings
            return Response({
                "preferred_provider": "openai",
                "preferred_model": "",
                "default_temperature": 0.7,
                "default_max_tokens": 4096,
            })
    
    def post(self, request):
        """Update user's AI settings"""
        data = request.data
        
        # Validate provider
        provider = data.get('preferred_provider')
        if provider and provider not in [p.value for p in ServiceProvider]:
            return Response(
                {"error": "Invalid provider"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get or create settings
        settings, created = UserAISettings.objects.get_or_create(
            user=request.user,
            defaults={
                'preferred_provider': provider or 'openai',
                'preferred_model': data.get('preferred_model', ''),
                'default_temperature': data.get('default_temperature', 0.7),
                'default_max_tokens': data.get('default_max_tokens', 4096),
            }
        )
        
        if not created:
            # Update existing settings
            if provider:
                settings.preferred_provider = provider
            if 'preferred_model' in data:
                settings.preferred_model = data['preferred_model']
            if 'default_temperature' in data:
                settings.default_temperature = float(data['default_temperature'])
            if 'default_max_tokens' in data:
                settings.default_max_tokens = data['default_max_tokens']
            settings.save()
        
        return Response({
            "preferred_provider": settings.preferred_provider,
            "preferred_model": settings.preferred_model,
            "default_temperature": settings.default_temperature,
            "default_max_tokens": settings.default_max_tokens,
        })


class UserAPIKeyView(APIView):
    """API view for managing user API keys"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get user's API key status for all providers"""
        api_keys = UserAPIKey.objects.filter(user=request.user)
        
        result = {}
        for provider in ServiceProvider:
            api_key = api_keys.filter(provider=provider.value).first()
            if api_key:
                result[provider.value] = {
                    "has_key": True,
                    "is_active": api_key.is_active,
                    "test_status": api_key.test_status,
                    "test_error_message": api_key.test_error_message,
                    "last_tested": api_key.last_tested,
                    "key_preview": f"***{api_key.api_key[-4:]}" if len(api_key.api_key) > 4 else "***"
                }
            else:
                result[provider.value] = {
                    "has_key": False,
                    "is_active": False,
                    "test_status": "pending",
                    "test_error_message": "",
                    "last_tested": None,
                    "key_preview": ""
                }
        
        return Response(result)
    
    def post(self, request):
        """Add or update an API key for a provider"""
        provider = request.data.get('provider')
        api_key = request.data.get('api_key')
        
        if not provider or not api_key:
            return Response(
                {"error": "Provider and API key are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            provider_enum = ServiceProvider(provider)
        except ValueError:
            return Response(
                {"error": "Invalid provider"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate API key format
        if not ProviderDetector.validate_api_key_format(api_key, provider_enum):
            requirements = ProviderDetector.get_api_key_requirements(provider_enum)
            return Response({
                "error": f"Invalid API key format for {provider}",
                "expected_format": requirements.get("format", ""),
                "docs_url": requirements.get("docs_url", "")
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create or update API key
        user_api_key, created = UserAPIKey.objects.update_or_create(
            user=request.user,
            provider=provider,
            defaults={
                'api_key': api_key,
                'is_active': True,
                'test_status': 'pending',
                'test_error_message': ''
            }
        )
        
        return Response({
            "message": "API key saved successfully",
            "provider": provider,
            "test_status": "pending"
        })
    
    def delete(self, request):
        """Delete an API key for a provider"""
        provider = request.data.get('provider')
        
        if not provider:
            return Response(
                {"error": "Provider is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            api_key = UserAPIKey.objects.get(user=request.user, provider=provider)
            api_key.delete()
            return Response({"message": "API key deleted successfully"})
        except UserAPIKey.DoesNotExist:
            return Response(
                {"error": "API key not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )


class TestAPIKeyView(APIView):
    """API view for testing API key connections"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Test an API key connection"""
        provider = request.data.get('provider')
        api_key = request.data.get('api_key')
        
        # If no API key provided, test the stored one
        if not api_key:
            try:
                user_api_key = UserAPIKey.objects.get(
                    user=request.user, 
                    provider=provider
                )
                api_key = user_api_key.api_key
            except UserAPIKey.DoesNotExist:
                return Response(
                    {"error": "No API key found for this provider"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
        
        if not provider or not api_key:
            return Response(
                {"error": "Provider and API key are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            provider_enum = ServiceProvider(provider)
        except ValueError:
            return Response(
                {"error": "Invalid provider"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Test the connection asynchronously
        async def test_connection():
            return await AIServiceFactory.test_service_connection(api_key, provider_enum)
        
        # Run the async test
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            test_result = loop.run_until_complete(test_connection())
        finally:
            loop.close()
        
        # Update the stored API key test status if it exists
        try:
            user_api_key = UserAPIKey.objects.get(
                user=request.user, 
                provider=provider
            )
            user_api_key.test_status = 'success' if test_result['success'] else 'failed'
            user_api_key.test_error_message = test_result.get('error', '')
            user_api_key.last_tested = timezone.now()
            user_api_key.save()
        except UserAPIKey.DoesNotExist:
            pass
        
        return Response(test_result)


class ChatCompletionView(APIView):
    """API view for AI chat completions"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Generate AI response"""
        messages = request.data.get('messages', [])
        provider = request.data.get('provider')
        model = request.data.get('model')
        temperature = request.data.get('temperature', 0.7)
        max_tokens = request.data.get('max_tokens')
        
        if not messages:
            return Response(
                {"error": "Messages are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get user's API key for the provider
        if not provider:
            # Use user's preferred provider
            try:
                settings = UserAISettings.objects.get(user=request.user)
                provider = settings.preferred_provider
                if not model:
                    model = settings.preferred_model
            except UserAISettings.DoesNotExist:
                provider = 'openai'
        
        try:
            user_api_key = UserAPIKey.objects.get(
                user=request.user, 
                provider=provider,
                is_active=True
            )
        except UserAPIKey.DoesNotExist:
            return Response(
                {"error": f"No active API key found for {provider}"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        if user_api_key.test_status == 'failed':
            return Response(
                {"error": "API key failed last connection test"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create AI service and generate response
        async def generate_response():
            try:
                service = AIServiceFactory.create_service(
                    api_key=user_api_key.api_key,
                    provider=ServiceProvider(provider)
                )
                
                # Convert messages to AIMessage objects
                from .services.base import AIMessage
                ai_messages = [
                    AIMessage(role=msg['role'], content=msg['content'])
                    for msg in messages
                ]
                
                # Set default model if not provided
                if not model:
                    available_models = service.get_available_models()
                    model = available_models[0].id if available_models else None
                
                if not model:
                    return {"error": "No model specified and no default available"}
                
                response = await service.generate_response(
                    messages=ai_messages,
                    model=model,
                    temperature=temperature,
                    max_tokens=max_tokens
                )
                
                return {
                    "content": response.content,
                    "model": response.model,
                    "provider": response.provider.value,
                    "usage": response.usage,
                    "finish_reason": response.finish_reason
                }
                
            except AIServiceError as e:
                return {
                    "error": str(e), 
                    "error_code": e.error_code,
                    "provider": e.provider.value
                }
            except Exception as e:
                return {"error": f"Unexpected error: {str(e)}"}
        
        # Run the async generation
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            result = loop.run_until_complete(generate_response())
        finally:
            loop.close()
        
        if "error" in result:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(result)