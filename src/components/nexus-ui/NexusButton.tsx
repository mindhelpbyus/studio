'use client'

import React, { forwardRef, ReactNode } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { useNexusAnimations } from '@/hooks/useNexusAnimations'
import { cn } from '@/lib/utils'

export interface NexusButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'destructive' | 'default' | 'link'
  size?: 'sm' | 'md' | 'lg' | 'icon' | 'default'
  loading?: boolean
  icon?: ReactNode
  children?: ReactNode
  fullWidth?: boolean
  asChild?: boolean
}

const NexusButton = forwardRef<HTMLButtonElement, NexusButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    icon, 
    children, 
    fullWidth = false,
    asChild = false,
    className, 
    disabled,
    ...props 
  }, ref) => {
    const { createHoverAnimation, getLoadingClasses } = useNexusAnimations()
    const hoverProps = createHoverAnimation({ duration: 'fast' })

    const baseClasses = [
      'nexus-button',
      'inline-flex',
      'items-center',
      'justify-center',
      'gap-2',
      'font-medium',
      'transition-all',
      'duration-300',
      'ease-out',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-2',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
      'disabled:transform-none'
    ]

    const variantClasses: Record<string, string[]> = {
      primary: [
        'bg-primary',
        'text-primary-foreground',
        'shadow-lg',
        'hover:bg-primary-hover',
        'hover:shadow-xl',
        'focus:ring-[var(--focus-ring)]'
      ],
      default: [
        'bg-primary',
        'text-primary-foreground',
        'shadow-lg',
        'hover:bg-primary-hover',
        'hover:shadow-xl',
        'focus:ring-[var(--focus-ring)]'
      ],
      secondary: [
        'bg-secondary',
        'text-secondary-foreground',
        'border',
        'border-nexus-border',
        'hover:bg-nexus-bg-elevated',
        'focus:ring-[var(--focus-ring)]'
      ],
      outline: [
        'bg-transparent',
        'text-nexus-text-primary',
        'border',
        'border-nexus-border',
        'hover:bg-nexus-bg-elevated',
        'focus:ring-[var(--focus-ring)]'
      ],
      ghost: [
        'bg-transparent',
        'text-nexus-text-primary',
        'hover:bg-nexus-bg-elevated',
        'hover:text-nexus-text-primary',
        'focus:ring-[var(--focus-ring)]'
      ],
      link: [
        'bg-transparent',
        'text-primary',
        'underline-offset-4',
        'hover:underline',
        'focus:ring-[var(--focus-ring)]'
      ],
      danger: [
        'bg-destructive',
        'text-destructive-foreground',
        'shadow-lg',
        'hover:opacity-90',
        'hover:shadow-xl',
        'focus:ring-[var(--focus-ring)]'
      ],
      destructive: [
        'bg-destructive',
        'text-destructive-foreground',
        'shadow-lg',
        'hover:opacity-90',
        'hover:shadow-xl',
        'focus:ring-[var(--focus-ring)]'
      ]
    }

    const sizeClasses: Record<string, string[]> = {
      sm: ['px-3', 'py-1.5', 'text-sm', 'rounded-md'],
      md: ['px-4', 'py-2', 'text-base', 'rounded-lg'],
      lg: ['px-6', 'py-3', 'text-lg', 'rounded-lg'],
      default: ['px-4', 'py-2', 'text-base', 'rounded-lg'],
      icon: ['h-10', 'w-10', 'rounded-full', 'p-0']
    }

    const widthClasses = fullWidth ? ['w-full'] : []

    const allClasses = [
      ...baseClasses,
      ...variantClasses[variant],
      ...sizeClasses[size],
      ...widthClasses
    ]

    const LoadingSpinner = () => (
      <svg 
        className={cn('animate-spin', size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4')}
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    )

    const Comp = asChild ? Slot : 'button'

    if (asChild) {
      return (
        <Comp
          ref={ref}
          className={cn(allClasses, className)}
          {...props}
        >
          {children}
        </Comp>
      )
    }

    return (
      <Comp
        ref={ref}
        className={cn(allClasses, className)}
        disabled={disabled || loading}
        {...(disabled || loading ? {} : hoverProps)}
        {...props}
      >
        {loading ? (
          <>
            <LoadingSpinner />
            <span>Loading...</span>
          </>
        ) : (
          <>
            {icon && <span className="flex-shrink-0">{icon}</span>}
            {children}
          </>
        )}
      </Comp>
    )
  }
)

NexusButton.displayName = 'NexusButton'

export { NexusButton }