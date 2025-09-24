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
      }}
      className={`p-2 rounded-lg shadow-md ${
        isActive ? 'bg-blue-500 text-white' : 'bg-white text-gray-900'
      }`}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      <p className="font-bold">{appointment.patientName}</p>
      <p>{`${appointment.startTime.toLocaleTimeString()} - ${appointment.endTime.toLocaleTimeString()}`}</p>
    </div>
  );
};
