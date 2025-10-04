'use client'

import { useCallback, useEffect, useState } from 'react'

export interface NexusAnimationConfig {
  duration?: 'fast' | 'normal' | 'slow'
  easing?: 'default' | 'out' | 'in'
  delay?: number
}

export function useNexusAnimations() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Get CSS animation properties
  const getAnimationProps = useCallback((config: NexusAnimationConfig = {}) => {
    const { duration = 'normal', easing = 'default', delay = 0 } = config

    if (prefersReducedMotion) {
      return {
        transition: 'none',
        animation: 'none'
      }
    }

    const durationMap = {
      fast: 'var(--nexus-duration-fast)',
      normal: 'var(--nexus-duration-normal)',
      slow: 'var(--nexus-duration-slow)'
    }

    const easingMap = {
      default: 'var(--nexus-easing-default)',
      out: 'var(--nexus-easing-out)',
      in: 'var(--nexus-easing-in)'
    }

    return {
      transitionDuration: durationMap[duration],
      transitionTimingFunction: easingMap[easing],
      transitionDelay: delay ? `${delay}ms` : '0ms'
    }
  }, [prefersReducedMotion])

  // Animate element entrance
  const animateEntrance = useCallback((element: HTMLElement, config: NexusAnimationConfig = {}) => {
    if (prefersReducedMotion) return

    const { duration = 'normal', delay = 0 } = config
    
    element.style.opacity = '0'
    element.style.transform = 'translateY(20px)'
    
    setTimeout(() => {
      element.style.transition = `opacity ${getAnimationProps(config).transitionDuration} var(--nexus-easing-out), transform ${getAnimationProps(config).transitionDuration} var(--nexus-easing-out)`
      element.style.opacity = '1'
      element.style.transform = 'translateY(0)'
    }, delay)
  }, [prefersReducedMotion, getAnimationProps])

  // Animate element exit
  const animateExit = useCallback((element: HTMLElement, config: NexusAnimationConfig = {}) => {
    if (prefersReducedMotion) {
      element.style.display = 'none'
      return Promise.resolve()
    }

    return new Promise<void>((resolve) => {
      element.style.transition = `opacity ${getAnimationProps(config).transitionDuration} var(--nexus-easing-in), transform ${getAnimationProps(config).transitionDuration} var(--nexus-easing-in)`
      element.style.opacity = '0'
      element.style.transform = 'translateY(-20px)'
      
      setTimeout(() => {
        element.style.display = 'none'
        resolve()
      }, config.duration === 'fast' ? 150 : config.duration === 'slow' ? 500 : 300)
    })
  }, [prefersReducedMotion, getAnimationProps])

  // Hover animation helper
  const createHoverAnimation = useCallback((config: NexusAnimationConfig = {}) => {
    if (prefersReducedMotion) {
      return {
        onMouseEnter: () => {},
        onMouseLeave: () => {},
        style: {}
      }
    }

    return {
      onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
        const element = e.currentTarget
        element.style.transform = 'translateY(-2px) scale(1.02)'
      },
      onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
        const element = e.currentTarget
        element.style.transform = 'translateY(0) scale(1)'
      },
      style: {
        transition: `transform ${getAnimationProps(config).transitionDuration} var(--nexus-easing-default)`
      }
    }
  }, [prefersReducedMotion, getAnimationProps])

  // Loading animation classes
  const getLoadingClasses = useCallback(() => {
    if (prefersReducedMotion) return ''
    return 'nexus-animate-pulse'
  }, [prefersReducedMotion])

  // Slide up animation classes
  const getSlideUpClasses = useCallback(() => {
    if (prefersReducedMotion) return ''
    return 'nexus-animate-slide-up'
  }, [prefersReducedMotion])

  // Fade in animation classes
  const getFadeInClasses = useCallback(() => {
    if (prefersReducedMotion) return ''
    return 'nexus-animate-fade-in'
  }, [prefersReducedMotion])

  return {
    prefersReducedMotion,
    getAnimationProps,
    animateEntrance,
    animateExit,
    createHoverAnimation,
    getLoadingClasses,
    getSlideUpClasses,
    getFadeInClasses
  }
}