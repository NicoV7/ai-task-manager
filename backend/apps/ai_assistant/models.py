from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
import re


class UserClaudeSettings(models.Model):
    """Simplified model to store user's Claude API key and settings"""

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='claude_settings')
    api_key = models.CharField(max_length=255, blank=True, help_text="Your Claude API key from Anthropic")
    model = models.CharField(
        max_length=50,
        default='claude-3-5-sonnet-20241022',
        choices=[
            ('claude-3-5-sonnet-20241022', 'Claude 3.5 Sonnet'),
            ('claude-3-5-haiku-20241022', 'Claude 3.5 Haiku'),
            ('claude-3-opus-20240229', 'Claude 3 Opus'),
        ],
        help_text="Claude model to use for AI suggestions"
    )
    max_tokens = models.IntegerField(default=4096, help_text="Maximum tokens per response")
    temperature = models.FloatField(default=0.7, help_text="Response creativity (0.0-1.0)")
    is_active = models.BooleanField(default=False, help_text="Whether AI features are enabled")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_claude_settings'
        verbose_name = 'User Claude Settings'
        verbose_name_plural = 'User Claude Settings'

    def __str__(self):
        return f"{self.user.username} - Claude Settings"

    def clean(self):
        """Validate Claude API key format"""
        if self.api_key:
            # Claude API keys typically start with 'sk-ant-api03-'
            if not re.match(r'^sk-ant-api03-[A-Za-z0-9_-]+$', self.api_key):
                raise ValidationError("Invalid Claude API key format. Keys should start with 'sk-ant-api03-'")

    def has_valid_api_key(self):
        """Check if user has a valid API key configured"""
        return bool(self.api_key and self.api_key.startswith('sk-ant-api03-'))

    def save(self, *args, **kwargs):
        self.full_clean()
        # Auto-activate if API key is provided
        if self.api_key and not self.is_active:
            self.is_active = True
        elif not self.api_key:
            self.is_active = False
        super().save(*args, **kwargs)