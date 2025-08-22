# 🤖 AI Task Manager

A modern, full-stack task management application with AI-powered suggestions, dark mode support, and beautiful animations.

![AI Task Manager Demo](https://img.shields.io/badge/Demo-Live-brightgreen)
![Django](https://img.shields.io/badge/Django-5.2.5-green)
![React](https://img.shields.io/badge/React-18.x-blue)
![Docker](https://img.shields.io/badge/Docker-Compose-blue)

## ✨ Features

### 🎯 Core Functionality
- **Task Management**: Create, edit, delete, and organize tasks
- **Priority Levels**: Urgent, High, Medium, Low priority settings
- **Status Tracking**: Todo, In Progress, Completed status
- **Due Dates**: Set and track task deadlines
- **Tags**: Organize tasks with custom tags
- **Search & Filter**: Advanced filtering by status, priority, and text search

### 🤖 AI Integration
- **Claude AI Suggestions**: Get intelligent task recommendations powered by Anthropic Claude
- **Context-Aware**: AI understands your task context and provides relevant suggestions
- **Real-time Responses**: Instant AI-powered insights and task assistance

### 🎨 Modern UI/UX
- **Dark Mode**: Beautiful dark/light theme toggle with system preference detection
- **Smooth Animations**: Polished micro-interactions and transitions throughout the app
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Modern Design**: Clean, intuitive interface with glassmorphism effects

### 🔐 Authentication & Security
- **User Authentication**: Secure login and registration system
- **Token-based Auth**: JWT authentication for API security
- **Protected Routes**: Client-side route protection

## Tech Stack

### Backend
- **Django 5.2.5**: Web framework with Django REST Framework
- **PostgreSQL**: Primary database for data persistence
- **Redis**: Caching and session storage
- **Anthropic Claude**: AI integration for intelligent suggestions

### Frontend
- **React 18**: Modern UI framework with hooks
- **React Query**: Server state management and caching
- **Styled Components**: CSS-in-JS styling with theme support
- **React Router**: Client-side routing
- **Lucide React**: Beautiful, customizable icons

### DevOps
- **Docker & Docker Compose**: Containerization for easy deployment
- **PostgreSQL**: Robust relational database
- **Redis**: High-performance caching layer
- **Nginx**: Production web server (configured)

## Quick Start

### Prerequisites
- [Docker](https://www.docker.com/get-started) and Docker Compose
- [Git](https://git-scm.com/)
- [Claude API Key](https://anthropic.com/) (optional, for AI features)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/ai-task-manager.git
cd ai-task-manager
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```bash
# Database Configuration
DB_NAME=taskmanager
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=db
DB_PORT=5432

# Django Configuration
SECRET_KEY=your-super-secret-key-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,backend

# API Keys
CLAUDE_API_KEY=your-claude-api-key-here
GITHUB_TOKEN=your-github-token-here

# Redis Configuration
REDIS_URL=redis://redis:6379/0

# Frontend Configuration
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000

# Port Configuration
BACKEND_PORT=8000
FRONTEND_PORT=3000
DB_PORT=5432
REDIS_PORT=6379

# Production Settings (for deployment)
PRODUCTION=False
DOMAIN=localhost
```

### 3. Start the Application
```bash
# Start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin

### 5. Create a Superuser (Optional)
```bash
docker-compose exec backend python manage.py createsuperuser
```

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
| `CLAUDE_API_KEY` | Anthropic Claude API key for AI features | Required for AI features |
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
├── backend/                 # Django API
│   ├── apps/               # Django apps
│   │   ├── accounts/       # User authentication
│   │   └── tasks/          # Task management & AI integration
│   ├── taskmanager/        # Project settings
│   └── requirements.txt    # Python dependencies
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts (Auth, Theme)
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   └── package.json        # Node.js dependencies
├── docker-compose.yml      # Docker services
├── .env                    # Environment variables
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
