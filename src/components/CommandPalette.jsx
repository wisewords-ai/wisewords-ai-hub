import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Command, 
  Search, 
  Sparkles, 
  Zap, 
  Palette, 
  Activity,
  Brain,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import aiService from '@/lib/aiService.js'

const CommandPalette = ({ isOpen, onClose, onThemeChange, onMetricsShow, onParticlesUpdate }) => {
  const [query, setQuery] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [lastResponse, setLastResponse] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const inputRef = useRef(null)

  // Suggestions prédéfinies
  const defaultSuggestions = [
    {
      icon: Palette,
      text: 'Palette bleu océan',
      description: 'Transition fluide vers les couleurs océaniques',
      category: 'Thème'
    },
    {
      icon: Palette,
      text: 'Mode coucher de soleil',
      description: 'Morphing complet vers les teintes chaudes',
      category: 'Thème'
    },
    {
      icon: Activity,
      text: 'Performances système',
      description: 'Afficher les métriques live animées',
      category: 'Système'
    },
    {
      icon: Sparkles,
      text: 'Particules intenses',
      description: 'Augmenter l\'intensité des animations',
      category: 'Animation'
    },
    {
      icon: Brain,
      text: 'Intelligence Orchestrée',
      description: 'Démonstration des capacités adaptatives',
      category: 'IA'
    },
    {
      icon: Zap,
      text: 'Mode performance',
      description: 'Optimiser pour la vitesse maximale',
      category: 'Système'
    }
  ]

  // Focus automatique à l'ouverture
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
      setSuggestions(defaultSuggestions)
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Gestion des raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => 
            prev < (suggestions.length - 1) ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : suggestions.length - 1
          )
          break
        case 'Enter':
          e.preventDefault()
          if (suggestions[selectedIndex]) {
            handleExecuteCommand(suggestions[selectedIndex].text)
          } else if (query.trim()) {
            handleExecuteCommand(query)
          }
          break
        case 'Escape':
          onClose()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, suggestions, query])

  // Filtrage des suggestions en temps réel
  useEffect(() => {
    if (query.trim()) {
      const filtered = defaultSuggestions.filter(suggestion =>
        suggestion.text.toLowerCase().includes(query.toLowerCase()) ||
        suggestion.description.toLowerCase().includes(query.toLowerCase()) ||
        suggestion.category.toLowerCase().includes(query.toLowerCase())
      )
      setSuggestions(filtered)
      setSelectedIndex(0)
    } else {
      setSuggestions(defaultSuggestions)
      setSelectedIndex(0)
    }
  }, [query])

  // Exécution des commandes
  const handleExecuteCommand = async (command) => {
    setIsProcessing(true)
    setLastResponse(null)

    try {
      const response = await aiService.analyzeCommand(command)
      
      if (response.success) {
        setLastResponse({
          type: 'success',
          message: response.result.message,
          action: response.result.action,
          executionTime: response.executionTime
        })

        // Exécution des actions selon le type
        switch (response.result.action) {
          case 'change_theme':
            onThemeChange?.(response.result.theme)
            break
          case 'show_performance':
            onMetricsShow?.(response.result.metrics)
            break
          case 'update_particles':
            onParticlesUpdate?.(response.result.config)
            break
          case 'ai_response':
          case 'adaptive_response':
          case 'contextual_adaptation':
            // Affichage de la réponse IA
            break
        }

        // Fermeture automatique après succès (sauf pour les réponses IA)
        if (!['ai_response', 'adaptive_response', 'contextual_adaptation'].includes(response.result.action)) {
          setTimeout(() => {
            onClose()
            setQuery('')
            setLastResponse(null)
          }, 2000)
        }
      } else {
        setLastResponse({
          type: 'error',
          message: response.error || 'Erreur lors du traitement de la commande'
        })
      }
    } catch (error) {
      setLastResponse({
        type: 'error',
        message: 'Erreur de connexion au service IA'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.text)
    handleExecuteCommand(suggestion.text)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="liquid-glass rounded-3xl w-full max-w-2xl mx-4 overflow-hidden"
          initial={{ scale: 0.9, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: -20 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <Command className="w-6 h-6 text-blue-400" />
                {isProcessing && (
                  <motion.div
                    className="absolute inset-0"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="w-6 h-6 text-purple-400" />
                  </motion.div>
                )}
              </div>
              <h3 className="text-2xl font-bold iridescent-text">
                Command Palette IA
              </h3>
              <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Intelligence Orchestrée Active
              </div>
            </div>

            {/* Input de recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tapez votre commande magique..."
                className="pl-10 pr-4 py-3 bg-white/5 border-white/20 rounded-xl text-lg"
                disabled={isProcessing}
              />
              {isProcessing && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                </div>
              )}
            </div>
          </div>

          {/* Réponse de l'IA */}
          <AnimatePresence>
            {lastResponse && (
              <motion.div
                className={`p-4 border-b border-white/10 ${
                  lastResponse.type === 'success' ? 'bg-green-500/10' : 'bg-red-500/10'
                }`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="flex items-start gap-3">
                  {lastResponse.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{lastResponse.message}</p>
                    {lastResponse.executionTime && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Exécuté en {lastResponse.executionTime}ms
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Suggestions */}
          <div className="max-h-96 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion.text}
                className={`p-4 cursor-pointer transition-colors ${
                  index === selectedIndex 
                    ? 'bg-white/10 border-l-2 border-blue-400' 
                    : 'hover:bg-white/5'
                }`}
                onClick={() => handleSuggestionClick(suggestion)}
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    suggestion.category === 'Thème' ? 'bg-purple-500/20' :
                    suggestion.category === 'Système' ? 'bg-blue-500/20' :
                    suggestion.category === 'Animation' ? 'bg-pink-500/20' :
                    'bg-green-500/20'
                  }`}>
                    <suggestion.icon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{suggestion.text}</span>
                      <span className="text-xs px-2 py-1 bg-white/10 rounded-full">
                        {suggestion.category}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {suggestion.description}
                    </p>
                  </div>

                  {index === selectedIndex && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 bg-blue-400 rounded-full"
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 bg-white/5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>↑↓ Naviguer</span>
                <span>↵ Exécuter</span>
                <span>Esc Fermer</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Powered by</span>
                <span className="font-semibold text-blue-400">OpenAI</span>
                <span>&</span>
                <span className="font-semibold text-purple-400">Anthropic</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default CommandPalette
