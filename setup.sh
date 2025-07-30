#!/bin/bash

# Chat App MCP Server Setup Script
# This script helps you set up the application for local development

set -e  # Exit on any error

echo "🚀 Chat App MCP Server Setup"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if conda is installed
check_conda() {
    if ! command -v conda &> /dev/null; then
        print_error "Conda is not installed. Please install Anaconda or Miniconda first."
        print_status "Download from: https://docs.conda.io/en/latest/miniconda.html"
        exit 1
    fi
    print_success "Conda is installed"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        print_status "Download from: https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    print_success "Node.js $(node --version) is installed"
}

# Check if Docker is installed (optional)
check_docker() {
    if command -v docker &> /dev/null; then
        print_success "Docker is installed"
        DOCKER_AVAILABLE=true
    else
        print_warning "Docker is not installed. You'll need to run PostgreSQL and Redis manually."
        DOCKER_AVAILABLE=false
    fi
}

# Setup Python environment
setup_python_env() {
    print_status "Setting up Python environment..."
    
    if conda env list | grep -q "mcp-env311"; then
        print_warning "Conda environment 'mcp-env311' already exists"
        read -p "Do you want to recreate it? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            conda env remove -n mcp-env311 -y
            conda create -n mcp-env311 python=3.11 -y
        fi
    else
        conda create -n mcp-env311 python=3.11 -y
    fi
    
    print_success "Python environment created"
}

# Install Python dependencies
install_python_deps() {
    print_status "Installing Python dependencies..."
    
    conda activate mcp-env311
    pip install -r requirements.txt
    
    print_success "Python dependencies installed"
}

# Setup environment file
setup_env_file() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            print_success "Created .env file from .env.example"
        else
            print_warning "No .env.example found. Creating basic .env file..."
            cat > .env << EOF
# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chat_app

# Redis Configuration
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Configuration
CORS_ORIGINS=["http://localhost:3000", "http://localhost:5173"]

# Langfuse (Optional - for observability)
LANGFUSE_PUBLIC_KEY=your_langfuse_public_key
LANGFUSE_SECRET_KEY=your_langfuse_secret_key
LANGFUSE_HOST=https://cloud.langfuse.com

# LLM API Keys (Optional - for chat functionality)
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
EOF
            print_success "Created basic .env file"
        fi
    else
        print_warning ".env file already exists"
    fi
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    conda activate mcp-env311
    
    # Check if PostgreSQL is accessible
    if command -v psql &> /dev/null; then
        if psql -h localhost -p 5432 -U postgres -d chat_app -c "SELECT 1;" &> /dev/null; then
            print_success "PostgreSQL connection successful"
        else
            print_warning "Cannot connect to PostgreSQL. Please ensure it's running on localhost:5432"
            print_status "You can start PostgreSQL with Docker:"
            echo "docker run -d --name postgres-chat-app -e POSTGRES_DB=chat_app -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:15"
        fi
    else
        print_warning "psql not found. Please ensure PostgreSQL is installed and running"
    fi
    
    # Run database migrations
    if alembic current &> /dev/null; then
        print_status "Running database migrations..."
        alembic upgrade head
        print_success "Database migrations completed"
    else
        print_warning "Alembic not initialized. Please run 'alembic upgrade head' manually after starting PostgreSQL"
    fi
}

# Install frontend dependencies
install_frontend_deps() {
    print_status "Installing frontend dependencies..."
    
    cd frontend
    npm install
    cd ..
    
    print_success "Frontend dependencies installed"
}

# Check external services
check_external_services() {
    print_status "Checking external services..."
    
    # Check PostgreSQL
    if command -v psql &> /dev/null; then
        if psql -h localhost -p 5432 -U postgres -d chat_app -c "SELECT 1;" &> /dev/null; then
            print_success "PostgreSQL is running"
        else
            print_warning "PostgreSQL is not accessible on localhost:5432"
        fi
    fi
    
    # Check Redis
    if command -v redis-cli &> /dev/null; then
        if redis-cli ping &> /dev/null; then
            print_success "Redis is running"
        else
            print_warning "Redis is not accessible"
        fi
    fi
}

# Start services with Docker (optional)
start_docker_services() {
    if [ "$DOCKER_AVAILABLE" = true ]; then
        print_status "Starting external services with Docker..."
        
        # Check if containers are already running
        if ! docker ps | grep -q "postgres-chat-app"; then
            print_status "Starting PostgreSQL..."
            docker run -d \
                --name postgres-chat-app \
                -e POSTGRES_DB=chat_app \
                -e POSTGRES_USER=postgres \
                -e POSTGRES_PASSWORD=postgres \
                -p 5432:5432 \
                postgres:15
            print_success "PostgreSQL started"
        else
            print_success "PostgreSQL container already running"
        fi
        
        if ! docker ps | grep -q "redis-chat-app"; then
            print_status "Starting Redis..."
            docker run -d \
                --name redis-chat-app \
                -p 6379:6379 \
                redis:8.0.3
            print_success "Redis started"
        else
            print_success "Redis container already running"
        fi
        
        # Wait for services to be ready
        print_status "Waiting for services to be ready..."
        sleep 10
    fi
}

# Main setup function
main() {
    print_status "Starting setup process..."
    
    # Check prerequisites
    check_conda
    check_node
    check_docker
    
    # Setup Python environment
    setup_python_env
    install_python_deps
    
    # Setup configuration
    setup_env_file
    
    # Start Docker services if available
    if [ "$DOCKER_AVAILABLE" = true ]; then
        read -p "Do you want to start PostgreSQL and Redis with Docker? (Y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            start_docker_services
        fi
    fi
    
    # Setup database
    setup_database
    
    # Install frontend dependencies
    install_frontend_deps
    
    # Check external services
    check_external_services
    
    print_success "Setup completed successfully!"
    echo
    echo "🎉 Next steps:"
    echo "1. Start the backend: conda activate mcp-env311 && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
    echo "2. Start the frontend: cd frontend && npm run dev"
    echo "3. Open http://localhost:3000 in your browser"
    echo
    echo "📚 For more information, see README.md"
}

# Run main function
main "$@" 