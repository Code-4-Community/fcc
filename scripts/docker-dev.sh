#!/bin/bash

# Docker Development Helper Script
# This script provides easy commands for Docker development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop."
        exit 1
    fi
}

# Function to setup environment file
setup_env() {
    if [ ! -f .env.docker ]; then
        print_status "Creating .env.docker from template..."
        cp .env.docker.example .env.docker
        print_warning "Please review and update .env.docker with your configuration"
    fi
}

# Function to build images
build() {
    print_status "Building Docker images..."
    docker-compose -f docker-compose.dev.yml build --no-cache
}

# Function to start services
up() {
    print_status "Starting development services..."
    setup_env
    docker-compose -f docker-compose.dev.yml up -d
    print_status "Services started! Backend: http://localhost:3000/api"
    print_status "Database admin: http://localhost:8080 (user: postgres, pass: postgres, server: postgres)"
}

# Function to stop services
down() {
    print_status "Stopping development services..."
    docker-compose -f docker-compose.dev.yml down
}

# Function to restart services
restart() {
    print_status "Restarting development services..."
    down
    up
}

# Function to view logs
logs() {
    service=${1:-backend}
    print_status "Showing logs for $service..."
    docker-compose -f docker-compose.dev.yml logs -f "$service"
}

# Function to run migrations
migrate() {
    print_status "Running database migrations..."
    docker-compose -f docker-compose.dev.yml exec backend sh -c "cd /app && npm run migration:run"
}

# Function to generate migration
migrate_generate() {
    if [ -z "$1" ]; then
        print_error "Please provide a migration name: ./docker-dev.sh migrate:generate add_users"
        exit 1
    fi
    print_status "Generating migration: $1"
    docker-compose -f docker-compose.dev.yml exec backend sh -c "cd /app && npm run migration:generate --name=$1"
}

# Function to run backend shell
shell() {
    print_status "Opening shell in backend container..."
    docker-compose -f docker-compose.dev.yml exec backend sh
}

# Function to run tests
test() {
    service=${1:-backend}
    print_status "Running tests for $service..."
    docker-compose -f docker-compose.dev.yml exec "$service" sh -c "cd /app && npm run test:$service"
}

# Function to clean up everything
clean() {
    print_warning "This will remove all containers, volumes, and images. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Cleaning up Docker resources..."
        docker-compose -f docker-compose.dev.yml down -v --remove-orphans
        docker system prune -f
        print_status "Cleanup complete!"
    fi
}

# Function to show status
status() {
    print_status "Docker services status:"
    docker-compose -f docker-compose.dev.yml ps
}

# Main script logic
case "$1" in
    "build")
        check_docker
        build
        ;;
    "up")
        check_docker
        up
        ;;
    "down")
        down
        ;;
    "restart")
        check_docker
        restart
        ;;
    "logs")
        logs "$2"
        ;;
    "migrate")
        migrate
        ;;
    "migrate:generate")
        migrate_generate "$2"
        ;;
    "shell")
        shell
        ;;
    "test")
        test "$2"
        ;;
    "clean")
        clean
        ;;
    "status")
        status
        ;;
    *)
        echo "Docker Development Helper"
        echo ""
        echo "Usage: $0 {command}"
        echo ""
        echo "Commands:"
        echo "  build              Build Docker images"
        echo "  up                 Start development services"
        echo "  down               Stop development services"
        echo "  restart            Restart development services"
        echo "  logs [service]     Show logs (default: backend)"
        echo "  migrate            Run database migrations"
        echo "  migrate:generate   Generate new migration"
        echo "  shell              Open shell in backend container"
        echo "  test [service]     Run tests (default: backend)"
        echo "  status             Show services status"
        echo "  clean              Clean up all Docker resources"
        echo ""
        echo "Examples:"
        echo "  $0 up                    # Start all services"
        echo "  $0 logs backend          # Show backend logs"
        echo "  $0 migrate:generate add_users  # Generate migration"
        ;;
esac
