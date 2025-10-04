'use client'

import { useState, useEffect, useCallback } from 'react'
import { NexusThemeMode } from '@/types/nexus-theme'

export function useNexusTheme() {
  const [theme, setTheme] = useState<NexusThemeMode>('dark')
  const [isLoading, setIsLoading] = useState(true)

  // Initialize theme on mount
  useEffect(() => {
    const initializeTheme = () => {
      try {
        // Check localStorage first
        const savedTheme = localStorage.getItem('nexus-theme') as NexusThemeMode

        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
          setTheme(savedTheme)
          applyTheme(savedTheme)
        } else {
          // Fall back to system preference, defaulting to dark (Nexus's primary theme)
          const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          const defaultTheme: NexusThemeMode = systemPrefersDark ? 'dark' : 'dark' // Always default to dark for Nexus aesthetic

          setTheme(defaultTheme)
          applyTheme(defaultTheme)
        }
      } catch (error) {
        console.warn('Failed to initialize theme:', error)
        // Fallback to dark theme
        setTheme('dark')
        applyTheme('dark')
      } finally {
        setIsLoading(false)
      }
    }

    initializeTheme()
  }, [])

  // Apply theme to document
  const applyTheme = useCallback((newTheme: NexusThemeMode) => {
    const root = document.documentElement
    
    if (newTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // Store in localStorage
    try {
      localStorage.setItem('nexus-theme', newTheme)
    } catch (error) {
      console.warn('Failed to save theme preference:', error)
    }
  }, [])

  // Toggle between light and dark themes
  const toggleTheme = useCallback(() => {
    const newTheme: NexusThemeMode = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    applyTheme(newTheme)
  }, [theme, applyTheme])

  // Set specific theme
  const setThemeMode = useCallback((newTheme: NexusThemeMode) => {
    setTheme(newTheme)
    applyTheme(newTheme)
  }, [applyTheme])

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't manually set a preference
      const savedTheme = localStorage.getItem('nexus-theme')
      
      if (!savedTheme) {
        const systemTheme: NexusThemeMode = e.matches ? 'dark' : 'dark' // Always prefer dark
        setTheme(systemTheme)
        applyTheme(systemTheme)
      }
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange)
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange)
  }, [applyTheme])

  return {
    theme,
    setTheme: setThemeMode,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    isLoading
  }
}