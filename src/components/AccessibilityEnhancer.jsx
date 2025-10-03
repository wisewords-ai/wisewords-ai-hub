import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Hook pour la gestion des préférences d'accessibilité
export const useAccessibilityPreferences = () => {
  const [preferences, setPreferences] = useState({
    prefersReducedMotion: false,
    prefersHighContrast: false,
    prefersLargeText: false,
    prefersReducedTransparency: false,
    colorScheme: 'auto'
  })

  useEffect(() => {
    const updatePreferences = () => {
      setPreferences({
        prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        prefersHighContrast: window.matchMedia('(prefers-contrast: high)').matches,
        prefersLargeText: window.matchMedia('(prefers-reduced-data: reduce)').matches,
        prefersReducedTransparency: window.matchMedia('(prefers-reduced-transparency: reduce)').matches,
        colorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      })
    }

    updatePreferences()

    // Écouter les changements
    const mediaQueries = [
      '(prefers-reduced-motion: reduce)',
      '(prefers-contrast: high)',
      '(prefers-reduced-data: reduce)',
      '(prefers-reduced-transparency: reduce)',
      '(prefers-color-scheme: dark)'
    ]

    const listeners = mediaQueries.map(query => {
      const mq = window.matchMedia(query)
      mq.addEventListener('change', updatePreferences)
      return { mq, listener: updatePreferences }
    })

    return () => {
      listeners.forEach(({ mq, listener }) => {
        mq.removeEventListener('change', listener)
      })
    }
  }, [])

  return preferences
}

// Hook pour la navigation au clavier
export const useKeyboardNavigation = () => {
  const [focusedElement, setFocusedElement] = useState(null)
  const [isKeyboardUser, setIsKeyboardUser] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        setIsKeyboardUser(true)
        document.body.classList.add('keyboard-navigation')
      }
    }

    const handleMouseDown = () => {
      setIsKeyboardUser(false)
      document.body.classList.remove('keyboard-navigation')
    }

    const handleFocus = (e) => {
      if (isKeyboardUser) {
        setFocusedElement(e.target)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('focusin', handleFocus)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('focusin', handleFocus)
    }
  }, [isKeyboardUser])

  return { focusedElement, isKeyboardUser }
}

// Hook pour les annonces aux lecteurs d'écran
export const useScreenReaderAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([])
  const announcementRef = useRef(null)

  const announce = useCallback((message, priority = 'polite') => {
    const id = Date.now()
    const announcement = { id, message, priority }
    
    setAnnouncements(prev => [...prev, announcement])

    // Supprimer l'annonce après un délai
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a.id !== id))
    }, 3000)
  }, [])

  const AnnouncementRegion = () => (
    <div
      ref={announcementRef}
      className="sr-only"
      aria-live="polite"
      aria-atomic="true"
    >
      {announcements.map(announcement => (
        <div key={announcement.id} aria-live={announcement.priority}>
          {announcement.message}
        </div>
      ))}
    </div>
  )

  return { announce, AnnouncementRegion }
}

// Hook pour la gestion du focus
export const useFocusManagement = () => {
  const [focusTrap, setFocusTrap] = useState(null)
  const previousFocus = useRef(null)

  const trapFocus = useCallback((container) => {
    if (!container) return

    previousFocus.current = document.activeElement
    setFocusTrap(container)

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)
    firstElement?.focus()

    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  }, [])

  const releaseFocus = useCallback(() => {
    setFocusTrap(null)
    if (previousFocus.current) {
      previousFocus.current.focus()
      previousFocus.current = null
    }
  }, [])

  return { trapFocus, releaseFocus, focusTrap }
}

// Composant de skip links
export const SkipLinks = () => {
  const [isVisible, setIsVisible] = useState(false)

  const skipLinks = [
    { href: '#main-content', text: 'Aller au contenu principal' },
    { href: '#navigation', text: 'Aller à la navigation' },
    { href: '#footer', text: 'Aller au pied de page' }
  ]

  return (
    <div className="skip-links">
      {skipLinks.map((link, index) => (
        <a
          key={index}
          href={link.href}
          className={`skip-link ${isVisible ? 'visible' : ''}`}
          onFocus={() => setIsVisible(true)}
          onBlur={() => setIsVisible(false)}
        >
          {link.text}
        </a>
      ))}
    </div>
  )
}

// Composant d'indicateur de focus visible
export const FocusIndicator = () => {
  const { isKeyboardUser } = useKeyboardNavigation()

  useEffect(() => {
    if (isKeyboardUser) {
      document.body.classList.add('show-focus-indicators')
    } else {
      document.body.classList.remove('show-focus-indicators')
    }
  }, [isKeyboardUser])

  return null
}

// Hook pour les descriptions alternatives dynamiques
export const useDynamicAltText = () => {
  const generateAltText = useCallback((context, element) => {
    // Génération intelligente de texte alternatif basé sur le contexte
    if (context === 'decorative') {
      return ''
    }
    
    if (context === 'functional') {
      return element.action || 'Élément interactif'
    }
    
    if (context === 'informative') {
      return element.description || 'Image informative'
    }
    
    return 'Image'
  }, [])

  return { generateAltText }
}

// Composant de contrôles d'accessibilité
export const AccessibilityControls = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [settings, setSettings] = useState({
    fontSize: 100,
    contrast: 100,
    animationsEnabled: true,
    soundEnabled: true
  })

  const preferences = useAccessibilityPreferences()

  useEffect(() => {
    // Appliquer les préférences système
    if (preferences.prefersReducedMotion) {
      setSettings(prev => ({ ...prev, animationsEnabled: false }))
    }
    if (preferences.prefersHighContrast) {
      setSettings(prev => ({ ...prev, contrast: 150 }))
    }
  }, [preferences])

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    
    // Appliquer les changements au DOM
    const root = document.documentElement
    
    switch (key) {
      case 'fontSize':
        root.style.setProperty('--font-size-multiplier', value / 100)
        break
      case 'contrast':
        root.style.setProperty('--contrast-multiplier', value / 100)
        break
      case 'animationsEnabled':
        root.style.setProperty('--animations-enabled', value ? '1' : '0')
        break
    }
  }

  return (
    <>
      <button
        className="accessibility-toggle fixed bottom-4 right-4 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Ouvrir les contrôles d'accessibilité"
        aria-expanded={isOpen}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="accessibility-panel fixed bottom-20 right-4 z-50 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl border max-w-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            role="dialog"
            aria-label="Contrôles d'accessibilité"
          >
            <h3 className="text-lg font-semibold mb-4">Accessibilité</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="font-size" className="block text-sm font-medium mb-2">
                  Taille du texte: {settings.fontSize}%
                </label>
                <input
                  id="font-size"
                  type="range"
                  min="75"
                  max="150"
                  value={settings.fontSize}
                  onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="contrast" className="block text-sm font-medium mb-2">
                  Contraste: {settings.contrast}%
                </label>
                <input
                  id="contrast"
                  type="range"
                  min="50"
                  max="200"
                  value={settings.contrast}
                  onChange={(e) => updateSetting('contrast', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor="animations" className="text-sm font-medium">
                  Animations
                </label>
                <input
                  id="animations"
                  type="checkbox"
                  checked={settings.animationsEnabled}
                  onChange={(e) => updateSetting('animationsEnabled', e.target.checked)}
                  className="rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor="sound" className="text-sm font-medium">
                  Sons
                </label>
                <input
                  id="sound"
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
                  className="rounded"
                />
              </div>
            </div>

            <button
              className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Fermer
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Hook pour la validation WCAG
export const useWCAGValidation = () => {
  const [violations, setViolations] = useState([])

  const validateElement = useCallback((element) => {
    const issues = []

    // Vérifier le contraste des couleurs
    const style = window.getComputedStyle(element)
    const color = style.color
    const backgroundColor = style.backgroundColor
    
    // Vérifier les attributs alt manquants
    if (element.tagName === 'IMG' && !element.alt) {
      issues.push({
        type: 'missing-alt',
        message: 'Image sans attribut alt',
        element
      })
    }

    // Vérifier les labels manquants
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName)) {
      const label = document.querySelector(`label[for="${element.id}"]`)
      if (!label && !element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
        issues.push({
          type: 'missing-label',
          message: 'Élément de formulaire sans label',
          element
        })
      }
    }

    return issues
  }, [])

  const validatePage = useCallback(() => {
    const allElements = document.querySelectorAll('*')
    const allIssues = []

    allElements.forEach(element => {
      const issues = validateElement(element)
      allIssues.push(...issues)
    })

    setViolations(allIssues)
    return allIssues
  }, [validateElement])

  return { violations, validateElement, validatePage }
}

export default {
  useAccessibilityPreferences,
  useKeyboardNavigation,
  useScreenReaderAnnouncements,
  useFocusManagement,
  SkipLinks,
  FocusIndicator,
  useDynamicAltText,
  AccessibilityControls,
  useWCAGValidation
}
