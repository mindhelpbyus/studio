'use client';

import React from 'react';
import { generateTimeSlots, formatTimeSlot } from '@/lib/calendar-utils';
import { CALENDAR_CONSTANTS } from '@/lib/calendar-styles';

interface TimeColumnProps {
  className?: string;
}

export function TimeColumn({ className = '' }: TimeColumnProps) {
  const timeSlots = generateTimeSlots();

  return (
    <div className={`border-r bg-muted/30 ${className}`}>
      {/* Header spacer to align with calendar header */}
      <div 
        className="border-b bg-card sticky top-0 z-20"
        style={{ height: `${CALENDAR_CONSTANTS.HEADER_HEIGHT}rem` }}
      />
      
      {/* Time slots */}
      <div className="text-xs text-muted-foreground">
        {timeSlots.map((time, index) => (
          <div
            key={index}
            style={{ height: `${CALENDAR_CONSTANTS.TIME_SLOT_HEIGHT}rem` }}
            className="flex items-start justify-end pr-3 pt-1 border-b border-muted/50 calendar-time-slot"
          >
            <span className="font-medium select-none">
              {formatTimeSlot(time)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}