import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

// Système de particules liquides interactives
class LiquidParticleSystem {
  constructor(container, options = {}) {
    this.container = container
    this.particles = []
    this.mouse = { x: 0, y: 0 }
    this.options = {
      count: options.count || 30,
      viscosity: options.viscosity || 0.85,
      attraction: options.attraction || 0.08,
      repulsion: options.repulsion || 0.15,
      maxSpeed: options.maxSpeed || 2,
      connectionDistance: options.connectionDistance || 80,
      ...options
    }
    this.animationId = null
    this.init()
  }

  init() {
    // Créer les particules
    for (let i = 0; i < this.options.count; i++) {
      this.particles.push({
        x: Math.random() * this.container.offsetWidth,
        y: Math.random() * this.container.offsetHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.3,
        hue: Math.random() * 60 + 200, // Bleu à violet
        element: this.createParticleElement(i)
      })
    }

    // Événements souris
    this.container.addEventListener('mousemove', (e) => {
      const rect = this.container.getBoundingClientRect()
      this.mouse.x = e.clientX - rect.left
      this.mouse.y = e.clientY - rect.top
    })

    this.container.addEventListener('mouseleave', () => {
      this.mouse.x = this.container.offsetWidth / 2
      this.mouse.y = this.container.offsetHeight / 2
    })

    this.animate()
  }

  createParticleElement(index) {
    const particle = document.createElement('div')
    particle.className = `liquid-particle liquid-particle-${index}`
    particle.style.cssText = `
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%);
      filter: blur(0.5px);
      mix-blend-mode: screen;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `
    this.container.appendChild(particle)
    return particle
  }

  animate() {
    this.particles.forEach((particle, i) => {
      // Force d'attraction/répulsion avec la souris
      const dx = this.mouse.x - particle.x
      const dy = this.mouse.y - particle.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance < 100) {
        const force = (100 - distance) * this.options.repulsion
        particle.vx -= (dx / distance) * force * 0.01
        particle.vy -= (dy / distance) * force * 0.01
      }

      // Interactions entre particules (cohésion liquide)
      this.particles.forEach((other, j) => {
        if (i !== j) {
          const dx2 = other.x - particle.x
          const dy2 = other.y - particle.y
          const distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2)
          
          if (distance2 < this.options.connectionDistance && distance2 > 0) {
            const force = (this.options.connectionDistance - distance2) * this.options.attraction
            particle.vx += (dx2 / distance2) * force * 0.005
            particle.vy += (dy2 / distance2) * force * 0.005
          }
        }
      })

      // Attraction vers le centre (stabilité)
      const centerX = this.container.offsetWidth / 2
      const centerY = this.container.offsetHeight / 2
      const centerDx = centerX - particle.x
      const centerDy = centerY - particle.y
      particle.vx += centerDx * 0.0001
      particle.vy += centerDy * 0.0001

      // Limitation de vitesse
      const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy)
      if (speed > this.options.maxSpeed) {
        particle.vx = (particle.vx / speed) * this.options.maxSpeed
        particle.vy = (particle.vy / speed) * this.options.maxSpeed
      }

      // Application de la viscosité
      particle.vx *= this.options.viscosity
      particle.vy *= this.options.viscosity

      // Mise à jour position
      particle.x += particle.vx
      particle.y += particle.vy

      // Rebonds élastiques sur les bords
      if (particle.x < particle.radius) {
        particle.x = particle.radius
        particle.vx *= -0.7
      }
      if (particle.x > this.container.offsetWidth - particle.radius) {
        particle.x = this.container.offsetWidth - particle.radius
        particle.vx *= -0.7
      }
      if (particle.y < particle.radius) {
        particle.y = particle.radius
        particle.vy *= -0.7
      }
      if (particle.y > this.container.offsetHeight - particle.radius) {
        particle.y = this.container.offsetHeight - particle.radius
        particle.vy *= -0.7
      }

      // Rendu avec effet liquide
      const size = particle.radius * 2
      particle.element.style.left = (particle.x - particle.radius) + 'px'
      particle.element.style.top = (particle.y - particle.radius) + 'px'
      particle.element.style.width = size + 'px'
      particle.element.style.height = size + 'px'
      particle.element.style.opacity = particle.opacity
      particle.element.style.background = `radial-gradient(circle, 
        hsla(${particle.hue}, 70%, 80%, ${particle.opacity}) 0%, 
        hsla(${particle.hue}, 70%, 60%, ${particle.opacity * 0.5}) 50%,
        transparent 100%)`
    })

    this.animationId = requestAnimationFrame(() => this.animate())
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
    this.particles.forEach(particle => {
      if (particle.element && particle.element.parentNode) {
        particle.element.parentNode.removeChild(particle.element)
      }
    })
    this.particles = []
  }
}

// Hook pour les particules liquides
export const useLiquidParticles = (options = {}) => {
  const containerRef = useRef(null)
  const systemRef = useRef(null)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    // Vérifier si les animations sont autorisées
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    systemRef.current = new LiquidParticleSystem(containerRef.current, options)
    setIsActive(true)

    return () => {
      if (systemRef.current) {
        systemRef.current.destroy()
        systemRef.current = null
      }
      setIsActive(false)
    }
  }, [options])

  return { containerRef, isActive }
}

// Composant LiquidParticles
export const LiquidParticles = ({ 
  count = 30, 
  className = '', 
  style = {},
  viscosity = 0.85,
  attraction = 0.08,
  repulsion = 0.15,
  ...props 
}) => {
  const { containerRef, isActive } = useLiquidParticles({
    count,
    viscosity,
    attraction,
    repulsion
  })

  return (
    <div
      ref={containerRef}
      className={`liquid-particles-container ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        ...style
      }}
      {...props}
    />
  )
}

// Composant ParticleField amélioré
export const ParticleField = ({ 
  count = 50, 
  className = '',
  interactive = true,
  ...props 
}) => {
  const [particles, setParticles] = useState([])
  
  useEffect(() => {
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 6,
      duration: Math.random() * 4 + 4,
      hue: Math.random() * 60 + 200
    }))
    setParticles(newParticles)
  }, [count])
  
  return (
    <div className={`particle-field ${className}`} {...props}>
      {/* Particules CSS simples pour fallback */}
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="particle absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: `radial-gradient(circle, 
              hsla(${particle.hue}, 70%, 80%, 0.6) 0%, 
              transparent 70%)`
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
      
      {/* Particules interactives si supportées */}
      {interactive && (
        <LiquidParticles 
          count={Math.floor(count * 0.6)} 
          className="absolute inset-0"
        />
      )}
    </div>
  )
}

export default LiquidParticles
