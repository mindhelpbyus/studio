import { CalendarAppointment, Therapist } from './calendar-types';
import { WorkingHoursService } from './enhanced-appointments';

export interface ConflictResult {
  hasConflict: boolean;
  conflicts: CalendarAppointment[];
  reason?: string;
}

export class ConflictDetectionService {
  /**
   * Check if an appointment can be scheduled at a specific time
   */
  static async checkAppointmentConflicts(
    appointment: CalendarAppointment,
    newStartTime: Date,
    newDuration?: number, // in minutes
    existingAppointments: CalendarAppointment[] = [],
    therapist?: Therapist
  ): Promise<ConflictResult> {
    const duration = newDuration || this.getAppointmentDuration(appointment);
    const newEndTime = new Date(newStartTime.getTime() + duration * 60 * 1000);

    // Check working hours if therapist is provided
    if (therapist) {
      const workingHoursCheck = this.checkWorkingHours(newStartTime, newEndTime, therapist);
      if (workingHoursCheck.hasConflict) {
        return workingHoursCheck;
      }
    }

    // Check for overlapping appointments
    const overlappingAppointments = this.findOverlappingAppointments(
      appointment.id,
      appointment.therapistId,
      newStartTime,
      newEndTime,
      existingAppointments
    );

    if (overlappingAppointments.length > 0) {
      return {
        hasConflict: true,
        conflicts: overlappingAppointments,
        reason: 'Appointment overlaps with existing bookings',
      };
    }

    // Check minimum duration requirements
    if (appointment.minDuration && duration < appointment.minDuration) {
      return {
        hasConflict: true,
        conflicts: [],
        reason: `Appointment duration must be at least ${appointment.minDuration} minutes`,
      };
    }

    // Check maximum duration requirements
    if (appointment.maxDuration && duration > appointment.maxDuration) {
      return {
        hasConflict: true,
        conflicts: [],
        reason: `Appointment duration cannot exceed ${appointment.maxDuration} minutes`,
      };
    }

    return {
      hasConflict: false,
      conflicts: [],
    };
  }

  /**
   * Check if the appointment time falls within working hours
   */
  private static checkWorkingHours(
    startTime: Date,
    endTime: Date,
    therapist: Therapist
  ): ConflictResult {
    const dayOfWeek = this.getDayOfWeek(startTime);
    const workingHours = therapist.workingHours[dayOfWeek];

    if (!workingHours) {
      return {
        hasConflict: true,
        conflicts: [],
        reason: `${therapist.name} is not available on ${dayOfWeek}`,
      };
    }

    // Check if appointment is within working hours
    if (!WorkingHoursService.isWithinWorkingHours(startTime, workingHours) ||
        !WorkingHoursService.isWithinWorkingHours(endTime, workingHours)) {
      return {
        hasConflict: true,
        conflicts: [],
        reason: `Appointment is outside working hours (${workingHours.start} - ${workingHours.end})`,
      };
    }

    // Check if appointment conflicts with break periods
    const breakConflict = this.checkBreakConflicts(startTime, endTime, workingHours.breaks);
    if (breakConflict.hasConflict) {
      return breakConflict;
    }

    return {
      hasConflict: false,
      conflicts: [],
    };
  }

  /**
   * Check if appointment conflicts with break periods
   */
  private static checkBreakConflicts(
    startTime: Date,
    endTime: Date,
    breaks: Array<{ start: string; end: string; title: string }>
  ): ConflictResult {
    for (const breakPeriod of breaks) {
      const [breakStartHour, breakStartMinute] = breakPeriod.start.split(':').map(Number);
      const [breakEndHour, breakEndMinute] = breakPeriod.end.split(':').map(Number);

      const breakStart = new Date(startTime);
      breakStart.setHours(breakStartHour || 0, breakStartMinute || 0, 0, 0);

      const breakEnd = new Date(startTime);
      breakEnd.setHours(breakEndHour || 0, breakEndMinute || 0, 0, 0);

      // Check if appointment overlaps with break
      if (this.timesOverlap(startTime, endTime, breakStart, breakEnd)) {
        return {
          hasConflict: true,
          conflicts: [],
          reason: `Appointment conflicts with ${breakPeriod.title} (${breakPeriod.start} - ${breakPeriod.end})`,
        };
      }
    }

    return {
      hasConflict: false,
      conflicts: [],
    };
  }

  /**
   * Find appointments that overlap with the given time range
   */
  private static findOverlappingAppointments(
    appointmentId: string,
    therapistId: string,
    startTime: Date,
    endTime: Date,
    existingAppointments: CalendarAppointment[]
  ): CalendarAppointment[] {
    return existingAppointments.filter(apt => {
      // Skip the appointment being moved/resized
      if (apt.id === appointmentId) return false;
      
      // Only check appointments for the same therapist
      if (apt.therapistId !== therapistId) return false;
      
      // Check if times overlap
      return this.timesOverlap(startTime, endTime, apt.startTime, apt.endTime);
    });
  }

  /**
   * Check if two time ranges overlap
   */
  private static timesOverlap(
    start1: Date,
    end1: Date,
    start2: Date,
    end2: Date
  ): boolean {
    return start1 < end2 && start2 < end1;
  }

  /**
   * Get appointment duration in minutes
   */
  private static getAppointmentDuration(appointment: CalendarAppointment): number {
    return Math.round((appointment.endTime.getTime() - appointment.startTime.getTime()) / (1000 * 60));
  }

  /**
   * Get day of week string from date
   */
  private static getDayOfWeek(date: Date): string {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  }

  /**
   * Check if a time slot is available for booking
   */
  static isTimeSlotAvailable(
    time: Date,
    duration: number, // in minutes
    therapistId: string,
    existingAppointments: CalendarAppointment[],
    therapist?: Therapist
  ): boolean {
    const endTime = new Date(time.getTime() + duration * 60 * 1000);

    // Check working hours
    if (therapist) {
      const dayOfWeek = this.getDayOfWeek(time);
      const workingHours = therapist.workingHours[dayOfWeek];
      
      if (!workingHours) return false;
      
      if (!WorkingHoursService.isWithinWorkingHours(time, workingHours) ||
          !WorkingHoursService.isWithinWorkingHours(endTime, workingHours)) {
        return false;
      }

      // Check break conflicts
      const breakConflict = this.checkBreakConflicts(time, endTime, workingHours.breaks);
      if (breakConflict.hasConflict) return false;
    }

    // Check for overlapping appointments
    const overlapping = this.findOverlappingAppointments('', therapistId, time, endTime, existingAppointments);
    return overlapping.length === 0;
  }

  /**
   * Get available time slots for a therapist on a given day
   */
  static getAvailableTimeSlots(
    date: Date,
    therapist: Therapist,
    existingAppointments: CalendarAppointment[],
    slotDuration: number = 30, // minutes
    minSlotDuration: number = 15 // minimum slot duration
  ): Date[] {
    const dayOfWeek = this.getDayOfWeek(date);
    const workingHours = therapist.workingHours[dayOfWeek];
    
    if (!workingHours) return [];

    const [startHour, startMinute] = workingHours.start.split(':').map(Number);
    const [endHour, endMinute] = workingHours.end.split(':').map(Number);

    const dayStart = new Date(date);
    dayStart.setHours(startHour || 0, startMinute || 0, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(endHour || 0, endMinute || 0, 0, 0);

    const availableSlots: Date[] = [];
    let currentTime = new Date(dayStart);

    while (currentTime < dayEnd) {
      const slotEnd = new Date(currentTime.getTime() + slotDuration * 60 * 1000);
      
      if (slotEnd <= dayEnd && this.isTimeSlotAvailable(
        currentTime,
        slotDuration,
        therapist.id,
        existingAppointments,
        therapist
      )) {
        availableSlots.push(new Date(currentTime));
      }

      currentTime = new Date(currentTime.getTime() + minSlotDuration * 60 * 1000);
    }

    return availableSlots;
  }

  /**
   * Suggest alternative time slots when there's a conflict
   */
  static suggestAlternativeSlots(
    appointment: CalendarAppointment,
    requestedTime: Date,
    therapist: Therapist,
    existingAppointments: CalendarAppointment[],
    maxSuggestions: number = 5
  ): Date[] {
    const duration = this.getAppointmentDuration(appointment);
    const requestedDate = new Date(requestedTime);
    requestedDate.setHours(0, 0, 0, 0);

    // Get all available slots for the day
    const availableSlots = this.getAvailableTimeSlots(
      requestedDate,
      therapist,
      existingAppointments,
      duration,
      15 // 15-minute increments
    );

    // Sort by proximity to requested time
    const sortedSlots = availableSlots
      .map(slot => ({
        slot,
        distance: Math.abs(slot.getTime() - requestedTime.getTime()),
      }))
      .sort((a, b) => a.distance - b.distance)
      .map(item => item.slot)
      .slice(0, maxSuggestions);

    return sortedSlots;
  }
}