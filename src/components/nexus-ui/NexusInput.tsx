'use client'

import React, { forwardRef, ReactNode, useState, useId } from 'react'
import { useNexusAnimations } from '@/hooks/useNexusAnimations'
import { cn } from '@/lib/utils'

export interface NexusInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'filled' | 'outlined'
  fullWidth?: boolean
}

const NexusInput = forwardRef<HTMLInputElement, NexusInputProps>(
  ({ 
    label,
    error,
    helperText,
    leadingIcon,
    trailingIcon,
    size = 'md',
    variant = 'default',
    fullWidth = false,
    className,
    placeholder,
    value,
    defaultValue,
    onFocus,
    onBlur,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const [hasValue, setHasValue] = useState(Boolean(value || defaultValue))
    const { getAnimationProps } = useNexusAnimations()
    const inputId = useId()

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      setHasValue(Boolean(e.target.value))
      onBlur?.(e)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(Boolean(e.target.value))
      props.onChange?.(e)
    }

    const containerClasses = [
      'relative',
      'transition-all',
      'duration-300',
      fullWidth ? 'w-full' : 'w-auto'
    ]

    const inputWrapperClasses = [
      'relative',
      'flex',
      'items-center',
      'transition-all',
      'duration-300',
      'ease-out'
    ]

    const variantClasses = {
      default: [
        'bg-nexus-bg-surface',
        'border',
        'border-nexus-border',
        'rounded-lg',
        isFocused ? 'border-nexus-accent-primary' : '',
        isFocused ? 'shadow-lg' : 'shadow-sm',
        error ? 'border-nexus-error' : ''
      ],
      filled: [
        'bg-nexus-bg-elevated',
        'border-0',
        'rounded-lg',
        'shadow-inner',
        isFocused ? 'ring-2 ring-nexus-accent-primary' : '',
        error ? 'ring-2 ring-nexus-error' : ''
      ],
      outlined: [
        'bg-transparent',
        'border-2',
        'border-nexus-border',
        'rounded-lg',
        isFocused ? 'border-nexus-accent-primary' : '',
        error ? 'border-nexus-error' : ''
      ]
    }

    const sizeClasses = {
      sm: {
        input: ['px-3', 'py-2', 'text-sm'],
        icon: 'h-4 w-4',
        iconPadding: leadingIcon ? 'pl-9' : trailingIcon ? 'pr-9' : ''
      },
      md: {
        input: ['px-4', 'py-3', 'text-base'],
        icon: 'h-5 w-5',
        iconPadding: leadingIcon ? 'pl-11' : trailingIcon ? 'pr-11' : ''
      },
      lg: {
        input: ['px-5', 'py-4', 'text-lg'],
        icon: 'h-6 w-6',
        iconPadding: leadingIcon ? 'pl-12' : trailingIcon ? 'pr-12' : ''
      }
    }

    const inputClasses = [
      'w-full',
      'bg-transparent',
      'text-nexus-text-primary',
      'placeholder-nexus-text-muted',
      'border-0',
      'outline-none',
      'transition-all',
      'duration-300',
      ...sizeClasses[size].input,
      sizeClasses[size].iconPadding,
      label ? (size === 'sm' ? 'pt-6 pb-1' : size === 'lg' ? 'pt-7 pb-2' : 'pt-6 pb-2') : ''
    ]

    const labelClasses = [
      'absolute',
      'left-0',
      'transition-all',
      'duration-300',
      'ease-out',
      'pointer-events-none',
      'text-nexus-text-muted',
      'origin-left',
      leadingIcon ? (size === 'sm' ? 'left-9' : size === 'lg' ? 'left-12' : 'left-11') : (size === 'sm' ? 'left-3' : size === 'lg' ? 'left-5' : 'left-4'),
      
      // Floating label positioning
      (isFocused || hasValue) ? [
        size === 'sm' ? 'top-1 text-xs' : size === 'lg' ? 'top-2 text-sm' : 'top-1.5 text-xs',
        'scale-90',
        isFocused ? 'text-nexus-accent-primary' : 'text-nexus-text-secondary'
      ] : [
        size === 'sm' ? 'top-2' : size === 'lg' ? 'top-4' : 'top-3',
        'text-base',
        'scale-100'
      ]
    ].flat()

    const iconClasses = [
      'absolute',
      'text-nexus-text-muted',
      'transition-colors',
      'duration-300',
      sizeClasses[size].icon,
      isFocused ? 'text-nexus-accent-primary' : ''
    ]

    const leadingIconClasses = [
      ...iconClasses,
      size === 'sm' ? 'left-3' : size === 'lg' ? 'left-5' : 'left-4'
    ]

    const trailingIconClasses = [
      ...iconClasses,
      size === 'sm' ? 'right-3' : size === 'lg' ? 'right-5' : 'right-4'
    ]

    return (
      <div className={cn(containerClasses, className)}>
        <div className={cn(inputWrapperClasses, variantClasses[variant])}>
          {leadingIcon && (
            <div className={cn(leadingIconClasses)}>
              {leadingIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={cn(inputClasses)}
            placeholder={label ? '' : placeholder}
            value={value}
            defaultValue={defaultValue}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />
          
          {label && (
            <label
              htmlFor={inputId}
              className={cn(labelClasses)}
            >
              {label}
            </label>
          )}
          
          {trailingIcon && (
            <div className={cn(trailingIconClasses)}>
              {trailingIcon}
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <div className={cn(
            'mt-2',
            'text-sm',
            'transition-all',
            'duration-300',
            error ? 'text-nexus-error' : 'text-nexus-text-muted'
          )}>
            {error || helperText}
          </div>
        )}
      </div>
    )
  }
)

NexusInput.displayName = 'NexusInput'

export { NexusInput }