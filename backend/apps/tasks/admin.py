from django.contrib import admin
from .models import Task, Tag, AIAssistantInteraction


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'priority', 'status', 'created_at', 'due_date']
    list_filter = ['priority', 'status', 'created_at']
    search_fields = ['title', 'description']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['name', 'color']
    search_fields = ['name']


@admin.register(AIAssistantInteraction)
class AIAssistantInteractionAdmin(admin.ModelAdmin):
    list_display = ['task', 'created_at']
    readonly_fields = ['created_at']
    list_filter = ['created_at']