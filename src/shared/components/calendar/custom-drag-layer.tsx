'use client';

import { format } from 'date-fns';
import React from 'react';
import { useDragLayer } from 'react-dnd';
import { CalendarAppointment } from '@/lib/calendar-types';
import { getAppointmentColor } from '@/lib/calendar-utils';
import { cn } from '@/lib/utils';
import { ItemTypes } from './draggable-appointment-block';

interface DragItem {
  type: string;
  appointment: CalendarAppointment;
  originalPosition: { top: number; height: number };
}

const layerStyles: React.CSSProperties = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
};

function getItemStyles(
  initialOffset: { x: number; y: number } | null,
  currentOffset: { x: number; y: number } | null,
  originalPosition: { top: number; height: number }
) {
  if (!initialOffset || !currentOffset) {
    return {
      display: 'none',
    };
  }

  const { x, y } = currentOffset;

  const transform = `translate(${x}px, ${y}px) rotate(3deg)`;
  return {
    transform,
    WebkitTransform: transform,
    width: '200px', // Fixed width for drag preview
    height: `${originalPosition.height}px`,
  };
}

interface AppointmentPreviewProps {
  appointment: CalendarAppointment;
  originalPosition: { top: number; height: number };
}

const AppointmentPreview: React.FC<AppointmentPreviewProps> = ({ 
  appointment, 
  originalPosition 
}) => {
  const colorScheme = getAppointmentColor(appointment);
  const startTime = format(appointment.startTime, 'h:mm a');
  const endTime = format(appointment.endTime, 'h:mm a');

  return (
    <div
      className={cn(
        'rounded-md shadow-2xl opacity-90 border-l-4 p-2',
        'transform rotate-3 scale-105',
        colorScheme.bg,
        colorScheme.border,
        colorScheme.text,
        'ring-2 ring-blue-400'
      )}
      style={{ height: `${originalPosition.height}px` }}
    >
      <div className="flex flex-col h-full justify-between overflow-hidden">
        <div className="flex-1 min-h-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-semibold uppercase tracking-wide truncate flex-1">
              {appointment.title}
            </h4>
            {appointment.createdBy === 'patient' && (
              <span className="ml-1 bg-green-100 text-green-800 text-xs px-1 rounded-full">
                P
              </span>
            )}
          </div>
          
          {appointment.clientName && (
            <p className="text-sm font-medium truncate">
              {appointment.clientName}
            </p>
          )}
          
          <p className="text-xs opacity-75 truncate">
            {startTime} - {endTime}
          </p>
        </div>

        {/* Dragging indicator */}
        <div className="mt-1 flex items-center justify-center">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-current rounded-full animate-bounce" />
            <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export const CustomDragLayer: React.FC = () => {
  const {
    itemType,
    isDragging,
    item,
    initialOffset,
    currentOffset,
  } = useDragLayer((monitor) => ({
    item: monitor.getItem() as DragItem,
    itemType: monitor.getItemType(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  function renderItem() {
    switch (itemType) {
      case ItemTypes.APPOINTMENT:
        if (item?.appointment && item?.originalPosition) {
          return (
            <AppointmentPreview 
              appointment={item.appointment} 
              originalPosition={item.originalPosition}
            />
          );
        }
        return null;
      default:
        return null;
    }
  }

  if (!isDragging) {
    return null;
  }

  return (
    <div style={layerStyles}>
      <div
        style={getItemStyles(
          initialOffset,
          currentOffset,
          item?.originalPosition || { top: 0, height: 64 }
        )}
      >
        {renderItem()}
      </div>
    </div>
  );
};