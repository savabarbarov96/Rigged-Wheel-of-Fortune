import { ref, computed } from 'vue'

const SESSION_DURATION = 30 * 60 * 1000 // 30 minutes in milliseconds
const SESSION_KEY = 'wheel_session'

// Session state (shared across all components)
const sessionData = ref(null)
const sessionCheckInterval = ref(null)

export function useSession() {
  // Load session from localStorage
  const loadSession = () => {
    try {
      const stored = localStorage.getItem(SESSION_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        sessionData.value = parsed
        return parsed
      }
    } catch (error) {
      console.error('Failed to load session:', error)
    }
    return null
  }

  // Save session to localStorage
  const saveSession = (data) => {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(data))
      sessionData.value = data
    } catch (error) {
      console.error('Failed to save session:', error)
    }
  }

  // Create a new session
  const createSession = () => {
    const now = Date.now()
    const session = {
      startTime: now,
      expiresAt: now + SESSION_DURATION,
      isActive: true
    }
    saveSession(session)
    return session
  }

  // Check if current session is valid
  const isSessionValid = computed(() => {
    if (!sessionData.value) return false
    if (!sessionData.value.isActive) return false
    
    const now = Date.now()
    return now < sessionData.value.expiresAt
  })

  // Get remaining session time in seconds
  const remainingTime = computed(() => {
    if (!sessionData.value || !sessionData.value.expiresAt) return 0
    const now = Date.now()
    const remaining = Math.max(0, sessionData.value.expiresAt - now)
    return Math.floor(remaining / 1000)
  })

  // Clear/invalidate session
  const clearSession = () => {
    try {
      localStorage.removeItem(SESSION_KEY)
      sessionData.value = null
    } catch (error) {
      console.error('Failed to clear session:', error)
    }
  }

  // Start monitoring session expiration
  const startSessionMonitor = (onExpire) => {
    if (sessionCheckInterval.value) {
      clearInterval(sessionCheckInterval.value)
    }

    sessionCheckInterval.value = setInterval(() => {
      if (sessionData.value && !isSessionValid.value) {
        clearSession()
        if (onExpire) onExpire()
      }
    }, 5000) // Check every 5 seconds
  }

  // Stop session monitor
  const stopSessionMonitor = () => {
    if (sessionCheckInterval.value) {
      clearInterval(sessionCheckInterval.value)
      sessionCheckInterval.value = null
    }
  }

  // Initialize: load existing session
  const initSession = () => {
    return loadSession()
  }

  return {
    sessionData,
    isSessionValid,
    remainingTime,
    createSession,
    clearSession,
    initSession,
    startSessionMonitor,
    stopSessionMonitor
  }
}

