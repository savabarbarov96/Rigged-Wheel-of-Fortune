import { ref } from 'vue'

export function useRigging() {
  const spinHistory = ref([])
  
  /**
   * Select a winner based on weighted probabilities
   * @param {Array} sectors - Array of sector objects with weight property
   * @returns {Object} - Selected sector object
   */
  const selectWinner = (sectors) => {
    // Calculate total weight
    const totalWeight = sectors.reduce((sum, sector) => sum + sector.weight, 0)
    
    // Generate random number between 0 and totalWeight
    const random = Math.random() * totalWeight
    
    // Find the winning sector
    let currentWeight = 0
    for (const sector of sectors) {
      currentWeight += sector.weight
      if (random <= currentWeight) {
        // Log the selection for debugging/statistics
        spinHistory.value.push({
          timestamp: new Date(),
          winner: sector,
          random: random,
          totalWeight: totalWeight,
          probability: (sector.weight / totalWeight * 100).toFixed(2) + '%'
        })
        
        return sector
      }
    }
    
    // Fallback (should never reach here)
    return sectors[0]
  }
  
  /**
   * Calculate the actual probability of winning for each sector
   * @param {Array} sectors - Array of sector objects with weight property
   * @returns {Array} - Array of sectors with calculated probability percentages
   */
  const calculateProbabilities = (sectors) => {
    const totalWeight = sectors.reduce((sum, sector) => sum + sector.weight, 0)
    
    return sectors.map(sector => ({
      ...sector,
      probability: ((sector.weight / totalWeight) * 100).toFixed(2)
    }))
  }
  
  /**
   * Get statistics about recent spins
   * @returns {Object} - Statistics object
   */
  const getStatistics = () => {
    if (spinHistory.value.length === 0) {
      return { totalSpins: 0, winDistribution: {} }
    }
    
    const winDistribution = {}
    spinHistory.value.forEach(spin => {
      const label = spin.winner.label
      winDistribution[label] = (winDistribution[label] || 0) + 1
    })
    
    return {
      totalSpins: spinHistory.value.length,
      winDistribution,
      recentSpins: spinHistory.value.slice(-10).reverse() // Last 10 spins
    }
  }
  
  /**
   * Reset statistics and history
   */
  const resetStatistics = () => {
    spinHistory.value = []
  }
  
  /**
   * Validate wheel configuration
   * @param {Array} sectors - Array of sector objects
   * @returns {Object} - Validation result
   */
  const validateConfiguration = (sectors) => {
    const errors = []
    
    if (!sectors || sectors.length === 0) {
      errors.push('At least one sector is required')
    }
    
    if (sectors.some(sector => !sector.label || sector.label.trim() === '')) {
      errors.push('All sectors must have labels')
    }
    
    if (sectors.some(sector => !sector.weight || sector.weight <= 0)) {
      errors.push('All sectors must have positive weights')
    }
    
    if (sectors.some(sector => !sector.color)) {
      errors.push('All sectors must have colors')
    }
    
    const totalWeight = sectors.reduce((sum, sector) => sum + (sector.weight || 0), 0)
    if (totalWeight === 0) {
      errors.push('Total weight must be greater than 0')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
  
  return {
    selectWinner,
    calculateProbabilities,
    getStatistics,
    resetStatistics,
    validateConfiguration,
    spinHistory
  }
}