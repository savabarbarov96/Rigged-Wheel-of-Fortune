<template>
  <div class="app">
    <h1 class="title">🎯 Wheel of Fortune</h1>
    
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
        :disabled="isSpinning"
      >
        {{ isSpinning ? 'SPINNING...' : 'SPIN THE WHEEL' }}
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
    />

    <PinModal 
      :show="showPinModal"
      @close="closePinModal"
      @success="onPinSuccess"
    />

    <button 
      class="admin-toggle" 
      @click="toggleAdmin"
      title="Toggle Admin Panel"
    >
      ⚙️
    </button>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import WheelComponent from './components/WheelComponent.vue'
import AdminPanel from './components/AdminPanel.vue'
import ResultDisplay from './components/ResultDisplay.vue'
import PinModal from './components/PinModal.vue'
import { useRigging } from './composables/useRigging.js'

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
    const isAdminAuthenticated = ref(false)
    const lastResult = ref(null)

    // Default wheel configuration
    const wheelConfig = reactive({
      sectors: [
        { id: 1, label: 'WIN $100', color: '#ff6b6b', weight: 5 },
        { id: 2, label: 'WIN $50', color: '#4ecdc4', weight: 10 },
        { id: 3, label: 'WIN $25', color: '#45b7d1', weight: 15 },
        { id: 4, label: 'TRY AGAIN', color: '#96ceb4', weight: 25 },
        { id: 5, label: 'WIN $10', color: '#feca57', weight: 20 },
        { id: 6, label: 'NO WIN', color: '#ff9ff3', weight: 15 },
        { id: 7, label: 'WIN $5', color: '#f0932b', weight: 10 }
      ]
    })

    const { selectWinner } = useRigging()

    const spin = async () => {
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
    }

    // PIN Authentication
    const checkAuthentication = () => {
      isAdminAuthenticated.value = sessionStorage.getItem('adminAuthenticated') === 'true'
    }

    const toggleAdmin = () => {
      if (!isAdminAuthenticated.value) {
        showPinModal.value = true
      } else {
        showAdmin.value = !showAdmin.value
      }
    }

    const onPinSuccess = () => {
      isAdminAuthenticated.value = true
      showAdmin.value = true
    }

    const closePinModal = () => {
      showPinModal.value = false
    }

    // Check authentication on component mount
    checkAuthentication()

    return {
      wheelRef,
      isSpinning,
      showAdmin,
      showPinModal,
      isAdminAuthenticated,
      lastResult,
      wheelConfig,
      spin,
      onSpinComplete,
      closeResult,
      resetGame,
      updateWheelConfig,
      toggleAdmin,
      onPinSuccess,
      closePinModal
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

@media (max-width: 768px) {
  .title {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  
  .spin-btn {
    font-size: 1.1rem;
    padding: 15px 30px;
    min-width: 180px;
  }
}
</style>