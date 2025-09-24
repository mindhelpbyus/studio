import { CalendarAppointment } from './calendar-types';
import { ConflictDetectionService } from './conflict-detection';

export interface ResizeOperation {
  appointment: CalendarAppointment;
  direction: 'top' | 'bottom';
  newDuration: number; // in minutes
  newStartTime?: Date; // for top resize
  newEndTime: Date;
}

export interface ResizeResult {
  success: boolean;
  updatedAppointment?: CalendarAppointment;
  conflicts?: CalendarAppointment[];
  error?: string;
}

export class ResizeManager {
  private static readonly MIN_DURATION = 15; // 15 minutes
  private static readonly MAX_DURATION = 480; // 8 hours
  private static readonly SNAP_INTERVAL = 15; // 15 minutes

  /**
   * Calculate new appointment times based on resize operation
   */
  static calculateResizedAppointment(
    appointment: CalendarAppointment,
    direction: 'top' | 'bottom',
    newDurationMinutes: number
  ): CalendarAppointment {
    const newDuration = this.snapToInterval(newDurationMinutes, this.SNAP_INTERVAL);
    
    if (direction === 'bottom') {
      // Resize from bottom - start time stays the same, end time changes
      const newEndTime = new Date(appointment.startTime.getTime() + newDuration * 60 * 1000);
      
      return {
        ...appointment,
        endTime: newEndTime,
      };
    } else {
      // Resize from top - end time stays the same, start time changes
      const newStartTime = new Date(appointment.endTime.getTime() - newDuration * 60 * 1000);
      
      return {
        ...appointment,
        startTime: newStartTime,
      };
    }
  }

  /**
   * Validate resize operation
   */
  static async validateResize(
    appointment: CalendarAppointment,
    direction: 'top' | 'bottom',
    newDurationMinutes: number,
    existingAppointments: CalendarAppointment[] = [],
    therapist?: any
  ): Promise<ResizeResult> {
    // Apply duration constraints
    const constrainedDuration = this.applyDurationConstraints(
      newDurationMinutes,
      appointment.minDuration,
      appointment.maxDuration
    );

    if (constrainedDuration !== newDurationMinutes) {
      return {
        success: false,
        error: `Duration must be between ${appointment.minDuration || this.MIN_DURATION} and ${appointment.maxDuration || this.MAX_DURATION} minutes`,
      };
    }

    // Calculate new appointment times
    const resizedAppointment = this.calculateResizedAppointment(
      appointment,
      direction,
      constrainedDuration
    );

    // Check for conflicts
    try {
      const conflictResult = await ConflictDetectionService.checkAppointmentConflicts(
        resizedAppointment,
        resizedAppointment.startTime,
        constrainedDuration,
        existingAppointments,
        therapist
      );

      if (conflictResult.hasConflict) {
        return {
          success: false,
          conflicts: conflictResult.conflicts,
          error: conflictResult.reason,
        };
      }

      return {
        success: true,
        updatedAppointment: resizedAppointment,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to validate resize operation',
      };
    }
  }

  /**
   * Apply duration constraints
   */
  private static applyDurationConstraints(
    duration: number,
    minDuration?: number,
    maxDuration?: number
  ): number {
    const min = minDuration || this.MIN_DURATION;
    const max = maxDuration || this.MAX_DURATION;
    
    return Math.max(min, Math.min(max, duration));
  }

  /**
   * Snap duration to interval
   */
  private static snapToInterval(duration: number, interval: number): number {
    return Math.round(duration / interval) * interval;
  }

  /**
   * Get resize constraints for an appointment
   */
  static getResizeConstraints(appointment: CalendarAppointment): {
    minDuration: number;
    maxDuration: number;
    snapInterval: number;
  } {
    return {
      minDuration: appointment.minDuration || this.MIN_DURATION,
      maxDuration: appointment.maxDuration || this.MAX_DURATION,
      snapInterval: this.SNAP_INTERVAL,
    };
  }

  /**
   * Calculate visual feedback for resize operation
   */
  static getResizeFeedback(
    appointment: CalendarAppointment,
    direction: 'top' | 'bottom',
    currentDuration: number,
    targetDuration: number
  ): {
    isValid: boolean;
    message: string;
    deltaMinutes: number;
  } {
    const deltaMinutes = targetDuration - currentDuration;
    const constraints = this.getResizeConstraints(appointment);
    
    const isValid = targetDuration >= constraints.minDuration && 
                   targetDuration <= constraints.maxDuration;

    let message = '';
    if (!isValid) {
      if (targetDuration < constraints.minDuration) {
        message = `Minimum duration: ${constraints.minDuration} minutes`;
      } else if (targetDuration > constraints.maxDuration) {
        message = `Maximum duration: ${constraints.maxDuration} minutes`;
      }
    } else {
      const action = deltaMinutes > 0 ? 'Extending' : 'Shortening';
      const fromDirection = direction === 'top' ? 'start' : 'end';
      message = `${action} from ${fromDirection}: ${Math.abs(deltaMinutes)} minutes`;
    }

    return {
      isValid,
      message,
      deltaMinutes,
    };
  }

  /**
   * Get suggested durations for an appointment
   */
  static getSuggestedDurations(appointment: CalendarAppointment): number[] {
    const constraints = this.getResizeConstraints(appointment);
    const suggestions: number[] = [];
    
    // Common appointment durations
    const commonDurations = [15, 30, 45, 60, 90, 120, 180, 240];
    
    for (const duration of commonDurations) {
      if (duration >= constraints.minDuration && duration <= constraints.maxDuration) {
        suggestions.push(duration);
      }
    }
    
    // Add current duration if not already included
    const currentDuration = Math.round(
      (appointment.endTime.getTime() - appointment.startTime.getTime()) / (1000 * 60)
    );
    
    if (!suggestions.includes(currentDuration)) {
      suggestions.push(currentDuration);
      suggestions.sort((a, b) => a - b);
    }
    
    return suggestions;
  }

  /**
   * Format duration for display
   */
  static formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      
      if (remainingMinutes === 0) {
        return `${hours}h`;
      } else {
        return `${hours}h ${remainingMinutes}m`;
      }
    }
  }

  /**
   * Check if appointment can be resized
   */
  static canResize(appointment: CalendarAppointment): boolean {
    // Check if appointment allows resizing
    if (appointment.isResizable === false) {
      return false;
    }

    // Check if appointment is in a state that allows resizing
    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return false;
    }

    // Check if appointment is in the past
    const now = new Date();
    if (appointment.endTime < now) {
      return false;
    }

    // Check if appointment is too close to start time (within 30 minutes)
    const minutesUntilStart = (appointment.startTime.getTime() - now.getTime()) / (1000 * 60);
    if (minutesUntilStart < 30 && minutesUntilStart > 0) {
      return false;
    }

    return true;
  }

  /**
   * Get resize cursor style based on direction and state
   */
  static getResizeCursor(direction: 'top' | 'bottom', isResizing: boolean): string {
    if (isResizing) {
      return 'cursor-ns-resize';
    }
    
    return direction === 'top' ? 'cursor-n-resize' : 'cursor-s-resize';
  }
}