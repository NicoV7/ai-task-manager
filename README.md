# AI Task Manager

An intelligent task management system built with Django (backend) and React (frontend), featuring AI-powered task assistance and recommendations.

## Features

- **Task Management**: Create, update, delete, and organize tasks
- **AI Assistant**: Get intelligent suggestions and help with your tasks
- **User Authentication**: Secure login/registration system  
- **Priority & Status Management**: Organize tasks by priority and status
- **Tag System**: Categorize tasks with custom tags
- **Real-time Updates**: Live updates using WebSockets
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Backend
- Django 4.2+ with Django REST Framework
- PostgreSQL database
- Redis for caching and WebSocket support
- Celery for background tasks
- OpenAI API integration for AI features

### Frontend
- React 18+ with modern hooks
- React Router for navigation
- React Query for state management
- Styled Components for styling
- Axios for API communication

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-task-manager
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start with Docker Compose**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Admin Panel: http://localhost:8000/admin

### Manual Setup (Development)

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

#### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/profile/` - Get user profile

### Tasks
- `GET /api/tasks/` - List all tasks
- `POST /api/tasks/` - Create new task
- `GET /api/tasks/{id}/` - Get specific task
- `PATCH /api/tasks/{id}/` - Update task
- `DELETE /api/tasks/{id}/` - Delete task
- `POST /api/tasks/{id}/ai_suggest/` - Get AI suggestions for task

### Tags
- `GET /api/tags/` - List all tags
- `POST /api/tags/` - Create new tag
- `PATCH /api/tags/{id}/` - Update tag
- `DELETE /api/tags/{id}/` - Delete tag

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key | Required |
| `DEBUG` | Enable debug mode | `True` |
| `DB_NAME` | Database name | `ai_task_manager` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |
| `OPENAI_API_KEY` | OpenAI API key for AI features | Required |
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:8000` |

## Development

### Running Tests
```bash
# Backend tests
cd backend
python manage.py test

# Frontend tests  
cd frontend
npm test
```

### Database Migrations
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

### Creating Superuser
```bash
cd backend
python manage.py createsuperuser
```

## Project Structure

```
ai-task-manager/
├── backend/                 # Django backend
│   ├── apps/
│   │   ├── tasks/          # Task management app
│   │   ├── users/          # User management app
│   │   └── ai_assistant/   # AI integration app
│   ├── taskmanager/        # Main Django project
│   └── requirements.txt
├── frontend/               # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   └── services/      # API services
│   └── package.json
├── docker-compose.yml     # Docker services
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
