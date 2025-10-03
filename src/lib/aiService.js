// Service IA pour la Command Palette Magique
import { supabase } from './supabase.js'

class AIService {
  constructor() {
    this.openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY
    this.anthropicApiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY
    this.sessionId = this.generateSessionId()
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Analyse intelligente des commandes utilisateur
  async analyzeCommand(command) {
    const startTime = Date.now()
    
    try {
      // Patterns de commandes prédéfinis pour la démo
      const commandPatterns = {
        theme: {
          patterns: [
            /palette\s+(bleu|blue|océan|ocean)/i,
            /mode\s+(coucher|sunset|soleil)/i,
            /thème\s+(sombre|dark|clair|light)/i,
            /(couleur|color)s?\s+(\w+)/i
          ],
          handler: this.handleThemeCommand.bind(this)
        },
        performance: {
          patterns: [
            /performance/i,
            /système/i,
            /métriques/i,
            /stats/i,
            /vitesse/i
          ],
          handler: this.handlePerformanceCommand.bind(this)
        },
        animation: {
          patterns: [
            /particules/i,
            /animation/i,
            /effet/i,
            /mouvement/i
          ],
          handler: this.handleAnimationCommand.bind(this)
        },
        ai: {
          patterns: [
            /intelligence/i,
            /ia/i,
            /ai/i,
            /orchestr/i,
            /magic/i,
            /magie/i
          ],
          handler: this.handleAICommand.bind(this)
        }
      }

      // Détection du type de commande
      let commandType = 'general'
      let matchedPattern = null

      for (const [type, config] of Object.entries(commandPatterns)) {
        for (const pattern of config.patterns) {
          if (pattern.test(command)) {
            commandType = type
            matchedPattern = pattern
            break
          }
        }
        if (matchedPattern) break
      }

      // Exécution de la commande
      const result = await commandPatterns[commandType]?.handler(command, matchedPattern) || 
                    await this.handleGeneralCommand(command)

      const executionTime = Date.now() - startTime

      // Enregistrement de l'interaction
      await this.recordInteraction(command, result, executionTime)

      return {
        success: true,
        type: commandType,
        result,
        executionTime,
        sessionId: this.sessionId
      }

    } catch (error) {
      console.error('Erreur lors de l\'analyse de la commande:', error)
      return {
        success: false,
        error: error.message,
        executionTime: Date.now() - startTime
      }
    }
  }

  // Gestion des commandes de thème
  async handleThemeCommand(command, pattern) {
    const themes = {
      'bleu': {
        name: 'ocean_blue',
        colors: {
          primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          secondary: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
          accent: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          glass: 'rgba(102, 126, 234, 0.1)'
        },
        message: 'Transition vers la palette bleu océan en cours...'
      },
      'coucher': {
        name: 'sunset_mode',
        colors: {
          primary: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          secondary: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
          accent: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          glass: 'rgba(250, 112, 154, 0.1)'
        },
        message: 'Morphing vers le mode coucher de soleil...'
      },
      'sombre': {
        name: 'dark_mode',
        colors: {
          primary: 'linear-gradient(135deg, #2d1b69 0%, #11998e 100%)',
          secondary: 'linear-gradient(135deg, #0f0c29 0%, #24243e 100%)',
          accent: 'linear-gradient(135deg, #8360c3 0%, #2ebf91 100%)',
          background: 'linear-gradient(135deg, #0f0c29 0%, #24243e 100%)',
          glass: 'rgba(45, 27, 105, 0.1)'
        },
        message: 'Activation du mode sombre élégant...'
      }
    }

    // Détection du thème demandé
    let selectedTheme = themes['bleu'] // défaut
    for (const [key, theme] of Object.entries(themes)) {
      if (command.toLowerCase().includes(key)) {
        selectedTheme = theme
        break
      }
    }

    return {
      action: 'change_theme',
      theme: selectedTheme,
      animation: {
        duration: 1200,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
      },
      message: selectedTheme.message
    }
  }

  // Gestion des commandes de performance
  async handlePerformanceCommand(command) {
    const metrics = await this.getSystemMetrics()
    
    return {
      action: 'show_performance',
      metrics,
      animation: {
        type: 'slide_up',
        duration: 800
      },
      message: 'Affichage des métriques système en temps réel'
    }
  }

  // Gestion des commandes d'animation
  async handleAnimationCommand(command) {
    const animationConfigs = {
      'intense': { count: 120, speed: 0.8, size: { min: 1, max: 4 } },
      'subtil': { count: 30, speed: 0.3, size: { min: 1, max: 2 } },
      'normal': { count: 50, speed: 0.5, size: { min: 1, max: 3 } }
    }

    let config = animationConfigs['normal']
    if (command.includes('intense') || command.includes('fort')) {
      config = animationConfigs['intense']
    } else if (command.includes('subtil') || command.includes('léger')) {
      config = animationConfigs['subtil']
    }

    return {
      action: 'update_particles',
      config,
      message: `Ajustement des particules: ${config.count} particules actives`
    }
  }

  // Gestion des commandes IA
  async handleAICommand(command) {
    return {
      action: 'ai_response',
      message: 'Intelligence Orchestrée activée',
      response: `L'IA analyse votre demande "${command}" et adapte l'interface en conséquence. Cette démonstration montre comment l'Intelligence Orchestrée peut transformer l'expérience utilisateur en temps réel.`,
      animation: {
        type: 'neural_network',
        duration: 2000
      }
    }
  }

  // Gestion des commandes générales avec IA
  async handleGeneralCommand(command) {
    // Simulation d'une réponse IA intelligente
    const responses = [
      {
        message: 'Commande analysée par l\'Intelligence Orchestrée',
        response: `Je comprends que vous souhaitez "${command}". L'interface s'adapte à votre intention.`,
        action: 'adaptive_response'
      },
      {
        message: 'Traitement contextuel en cours...',
        response: `Votre demande "${command}" est unique. L'IA orchestre une réponse personnalisée.`,
        action: 'contextual_adaptation'
      }
    ]

    return responses[Math.floor(Math.random() * responses.length)]
  }

  // Récupération des métriques système
  async getSystemMetrics() {
    const performance = window.performance
    const navigation = performance.getEntriesByType('navigation')[0]
    
    return {
      loadTime: Math.round(navigation?.loadEventEnd - navigation?.loadEventStart) || 0,
      domContentLoaded: Math.round(navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart) || 0,
      memoryUsage: performance.memory ? {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      } : null,
      fps: this.calculateFPS(),
      timestamp: Date.now()
    }
  }

  // Calcul approximatif des FPS
  calculateFPS() {
    return Math.floor(Math.random() * 10) + 55 // Simulation 55-65 FPS
  }

  // Enregistrement des interactions
  async recordInteraction(command, result, executionTime) {
    try {
      await supabase
        .from('command_interactions')
        .insert({
          command,
          parameters: { type: result.action || 'unknown' },
          result: { 
            success: true, 
            message: result.message,
            action: result.action 
          },
          execution_time: executionTime,
          session_id: this.sessionId
        })
    } catch (error) {
      console.log('Interaction enregistrée localement:', { command, result, executionTime })
    }
  }

  // Simulation d'appel OpenAI (pour la démo)
  async callOpenAI(prompt) {
    // En production, ceci ferait un vrai appel à l'API OpenAI
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          choices: [{
            message: {
              content: `Réponse simulée OpenAI pour: "${prompt}"`
            }
          }]
        })
      }, 800)
    })
  }

  // Simulation d'appel Anthropic (pour la démo)
  async callAnthropic(prompt) {
    // En production, ceci ferait un vrai appel à l'API Anthropic
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          content: [{
            text: `Réponse simulée Anthropic pour: "${prompt}"`
          }]
        })
      }, 900)
    })
  }
}

export const aiService = new AIService()
export default aiService
