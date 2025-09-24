'use client';

import React, { useState, useCallback } from 'react';
import { CalendarAppointment, Therapist, CalendarViewConfig, CalendarFilter } from '@/lib/calendar-types';
import { ConflictDetectionService } from '@/lib/conflict-detection';
import { DragDropProvider } from './drag-drop-provider';
import { CustomDragLayer } from './custom-drag-layer';
import { DropZone } from './drop-zone';
import { DraggableAppointmentBlock } from './draggable-appointment-block';
import { generateTimeSlots, calculateAppointmentPosition } from '@/lib/calendar-utils';

interface CalendarWithDragDropProps {
  appointments: CalendarAppointment[];
  therapists: Therapist[];
  viewConfig: CalendarViewConfig;
  filters: CalendarFilter;
  onAppointmentUpdate: (appointment: CalendarAppointment) => Promise<boolean>;
  onAppointmentClick: (appointment: CalendarAppointment) => void;
  onTimeSlotClick: (time: Date, therapistId?: string) => void;
  selectedAppointmentId?: string;
}

export const CalendarWithDragDrop: React.FC<CalendarWithDragDropProps> = ({
  appointments,
  therapists,
  viewConfig,
  filters,
  onAppointmentUpdate,
  onAppointmentClick,
  onTimeSlotClick,
  selectedAppointmentId,
}) => {
  const [dragFeedback, setDragFeedback] = useState<{
    isVisible: boolean;
    message: string;
    type: 'success' | 'error' | 'warning';
  }>({ isVisible: false, message: '', type: 'success' });

  // Handle appointment drop
  const handleAppointmentDrop = useCallback(async (
    appointment: CalendarAppointment,
    newTime: Date
  ): Promise<boolean> => {
    try {
      // Create updated appointment
      const duration = appointment.endTime.getTime() - appointment.startTime.getTime();
      const updatedAppointment: CalendarAppointment = {
        ...appointment,
        startTime: newTime,
        endTime: new Date(newTime.getTime() + duration),
      };

      // Attempt to update the appointment
      const success = await onAppointmentUpdate(updatedAppointment);
      
      if (success) {
        setDragFeedback({
          isVisible: true,
          message: 'Appointment rescheduled successfully',
          type: 'success',
        });
        
        // Hide feedback after 3 seconds
        setTimeout(() => {
          setDragFeedback(prev => ({ ...prev, isVisible: false }));
        }, 3000);
      } else {
        setDragFeedback({
          isVisible: true,
          message: 'Failed to reschedule appointment',
          type: 'error',
        });
        
        setTimeout(() => {
          setDragFeedback(prev => ({ ...prev, isVisible: false }));
        }, 3000);
      }

      return success;
    } catch (error) {
      console.error('Error dropping appointment:', error);
      setDragFeedback({
        isVisible: true,
        message: 'Error occurred while rescheduling',
        type: 'error',
      });
      
      setTimeout(() => {
        setDragFeedback(prev => ({ ...prev, isVisible: false }));
      }, 3000);
      
      return false;
    }
  }, [onAppointmentUpdate]);

  // Handle appointment resize
  const handleAppointmentResize = useCallback(async (
    appointment: CalendarAppointment,
    newDurationMinutes: number
  ): Promise<boolean> => {
    try {
      const updatedAppointment: CalendarAppointment = {
        ...appointment,
        endTime: new Date(appointment.startTime.getTime() + newDurationMinutes * 60 * 1000),
      };

      const success = await onAppointmentUpdate(updatedAppointment);
      
      if (success) {
        setDragFeedback({
          isVisible: true,
          message: 'Appointment duration updated successfully',
          type: 'success',
        });
      } else {
        setDragFeedback({
          isVisible: true,
          message: 'Failed to update appointment duration',
          type: 'error',
        });
      }
      
      setTimeout(() => {
        setDragFeedback(prev => ({ ...prev, isVisible: false }));
      }, 3000);

      return success;
    } catch (error) {
      console.error('Error resizing appointment:', error);
      return false;
    }
  }, [onAppointmentUpdate]);

  // Check for conflicts during drag operations
  const handleConflictCheck = useCallback(async (
    appointment: CalendarAppointment,
    newTime: Date,
    newDuration?: number
  ): Promise<CalendarAppointment[]> => {
    try {
      const therapist = therapists.find(t => t.id === appointment.therapistId);
      const conflictResult = await ConflictDetectionService.checkAppointmentConflicts(
        appointment,
        newTime,
        newDuration,
        appointments,
        therapist
      );

      return conflictResult.conflicts;
    } catch (error) {
      console.error('Error checking conflicts:', error);
      return [];
    }
  }, [appointments, therapists]);

  // Generate time slots for drop zones
  const timeSlots = generateTimeSlots();

  // Render calendar grid with drag and drop
  const renderCalendarGrid = () => {
    const filteredTherapists = therapists.filter(therapist => 
      filters.therapistIds.length === 0 || filters.therapistIds.includes(therapist.id)
    );

    return (
      <div className="relative flex-1 overflow-auto">
        {/* Time column */}
        <div className="absolute left-0 top-0 w-20 bg-gray-50 border-r border-gray-200">
          {timeSlots.map((time, index) => (
            <div
              key={time}
              className="h-16 border-b border-gray-100 flex items-center justify-center text-sm text-gray-600"
            >
              {time}
            </div>
          ))}
        </div>

        {/* Therapist columns */}
        <div className="ml-20 grid" style={{ gridTemplateColumns: `repeat(${filteredTherapists.length}, 1fr)` }}>
          {filteredTherapists.map((therapist, therapistIndex) => (
            <div key={therapist.id} className="relative border-r border-gray-200 min-h-full">
              {/* Column header */}
              <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4">
                <div className="flex items-center space-x-3">
                  {therapist.avatar && (
                    <img
                      src={therapist.avatar}
                      alt={therapist.name}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{therapist.name}</h3>
                    <p className="text-sm text-gray-500">{therapist.specialty}</p>
                  </div>
                </div>
              </div>

              {/* Time slots and drop zones */}
              <div className="relative">
                {timeSlots.map((time, timeIndex) => {
                  const slotTime = new Date();
                  const [hours] = time.split(':');
                  slotTime.setHours(parseInt(hours), 0, 0, 0);

                  const isAvailable = ConflictDetectionService.isTimeSlotAvailable(
                    slotTime,
                    30, // 30-minute default slot
                    therapist.id,
                    appointments,
                    therapist
                  );

                  return (
                    <DropZone
                      key={`${therapist.id}-${time}`}
                      timeSlot={{
                        time: slotTime,
                        therapistId: therapist.id,
                        isAvailable,
                      }}
                      height={64} // 4rem
                      top={timeIndex * 64}
                      onDrop={handleAppointmentDrop}
                      onConflictCheck={handleConflictCheck}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      {/* Time slot content */}
                      <div
                        className="h-full w-full cursor-pointer"
                        onClick={() => onTimeSlotClick(slotTime, therapist.id)}
                      />
                    </DropZone>
                  );
                })}

                {/* Appointments */}
                {appointments
                  .filter(apt => apt.therapistId === therapist.id)
                  .map(appointment => {
                    const { top, height } = calculateAppointmentPosition(appointment);
                    
                    return (
                      <DraggableAppointmentBlock
                        key={appointment.id}
                        appointment={appointment}
                        height={height}
                        top={top}
                        onClick={() => onAppointmentClick(appointment)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          // Handle context menu
                        }}
                        isActive={selectedAppointmentId === appointment.id}
                        canDrag={appointment.isDraggable !== false}
                        canResize={appointment.isResizable !== false}
                        onDragStart={() => {
                          // Optional: Handle drag start
                        }}
                        onDragEnd={(newTime) => {
                          // Optional: Handle drag end
                        }}
                        onResize={(newDuration) => {
                          handleAppointmentResize(appointment, newDuration);
                        }}
                      />
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        {/* Drag feedback */}
        {dragFeedback.isVisible && (
          <div className="fixed top-4 right-4 z-50">
            <div className={`
              px-4 py-2 rounded-lg shadow-lg text-white font-medium
              ${dragFeedback.type === 'success' ? 'bg-green-500' : ''}
              ${dragFeedback.type === 'error' ? 'bg-red-500' : ''}
              ${dragFeedback.type === 'warning' ? 'bg-yellow-500' : ''}
            `}>
              {dragFeedback.message}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <DragDropProvider
      onAppointmentDrop={handleAppointmentDrop}
      onAppointmentResize={handleAppointmentResize}
      onConflictCheck={handleConflictCheck}
    >
      <div className="relative h-full">
        {renderCalendarGrid()}
        <CustomDragLayer />
      </div>
    </DragDropProvider>
  );
};