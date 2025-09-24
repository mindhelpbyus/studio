import { CalendarAppointment } from '../calendar-types';
import { ResizeManager } from '../resize-manager';

// Mock the conflict detection service
jest.mock('../conflict-detection', () => ({
  ConflictDetectionService: {
    checkAppointmentConflicts: jest.fn(),
  },
}));

const mockAppointment: CalendarAppointment = {
  id: 'apt-1',
  therapistId: 'therapist-1',
  clientId: 'client-1',
  serviceId: 'service-1',
  startTime: new Date(2024, 0, 15, 10, 0), // 10:00 AM
  endTime: new Date(2024, 0, 15, 11, 0),   // 11:00 AM
  status: 'scheduled',
  type: 'appointment',
  title: 'Test Appointment',
  clientName: 'John Doe',
  color: 'blue',
  minDuration: 15,
  maxDuration: 240,
};

describe('ResizeManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateResizedAppointment', () => {
    it('calculates bottom resize correctly', () => {
      const result = ResizeManager.calculateResizedAppointment(
        mockAppointment,
        'bottom',
        90 // 1.5 hours
      );

      expect(result.startTime).toEqual(mockAppointment.startTime);
      expect(result.endTime).toEqual(new Date(2024, 0, 15, 11, 30)); // 11:30 AM
    });

    it('calculates top resize correctly', () => {
      const result = ResizeManager.calculateResizedAppointment(
        mockAppointment,
        'top',
        90 // 1.5 hours
      );

      expect(result.startTime).toEqual(new Date(2024, 0, 15, 9, 30)); // 9:30 AM
      expect(result.endTime).toEqual(mockAppointment.endTime);
    });

    it('snaps duration to interval', () => {
      const result = ResizeManager.calculateResizedAppointment(
        mockAppointment,
        'bottom',
        67 // Should snap to 60 or 75
      );

      // Duration should be snapped to 15-minute interval
      const actualDuration = (result.endTime.getTime() - result.startTime.getTime()) / (1000 * 60);
      expect(actualDuration % 15).toBe(0);
    });
  });

  describe('validateResize', () => {
    it('validates successful resize', async () => {
      const { ConflictDetectionService } = require('../conflict-detection');
      ConflictDetectionService.checkAppointmentConflicts.mockResolvedValue({
        hasConflict: false,
        conflicts: [],
      });

      const result = await ResizeManager.validateResize(
        mockAppointment,
        'bottom',
        90
      );

      expect(result.success).toBe(true);
      expect(result.updatedAppointment).toBeDefined();
    });

    it('rejects resize with conflicts', async () => {
      const { ConflictDetectionService } = require('../conflict-detection');
      ConflictDetectionService.checkAppointmentConflicts.mockResolvedValue({
        hasConflict: true,
        conflicts: [mockAppointment],
        reason: 'Appointment overlaps',
      });

      const result = await ResizeManager.validateResize(
        mockAppointment,
        'bottom',
        90
      );

      expect(result.success).toBe(false);
      expect(result.conflicts).toEqual([mockAppointment]);
      expect(result.error).toBe('Appointment overlaps');
    });

    it('rejects resize below minimum duration', async () => {
      const result = await ResizeManager.validateResize(
        mockAppointment,
        'bottom',
        10 // Below minimum of 15
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Duration must be between');
    });

    it('rejects resize above maximum duration', async () => {
      const result = await ResizeManager.validateResize(
        mockAppointment,
        'bottom',
        300 // Above maximum of 240
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Duration must be between');
    });
  });

  describe('getResizeConstraints', () => {
    it('returns appointment-specific constraints', () => {
      const constraints = ResizeManager.getResizeConstraints(mockAppointment);

      expect(constraints.minDuration).toBe(15);
      expect(constraints.maxDuration).toBe(240);
      expect(constraints.snapInterval).toBe(15);
    });

    it('returns default constraints when not specified', () => {
      const appointmentWithoutConstraints = {
        ...mockAppointment,
        minDuration: undefined,
        maxDuration: undefined,
      };

      const constraints = ResizeManager.getResizeConstraints(appointmentWithoutConstraints);

      expect(constraints.minDuration).toBe(15); // Default minimum
      expect(constraints.maxDuration).toBe(480); // Default maximum
    });
  });

  describe('getResizeFeedback', () => {
    it('provides feedback for valid resize', () => {
      const feedback = ResizeManager.getResizeFeedback(
        mockAppointment,
        'bottom',
        60, // current
        90  // target
      );

      expect(feedback.isValid).toBe(true);
      expect(feedback.deltaMinutes).toBe(30);
      expect(feedback.message).toContain('Extending from end: 30 minutes');
    });

    it('provides feedback for invalid resize (too short)', () => {
      const feedback = ResizeManager.getResizeFeedback(
        mockAppointment,
        'bottom',
        60, // current
        10  // target (below minimum)
      );

      expect(feedback.isValid).toBe(false);
      expect(feedback.message).toContain('Minimum duration: 15 minutes');
    });

    it('provides feedback for invalid resize (too long)', () => {
      const feedback = ResizeManager.getResizeFeedback(
        mockAppointment,
        'bottom',
        60,  // current
        300  // target (above maximum)
      );

      expect(feedback.isValid).toBe(false);
      expect(feedback.message).toContain('Maximum duration: 240 minutes');
    });

    it('provides feedback for shortening appointment', () => {
      const feedback = ResizeManager.getResizeFeedback(
        mockAppointment,
        'top',
        60, // current
        45  // target (shorter)
      );

      expect(feedback.isValid).toBe(true);
      expect(feedback.deltaMinutes).toBe(-15);
      expect(feedback.message).toContain('Shortening from start: 15 minutes');
    });
  });

  describe('getSuggestedDurations', () => {
    it('returns common durations within constraints', () => {
      const suggestions = ResizeManager.getSuggestedDurations(mockAppointment);

      expect(suggestions).toContain(15);
      expect(suggestions).toContain(30);
      expect(suggestions).toContain(60);
      expect(suggestions).toContain(90);
      expect(suggestions).toContain(120);
      expect(suggestions).toContain(180);
      expect(suggestions).toContain(240);
      
      // Should not contain durations outside constraints
      expect(suggestions).not.toContain(10); // Below minimum
      expect(suggestions).not.toContain(300); // Above maximum
    });

    it('includes current duration in suggestions', () => {
      const suggestions = ResizeManager.getSuggestedDurations(mockAppointment);
      
      // Current duration is 60 minutes
      expect(suggestions).toContain(60);
    });
  });

  describe('formatDuration', () => {
    it('formats minutes correctly', () => {
      expect(ResizeManager.formatDuration(30)).toBe('30m');
      expect(ResizeManager.formatDuration(45)).toBe('45m');
    });

    it('formats hours correctly', () => {
      expect(ResizeManager.formatDuration(60)).toBe('1h');
      expect(ResizeManager.formatDuration(120)).toBe('2h');
    });

    it('formats hours and minutes correctly', () => {
      expect(ResizeManager.formatDuration(90)).toBe('1h 30m');
      expect(ResizeManager.formatDuration(135)).toBe('2h 15m');
    });
  });

  describe('canResize', () => {
    it('allows resize for valid appointment', () => {
      const futureAppointment = {
        ...mockAppointment,
        startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        endTime: new Date(Date.now() + 3 * 60 * 60 * 1000),   // 3 hours from now
      };

      expect(ResizeManager.canResize(futureAppointment)).toBe(true);
    });

    it('prevents resize for non-resizable appointment', () => {
      const nonResizableAppointment = {
        ...mockAppointment,
        isResizable: false,
      };

      expect(ResizeManager.canResize(nonResizableAppointment)).toBe(false);
    });

    it('prevents resize for completed appointment', () => {
      const completedAppointment = {
        ...mockAppointment,
        status: 'completed' as const,
      };

      expect(ResizeManager.canResize(completedAppointment)).toBe(false);
    });

    it('prevents resize for cancelled appointment', () => {
      const cancelledAppointment = {
        ...mockAppointment,
        status: 'cancelled' as const,
      };

      expect(ResizeManager.canResize(cancelledAppointment)).toBe(false);
    });

    it('prevents resize for past appointment', () => {
      const pastAppointment = {
        ...mockAppointment,
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        endTime: new Date(Date.now() - 1 * 60 * 60 * 1000),   // 1 hour ago
      };

      expect(ResizeManager.canResize(pastAppointment)).toBe(false);
    });

    it('prevents resize for appointment starting soon', () => {
      const soonAppointment = {
        ...mockAppointment,
        startTime: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
        endTime: new Date(Date.now() + 75 * 60 * 1000),   // 75 minutes from now
      };

      expect(ResizeManager.canResize(soonAppointment)).toBe(false);
    });
  });

  describe('getResizeCursor', () => {
    it('returns correct cursor for top direction', () => {
      expect(ResizeManager.getResizeCursor('top', false)).toBe('cursor-n-resize');
    });

    it('returns correct cursor for bottom direction', () => {
      expect(ResizeManager.getResizeCursor('bottom', false)).toBe('cursor-s-resize');
    });

    it('returns resize cursor when actively resizing', () => {
      expect(ResizeManager.getResizeCursor('top', true)).toBe('cursor-ns-resize');
      expect(ResizeManager.getResizeCursor('bottom', true)).toBe('cursor-ns-resize');
    });
  });
});