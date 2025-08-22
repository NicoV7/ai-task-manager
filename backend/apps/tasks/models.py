from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator


class Task(models.Model):
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    STATUS_CHOICES = [
        ('todo', 'To Do'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    VELOCITY_CHOICES = [
        ('slow', 'Slow'),
        ('normal', 'Normal'),
        ('fast', 'Fast'),
        ('urgent', 'Urgent'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    notes = models.TextField(blank=True, help_text="Task notes and AI conversation history")
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='todo')
    progress = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Task completion progress (0-100%)"
    )
    velocity = models.CharField(
        max_length=10, 
        choices=VELOCITY_CHOICES, 
        default='normal',
        help_text="Task development velocity"
    )
    due_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    parent_task = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subtasks')
    tags = models.ManyToManyField('Tag', blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title
    
    @property
    def is_parent(self):
        """Check if this task has subtasks"""
        return self.subtasks.exists()
    
    @property
    def is_subtask(self):
        """Check if this task is a subtask"""
        return self.parent_task is not None
    
    @property
    def hierarchy_level(self):
        """Get the hierarchy level (0 = root task, 1 = first level subtask, etc.)"""
        level = 0
        current = self.parent_task
        while current:
            level += 1
            current = current.parent_task
        return level
    
    def get_root_task(self):
        """Get the root task in the hierarchy"""
        current = self
        while current.parent_task:
            current = current.parent_task
        return current
    
    def get_all_subtasks(self):
        """Get all subtasks recursively"""
        def get_subtasks_recursive(task):
            subtasks = []
            for subtask in task.subtasks.all():
                subtasks.append(subtask)
                subtasks.extend(get_subtasks_recursive(subtask))
            return subtasks
        
        return get_subtasks_recursive(self)


class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    color = models.CharField(max_length=7, default='#007bff')
    
    def __str__(self):
        return self.name


class AIAssistantInteraction(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='ai_interactions')
    user_message = models.TextField()
    ai_response = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']