#!/bin/bash

# Set your GitHub credentials via environment variables
GITHUB_TOKEN="${GITHUB_TOKEN:-}"
GITHUB_USERNAME="${GITHUB_USERNAME:-}"

if [ -z "$GITHUB_TOKEN" ] || [ -z "$GITHUB_USERNAME" ]; then
    echo "Set GITHUB_TOKEN and GITHUB_USERNAME environment variables"
    exit 1
fi

# Get project name from package.json, fallback to cdt-backend-core
PROJECT_NAME=$(node -p "require('./package.json').name" 2>/dev/null || echo "cdt-backend-core")
GITHUB_USER=$GITHUB_USERNAME

# Validate project name
if [ -z "$PROJECT_NAME" ]; then
    echo "❌ PROJECT_NAME is not set."
    exit 1
fi

# Login to GHCR
echo "🔐 Logging in to GHCR..."
echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_USERNAME --password-stdin

if [ $? -ne 0 ]; then
    echo "❌ Login failed. Check token."
    exit 1
fi

echo "✅ Logged in to GHCR"

# Pull the latest image
echo "📥 Pulling latest image..."
docker pull ghcr.io/$GITHUB_USER/$PROJECT_NAME:latest

if [ $? -ne 0 ]; then
    echo "❌ Pull failed"
    exit 1
fi

# Stop and remove any existing container with the same name
echo "🛑 Stopping existing container..."
docker stop $PROJECT_NAME 2>/dev/null || true
docker rm $PROJECT_NAME 2>/dev/null || true

# Run the container with port mapping
echo "🚀 Starting container on port 3005..."
docker run -d \
  --name $PROJECT_NAME \
  -p 3005:3000 \
  --restart unless-stopped \
  ghcr.io/$GITHUB_USER/$PROJECT_NAME:latest

if [ $? -ne 0 ]; then
    echo "❌ Container startup failed"
    exit 1
fi

echo "✅ Container started successfully!"
echo "🌐 Application running on: http://localhost:3005"
echo "📦 Container name: $PROJECT_NAME"
echo "🔍 View logs: docker logs $PROJECT_NAME"