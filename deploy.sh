#!/bin/bash

# Rigged Wheel of Fortune - VPS Deployment Script
echo "🎰 Deploying Rigged Wheel of Fortune..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the frontend
echo "🏗️  Building frontend..."
npm run build

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p server
mkdir -p logs

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

# Stop existing PM2 process if running
echo "🛑 Stopping existing PM2 process..."
npm run pm2:stop 2>/dev/null || true

# Start with PM2
echo "🚀 Starting application with PM2..."
npm run pm2:start

# Save PM2 configuration for auto-restart on boot
echo "💾 Saving PM2 configuration..."
pm2 save

# Set up PM2 startup script (requires sudo, will show command to run)
echo "🔄 Setting up PM2 startup script..."
echo "To enable auto-start on boot, run this command as root:"
echo "   sudo env PATH=\$PATH:\$(which node | sed 's/\/node\$/\//'/) \$(which pm2) startup systemd -u \$(whoami) --hp \$(eval echo ~\$(whoami))"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Application is running at: http://localhost:3001"
echo "📊 Database location: server/wheel_config.db"
echo "📝 Logs location: logs/"
echo ""
echo "🔧 PM2 Management commands:"
echo "   npm run pm2:status    - Check status"
echo "   npm run pm2:logs      - View logs"
echo "   npm run pm2:restart   - Restart app"
echo "   npm run pm2:stop      - Stop app"
echo "   npm run deploy        - Build & restart"
echo ""
echo "🔄 For future updates, just run: npm run deploy"

