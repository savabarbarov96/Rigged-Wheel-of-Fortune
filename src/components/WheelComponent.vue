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
    const activeAnimation = ref(null)

    // Sound tick support
    const audioCtx = ref(null)
    const sectorSpanRef = ref(0)
    const nextTickAt = ref(0)
    const tickingEnabled = ref(false)

    const ensureAudio = async () => {
      if (typeof window === 'undefined') return
      if (!audioCtx.value) {
        const Ctx = window.AudioContext || window.webkitAudioContext
        if (Ctx) audioCtx.value = new Ctx()
      }
      if (audioCtx.value && audioCtx.value.state === 'suspended') {
        try { await audioCtx.value.resume() } catch (e) {}
      }
    }

    const playTick = async (volume = 1) => {
      await ensureAudio()
      const ctx = audioCtx.value
      if (!ctx) return

      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const hp = ctx.createBiquadFilter()

      // A crisp mechanical tick
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(2200, now)
      hp.type = 'highpass'
      hp.frequency.setValueAtTime(800, now)
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.linearRampToValueAtTime(0.18 * volume, now + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06)

      osc.connect(hp)
      hp.connect(gain)
      gain.connect(ctx.destination)

      try {
        osc.start(now)
        osc.stop(now + 0.07)
      } catch (e) {}
    }
    
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
      // Arrow points at top (270 degrees in SVG coordinates); rotate wheel so winner aligns with arrow
      // Add subtle randomness within the sector bounds for authenticity
      const sectorSpan = 360 / props.sectors.length
      const randomOffset = (Math.random() - 0.5) * sectorSpan * 0.6 // 60% of sector width to avoid edge overlaps
      const targetAngle = 270 - winnerSector.centerAngle + randomOffset

      // Determine long spin with a fast start and smooth finish
      const startRotation = currentRotation.value || 0
      const extraRotations = 10 + Math.floor(Math.random() * 7) // 10-16 full rotations
      const finalRotation = targetAngle + (extraRotations * 360)
      const totalDelta = finalRotation - startRotation

      // Partition the rotation into realistic phases: accelerate → cruise → decelerate
      const accelDelta = Math.min(720, Math.max(540, totalDelta * 0.1)) // ~1.5–2 turns
      const decelDelta = Math.min(1260, Math.max(900, totalDelta * 0.18)) // ~2.5–3.5 turns
      const cruiseDelta = Math.max(360, totalDelta - accelDelta - decelDelta) // remaining turns

      const accelEnd = startRotation + accelDelta
      const cruiseEnd = accelEnd + cruiseDelta
      const decelEnd = finalRotation // must land here exactly

      // Clean up any previous animation
      if (activeAnimation.value) {
        try { activeAnimation.value.pause() } catch (e) {}
        anime.remove(wheelGroup.value)
      }

      // Build a timeline: quick acceleration, steady cruise, smooth deceleration to the exact target
      const cruiseSpeedDegPerSec = 2200 // visual speed during cruise
      const accelDuration = 600 + Math.random() * 200 // 0.6–0.8s
      const cruiseDuration = Math.max(1200, (cruiseDelta / cruiseSpeedDegPerSec) * 1000)
      const decelDuration = 1800 + Math.random() * 600 // 1.8–2.4s

      const tl = anime.timeline({
        targets: wheelGroup.value,
        easing: 'linear',
        autoplay: true,
        update: (anim) => {
          // Emit tick when crossing each sector boundary under the pointer
          let current = 0
          if (anim && Array.isArray(anim.animations)) {
            const rotAnim = anim.animations.find(a => a.type === 'transform' && a.property === 'rotate')
            if (rotAnim && typeof rotAnim.currentValue === 'string') {
              current = parseFloat(rotAnim.currentValue) || 0
            } else {
              const v = anime.get(wheelGroup.value, 'rotate')
              current = typeof v === 'number' ? v : parseFloat(v) || 0
            }
          }
          if (tickingEnabled.value) {
            while (current >= nextTickAt.value) {
              // Volume subtly scales with speed: louder during cruise, softer near stop
              const remaining = Math.max(0, decelEnd - current)
              const softness = Math.min(1, remaining / 720) // softer in last ~2 turns
              const volume = 0.8 * (0.6 + 0.4 * softness)
              playTick(volume)
              nextTickAt.value += sectorSpanRef.value
            }
          }
        },
        complete: () => {
          currentRotation.value = ((decelEnd % 360) + 360) % 360 // normalize
          activeAnimation.value = null
          tickingEnabled.value = false
          emit('spin-complete', winner)
        }
      })

      tl
        // Accelerate quickly to build momentum
        .add({ rotate: accelEnd, duration: accelDuration, easing: 'easeInCubic', transformOrigin: '50% 50%' })
        // Maintain a fast, steady spin for longer visual effect
        .add({ rotate: cruiseEnd, duration: cruiseDuration, easing: 'linear' })
        // Smoothly decelerate and land precisely on target
        .add({ rotate: decelEnd, duration: decelDuration, easing: 'cubicBezier(0.17, 0.67, 0.12, 0.99)' })

      // Initialize ticking cadence based on sector span and current angle
      sectorSpanRef.value = sectorSpan
      const startNorm = ((startRotation % 360) + 360) % 360
      let toNextBoundary = sectorSpan - (startNorm % sectorSpan)
      if (toNextBoundary === 0) toNextBoundary = sectorSpan
      nextTickAt.value = startRotation + toNextBoundary
      tickingEnabled.value = true

      activeAnimation.value = tl
      return tl.finished
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
      currentRotation,
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
  fill: #fff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
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
