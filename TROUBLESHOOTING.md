# 🛠️ Troubleshooting Guide

## Common Issues and Solutions

### 1. **API Returns HTML Instead of JSON**
**Error**: `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`

**Cause**: API routes not matching, server serving index.html instead

**Solution**:
```bash
# Check if server is running
npm run pm2:status

# Check logs for routing issues  
npm run pm2:logs

# Restart the application
npm run pm2:restart

# Test API directly
curl http://localhost:3001/api/config
```

### 2. **Server Not Starting**
**Error**: Port already in use or server crashes

**Solution**:
```bash
# Kill any existing processes on port 3001
sudo lsof -ti:3001 | xargs kill -9

# Check PM2 status
npm run pm2:status

# Delete and restart PM2 process
npm run pm2:delete
npm run pm2:start
```

### 3. **Database Permission Issues**
**Error**: Cannot create/write to database

**Solution**:
```bash
# Fix database permissions
chmod 755 server/
chmod 644 server/wheel_config.db

# If database is corrupted, reset it
rm server/wheel_config.db
npm run pm2:restart
```

### 4. **PM2 Not Found**
**Error**: `pm2: command not found`

**Solution**:
```bash
# Install PM2 globally
npm install -g pm2

# Or use npx
npx pm2 start ecosystem.config.js
```

### 5. **Frontend Can't Connect to Backend**
**Error**: Network errors, 404s

**Solution**:
```bash
# Check if both services are running
npm run pm2:status
netstat -tlnp | grep :3001

# Check API health
curl http://localhost:3001/health

# Review server logs
npm run pm2:logs
```

### 6. **Auto-Save Not Working**
**Issue**: Changes don't persist across devices

**Debug Steps**:
1. Open browser console (F12)
2. Make a change in admin panel
3. Check for any error messages
4. Verify API call in Network tab
5. Test on another device/browser

### 7. **PM2 Process Keeps Crashing**
**Solution**:
```bash
# Check error logs
npm run pm2:logs

# Check system resources
free -h
df -h

# Restart with verbose logging
pm2 restart wheel-app --update-env
```

## 🔍 Debugging Commands

### Check Application Status
```bash
# PM2 process status
npm run pm2:status

# View real-time logs
npm run pm2:logs

# System resource usage
pm2 monit
```

### Test API Endpoints
```bash
# Test config loading
curl http://localhost:3001/api/config

# Test health endpoint
curl http://localhost:3001/health

# Test config saving
curl -X PUT http://localhost:3001/api/config \
  -H "Content-Type: application/json" \
  -d '{"sectors":[{"id":1,"label":"TEST","color":"#ff0000","weight":10,"isWinner":true}]}'
```

### Database Operations
```bash
# View database content
sqlite3 server/wheel_config.db "SELECT * FROM wheel_config ORDER BY updated_at DESC LIMIT 3;"

# Check database integrity
sqlite3 server/wheel_config.db "PRAGMA integrity_check;"

# Backup database
cp server/wheel_config.db "server/wheel_config_backup_$(date +%Y%m%d_%H%M%S).db"
```

## 📱 Network Issues

### Port Configuration
- **Frontend (dev)**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Production**: Same domain, port 3001

### Firewall Rules
```bash
# Ubuntu/Debian
sudo ufw allow 3001

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --reload
```

## 🚀 Performance Issues

### Memory Usage
```bash
# Check memory usage
free -h
pm2 monit

# Restart if memory usage is high
npm run pm2:restart
```

### Database Size
```bash
# Check database size
ls -lh server/wheel_config.db

# If too large, clean old entries
sqlite3 server/wheel_config.db "DELETE FROM wheel_config WHERE created_at < datetime('now', '-30 days');"
```

## 📞 Getting Help

1. **Check logs**: `npm run pm2:logs`
2. **Test API**: `curl http://localhost:3001/health`  
3. **Verify database**: Check file permissions and content
4. **Browser console**: Look for JavaScript errors
5. **System resources**: Ensure adequate memory/disk space

## 🔄 Reset Everything

If all else fails:
```bash
# Stop PM2
npm run pm2:delete

# Reset database
rm server/wheel_config.db

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild and restart
npm run deploy
```
