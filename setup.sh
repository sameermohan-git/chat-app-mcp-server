#!/bin/bash

echo "🚀 Setting up Chat App MCP Server..."

# Check if Python 3.11+ is installed
python_version=$(python3 --version 2>&1 | grep -oP '\d+\.\d+' | head -1)
if [[ $(echo "$python_version >= 3.11" | bc -l) -eq 0 ]]; then
    echo "❌ Python 3.11 or higher is required. Current version: $python_version"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

# Create virtual environment
echo "📦 Creating Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Setup environment file
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your configuration before starting the application."
fi

# Initialize database
echo "🗄️  Initializing database..."
alembic upgrade head

# Setup frontend
echo "🎨 Setting up frontend..."
cd frontend
npm install
cd ..

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your API keys and database configuration"
echo "2. Start the backend: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
echo "3. Start the frontend: cd frontend && npm run dev"
echo ""
echo "The application will be available at:"
echo "- Backend API: http://localhost:8000"
echo "- Frontend: http://localhost:3000"
echo "- API Documentation: http://localhost:8000/docs" 