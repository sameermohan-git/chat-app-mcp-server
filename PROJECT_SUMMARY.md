# Chat App MCP Server - Project Summary

## 🎯 Project Overview

A modern, desktop-like chat application that integrates with MCP (Model Context Protocol) servers, supports multiple LLM models, and provides comprehensive observability through Langfuse. Built with Python 3.11 backend and React TypeScript frontend.

## ✨ Key Features

### 🔐 Authentication & User Management
- JWT-based authentication
- User registration and login
- Role-based access control (Admin/User)
- Secure password hashing with bcrypt

### 💬 Chat System
- Real-time messaging with WebSocket support
- Persistent chat history
- Multi-turn conversation support
- Chat memory and context management
- Message metadata tracking

### 🤖 LLM Integration
- Support for multiple LLM providers (OpenAI, Anthropic)
- Configurable model parameters
- Admin interface for model management
- Automatic response generation

### 🔌 MCP Server Integration
- HTTP and WebSocket MCP server support
- Server connection testing
- Admin interface for server management
- Enhanced responses with MCP data

### 🧠 Memory & Context
- Redis-based caching for chat memory
- Conversation history management
- Context summarization
- Configurable memory TTL

### 📊 Observability
- Full Langfuse integration
- Trace generation for all operations
- Performance monitoring
- Error tracking and logging

### 🎨 Modern UI
- Clean, responsive design
- Desktop-like interface
- Real-time updates
- Mobile-friendly layout

## 🏗️ Architecture

### Backend (Python 3.11 + FastAPI)
```
app/
├── api/           # API routes and endpoints
├── core/          # Configuration and database setup
├── models/        # SQLAlchemy database models
├── schemas/       # Pydantic request/response models
├── services/      # Business logic and external integrations
└── main.py        # FastAPI application entry point
```

### Frontend (React 18 + TypeScript)
```
frontend/src/
├── components/    # Reusable UI components
├── hooks/         # Custom React hooks
├── lib/           # Utilities and API client
├── pages/         # Page components
└── types/         # TypeScript type definitions
```

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL
- Redis

### Option 1: Manual Setup
```bash
# Clone and setup
git clone <repository>
cd chat-app-mcp-server

# Run setup script
./setup.sh

# Edit environment variables
cp env.example .env
# Edit .env with your API keys

# Start backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Start frontend (in new terminal)
cd frontend
npm run dev
```

### Option 2: Docker Setup
```bash
# Start all services
docker-compose up -d

# Access the application
# Backend: http://localhost:8000
# Frontend: http://localhost:3000
# API Docs: http://localhost:8000/docs
```

## 🔧 Configuration

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:password@localhost/chat_app

# Redis
REDIS_URL=redis://localhost:6379

# Langfuse
LANGFUSE_PUBLIC_KEY=your_langfuse_public_key
LANGFUSE_SECRET_KEY=your_langfuse_secret_key

# LLM Providers
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# JWT
JWT_SECRET_KEY=your-secret-key
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user

### Chat Endpoints
- `GET /api/v1/chat/` - List user chats
- `POST /api/v1/chat/` - Create new chat
- `GET /api/v1/chat/{id}` - Get chat details
- `POST /api/v1/chat/{id}/messages` - Send message
- `GET /api/v1/chat/{id}/messages` - Get chat messages

### Admin Endpoints
- `GET /api/v1/admin/llm-models` - List LLM models
- `POST /api/v1/admin/llm-models` - Create LLM model
- `GET /api/v1/admin/mcp-servers` - List MCP servers
- `POST /api/v1/admin/mcp-servers` - Create MCP server

### WebSocket
- `WS /api/v1/ws/{user_id}` - Real-time chat

## 🎯 Usage Guide

### 1. Initial Setup
1. Register an admin user
2. Configure LLM models in admin panel
3. Add MCP servers (optional)
4. Start chatting!

### 2. Creating Chats
- Click "New Chat" to start a conversation
- Select an LLM model for the chat
- Optionally connect an MCP server for enhanced capabilities

### 3. Admin Panel
- Manage LLM models and their configurations
- Add and test MCP server connections
- Monitor system usage and performance

### 4. Chat Features
- Real-time messaging
- Message history persistence
- Context-aware conversations
- Memory management

## 🔍 Monitoring & Observability

### Langfuse Integration
- Automatic trace generation for all operations
- Performance metrics and latency tracking
- Error monitoring and alerting
- Usage analytics

### Logging
- Structured logging throughout the application
- Error tracking and debugging information
- Performance monitoring

## 🛠️ Development

### Backend Development
```bash
# Install dependencies
pip install -r requirements.txt

# Run tests
pytest

# Database migrations
alembic revision --autogenerate -m "description"
alembic upgrade head
```

### Frontend Development
```bash
cd frontend

# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build
```

## 🚀 Deployment

### Production Considerations
1. Use production-grade database (PostgreSQL)
2. Configure Redis for caching
3. Set up proper environment variables
4. Enable HTTPS
5. Configure CORS properly
6. Set up monitoring and logging

### Scaling
- Horizontal scaling with load balancers
- Database connection pooling
- Redis clustering for high availability
- CDN for static assets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the documentation
2. Review API docs at `/docs`
3. Open an issue on GitHub

---

**Built with ❤️ using FastAPI, React, and modern web technologies** 