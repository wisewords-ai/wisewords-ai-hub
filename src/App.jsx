import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Command, Sparkles, Brain, Zap, Globe, Star } from 'lucide-react'
import { LiquidCanvas, LiquidMorph, LiquidThemeTransition } from './components/LiquidAnimations'
import { AutoOptimizer, PerformanceMonitor, useAdaptivePerformance } from './components/PerformanceOptimizer'
import { SkipLinks, FocusIndicator, AccessibilityControls, useScreenReaderAnnouncements } from './components/AccessibilityEnhancer'
import './App.css'

// Composant Particules Organiques simplifié
const ParticleField = ({ count = 50 }) => {
  const [particles, setParticles] = useState([])
  
  useEffect(() => {
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 6,
      duration: Math.random() * 4 + 4
    }))
    setParticles(newParticles)
  }, [count])
  
  return (
    <div className="particle-field absolute inset-0 pointer-events-none">
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="particle absolute"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
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
    </div>
  )
}

// Composant Command Palette Trigger simplifié
const CommandPaletteTrigger = ({ onOpen }) => {
  return (
    <motion.div
      className="command-palette-trigger liquid-glass hover-lift cursor-pointer"
      onClick={onOpen}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-3">
        <Command className="w-5 h-5" />
        <span>Commande Magique</span>
        <div className="flex gap-1 ml-auto">
          <kbd className="px-2 py-1 text-xs bg-white/20 rounded">⌘</kbd>
          <kbd className="px-2 py-1 text-xs bg-white/20 rounded">K</kbd>
        </div>
      </div>
    </motion.div>
  )
}

// Composant Hero Section
const HeroSection = ({ onCommandOpen, optimizationSettings }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {optimizationSettings.enableParticles && (
        <LiquidCanvas 
          particleCount={optimizationSettings.particleCount} 
          viscosity={0.9}
          attraction={0.15}
          repulsion={0.2}
          className="opacity-80"
        />
      )}
      
      {/* Background morphing */}
      <div className="absolute inset-0 morphing-background opacity-60" />
      
      {/* Liquid Glass Container */}
      <LiquidMorph 
        isActive={true}
        morphType="organic"
        speed={0.8}
        className="max-w-4xl mx-auto relative z-10"
      >
        <motion.div 
          className="liquid-glass p-12 rounded-3xl text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
        {/* Logo et titre */}
        <motion.div
          className="mb-8"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <Star className="w-12 h-12 text-blue-400" />
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-12 h-12 text-purple-400" />
              </motion.div>
            </div>
            <h1 className="text-6xl font-bold iridescent-text">
              WiseWords-AI Hub
            </h1>
          </div>
          
          <motion.p 
            className="text-2xl text-muted-foreground mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            L'Intelligence Orchestrée en Action
          </motion.p>
        </motion.div>
        
        {/* Description magique */}
        <motion.div 
          className="mb-12 space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <p className="text-lg leading-relaxed">
            Découvrez la première démonstration au monde d'<strong>Intelligence Orchestrée</strong> 
            qui s'adapte comme un matériau vivant à vos besoins.
          </p>
          <p className="text-base text-muted-foreground">
            Chaque interaction transforme l'interface en temps réel, 
            créant une expérience unique qui évolue avec vous.
          </p>
        </motion.div>
        
        {/* Command Palette Trigger */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <CommandPaletteTrigger onOpen={onCommandOpen} />
          <p className="text-sm text-muted-foreground mt-4">
            Essayez : "Palette bleu océan", "Mode coucher de soleil", "Performances système"
          </p>
        </motion.div>
        </motion.div>
      </LiquidMorph>
    </section>
  )
}

// Composant Features Section
const FeaturesSection = () => {
  const features = [
    {
      icon: Brain,
      title: "Intelligence Orchestrée",
      description: "IA qui comprend le contexte et s'adapte en temps réel à vos besoins spécifiques.",
      gradient: "from-blue-400 to-purple-600"
    },
    {
      icon: Zap,
      title: "Réactivité Instantanée",
      description: "Performances optimisées < 100ms avec animations fluides et interactions naturelles.",
      gradient: "from-purple-400 to-pink-600"
    },
    {
      icon: Globe,
      title: "Écosystème Connecté",
      description: "Intégration native avec Supabase, OpenAI, Anthropic et services MCP.",
      gradient: "from-pink-400 to-orange-600"
    }
  ]
  
  return (
    <section className="py-24 relative">
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2 
          className="text-4xl font-bold text-center mb-16 iridescent-text"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Magie Technologique Révolutionnaire
        </motion.h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="liquid-glass p-8 rounded-2xl hover-lift"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} p-4 mb-6`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Modal Command Palette simplifié
const SimpleCommandPalette = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="liquid-glass p-8 rounded-3xl max-w-2xl w-full"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-2xl font-bold mb-4 iridescent-text">
            Command Palette IA
          </h3>
          <p className="text-muted-foreground mb-6">
            Prochainement : Interface magique avec OpenAI et Anthropic
          </p>
          <div className="space-y-3">
            <div className="p-3 bg-white/10 rounded-lg">
              <code>"Palette bleu océan"</code> → Transition fluide des couleurs
            </div>
            <div className="p-3 bg-white/10 rounded-lg">
              <code>"Performances système"</code> → Métriques live animées
            </div>
            <div className="p-3 bg-white/10 rounded-lg">
              <code>"Mode coucher de soleil"</code> → Morphing complet du thème
            </div>
          </div>
          
          <button 
            className="mt-6 w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
            onClick={onClose}
          >
            Fermer (Esc)
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Composant principal App
function App() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [themeTransitioning, setThemeTransitioning] = useState(false)
  const [currentTheme, setCurrentTheme] = useState({
    primary: '#667eea',
    secondary: '#764ba2'
  })
  const [metrics, setMetrics] = useState({
    interactions: 0,
    performance: 98,
    adaptations: 0
  })

  // Hooks d'optimisation
  const { optimizationSettings, performanceLevel } = useAdaptivePerformance()
  const { announce, AnnouncementRegion } = useScreenReaderAnnouncements()

  // Mise à jour des métriques de performance
  const handleMetricsUpdate = (newMetrics) => {
    setMetrics(prev => ({
      ...prev,
      performance: newMetrics.fps > 55 ? Math.min(98, prev.performance + 1) : Math.max(60, prev.performance - 2)
    }))
  }
  
  // Gestion des raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
  
  const handleCommandOpen = () => {
    setCommandPaletteOpen(true)
    setMetrics(prev => ({ ...prev, interactions: prev.interactions + 1 }))
  }
  
  return (
    <AutoOptimizer>
      <SkipLinks />
      <FocusIndicator />
      <PerformanceMonitor onMetricsUpdate={handleMetricsUpdate} />
      <AnnouncementRegion />
      
      <LiquidThemeTransition
        isTransitioning={themeTransitioning}
        fromTheme={currentTheme}
        toTheme={currentTheme}
        onComplete={() => setThemeTransitioning(false)}
      >
        <div className="min-h-screen relative overflow-x-hidden" id="main-content">
      {/* Navigation fixe avec liquid glass */}
      <motion.nav 
        className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 liquid-glass px-6 py-3 rounded-2xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Star className="w-6 h-6 text-blue-400" />
            <span className="font-semibold">WiseWords-AI</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <a href="#features" className="hover:text-blue-400 transition-colors">
              Fonctionnalités
            </a>
            <a href="#demo" className="hover:text-blue-400 transition-colors">
              Démo Live
            </a>
            <a href="#contact" className="hover:text-blue-400 transition-colors">
              Contact
            </a>
          </div>
          
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>Performance: {metrics.performance}%</span>
            <span className="mx-2">•</span>
            <span>Interactions: {metrics.interactions}</span>
          </div>
        </div>
      </motion.nav>
      
      {/* Contenu principal */}
      <HeroSection onCommandOpen={handleCommandOpen} optimizationSettings={optimizationSettings} />
      <FeaturesSection />
      
      {/* Command Palette simplifié */}
      <SimpleCommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
      
      {/* Footer */}
      <footer className="py-12 text-center text-muted-foreground">
        <div className="max-w-4xl mx-auto px-6">
          <p className="mb-4">
            Créé avec ❤️ par <strong>Jérémy Chamoux</strong> - WiseWords-AI
          </p>
          <p className="text-sm">
            Première démonstration mondiale d'Intelligence Orchestrée • 2025
          </p>
        </div>
      </footer>
        </div>
      </LiquidThemeTransition>
      
      <AccessibilityControls />
    </AutoOptimizer>
  )
}

export default App
