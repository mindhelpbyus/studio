'use client'

import React, { ReactNode } from 'react'
import { useNexusAnimations } from '@/hooks/useNexusAnimations'
import { cn } from '@/lib/utils'

export interface NexusChatBubbleProps {
  message: string
  sender: 'user' | 'ai'
  timestamp?: Date
  showTimestamp?: boolean
  avatar?: ReactNode
  status?: 'sending' | 'sent' | 'delivered' | 'error'
  className?: string
}

const NexusChatBubble: React.FC<NexusChatBubbleProps> = ({
  message,
  sender,
  timestamp,
  showTimestamp = false,
  avatar,
  status = 'sent',
  className
}) => {
  const { getSlideUpClasses } = useNexusAnimations()

  const isUser = sender === 'user'
  const isAI = sender === 'ai'

  const bubbleClasses = [
    'max-w-[80%]',
    'px-4',
    'py-3',
    'rounded-2xl',
    'text-sm',
    'leading-relaxed',
    'nexus-transition',
    getSlideUpClasses(),
    // User message styling
    isUser && [
      'bg-gradient-to-r',
      'from-nexus-accent-primary',
      'to-nexus-accent-primary/90',
      'text-white',
      'ml-auto',
      'rounded-br-md'
    ],
    // AI message styling
    isAI && [
      'bg-nexus-bg-elevated',
      'text-nexus-text-primary',
      'border',
      'border-nexus-border',
      'mr-auto',
      'rounded-bl-md'
    ]
  ].flat().filter(Boolean)

  const containerClasses = [
    'flex',
    'items-end',
    'gap-3',
    'mb-4',
    isUser ? 'flex-row-reverse' : 'flex-row'
  ]

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const StatusIcon = () => {
    switch (status) {
      case 'sending':
        return (
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-nexus-text-muted rounded-full animate-pulse"></div>
            <div className="w-1 h-1 bg-nexus-text-muted rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1 h-1 bg-nexus-text-muted rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        )
      case 'sent':
        return (
          <svg className="w-3 h-3 text-nexus-text-muted" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )
      case 'delivered':
        return (
          <div className="flex space-x-0.5">
            <svg className="w-3 h-3 text-nexus-accent-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <svg className="w-3 h-3 text-nexus-accent-primary -ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )
      case 'error':
        return (
          <svg className="w-3 h-3 text-nexus-error" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      default:
        return null
    }
  }

  const DefaultAvatar = ({ type }: { type: 'user' | 'ai' }) => (
    <div className={cn(
      'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold',
      type === 'user' 
        ? 'bg-nexus-accent-primary text-white' 
        : 'bg-gradient-to-br from-nexus-accent-primary to-nexus-accent-secondary text-white'
    )}>
      {type === 'user' ? 'U' : 'AI'}
    </div>
  )

  return (
    <div className={cn(containerClasses, className)}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        {avatar || <DefaultAvatar type={sender} />}
      </div>

      {/* Message Content */}
      <div className="flex flex-col space-y-1">
        {/* Message Bubble */}
        <div className={cn(bubbleClasses)}>
          <p className="whitespace-pre-wrap break-words">{message}</p>
        </div>

        {/* Timestamp and Status */}
        {(showTimestamp || status !== 'sent') && (
          <div className={cn(
            'flex items-center gap-2 px-2',
            isUser ? 'justify-end' : 'justify-start'
          )}>
            {showTimestamp && timestamp && (
              <span className="text-xs text-nexus-text-muted">
                {formatTimestamp(timestamp)}
              </span>
            )}
            {isUser && status !== 'sent' && (
              <div className="flex items-center">
                <StatusIcon />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export { NexusChatBubble }