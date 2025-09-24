'use client';

import { format } from 'date-fns';
import React, { useRef, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { CalendarAppointment, DraggableAppointmentBlockProps } from '@/lib/calendar-types';
import { getAppointmentColor } from '@/lib/calendar-utils';
import { cn } from '@/lib/utils';
import { useDragDrop } from './drag-drop-provider';
import { ResizeHandle } from './resize-handle';

// Drag item types
export const ItemTypes = {
  APPOINTMENT: 'appointment',
} as const;

interface DragItem {
  type: string;
  appointment: CalendarAppointment;
  originalPosition: { top: number; height: number };
}

export const DraggableAppointmentBlock: React.FC<DraggableAppointmentBlockProps> = ({
  appointment,
  height,
  top,
  onClick,
  onContextMenu,
  isActive = false,
  isDragging: externalIsDragging = false,
  canDrag = true,
  canResize = true,
  onDragStart,
  onDragEnd,
  onResize,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { state: dragDropState, startDrag, endDrag } = useDragDrop();
  
  const colorScheme = getAppointmentColor(appointment);
  const startTime = format(appointment.startTime, 'h:mm a');
  const endTime = format(appointment.endTime, 'h:mm a');

  // Drag source
  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.APPOINTMENT,
    item: (): DragItem => {
      const originalPosition = { top, height };
      startDrag(appointment, 'appointment', originalPosition);
      onDragStart?.();
      return {
        type: ItemTypes.APPOINTMENT,
        appointment,
        originalPosition,
      };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: canDrag && appointment.isDraggable !== false,
    end: (item, monitor) => {
      if (monitor.didDrop()) {
        endDrag();
        onDragEnd?.(new Date()); // This would be the actual new time from drop target
      } else {
        // Drag was cancelled
        endDrag();
      }
    },
  });

  // Drop target (for reordering)
  const [{ isOver, canDrop: canDropHere }, drop] = useDrop({
    accept: ItemTypes.APPOINTMENT,
    drop: () => {
      // Return drop result
      return { time: appointment.startTime };
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  // Combine drag and drop refs
  const dragDropRef = drag(drop(ref));

  // Use empty image as drag preview to create custom drag layer
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  // Resize functionality
  const handleResizeStart = (direction: 'top' | 'bottom') => {
    startDrag(appointment, 'resize', { top, height });
  };

  const handleResize = (newDurationMinutes: number) => {
    onResize?.(newDurationMinutes);
  };

  // Determine if this appointment is being dragged
  const isCurrentlyDragging = isDragging || externalIsDragging || 
    (dragDropState.isDragging && dragDropState.draggedAppointment?.id === appointment.id);

  return (
    <div
      ref={dragDropRef}
      className={cn(
        'absolute left-0 right-0 mx-1 rounded-md cursor-pointer transition-all duration-200 group',
        'border-l-4 shadow-sm hover:shadow-md',
        colorScheme.bg,
        colorScheme.border,
        colorScheme.text,
        colorScheme.shadow,
        // Active state
        isActive && 'ring-2 ring-blue-500 shadow-lg scale-105',
        // Dragging state
        isCurrentlyDragging && 'opacity-75 rotate-2 shadow-2xl z-50',
        // Drop target state
        isOver && canDropHere && 'ring-2 ring-green-400',
        // Patient booked indicator
        appointment.createdBy === 'patient' && 'ring-1 ring-green-300',
        // Status modifiers
        appointment.status === 'cancelled' && 'opacity-50 line-through grayscale-50',
        appointment.status === 'no-show' && 'opacity-60 border-l-red-500 bg-red-50',
        appointment.status === 'completed' && 'opacity-80',
        // Break/blocked styling
        appointment.type === 'break' && 'bg-gradient-to-br from-gray-100 to-gray-200 border-l-gray-400 opacity-75'
      )}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        zIndex: isCurrentlyDragging ? 1000 : isActive ? 100 : 10,
      }}
      onClick={onClick}
      onContextMenu={onContextMenu}
      title={`${appointment.title} - ${appointment.clientName} (${startTime} - ${endTime})`}
    >
      {/* Resize handle - top */}
      {canResize && appointment.isResizable !== false && (
        <ResizeHandle
          appointment={appointment}
          direction="top"
          onResize={handleResize}
          onResizeStart={() => handleResizeStart('top')}
        />
      )}

      {/* Appointment content */}
      <div className="p-2 h-full flex flex-col justify-between overflow-hidden">
        <div className="flex-1 min-h-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-semibold uppercase tracking-wide truncate flex-1">
              {appointment.title}
            </h4>
            {appointment.createdBy === 'patient' && (
              <span className="ml-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                Patient Booked
              </span>
            )}
          </div>
          
          {appointment.clientName && (
            <p className="text-base font-medium truncate">
              {appointment.clientName}
            </p>
          )}
          
          <p className="text-sm opacity-75 truncate">
            {startTime} - {endTime}
          </p>
          
          {appointment.notes && (
            <p className="text-xs opacity-60 truncate mt-1">
              {appointment.notes}
            </p>
          )}
        </div>

        {/* Status indicator */}
        {appointment.status !== 'scheduled' && (
          <div className="mt-1">
            <span className={cn(
              'text-xs px-2 py-1 rounded-full',
              appointment.status === 'checked-in' && 'bg-green-100 text-green-800',
              appointment.status === 'completed' && 'bg-blue-100 text-blue-800',
              appointment.status === 'cancelled' && 'bg-red-100 text-red-800',
              appointment.status === 'no-show' && 'bg-orange-100 text-orange-800'
            )}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </span>
          </div>
        )}
      </div>

      {/* Resize handle - bottom */}
      {canResize && appointment.isResizable !== false && (
        <ResizeHandle
          appointment={appointment}
          direction="bottom"
          onResize={handleResize}
          onResizeStart={() => handleResizeStart('bottom')}
        />
      )}

      {/* Drag handle indicator */}
      {canDrag && appointment.isDraggable !== false && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-50 transition-opacity">
          <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
            <div className="w-1 h-1 bg-current rounded-full" />
            <div className="w-1 h-1 bg-current rounded-full" />
            <div className="w-1 h-1 bg-current rounded-full" />
            <div className="w-1 h-1 bg-current rounded-full" />
          </div>
        </div>
      )}
    </div>
  );
};