import express from 'express'
import sqlite3 from 'sqlite3'
import path from 'path'
import cors from 'cors'
import { fileURLToPath } from 'url'

const sqlite = sqlite3.verbose()

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`)
  next()
})

app.use(express.static(path.join(__dirname, '../dist')))

// Initialize SQLite database
const dbPath = path.join(__dirname, 'wheel_config.db')
const db = new sqlite.Database(dbPath)

// Create table if it doesn't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS wheel_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    config_data TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)

  // Insert default configuration if table is empty
  db.get("SELECT COUNT(*) as count FROM wheel_config", (err, row) => {
    if (err) {
      console.error('Error checking config table:', err)
      return
    }
    
    if (row.count === 0) {
      const defaultConfig = {
        sectors: [
          { id: 1, label: 'СПЕЧЕЛИ $100', color: '#ff6b6b', weight: 5, isWinner: true },
          { id: 2, label: 'СПЕЧЕЛИ $50', color: '#4ecdc4', weight: 10, isWinner: true },
          { id: 3, label: 'СПЕЧЕЛИ $25', color: '#45b7d1', weight: 15, isWinner: true },
          { id: 4, label: 'ОПИТАЙ ОТНОВО', color: '#96ceb4', weight: 25, isWinner: false },
          { id: 5, label: 'СПЕЧЕЛИ $10', color: '#feca57', weight: 20, isWinner: true },
          { id: 6, label: 'БЕЗ ПЕЧАЛБА', color: '#ff9ff3', weight: 15, isWinner: false },
          { id: 7, label: 'СПЕЧЕЛИ $5', color: '#f0932b', weight: 10, isWinner: true }
        ]
      }
      
      db.run(
        "INSERT INTO wheel_config (config_data) VALUES (?)",
        [JSON.stringify(defaultConfig)],
        (err) => {
          if (err) {
            console.error('Error inserting default config:', err)
          } else {
            console.log('Default configuration inserted')
          }
        }
      )
    }
  })
})

// API Routes

// Get current wheel configuration
app.get('/api/config', (req, res) => {
  db.get(
    "SELECT config_data FROM wheel_config ORDER BY updated_at DESC LIMIT 1",
    (err, row) => {
      if (err) {
        console.error('Error fetching config:', err)
        res.status(500).json({ error: 'Failed to fetch configuration' })
        return
      }
      
      if (row) {
        try {
          const config = JSON.parse(row.config_data)
          res.json(config)
        } catch (parseErr) {
          console.error('Error parsing config data:', parseErr)
          res.status(500).json({ error: 'Invalid configuration data' })
        }
      } else {
        res.status(404).json({ error: 'No configuration found' })
      }
    }
  )
})

// Save wheel configuration
app.post('/api/config', (req, res) => {
  const configData = req.body
  
  if (!configData || !configData.sectors) {
    res.status(400).json({ error: 'Invalid configuration data' })
    return
  }
  
  db.run(
    "INSERT INTO wheel_config (config_data) VALUES (?)",
    [JSON.stringify(configData)],
    function(err) {
      if (err) {
        console.error('Error saving config:', err)
        res.status(500).json({ error: 'Failed to save configuration' })
        return
      }
      
      res.json({ 
        success: true, 
        message: 'Configuration saved successfully',
        id: this.lastID 
      })
    }
  )
})

// Update wheel configuration
app.put('/api/config', (req, res) => {
  const configData = req.body
  
  if (!configData || !configData.sectors) {
    res.status(400).json({ error: 'Invalid configuration data' })
    return
  }
  
  db.run(
    "UPDATE wheel_config SET config_data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = (SELECT MAX(id) FROM wheel_config)",
    [JSON.stringify(configData)],
    function(err) {
      if (err) {
        console.error('Error updating config:', err)
        res.status(500).json({ error: 'Failed to update configuration' })
        return
      }
      
      if (this.changes === 0) {
        // No existing config, insert new one
        db.run(
          "INSERT INTO wheel_config (config_data) VALUES (?)",
          [JSON.stringify(configData)],
          function(insertErr) {
            if (insertErr) {
              console.error('Error inserting config:', insertErr)
              res.status(500).json({ error: 'Failed to save configuration' })
              return
            }
            res.json({ 
              success: true, 
              message: 'Configuration created successfully',
              id: this.lastID 
            })
          }
        )
      } else {
        res.json({ 
          success: true, 
          message: 'Configuration updated successfully'
        })
      }
    }
  )
})

// Get configuration history
app.get('/api/config/history', (req, res) => {
  db.all(
    "SELECT id, created_at, updated_at FROM wheel_config ORDER BY updated_at DESC LIMIT 10",
    (err, rows) => {
      if (err) {
        console.error('Error fetching config history:', err)
        res.status(500).json({ error: 'Failed to fetch configuration history' })
        return
      }
      
      res.json(rows)
    }
  )
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Serve the frontend for all non-API routes (must be last)
app.get('*', (req, res) => {
  // Only serve index.html for non-API routes
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'API endpoint not found' })
  } else {
    res.sendFile(path.join(__dirname, '../dist/index.html'))
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📁 Database location: ${dbPath}`)
  console.log(`🌐 Access your app at: http://localhost:${PORT}`)
})

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...')
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err)
    } else {
      console.log('📊 Database connection closed')
    }
    process.exit(0)
  })
})
