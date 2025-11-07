#!/bin/bash

echo "🚀 Secure Chat Deployment Script"
echo "=================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from example..."
    cat > .env << EOF
JWT_SECRET=$(openssl rand -base64 32)
CORS_ORIGIN=http://localhost
EOF
    echo "✅ Created .env file with random JWT_SECRET"
fi

# Build and start containers
echo ""
echo "📦 Building Docker containers..."
docker-compose build

echo ""
echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📍 Access your application:"
echo "   Frontend: http://localhost"
echo "   Backend:  http://localhost:5000"
echo ""
echo "📊 Check logs: docker-compose logs -f"
echo "🛑 Stop services: docker-compose down"
