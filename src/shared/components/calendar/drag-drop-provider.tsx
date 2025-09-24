'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { CalendarAppointment, TimeSlot } from '@/core/calendar/calendar-types';

// Drag and drop context types
interface DragDropState {
  draggedAppointment: CalendarAppointment | null;
  dropTarget: TimeSlot | null;
  isDragging: boolean;
  canDrop: boolean;
  conflictingAppointments: CalendarAppointment[];
  dragType: 'appointment' | 'resize' | null;
  originalPosition: { top: number; height: number } | null;
}

type DragDropAction =
  | { type: 'START_DRAG'; payload: { appointment: CalendarAppointment; dragType: 'appointment' | 'resize'; originalPosition: { top: number; height: number } } }
  | { type: 'UPDATE_DROP_TARGET'; payload: { dropTarget: TimeSlot | null; canDrop: boolean; conflicts: CalendarAppointment[] } }
  | { type: 'END_DRAG' }
  | { type: 'CANCEL_DRAG' };

interface DragDropContextType {
  state: DragDropState;
  startDrag: (appointment: CalendarAppointment, dragType: 'appointment' | 'resize', originalPosition: { top: number; height: number }) => void;
  updateDropTarget: (dropTarget: TimeSlot | null, canDrop: boolean, conflicts: CalendarAppointment[]) => void;
  endDrag: () => void;
  cancelDrag: () => void;
}

// Initial state
const initialState: DragDropState = {
  draggedAppointment: null,
  dropTarget: null,
  isDragging: false,
  canDrop: false,
  conflictingAppointments: [],
  dragType: null,
  originalPosition: null,
};

// Reducer
function dragDropReducer(state: DragDropState, action: DragDropAction): DragDropState {
  switch (action.type) {
    case 'START_DRAG':
      return {
        ...state,
        draggedAppointment: action.payload.appointment,
        dragType: action.payload.dragType,
        originalPosition: action.payload.originalPosition,
        isDragging: true,
        dropTarget: null,
        canDrop: false,
        conflictingAppointments: [],
      };

    case 'UPDATE_DROP_TARGET':
      return {
        ...state,
        dropTarget: action.payload.dropTarget,
        canDrop: action.payload.canDrop,
        conflictingAppointments: action.payload.conflicts,
      };

    case 'END_DRAG':
      return {
        ...initialState,
      };

    case 'CANCEL_DRAG':
      return {
        ...initialState,
      };

    default:
      return state;
  }
}

// Context
const DragDropContext = createContext<DragDropContextType | null>(null);

// Hook to use drag drop context
export function useDragDrop(): DragDropContextType {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error('useDragDrop must be used within a DragDropProvider');
  }
  return context;
}

// Provider component
interface DragDropProviderProps {
  children: ReactNode;
  onAppointmentDrop?: (appointment: CalendarAppointment, newTime: Date) => Promise<boolean>;
  onAppointmentResize?: (appointment: CalendarAppointment, newDuration: number) => Promise<boolean>;
  onConflictCheck?: (appointment: CalendarAppointment, newTime: Date, newDuration?: number) => Promise<CalendarAppointment[]>;
}

export const DragDropProvider: React.FC<DragDropProviderProps> = ({
  children,
  onAppointmentDrop,
  onAppointmentResize,
  onConflictCheck,
}) => {
  const [state, dispatch] = useReducer(dragDropReducer, initialState);

  const startDrag = (
    appointment: CalendarAppointment,
    dragType: 'appointment' | 'resize',
    originalPosition: { top: number; height: number }
  ) => {
    dispatch({
      type: 'START_DRAG',
      payload: { appointment, dragType, originalPosition },
    });
  };

  const updateDropTarget = async (
    dropTarget: TimeSlot | null,
    canDrop: boolean,
    conflicts: CalendarAppointment[] = []
  ) => {
    // If we have a conflict checker and a valid drop target, check for conflicts
    if (onConflictCheck && dropTarget && state.draggedAppointment) {
      try {
        const detectedConflicts = await onConflictCheck(
          state.draggedAppointment,
          dropTarget.time,
          state.dragType === 'resize' ? undefined : undefined // Duration handling for resize
        );
        
        dispatch({
          type: 'UPDATE_DROP_TARGET',
          payload: {
            dropTarget,
            canDrop: canDrop && detectedConflicts.length === 0,
            conflicts: detectedConflicts,
          },
        });
      } catch (error) {
        console.error('Error checking conflicts:', error);
        dispatch({
          type: 'UPDATE_DROP_TARGET',
          payload: { dropTarget, canDrop: false, conflicts: [] },
        });
      }
    } else {
      dispatch({
        type: 'UPDATE_DROP_TARGET',
        payload: { dropTarget, canDrop, conflicts },
      });
    }
  };

  const endDrag = async () => {
    if (state.draggedAppointment && state.dropTarget && state.canDrop) {
      try {
        let success = false;
        
        if (state.dragType === 'appointment' && onAppointmentDrop) {
          success = await onAppointmentDrop(state.draggedAppointment, state.dropTarget.time);
        } else if (state.dragType === 'resize' && onAppointmentResize) {
          // Calculate new duration based on drop target
          const originalDuration = state.draggedAppointment.endTime.getTime() - state.draggedAppointment.startTime.getTime();
          const newDuration = originalDuration; // This would be calculated based on resize operation
          success = await onAppointmentResize(state.draggedAppointment, newDuration / (1000 * 60)); // Convert to minutes
        }
        
        if (success) {
          dispatch({ type: 'END_DRAG' });
        } else {
          dispatch({ type: 'CANCEL_DRAG' });
        }
      } catch (error) {
        console.error('Error during drag operation:', error);
        dispatch({ type: 'CANCEL_DRAG' });
      }
    } else {
      dispatch({ type: 'CANCEL_DRAG' });
    }
  };

  const cancelDrag = () => {
    dispatch({ type: 'CANCEL_DRAG' });
  };

  const contextValue: DragDropContextType = {
    state,
    startDrag,
    updateDropTarget,
    endDrag,
    cancelDrag,
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <DragDropContext.Provider value={contextValue}>
        {children}
      </DragDropContext.Provider>
    </DndProvider>
  );
};