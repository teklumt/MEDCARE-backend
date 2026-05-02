.PHONY: help install dev build test lint format clean docker-build docker-run docker-down seed

# Variables
PROJECT_NAME := med-care-admin-backend
DOCKER_IMAGE := med-care-admin:latest
DOCKER_CONTAINER := med-care-admin-container
NODE_ENV := development
PORT := 5000
MONGODB_URI := mongodb://localhost:27017/medcare-admin

# Colors for output
CYAN := \033[0;36m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

help:
	@echo "$(CYAN)╔════════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(CYAN)║      MED-CARE Admin Backend - Makefile Commands               ║$(NC)"
	@echo "$(CYAN)╚════════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(GREEN)📦 Installation & Dependencies:$(NC)"
	@echo "  $(YELLOW)make install$(NC)        Install all npm dependencies"
	@echo ""
	@echo "$(GREEN)🚀 Development:$(NC)"
	@echo "  $(YELLOW)make dev$(NC)            Start development server with hot reload"
	@echo "  $(YELLOW)make seed$(NC)           Seed database with initial data"
	@echo "  $(YELLOW)make resetdb$(NC)        Reset database completely"
	@echo ""
	@echo "$(GREEN)🏗️  Building & Compilation:$(NC)"
	@echo "  $(YELLOW)make build$(NC)          Build TypeScript to JavaScript"
	@echo "  $(YELLOW)make compile$(NC)        Alias for make build"
	@echo ""
	@echo "$(GREEN)✅ Testing & Quality:$(NC)"
	@echo "  $(YELLOW)make test$(NC)           Run all tests"
	@echo "  $(YELLOW)make test-watch$(NC)     Run tests in watch mode"
	@echo "  $(YELLOW)make lint$(NC)           Run ESLint"
	@echo "  $(YELLOW)make format$(NC)         Format code with Prettier"
	@echo "  $(YELLOW)make format-check$(NC)   Check code formatting"
	@echo ""
	@echo "$(GREEN)🐳 Docker Commands:$(NC)"
	@echo "  $(YELLOW)make docker-build$(NC)   Build Docker image"
	@echo "  $(YELLOW)make docker-run$(NC)     Run container (detached)"
	@echo "  $(YELLOW)make docker-dev$(NC)     Run container in development mode"
	@echo "  $(YELLOW)make docker-stop$(NC)    Stop running container"
	@echo "  $(YELLOW)make docker-down$(NC)    Stop and remove container"
	@echo "  $(YELLOW)make docker-logs$(NC)    View container logs"
	@echo "  $(YELLOW)make docker-shell$(NC)   Open shell in running container"
	@echo ""
	@echo "$(GREEN)📊 Database & Utilities:$(NC)"
	@echo "  $(YELLOW)make db-start$(NC)       Start MongoDB (if using Docker)"
	@echo "  $(YELLOW)make db-stop$(NC)        Stop MongoDB container"
	@echo "  $(YELLOW)make studio$(NC)         Open Prisma Studio (if using Prisma)"
	@echo ""
	@echo "$(GREEN)🧹 Cleanup:$(NC)"
	@echo "  $(YELLOW)make clean$(NC)          Remove build artifacts and cache"
	@echo "  $(YELLOW)make clean-all$(NC)      Remove node_modules, dist, and cache"
	@echo "  $(YELLOW)make prune$(NC)          Clean npm cache"
	@echo ""

# ============================================================================
# 📦 INSTALLATION & DEPENDENCIES
# ============================================================================

install:
	@echo "$(CYAN)📦 Installing dependencies...$(NC)"
	pnpm install
	@echo "$(GREEN)✅ Dependencies installed$(NC)"

# ============================================================================
# 🚀 DEVELOPMENT
# ============================================================================

dev:
	@echo "$(CYAN)🚀 Starting development server...$(NC)"
	pnpm dev

dev-debug:
	@echo "$(CYAN)🐛 Starting development server in debug mode...$(NC)"
	pnpm dev -- --inspect

start:
	@echo "$(CYAN)🚀 Starting server...$(NC)"
	pnpm start

seed:
	@echo "$(CYAN)🌱 Seeding database with sample data...$(NC)"
	pnpm seed
	@echo "$(GREEN)✅ Database seeded successfully$(NC)"

resetdb:
	@echo "$(RED)⚠️  Resetting database (this will delete all data)...$(NC)"
	npm run seed:reset
	@echo "$(GREEN)✅ Database reset complete$(NC)"

# ============================================================================
# 🏗️  BUILDING & COMPILATION
# ============================================================================

build:
	@echo "$(CYAN)🏗️  Building TypeScript...$(NC)"
	pnpm build
	@echo "$(GREEN)✅ Build complete$(NC)"

compile: build

prod-build:
	@echo "$(CYAN)🏗️  Building for production...$(NC)"
	pnpm build
	@echo "$(GREEN)✅ Production build complete$(NC)"

# ============================================================================
# ✅ TESTING & QUALITY
# ============================================================================

test:
	@echo "$(CYAN)✅ Running tests...$(NC)"
	pnpm test

test-watch:
	@echo "$(CYAN)👀 Running tests in watch mode...$(NC)"
	pnpm test -- --watch

test-coverage:
	@echo "$(CYAN)📊 Running tests with coverage...$(NC)"
	pnpm test -- --coverage

lint:
	@echo "$(CYAN)🔍 Running ESLint...$(NC)"
	pnpm lint
	@echo "$(GREEN)✅ Linting complete$(NC)"

lint-fix:
	@echo "$(CYAN)🔧 Fixing linting issues...$(NC)"
	pnpm lint:fix
	@echo "$(GREEN)✅ Linting issues fixed$(NC)"

format:
	@echo "$(CYAN)✨ Formatting code with Prettier...$(NC)"
	pnpm format
	@echo "$(GREEN)✅ Code formatted$(NC)"

format-check:
	@echo "$(CYAN)🔍 Checking code format...$(NC)"
	pnpm format:check

# ============================================================================
# 🐳 DOCKER COMMANDS
# ============================================================================

docker-build:
	@echo "$(CYAN)🐳 Building Docker image: $(DOCKER_IMAGE)...$(NC)"
	docker build -t $(DOCKER_IMAGE) .
	@echo "$(GREEN)✅ Docker image built$(NC)"

docker-run:
	@echo "$(CYAN)🐳 Running container: $(DOCKER_CONTAINER)...$(NC)"
	docker run -d \
		--name $(DOCKER_CONTAINER) \
		-p $(PORT):$(PORT) \
		-e NODE_ENV=production \
		-e MONGODB_URI=$(MONGODB_URI) \
		$(DOCKER_IMAGE)
	@echo "$(GREEN)✅ Container running on port $(PORT)$(NC)"

docker-dev:
	@echo "$(CYAN)🐳 Running container in development mode...$(NC)"
	docker run -it \
		--name $(DOCKER_CONTAINER)-dev \
		-p $(PORT):$(PORT) \
		-v $$(pwd):/app \
		-e NODE_ENV=development \
		-e MONGODB_URI=$(MONGODB_URI) \
		$(DOCKER_IMAGE)

docker-stop:
	@echo "$(CYAN)🛑 Stopping container: $(DOCKER_CONTAINER)...$(NC)"
	docker stop $(DOCKER_CONTAINER) || true
	@echo "$(GREEN)✅ Container stopped$(NC)"

docker-down:
	@echo "$(CYAN)🛑 Stopping and removing container...$(NC)"
	docker stop $(DOCKER_CONTAINER) 2>/dev/null || true
	docker rm $(DOCKER_CONTAINER) 2>/dev/null || true
	@echo "$(GREEN)✅ Container removed$(NC)"

docker-logs:
	@echo "$(CYAN)📋 Container logs:$(NC)"
	docker logs -f $(DOCKER_CONTAINER)

docker-shell:
	@echo "$(CYAN)🔧 Opening shell in container...$(NC)"
	docker exec -it $(DOCKER_CONTAINER) sh

docker-clean:
	@echo "$(CYAN)🧹 Cleaning Docker resources...$(NC)"
	docker system prune -f
	@echo "$(GREEN)✅ Docker cleanup complete$(NC)"

docker-compose-up:
	@echo "$(CYAN)🐳 Starting services with docker-compose...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✅ Services started$(NC)"

docker-compose-down:
	@echo "$(CYAN)🛑 Stopping services...$(NC)"
	docker-compose down
	@echo "$(GREEN)✅ Services stopped$(NC)"

docker-compose-logs:
	@echo "$(CYAN)📋 Docker compose logs:$(NC)"
	docker-compose logs -f

# ============================================================================
# 📊 DATABASE & UTILITIES
# ============================================================================

db-start:
	@echo "$(CYAN)🗄️  Starting MongoDB...$(NC)"
	docker run -d \
		--name mongodb \
		-p 27017:27017 \
		-e MONGO_INITDB_ROOT_USERNAME=root \
		-e MONGO_INITDB_ROOT_PASSWORD=password \
		mongo:latest
	@echo "$(GREEN)✅ MongoDB started on port 27017$(NC)"

db-stop:
	@echo "$(CYAN)🛑 Stopping MongoDB...$(NC)"
	docker stop mongodb
	docker rm mongodb
	@echo "$(GREEN)✅ MongoDB stopped$(NC)"

db-shell:
	@echo "$(CYAN)📊 Connecting to MongoDB shell...$(NC)"
	docker exec -it mongodb mongosh "mongodb://root:password@localhost:27017"

studio:
	@echo "$(CYAN)🎨 Opening Prisma Studio...$(NC)"
	npx prisma studio

# ============================================================================
# 🧹 CLEANUP
# ============================================================================

clean:
	@echo "$(CYAN)🧹 Cleaning build artifacts...$(NC)"
	rm -rf dist build coverage
	@echo "$(GREEN)✅ Cleanup complete$(NC)"

clean-all: clean
	@echo "$(CYAN)🧹 Removing node_modules...$(NC)"
	rm -rf node_modules
	@echo "$(GREEN)✅ Full cleanup complete$(NC)"

prune:
	@echo "$(CYAN)🧹 Pruning pnpm cache...$(NC)"
	pnpm store prune
	@echo "$(GREEN)✅ Cache pruned$(NC)"

# ============================================================================
# 📋 PROJECT INFO
# ============================================================================

info:
	@echo "$(CYAN)📋 Project Information:$(NC)"
	@echo "  Project Name: $(PROJECT_NAME)"
	@echo "  Docker Image: $(DOCKER_IMAGE)"
	@echo "  Port: $(PORT)"
	@echo "  Node Environment: $(NODE_ENV)"
	@echo "  MongoDB URI: $(MONGODB_URI)"

version:
	@echo "$(CYAN)📦 Versions:$(NC)"
	@echo "  Node: $$(node --version)"
	@echo "  npm: $$(npm --version)"

# ============================================================================
# 🔗 COMBINED WORKFLOWS
# ============================================================================

setup: install seed
	@echo "$(GREEN)✅ Project setup complete$(NC)"

full-setup: clean-all install build seed
	@echo "$(GREEN)✅ Full project setup complete$(NC)"

dev-all: install dev
	@echo "$(GREEN)✅ Development environment ready$(NC)"

docker-full: clean docker-build docker-run
	@echo "$(GREEN)✅ Docker setup complete$(NC)"

release: lint test build
	@echo "$(GREEN)✅ Ready for release$(NC)"

# ============================================================================
# DEFAULT TARGET
# ============================================================================

.DEFAULT_GOAL := help
