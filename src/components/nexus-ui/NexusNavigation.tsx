'use client'

import React, { ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useNexusAnimations } from '@/hooks/useNexusAnimations'
import { cn } from '@/lib/utils'

export interface NexusNavigationItem {
  id: string
  label: string
  href?: string
  icon?: ReactNode
  onClick?: () => void
  children?: NexusNavigationItem[]
  badge?: string | number
  disabled?: boolean
}

export interface NexusNavigationProps {
  items: NexusNavigationItem[]
  collapsed?: boolean
  onToggleCollapse?: () => void
  className?: string
  variant?: 'sidebar' | 'horizontal'
  showToggle?: boolean
}

const NexusNavigation: React.FC<NexusNavigationProps> = ({
  items,
  collapsed = false,
  onToggleCollapse,
  className,
  variant = 'sidebar',
  showToggle = true
}) => {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const { createHoverAnimation } = useNexusAnimations()

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }

  const isActive = (item: NexusNavigationItem): boolean => {
    if (item.href && pathname === item.href) return true
    if (item.children) {
      return item.children.some(child => isActive(child))
    }
    return false
  }

  const HamburgerIcon = () => (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )

  const ChevronIcon = ({ expanded }: { expanded: boolean }) => (
    <svg 
      className={cn('h-4 w-4 transition-transform duration-200', expanded ? 'rotate-90' : '')} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )

  const renderNavigationItem = (item: NexusNavigationItem, level: number = 0) => {
    const isItemActive = isActive(item)
    const isExpanded = expandedItems.has(item.id)
    const hasChildren = item.children && item.children.length > 0
    const hoverProps = createHoverAnimation({ duration: 'fast' })

    const itemClasses = [
      'group',
      'flex',
      'items-center',
      'w-full',
      'transition-all',
      'duration-200',
      'ease-out',
      'relative',
      // Padding based on level and collapsed state
      variant === 'sidebar' ? (
        collapsed ? 'p-3' : level === 0 ? 'px-4 py-3' : 'px-8 py-2'
      ) : 'px-4 py-2',
      // Active state styling
      isItemActive ? [
        'bg-nexus-accent-primary/10',
        'text-nexus-accent-primary',
        'border-r-2',
        'border-nexus-accent-primary'
      ] : [
        'text-nexus-text-secondary',
        'hover:text-nexus-text-primary',
        'hover:bg-nexus-bg-elevated'
      ],
      // Disabled state
      item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      // Rounded corners
      'rounded-lg',
      'mx-2',
      'mb-1'
    ].flat()

    const iconClasses = [
      'flex-shrink-0',
      'transition-colors',
      'duration-200',
      collapsed ? 'mx-auto' : 'mr-3',
      isItemActive ? 'text-nexus-accent-primary' : 'text-nexus-text-muted'
    ]

    const labelClasses = [
      'flex-1',
      'font-medium',
      'transition-all',
      'duration-200',
      collapsed ? 'hidden' : 'block'
    ]

    const badgeClasses = [
      'ml-auto',
      'px-2',
      'py-1',
      'text-xs',
      'font-medium',
      'rounded-full',
      'bg-nexus-accent-primary',
      'text-primary-foreground',
      collapsed ? 'hidden' : 'block'
    ]

    const handleClick = () => {
      if (item.disabled) return
      
      if (hasChildren) {
        toggleExpanded(item.id)
      }
      
      if (item.onClick) {
        item.onClick()
      }
    }

    const ItemContent = () => (
      <div
        className={cn(itemClasses)}
        onClick={handleClick}
        {...(!item.disabled ? hoverProps : {})}
      >
        {/* Active indicator */}
        {isItemActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-nexus-accent-primary rounded-r-full" />
        )}

        {/* Icon */}
        {item.icon && (
          <div className={cn(iconClasses)}>
            {item.icon}
          </div>
        )}

        {/* Label */}
        <span className={cn(labelClasses)}>
          {item.label}
        </span>

        {/* Badge */}
        {item.badge && (
          <span className={cn(badgeClasses)}>
            {item.badge}
          </span>
        )}

        {/* Expand/Collapse Icon */}
        {hasChildren && !collapsed && (
          <div className="ml-2 text-nexus-text-muted">
            <ChevronIcon expanded={isExpanded} />
          </div>
        )}
      </div>
    )

    return (
      <div key={item.id}>
        {item.href && !hasChildren ? (
          <Link href={item.href} className="block">
            <ItemContent />
          </Link>
        ) : (
          <ItemContent />
        )}

        {/* Children */}
        {hasChildren && isExpanded && !collapsed && (
          <div className="ml-4 space-y-1">
            {item.children!.map(child => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  const navigationClasses = [
    'nexus-navigation',
    variant === 'sidebar' ? [
      'flex',
      'flex-col',
      'h-full',
      'bg-nexus-bg-surface',
      'border-r',
      'border-nexus-border'
    ] : [
      'flex',
      'items-center',
      'space-x-1',
      'bg-nexus-bg-surface',
      'border-b',
      'border-nexus-border',
      'px-4',
      'py-2'
    ]
  ].flat()

  return (
    <nav className={cn(navigationClasses, className)}>
      {/* Toggle Button (Sidebar only) */}
      {variant === 'sidebar' && showToggle && onToggleCollapse && (
        <div className="p-4 border-b border-nexus-border">
          <button
            onClick={onToggleCollapse}
            className="p-2 text-nexus-text-muted hover:text-nexus-text-primary hover:bg-nexus-bg-elevated rounded-lg transition-colors duration-200"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <HamburgerIcon />
          </button>
        </div>
      )}

      {/* Navigation Items */}
      <div className={cn(
        variant === 'sidebar' ? 'flex-1 overflow-y-auto py-4' : 'flex items-center space-x-1'
      )}>
        {items.map(item => renderNavigationItem(item))}
      </div>

      {/* Collapsed Tooltip (Sidebar only) */}
      {variant === 'sidebar' && collapsed && (
        <div className="p-4 border-t border-nexus-border">
          <div className="text-xs text-nexus-text-muted text-center">
            Navigation
          </div>
        </div>
      )}
    </nav>
  )
}

export { NexusNavigation }