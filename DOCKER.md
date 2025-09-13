# Docker Development Setup

## Overview

**Docker** is like a shipping container for software. Instead of worrying about "works on my machine" problems, Docker packages your entire application with everything it needs to run - code, dependencies, and settings - into portable containers.

**Why Docker?**

- Consistent Environment: Everyone runs the same setup
- Easy Setup: No complex local installations
- Isolated Services: Database, backend, and tools run separately
- Resource Efficient: Start/stop services as needed
- Team Friendly: Same environment for all developers

## Prerequisites

### Required Software

- **Docker Desktop** - The main Docker application ([download here](https://www.docker.com/products/docker-desktop/))
- **Git** - For downloading the project code
- **Node.js & Yarn** - For running project scripts

### Quick Check

1. Open Docker Desktop and make sure it's running
2. Open a terminal/command prompt
3. Run `docker --version` to verify Docker is installed

## Quick Start

Follow these steps to get your development environment running:

### Step 1: Get the Project Code

```bash
git clone <repository-url>
cd fcc
yarn install
```

### Step 2: Start Services

```bash
# Start development services (recommended)
yarn docker:up:dev

# Or start all services
yarn docker:up:all

# Alternative: Using Docker Compose directly
docker-compose -f docker-compose.dev.yml up -d postgres adminer backend-dev
```

### Step 3: Set Up the Database

```bash
# Run migrations on development backend
yarn docker:migrate:dev

# Alternative: Manual command
docker-compose -f docker-compose.dev.yml exec backend-dev sh -c "cd /app && npm run migration:run"
```

### Step 4: Verify Everything Works

- **API**: Visit `http://localhost:3001/api` (development server)
- **Database Viewer**: Visit `http://localhost:8080` (Adminer)
- **Login to Adminer**: System: `PostgreSQL`, Server: `postgres`, Username: `postgres`, Password: `postgres`, Database: `fcc_dev`

## Services Overview

### Backend Development Server (Port 3001)

**Purpose:** Runs your API code with live reloading

**Use cases:** Development, testing new features, running migrations

**Features:**

- Hot Reload: Changes appear instantly without restarting
- Source Access: Can read your TypeScript files
- Development Tools: Better error messages and debugging

### Backend Production Server (Port 3000)

**Purpose:** Runs optimized, compiled version of your API

**Use cases:** Testing production builds, performance testing

**Features:**

- Fast: Optimized for speed
- Secure: Production-ready settings
- Compiled: Runs pre-built JavaScript (not source code)

### PostgreSQL Database (Port 5432)

**Purpose:** Stores all your application data

**Database Credentials:**

- System: `PostgreSQL`
- Host: `postgres`
- Port: `5432`
- Database: `fcc_dev`
- Username: `postgres`
- Password: `postgres`

**Storage:** Uses `postgres_data` volume to persist database files
**Features:**

- Persistent: Data survives container restarts via `postgres_data` volume
- Health Checks: Automatically verifies it's working
- Auto Setup: Creates initial database structure

### Adminer (Port 8080)

**Purpose:** Web interface to view and edit database data
**Use cases:** Checking data, running quick queries, debugging

## Docker Volumes

**What are volumes?** Special folders that persist data outside containers

**Why do we have 2 volumes?**

### 1. postgres_data Volume

- **Purpose:** Stores your database files permanently
- **Location:** `/var/lib/postgresql/data` inside PostgreSQL container
- **Why needed:** Database data must survive container restarts/crashes
- **Size:** Usually small unless you have lots of data

### 2. backend_logs Volume

- **Purpose:** Stores application log files
- **Location:** `/app/logs` inside backend containers
- **Why needed:** Logs help debug issues and track application behavior
- **Size:** Usually very small

**Volume Creation Messages:**

```bash
Volume "fcc_postgres_data"   Created    # Database storage
Volume "fcc_backend_logs"    Created    # Application logs
```

## Commands

### Starting & Stopping Services

```bash
# Start all services
yarn docker:up

# Shorthand commands
yarn docker:up:dev     # Start only dev services (postgres, adminer, backend-dev)
yarn docker:down       # Stop everything
yarn docker:restart    # Restart all services
```

### Checking Status & Logs

```bash
# See which services are running
docker-compose -f docker-compose.dev.yml ps

# View logs from all services
yarn docker:logs

# View logs from specific service
docker-compose -f docker-compose.dev.yml logs -f backend-dev
```

## Database Operations & Migrations

```bash
# RECOMMENDED: Run migrations on development backend
yarn docker:migrate:dev

# Alternative: Run migrations on production backend (not recommended for dev)
yarn docker:migrate

# Run migrations in isolated container (advanced)
yarn docker:migrate:oneoff
```

### Why One-off Migrations Are Powerful

**What happens behind the scenes:**

```bash
# 1. Build fresh image with source code
docker build --file apps/backend/Dockerfile --target build -t fcc-backend-build .

# 2. Run temporary container (auto-deleted when done)
docker run --rm --network fcc_fcc-network \
  -e NX_DB_HOST=postgres \
  -e NX_DB_PORT=5432 \
  -e NX_DB_USERNAME=postgres \
  -e NX_DB_PASSWORD=postgres \
  -e NX_DB_DATABASE=fcc_dev \
  fcc-backend-build npm run migration:run
```

**Key Benefits:**

- Isolated: Doesn't touch your running containers
- Clean: Fresh build every time - no cached issues
- Recoverable: Works when other containers fail
- CI/CD Ready: Perfect for automated deployments
- Testable: Safe to test migrations without affecting dev environment
- Zero Cleanup: Container disappears automatically

**Perfect for:**

- Container crashes or corruption
- Automated deployment pipelines
- Testing migrations safely
- Recovery from migration failures
- Ensuring clean migration runs

## Maintenance & Cleanup

```bash
# Build/rebuild Docker images
yarn docker:build

# Clean up everything (containers, volumes, networks)
yarn docker:clean

# Validate Docker setup
yarn docker:validate
```

### Getting Inside Containers

```bash
# Access development backend (for debugging, running commands)
docker-compose -f docker-compose.dev.yml exec backend-dev sh

# Access production backend (rarely needed)
docker-compose -f docker-compose.dev.yml exec backend sh

# Access database (advanced users)
docker-compose -f docker-compose.dev.yml exec postgres bash
```

## Troubleshooting

### "Command not found" or "docker: command not found"

**Problem:** Docker isn't installed or not in PATH

**Solution:**

1. Install Docker Desktop
2. Restart your terminal/command prompt
3. Try `docker --version` to verify

### "Port already in use"

**Problem:** Another application is using ports 3000, 3001, 5432, or 8080

**Solution:**

1. Find what's using the port: `netstat -ano | findstr :3000` (Windows) or `lsof -i :3000` (Mac/Linux)
2. Stop the conflicting application or change Docker ports in `docker-compose.dev.yml`

### "No space left on device"

**Problem:** Docker is using too much disk space

**Solution:**

```bash
# Clean up unused Docker resources
docker system prune -a
yarn docker:clean
```

### Migration Errors

**Problem:** Database migrations failing

**Solution:**

1. Make sure you're using `backend-dev` (not `backend`) for migrations
2. Check database is healthy first
3. Verify migration files exist in `apps/backend/src/migrations/`

**If regular migrations fail, try:**

```bash
# Use isolated one-off container (most reliable)
yarn docker:migrate:oneoff

# Or restart services and try again
yarn docker:restart
yarn docker:migrate:dev
```

## Development Workflow Tips

### Production Testing

```bash
# Start production backend alongside development
docker-compose -f docker-compose.dev.yml up -d backend

# Test production at http://localhost:3000
# Development still available at http://localhost:3001
```

## Notes

- Volumes keep Postgres data between restarts. Do not remove unless you want a fresh DB.
- Adminer runs in a container so it can reach the Postgres service using the internal Docker hostname `postgres`.

### Security

- This compose file is for development only. Replace default passwords and use secrets in production.
