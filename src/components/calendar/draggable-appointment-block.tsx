'use client';

import React from 'react';
import { useDrag } from 'react-dnd';
import { CalendarAppointment } from '@/lib/calendar-types';
import { ItemTypes } from './drag-drop-provider';

interface DraggableAppointmentBlockProps {
  appointment: CalendarAppointment;
  height: number;
  top: number;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  isActive: boolean;
  canDrag: boolean;
  canResize: boolean;
  onDragStart: () => void;
  onDragEnd: (newTime: Date) => void;
  onResize: (newDuration: number) => void;
  children?: React.ReactNode; // Add children prop
}

export const DraggableAppointmentBlock: React.FC<DraggableAppointmentBlockProps> = ({
  appointment,
  height,
  top,
  onClick,
  onContextMenu,
  isActive,
  canDrag,
  canResize,
  onDragStart,
  onDragEnd,
  onResize,
  children, // Destructure children
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.APPOINTMENT,
    item: { appointment },
    canDrag: canDrag,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag as any}
      style={{
        height,
        top,
        position: 'absolute',
        width: '100%',
        opacity: isDragging ? 0.5 : 1,
        cursor: canDrag ? 'move' : 'default',
        backgroundColor: isActive ? undefined : appointment.color, // Apply appointment color when not active
        color: isActive ? undefined : (appointment.color ? 'white' : 'black'), // Ensure text is readable
      }}
      className={`p-2 rounded-lg shadow-md ${
        isActive ? 'bg-blue-500 text-white' : ''
      }`}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      <p className="font-bold">{appointment.patientName}</p>
      <p>{`${appointment.startTime.toLocaleTimeString()} - ${appointment.endTime.toLocaleTimeString()}`}</p>
      {children} {/* Render children */}
    </div>
  );
};
