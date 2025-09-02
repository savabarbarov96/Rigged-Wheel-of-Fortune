<template>
  <div v-if="show" class="pin-overlay" @click="closeModal">
    <div class="pin-modal" @click.stop>
      <div class="pin-header">
        <h3>🔐 Административен достъп</h3>
        <p>Въведете ПИН за достъп до админ панела</p>
      </div>
      
      <div class="pin-input-container">
        <input 
          ref="pinInput"
          type="password" 
          v-model="enteredPin"
          @keyup.enter="validatePin"
          @input="onPinInput"
          maxlength="4"
          class="pin-input"
          placeholder="••••"
          autofocus
        />
        
        <div class="pin-dots">
          <div 
            v-for="i in 4" 
            :key="i"
            class="pin-dot"
            :class="{ filled: enteredPin.length >= i, error: showError }"
          ></div>
        </div>
      </div>
      
      <div v-if="showError" class="pin-error">
        ❌ Грешен ПИН. Опитайте отново.
      </div>
      
      <div class="pin-actions">
        <button class="btn btn-primary" @click="validatePin" :disabled="enteredPin.length !== 4">
          Въведи
        </button>
        <button class="btn btn-secondary" @click="closeModal">
          Отказ
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, nextTick, watch } from 'vue'

export default {
  name: 'PinModal',
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'success'],
  setup(props, { emit }) {
    const enteredPin = ref('')
    const showError = ref(false)
    const pinInput = ref(null)
    const correctPin = '6969'
    
    const validatePin = () => {
      if (enteredPin.value === correctPin) {
        // Store successful authentication
        sessionStorage.setItem('adminAuthenticated', 'true')
        emit('success')
        closeModal()
      } else {
        showError.value = true
        enteredPin.value = ''
        
        // Clear error after 2 seconds
        setTimeout(() => {
          showError.value = false
        }, 2000)
      }
    }
    
    const closeModal = () => {
      enteredPin.value = ''
      showError.value = false
      emit('close')
    }
    
    const onPinInput = () => {
      showError.value = false
      
      // Auto-submit when 4 digits entered
      if (enteredPin.value.length === 4) {
        setTimeout(validatePin, 100)
      }
    }
    
    // Focus input when modal opens
    watch(() => props.show, (newShow) => {
      if (newShow) {
        nextTick(() => {
          if (pinInput.value) {
            pinInput.value.focus()
          }
        })
      }
    })
    
    return {
      enteredPin,
      showError,
      pinInput,
      validatePin,
      closeModal,
      onPinInput
    }
  }
}
</script>

<style scoped>
.pin-overlay {
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
  backdrop-filter: blur(5px);
}

.pin-modal {
  background: white;
  border-radius: 20px;
  padding: 30px;
  width: 350px;
  max-width: 90vw;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: pinModalSlide 0.3s ease-out;
}

.pin-header {
  text-align: center;
  margin-bottom: 25px;
}

.pin-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.pin-header p {
  margin: 8px 0 0;
  color: #666;
  font-size: 0.9rem;
}

.pin-input-container {
  position: relative;
  margin-bottom: 20px;
}

.pin-input {
  width: 100%;
  padding: 15px;
  font-size: 1.5rem;
  text-align: center;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  letter-spacing: 0.5em;
  background: transparent;
  color: transparent;
  caret-color: transparent;
}

.pin-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.pin-dots {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 15px;
  pointer-events: none;
}

.pin-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #e9ecef;
  transition: all 0.2s ease;
}

.pin-dot.filled {
  background: #667eea;
  transform: scale(1.2);
}

.pin-dot.error {
  background: #dc3545;
  animation: pinDotShake 0.5s ease-in-out;
}

.pin-error {
  text-align: center;
  color: #dc3545;
  font-size: 0.9rem;
  margin-bottom: 15px;
  animation: pinErrorSlide 0.3s ease-out;
}

.pin-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.btn-primary {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-2px);
}

@keyframes pinModalSlide {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes pinDotShake {
  0%, 20%, 40%, 60%, 80%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
}

@keyframes pinErrorSlide {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (max-width: 480px) {
  .pin-modal {
    padding: 20px;
    width: 300px;
  }
  
  .pin-dots {
    gap: 12px;
  }
  
  .pin-dot {
    width: 14px;
    height: 14px;
  }
}
</style>
