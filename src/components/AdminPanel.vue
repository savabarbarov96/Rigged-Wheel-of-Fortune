<template>
  <div class="admin-panel">
    <div class="admin-header">
      <h3>🎛️ Admin Panel</h3>
      <p class="admin-subtitle">Control wheel probabilities and settings</p>
    </div>
    
    <div class="admin-content">
      <!-- Sector Configuration -->
      <div class="section">
        <h4>Sector Configuration</h4>
        <div class="sectors-list">
          <div 
            v-for="(sector, index) in localConfig.sectors" 
            :key="sector.id"
            class="sector-item"
          >
            <div class="sector-preview" :style="{ backgroundColor: sector.color }"></div>
            
            <div class="sector-controls">
              <div class="input-group">
                <label>Label:</label>
                <input 
                  type="text" 
                  v-model="sector.label"
                  @input="updateConfig"
                  placeholder="Sector label"
                />
              </div>
              
              <div class="input-group">
                <label>Weight:</label>
                <input 
                  type="number" 
                  v-model.number="sector.weight"
                  @input="updateConfig"
                  min="1"
                  max="100"
                />
                <span class="probability">{{ getProbability(sector.weight) }}%</span>
              </div>
              
              <div class="input-group">
                <label>Color:</label>
                <input 
                  type="color" 
                  v-model="sector.color"
                  @input="updateConfig"
                />
              </div>
              
              <button 
                class="btn-remove"
                @click="removeSector(index)"
                :disabled="localConfig.sectors.length <= 2"
                title="Remove sector"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
        
        <button class="btn btn-add" @click="addSector">
          ➕ Add Sector
        </button>
      </div>
      
      <!-- Probability Overview -->
      <div class="section">
        <h4>Probability Overview</h4>
        <div class="probability-chart">
          <div 
            v-for="sector in sectorsWithProbability" 
            :key="sector.id"
            class="probability-bar"
          >
            <div class="probability-label">{{ sector.label }}</div>
            <div class="probability-visual">
              <div 
                class="probability-fill"
                :style="{ 
                  width: sector.probability + '%',
                  backgroundColor: sector.color
                }"
              ></div>
              <span class="probability-text">{{ sector.probability.toFixed(1) }}%</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Statistics -->
      <div class="section" v-if="statistics.totalSpins > 0">
        <h4>Spin Statistics</h4>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Total Spins:</span>
            <span class="stat-value">{{ statistics.totalSpins }}</span>
          </div>
        </div>
        
        <div class="win-distribution" v-if="statistics.winDistribution">
          <h5>Win Distribution:</h5>
          <div 
            v-for="(count, label) in statistics.winDistribution" 
            :key="label"
            class="distribution-item"
          >
            <span>{{ label }}:</span>
            <span>{{ count }} times ({{ ((count / statistics.totalSpins) * 100).toFixed(1) }}%)</span>
          </div>
        </div>
        
        <button class="btn btn-secondary" @click="resetStats">
          Reset Statistics
        </button>
      </div>
      
      <!-- Presets -->
      <div class="section">
        <h4>Presets</h4>
        <div class="preset-buttons">
          <button class="btn btn-preset" @click="loadPreset('fair')">
            Fair (Equal chances)
          </button>
          <button class="btn btn-preset" @click="loadPreset('rigged-low')">
            Rigged (Low win rate)
          </button>
          <button class="btn btn-preset" @click="loadPreset('rigged-high')">
            Rigged (High win rate)
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { useRigging } from '../composables/useRigging.js'

export default {
  name: 'AdminPanel',
  props: {
    config: {
      type: Object,
      required: true
    }
  },
  emits: ['update-config'],
  setup(props, { emit }) {
    const { calculateProbabilities, getStatistics, resetStatistics } = useRigging()
    
    const localConfig = ref(JSON.parse(JSON.stringify(props.config)))
    const statistics = ref({ totalSpins: 0, winDistribution: {} })
    
    // Calculate probabilities for each sector
    const sectorsWithProbability = computed(() => {
      const totalWeight = localConfig.value.sectors.reduce((sum, sector) => sum + sector.weight, 0)
      return localConfig.value.sectors.map(sector => ({
        ...sector,
        probability: (sector.weight / totalWeight) * 100
      }))
    })
    
    const getProbability = (weight) => {
      const totalWeight = localConfig.value.sectors.reduce((sum, sector) => sum + sector.weight, 0)
      return ((weight / totalWeight) * 100).toFixed(1)
    }
    
    const updateConfig = () => {
      emit('update-config', JSON.parse(JSON.stringify(localConfig.value)))
    }
    
    const addSector = () => {
      const newId = Math.max(...localConfig.value.sectors.map(s => s.id)) + 1
      const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#f0932b', '#eb4d4b', '#6c5ce7', '#a29bfe']
      const randomColor = colors[Math.floor(Math.random() * colors.length)]
      
      localConfig.value.sectors.push({
        id: newId,
        label: `Sector ${newId}`,
        color: randomColor,
        weight: 10
      })
      
      updateConfig()
    }
    
    const removeSector = (index) => {
      if (localConfig.value.sectors.length > 2) {
        localConfig.value.sectors.splice(index, 1)
        updateConfig()
      }
    }
    
    const loadPreset = (presetName) => {
      let presetSectors = []
      
      switch (presetName) {
        case 'fair':
          presetSectors = [
            { id: 1, label: 'WIN $100', color: '#ff6b6b', weight: 20 },
            { id: 2, label: 'WIN $50', color: '#4ecdc4', weight: 20 },
            { id: 3, label: 'WIN $25', color: '#45b7d1', weight: 20 },
            { id: 4, label: 'WIN $10', color: '#96ceb4', weight: 20 },
            { id: 5, label: 'TRY AGAIN', color: '#feca57', weight: 20 }
          ]
          break
          
        case 'rigged-low':
          presetSectors = [
            { id: 1, label: 'WIN $100', color: '#ff6b6b', weight: 2 },
            { id: 2, label: 'WIN $50', color: '#4ecdc4', weight: 5 },
            { id: 3, label: 'WIN $25', color: '#45b7d1', weight: 8 },
            { id: 4, label: 'WIN $10', color: '#96ceb4', weight: 10 },
            { id: 5, label: 'TRY AGAIN', color: '#feca57', weight: 25 },
            { id: 6, label: 'NO WIN', color: '#ff9ff3', weight: 50 }
          ]
          break
          
        case 'rigged-high':
          presetSectors = [
            { id: 1, label: 'WIN $100', color: '#ff6b6b', weight: 15 },
            { id: 2, label: 'WIN $50', color: '#4ecdc4', weight: 25 },
            { id: 3, label: 'WIN $25', color: '#45b7d1', weight: 30 },
            { id: 4, label: 'WIN $10', color: '#96ceb4', weight: 20 },
            { id: 5, label: 'TRY AGAIN', color: '#feca57', weight: 10 }
          ]
          break
      }
      
      localConfig.value.sectors = presetSectors
      updateConfig()
    }
    
    const resetStats = () => {
      resetStatistics()
      updateStatistics()
    }
    
    const updateStatistics = () => {
      statistics.value = getStatistics()
    }
    
    // Watch for external config changes
    watch(() => props.config, (newConfig) => {
      localConfig.value = JSON.parse(JSON.stringify(newConfig))
    }, { deep: true })
    
    // Update statistics periodically
    onMounted(() => {
      updateStatistics()
      setInterval(updateStatistics, 1000)
    })
    
    return {
      localConfig,
      sectorsWithProbability,
      statistics,
      getProbability,
      updateConfig,
      addSector,
      removeSector,
      loadPreset,
      resetStats
    }
  }
}
</script>

<style scoped>
.admin-panel {
  position: fixed;
  top: 80px;
  right: 20px;
  width: 350px;
  max-height: calc(100vh - 100px);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow-y: auto;
  z-index: 100;
  animation: slideIn 0.3s ease-out;
}

.admin-header {
  text-align: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e9ecef;
}

.admin-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.4rem;
}

.admin-subtitle {
  color: #666;
  font-size: 0.9rem;
  margin: 5px 0 0;
}

.section {
  margin-bottom: 25px;
}

.section h4 {
  color: #333;
  margin-bottom: 15px;
  font-size: 1.1rem;
  border-left: 4px solid #667eea;
  padding-left: 10px;
}

.sectors-list {
  space-y: 15px;
}

.sector-item {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
  border: 2px solid #e9ecef;
}

.sector-preview {
  width: 30px;
  height: 20px;
  border-radius: 5px;
  margin-bottom: 10px;
  border: 2px solid #fff;
}

.sector-controls {
  display: grid;
  gap: 10px;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #555;
  min-width: 50px;
}

.input-group input {
  flex: 1;
  padding: 6px 10px;
  border: 2px solid #e9ecef;
  border-radius: 5px;
  font-size: 0.9rem;
}

.input-group input:focus {
  outline: none;
  border-color: #667eea;
}

.input-group input[type="color"] {
  width: 40px;
  height: 30px;
  padding: 2px;
  cursor: pointer;
}

.probability {
  font-size: 0.8rem;
  color: #667eea;
  font-weight: 600;
  min-width: 45px;
}

.btn-remove {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 5px 8px;
  cursor: pointer;
  font-size: 0.8rem;
}

.btn-remove:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 15px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-add {
  background: linear-gradient(45deg, #28a745, #20c997);
  width: 100%;
}

.btn-secondary {
  background: #6c757d;
}

.btn-preset {
  background: linear-gradient(45deg, #feca57, #ff9ff3);
  margin: 5px;
  font-size: 0.8rem;
  padding: 8px 12px;
}

.probability-chart {
  space-y: 10px;
}

.probability-bar {
  margin-bottom: 12px;
}

.probability-label {
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 5px;
  color: #333;
}

.probability-visual {
  position: relative;
  background: #e9ecef;
  height: 25px;
  border-radius: 12px;
  overflow: hidden;
}

.probability-fill {
  height: 100%;
  border-radius: 12px;
  transition: width 0.3s ease;
}

.probability-text {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.75rem;
  font-weight: 600;
  color: #333;
}

.stats-grid {
  display: grid;
  gap: 10px;
  margin-bottom: 15px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 5px;
}

.stat-label {
  font-weight: 600;
  color: #555;
}

.stat-value {
  font-weight: bold;
  color: #667eea;
}

.win-distribution h5 {
  margin: 15px 0 10px;
  color: #333;
}

.distribution-item {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  font-size: 0.85rem;
  border-bottom: 1px solid #eee;
}

.preset-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  justify-content: center;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .admin-panel {
    position: fixed;
    top: 10px;
    right: 10px;
    left: 10px;
    width: auto;
    max-height: calc(100vh - 20px);
  }
}
</style>