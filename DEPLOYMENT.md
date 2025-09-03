# 🎰 Rigged Wheel of Fortune - VPS Deployment Guide

This guide covers deploying the application on an Ubuntu VPS with automatic database persistence.

## 🏗️ Architecture

- **Frontend**: Vue.js 3 with Vite (served as static files)
- **Backend**: Express.js server with REST API
- **Database**: SQLite for configuration persistence
- **Process Management**: PM2 for production deployment

## 📋 Prerequisites

- Ubuntu VPS with Node.js 16+ installed
- SSH access to your server
- Domain name (optional but recommended)

## 🚀 Quick Deployment

### 1. Install Node.js (if not installed)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Clone and Deploy
```bash
# Clone your repository
git clone <your-repo-url>
cd Rigged-Wheel-of-Fortune

# Make deployment script executable
chmod +x deploy.sh

# Run deployment script
./deploy.sh
```

### 3. Start the Application

#### For Development/Testing:
```bash
npm run start
```

#### For Production:
```bash
# Install PM2 globally (if not already installed)
npm install -g pm2

# Start the application with PM2
pm2 start server/index.js --name wheel-app

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

## 🌐 Server Configuration

### Environment Variables
Create a `.env` file in the root directory:
```bash
PORT=3001
NODE_ENV=production
```

### Nginx Reverse Proxy (Recommended)
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL/HTTPS with Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## 📊 Database Management

### Database Location
- **File**: `server/wheel_config.db`
- **Type**: SQLite
- **Auto-created**: Yes, on first run

### Backup Database
```bash
# Create backup
cp server/wheel_config.db server/wheel_config_backup_$(date +%Y%m%d_%H%M%S).db

# Restore from backup
cp server/wheel_config_backup_YYYYMMDD_HHMMSS.db server/wheel_config.db
```

### View Database Content
```bash
# Install sqlite3 if not available
sudo apt install sqlite3

# Query the database
sqlite3 server/wheel_config.db "SELECT * FROM wheel_config ORDER BY updated_at DESC LIMIT 5;"
```

## 🔧 Management Commands

### PM2 Process Management
```bash
# Check status
pm2 status

# View logs
pm2 logs wheel-app

# Restart application
pm2 restart wheel-app

# Stop application
pm2 stop wheel-app

# Remove from PM2
pm2 delete wheel-app
```

### Application Updates
```bash
# Pull latest changes
git pull

# Rebuild frontend
npm run build

# Restart application
pm2 restart wheel-app
```

## 🔄 Auto-Save Features

The new system provides:

- ✅ **Automatic saving**: All config changes save to database immediately
- ✅ **Cross-device sync**: Changes appear on all devices instantly
- ✅ **No manual uploads**: No need to replace files manually
- ✅ **Persistent storage**: Survives server restarts and deployments
- ✅ **Backup friendly**: SQLite database is easy to backup/restore

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port 3001
sudo lsof -i :3001

# Kill process if needed
sudo kill -9 <PID>
```

### Database Permission Issues
```bash
# Fix database permissions
chmod 644 server/wheel_config.db
chmod 755 server/
```

### Application Won't Start
```bash
# Check logs
pm2 logs wheel-app

# Check if dependencies are installed
npm install

# Check if build is current
npm run build
```

### Database Corruption
```bash
# Check database integrity
sqlite3 server/wheel_config.db "PRAGMA integrity_check;"

# If corrupted, restore from backup
cp server/wheel_config_backup_YYYYMMDD_HHMMSS.db server/wheel_config.db
pm2 restart wheel-app
```

## 📈 Monitoring

### System Resources
```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top
```

### Application Health
```bash
# Check if application is responding
curl http://localhost:3001/api/config

# Check PM2 status
pm2 monit
```

## 🔐 Security Considerations

1. **Firewall**: Only expose port 80/443 publicly
2. **Database**: SQLite file should not be web-accessible
3. **Admin PIN**: Change the default PIN in `src/components/PinModal.vue`
4. **Updates**: Keep Node.js and dependencies updated
5. **Backups**: Regular database backups recommended

## 📞 Support

For issues with deployment:
1. Check the logs: `pm2 logs wheel-app`
2. Verify database permissions: `ls -la server/`
3. Test API directly: `curl http://localhost:3001/api/config`
4. Check system resources: `df -h && free -h`

The application now provides automatic, persistent configuration management across all devices without manual file management!

