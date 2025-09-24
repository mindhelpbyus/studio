'use client';

import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { CalendarAppointment } from '@/lib/calendar-types';

// Define the drag item type
export const ItemTypes = {
  APPOINTMENT: 'appointment',
};

interface DragItem {
  appointment: CalendarAppointment;
}

interface DragDropContextType {
  onAppointmentDrop: (appointment: CalendarAppointment, newTime: Date) => Promise<boolean>;
  onAppointmentResize: (appointment: CalendarAppointment, newDurationMinutes: number) => Promise<boolean>;
  onConflictCheck: (appointment: CalendarAppointment, newTime: Date, newDuration?: number) => Promise<CalendarAppointment[]>;
}

const DragDropContext = createContext<DragDropContextType | undefined>(undefined);

interface DragDropProviderProps {
  children: ReactNode;
  onAppointmentDrop: (appointment: CalendarAppointment, newTime: Date) => Promise<boolean>;
  onAppointmentResize: (appointment: CalendarAppointment, newDurationMinutes: number) => Promise<boolean>;
  onConflictCheck: (appointment: CalendarAppointment, newTime: Date, newDuration?: number) => Promise<CalendarAppointment[]>;
}

export const DragDropProvider: React.FC<DragDropProviderProps> = ({
  children,
  onAppointmentDrop,
  onAppointmentResize,
  onConflictCheck,
}) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <DragDropContext.Provider value={{ onAppointmentDrop, onAppointmentResize, onConflictCheck }}>
        {children}
      </DragDropContext.Provider>
    </DndProvider>
  );
};

export const useDragDrop = () => {
  const context = useContext(DragDropContext);
  if (context === undefined) {
    throw new Error('useDragDrop must be used within a DragDropProvider');
  }
  return context;
};

// Placeholder for useDraggableAppointment
export const useDraggableAppointment = (appointment: CalendarAppointment) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.APPOINTMENT,
    item: { appointment },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return { drag, isDragging };
};

// Placeholder for useDropZone
export const useDropZone = (timeSlot: { time: Date; therapistId: string; isAvailable: boolean }) => {
  const { onAppointmentDrop, onConflictCheck } = useDragDrop();

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.APPOINTMENT,
    drop: (item: DragItem) => {
      onAppointmentDrop(item.appointment, timeSlot.time);
    },
    canDrop: (item: DragItem) => {
      // Implement more sophisticated canDrop logic here if needed
      return timeSlot.isAvailable;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  return { drop, isOver, canDrop };
};
