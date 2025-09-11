from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from cryptography.fernet import Fernet
from django.conf import settings
import os
import base64


class AIProvider(models.Model):
    """Model to store AI provider configurations"""
    
    PROVIDER_CHOICES = [
        ('openai', 'OpenAI'),
        ('anthropic', 'Anthropic'),
        ('google', 'Google AI'),
    ]
    
    name = models.CharField(max_length=50, choices=PROVIDER_CHOICES, unique=True)
    display_name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    api_base_url = models.URLField(blank=True, null=True)
    documentation_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'ai_providers'
        verbose_name = 'AI Provider'
        verbose_name_plural = 'AI Providers'
    
    def __str__(self):
        return self.display_name


class EncryptedTextField(models.TextField):
    """Custom field to encrypt sensitive data like API keys"""
    
    def __init__(self, *args, **kwargs):
        self.encryption_key = self._get_encryption_key()
        super().__init__(*args, **kwargs)
    
    def _get_encryption_key(self):
        """Get or create encryption key"""
        key = getattr(settings, 'FIELD_ENCRYPTION_KEY', None)
        if not key:
            # Generate a key if not provided
            key = Fernet.generate_key()
        elif isinstance(key, str):
            key = key.encode()
        return key
    
    def encrypt_value(self, value):
        """Encrypt the value"""
        if not value:
            return value
        fernet = Fernet(self.encryption_key)
        encrypted = fernet.encrypt(value.encode())
        return base64.b64encode(encrypted).decode()
    
    def decrypt_value(self, value):
        """Decrypt the value"""
        if not value:
            return value
        try:
            fernet = Fernet(self.encryption_key)
            decoded = base64.b64decode(value.encode())
            return fernet.decrypt(decoded).decode()
        except Exception:
            return value  # Return as-is if decryption fails
    
    def from_db_value(self, value, expression, connection):
        if value is None:
            return value
        return self.decrypt_value(value)
    
    def to_python(self, value):
        if isinstance(value, str) or value is None:
            return value
        return str(value)
    
    def get_prep_value(self, value):
        if value is None:
            return value
        return self.encrypt_value(str(value))


class UserAISettings(models.Model):
    """Model to store user-specific AI provider settings"""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='ai_settings')
    preferred_provider = models.CharField(
        max_length=50, 
        choices=AIProvider.PROVIDER_CHOICES,
        default='openai'
    )
    preferred_model = models.CharField(max_length=100, blank=True)
    default_temperature = models.FloatField(default=0.7)
    default_max_tokens = models.IntegerField(default=4096, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_ai_settings'
        verbose_name = 'User AI Settings'
        verbose_name_plural = 'User AI Settings'
    
    def __str__(self):
        return f"{self.user.username} - {self.preferred_provider}"


class UserAPIKey(models.Model):
    """Model to store encrypted API keys for users"""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='api_keys')
    provider = models.CharField(max_length=50, choices=AIProvider.PROVIDER_CHOICES)
    api_key = EncryptedTextField()
    is_active = models.BooleanField(default=True)
    last_tested = models.DateTimeField(null=True, blank=True)
    test_status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('success', 'Success'),
            ('failed', 'Failed'),
        ],
        default='pending'
    )
    test_error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_api_keys'
        verbose_name = 'User API Key'
        verbose_name_plural = 'User API Keys'
        unique_together = ['user', 'provider']
    
    def __str__(self):
        return f"{self.user.username} - {self.provider}"
    
    def clean(self):
        """Validate the API key format for the provider"""
        from .utils.provider_detection import ProviderDetector
        from .services.base import AIProvider as ServiceProvider
        
        if self.api_key and self.provider:
            try:
                provider_enum = ServiceProvider(self.provider)
                if not ProviderDetector.validate_api_key_format(self.api_key, provider_enum):
                    raise ValidationError(
                        f"API key format is not valid for {self.get_provider_display()}"
                    )
            except ValueError:
                raise ValidationError(f"Unknown provider: {self.provider}")


class ConversationSession(models.Model):
    """Model to store AI conversation sessions"""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_conversations')
    title = models.CharField(max_length=200, blank=True)
    provider = models.CharField(max_length=50, choices=AIProvider.PROVIDER_CHOICES)
    model = models.CharField(max_length=100)
    total_tokens_used = models.IntegerField(default=0)
    message_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'ai_conversation_sessions'
        verbose_name = 'Conversation Session'
        verbose_name_plural = 'Conversation Sessions'
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.title or 'Untitled'}"


class ConversationMessage(models.Model):
    """Model to store individual messages in conversations"""
    
    ROLE_CHOICES = [
        ('user', 'User'),
        ('assistant', 'Assistant'),
        ('system', 'System'),
    ]
    
    session = models.ForeignKey(
        ConversationSession, 
        on_delete=models.CASCADE, 
        related_name='messages'
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    content = models.TextField()
    tokens_used = models.IntegerField(default=0)
    response_time = models.FloatField(null=True, blank=True)  # Response time in seconds
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'ai_conversation_messages'
        verbose_name = 'Conversation Message'
        verbose_name_plural = 'Conversation Messages'
        ordering = ['created_at']
    
    def __str__(self):
        content_preview = self.content[:50] + "..." if len(self.content) > 50 else self.content
        return f"{self.role}: {content_preview}"