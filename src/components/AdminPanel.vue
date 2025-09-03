<template>
  <div class="admin-panel">
    <div class="admin-header">
      <h3>🎛️ Административен панел</h3>
      <p class="admin-subtitle">Контрол на вероятностите и настройките на колелото</p>
    </div>
    
    <div class="admin-content">
      <!-- Sector Configuration -->
      <div class="section">
        <h4>Конфигурация на секторите</h4>
        <div class="sectors-list">
          <div 
            v-for="(sector, index) in localConfig.sectors" 
            :key="sector.id"
            class="sector-item"
          >
            <div class="sector-preview" :style="{ backgroundColor: sector.color }"></div>
            
            <div class="sector-controls">
              <div class="input-group">
                <label>Етикет:</label>
                <input 
                  type="text" 
                  v-model="sector.label"
                  @input="updateConfig"
                  placeholder="Етикет на сектора"
                />
              </div>
              
              <div class="input-group">
                <label>Тежест:</label>
                <input 
                  type="number" 
                  v-model.number="sector.weight"
                  @input="updateConfig"
                  min="0"
                  max="100"
                />
                <span class="probability">{{ getProbability(sector.weight) }}%</span>
              </div>
              
              <div class="input-group">
                <label>Цвят:</label>
                <input 
                  type="color" 
                  v-model="sector.color"
                  @input="updateConfig"
                />
              </div>

              <div class="input-group">
                <label>Печеливш?</label>
                <input type="checkbox" v-model="sector.isWinner" @change="updateConfig" />
              </div>
              
              <button 
                class="btn-remove"
                @click="removeSector(index)"
                :disabled="localConfig.sectors.length <= 2"
                title="Премахни сектор"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
        
        <button class="btn btn-add" @click="addSector">
          ➕ Добави сектор
        </button>
      </div>
      
      <!-- Probability Overview -->
      <div class="section">
        <h4>Преглед на вероятностите</h4>
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
        <h4>Статистика на завъртанията</h4>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Общо завъртания:</span>
            <span class="stat-value">{{ statistics.totalSpins }}</span>
          </div>
        </div>
        
        <div class="win-distribution" v-if="statistics.winDistribution">
          <h5>Разпределение на печалбите:</h5>
          <div 
            v-for="(count, label) in statistics.winDistribution" 
            :key="label"
            class="distribution-item"
          >
            <span>{{ label }}:</span>
            <span>{{ count }} пъти ({{ ((count / statistics.totalSpins) * 100).toFixed(1) }}%)</span>
          </div>
        </div>
        
        <button class="btn btn-secondary" @click="resetStats">
          Нулирай статистиката
        </button>
      </div>
      
      <!-- Presets -->
      <div class="section">
        <h4>Шаблони</h4>
        <div class="preset-buttons">
          <button class="btn btn-preset" @click="loadPreset('fair')">
            Равно (равни шансове)
          </button>
          <button class="btn btn-preset" @click="loadPreset('rigged-low')">
            Манипулирано (нисък шанс за печалба)
          </button>
          <button class="btn btn-preset" @click="loadPreset('rigged-high')">
            Манипулирано (висок шанс за печалба)
          </button>
        </div>
      </div>

      <!-- Configuration Management -->
      <div class="section">
        <h4>Управление на конфигурацията</h4>
        <div class="auto-save-status">
          <div class="status-indicator">
            <span class="status-dot"></span>
            <span>Автоматично запазване: Активно</span>
          </div>
          <p class="status-description">
            Промените се запазват автоматично в базата данни и са достъпни на всички устройства веднага.
          </p>
        </div>
        
        <div class="config-buttons">
          <button class="btn btn-primary" @click="exportConfiguration">
            📥 Изтегли конфигурацията
          </button>
          <div class="import-section">
            <input 
              type="file" 
              ref="fileInput"
              accept=".json"
              @change="handleFileImport"
              style="display: none"
            />
            <button class="btn btn-secondary" @click="$refs.fileInput.click()">
              📤 Качи конфигурация
            </button>
          </div>
          <button class="btn btn-warning" @click="resetToDefaults">
            🔄 Възстанови по подразбиране
          </button>
        </div>
        
        <div class="config-note">
          <p><strong>✨ Нова функционалност:</strong></p>
          <ul>
            <li>📊 Всички настройки се запазват автоматично в база данни</li>
            <li>🌐 Промените са достъпни на всички устройства веднага</li>
            <li>💾 Няма нужда от ръчно запазване или качване на файлове</li>
            <li>📱 Работи на всички браузъри и устройства синхронно</li>
          </ul>
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
  emits: ['update-config', 'export-config', 'import-config', 'reset-defaults'],
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
        label: `Сектор ${newId}`,
        color: randomColor,
        weight: 10,
        isWinner: true
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
            { id: 1, label: 'СПЕЧЕЛИ $100', color: '#ff6b6b', weight: 20, isWinner: true },
            { id: 2, label: 'СПЕЧЕЛИ $50', color: '#4ecdc4', weight: 20, isWinner: true },
            { id: 3, label: 'СПЕЧЕЛИ $25', color: '#45b7d1', weight: 20, isWinner: true },
            { id: 4, label: 'СПЕЧЕЛИ $10', color: '#96ceb4', weight: 20, isWinner: true },
            { id: 5, label: 'ОПИТАЙ ОТНОВО', color: '#feca57', weight: 20, isWinner: false }
          ]
          break
          
        case 'rigged-low':
          presetSectors = [
            { id: 1, label: 'СПЕЧЕЛИ $100', color: '#ff6b6b', weight: 2, isWinner: true },
            { id: 2, label: 'СПЕЧЕЛИ $50', color: '#4ecdc4', weight: 5, isWinner: true },
            { id: 3, label: 'СПЕЧЕЛИ $25', color: '#45b7d1', weight: 8, isWinner: true },
            { id: 4, label: 'СПЕЧЕЛИ $10', color: '#96ceb4', weight: 10, isWinner: true },
            { id: 5, label: 'ОПИТАЙ ОТНОВО', color: '#feca57', weight: 25, isWinner: false },
            { id: 6, label: 'БЕЗ ПЕЧАЛБА', color: '#ff9ff3', weight: 50, isWinner: false }
          ]
          break
          
        case 'rigged-high':
          presetSectors = [
            { id: 1, label: 'СПЕЧЕЛИ $100', color: '#ff6b6b', weight: 15, isWinner: true },
            { id: 2, label: 'СПЕЧЕЛИ $50', color: '#4ecdc4', weight: 25, isWinner: true },
            { id: 3, label: 'СПЕЧЕЛИ $25', color: '#45b7d1', weight: 30, isWinner: true },
            { id: 4, label: 'СПЕЧЕЛИ $10', color: '#96ceb4', weight: 20, isWinner: true },
            { id: 5, label: 'ОПИТАЙ ОТНОВО', color: '#feca57', weight: 10, isWinner: false }
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

    // Configuration management functions
    const exportConfiguration = () => {
      emit('export-config')
    }

    const handleFileImport = async (event) => {
      const file = event.target.files[0]
      if (!file) return

      try {
        await emit('import-config', file)
        // Reset the file input
        event.target.value = ''
        alert('Конфигурацията е успешно заредена!')
      } catch (error) {
        console.error('Failed to import config:', error)
        alert('Грешка при зареждане на конфигурацията. Моля проверете файла.')
      }
    }

    const resetToDefaults = () => {
      if (confirm('Сигурни ли сте, че искате да възстановите настройките по подразбиране?')) {
        emit('reset-defaults')
      }
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
      resetStats,
      exportConfiguration,
      handleFileImport,
      resetToDefaults
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

.config-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.import-section {
  display: flex;
  flex-direction: column;
}

.config-note {
  margin-top: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.config-note p {
  margin: 0 0 10px 0;
  font-size: 0.9rem;
}

.config-note ol {
  margin: 0;
  padding-left: 20px;
  font-size: 0.85rem;
}

.config-note code {
  background: #e9ecef;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}

.auto-save-status {
  margin-bottom: 15px;
  padding: 12px;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 8px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #155724;
  margin-bottom: 5px;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #28a745;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.status-description {
  margin: 0;
  font-size: 0.85rem;
  color: #155724;
  opacity: 0.9;
}

.config-note ul {
  margin: 5px 0 0 0;
  padding-left: 20px;
}

.config-note li {
  font-size: 0.85rem;
  margin-bottom: 3px;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
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
