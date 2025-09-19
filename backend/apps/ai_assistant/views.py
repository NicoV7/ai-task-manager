from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
import requests
import json

from .models import UserClaudeSettings


class ClaudeSettingsView(APIView):
    """API view for managing user's Claude settings"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get user's Claude settings"""
        settings, created = UserClaudeSettings.objects.get_or_create(user=request.user)

        return Response({
            "has_api_key": bool(settings.api_key),
            "model": settings.model,
            "max_tokens": settings.max_tokens,
            "temperature": settings.temperature,
            "is_active": settings.is_active,
            "api_key_preview": f"sk-ant-***{settings.api_key[-4:]}" if settings.api_key else "",
        })

    def post(self, request):
        """Update user's Claude settings"""
        data = request.data
        settings, created = UserClaudeSettings.objects.get_or_create(user=request.user)

        # Update API key if provided
        if 'api_key' in data:
            api_key = data['api_key'].strip()
            if api_key:
                # Basic validation for Claude API key format
                if not api_key.startswith('sk-ant-api03-'):
                    return Response(
                        {"error": "Invalid Claude API key format. Keys should start with 'sk-ant-api03-'"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                settings.api_key = api_key
            else:
                settings.api_key = ""

        # Update other settings
        if 'model' in data:
            settings.model = data['model']
        if 'max_tokens' in data:
            settings.max_tokens = int(data['max_tokens'])
        if 'temperature' in data:
            settings.temperature = float(data['temperature'])

        try:
            settings.save()
            return Response({
                "message": "Settings updated successfully",
                "has_api_key": bool(settings.api_key),
                "model": settings.model,
                "max_tokens": settings.max_tokens,
                "temperature": settings.temperature,
                "is_active": settings.is_active,
            })
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class TestClaudeConnectionView(APIView):
    """API view for testing Claude API connection"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Test Claude API key connection"""
        api_key = request.data.get('api_key')

        # If no API key provided, use the stored one
        if not api_key:
            try:
                settings = UserClaudeSettings.objects.get(user=request.user)
                api_key = settings.api_key
            except UserClaudeSettings.DoesNotExist:
                return Response(
                    {"error": "No API key found. Please add your Claude API key first."},
                    status=status.HTTP_404_NOT_FOUND
                )

        if not api_key:
            return Response(
                {"error": "API key is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Test the Claude API with a simple request
        try:
            headers = {
                'Content-Type': 'application/json',
                'x-api-key': api_key,
                'anthropic-version': '2023-06-01'
            }

            payload = {
                'model': 'claude-3-5-haiku-20241022',
                'max_tokens': 10,
                'messages': [
                    {
                        'role': 'user',
                        'content': 'Hello'
                    }
                ]
            }

            response = requests.post(
                'https://api.anthropic.com/v1/messages',
                headers=headers,
                json=payload,
                timeout=10
            )

            if response.status_code == 200:
                return Response({
                    "success": True,
                    "message": "Claude API connection successful!"
                })
            else:
                error_data = response.json() if response.content else {}
                return Response({
                    "success": False,
                    "error": error_data.get('error', {}).get('message', 'API key validation failed'),
                    "status_code": response.status_code
                })

        except requests.exceptions.Timeout:
            return Response({
                "success": False,
                "error": "Connection timeout. Please check your internet connection."
            })
        except requests.exceptions.RequestException as e:
            return Response({
                "success": False,
                "error": f"Connection error: {str(e)}"
            })
        except Exception as e:
            return Response({
                "success": False,
                "error": f"Unexpected error: {str(e)}"
            })


class ClaudeChatView(APIView):
    """API view for Claude chat completions"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Generate Claude AI response"""
        messages = request.data.get('messages', [])

        if not messages:
            return Response(
                {"error": "Messages are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get user's Claude settings
        try:
            settings = UserClaudeSettings.objects.get(user=request.user)
            if not settings.has_valid_api_key():
                return Response(
                    {"error": "Please configure your Claude API key first"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except UserClaudeSettings.DoesNotExist:
            return Response(
                {"error": "Please configure your Claude API key first"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Prepare Claude API request
        try:
            headers = {
                'Content-Type': 'application/json',
                'x-api-key': settings.api_key,
                'anthropic-version': '2023-06-01'
            }

            payload = {
                'model': settings.model,
                'max_tokens': settings.max_tokens,
                'temperature': settings.temperature,
                'messages': messages
            }

            response = requests.post(
                'https://api.anthropic.com/v1/messages',
                headers=headers,
                json=payload,
                timeout=30
            )

            if response.status_code == 200:
                data = response.json()
                return Response({
                    "content": data['content'][0]['text'] if data.get('content') else '',
                    "model": settings.model,
                    "usage": data.get('usage', {}),
                })
            else:
                error_data = response.json() if response.content else {}
                return Response({
                    "error": error_data.get('error', {}).get('message', 'Claude API request failed'),
                    "status_code": response.status_code
                }, status=status.HTTP_400_BAD_REQUEST)

        except requests.exceptions.Timeout:
            return Response(
                {"error": "Request timeout. Please try again."},
                status=status.HTTP_408_REQUEST_TIMEOUT
            )
        except requests.exceptions.RequestException as e:
            return Response(
                {"error": f"Connection error: {str(e)}"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception as e:
            return Response(
                {"error": f"Unexpected error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )