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

## Tech Stack

### Backend
- **Python 3.11** with FastAPI
- **PostgreSQL** for data persistence
- **Redis** for caching and session management
- **Celery** for background tasks
- **Langfuse** for observability

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Vite** for build tooling
- **React Query** for state management

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL
- Redis

### Backend Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Initialize the database:
```bash
alembic upgrade head
```

5. Start the backend server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost/chat_app

# Redis
REDIS_URL=redis://localhost:6379

# Langfuse
LANGFUSE_PUBLIC_KEY=your_langfuse_public_key
LANGFUSE_SECRET_KEY=your_langfuse_secret_key
LANGFUSE_HOST=https://cloud.langfuse.com

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Anthropic
ANTHROPIC_API_KEY=your_anthropic_api_key

# JWT Secret
JWT_SECRET_KEY=your_jwt_secret_key

# CORS Origins
CORS_ORIGINS=["http://localhost:3000", "http://localhost:5173"]
```

## API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Project Structure

```
chat-app-mcp-server/
├── app/                    # Backend application
│   ├── api/               # API routes
│   ├── core/              # Core configuration
│   ├── models/            # Database models
│   ├── services/          # Business logic
│   └── utils/             # Utility functions
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   └── utils/         # Frontend utilities
├── alembic/               # Database migrations
├── tests/                 # Test files
└── requirements.txt       # Python dependencies
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License 