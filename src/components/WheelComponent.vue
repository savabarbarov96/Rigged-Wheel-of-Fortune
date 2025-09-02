<template>
  <div class="wheel-container">
    <div class="wheel-wrapper" ref="wheelWrapper">
      <svg 
        class="wheel-svg" 
        :width="wheelSize" 
        :height="wheelSize" 
        viewBox="0 0 400 400"
        ref="wheelSvg"
      >
        <!-- Wheel background -->
        <circle 
          cx="200" 
          cy="200" 
          r="195" 
          fill="none" 
          stroke="#333" 
          stroke-width="10"
        />
        
        <!-- Wheel sectors -->
        <g ref="wheelGroup" class="wheel-sectors" transform-origin="200 200" :style="{ transform: `rotate(${currentRotation}deg)` }">
          <g 
            v-for="(sector, index) in sectors" 
            :key="sector.id"
            class="sector"
          >
            <!-- Sector path -->
            <path 
              :d="getSectorPath(index)"
              :fill="sector.color"
              :stroke="'#fff'"
              stroke-width="2"
            />
            
            <!-- Sector text -->
            <text 
              :x="getTextX(index)"
              :y="getTextY(index)"
              :transform="getTextTransform(index)"
              class="sector-text"
              text-anchor="middle"
              dominant-baseline="middle"
            >
              {{ sector.label }}
            </text>
          </g>
        </g>
      </svg>
      
      <!-- Arrow/Pointer -->
      <div class="arrow">
        <svg width="30" height="40" viewBox="0 0 30 40">
          <polygon 
            points="15,5 25,35 15,25 5,35" 
            fill="#333"
            stroke="#fff"
            stroke-width="2"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, nextTick, onMounted } from 'vue'
import anime from 'animejs'

export default {
  name: 'WheelComponent',
  props: {
    sectors: {
      type: Array,
      required: true
    },
    isSpinning: {
      type: Boolean,
      default: false
    }
  },
  emits: ['spin-complete'],
  setup(props, { emit }) {
    const wheelWrapper = ref(null)
    const wheelSvg = ref(null)
    const wheelGroup = ref(null)
    
    const wheelSize = ref(400)
    const currentRotation = ref(0)
    
    // Calculate sector angles
    const sectorAngles = computed(() => {
      const totalSectors = props.sectors.length
      const anglePerSector = 360 / totalSectors
      
      return props.sectors.map((sector, index) => ({
        ...sector,
        startAngle: index * anglePerSector,
        endAngle: (index + 1) * anglePerSector,
        centerAngle: (index * anglePerSector) + (anglePerSector / 2)
      }))
    })

    // Generate SVG path for each sector
    const getSectorPath = (index) => {
      const sector = sectorAngles.value[index]
      const centerX = 200
      const centerY = 200
      const radius = 190
      
      const startAngleRad = (sector.startAngle * Math.PI) / 180
      const endAngleRad = (sector.endAngle * Math.PI) / 180
      
      const x1 = centerX + radius * Math.cos(startAngleRad)
      const y1 = centerY + radius * Math.sin(startAngleRad)
      const x2 = centerX + radius * Math.cos(endAngleRad)
      const y2 = centerY + radius * Math.sin(endAngleRad)
      
      const largeArcFlag = (sector.endAngle - sector.startAngle) > 180 ? 1 : 0
      
      return [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ')
    }

    // Calculate text position for each sector
    const getTextPosition = (index) => {
      const sector = sectorAngles.value[index]
      const centerX = 200
      const centerY = 200
      const textRadius = 130
      
      const angleRad = (sector.centerAngle * Math.PI) / 180
      const x = centerX + textRadius * Math.cos(angleRad)
      const y = centerY + textRadius * Math.sin(angleRad)
      
      return { x, y, angle: sector.centerAngle }
    }

    const getTextX = (index) => getTextPosition(index).x
    const getTextY = (index) => getTextPosition(index).y
    
    const getTextTransform = (index) => {
      const pos = getTextPosition(index)
      const rotation = pos.angle > 90 && pos.angle < 270 ? pos.angle + 180 : pos.angle
      return `rotate(${rotation} ${pos.x} ${pos.y})`
    }

    // Main spin function that accepts a predetermined winner
    const spinToWinner = async (winner) => {
      if (!wheelGroup.value) return
      
      // Find the winner sector angle
      const winnerSector = sectorAngles.value.find(s => s.id === winner.id)
      if (!winnerSector) return
      
      // Calculate target rotation
      // Arrow points at top (270 degrees in SVG coordinates), rotate wheel so winner aligns with arrow
      // Add some randomness within the sector bounds for authenticity
      const sectorSpan = 360 / props.sectors.length
      const randomOffset = (Math.random() - 0.5) * sectorSpan * 0.8 // 80% of sector width
      const targetAngle = 270 - winnerSector.centerAngle + randomOffset
      
      // Add multiple full rotations for dramatic effect
      const extraRotations = 6 + Math.floor(Math.random() * 4) // 6-9 full rotations (increased from original 3-5)
      const finalRotation = targetAngle + (extraRotations * 360)
      
      // Debug logging to verify rigging calculations
      console.log('🎯 RIGGING DEBUG:', {
        winner: winner.label,
        winnerSectorCenter: winnerSector.centerAngle,
        sectorSpan,
        randomOffset: randomOffset.toFixed(2),
        targetAngle: targetAngle.toFixed(2),
        extraRotations,
        finalRotation: finalRotation.toFixed(2),
        expectedFinalPosition: ((winnerSector.centerAngle + finalRotation) % 360).toFixed(2) + '° (should be ≈270°)'
      })
      
      // Create realistic spin animation with fake spinning phase
      const animation = anime({
        targets: wheelGroup.value,
        rotate: finalRotation,
        duration: 2000 + Math.random() * 1000, // 2-3 seconds (original timing)
        easing: 'cubicBezier(0.17, 0.67, 0.12, 0.99)', // More dramatic deceleration (original)
        transformOrigin: '50% 50%', // Center of the wheel (percentage-based for better responsiveness)
        complete: () => {
          currentRotation.value = finalRotation % 360
          emit('spin-complete', winner)
        }
      })
      
      return animation.finished
    }

    // Initialize wheel on component mount to ensure proper centering
    onMounted(() => {
      nextTick(() => {
        // Set initial rotation to 0 to prevent first-load alignment issues
        currentRotation.value = 0
      })
    })
    
    // Expose methods to parent component
    return {
      wheelWrapper,
      wheelSvg,
      wheelGroup,
      wheelSize,
      sectorAngles,
      getSectorPath,
      getTextX,
      getTextY,
      getTextTransform,
      spinToWinner
    }
  }
}
</script>

<style scoped>
.wheel-container {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin: 20px 0;
}

.wheel-wrapper {
  position: relative;
  display: inline-block;
}

.wheel-svg {
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3));
  background: radial-gradient(circle, #fff 30%, #f0f0f0 100%);
  border-radius: 50%;
}

.wheel-sectors {
  transform-origin: 200px 200px;
}

.sector {
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.sector:hover {
  opacity: 0.9;
}

.sector-text {
  font-family: 'Arial', sans-serif;
  font-size: 14px;
  font-weight: bold;
  fill: #333;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
  pointer-events: none;
}

.arrow {
  position: absolute;
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

/* Responsive design */
@media (max-width: 768px) {
  .wheel-svg {
    width: 300px;
    height: 300px;
  }
  
  .sector-text {
    font-size: 11px;
  }
  
  .arrow svg {
    width: 25px;
    height: 35px;
  }
}

@media (max-width: 480px) {
  .wheel-svg {
    width: 280px;
    height: 280px;
  }
  
  .sector-text {
    font-size: 10px;
  }
  
  .arrow svg {
    width: 20px;
    height: 30px;
  }
}
</style>