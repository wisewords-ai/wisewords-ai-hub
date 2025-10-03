import { useEffect, useState, useCallback, useMemo } from 'react'

// Hook pour détecter les capacités de l'appareil
export const useDeviceCapabilities = () => {
  const [capabilities, setCapabilities] = useState({
    isHighPerformance: true,
    supportsWebGL: false,
    supportsBackdropFilter: false,
    prefersReducedMotion: false,
    isLowPowerMode: false,
    connectionSpeed: 'fast',
    deviceMemory: 4,
    hardwareConcurrency: 4
  })

  useEffect(() => {
    const detectCapabilities = () => {
      // Détection WebGL
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      const supportsWebGL = !!gl

      // Détection backdrop-filter
      const supportsBackdropFilter = CSS.supports('backdrop-filter', 'blur(1px)') || 
                                   CSS.supports('-webkit-backdrop-filter', 'blur(1px)')

      // Détection prefers-reduced-motion
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      // Détection des performances de l'appareil
      const deviceMemory = navigator.deviceMemory || 4
      const hardwareConcurrency = navigator.hardwareConcurrency || 4
      
      // Estimation des performances basée sur les specs
      const isHighPerformance = deviceMemory >= 4 && hardwareConcurrency >= 4

      // Détection de la vitesse de connexion
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
      let connectionSpeed = 'fast'
      
      if (connection) {
        if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
          connectionSpeed = 'slow'
        } else if (connection.effectiveType === '3g') {
          connectionSpeed = 'medium'
        }
      }

      // Détection du mode économie d'énergie (approximatif)
      const isLowPowerMode = deviceMemory < 2 || hardwareConcurrency < 2

      setCapabilities({
        isHighPerformance,
        supportsWebGL,
        supportsBackdropFilter,
        prefersReducedMotion,
        isLowPowerMode,
        connectionSpeed,
        deviceMemory,
        hardwareConcurrency
      })
    }

    detectCapabilities()

    // Écouter les changements de préférences
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = () => detectCapabilities()
    
    mediaQuery.addEventListener('change', handleChange)
    
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return capabilities
}

// Hook pour l'optimisation adaptative des performances
export const useAdaptivePerformance = () => {
  const capabilities = useDeviceCapabilities()
  const [performanceLevel, setPerformanceLevel] = useState('high')

  const optimizationSettings = useMemo(() => {
    if (capabilities.prefersReducedMotion) {
      return {
        level: 'minimal',
        particleCount: 0,
        animationDuration: 0,
        blurIntensity: 0,
        enableLiquidEffects: false,
        enableParticles: false,
        enableMorphing: false
      }
    }

    if (capabilities.isLowPowerMode || capabilities.connectionSpeed === 'slow') {
      return {
        level: 'low',
        particleCount: 10,
        animationDuration: 2,
        blurIntensity: 5,
        enableLiquidEffects: false,
        enableParticles: true,
        enableMorphing: false
      }
    }

    if (!capabilities.isHighPerformance || capabilities.connectionSpeed === 'medium') {
      return {
        level: 'medium',
        particleCount: 25,
        animationDuration: 1.5,
        blurIntensity: 10,
        enableLiquidEffects: true,
        enableParticles: true,
        enableMorphing: true
      }
    }

    return {
      level: 'high',
      particleCount: 60,
      animationDuration: 1,
      blurIntensity: 20,
      enableLiquidEffects: true,
      enableParticles: true,
      enableMorphing: true
    }
  }, [capabilities])

  useEffect(() => {
    setPerformanceLevel(optimizationSettings.level)
  }, [optimizationSettings])

  return { capabilities, optimizationSettings, performanceLevel }
}

// Hook pour le lazy loading intelligent
export const useLazyLoading = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false)
  const [ref, setRef] = useState(null)

  useEffect(() => {
    if (!ref) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(ref)
        }
      },
      { threshold }
    )

    observer.observe(ref)

    return () => {
      if (ref) observer.unobserve(ref)
    }
  }, [ref, threshold])

  return [setRef, isVisible]
}

// Hook pour la gestion de la mémoire des animations
export const useAnimationMemoryManager = () => {
  const [activeAnimations, setActiveAnimations] = useState(new Set())

  const registerAnimation = useCallback((id) => {
    setActiveAnimations(prev => new Set([...prev, id]))
  }, [])

  const unregisterAnimation = useCallback((id) => {
    setActiveAnimations(prev => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
  }, [])

  const cleanupAllAnimations = useCallback(() => {
    setActiveAnimations(new Set())
  }, [])

  // Nettoyage automatique si trop d'animations actives
  useEffect(() => {
    if (activeAnimations.size > 10) {
      console.warn('Trop d\'animations actives, nettoyage automatique')
      cleanupAllAnimations()
    }
  }, [activeAnimations.size, cleanupAllAnimations])

  return {
    activeAnimations,
    registerAnimation,
    unregisterAnimation,
    cleanupAllAnimations,
    animationCount: activeAnimations.size
  }
}

// Composant de monitoring des performances
export const PerformanceMonitor = ({ onMetricsUpdate }) => {
  const [metrics, setMetrics] = useState({
    fps: 60,
    memoryUsage: 0,
    renderTime: 0,
    isOptimal: true
  })

  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()
    let animationId

    const measurePerformance = () => {
      frameCount++
      const currentTime = performance.now()
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
        
        // Estimation de l'utilisation mémoire
        const memoryInfo = performance.memory
        const memoryUsage = memoryInfo ? 
          Math.round((memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize) * 100) : 0

        const newMetrics = {
          fps,
          memoryUsage,
          renderTime: currentTime - lastTime,
          isOptimal: fps >= 55 && memoryUsage < 80
        }

        setMetrics(newMetrics)
        onMetricsUpdate?.(newMetrics)

        frameCount = 0
        lastTime = currentTime
      }

      animationId = requestAnimationFrame(measurePerformance)
    }

    animationId = requestAnimationFrame(measurePerformance)

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [onMetricsUpdate])

  return null // Composant invisible de monitoring
}

// Hook pour l'optimisation des images
export const useImageOptimization = () => {
  const capabilities = useDeviceCapabilities()

  const getOptimizedImageProps = useCallback((src, alt = '') => {
    const isHighDPI = window.devicePixelRatio > 1
    const isSlowConnection = capabilities.connectionSpeed === 'slow'

    return {
      src,
      alt,
      loading: 'lazy',
      decoding: 'async',
      style: {
        imageRendering: isHighDPI ? 'crisp-edges' : 'auto',
        filter: isSlowConnection ? 'blur(0.5px)' : 'none'
      }
    }
  }, [capabilities.connectionSpeed])

  return { getOptimizedImageProps }
}

// Composant d'optimisation automatique
export const AutoOptimizer = ({ children }) => {
  const { optimizationSettings } = useAdaptivePerformance()
  const [isOptimized, setIsOptimized] = useState(false)

  useEffect(() => {
    // Appliquer les optimisations CSS dynamiquement
    const root = document.documentElement

    // Ajuster les variables CSS selon les performances
    root.style.setProperty('--animation-duration', `${optimizationSettings.animationDuration}s`)
    root.style.setProperty('--blur-intensity', `${optimizationSettings.blurIntensity}px`)
    root.style.setProperty('--particle-count', optimizationSettings.particleCount)

    // Désactiver certains effets si nécessaire
    if (!optimizationSettings.enableLiquidEffects) {
      root.style.setProperty('--liquid-effects', 'none')
    }

    if (!optimizationSettings.enableParticles) {
      root.style.setProperty('--particles-display', 'none')
    }

    setIsOptimized(true)
  }, [optimizationSettings])

  if (!isOptimized) {
    return <div className="loading-optimizer">Optimisation en cours...</div>
  }

  return children
}

// Hook pour la gestion des erreurs de performance
export const usePerformanceErrorBoundary = () => {
  const [hasError, setHasError] = useState(false)
  const [errorInfo, setErrorInfo] = useState(null)

  const resetError = useCallback(() => {
    setHasError(false)
    setErrorInfo(null)
  }, [])

  const handleError = useCallback((error, errorInfo) => {
    console.error('Erreur de performance détectée:', error, errorInfo)
    setHasError(true)
    setErrorInfo({ error, errorInfo })
    
    // Basculer automatiquement vers un mode dégradé
    const root = document.documentElement
    root.style.setProperty('--performance-mode', 'degraded')
  }, [])

  return { hasError, errorInfo, resetError, handleError }
}

export default {
  useDeviceCapabilities,
  useAdaptivePerformance,
  useLazyLoading,
  useAnimationMemoryManager,
  PerformanceMonitor,
  useImageOptimization,
  AutoOptimizer,
  usePerformanceErrorBoundary
}
