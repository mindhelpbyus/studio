import { isSameDay, addDays, eachDayOfInterval } from 'date-fns';
import { CalendarAppointment, Therapist } from './calendar-types';
import { ConflictDetectionService, ConflictResult } from './conflict-detection';

export class AdvancedConflictDetectionService extends ConflictDetectionService {
  /**
   * Enhanced conflict detection for recurring appointments
   */
  static async checkRecurringAppointmentConflicts(
    baseAppointment: CalendarAppointment,
    pattern: CalendarAppointment['recurrencePattern'],
    existingAppointments: CalendarAppointment[] = [],
    therapist?: Therapist
  ): Promise<{
    hasConflicts: boolean;
    conflicts: Array<{ date: Date; conflicts: CalendarAppointment[] }>;
  }> {
    if (!pattern) {
      throw new Error('Recurrence pattern is required');
    }

    const conflicts: Array<{ date: Date; conflicts: CalendarAppointment[] }> = [];
    const duration = 
      baseAppointment.endTime.getTime() - baseAppointment.startTime.getTime();
    let currentDate = new Date(baseAppointment.startTime);
    let occurrenceCount = 0;

    while (
      (!pattern.endDate || currentDate <= pattern.endDate) &&
      (!pattern.occurrences || occurrenceCount < pattern.occurrences)
    ) {
      // Check conflicts for current occurrence
      const occurrenceAppointment = {
        ...baseAppointment,
        startTime: currentDate,
        endTime: new Date(currentDate.getTime() + duration),
      };

      const conflictResult = await this.checkAppointmentConflicts(
        occurrenceAppointment,
        currentDate,
        undefined,
        existingAppointments,
        therapist
      );

      if (conflictResult.hasConflict) {
        conflicts.push({
          date: new Date(currentDate),
          conflicts: conflictResult.conflicts,
        });
      }

      // Move to next occurrence based on pattern
      switch (pattern.frequency) {
        case 'daily':
          currentDate = addDays(currentDate, pattern.interval);
          break;
        case 'weekly':
          if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
            let found = false;
            while (!found) {
              currentDate = addDays(currentDate, 1);
              if (pattern.daysOfWeek.includes(currentDate.getDay())) {
                found = true;
              }
            }
          } else {
            currentDate = addDays(currentDate, 7 * pattern.interval);
          }
          break;
        case 'monthly':
          if (pattern.dayOfMonth) {
            currentDate.setMonth(currentDate.getMonth() + pattern.interval);
            currentDate.setDate(pattern.dayOfMonth);
          } else {
            currentDate.setMonth(currentDate.getMonth() + pattern.interval);
          }
          break;
      }

      occurrenceCount++;
    }

    return {
      hasConflicts: conflicts.length > 0,
      conflicts,
    };
  }

  /**
   * Check conflicts for a date range
   */
  static async checkDateRangeConflicts(
    startDate: Date,
    endDate: Date,
    therapistId: string,
    existingAppointments: CalendarAppointment[]
  ): Promise<Map<string, CalendarAppointment[]>> {
    const conflicts = new Map<string, CalendarAppointment[]>();
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    for (const day of days) {
      const dayConflicts = existingAppointments.filter(apt => 
        apt.therapistId === therapistId && 
        isSameDay(apt.startTime, day)
      );
      
      if (dayConflicts.length > 0) {
        const dayKey = day.toISOString().split('T')[0];
        if (dayKey) {
          conflicts.set(dayKey, dayConflicts);
        }
      }
    }
    
    return conflicts;
  }

  /**
   * Suggest alternative slots for recurring appointments
   */
  static async suggestAlternativeRecurringSlots(
    baseAppointment: CalendarAppointment,
    pattern: CalendarAppointment['recurrencePattern'],
    existingAppointments: CalendarAppointment[],
    therapist: Therapist,
    maxSuggestions: number = 3
  ): Promise<Array<{ startDate: Date; endDate: Date | null }>> {
    const suggestions: Array<{ startDate: Date; endDate: Date | null }> = [];
    const duration = 
      baseAppointment.endTime.getTime() - baseAppointment.startTime.getTime();
    
    // Try different start dates
    let testDate = new Date(baseAppointment.startTime);
    while (suggestions.length < maxSuggestions) {
      testDate = addDays(testDate, 1);
      
      const testPattern = {
        ...pattern,
        startDate: testDate,
      };
      
      const conflictCheck = await this.checkRecurringAppointmentConflicts(
        {
          ...baseAppointment,
          startTime: testDate,
          endTime: new Date(testDate.getTime() + duration),
        },
        pattern,
        existingAppointments,
        therapist
      );
      
      if (!conflictCheck.hasConflicts) {
        suggestions.push({
          startDate: testDate,
          endDate: pattern?.endDate ?? null,
        });
      }
    }
    
    return suggestions;
  }
}