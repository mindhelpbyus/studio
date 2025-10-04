'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface NexusLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'horizontal';
  animated?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

const NexusLogo: React.FC<NexusLogoProps> = ({
  size = 'md',
  variant = 'icon',
  animated = true,
  className,
}) => {
  const logoId = React.useId();
  
  const LogoIcon = () => (
    <svg
      viewBox="0 0 100 100"
      className={cn(sizeClasses[size], className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Professional gradient - inspired by Zoho's clean aesthetic */}
        <linearGradient id={`gradient-${logoId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        
        {/* Dark mode gradient */}
        <linearGradient id={`gradient-dark-${logoId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        
        {/* Subtle shadow */}
        <filter id={`shadow-${logoId}`}>
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.1"/>
        </filter>
      </defs>
      
      {/* Clean, professional N letterform */}
      <g
        className={cn(
          'transition-all duration-300 ease-out',
          animated && 'animate-in fade-in-0 zoom-in-95 duration-600'
        )}
        filter={`url(#shadow-${logoId})`}
      >
        {/* Modern N shape with perfect proportions */}
        <path
          d="M20 20 L20 80 L28 80 L28 35 L72 80 L80 80 L80 20 L72 20 L72 65 L28 20 Z"
          fill={`url(#gradient-${logoId})`}
          className="dark:fill-[url(#gradient-dark-${logoId})]"
        />
        
        {/* Subtle highlight for depth */}
        <path
          d="M20 20 L28 20 L28 32 L20 20 Z"
          fill="rgba(255,255,255,0.2)"
        />
        <path
          d="M72 68 L80 80 L72 80 Z"
          fill="rgba(255,255,255,0.2)"
        />
      </g>
      
      {/* Hover effect - very subtle */}
      <g className="opacity-0 hover:opacity-5 transition-opacity duration-200">
        <circle cx="50" cy="50" r="40" fill="currentColor" />
      </g>
    </svg>
  );

  const FullLogo = () => (
    <div className="flex items-center space-x-3">
      <LogoIcon />
      <span className={cn(
        'font-bold text-foreground',
        size === 'sm' && 'text-lg',
        size === 'md' && 'text-xl',
        size === 'lg' && 'text-2xl',
        size === 'xl' && 'text-3xl',
        animated && 'animate-in slide-in-from-right-3 duration-600 delay-400'
      )}>
        Nexus
      </span>
    </div>
  );

  const HorizontalLogo = () => (
    <div className="flex items-center space-x-2">
      <LogoIcon />
      <div className="flex flex-col">
        <span className={cn(
          'font-bold text-foreground leading-none',
          size === 'sm' && 'text-sm',
          size === 'md' && 'text-base',
          size === 'lg' && 'text-lg',
          size === 'xl' && 'text-xl',
          animated && 'animate-in slide-in-from-right-3 duration-600 delay-400'
        )}>
          Nexus
        </span>
        <span className={cn(
          'text-muted-foreground text-xs leading-none',
          animated && 'animate-in slide-in-from-right-3 duration-600 delay-500'
        )}>
          CRM
        </span>
      </div>
    </div>
  );

  switch (variant) {
    case 'full':
      return <FullLogo />;
    case 'horizontal':
      return <HorizontalLogo />;
    case 'icon':
    default:
      return <LogoIcon />;
  }
};

export default NexusLogo;