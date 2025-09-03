module.exports = {
  apps: [{
    name: 'wheel-app',
    script: 'server/index.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    // Auto-restart options
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    
    // Logging
    log_file: 'logs/combined.log',
    out_file: 'logs/out.log',
    error_file: 'logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    
    // Process management
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000
  }]
}
