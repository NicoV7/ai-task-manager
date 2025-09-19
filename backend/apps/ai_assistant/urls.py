from django.urls import path
from .views import (
    ClaudeSettingsView,
    TestClaudeConnectionView,
    ClaudeChatView
)

urlpatterns = [
    path('settings/', ClaudeSettingsView.as_view(), name='claude-settings'),
    path('test-connection/', TestClaudeConnectionView.as_view(), name='test-claude-connection'),
    path('chat/', ClaudeChatView.as_view(), name='claude-chat'),
]