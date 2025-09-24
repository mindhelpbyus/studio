'use client';

import React, { useEffect, useRef } from 'react';
import { CalendarAppointment } from '@/lib/calendar-types';
import { formatAppointmentTime } from '@/lib/calendar-utils';

interface CalendarAccessibilityProps {
  appointments: CalendarAppointment[];
  selectedAppointment?: CalendarAppointment | null;
  currentDate: Date;
}

/**
 * Accessibility utilities and live region announcements for the calendar
 */
export function CalendarAccessibility({
  appointments,
  selectedAppointment,
  currentDate
}: CalendarAccessibilityProps) {
  const liveRegionRef = useRef<HTMLDivElement>(null);
  const previousAppointmentCount = useRef(appointments.length);

  // Announce appointment changes
  useEffect(() => {
    if (liveRegionRef.current) {
      const currentCount = appointments.length;
      const previousCount = previousAppointmentCount.current;

      if (currentCount !== previousCount) {
        const message = currentCount > previousCount
          ? `${currentCount - previousCount} new appointment${currentCount - previousCount > 1 ? 's' : ''} added`
          : `${previousCount - currentCount} appointment${previousCount - currentCount > 1 ? 's' : ''} removed`;

        liveRegionRef.current.textContent = message;

        // Clear the message after announcement
        setTimeout(() => {
          if (liveRegionRef.current) {
            liveRegionRef.current.textContent = '';
          }
        }, 1000);
      }

      previousAppointmentCount.current = currentCount;
    }
  }, [appointments.length]);

  // Announce selected appointment changes
  useEffect(() => {
    if (liveRegionRef.current && selectedAppointment) {
      const message = `Selected appointment: ${selectedAppointment.title} ${selectedAppointment.clientName ? `with ${selectedAppointment.clientName}` : ''
        } at ${formatAppointmentTime(selectedAppointment)}`;

      liveRegionRef.current.textContent = message;

      // Clear the message after announcement
      setTimeout(() => {
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = '';
        }
      }, 2000);
    }
  }, [selectedAppointment]);

  return (
    <>
      {/* Live region for screen reader announcements */}
      <div
        ref={liveRegionRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
        role="status"
      />

      {/* Calendar description for screen readers */}
      <div className="sr-only" id="calendar-description">
        Calendar view showing appointments for {currentDate.toLocaleDateString()}.
        Use arrow keys to navigate between time slots and appointments.
        Press Enter or Space to select an appointment.
        Press Tab to move between different sections of the calendar.
      </div>

      {/* Instructions for keyboard navigation */}
      <div className="sr-only" id="calendar-instructions">
        Keyboard navigation: Use Tab to move between appointments and controls.
        Use arrow keys to navigate time slots. Press Enter to select an appointment.
        Press Escape to close any open dialogs or return to the main calendar view.
      </div>
    </>
  );
}

/**
 * Hook for managing keyboard navigation in the calendar
 */
export function useCalendarKeyboardNavigation(
  appointments: CalendarAppointment[],
  onAppointmentSelect: (appointment: CalendarAppointment) => void,
  onTimeSlotSelect?: (time: Date) => void
) {
  const [focusedIndex, setFocusedIndex] = React.useState(-1);
  const [focusedTimeSlot, setFocusedTimeSlot] = React.useState(-1);

  const handleKeyDown = React.useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (appointments.length > 0) {
          setFocusedIndex(prev =>
            prev < appointments.length - 1 ? prev + 1 : 0
          );
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (appointments.length > 0) {
          setFocusedIndex(prev =>
            prev > 0 ? prev - 1 : appointments.length - 1
          );
        }
        break;

      case 'ArrowRight':
        event.preventDefault();
        // Navigate to next time slot or day
        setFocusedTimeSlot(prev => prev + 1);
        break;

      case 'ArrowLeft':
        event.preventDefault();
        // Navigate to previous time slot or day
        setFocusedTimeSlot(prev => Math.max(0, prev - 1));
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        if (focusedIndex >= 0 && appointments[focusedIndex]) {
          onAppointmentSelect(appointments[focusedIndex]);
        }
        break;

      case 'Escape':
        event.preventDefault();
        setFocusedIndex(-1);
        setFocusedTimeSlot(-1);
        break;

      case 'Home':
        event.preventDefault();
        setFocusedIndex(0);
        break;

      case 'End':
        event.preventDefault();
        setFocusedIndex(appointments.length - 1);
        break;
    }
  }, [appointments, focusedIndex, onAppointmentSelect]);

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    focusedIndex,
    focusedTimeSlot,
    setFocusedIndex,
    setFocusedTimeSlot
  };
}

/**
 * Generate ARIA labels for calendar components
 */
export const CalendarAriaLabels = {
  appointment: (appointment: CalendarAppointment): string => {
    const statusText = appointment.status !== 'scheduled' ? `, ${appointment.status}` : '';
    return `${appointment.title}${appointment.clientName ? ` with ${appointment.clientName}` : ''} at ${formatAppointmentTime(appointment)}${statusText}`;
  },

  timeSlot: (time: Date): string => {
    return `Time slot ${time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  },

  therapistColumn: (therapistName: string): string => {
    return `${therapistName}'s schedule`;
  },

  dayColumn: (date: Date): string => {
    return `Schedule for ${date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}`;
  },

  calendarGrid: (viewType: 'day' | 'week', date: Date): string => {
    return `${viewType} view calendar for ${date.toLocaleDateString()}`;
  }
};

/**
 * Focus management utilities
 */
export class CalendarFocusManager {
  private static focusedElement: HTMLElement | null = null;

  static saveFocus(): void {
    this.focusedElement = document.activeElement as HTMLElement;
  }

  static restoreFocus(): void {
    if (this.focusedElement && document.contains(this.focusedElement)) {
      this.focusedElement.focus();
    }
    this.focusedElement = null;
  }

  static focusFirstAppointment(): void {
    const firstAppointment = document.querySelector('[data-appointment-id]') as HTMLElement;
    if (firstAppointment) {
      firstAppointment.focus();
    }
  }

  static focusCalendarGrid(): void {
    const calendarGrid = document.querySelector('[role="grid"]') as HTMLElement;
    if (calendarGrid) {
      calendarGrid.focus();
    }
  }
}