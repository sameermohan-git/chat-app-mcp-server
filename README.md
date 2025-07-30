# Claude Desktop-like Chat App with MCP Server Integration

A modern desktop-like chat application that integrates with MCP (Model Context Protocol) servers, supports multiple LLM models, and provides comprehensive observability through Langfuse.

## Features

- **Modern Desktop UI**: Clean, responsive interface built with React and TypeScript
- **Admin Panel**: Manage MCP servers, LLM models, and application settings
- **Multi-Model Support**: Connect to various LLM providers (OpenAI, Anthropic, etc.)
- **MCP Server Integration**: Seamlessly connect to MCP servers for enhanced capabilities
- **Chat Memory**: Persistent conversation history with context awareness
- **Observability**: Full integration with Langfuse for monitoring and analytics
- **Real-time Chat**: WebSocket-based real-time messaging
- **Authentication**: JWT-based user authentication and authorization

## Tech Stack

### Backend
- **Python 3.11** with FastAPI
- **SQLAlchemy 2.0** with Alembic for database migrations
- **PostgreSQL** for data persistence
- **Redis** for caching and session management
- **JWT** for authentication
- **Langfuse** for observability
- **WebSockets** for real-time communication

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Query** for state management
- **React Router DOM** for routing
- **Axios** for HTTP client
- **Lucide React** for icons
- **React Hot Toast** for notifications

## Quick Start

> **🚀 For the fastest setup, see [QUICKSTART.md](QUICKSTART.md)**

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (running on port 5432)
- Redis (running on port 6379)
- Conda (recommended for Python environment management)

### Option 1: Automated Setup (Recommended)

#### 1. Backend Setup

1. **Clone and navigate to the project:**
```bash
cd chat-app-mcp-server
```

2. **Create and activate Conda environment:**
```bash
conda create -n mcp-env311 python=3.11
conda activate mcp-env311
```

3. **Install Python dependencies:**
```bash
pip install -r requirements.txt
```

4. **Set up environment variables:**
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration (see Environment Variables section below)
```

5. **Initialize the database:**
```bash
alembic upgrade head
```

6. **Start the backend server:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at: http://localhost:8000

#### 2. Frontend Setup

1. **Navigate to the frontend directory:**
```bash
cd frontend
```

2. **Install Node.js dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm run dev
```

The frontend will be available at: http://localhost:3000

### Option 2: Docker Setup

#### Prerequisites for Docker
- Docker and Docker Compose installed

#### 1. Start All Services with Docker Compose

```bash
# Start all services (PostgreSQL, Redis, Backend, Frontend)
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

#### 2. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

#### 3. Development with Docker

For development, you can mount your source code:

```bash
# Start only external services
docker compose up -d postgres redis

# Run backend locally
conda activate mcp-env311
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run frontend locally
cd frontend
npm run dev
```

### Option 3: Manual Setup

## Environment Variables

Create a `.env` file in the root directory:

```env
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
```

## API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **API Root**: http://localhost:8000/

## Project Structure

```
chat-app-mcp-server/
├── app/                    # Backend application
│   ├── api/               # API routes and dependencies
│   │   ├── auth.py        # Authentication endpoints
│   │   ├── chat.py        # Chat endpoints
│   │   ├── admin.py       # Admin endpoints
│   │   ├── websocket.py   # WebSocket endpoints
│   │   └── deps.py        # Dependency injection
│   ├── core/              # Core configuration
│   │   ├── config.py      # Settings management
│   │   └── database.py    # Database connection
│   ├── models/            # SQLAlchemy ORM models
│   │   ├── user.py        # User model
│   │   └── chat.py        # Chat and Message models
│   ├── schemas/           # Pydantic schemas
│   │   ├── user.py        # User schemas
│   │   ├── auth.py        # Authentication schemas
│   │   └── chat.py        # Chat schemas
│   ├── services/          # Business logic
│   │   └── auth_service.py # Authentication service
│   └── main.py            # FastAPI application entry point
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Layout.tsx # Main layout component
│   │   │   └── LoadingSpinner.tsx
│   │   ├── pages/         # Page components
│   │   │   └── Login.tsx  # Login page
│   │   ├── hooks/         # Custom hooks
│   │   │   └── useAuth.tsx # Authentication hook
│   │   ├── lib/           # Utilities
│   │   │   └── api.ts     # API client
│   │   ├── types/         # TypeScript types
│   │   │   └── index.ts   # Shared types
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Application entry point
│   ├── package.json       # Node.js dependencies
│   ├── vite.config.ts     # Vite configuration
│   └── tailwind.config.js # Tailwind CSS configuration
├── alembic/               # Database migrations
├── alembic.ini           # Alembic configuration
├── requirements.txt       # Python dependencies
└── .env                   # Environment variables
```

## Troubleshooting

### Common Issues

#### 1. Backend Won't Start
- **Error**: `ModuleNotFoundError: No module named 'email_validator'`
  - **Solution**: Run `pip install email-validator`
- **Error**: `Address already in use`
  - **Solution**: Kill existing process: `lsof -i :8000` then `kill <PID>`
- **Error**: `sqlalchemy.exc.InvalidRequestError: Attribute name 'metadata' is reserved`
  - **Solution**: This has been fixed in the code - the column is now `message_metadata`

#### 2. Frontend Won't Start
- **Error**: `npm: command not found`
  - **Solution**: Install Node.js from https://nodejs.org/
- **Error**: `Expected ">" but found "value"`
  - **Solution**: Make sure you're in the `frontend` directory when running `npm run dev`

#### 3. Database Issues
- **Error**: `psycopg2.OperationalError: connection to server at "localhost" (127.0.0.1), port 5432 failed`
  - **Solution**: Ensure PostgreSQL is running and accessible on port 5432
- **Error**: `alembic.util.exc.CommandError: Can't locate revision identified by 'head'`
  - **Solution**: Run `alembic revision --autogenerate -m "Initial migration"` then `alembic upgrade head`

#### 4. White Screen on Frontend
- **Solution**: Check browser console for errors, ensure backend is running on port 8000

### Health Checks

Verify your services are running:

```bash
# Check backend
curl http://localhost:8000/

# Check frontend
curl http://localhost:3000/

# Check PostgreSQL
psql -h localhost -p 5432 -U postgres -d chat_app -c "SELECT 1;"

# Check Redis
redis-cli ping
```

## Development Workflow

1. **Start external services** (PostgreSQL, Redis)
2. **Start backend**: `conda activate mcp-env311 && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
3. **Start frontend**: `cd frontend && npm run dev`
4. **Access application**: http://localhost:3000

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user info

### Chat
- `GET /chat/` - Get chat history
- `POST /chat/` - Create new chat
- `GET /chat/{chat_id}` - Get specific chat
- `POST /chat/{chat_id}/messages` - Send message

### Admin
- `GET /admin/mcp-servers` - List MCP servers
- `POST /admin/mcp-servers` - Add MCP server
- `GET /admin/llm-models` - List LLM models
- `POST /admin/llm-models` - Add LLM model

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License 