#!/bin/bash

# Fix build script for Ubuntu server
echo "Fixing build issue on Ubuntu server..."

# Navigate to project directory
cd /root/wheel-fortune-bg

# Check if public directory exists
if [ ! -d "public" ]; then
    echo "Creating public directory..."
    mkdir -p public
fi

# Copy logo file to create the missing logo-small.png
if [ -f "src/logo-bend.png" ]; then
    echo "Copying logo-bend.png to public/logo-small.png..."
    cp src/logo-bend.png public/logo-small.png
    echo "✅ Logo file copied successfully"
else
    echo "❌ logo-bend.png not found in src directory"
    exit 1
fi

# Try to build the project
echo "Building the project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "You can now proceed with nginx deployment"
else
    echo "❌ Build failed. Please check the error messages above."
    exit 1
fi
