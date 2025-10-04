'use client'

import React, { ReactNode } from 'react'
import { useGrokTheme } from '@/hooks/useGrokTheme'
import { useGrokAnimations } from '@/hooks/useGrokAnimations'
import { cn } from '@/lib/utils'

export interface GrokLayoutProps {
  children: ReactNode
  header?: ReactNode
  sidebar?: ReactNode
  footer?: ReactNode
  className?: string
  sidebarCollapsed?: boolean
  showSidebar?: boolean
}

const GrokLayout: React.FC<GrokLayoutProps> = ({
  children,
  header,
  sidebar,
  footer,
  className,
  sidebarCollapsed = false,
  showSidebar = true
}) => {
  const { theme, isLoading } = useGrokTheme()
  const { getFadeInClasses } = useGrokAnimations()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-grok-bg-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-grok-accent-primary"></div>
      </div>
    )
  }

  const layoutClasses = [
    'min-h-screen',
    'bg-grok-bg-primary',
    'text-grok-text-primary',
    'transition-all',
    'duration-300',
    'ease-out',
    getFadeInClasses()
  ]

  const mainContentClasses = [
    'flex-1',
    'flex',
    'flex-col',
    'transition-all',
    'duration-300',
    'ease-out'
  ]

  const contentAreaClasses = [
    'flex-1',
    'overflow-auto',
    'transition-all',
    'duration-300',
    'ease-out'
  ]

  return (
    <div className={cn(layoutClasses, className)}>
      {/* Header */}
      {header && (
        <header className="sticky top-0 z-40 bg-grok-bg-surface/95 backdrop-blur-sm border-b border-grok-border">
          {header}
        </header>
      )}

      {/* Main Layout */}
      <div className="flex flex-1">
        {/* Sidebar */}
        {showSidebar && sidebar && (
          <aside
            className={cn(
              'bg-grok-bg-surface',
              'border-r',
              'border-grok-border',
              'transition-all',
              'duration-300',
              'ease-out',
              'flex-shrink-0',
              // Desktop sidebar
              'hidden lg:flex lg:flex-col',
              sidebarCollapsed ? 'lg:w-16' : 'lg:w-64',
              // Mobile sidebar (overlay)
              'fixed lg:relative',
              'inset-y-0 left-0',
              'z-30',
              'w-64',
              'transform lg:transform-none',
              'lg:translate-x-0'
            )}
          >
            {sidebar}
          </aside>
        )}

        {/* Main Content */}
        <main className={cn(mainContentClasses)}>
          <div className={cn(contentAreaClasses)}>
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <footer className="bg-grok-bg-surface border-t border-grok-border">
              {footer}
            </footer>
          )}
        </main>
      </div>
    </div>
  )
}

export { GrokLayout }