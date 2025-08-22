#!/bin/bash

# Frontend build script for Render static site deployment

set -e

echo "Starting frontend build for production..."

# Install dependencies
echo "Installing dependencies..."
npm ci --silent

# Set environment variables for build
export GENERATE_SOURCEMAP=false
export REACT_APP_API_URL=${REACT_APP_API_URL:-https://your-backend-service.onrender.com}

# Build the application
echo "Building React application..."
npm run build

echo "Build completed successfully!"
echo "Built files are in the build/ directory"

# Optional: Display build statistics
if [ -d "build" ]; then
    echo "Build directory contents:"
    ls -la build/
    echo "Build size:"
    du -sh build/
fi