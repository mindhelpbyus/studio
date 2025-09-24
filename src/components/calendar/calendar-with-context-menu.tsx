'use client';

import React, { useCallback } from 'react';
import { useContextMenu } from '@/hooks/use-context-menu';
import { CalendarAppointment, Therapist, TimeSlot } from '@/lib/calendar-types';
import { ContextMenu, ContextMenuBuilder } from './context-menu';
import { DraggableAppointmentBlock } from './draggable-appointment-block';
import { DropZone } from './drop-zone';

interface CalendarWithContextMenuProps {
  appointments: CalendarAppointment[];
  therapists: Therapist[];
  onAppointmentEdit: (appointment: CalendarAppointment) => void;
  onAppointmentDelete: (appointment: CalendarAppointment) => void;
  onAppointmentCopy: (appointment: CalendarAppointment) => void;
  onAppointmentMove: (appointment: CalendarAppointment) => void;
  onAppointmentCreate: (time: Date, therapistId?: string) => void;
  onBreakAdd: (time: Date, therapistId?: string) => void;
  onTimeBlock: (time: Date, therapistId?: string) => void;
  onBreakEdit: (appointment: CalendarAppointment) => void;
  onBreakDelete: (appointment: CalendarAppointment) => void;
  onBreakConvert: (appointment: CalendarAppointment) => void;
  selectedAppointmentId?: string;
  onAppointmentClick: (appointment: CalendarAppointment) => void;
}

export const CalendarWithContextMenu: React.FC<CalendarWithContextMenuProps> = ({
  appointments,
  therapists,
  onAppointmentEdit,
  onAppointmentDelete,
  onAppointmentCopy,
  onAppointmentMove,
  onAppointmentCreate,
  onBreakAdd,
  onTimeBlock,
  onBreakEdit,
  onBreakDelete,
  onBreakConvert,
  selectedAppointmentId,
  onAppointmentClick,
}) => {
  const { contextMenu, openContextMenu, closeContextMenu, handleActionClick } = useContextMenu();

  // Handle appointment right-click
  const handleAppointmentContextMenu = useCallback((
    event: React.MouseEvent,
    appointment: CalendarAppointment
  ) => {
    let actions;
    
    if (appointment.type === 'break' || appointment.type === 'blocked') {
      actions = ContextMenuBuilder.getBreakActions(
        appointment,
        onBreakEdit,
        onBreakDelete,
        onBreakConvert
      );
    } else {
      actions = ContextMenuBuilder.getAppointmentActions(
        appointment,
        onAppointmentEdit,
        onAppointmentDelete,
        onBreakAdd,
        onAppointmentCopy,
        onAppointmentMove
      );
    }

    openContextMenu(event, appointment, actions);
  }, [
    onAppointmentEdit,
    onAppointmentDelete,
    onBreakAdd,
    onAppointmentCopy,
    onAppointmentMove,
    onBreakEdit,
    onBreakDelete,
    onBreakConvert,
    openContextMenu,
  ]);

  // Handle time slot right-click
  const handleTimeSlotContextMenu = useCallback((
    event: React.MouseEvent,
    timeSlot: TimeSlot
  ) => {
    const actions = ContextMenuBuilder.getTimeSlotActions(
      timeSlot,
      onAppointmentCreate,
      onBreakAdd,
      onTimeBlock
    );

    openContextMenu(event, timeSlot, actions);
  }, [onAppointmentCreate, onBreakAdd, onTimeBlock, openContextMenu]);

  // Render appointment with context menu
  const renderAppointment = useCallback((appointment: CalendarAppointment) => {
    const { top, height } = calculateAppointmentPosition(appointment);
    
    return (
      <DraggableAppointmentBlock
        key={appointment.id}
        appointment={appointment}
        height={height}
        top={top}
        onClick={() => onAppointmentClick(appointment)}
        onContextMenu={(e) => handleAppointmentContextMenu(e, appointment)}
        isActive={selectedAppointmentId === appointment.id}
        canDrag={appointment.isDraggable !== false}
        canResize={appointment.isResizable !== false}
      />
    );
  }, [selectedAppointmentId, onAppointmentClick, handleAppointmentContextMenu]);

  // Render time slot with context menu
  const renderTimeSlot = useCallback((timeSlot: TimeSlot, index: number) => {
    return (
      <DropZone
        key={`${timeSlot.therapistId}-${timeSlot.time.getTime()}`}
        timeSlot={timeSlot}
        height={64} // 4rem
        top={index * 64}
        className="border-b border-gray-100 hover:bg-gray-50"
      >
        <div
          className="h-full w-full cursor-pointer"
          onContextMenu={(e) => handleTimeSlotContextMenu(e, timeSlot)}
          onClick={() => {
            // Handle regular click if needed
          }}
        />
      </DropZone>
    );
  }, [handleTimeSlotContextMenu]);

  return (
    <>
      {/* Calendar content would be rendered here */}
      <div className="relative">
        {/* This is a simplified example - in practice, this would integrate with your existing calendar layout */}
        {appointments.map(renderAppointment)}
        
        {/* Context menu */}
        <ContextMenu
          isOpen={contextMenu.isOpen}
          position={contextMenu.position}
          target={contextMenu.target}
          actions={contextMenu.actions}
          onClose={closeContextMenu}
          onActionClick={handleActionClick}
        />
      </div>
    </>
  );
};

// Helper function - this would typically be imported from calendar-utils
function calculateAppointmentPosition(appointment: CalendarAppointment): { top: number; height: number } {
  const startHour = appointment.startTime.getHours();
  const startMinutes = appointment.startTime.getMinutes();
  const durationMinutes = (appointment.endTime.getTime() - appointment.startTime.getTime()) / (1000 * 60);
  
  const top = (startHour + startMinutes / 60) * 64; // 64px per hour
  const height = Math.max((durationMinutes / 60) * 64, 32); // Minimum 32px height
  
  return { top, height };
}