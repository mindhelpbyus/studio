'use client'

import { useState, useEffect, useCallback } from 'react'
import { GrokThemeMode } from '@/types/grok-theme'

export function useGrokTheme() {
  const [theme, setTheme] = useState<GrokThemeMode>('dark')
  const [isLoading, setIsLoading] = useState(true)

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const initializeTheme = () => {
      try {
        // Check localStorage first
        const savedTheme = localStorage.getItem('grok-theme') as GrokThemeMode
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
          setTheme(savedTheme)
          applyTheme(savedTheme)
        } else {
          // Fall back to system preference, defaulting to dark (Grok's primary theme)
          const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          const defaultTheme: GrokThemeMode = systemPrefersDark ? 'dark' : 'dark' // Always default to dark for Grok aesthetic
          setTheme(defaultTheme)
          applyTheme(defaultTheme)
        }
      } catch (error) {
        console.warn('Failed to initialize theme:', error)
        setTheme('dark')
        applyTheme('dark')
      } finally {
        setIsLoading(false)
      }
    }

    initializeTheme()
  }, [])

  // Apply theme to document
  const applyTheme = useCallback((newTheme: GrokThemeMode) => {
    const root = document.documentElement
    
    if (newTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    
    // Store in localStorage
    try {
      localStorage.setItem('grok-theme', newTheme)
    } catch (error) {
      console.warn('Failed to save theme preference:', error)
    }
  }, [])

  // Toggle between light and dark themes
  const toggleTheme = useCallback(() => {
    const newTheme: GrokThemeMode = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    applyTheme(newTheme)
  }, [theme, applyTheme])

  // Set specific theme
  const setThemeMode = useCallback((newTheme: GrokThemeMode) => {
    setTheme(newTheme)
    applyTheme(newTheme)
  }, [applyTheme])

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't manually set a preference
      const savedTheme = localStorage.getItem('grok-theme')
      if (!savedTheme) {
        const systemTheme: GrokThemeMode = e.matches ? 'dark' : 'dark' // Always prefer dark
        setTheme(systemTheme)
        applyTheme(systemTheme)
      }
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange)
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange)
  }, [applyTheme])

  return {
    theme,
    isLoading,
    toggleTheme,
    setTheme: setThemeMode,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  }
}