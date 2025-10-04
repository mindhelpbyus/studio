'use client'

import React, { forwardRef, ReactNode } from 'react'
import { useNexusAnimations } from '@/hooks/useNexusAnimations'
import { cn } from '@/lib/utils'

export interface NexusFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode
  loading?: boolean
  error?: string
  success?: string
  title?: string
  description?: string
  variant?: 'default' | 'card' | 'modal'
  size?: 'sm' | 'md' | 'lg'
}

const NexusForm = forwardRef<HTMLFormElement, NexusFormProps>(
  ({ 
    children,
    loading = false,
    error,
    success,
    title,
    description,
    variant = 'default',
    size = 'md',
    className,
    ...props 
  }, ref) => {
    const { getFadeInClasses } = useNexusAnimations()

    const sizeClasses = {
      sm: 'max-w-sm',
      md: 'max-w-md', 
      lg: 'max-w-lg'
    }

    const variantClasses = {
      default: 'space-y-6',
      card: [
        'bg-nexus-bg-surface',
        'border',
        'border-nexus-border',
        'rounded-lg',
        'p-6',
        'shadow-sm',
        'space-y-6'
      ],
      modal: [
        'bg-nexus-bg-surface',
        'rounded-xl',
        'p-6',
        'space-y-6'
      ]
    }

    const containerClasses = [
      'w-full',
      sizeClasses[size],
      'mx-auto',
      getFadeInClasses()
    ]

    const formClasses = [
      ...variantClasses[variant],
      loading ? 'pointer-events-none opacity-75' : '',
      'transition-all duration-200'
    ].flat()

    return (
      <div className={cn(containerClasses, className)}>
        {/* Header */}
        {(title || description) && (
          <div className="text-center space-y-2 mb-6">
            {title && (
              <h2 className="text-2xl font-semibold text-nexus-text-primary">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-nexus-text-secondary">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-4 bg-nexus-success/10 border border-nexus-success/20 rounded-lg">
            <div className="flex items-center gap-2 text-nexus-success">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Success</span>
            </div>
            <p className="text-sm text-nexus-success mt-1">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-nexus-error/10 border border-nexus-error/20 rounded-lg">
            <div className="flex items-center gap-2 text-nexus-error">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Error</span>
            </div>
            <p className="text-sm text-nexus-error mt-1">{error}</p>
          </div>
        )}

        {/* Form */}
        <form
          ref={ref}
          className={cn(formClasses)}
          {...props}
        >
          {children}
        </form>

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-nexus-bg-surface/50 backdrop-blur-sm flex items-center justify-center rounded-lg">
            <div className="flex items-center gap-3 text-nexus-text-primary">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              <span>Processing...</span>
            </div>
          </div>
        )}
      </div>
    )
  }
)

NexusForm.displayName = 'NexusForm'

export { NexusForm }