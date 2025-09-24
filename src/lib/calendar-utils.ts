import { format, startOfWeek, addDays, isSameDay, differenceInMinutes, startOfDay, addMinutes } from 'date-fns';
import { CalendarAppointment, CalendarView } from './calendar-types';
import { CALENDAR_CONSTANTS, appointmentColors, SERVICE_COLORS, STATUS_MODIFIERS } from './calendar-styles';

/**
 * Generate time slots for a day (24 hours)
 */
export function generateTimeSlots(): string[] {
  return Array.from({ length: 24 }, (_, i) => `${i}:00`);
}

/**
 * Format time slot for display (12-hour format)
 */
export function formatTimeSlot(time: string): string {
  const hour = parseInt(time);
  if (hour === 0) return '12:00 AM';
  if (hour < 12) return `${hour}:00 AM`;
  if (hour === 12) return '12:00 PM';
  return `${hour - 12}:00 PM`;
}

/**
 * Get days for week view
 */
export function getWeekDays(currentDate: Date): Array<{ day: string; date: number; fullDate: Date }> {
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startDate, i);
    return {
      day: format(date, 'EEE'),
      date: date.getDate(),
      fullDate: date
    };
  });
}

/**
 * Calculate appointment position and height
 */
export function calculateAppointmentPosition(appointment: CalendarAppointment): {
  top: number;
  height: number;
} {
  const startHour = appointment.startTime.getHours();
  const startMinutes = appointment.startTime.getMinutes();
  const durationMinutes = differenceInMinutes(appointment.endTime, appointment.startTime);
  
  // Convert to rem units based on time slot height
  const top = (startHour + startMinutes / 60) * CALENDAR_CONSTANTS.TIME_SLOT_HEIGHT;
  const height = Math.max(
    (durationMinutes / 60) * CALENDAR_CONSTANTS.TIME_SLOT_HEIGHT - CALENDAR_CONSTANTS.APPOINTMENT_GAP,
    CALENDAR_CONSTANTS.MINIMUM_APPOINTMENT_HEIGHT
  );
  
  return { top, height };
}

/**
 * Filter appointments for a specific date and therapist
 */
export function filterAppointmentsForDay(
  appointments: CalendarAppointment[],
  date: Date,
  therapistId?: string
): CalendarAppointment[] {
  return appointments.filter(apt => {
    const matchesDate = isSameDay(apt.startTime, date);
    const matchesTherapist = !therapistId || apt.therapistId === therapistId;
    return matchesDate && matchesTherapist;
  });
}

/**
 * Sort appointments by start time
 */
export function sortAppointmentsByTime(appointments: CalendarAppointment[]): CalendarAppointment[] {
  return [...appointments].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
}

/**
 * Check if two appointments overlap
 */
export function appointmentsOverlap(apt1: CalendarAppointment, apt2: CalendarAppointment): boolean {
  return apt1.startTime < apt2.endTime && apt2.startTime < apt1.endTime;
}

/**
 * Detect appointment conflicts for a therapist
 */
export function detectAppointmentConflicts(
  appointments: CalendarAppointment[],
  therapistId: string
): CalendarAppointment[][] {
  const therapistAppointments = appointments
    .filter(apt => apt.therapistId === therapistId && apt.type === 'appointment')
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  
  const conflicts: CalendarAppointment[][] = [];
  
  for (let i = 0; i < therapistAppointments.length - 1; i++) {
    const current = therapistAppointments[i];
    const next = therapistAppointments[i + 1];
    
    if (current && next && appointmentsOverlap(current, next)) {
      // Find existing conflict group or create new one
      let conflictGroup = conflicts.find(group => 
        group.some(apt => apt.id === current.id || apt.id === next.id)
      );
      
      if (!conflictGroup) {
        conflictGroup = [current];
        conflicts.push(conflictGroup);
      }
      
      if (conflictGroup && !conflictGroup.some(apt => apt.id === next.id)) {
        conflictGroup.push(next);
      }
    }
  }
  
  return conflicts;
}

/**
 * Generate available time slots for booking
 */
export function generateAvailableSlots(
  date: Date,
  appointments: CalendarAppointment[],
  workingHours: { start: string; end: string },
  slotDuration: number = 30 // minutes
): Date[] {
  const dayStart = startOfDay(date);
  const [startHour = 9, startMinute = 0] = workingHours.start.split(':').map(Number);
  const [endHour = 17, endMinute = 0] = workingHours.end.split(':').map(Number);
  
  const workStart = addMinutes(dayStart, startHour * 60 + startMinute);
  const workEnd = addMinutes(dayStart, endHour * 60 + endMinute);
  
  const slots: Date[] = [];
  let currentSlot = workStart;
  
  while (currentSlot < workEnd) {
    const slotEnd = addMinutes(currentSlot, slotDuration);
    
    // Check if slot conflicts with any appointment
    const hasConflict = appointments.some(apt => 
      (currentSlot >= apt.startTime && currentSlot < apt.endTime) ||
      (slotEnd > apt.startTime && slotEnd <= apt.endTime) ||
      (currentSlot <= apt.startTime && slotEnd >= apt.endTime)
    );
    
    if (!hasConflict) {
      slots.push(new Date(currentSlot));
    }
    
    currentSlot = addMinutes(currentSlot, slotDuration);
  }
  
  return slots;
}

/**
 * Format appointment time range for display
 */
export function formatAppointmentTime(appointment: CalendarAppointment): string {
  const startTime = format(appointment.startTime, 'h:mm a');
  const endTime = format(appointment.endTime, 'h:mm a');
  return `${startTime} - ${endTime}`;
}

/**
 * Get current time indicator position
 */
export function getCurrentTimePosition(currentDate: Date): number | null {
  const now = new Date();
  
  // Only show current time indicator if viewing today
  if (!isSameDay(now, currentDate)) {
    return null;
  }
  
  const hours = now.getHours();
  const minutes = now.getMinutes();
  
  return (hours + minutes / 60) * CALENDAR_CONSTANTS.TIME_SLOT_HEIGHT;
}

/**
 * Calculate grid columns for different view types
 */
export function calculateGridColumns(viewType: CalendarView, therapistCount: number): string {
  const timeColumnWidth = '80px';
  
  if (viewType === 'day') {
    return therapistCount > 1 
      ? `${timeColumnWidth} repeat(${therapistCount}, 1fr)`
      : `${timeColumnWidth} 1fr`;
  } else {
    // Week view
    return therapistCount > 1
      ? `${timeColumnWidth} repeat(${therapistCount}, 1fr)`
      : `${timeColumnWidth} repeat(7, 1fr)`;
  }
}

/**
 * Get appointment color scheme based on service type and status
 */
export function getAppointmentColor(appointment: CalendarAppointment) {
  // Determine base color from service type
  const serviceType = appointment.service?.category?.toLowerCase() || appointment.type;
  const colorKey = SERVICE_COLORS[serviceType] || 'blue';
  const baseColors = appointmentColors[colorKey];
  
  // Add status modifiers
  let statusClasses = '';
  if (appointment.status && STATUS_MODIFIERS[appointment.status]) {
    statusClasses = STATUS_MODIFIERS[appointment.status];
  }
  
  return {
    bg: baseColors.bg,
    border: baseColors.border,
    text: baseColors.text,
    shadow: 'shadow-sm hover:shadow-md',
    hover: baseColors.hover,
    status: statusClasses
  };
}