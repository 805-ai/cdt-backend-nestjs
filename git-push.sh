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

# Use timestamp for unique tag
TAG="$(date +%Y%m%d-%H%M%S)"

# Login to GHCR
echo "🔐 Logging in to GHCR..."
echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_USERNAME --password-stdin

if [ $? -ne 0 ]; then
    echo "❌ Login failed. Check token."
    exit 1
fi

echo "✅ Logged in to GHCR"

# Build
echo "🔨 Building: $PROJECT_NAME:$TAG"
docker build -t $PROJECT_NAME:$TAG .

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

# Tag
docker tag $PROJECT_NAME:$TAG $PROJECT_NAME:latest
echo "🏷️ Tagging for GHCR..."
docker tag $PROJECT_NAME:$TAG ghcr.io/$GITHUB_USER/$PROJECT_NAME:$TAG
docker tag $PROJECT_NAME:$TAG ghcr.io/$GITHUB_USER/$PROJECT_NAME:latest

# Push
echo "🚀 Pushing to GHCR..."
docker push ghcr.io/$GITHUB_USER/$PROJECT_NAME:$TAG
docker push ghcr.io/$GITHUB_USER/$PROJECT_NAME:latest

if [ $? -ne 0 ]; then
    echo "❌ Push failed"
    exit 1
fi

echo "✅ Pushed!"
echo "📦 Tags: ghcr.io/$GITHUB_USER/$PROJECT_NAME:$TAG | latest"