<template>
  <div class="app">
    <h1 class="title">
      <img src="/logo-small.png" alt="Logo" class="logo" />
      Колело на късмета
    </h1>
    
    <!-- Session Timer -->
    <div v-if="isSessionValid" class="session-timer">
      <span class="timer-icon">⏱️</span>
      <span class="timer-text">Сесия: {{ Math.floor(remainingTime / 60) }}:{{ String(remainingTime % 60).padStart(2, '0') }}</span>
    </div>
    
    <WheelComponent 
      :sectors="wheelConfig.sectors"
      :isSpinning="isSpinning"
      @spin-complete="onSpinComplete"
      ref="wheelRef"
    />
    
    <div class="controls">
      <button 
        class="btn spin-btn" 
        @click="spin"
        :disabled="isSpinning || !isSessionValid"
      >
        {{ isSpinning ? 'ВЪРТИ СЕ...' : !isSessionValid ? 'ВЪВЕДИ ПИН' : 'ЗАВЪРТИ КОЛЕЛОТО' }}
      </button>
    </div>

    <ResultDisplay 
      v-if="lastResult" 
      :result="lastResult"
      @close="closeResult"
      @play-again="resetGame"
    />

    <AdminPanel 
      v-show="showAdmin"
      :config="wheelConfig"
      @update-config="updateWheelConfig"
      @export-config="exportConfig"
      @import-config="importConfig"
      @reset-defaults="resetToDefaults"
    />

    <!-- Admin PIN Modal -->
    <PinModal 
      :show="showPinModal"
      @close="closePinModal"
      @success="onPinSuccess"
    />

    <!-- Main Access PIN Modal -->
    <PinModal 
      :show="showMainPinModal"
      @close="closeMainPinModal"
      @success="onMainPinSuccess"
    />

    <button 
      class="admin-toggle" 
      @click="toggleAdmin"
      title="Показване/скриване на админ панела"
    >
      ⚙️
    </button>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import WheelComponent from './components/WheelComponent.vue'
import AdminPanel from './components/AdminPanel.vue'
import ResultDisplay from './components/ResultDisplay.vue'
import PinModal from './components/PinModal.vue'
import { useRigging } from './composables/useRigging.js'
import { useSession } from './composables/useSession.js'

export default {
  name: 'App',
  components: {
    WheelComponent,
    AdminPanel,
    ResultDisplay,
    PinModal
  },
  setup() {
    const wheelRef = ref(null)
    const isSpinning = ref(false)
    const showAdmin = ref(false)
    const showPinModal = ref(false)
    const showMainPinModal = ref(false)
    const isAdminAuthenticated = ref(false)
    const lastResult = ref(null)

    // Session management
    const { 
      isSessionValid, 
      createSession, 
      initSession, 
      startSessionMonitor, 
      stopSessionMonitor,
      remainingTime 
    } = useSession()

    // Default wheel configuration (fallback)
    const defaultWheelConfig = {
      sectors: [
        { id: 1, label: 'СПЕЧЕЛИ $100', color: '#00C851', weight: 5, isWinner: true },
        { id: 2, label: 'СПЕЧЕЛИ $50', color: '#e74c3c', weight: 10, isWinner: true },
        { id: 3, label: 'СПЕЧЕЛИ $25', color: '#1a1a1a', weight: 15, isWinner: true },
        { id: 4, label: 'ОПИТАЙ ОТНОВО', color: '#e74c3c', weight: 25, isWinner: false },
        { id: 5, label: 'СПЕЧЕЛИ $10', color: '#1a1a1a', weight: 20, isWinner: true },
        { id: 6, label: 'БЕЗ ПЕЧАЛБА', color: '#e74c3c', weight: 15, isWinner: false },
        { id: 7, label: 'СПЕЧЕЛИ $5', color: '#1a1a1a', weight: 10, isWinner: true }
      ]
    }

    const WHEEL_CONFIG_KEY = 'wheel_config'

    // Save configuration to localStorage
    const saveWheelConfig = (config) => {
      try {
        localStorage.setItem(WHEEL_CONFIG_KEY, JSON.stringify(config))
      } catch (error) {
        console.error('Failed to save wheel config:', error)
      }
    }

    // Load configuration from localStorage first, then config.json, then defaults
    const loadWheelConfig = async () => {
      // First, try to load from localStorage (user's saved config)
      try {
        const stored = localStorage.getItem(WHEEL_CONFIG_KEY)
        if (stored) {
          const config = JSON.parse(stored)
          console.log('Loaded wheel config from localStorage')
          return config
        }
      } catch (error) {
        console.warn('Failed to load wheel config from localStorage:', error)
      }

      // Second, try to load from config.json (default config)
      try {
        const response = await fetch('/config.json')
        if (response.ok) {
          const config = await response.json()
          console.log('Loaded wheel config from config.json')
          // Save to localStorage for future use
          saveWheelConfig(config)
          return config
        }
      } catch (error) {
        console.warn('Failed to load wheel config from config.json:', error)
      }

      // Finally, fall back to hardcoded defaults
      console.log('Using default wheel config')
      saveWheelConfig(defaultWheelConfig)
      return defaultWheelConfig
    }

    // Export current configuration as downloadable JSON file
    const exportConfig = () => {
      try {
        const configData = JSON.stringify(wheelConfig, null, 2)
        const blob = new Blob([configData], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'wheel-config.json'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } catch (error) {
        console.error('Failed to export config:', error)
      }
    }

    // Import configuration from uploaded JSON file
    const importConfig = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const config = JSON.parse(e.target.result)
            Object.assign(wheelConfig, config)
            // Save imported config to localStorage
            saveWheelConfig(wheelConfig)
            resolve(config)
          } catch (error) {
            reject(error)
          }
        }
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsText(file)
      })
    }

    // Initialize wheel configuration (will be loaded asynchronously)
    const wheelConfig = reactive(defaultWheelConfig)

    // Load configuration on component mount
    const initializeConfig = async () => {
      const config = await loadWheelConfig()
      Object.assign(wheelConfig, config)
    }

    const { selectWinner } = useRigging()

    const spin = async () => {
      // Check session validity before spinning
      if (!isSessionValid.value) {
        showMainPinModal.value = true
        return
      }

      if (isSpinning.value) return

      isSpinning.value = true
      
      // Select winner based on weighted probabilities
      const winner = selectWinner(wheelConfig.sectors)
      
      // Trigger wheel spin animation with predetermined winner
      await wheelRef.value.spinToWinner(winner)
      
      // Show result
      lastResult.value = winner
      isSpinning.value = false
    }

    const onSpinComplete = (result) => {
      console.log('Spin completed:', result)
    }

    const closeResult = () => {
      lastResult.value = null
    }

    const resetGame = () => {
      lastResult.value = null
      // Game is ready for next spin
    }

    const updateWheelConfig = (newConfig) => {
      wheelConfig.sectors = newConfig.sectors
      // Save to localStorage to persist across sessions
      saveWheelConfig(wheelConfig)
    }

    // Reset to default configuration
    const resetToDefaults = () => {
      Object.assign(wheelConfig, defaultWheelConfig)
      // Save reset config to localStorage
      saveWheelConfig(wheelConfig)
    }

    // PIN Authentication - always require PIN entry
    const toggleAdmin = () => {
      // Always show PIN modal when settings button is clicked
      showPinModal.value = true
      // Hide admin panel when toggling
      if (showAdmin.value) {
        showAdmin.value = false
      }
    }

    const onPinSuccess = () => {
      isAdminAuthenticated.value = true
      showAdmin.value = true
    }

    const closePinModal = () => {
      showPinModal.value = false
    }

    // Main PIN modal handlers for session access
    const onMainPinSuccess = () => {
      createSession()
      showMainPinModal.value = false
    }

    const closeMainPinModal = () => {
      showMainPinModal.value = false
      // If session is still invalid, show modal again after a delay
      setTimeout(() => {
        if (!isSessionValid.value) {
          showMainPinModal.value = true
        }
      }, 500)
    }

    // Handle session expiration
    const onSessionExpire = () => {
      showMainPinModal.value = true
    }

    // Initialize configuration and session on component mount
    onMounted(() => {
      initializeConfig()
      
      // Initialize session
      const existingSession = initSession()
      if (!existingSession || !isSessionValid.value) {
        // No valid session, show PIN modal
        showMainPinModal.value = true
      }
      
      // Start monitoring session expiration
      startSessionMonitor(onSessionExpire)
    })

    // Clean up on unmount
    onUnmounted(() => {
      stopSessionMonitor()
    })

    return {
      wheelRef,
      isSpinning,
      showAdmin,
      showPinModal,
      showMainPinModal,
      isAdminAuthenticated,
      lastResult,
      wheelConfig,
      isSessionValid,
      remainingTime,
      spin,
      onSpinComplete,
      closeResult,
      resetGame,
      updateWheelConfig,
      resetToDefaults,
      exportConfig,
      importConfig,
      toggleAdmin,
      onPinSuccess,
      closePinModal,
      onMainPinSuccess,
      closeMainPinModal
    }
  }
}
</script>

<style scoped>
.app {
  text-align: center;
  max-width: 800px;
  width: 100%;
}

.title {
  color: white;
  font-size: 3rem;
  margin-bottom: 2rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  font-weight: 700;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
}

.logo {
  height: 150px;
  width: auto;
  filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));
}

.controls {
  margin: 2rem 0;
}

.spin-btn {
  font-size: 1.4rem;
  padding: 20px 40px;
  min-width: 200px;
}

.admin-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 1.5rem;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.admin-toggle:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.session-timer {
  position: fixed;
  top: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 10px 20px;
  border-radius: 25px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.session-timer:hover {
  background: rgba(255, 255, 255, 0.3);
}

.timer-icon {
  font-size: 1.2rem;
}

.timer-text {
  font-family: 'Courier New', monospace;
}

@media (max-width: 768px) {
  .title {
    font-size: 2rem;
    margin-bottom: 1rem;
    gap: 0.6rem;
  }

  .logo {
    height: 120px;
  }

  .spin-btn {
    font-size: 1.1rem;
    padding: 15px 30px;
    min-width: 180px;
  }

  .session-timer {
    top: 10px;
    left: 10px;
    padding: 8px 15px;
    font-size: 0.8rem;
  }

  .timer-icon {
    font-size: 1rem;
  }
}
</style>
