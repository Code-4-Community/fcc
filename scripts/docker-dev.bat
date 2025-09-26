@echo off
REM Docker Development Helper for Windows
REM This script provides easy commands for Docker development

setlocal enabledelayedexpansion

REM Define colors (Windows)
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "NC=[0m"

REM Helper functions
:print_status
echo %GREEN%[INFO]%NC% %~1
goto :eof

:print_warning
echo %YELLOW%[WARNING]%NC% %~1
goto :eof

:print_error
echo %RED%[ERROR]%NC% %~1
goto :eof

REM Check if Docker is running
:check_docker
docker info >nul 2>&1
if %errorlevel% neq 0 (
    call :print_error "Docker is not running. Please start Docker Desktop."
    echo.
    echo To install Docker Desktop:
    echo 1. Download from https://www.docker.com/products/docker-desktop
    echo 2. Install and restart your computer
    echo 3. Start Docker Desktop
    echo 4. Wait for Docker to be ready (check system tray icon)
    echo.
    pause
    exit /b 1
)
goto :eof

REM Setup environment file
:setup_env
if not exist .env.docker (
    call :print_status "Creating .env.docker from template..."
    copy .env.docker.example .env.docker >nul
    call :print_warning "Please review and update .env.docker with your configuration"
)
goto :eof

REM Build images
:build
call :print_status "Building Docker images..."
docker-compose -f docker-compose.dev.yml build --no-cache
goto :eof

REM Start services
:up
call :print_status "Starting development services..."
call :setup_env
docker-compose -f docker-compose.dev.yml up -d
call :print_status "Services started! Backend: http://localhost:3000/api"
call :print_status "Database admin: http://localhost:8080 (user: postgres, pass: postgres, server: postgres)"
goto :eof

REM Stop services
:down
call :print_status "Stopping development services..."
docker-compose -f docker-compose.dev.yml down
goto :eof

REM Restart services
:restart
call :print_status "Restarting development services..."
call :down
call :up
goto :eof

REM View logs
:logs
set service=%~1
if "%service%"=="" set service=backend
call :print_status "Showing logs for %service%..."
docker-compose -f docker-compose.dev.yml logs -f %service%
goto :eof

REM Run migrations
:migrate
call :print_status "Running database migrations..."
docker-compose -f docker-compose.dev.yml exec backend sh -c "cd /app && npm run migration:run"
goto :eof

REM Show status
:status
call :print_status "Docker services status:"
docker-compose -f docker-compose.dev.yml ps
goto :eof

REM Main script logic
if "%1"=="build" (
    call :check_docker
    call :build
) else if "%1"=="up" (
    call :check_docker
    call :up
) else if "%1"=="down" (
    call :down
) else if "%1"=="restart" (
    call :check_docker
    call :restart
) else if "%1"=="logs" (
    call :logs %2
) else if "%1"=="migrate" (
    call :migrate
) else if "%1"=="status" (
    call :status
) else (
    echo Docker Development Helper for Windows
    echo.
    echo Usage: %0 {command}
    echo.
    echo Commands:
    echo   build              Build Docker images
    echo   up                 Start development services
    echo   down               Stop development services
    echo   restart            Restart development services
    echo   logs [service]     Show logs (default: backend)
    echo   migrate            Run database migrations
    echo   status             Show services status
    echo.
    echo Examples:
    echo   %0 up                    Start all services
    echo   %0 logs backend          Show backend logs
    echo   %0 migrate               Run migrations
    echo.
    echo Prerequisites:
    echo   - Docker Desktop installed and running
    echo   - Download from: https://www.docker.com/products/docker-desktop
)
