import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Composant pour les transitions liquides entre états
export const LiquidMorphing = ({ 
  children, 
  isActive = false, 
  morphType = 'wave',
  className = '',
  duration = 0.8,
  ...props 
}) => {
  const [currentMorph, setCurrentMorph] = useState(0)

  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      setCurrentMorph(prev => (prev + 1) % 4)
    }, duration * 1000)

    return () => clearInterval(interval)
  }, [isActive, duration])

  const morphVariants = {
    wave: {
      initial: {
        clipPath: "polygon(0% 80%, 10% 85%, 20% 78%, 30% 82%, 40% 75%, 50% 80%, 60% 73%, 70% 78%, 80% 72%, 90% 76%, 100% 70%, 100% 100%, 0% 100%)"
      },
      animate: {
        clipPath: [
          "polygon(0% 80%, 10% 85%, 20% 78%, 30% 82%, 40% 75%, 50% 80%, 60% 73%, 70% 78%, 80% 72%, 90% 76%, 100% 70%, 100% 100%, 0% 100%)",
          "polygon(0% 75%, 10% 78%, 20% 85%, 30% 72%, 40% 80%, 50% 75%, 60% 82%, 70% 68%, 80% 78%, 90% 72%, 100% 76%, 100% 100%, 0% 100%)",
          "polygon(0% 82%, 10% 75%, 20% 80%, 30% 85%, 40% 72%, 50% 78%, 60% 75%, 70% 82%, 80% 68%, 90% 80%, 100% 73%, 100% 100%, 0% 100%)",
          "polygon(0% 80%, 10% 85%, 20% 78%, 30% 82%, 40% 75%, 50% 80%, 60% 73%, 70% 78%, 80% 72%, 90% 76%, 100% 70%, 100% 100%, 0% 100%)"
        ]
      }
    },
    blob: {
      initial: {
        borderRadius: "50% 50% 50% 70% / 60% 60% 70% 40%"
      },
      animate: {
        borderRadius: [
          "50% 50% 50% 70% / 60% 60% 70% 40%",
          "60% 40% 60% 40% / 70% 70% 30% 30%",
          "40% 60% 40% 60% / 30% 30% 70% 70%",
          "70% 30% 70% 30% / 40% 40% 60% 60%",
          "50% 50% 50% 70% / 60% 60% 70% 40%"
        ]
      }
    },
    liquid: {
      initial: {
        borderRadius: "20px",
        transform: "scale(1) rotate(0deg)"
      },
      animate: {
        borderRadius: [
          "20px",
          "20px 60px 20px 60px / 60px 20px 60px 20px",
          "60px 20px 60px 20px / 20px 60px 20px 60px",
          "40px 80px 40px 80px / 80px 40px 80px 40px",
          "20px"
        ],
        transform: [
          "scale(1) rotate(0deg)",
          "scale(1.02) rotate(2deg)",
          "scale(0.98) rotate(-1deg)",
          "scale(1.01) rotate(1deg)",
          "scale(1) rotate(0deg)"
        ]
      }
    }
  }

  const currentVariant = morphVariants[morphType] || morphVariants.wave

  return (
    <motion.div
      className={`liquid-morphing relative overflow-hidden ${className}`}
      initial={currentVariant.initial}
      animate={isActive ? currentVariant.animate : currentVariant.initial}
      transition={{
        duration: duration,
        repeat: isActive ? Infinity : 0,
        ease: "easeInOut"
      }}
      {...props}
    >
      {children}
      
      {/* Effet de shimmer liquide */}
      {isActive && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)",
            transform: "translateX(-100%)"
          }}
          animate={{
            transform: ["translateX(-100%)", "translateX(100%)"]
          }}
          transition={{
            duration: duration * 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.div>
  )
}

// Composant pour les gouttes liquides animées
export const LiquidDrop = ({ 
  size = 60, 
  color = "from-blue-400 to-purple-600",
  className = '',
  animated = true,
  ...props 
}) => {
  return (
    <motion.div
      className={`liquid-drop relative ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
        borderRadius: "50% 50% 50% 70% / 60% 60% 70% 40%"
      }}
      animate={animated ? {
        borderRadius: [
          "50% 50% 50% 70% / 60% 60% 70% 40%",
          "60% 40% 60% 40% / 70% 70% 30% 30%",
          "40% 60% 40% 60% / 30% 30% 70% 70%",
          "70% 30% 70% 30% / 40% 40% 60% 60%",
          "50% 50% 50% 70% / 60% 60% 70% 40%"
        ],
        transform: [
          "rotate(0deg) scale(1)",
          "rotate(90deg) scale(1.1)",
          "rotate(180deg) scale(0.9)",
          "rotate(270deg) scale(1.05)",
          "rotate(360deg) scale(1)"
        ]
      } : {}}
      transition={{
        duration: 3,
        repeat: animated ? Infinity : 0,
        ease: "easeInOut"
      }}
      className={`bg-gradient-to-br ${color} ${className}`}
      {...props}
    />
  )
}

// Composant pour les transitions de thème liquides
export const LiquidThemeTransition = ({ 
  isTransitioning, 
  fromTheme, 
  toTheme, 
  onComplete,
  children 
}) => {
  const [phase, setPhase] = useState('idle')

  useEffect(() => {
    if (isTransitioning) {
      setPhase('expanding')
      
      const timer1 = setTimeout(() => setPhase('morphing'), 300)
      const timer2 = setTimeout(() => setPhase('contracting'), 800)
      const timer3 = setTimeout(() => {
        setPhase('idle')
        onComplete?.()
      }, 1200)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
      }
    }
  }, [isTransitioning, onComplete])

  const transitionVariants = {
    idle: {
      scale: 0,
      opacity: 0,
      borderRadius: "50%"
    },
    expanding: {
      scale: 1.5,
      opacity: 0.8,
      borderRadius: "30%"
    },
    morphing: {
      scale: 2,
      opacity: 1,
      borderRadius: ["30%", "20%", "40%", "10%", "50%"]
    },
    contracting: {
      scale: 0,
      opacity: 0,
      borderRadius: "50%"
    }
  }

  return (
    <>
      {children}
      
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="fixed inset-0 z-50 pointer-events-none"
            style={{
              background: `linear-gradient(135deg, ${toTheme?.primary || '#667eea'}, ${toTheme?.secondary || '#764ba2'})`,
              mixBlendMode: 'multiply'
            }}
            variants={transitionVariants}
            initial="idle"
            animate={phase}
            exit="contracting"
            transition={{
              duration: 0.4,
              ease: "easeInOut"
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}

// Composant pour les connexions liquides entre éléments
export const LiquidConnection = ({ 
  from, 
  to, 
  color = "rgba(255, 255, 255, 0.2)",
  animated = true,
  className = ''
}) => {
  const [path, setPath] = useState('')

  useEffect(() => {
    if (!from || !to) return

    const updatePath = () => {
      const fromRect = from.getBoundingClientRect()
      const toRect = to.getBoundingClientRect()
      
      const fromX = fromRect.left + fromRect.width / 2
      const fromY = fromRect.top + fromRect.height / 2
      const toX = toRect.left + toRect.width / 2
      const toY = toRect.top + toRect.height / 2
      
      const midX = (fromX + toX) / 2
      const midY = (fromY + toY) / 2
      
      // Créer une courbe liquide
      const controlX1 = midX + (Math.random() - 0.5) * 100
      const controlY1 = midY + (Math.random() - 0.5) * 100
      const controlX2 = midX + (Math.random() - 0.5) * 100
      const controlY2 = midY + (Math.random() - 0.5) * 100
      
      setPath(`M ${fromX} ${fromY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${toX} ${toY}`)
    }

    updatePath()
    
    if (animated) {
      const interval = setInterval(updatePath, 2000)
      return () => clearInterval(interval)
    }
  }, [from, to, animated])

  if (!path) return null

  return (
    <svg 
      className={`liquid-connection fixed inset-0 pointer-events-none z-10 ${className}`}
      style={{ mixBlendMode: 'screen' }}
    >
      <motion.path
        d={path}
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        filter="blur(1px)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
      />
      
      {/* Particules qui suivent le chemin */}
      {animated && (
        <motion.circle
          r="3"
          fill={color}
          filter="blur(0.5px)"
          initial={{ offsetDistance: "0%" }}
          animate={{ offsetDistance: "100%" }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            offsetPath: `path('${path}')`,
            offsetRotate: "auto"
          }}
        />
      )}
    </svg>
  )
}

export default LiquidMorphing
