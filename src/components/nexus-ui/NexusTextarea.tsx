import * as React from 'react'
import { cn } from '@/lib/utils'

export interface NexusTextareaProps extends React.ComponentProps<'textarea'> {
  variant?: 'default' | 'filled' | 'outlined'
  error?: boolean
}

const NexusTextarea = React.forwardRef<HTMLTextAreaElement, NexusTextareaProps>(
  ({ className, variant = 'default', error = false, ...props }, ref) => {
    const variantClasses = {
      default: [
        'bg-nexus-bg-surface',
        'border-nexus-border',
        'focus:border-nexus-accent-primary',
        'focus:ring-nexus-accent-primary/20'
      ],
      filled: [
        'bg-nexus-bg-elevated',
        'border-transparent',
        'focus:ring-2',
        'focus:ring-nexus-accent-primary/20'
      ],
      outlined: [
        'bg-transparent',
        'border-2',
        'border-nexus-border',
        'focus:border-nexus-accent-primary'
      ]
    }

    const errorClasses = error ? [
      'border-nexus-error',
      'focus:border-nexus-error',
      'focus:ring-nexus-error/20'
    ] : []

    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-lg border px-4 py-3 text-base text-nexus-text-primary placeholder:text-nexus-text-muted transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none',
          ...variantClasses[variant],
          ...errorClasses,
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
NexusTextarea.displayName = 'NexusTextarea'

export { NexusTextarea }