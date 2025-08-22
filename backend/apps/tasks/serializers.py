from rest_framework import serializers
from .models import Task, Tag, AIAssistantInteraction


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'color']


class TaskSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    subtasks = serializers.SerializerMethodField()
    parent_task_title = serializers.CharField(source='parent_task.title', read_only=True)
    hierarchy_level = serializers.ReadOnlyField()
    is_parent = serializers.ReadOnlyField()
    is_subtask = serializers.ReadOnlyField()
    
    def get_subtasks(self, obj):
        """Get immediate subtasks (not recursive)"""
        subtasks = obj.subtasks.all()
        return TaskSerializer(subtasks, many=True, context=self.context).data
    
    def validate_progress(self, value):
        """Validate that progress is between 0 and 100."""
        if value < 0 or value > 100:
            raise serializers.ValidationError("Progress must be between 0 and 100.")
        return value

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'notes', 'priority', 'status',
            'progress', 'velocity', 'due_date', 'created_at', 'updated_at', 
            'parent_task', 'parent_task_title', 'subtasks', 'hierarchy_level',
            'is_parent', 'is_subtask', 'tags', 'tag_ids'
        ]

    def create(self, validated_data):
        tag_ids = validated_data.pop('tag_ids', [])
        task = Task.objects.create(**validated_data)
        task.tags.set(tag_ids)
        return task

    def update(self, instance, validated_data):
        tag_ids = validated_data.pop('tag_ids', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if tag_ids is not None:
            instance.tags.set(tag_ids)
        
        return instance


class AIAssistantInteractionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIAssistantInteraction
        fields = ['id', 'user_message', 'ai_response', 'created_at']