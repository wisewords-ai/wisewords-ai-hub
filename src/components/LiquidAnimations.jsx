import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion'

// Système de particules liquides haute performance avec GPU acceleration
class AdvancedLiquidSystem {
  constructor(canvas, options = {}) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d', { alpha: true, willReadFrequently: false })
    this.particles = []
    this.connections = []
    this.mouse = { x: 0, y: 0, radius: 100 }
    
    this.options = {
      particleCount: options.particleCount || 40,
      viscosity: options.viscosity || 0.88,
      attraction: options.attraction || 0.12,
      repulsion: options.repulsion || 0.18,
      maxSpeed: options.maxSpeed || 1.5,
      connectionDistance: options.connectionDistance || 120,
      surfaceTension: options.surfaceTension || 0.05,
      damping: options.damping || 0.99,
      ...options
    }
    
    this.animationId = null
    this.lastTime = 0
    this.fps = 60
    this.frameInterval = 1000 / this.fps
    
    this.init()
  }

  init() {
    this.resize()
    this.createParticles()
    this.setupEventListeners()
    this.animate()
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    
    this.canvas.width = rect.width * dpr
    this.canvas.height = rect.height * dpr
    this.canvas.style.width = rect.width + 'px'
    this.canvas.style.height = rect.height + 'px'
    
    this.ctx.scale(dpr, dpr)
    this.width = rect.width
    this.height = rect.height
  }

  createParticles() {
    this.particles = []
    
    for (let i = 0; i < this.options.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 3 + 2,
        mass: Math.random() * 0.5 + 0.5,
        hue: Math.random() * 60 + 200, // Bleu à violet
        saturation: Math.random() * 30 + 70,
        lightness: Math.random() * 20 + 60,
        alpha: Math.random() * 0.4 + 0.6,
        life: 1,
        connections: []
      })
    }
  }

  setupEventListeners() {
    const updateMouse = (e) => {
      const rect = this.canvas.getBoundingClientRect()
      this.mouse.x = e.clientX - rect.left
      this.mouse.y = e.clientY - rect.top
    }

    this.canvas.addEventListener('mousemove', updateMouse)
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault()
      if (e.touches[0]) {
        updateMouse(e.touches[0])
      }
    }, { passive: false })

    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.x = this.width / 2
      this.mouse.y = this.height / 2
    })

    window.addEventListener('resize', () => this.resize())
  }

  updatePhysics() {
    // Réinitialiser les connexions
    this.connections = []
    
    this.particles.forEach((particle, i) => {
      particle.connections = []
      
      // Force d'interaction avec la souris
      const dx = this.mouse.x - particle.x
      const dy = this.mouse.y - particle.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance < this.mouse.radius) {
        const force = (this.mouse.radius - distance) / this.mouse.radius
        const angle = Math.atan2(dy, dx)
        
        // Répulsion de la souris
        particle.vx -= Math.cos(angle) * force * this.options.repulsion * 0.1
        particle.vy -= Math.sin(angle) * force * this.options.repulsion * 0.1
      }

      // Interactions entre particules (cohésion liquide)
      this.particles.forEach((other, j) => {
        if (i !== j) {
          const dx2 = other.x - particle.x
          const dy2 = other.y - particle.y
          const distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2)
          
          if (distance2 < this.options.connectionDistance && distance2 > 0) {
            // Force d'attraction (cohésion)
            const force = (this.options.connectionDistance - distance2) / this.options.connectionDistance
            const attraction = force * this.options.attraction * 0.01
            
            particle.vx += (dx2 / distance2) * attraction
            particle.vy += (dy2 / distance2) * attraction
            
            // Enregistrer la connexion pour le rendu
            if (distance2 < this.options.connectionDistance * 0.8) {
              particle.connections.push({
                particle: other,
                distance: distance2,
                strength: 1 - (distance2 / this.options.connectionDistance)
              })
              
              this.connections.push({
                from: particle,
                to: other,
                strength: 1 - (distance2 / this.options.connectionDistance)
              })
            }
          }
        }
      })

      // Tension de surface (force vers le centre de masse local)
      if (particle.connections.length > 0) {
        let centerX = 0, centerY = 0
        particle.connections.forEach(conn => {
          centerX += conn.particle.x
          centerY += conn.particle.y
        })
        centerX /= particle.connections.length
        centerY /= particle.connections.length
        
        const surfaceDx = centerX - particle.x
        const surfaceDy = centerY - particle.y
        particle.vx += surfaceDx * this.options.surfaceTension
        particle.vy += surfaceDy * this.options.surfaceTension
      }

      // Attraction vers le centre (stabilité)
      const centerX = this.width / 2
      const centerY = this.height / 2
      const centerDx = centerX - particle.x
      const centerDy = centerY - particle.y
      particle.vx += centerDx * 0.0002
      particle.vy += centerDy * 0.0002

      // Limitation de vitesse
      const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy)
      if (speed > this.options.maxSpeed) {
        particle.vx = (particle.vx / speed) * this.options.maxSpeed
        particle.vy = (particle.vy / speed) * this.options.maxSpeed
      }

      // Application de la viscosité et du damping
      particle.vx *= this.options.viscosity * this.options.damping
      particle.vy *= this.options.viscosity * this.options.damping

      // Mise à jour position
      particle.x += particle.vx
      particle.y += particle.vy

      // Rebonds élastiques avec amortissement
      const bounce = 0.7
      if (particle.x < particle.radius) {
        particle.x = particle.radius
        particle.vx *= -bounce
      }
      if (particle.x > this.width - particle.radius) {
        particle.x = this.width - particle.radius
        particle.vx *= -bounce
      }
      if (particle.y < particle.radius) {
        particle.y = particle.radius
        particle.vy *= -bounce
      }
      if (particle.y > this.height - particle.radius) {
        particle.y = this.height - particle.radius
        particle.vy *= -bounce
      }
    })
  }

  render() {
    // Clear avec effet de traînée
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
    this.ctx.fillRect(0, 0, this.width, this.height)

    // Rendu des connexions liquides
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    this.ctx.lineWidth = 1
    this.ctx.lineCap = 'round'

    this.connections.forEach(conn => {
      if (conn.strength > 0.3) {
        this.ctx.globalAlpha = conn.strength * 0.3
        this.ctx.beginPath()
        this.ctx.moveTo(conn.from.x, conn.from.y)
        
        // Courbe de Bézier pour effet liquide
        const midX = (conn.from.x + conn.to.x) / 2
        const midY = (conn.from.y + conn.to.y) / 2
        const offset = conn.strength * 20
        
        this.ctx.quadraticCurveTo(
          midX + (Math.random() - 0.5) * offset,
          midY + (Math.random() - 0.5) * offset,
          conn.to.x,
          conn.to.y
        )
        this.ctx.stroke()
      }
    })

    // Rendu des particules avec effet iridescent
    this.particles.forEach(particle => {
      const gradient = this.ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.radius * 2
      )
      
      gradient.addColorStop(0, `hsla(${particle.hue}, ${particle.saturation}%, ${particle.lightness}%, ${particle.alpha})`)
      gradient.addColorStop(0.7, `hsla(${particle.hue + 20}, ${particle.saturation}%, ${particle.lightness - 10}%, ${particle.alpha * 0.6})`)
      gradient.addColorStop(1, 'transparent')
      
      this.ctx.globalAlpha = particle.alpha
      this.ctx.fillStyle = gradient
      this.ctx.beginPath()
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
      this.ctx.fill()
      
      // Effet de brillance
      this.ctx.globalAlpha = particle.alpha * 0.8
      this.ctx.fillStyle = `hsla(${particle.hue + 40}, 100%, 90%, 0.3)`
      this.ctx.beginPath()
      this.ctx.arc(particle.x - particle.radius * 0.3, particle.y - particle.radius * 0.3, particle.radius * 0.4, 0, Math.PI * 2)
      this.ctx.fill()
    })

    this.ctx.globalAlpha = 1
  }

  animate(currentTime = 0) {
    if (currentTime - this.lastTime >= this.frameInterval) {
      this.updatePhysics()
      this.render()
      this.lastTime = currentTime
    }
    
    this.animationId = requestAnimationFrame((time) => this.animate(time))
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
  }
}

// Hook pour les animations liquides avancées
export const useAdvancedLiquidAnimation = (options = {}) => {
  const canvasRef = useRef(null)
  const systemRef = useRef(null)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (!canvasRef.current) return

    // Vérifier les préférences d'animation
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    systemRef.current = new AdvancedLiquidSystem(canvasRef.current, options)
    setIsActive(true)

    return () => {
      if (systemRef.current) {
        systemRef.current.destroy()
        systemRef.current = null
      }
      setIsActive(false)
    }
  }, [options])

  return { canvasRef, isActive, system: systemRef.current }
}

// Composant LiquidCanvas haute performance
export const LiquidCanvas = ({ 
  className = '', 
  style = {},
  particleCount = 40,
  viscosity = 0.88,
  attraction = 0.12,
  repulsion = 0.18,
  ...props 
}) => {
  const options = useMemo(() => ({
    particleCount,
    viscosity,
    attraction,
    repulsion
  }), [particleCount, viscosity, attraction, repulsion])

  const { canvasRef, isActive } = useAdvancedLiquidAnimation(options)

  return (
    <canvas
      ref={canvasRef}
      className={`liquid-canvas ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'auto',
        mixBlendMode: 'screen',
        filter: 'blur(0.5px)',
        ...style
      }}
      {...props}
    />
  )
}

// Composant de morphing liquide avancé
export const LiquidMorph = ({ 
  children, 
  isActive = false, 
  morphType = 'organic',
  intensity = 1,
  speed = 1,
  className = '',
  ...props 
}) => {
  const controls = useAnimation()
  const pathProgress = useMotionValue(0)
  
  const morphPath = useTransform(pathProgress, [0, 1], [
    "M0,100 C20,80 40,120 60,100 C80,80 100,120 120,100 L120,120 L0,120 Z",
    "M0,100 C20,120 40,80 60,100 C80,120 100,80 120,100 L120,120 L0,120 Z"
  ])

  useEffect(() => {
    if (isActive) {
      controls.start({
        pathLength: [0, 1, 0],
        transition: {
          duration: 3 / speed,
          repeat: Infinity,
          ease: "easeInOut"
        }
      })
      
      pathProgress.set(0)
      const animation = pathProgress.set(1)
    } else {
      controls.stop()
    }
  }, [isActive, controls, speed, pathProgress])

  const morphVariants = {
    organic: {
      borderRadius: [
        "20px",
        "25px 15px 30px 10px / 15px 25px 10px 30px",
        "30px 10px 25px 15px / 10px 30px 15px 25px",
        "15px 30px 10px 25px / 25px 10px 30px 15px",
        "20px"
      ]
    },
    liquid: {
      borderRadius: [
        "50% 50% 50% 70% / 60% 60% 70% 40%",
        "60% 40% 60% 40% / 70% 70% 30% 30%",
        "40% 60% 40% 60% / 30% 30% 70% 70%",
        "70% 30% 70% 30% / 40% 40% 60% 60%",
        "50% 50% 50% 70% / 60% 60% 70% 40%"
      ]
    },
    wave: {
      clipPath: [
        "polygon(0% 80%, 10% 85%, 20% 78%, 30% 82%, 40% 75%, 50% 80%, 60% 73%, 70% 78%, 80% 72%, 90% 76%, 100% 70%, 100% 100%, 0% 100%)",
        "polygon(0% 75%, 10% 78%, 20% 85%, 30% 72%, 40% 80%, 50% 75%, 60% 82%, 70% 68%, 80% 78%, 90% 72%, 100% 76%, 100% 100%, 0% 100%)",
        "polygon(0% 82%, 10% 75%, 20% 80%, 30% 85%, 40% 72%, 50% 78%, 60% 75%, 70% 82%, 80% 68%, 90% 80%, 100% 73%, 100% 100%, 0% 100%)",
        "polygon(0% 80%, 10% 85%, 20% 78%, 30% 82%, 40% 75%, 50% 80%, 60% 73%, 70% 78%, 80% 72%, 90% 76%, 100% 70%, 100% 100%, 0% 100%)"
      ]
    }
  }

  return (
    <motion.div
      className={`liquid-morph relative overflow-hidden ${className}`}
      animate={isActive ? morphVariants[morphType] : {}}
      transition={{
        duration: 4 / speed,
        repeat: isActive ? Infinity : 0,
        ease: "easeInOut"
      }}
      style={{
        willChange: 'border-radius, clip-path, transform'
      }}
      {...props}
    >
      {children}
      
      {/* Effet de shimmer liquide */}
      {isActive && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)",
            backgroundSize: "200% 200%"
          }}
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
          }}
          transition={{
            duration: 3 / speed,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      )}
    </motion.div>
  )
}

// Composant de transition liquide entre thèmes
export const LiquidThemeTransition = ({ 
  isTransitioning, 
  fromTheme, 
  toTheme, 
  onComplete,
  children 
}) => {
  const [phase, setPhase] = useState('idle')
  const scaleValue = useMotionValue(0)
  
  const backgroundGradient = useTransform(
    scaleValue,
    [0, 0.5, 1],
    [
      `radial-gradient(circle at 50% 50%, ${fromTheme?.primary || '#667eea'} 0%, transparent 0%)`,
      `radial-gradient(circle at 50% 50%, ${toTheme?.primary || '#764ba2'} 50%, transparent 50%)`,
      `radial-gradient(circle at 50% 50%, ${toTheme?.secondary || '#f093fb'} 100%, transparent 100%)`
    ]
  )

  useEffect(() => {
    if (isTransitioning) {
      setPhase('expanding')
      
      const sequence = async () => {
        await scaleValue.set(0.5, { duration: 0.4 })
        setPhase('morphing')
        await scaleValue.set(1, { duration: 0.6 })
        setPhase('contracting')
        await scaleValue.set(0, { duration: 0.4 })
        setPhase('idle')
        onComplete?.()
      }
      
      sequence()
    }
  }, [isTransitioning, scaleValue, onComplete])

  return (
    <>
      {children}
      
      {isTransitioning && (
        <motion.div
          className="fixed inset-0 z-50 pointer-events-none"
          style={{
            background: backgroundGradient,
            mixBlendMode: 'multiply'
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: phase === 'expanding' ? 1.5 : phase === 'morphing' ? 2 : 0,
            opacity: phase === 'idle' ? 0 : 1
          }}
          transition={{
            duration: 0.4,
            ease: "easeInOut"
          }}
        />
      )}
    </>
  )
}

export default LiquidCanvas
