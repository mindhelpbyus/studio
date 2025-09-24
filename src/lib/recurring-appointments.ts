import { CalendarAppointment } from './calendar-types';
import { addDays, addWeeks, addMonths, setDate, getDate } from 'date-fns';

export type RecurrencePattern = {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number; // e.g., every 2 weeks
  endDate: Date | null;
  daysOfWeek?: number[]; // 0-6 for weekly recurrence
  dayOfMonth?: number; // for monthly recurrence
  occurrences?: number; // alternative to endDate
};

export class RecurringAppointmentService {
  /**
   * Generate recurring appointments based on a pattern
   */
  static generateRecurringAppointments(
    baseAppointment: CalendarAppointment,
    pattern: RecurrencePattern
  ): CalendarAppointment[] {
    const appointments: CalendarAppointment[] = [];
    const duration = baseAppointment.endTime.getTime() - baseAppointment.startTime.getTime();
    let currentDate = new Date(baseAppointment.startTime);
    let occurrenceCount = 0;

    while (
      (!pattern.endDate || currentDate <= pattern.endDate) &&
      (!pattern.occurrences || occurrenceCount < pattern.occurrences)
    ) {
      // Create new appointment instance
      const appointment: CalendarAppointment = {
        ...baseAppointment,
        id: `${baseAppointment.id}-${occurrenceCount}`,
        startTime: new Date(currentDate),
        endTime: new Date(currentDate.getTime() + duration),
        isRecurring: true,
        recurrenceGroupId: baseAppointment.id,
      };
      appointments.push(appointment);

      // Calculate next occurrence
      switch (pattern.frequency) {
        case 'daily':
          currentDate = addDays(currentDate, pattern.interval);
          break;
        case 'weekly':
          if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
            // Handle multiple days per week
            currentDate = this.getNextWeeklyOccurrence(currentDate, pattern);
          } else {
            currentDate = addWeeks(currentDate, pattern.interval);
          }
          break;
        case 'monthly':
          if (pattern.dayOfMonth) {
            currentDate = this.getNextMonthlyOccurrence(currentDate, pattern);
          } else {
            currentDate = addMonths(currentDate, pattern.interval);
          }
          break;
      }
      
      occurrenceCount++;
    }

    return appointments;
  }

  /**
   * Calculate next weekly occurrence based on pattern
   */
  private static getNextWeeklyOccurrence(
    currentDate: Date,
    pattern: RecurrencePattern
  ): Date {
    if (!pattern.daysOfWeek || pattern.daysOfWeek.length === 0) {
      return addWeeks(currentDate, pattern.interval);
    }

    let nextDate = addDays(currentDate, 1);
    while (true) {
      if (pattern.daysOfWeek.includes(nextDate.getDay())) {
        return nextDate;
      }
      nextDate = addDays(nextDate, 1);
    }
  }

  /**
   * Calculate next monthly occurrence based on pattern
   */
  private static getNextMonthlyOccurrence(
    currentDate: Date,
    pattern: RecurrencePattern
  ): Date {
    const nextDate = addMonths(currentDate, pattern.interval);
    if (pattern.dayOfMonth) {
      return setDate(nextDate, pattern.dayOfMonth);
    }
    return nextDate;
  }

  /**
   * Update a single occurrence or the entire series
   */
  static async updateRecurringAppointment(
    appointment: CalendarAppointment,
    updateAll: boolean,
    updates: Partial<CalendarAppointment>
  ): Promise<CalendarAppointment[]> {
    if (!appointment.recurrenceGroupId) {
      throw new Error('Not a recurring appointment');
    }

    if (updateAll) {
      // Update all future occurrences
      const allAppointments = await this.getRecurringAppointments(appointment.recurrenceGroupId);
      return allAppointments.map(apt => ({
        ...apt,
        ...updates,
        id: apt.id, // Preserve individual IDs
        recurrenceGroupId: appointment.recurrenceGroupId,
      }));
    } else {
      // Update single occurrence
      return [{
        ...appointment,
        ...updates,
        recurrenceGroupId: appointment.recurrenceGroupId,
        isException: true,
      }];
    }
  }

  /**
   * Get all appointments in a recurrence series
   */
  static async getRecurringAppointments(
    recurrenceGroupId: string
  ): Promise<CalendarAppointment[]> {
    // TODO: Implement fetching from database
    return [];
  }
}