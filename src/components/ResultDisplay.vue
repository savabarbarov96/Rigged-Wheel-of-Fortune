<template>
  <transition name="result-fade">
    <div v-if="show" class="result-overlay" @click="closeResult">
      <div class="result-modal" @click.stop>
        <div class="result-content">
          <!-- Celebration animation -->
          <div class="celebration">
            <div class="confetti" v-for="n in 20" :key="n"></div>
          </div>
          
          <!-- Result display -->
          <div class="result-icon">
            <span v-if="isWinning">🎉</span>
            <span v-else>😔</span>
          </div>
          
          <h2 class="result-title">
            {{ isWinning ? 'Congratulations!' : 'Better Luck Next Time!' }}
          </h2>
          
          <div class="result-sector" :style="{ backgroundColor: result.color }">
            {{ result.label }}
          </div>
          
          <p class="result-message">
            {{ getResultMessage() }}
          </p>
          
          <div class="result-actions">
            <button class="btn btn-primary" @click="playAgain">
              Play Again
            </button>
            <button class="btn btn-secondary" @click="closeResult">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { ref, computed, onMounted, nextTick } from 'vue'
import confetti from 'canvas-confetti'

export default {
  name: 'ResultDisplay',
  props: {
    result: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'play-again'],
  setup(props, { emit }) {
    const show = ref(false)
    
    const isWinning = computed(() => {
      const label = props.result.label.toLowerCase()
      return label.includes('win') && label.includes('$')
    })

    const getPrizeValue = computed(() => {
      const label = props.result.label
      const match = label.match(/\$(\d+)/)
      return match ? parseInt(match[1]) : 0
    })
    
    const getResultMessage = () => {
      if (isWinning.value) {
        return "You landed on a winning sector! 🎊"
      } else {
        return "Don't give up - try spinning again! 🍀"
      }
    }
    
    const closeResult = () => {
      show.value = false
      setTimeout(() => {
        emit('close')
      }, 300) // Wait for transition to complete
    }
    
    const playAgain = () => {
      closeResult()
      emit('play-again')
    }

    const triggerConfetti = () => {
      if (!isWinning.value) return

      const prizeValue = getPrizeValue.value
      let confettiConfig = {
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      }

      // Different confetti intensity based on prize value
      if (prizeValue >= 100) {
        // Intense gold confetti burst for $100+
        confettiConfig = {
          particleCount: 200,
          spread: 120,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FFA500', '#FF8C00', '#DAA520']
        }
        
        // Multiple bursts for big wins
        setTimeout(() => confetti(confettiConfig), 0)
        setTimeout(() => confetti(confettiConfig), 300)
        setTimeout(() => confetti(confettiConfig), 600)
      } else if (prizeValue >= 50) {
        // Moderate colorful confetti for $50
        confettiConfig = {
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57']
        }
        
        setTimeout(() => confetti(confettiConfig), 0)
        setTimeout(() => confetti(confettiConfig), 400)
      } else if (prizeValue > 0) {
        // Light confetti shower for smaller prizes
        confettiConfig = {
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#96ceb4', '#feca57', '#ff9ff3']
        }
        
        setTimeout(() => confetti(confettiConfig), 0)
      }
    }
    
    // Auto-show when component mounts and trigger confetti
    onMounted(() => {
      nextTick(() => {
        show.value = true
        // Trigger confetti after modal animation
        setTimeout(triggerConfetti, 500)
      })
    })
    
    return {
      show,
      isWinning,
      getPrizeValue,
      getResultMessage,
      closeResult,
      playAgain,
      triggerConfetti
    }
  }
}
</script>

<style scoped>
.result-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  cursor: pointer;
}

.result-modal {
  background: white;
  border-radius: 20px;
  padding: 30px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  position: relative;
  cursor: default;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalBounce 0.5s ease-out;
}

.result-content {
  position: relative;
}

.celebration {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #feca57);
  animation: confettiFall 3s ease-out infinite;
  opacity: 0.8;
}

.confetti:nth-child(odd) {
  animation-delay: calc(var(--delay, 0) * 0.1s);
  background: linear-gradient(45deg, #ff9ff3, #54a0ff, #5f27cd, #00d2d3);
}

.confetti:nth-child(even) {
  animation-delay: calc(var(--delay, 0) * 0.15s);
}

.result-icon {
  font-size: 4rem;
  margin: 20px 0;
}

.result-title {
  color: #333;
  margin: 20px 0;
  font-size: 2rem;
  font-weight: bold;
}

.result-sector {
  display: inline-block;
  padding: 15px 25px;
  border-radius: 50px;
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
  margin: 20px 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.result-message {
  color: #666;
  font-size: 1.1rem;
  margin: 20px 0;
}

.result-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
}

.btn {
  padding: 12px 25px;
  border: none;
  border-radius: 25px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.btn-primary {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #f8f9fa;
  color: #333;
  border: 2px solid #e9ecef;
}

.btn-secondary:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

/* Animations */
.result-fade-enter-active,
.result-fade-leave-active {
  transition: all 0.3s ease;
}

.result-fade-enter-from,
.result-fade-leave-to {
  opacity: 0;
}

.result-fade-enter-from .result-modal,
.result-fade-leave-to .result-modal {
  transform: scale(0.8) translateY(20px);
}

@keyframes modalBounce {
  0% { transform: scale(0.3) translateY(100px); opacity: 0; }
  50% { transform: scale(1.05) translateY(-10px); }
  70% { transform: scale(0.95) translateY(5px); }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}

@keyframes confettiFall {
  0% {
    transform: translateY(-100vh) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

/* Generate random delays and positions for confetti */
.confetti:nth-child(1) { left: 10%; --delay: 1; }
.confetti:nth-child(2) { left: 20%; --delay: 2; }
.confetti:nth-child(3) { left: 30%; --delay: 3; }
.confetti:nth-child(4) { left: 40%; --delay: 4; }
.confetti:nth-child(5) { left: 50%; --delay: 5; }
.confetti:nth-child(6) { left: 60%; --delay: 6; }
.confetti:nth-child(7) { left: 70%; --delay: 7; }
.confetti:nth-child(8) { left: 80%; --delay: 8; }
.confetti:nth-child(9) { left: 90%; --delay: 9; }
.confetti:nth-child(10) { left: 15%; --delay: 10; }
.confetti:nth-child(11) { left: 25%; --delay: 11; }
.confetti:nth-child(12) { left: 35%; --delay: 12; }
.confetti:nth-child(13) { left: 45%; --delay: 13; }
.confetti:nth-child(14) { left: 55%; --delay: 14; }
.confetti:nth-child(15) { left: 65%; --delay: 15; }
.confetti:nth-child(16) { left: 75%; --delay: 16; }
.confetti:nth-child(17) { left: 85%; --delay: 17; }
.confetti:nth-child(18) { left: 95%; --delay: 18; }
.confetti:nth-child(19) { left: 5%; --delay: 19; }
.confetti:nth-child(20) { left: 95%; --delay: 20; }

@media (max-width: 480px) {
  .result-modal {
    padding: 20px;
    margin: 10px;
  }
  
  .result-title {
    font-size: 1.5rem;
  }
  
  .result-sector {
    font-size: 1rem;
    padding: 12px 20px;
  }
  
  .result-actions {
    flex-direction: column;
    gap: 10px;
  }
}
</style>