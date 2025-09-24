'use client';

import React from 'react';
import { useDrop } from 'react-dnd';
import { CalendarAppointment, TimeSlot } from '@/lib/calendar-types';
import { cn } from '@/lib/utils';
import { useDragDrop } from './drag-drop-provider';
import { ItemTypes } from './draggable-appointment-block';

interface DropZoneProps {
  timeSlot: TimeSlot;
  height: number;
  top: number;
  onDrop?: (appointment: CalendarAppointment, newTime: Date) => Promise<boolean>;
  onConflictCheck?: (appointment: CalendarAppointment, newTime: Date) => Promise<CalendarAppointment[]>;
  className?: string;
  children?: React.ReactNode;
}

interface DragItem {
  type: string;
  appointment: CalendarAppointment;
  originalPosition: { top: number; height: number };
}

export const DropZone: React.FC<DropZoneProps> = ({
  timeSlot,
  height,
  top,
  onDrop,
  onConflictCheck,
  className,
  children,
}) => {
  const { updateDropTarget } = useDragDrop();

  const [{ isOver, canDrop, draggedItem }, drop] = useDrop({
    accept: ItemTypes.APPOINTMENT,
    drop: async (item: DragItem) => {
      if (onDrop && item.appointment) {
        try {
          const success = await onDrop(item.appointment, timeSlot.time);
          return { success, time: timeSlot.time };
        } catch (error) {
          console.error('Error dropping appointment:', error);
          return { success: false, time: timeSlot.time };
        }
      }
      return { success: false, time: timeSlot.time };
    },
    hover: async (item: DragItem) => {
      if (item.appointment && onConflictCheck) {
        try {
          const conflicts = await onConflictCheck(item.appointment, timeSlot.time);
          const canDropHere = timeSlot.isAvailable && conflicts.length === 0;
          updateDropTarget(timeSlot, canDropHere, conflicts);
        } catch (error) {
          console.error('Error checking conflicts:', error);
          updateDropTarget(timeSlot, false, []);
        }
      } else {
        updateDropTarget(timeSlot, timeSlot.isAvailable, []);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop() && timeSlot.isAvailable,
      draggedItem: monitor.getItem() as DragItem,
    }),
  });

  // Determine drop zone styling
  const getDropZoneStyles = () => {
    if (!draggedItem) return '';
    
    if (isOver && canDrop) {
      return 'bg-green-100 border-2 border-dashed border-green-400 ring-2 ring-green-200';
    } else if (isOver && !canDrop) {
      return 'bg-red-100 border-2 border-dashed border-red-400 ring-2 ring-red-200';
    } else if (canDrop) {
      return 'bg-blue-50 border border-dashed border-blue-300';
    }
    
    return '';
  };

  return (
    <div
      ref={drop}
      className={cn(
        'absolute left-0 right-0 transition-all duration-200',
        getDropZoneStyles(),
        className
      )}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        zIndex: isOver ? 50 : 1,
      }}
    >
      {children}
      
      {/* Drop indicator */}
      {isOver && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={cn(
            'px-3 py-1 rounded-full text-sm font-medium shadow-lg',
            canDrop 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          )}>
            {canDrop ? 'Drop here' : 'Cannot drop'}
          </div>
        </div>
      )}
      
      {/* Conflict indicator */}
      {isOver && !canDrop && draggedItem && (
        <div className="absolute top-2 left-2 right-2">
          <div className="bg-red-100 border border-red-300 rounded-md p-2">
            <p className="text-xs text-red-800 font-medium">
              Time slot conflict detected
            </p>
          </div>
        </div>
      )}
    </div>
  );
};