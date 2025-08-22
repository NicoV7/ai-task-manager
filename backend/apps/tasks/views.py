from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
import logging
from .models import Task, Tag, AIAssistantInteraction
from .serializers import TaskSerializer, TagSerializer, AIAssistantInteractionSerializer
from .services import claude_service

logger = logging.getLogger(__name__)


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def ai_suggest(self, request, pk=None):
        """
        Get AI suggestions for a task using Claude API
        """
        task = self.get_object()
        user_message = request.data.get('message', '')
        
        if not user_message.strip():
            return Response(
                {'error': 'Message is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Get AI suggestion from Claude
            ai_response = claude_service.get_task_suggestion(
                task_title=task.title,
                task_description=task.description or "",
                user_message=user_message
            )
            
            # Save the interaction
            interaction = AIAssistantInteraction.objects.create(
                task=task,
                user_message=user_message,
                ai_response=ai_response
            )
            
            # Append the conversation to task notes with timestamp
            timestamp = timezone.now().strftime('%Y-%m-%d %H:%M:%S')
            conversation_entry = f"\n\n--- AI Conversation ({timestamp}) ---\n"
            conversation_entry += f"You: {user_message}\n"
            conversation_entry += f"AI: {ai_response}\n"
            conversation_entry += "--- End of Conversation ---"
            
            # Update task notes
            if task.notes:
                task.notes += conversation_entry
            else:
                task.notes = conversation_entry.strip()
            task.save()
            
            logger.info(f"AI suggestion generated for task {task.id} by user {request.user.id}")
            
            return Response({
                'ai_response': ai_response,
                'interaction_id': interaction.id
            })
            
        except Exception as e:
            logger.error(f"Error generating AI suggestion: {str(e)}")
            return Response(
                {'error': 'Failed to generate AI suggestion. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def breakdown(self, request, pk=None):
        """
        Break down a complex task into subtasks using AI
        """
        task = self.get_object()
        
        # Check if task already has subtasks
        if task.subtasks.exists():
            return Response(
                {'error': 'Task already has subtasks. Delete existing subtasks first to regenerate.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Get AI breakdown from Claude
            subtasks_data = claude_service.breakdown_task(
                task_title=task.title,
                task_description=task.description or ""
            )
            
            if not subtasks_data:
                return Response(
                    {'error': 'Failed to generate subtasks. The task might be too simple or AI service is unavailable.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create subtasks
            created_subtasks = []
            for subtask_data in subtasks_data:
                subtask = Task.objects.create(
                    title=subtask_data['title'],
                    description=subtask_data['description'],
                    priority=subtask_data['priority'],
                    status='todo',
                    user=request.user,
                    parent_task=task
                )
                created_subtasks.append(subtask)
            
            # Serialize and return the created subtasks
            serializer = self.get_serializer(created_subtasks, many=True)
            
            logger.info(f"Task breakdown completed for task {task.id}: created {len(created_subtasks)} subtasks")
            
            return Response({
                'message': f'Successfully created {len(created_subtasks)} subtasks',
                'subtasks': serializer.data
            })
            
        except Exception as e:
            logger.error(f"Error during task breakdown: {str(e)}")
            return Response(
                {'error': 'Failed to break down task. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def by_status(self, request):
        status_param = request.query_params.get('status')
        if status_param:
            tasks = self.get_queryset().filter(status=status_param)
            serializer = self.get_serializer(tasks, many=True)
            return Response(serializer.data)
        return Response({'error': 'Status parameter required'}, status=400)


class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [IsAuthenticated]