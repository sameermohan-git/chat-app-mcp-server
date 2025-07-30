# Quick Start Guide

This guide will help you get the Chat App MCP Server running in minutes.

## 🚀 Option 1: Automated Setup (Recommended)

### Prerequisites
- **macOS/Linux**: Bash shell
- **Windows**: Git Bash or WSL
- **Python**: 3.11+ (via Conda)
- **Node.js**: 18+

### 1. Clone and Setup
```bash
git clone <repository-url>
cd chat-app-mcp-server
./setup.sh
```

The setup script will:
- ✅ Check prerequisites
- ✅ Create Python environment
- ✅ Install dependencies
- ✅ Configure environment
- ✅ Set up database
- ✅ Start external services (if Docker is available)

### 2. Start the Application
```bash
# Terminal 1: Start Backend
conda activate mcp-env311
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Start Frontend
cd frontend
npm run dev
```

### 3. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🐳 Option 2: Docker Setup

### Prerequisites
- Docker and Docker Compose

### 1. Clone and Start
```bash
git clone <repository-url>
cd chat-app-mcp-server
docker compose up -d
```

### 2. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### 3. View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
```

## 🔧 Option 3: Manual Setup

### Backend Setup
```bash
# 1. Create Python environment
conda create -n mcp-env311 python=3.11
conda activate mcp-env311

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Edit .env with your settings

# 4. Start PostgreSQL and Redis
# (Use your preferred method)

# 5. Initialize database
alembic upgrade head

# 6. Start backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
# 1. Install dependencies
cd frontend
npm install

# 2. Start frontend
npm run dev
```

## 🧪 Testing the Setup

### 1. Backend Health Check
```bash
curl http://localhost:8000/
# Should return: {"message":"Welcome to Chat App MCP Server","version":"1.0.0","docs":"/docs"}
```

### 2. Frontend Health Check
```bash
curl http://localhost:3000/
# Should return HTML content
```

### 3. Database Connection
```bash
# PostgreSQL
psql -h localhost -p 5432 -U postgres -d chat_app -c "SELECT 1;"

# Redis
redis-cli ping
```

## 🐛 Troubleshooting

### Common Issues

#### Backend Won't Start
```bash
# Check if port is in use
lsof -i :8000

# Kill existing process
kill <PID>

# Check Python environment
conda activate mcp-env311
python -c "import app.main; print('OK')"
```

#### Frontend Won't Start
```bash
# Check if in correct directory
pwd  # Should be in frontend/

# Clear node modules
rm -rf node_modules package-lock.json
npm install
```

#### Database Issues
```bash
# Check PostgreSQL
docker ps | grep postgres
# or
brew services list | grep postgresql

# Check Redis
docker ps | grep redis
# or
brew services list | grep redis
```

### Reset Everything
```bash
# Stop all services
docker compose down -v

# Remove Python environment
conda env remove -n mcp-env311

# Clear frontend
cd frontend
rm -rf node_modules package-lock.json

# Start fresh
./setup.sh
```

## 📚 Next Steps

1. **Register a user** at http://localhost:3000
2. **Explore the API** at http://localhost:8000/docs
3. **Configure LLM models** in the admin panel
4. **Set up MCP servers** for enhanced functionality
5. **Check out the README.md** for detailed documentation

## 🆘 Need Help?

- Check the **Troubleshooting** section in README.md
- Review the **API Documentation** at http://localhost:8000/docs
- Check **service logs** for error messages
- Ensure all **prerequisites** are installed correctly 