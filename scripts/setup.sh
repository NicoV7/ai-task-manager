#!/bin/bash

# AI Task Manager Setup Script
# This script sets up the development environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        log_info "Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        log_info "Visit: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    log_success "Docker and Docker Compose are installed"
}

# Check if Docker is running
check_docker_running() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    
    log_success "Docker is running"
}

# Create environment file if it doesn't exist
setup_environment() {
    if [ ! -f ".env" ]; then
        log_info "Creating .env file from .env.example..."
        cp .env.example .env
        log_success ".env file created"
        log_warning "Please update .env file with your configuration"
    else
        log_info ".env file already exists"
    fi
}

# Create necessary directories
create_directories() {
    log_info "Creating necessary directories..."
    
    mkdir -p backups
    mkdir -p nginx/ssl
    mkdir -p backend/staticfiles
    mkdir -p backend/media
    
    log_success "Directories created"
}

# Generate SSL certificates for development
generate_ssl_certs() {
    if [ ! -f "nginx/ssl/cert.pem" ] || [ ! -f "nginx/ssl/key.pem" ]; then
        log_info "Generating self-signed SSL certificates for development..."
        
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/key.pem \
            -out nginx/ssl/cert.pem \
            -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
        
        log_success "SSL certificates generated"
        log_warning "These are self-signed certificates for development only"
    else
        log_info "SSL certificates already exist"
    fi
}

# Build and start development environment
start_development() {
    log_info "Building and starting development environment..."
    
    docker-compose down
    docker-compose up -d --build
    
    # Wait for services to be ready
    log_info "Waiting for services to be ready..."
    sleep 15
    
    # Check if services are running
    if docker-compose ps | grep -q "Up"; then
        log_success "Development environment is running!"
        echo ""
        log_info "Services:"
        log_info "  Frontend: http://localhost:3000"
        log_info "  Backend API: http://localhost:8000"
        log_info "  Admin Panel: http://localhost:8000/admin"
        echo ""
        log_info "To view logs: docker-compose logs -f"
        log_info "To stop: docker-compose down"
    else
        log_error "Some services failed to start"
        log_info "Check logs with: docker-compose logs"
        exit 1
    fi
}

# Create initial superuser
create_superuser() {
    log_info "Would you like to create a Django superuser? (y/N)"
    read -r create_user
    
    if [ "$create_user" = "y" ] || [ "$create_user" = "Y" ]; then
        log_info "Creating superuser..."
        docker-compose exec backend python manage.py createsuperuser
        log_success "Superuser created!"
    fi
}

# Main setup function
main() {
    echo "AI Task Manager Setup"
    echo "===================="
    echo ""
    
    log_info "Starting setup process..."
    
    # Check prerequisites
    check_docker
    check_docker_running
    
    # Setup environment
    setup_environment
    create_directories
    
    # Generate SSL certificates if openssl is available
    if command -v openssl &> /dev/null; then
        generate_ssl_certs
    else
        log_warning "OpenSSL not found. Skipping SSL certificate generation."
    fi
    
    # Start development environment
    start_development
    
    # Create superuser
    create_superuser
    
    echo ""
    log_success "Setup completed successfully!"
    echo ""
    log_info "Next steps:"
    log_info "1. Update .env file with your Claude API key and other settings"
    log_info "2. Visit http://localhost:3000 to access the application"
    log_info "3. Visit http://localhost:8000/admin to access the admin panel"
    echo ""
    log_info "For production deployment, run: ./scripts/deploy.sh prod"
}

# Run main function
main "$@"