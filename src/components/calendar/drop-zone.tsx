'use client';

import React, { ReactNode } from 'react';
import { useDrop } from 'react-dnd';
import { CalendarAppointment } from '@/lib/calendar-types';
import { ItemTypes, useDragDrop } from './drag-drop-provider';

interface DropZoneProps {
  children: ReactNode;
  timeSlot: {
    time: Date;
    therapistId: string;
    isAvailable: boolean;
  };
  height: number;
  top: number;
  onDrop: (appointment: CalendarAppointment, newTime: Date) => Promise<boolean>;
  onConflictCheck: (appointment: CalendarAppointment, newTime: Date) => Promise<CalendarAppointment[]>;
  className?: string;
}

export const DropZone: React.FC<DropZoneProps> = ({
  children,
  timeSlot,
  height,
  top,
  onDrop,
  onConflictCheck,
  className,
}) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemTypes.APPOINTMENT,
    drop: (item: { appointment: CalendarAppointment }) => onDrop(item.appointment, timeSlot.time),
    canDrop: (item: { appointment: CalendarAppointment }) => {
      // Basic availability check
      if (!timeSlot.isAvailable) return false;

      // More advanced conflict check
      // Note: canDrop does not support async operations.
      // This should be handled in the drop handler or by other means.
      return true;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const isActive = isOver && canDrop;
  let backgroundColor = 'transparent';
  if (isActive) {
    backgroundColor = 'rgba(0, 255, 0, 0.1)';
  } else if (canDrop) {
    backgroundColor = 'rgba(255, 255, 0, 0.1)';
  }

  return (
    <div
      ref={drop}
      style={{ height, top, position: 'absolute', width: '100%', backgroundColor }}
      className={className}
    >
      {children}
    </div>
  );
};
