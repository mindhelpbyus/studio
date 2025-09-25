'use client';

import React, { useState, useCallback } from 'react';
import { CalendarAppointment, Therapist, CalendarViewConfig, CalendarFilter } from '@/lib/calendar-types';
import { generateTimeSlots, calculateAppointmentPosition } from '@/lib/calendar-utils';
import { ConflictDetectionService } from '@/lib/conflict-detection';
import { CustomDragLayer } from './custom-drag-layer';
import { DragDropProvider } from './drag-drop-provider';
import { DraggableAppointmentBlock } from './draggable-appointment-block';
import { DropZone } from './drop-zone';
import { isSameDay, addHours, eachDayOfInterval, startOfWeek, endOfWeek, format } from 'date-fns';
import { Users } from 'lucide-react'; // Import Users icon
import { HOUR_HEIGHT } from '@/lib/calendar-utils'; // Import HOUR_HEIGHT

interface CalendarWithDragDropProps {
  appointments: CalendarAppointment[];
  therapists: Therapist[];
  viewConfig: CalendarViewConfig;
  filters: CalendarFilter;
  onAppointmentUpdate: (appointment: CalendarAppointment) => Promise<boolean>;
  onAppointmentClick: (appointment: CalendarAppointment) => void;
  onTimeSlotClick: (time: Date, therapistId: string) => void; // Changed to require string
  selectedAppointmentId: string; // Changed to required string
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

  // Current time indicator component (adapted from ResourceTimeline)
  const CurrentTimeIndicator = () => {
    const now = new Date();
    const currentDay = viewConfig.currentDate;

    const top = (now.getHours() + now.getMinutes() / 60) * HOUR_HEIGHT;

    return isSameDay(now, currentDay) && viewConfig.viewType === 'day' ? (
      <div
        className="absolute left-0 right-0 flex items-center z-10"
        style={{ top: `${top}px` }}
      >
        <div className="w-2 h-2 rounded-full bg-red-500" />
        <div className="flex-1 h-px bg-red-500" />
      </div>
    ) : null;
  };

  // Render calendar grid with drag and drop
  const renderCalendarGrid = () => {
    const filteredTherapists = therapists.filter(therapist =>
      filters.therapistIds.length === 0 || filters.therapistIds.includes(therapist.id)
    );

    const daysToDisplay = viewConfig.viewType === 'week'
      ? eachDayOfInterval({ start: startOfWeek(viewConfig.currentDate), end: endOfWeek(viewConfig.currentDate) })
      : [viewConfig.currentDate];

    const isWeekView = viewConfig.viewType === 'week';
    const isDayView = viewConfig.viewType === 'day';

    // Determine grid columns based on view type
    let gridTemplateColumns: string;
    if (isWeekView || isDayView) {
      // For week/day view, one column per day (plus time column)
      gridTemplateColumns = `100px repeat(${daysToDisplay.length}, 1fr)`; // Increased time column width
    } else {
      // For other views (e.g., timeline), keep therapist columns
      gridTemplateColumns = `100px repeat(${daysToDisplay.length * filteredTherapists.length}, 1fr)`; // Increased time column width
    }

    // If no therapists are selected and it's a week/day view, show a message
    if (filteredTherapists.length === 0 && (isWeekView || isDayView)) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-muted/50 rounded-full flex items-center justify-center">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-muted-foreground">No Doctors Selected</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Please select one or more doctors from the dropdown to view their calendars.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="relative flex-1 overflow-auto">
        <div className="grid h-full" style={{ gridTemplateColumns: gridTemplateColumns }}>
          {/* Top-left corner (empty or calendar icon) */}
          <div className="sticky top-0 z-20 border-b border-r border-gray-200 p-4"></div>

          {/* Day Headers */}
          {daysToDisplay.map((day, dayIndex) => (
            <div
              key={day.toISOString()}
              className="sticky top-0 z-10 border-b border-r border-gray-200 p-4 text-center"
              style={{ gridColumn: `span 1` }} // Span 1 column for week/day view
            >
              <h3 className="font-semibold text-gray-900">{format(day, isWeekView ? 'EEE d' : 'EEEE, MMM d')}</h3>
            </div>
          ))}

          {/* Time Column */}
          <div className="sticky left-0 z-10 border-r border-gray-200">
            {timeSlots.map((time, index) => (
              <div
                key={time}
                className="border-b border-gray-100 flex items-center justify-center text-sm text-gray-600"
                style={{ height: `${HOUR_HEIGHT}px` }}
              >
                {time}
              </div>
            ))}
          </div>

          {/* Main Content Grid (Days and Appointments) */}
          {daysToDisplay.map((day, dayIndex) => (
            <div key={day.toISOString()} className="relative border-r border-gray-200 min-h-full">
              {/* Time slots and drop zones for the day */}
              <div className="relative">
                {timeSlots.map((time, timeIndex) => {
                  const slotTime = new Date(day);
                  const [hours = '0'] = time.split(':');
                  slotTime.setHours(parseInt(hours), 0, 0, 0);

                  // For week/day view, we need to consider all selected therapists for availability
                  const isAnyTherapistAvailable = filteredTherapists.some(therapist =>
                    ConflictDetectionService.isTimeSlotAvailable(
                      slotTime,
                      30, // Assuming a default appointment duration for slot availability check
                      therapist.id,
                      appointments,
                      therapist
                    )
                  );

                  // Determine therapistId for onTimeSlotClick
                  // If only one therapist is selected, use their ID. Otherwise, pass an empty string or handle later.
                  const defaultTherapistIdForSlot = filteredTherapists.length > 0 ? filteredTherapists[0]?.id || '' : '';

                  return (
                    <DropZone
                      key={`${day.toISOString()}-${time}`}
                      timeSlot={{
                        time: slotTime,
                        therapistId: defaultTherapistIdForSlot, // Pass a default or selected therapist ID
                        isAvailable: isAnyTherapistAvailable,
                      }}
                      height={HOUR_HEIGHT}
                      top={timeIndex * HOUR_HEIGHT}
                      onDrop={handleAppointmentDrop}
                      onConflictCheck={handleConflictCheck}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <div
                        className="h-full w-full cursor-pointer"
                        onClick={() => onTimeSlotClick(slotTime, defaultTherapistIdForSlot)}
                      />
                    </DropZone>
                  );
                })}

                {/* Appointments for this day (all therapists) */}
                {appointments
                  .filter(apt =>
                    isSameDay(apt.startTime, day) &&
                    (filters.therapistIds.length === 0 || filters.therapistIds.includes(apt.therapistId))
                  )
                  .map(appointment => {
                    const { top, height } = calculateAppointmentPosition(appointment);
                    const therapist = therapists.find(t => t.id === appointment.therapistId);

                    return (
                      <DraggableAppointmentBlock
                        key={appointment.id}
                        appointment={appointment}
                        height={height}
                        top={top}
                        onClick={() => onAppointmentClick(appointment)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                        }}
                        isActive={selectedAppointmentId === appointment.id}
                        canDrag={appointment.isDraggable !== false}
                        canResize={appointment.isResizable !== false}
                        onDragStart={() => {}}
                        onDragEnd={(newTime) => {}}
                        onResize={(newDuration) => {
                          handleAppointmentResize(appointment, newDuration);
                        }}
                      >
                        {viewConfig.userRole === 'admin' && therapist?.name && (
                          <div className="absolute bottom-1 left-1 text-xs text-gray-600">
                            {therapist.name}
                          </div>
                        )}
                      </DraggableAppointmentBlock>
                    );
                  })}
              </div>
              {isDayView && isSameDay(day, viewConfig.currentDate) && <CurrentTimeIndicator />}
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
