# AI Task Manager

A full-stack task management application that combines traditional task organization with AI-powered assistance to help you stay productive and organized.

## What This Project Does

This application helps you manage your daily tasks while providing intelligent suggestions through AI integration. You can create, organize, and track tasks while getting contextual recommendations to improve your productivity.

## Key Features

### Task Management
- Create, edit, delete, and organize your tasks
- Set priority levels (Urgent, High, Medium, Low) to focus on what matters most
- Track progress with status updates (Todo, In Progress, Completed)
- Set due dates to keep yourself accountable
- Use custom tags to categorize and group related tasks
- Search and filter tasks to quickly find what you need

### AI-Powered Assistance
- Get intelligent task recommendations powered by Anthropic Claude
- Receive context-aware suggestions based on your existing tasks
- Access real-time AI insights to help with task planning and execution

### User Experience
- Clean, intuitive interface that works on both desktop and mobile
- Dark and light theme options with automatic system preference detection
- Smooth animations and transitions for a polished feel
- Responsive design that adapts to your screen size

### Security and Authentication
- Secure user registration and login system
- JWT-based authentication to protect your data
- Protected routes ensure only authorized access to your tasks

## Technology Stack

### Backend Technologies
- Django 5.2.5 web framework with Django REST Framework for API development
- PostgreSQL database for reliable data storage
- Redis for caching and session management
- Anthropic Claude API integration for AI-powered features

### Frontend Technologies
- React 18 for building the user interface
- React Query for efficient server state management and caching
- Styled Components for component-level styling with theme support
- React Router for client-side navigation
- Lucide React for consistent, beautiful icons

### Infrastructure and Deployment
- Docker and Docker Compose for containerization and easy deployment
- PostgreSQL for robust relational data storage
- Redis for high-performance caching
- Nginx configuration for production web serving

## Getting Started

### What You'll Need
- Docker and Docker Compose installed on your machine
- Git for cloning the repository
- Claude API key from Anthropic (optional, but needed for AI features)

### Installation Steps

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/ai-task-manager.git
cd ai-task-manager
```

2. **Set up your environment**
Create a `.env` file in the root directory with these settings:
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

3. **Start the application**
```bash
# Start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

4. **Access your application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Admin Panel: http://localhost:8000/admin

5. **Create an admin user (optional)**
```bash
docker-compose exec backend python manage.py createsuperuser
```

### Development Setup (Without Docker)

If you prefer to run the services locally without Docker:

**Backend setup:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

**Frontend setup:**
```bash
cd frontend
npm install
npm start
```

## API Reference

The application provides a RESTful API for interacting with tasks and user data.

### User Authentication
- `POST /api/auth/register/` - Create a new user account
- `POST /api/auth/login/` - Sign in to your account
- `POST /api/auth/logout/` - Sign out of your account
- `GET /api/auth/profile/` - Get your user profile information

### Task Management
- `GET /api/tasks/` - Get all your tasks
- `POST /api/tasks/` - Create a new task
- `GET /api/tasks/{id}/` - Get details for a specific task
- `PATCH /api/tasks/{id}/` - Update an existing task
- `DELETE /api/tasks/{id}/` - Delete a task
- `POST /api/tasks/{id}/ai_suggest/` - Get AI-powered suggestions for a task

### Tag Organization
- `GET /api/tags/` - Get all your tags
- `POST /api/tags/` - Create a new tag
- `PATCH /api/tags/{id}/` - Update an existing tag
- `DELETE /api/tags/{id}/` - Delete a tag

## Configuration Options

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `SECRET_KEY` | Django secret key for security | Required |
| `DEBUG` | Enable development debug mode | `True` |
| `DB_NAME` | PostgreSQL database name | `ai_task_manager` |
| `DB_USER` | Database username | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |
| `CLAUDE_API_KEY` | Anthropic Claude API key for AI features | Required for AI features |
| `REACT_APP_API_URL` | Backend API URL for frontend | `http://localhost:8000` |

## Development Workflow

### Testing Your Code
```bash
# Run backend tests
cd backend
python manage.py test

# Run frontend tests
cd frontend
npm test
```

### Working with the Database
```bash
# Create new database migrations after model changes
cd backend
python manage.py makemigrations

# Apply migrations to update the database
python manage.py migrate
```

### Creating an Admin User
```bash
cd backend
python manage.py createsuperuser
```

## How the Project is Organized

```
ai-task-manager/
├── backend/                 # Django API server
│   ├── apps/               # Django applications
│   │   ├── accounts/       # User authentication and profiles
│   │   └── tasks/          # Task management and AI integration
│   ├── taskmanager/        # Django project settings
│   └── requirements.txt    # Python package dependencies
├── frontend/               # React web application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts for state management
│   │   ├── pages/          # Main page components
│   │   ├── services/       # API communication services
│   │   └── utils/          # Helper functions and utilities
│   └── package.json        # Node.js dependencies
├── docker-compose.yml      # Docker services configuration
├── .env                    # Environment variables (create this file)
├── .gitignore             # Files to ignore in version control
└── README.md              # Project documentation
```

## Contributing to the Project

We welcome contributions to make this task manager even better. Here's how to get started:

1. Fork this repository to your GitHub account
2. Create a new branch for your feature (`git checkout -b feature/your-feature-name`)
3. Make your changes and commit them (`git commit -m 'Add your feature description'`)
4. Push your branch to GitHub (`git push origin feature/your-feature-name`)
5. Open a Pull Request to propose your changes

## License

This project is open source and available under the MIT License. See the [LICENSE](LICENSE) file for more details.
