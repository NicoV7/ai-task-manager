from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Task, Tag, AIAssistantInteraction
from .serializers import TaskSerializer, TagSerializer, AIAssistantInteractionSerializer


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def ai_suggest(self, request, pk=None):
        task = self.get_object()
        user_message = request.data.get('message', '')
        
        ai_response = "AI suggestion placeholder"
        
        interaction = AIAssistantInteraction.objects.create(
            task=task,
            user_message=user_message,
            ai_response=ai_response
        )
        
        return Response({
            'ai_response': ai_response,
            'interaction_id': interaction.id
        })

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