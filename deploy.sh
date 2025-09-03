#!/bin/bash

# Rigged Wheel of Fortune - VPS Deployment Script
echo "🎰 Deploying Rigged Wheel of Fortune..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the frontend
echo "🏗️  Building frontend..."
npm run build

# Create server directory if it doesn't exist
mkdir -p server

# Set permissions for the database
echo "🗄️  Setting up database permissions..."
chmod 755 server/
touch server/wheel_config.db
chmod 644 server/wheel_config.db

# Install PM2 globally if not installed (for production process management)
if ! command -v pm2 &> /dev/null; then
    echo "🔧 Installing PM2 for process management..."
    npm install -g pm2
fi

echo "✅ Deployment preparation complete!"
echo ""
echo "🚀 To start the server:"
echo "   npm run start       (for one-time run)"
echo "   pm2 start server/index.js --name wheel-app    (for production)"
echo ""
echo "📊 Database will be created at: server/wheel_config.db"
echo "🌐 Server will run on port 3001 by default"
echo ""
echo "🔧 Environment variables you can set:"
echo "   PORT=3001          (server port)"
echo ""
echo "📋 To check PM2 status: pm2 status"
echo "📋 To stop PM2 service: pm2 stop wheel-app"
echo "📋 To restart PM2 service: pm2 restart wheel-app"

