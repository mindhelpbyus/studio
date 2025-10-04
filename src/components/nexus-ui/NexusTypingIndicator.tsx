'use client'

import React, { ReactNode } from 'react'
import { useNexusAnimations } from '@/hooks/useNexusAnimations'
import { cn } from '@/lib/utils'

export interface NexusTypingIndicatorProps {
  avatar?: ReactNode
  message?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const NexusTypingIndicator: React.FC<NexusTypingIndicatorProps> = ({
  avatar,
  message = 'AI is typing',
  className,
  size = 'md'
}) => {
  const { getFadeInClasses } = useNexusAnimations()

  const sizeClasses = {
    sm: {
      container: 'gap-2',
      avatar: 'w-6 h-6',
      bubble: 'px-3 py-2',
      dot: 'w-1 h-1',
      text: 'text-xs'
    },
    md: {
      container: 'gap-3',
      avatar: 'w-8 h-8',
      bubble: 'px-4 py-3',
      dot: 'w-1.5 h-1.5',
      text: 'text-sm'
    },
    lg: {
      container: 'gap-4',
      avatar: 'w-10 h-10',
      bubble: 'px-5 py-4',
      dot: 'w-2 h-2',
      text: 'text-base'
    }
  }

  const containerClasses = [
    'flex',
    'items-end',
    sizeClasses[size].container,
    'mb-4',
    getFadeInClasses()
  ]

  const bubbleClasses = [
    'max-w-[80%]',
    sizeClasses[size].bubble,
    'rounded-2xl',
    'rounded-bl-md',
    'bg-nexus-bg-elevated',
    'border',
    'border-nexus-border',
    'nexus-transition'
  ]

  const DefaultAvatar = () => (
    <div className={cn(
      sizeClasses[size].avatar,
      'rounded-full',
      'flex',
      'items-center',
      'justify-center',
      'bg-gradient-to-br',
      'from-nexus-accent-primary',
      'to-nexus-accent-secondary',
      'text-primary-foreground',
      'font-semibold',
      sizeClasses[size].text
    )}>
      AI
    </div>
  )

  const TypingDots = () => (
    <div className="flex items-center space-x-1">
      <div 
        className={cn(
          sizeClasses[size].dot,
          'bg-nexus-text-muted',
          'rounded-full',
          'animate-pulse'
        )}
        style={{ animationDelay: '0ms', animationDuration: '1.4s' }}
      />
      <div 
        className={cn(
          sizeClasses[size].dot,
          'bg-nexus-text-muted',
          'rounded-full',
          'animate-pulse'
        )}
        style={{ animationDelay: '200ms', animationDuration: '1.4s' }}
      />
      <div 
        className={cn(
          sizeClasses[size].dot,
          'bg-nexus-text-muted',
          'rounded-full',
          'animate-pulse'
        )}
        style={{ animationDelay: '400ms', animationDuration: '1.4s' }}
      />
    </div>
  )

  const TypingAnimation = () => (
    <div className="flex items-center space-x-2">
      <span className={cn(sizeClasses[size].text, 'text-nexus-text-secondary')}>
        {message}
      </span>
      <TypingDots />
    </div>
  )

  return (
    <div className={cn(containerClasses, className)}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        {avatar || <DefaultAvatar />}
      </div>

      {/* Typing Bubble */}
      <div className={cn(bubbleClasses)}>
        <TypingAnimation />
      </div>
    </div>
  )
}

export { NexusTypingIndicator }