from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

def api_root(request):
    return JsonResponse({
        'message': 'AI Task Manager API',
        'endpoints': {
            'admin': '/admin/',
            'tasks': '/api/tasks/',
            'auth': '/api/auth/',
        }
    })

urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    path('', include('apps.tasks.urls')),
    path('api/auth/', include('apps.users.urls')),
]