'use client'

import React, { forwardRef, ReactNode } from 'react'
import { useNexusAnimations } from '@/hooks/useNexusAnimations'
import { cn } from '@/lib/utils'

export interface NexusCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  hover?: boolean
  interactive?: boolean
  header?: ReactNode
  footer?: ReactNode
  loading?: boolean
}

const NexusCard = forwardRef<HTMLDivElement, NexusCardProps>(
  ({ 
    children,
    variant = 'default',
    padding = 'lg',
    hover = true,
    interactive = false,
    header,
    footer,
    loading = false,
    className,
    onClick,
    ...props 
  }, ref) => {
    const { createHoverAnimation, getLoadingClasses, getFadeInClasses } = useNexusAnimations()
    const hoverProps = (hover && !loading) ? createHoverAnimation({ duration: 'fast' }) : {}

    const baseClasses = [
      'nexus-card',
      'rounded-lg',
      'transition-all',
      'duration-300',
      'ease-out',
      getFadeInClasses()
    ]

    const variantClasses = {
      default: [
        'bg-nexus-bg-surface',
        'border',
        'border-nexus-border',
        'shadow-sm'
      ],
      elevated: [
        'bg-nexus-bg-elevated',
        'border',
        'border-nexus-border',
        'shadow-md'
      ],
      outlined: [
        'bg-transparent',
        'border-2',
        'border-nexus-border'
      ],
      ghost: [
        'bg-transparent',
        'border-0'
      ]
    }

    const paddingClasses = {
      none: [],
      sm: ['p-3'],
      md: ['p-4'],
      lg: ['p-6'],
      xl: ['p-8']
    }

    const interactiveClasses = interactive || onClick ? [
      'cursor-pointer',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-[var(--focus-ring)]',
      'focus:ring-offset-2'
    ] : []

    const hoverClasses = hover && !loading ? [
      'hover:shadow-lg',
      'hover:border-nexus-accent-primary/50',
      'hover:-translate-y-1'
    ] : []

    const loadingClasses = loading ? [
      getLoadingClasses(),
      'pointer-events-none'
    ] : []

    const allClasses = [
      ...baseClasses,
      ...variantClasses[variant],
      ...paddingClasses[padding],
      ...interactiveClasses,
      ...hoverClasses,
      ...loadingClasses
    ]

    const LoadingSkeleton = () => (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-nexus-border rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-nexus-border rounded"></div>
          <div className="h-3 bg-nexus-border rounded w-5/6"></div>
        </div>
      </div>
    )

    const cardContent = loading ? <LoadingSkeleton /> : children

    return (
      <div
        ref={ref}
        className={cn(allClasses, className)}
        onClick={onClick}
        role={interactive || onClick ? 'button' : undefined}
        tabIndex={interactive || onClick ? 0 : undefined}
        onKeyDown={(e) => {
          if ((interactive || onClick) && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            onClick?.(e as any)
          }
        }}
        {...(hover && !loading ? hoverProps : {})}
        {...props}
      >
        {header && (
          <div className="mb-4 pb-4 border-b border-nexus-border">
            {header}
          </div>
        )}
        
        <div className={cn(padding === 'none' ? 'p-0' : '')}>
          {cardContent}
        </div>
        
        {footer && (
          <div className="mt-4 pt-4 border-t border-nexus-border">
            {footer}
          </div>
        )}
      </div>
    )
  }
)

NexusCard.displayName = 'NexusCard'

export { NexusCard }