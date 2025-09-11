from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AIProviderViewSet,
    UserAISettingsView,
    UserAPIKeyView,
    TestAPIKeyView,
    ChatCompletionView
)

router = DefaultRouter()
router.register(r'providers', AIProviderViewSet, basename='ai-providers')

urlpatterns = [
    path('', include(router.urls)),
    path('settings/', UserAISettingsView.as_view(), name='user-ai-settings'),
    path('api-keys/', UserAPIKeyView.as_view(), name='user-api-keys'),
    path('test-connection/', TestAPIKeyView.as_view(), name='test-api-key'),
    path('chat/', ChatCompletionView.as_view(), name='chat-completion'),
]