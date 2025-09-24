'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface MoreEventsLinkProps {
  count: number;
  onClick: (e: React.MouseEvent) => void;
}

export const MoreEventsLink: React.FC<MoreEventsLinkProps> = ({
  count,
  onClick,
}) => {
  return (
    <button
      className={cn(
        'text-xs text-blue-600 hover:text-blue-800 hover:underline',
        'w-full text-left p-1 rounded transition-colors',
        'hover:bg-blue-50'
      )}
      onClick={onClick}
    >
      +{count} more...
    </button>
  );
};