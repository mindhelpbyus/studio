'use client';

import React, { useState, useCallback } from 'react';
import { CalendarAppointment } from '@/lib/calendar-types';
import { cn } from '@/lib/utils';

interface ResizeHandleProps {
  appointment: CalendarAppointment;
  direction: 'top' | 'bottom';
  onResize: (newDurationMinutes: number) => void;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
  minDuration?: number; // in minutes
  maxDuration?: number; // in minutes
  snapInterval?: number; // in minutes
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  appointment,
  direction,
  onResize,
  onResizeStart,
  onResizeEnd,
  minDuration = 15,
  maxDuration = 480, // 8 hours
  snapInterval = 15,
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [startY, setStartY] = useState(0);
  const [originalDuration, setOriginalDuration] = useState(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const currentDuration = Math.round(
      (appointment.endTime.getTime() - appointment.startTime.getTime()) / (1000 * 60)
    );

    setIsResizing(true);
    setStartY(e.clientY);
    setOriginalDuration(currentDuration);
    onResizeStart?.();

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - e.clientY;
      
      // Convert pixel movement to minutes (assuming 64px = 1 hour)
      const pixelsPerMinute = 64 / 60; // 64px per hour / 60 minutes
      let deltaMinutes = Math.round(deltaY / pixelsPerMinute);
      
      // Snap to interval
      deltaMinutes = Math.round(deltaMinutes / snapInterval) * snapInterval;
      
      let newDuration = currentDuration;
      
      if (direction === 'bottom') {
        // Extending/shrinking from bottom
        newDuration = currentDuration + deltaMinutes;
      } else {
        // Extending/shrinking from top (this would also change start time)
        newDuration = currentDuration - deltaMinutes;
      }
      
      // Apply constraints
      newDuration = Math.max(minDuration, Math.min(maxDuration, newDuration));
      
      // Apply appointment-specific constraints
      if (appointment.minDuration) {
        newDuration = Math.max(appointment.minDuration, newDuration);
      }
      if (appointment.maxDuration) {
        newDuration = Math.min(appointment.maxDuration, newDuration);
      }
      
      onResize(newDuration);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      onResizeEnd?.();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [
    appointment,
    direction,
    onResize,
    onResizeStart,
    onResizeEnd,
    minDuration,
    maxDuration,
    snapInterval,
  ]);

  return (
    <div
      className={cn(
        'absolute left-0 right-0 h-2 cursor-ns-resize transition-opacity group-hover:opacity-100',
        direction === 'top' ? '-top-1' : '-bottom-1',
        isResizing ? 'opacity-100' : 'opacity-0'
      )}
      onMouseDown={handleMouseDown}
    >
      <div className={cn(
        'h-1 rounded-full mx-2 transition-colors',
        isResizing ? 'bg-blue-600' : 'bg-blue-500'
      )} />
      
      {/* Resize indicator */}
      {isResizing && (
        <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-1/2">
          <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
            {direction === 'top' ? '↕️ Resize from top' : '↕️ Resize from bottom'}
          </div>
        </div>
      )}
    </div>
  );
};