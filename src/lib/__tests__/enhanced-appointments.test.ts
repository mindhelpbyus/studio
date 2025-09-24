import { describe, it, expect } from '@jest/globals';
import { AppointmentService, WorkingHoursService, MockDataService } from '../enhanced-appointments';
import { CalendarAppointment } from '../calendar-types';

describe('AppointmentService', () => {
  describe('validateAppointment', () => {
    it('should validate required fields', () => {
      const invalidAppointment = {};
      const errors = AppointmentService.validateAppointment(invalidAppointment);
      
      expect(errors).toContain('Therapist ID is required');
      expect(errors).toContain('Client ID is required');
      expect(errors).toContain('Service ID is required');
      expect(errors).toContain('Start time is required');
      expect(errors).toContain('End time is required');
      expect(errors).toContain('Appointment title is required');
    });

    it('should validate time logic', () => {
      const invalidTimeAppointment = {
        therapistId: 'therapist1',
        clientId: 'client1',
        serviceId: 'service1',
        startTime: new Date('2024-01-01T12:00:00'),
        endTime: new Date('2024-01-01T11:00:00'), // End before start
        title: 'Test Appointment'
      };
      
      const errors = AppointmentService.validateAppointment(invalidTimeAppointment);
      expect(errors).toContain('End time must be after start time');
    });

    it('should validate minimum duration', () => {
      const shortAppointment = {
        therapistId: 'therapist1',
        clientId: 'client1',
        serviceId: 'service1',
        startTime: new Date('2024-01-01T12:00:00'),
        endTime: new Date('2024-01-01T12:10:00'), // 10 minutes
        title: 'Test Appointment'
      };
      
      const errors = AppointmentService.validateAppointment(shortAppointment);
      expect(errors).toContain('Appointment must be at least 15 minutes long');
    });
  });

  describe('canReschedule', () => {
    it('should allow rescheduling future appointments', () => {
      const futureAppointment: CalendarAppointment = {
        id: '1',
        therapistId: 'therapist1',
        clientId: 'client1',
        serviceId: 'service1',
        startTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
        endTime: new Date(Date.now() + 5 * 60 * 60 * 1000),
        status: 'scheduled',
        type: 'appointment',
        title: 'Test Appointment',
        color: 'blue'
      };

      expect(AppointmentService.canReschedule(futureAppointment)).toBe(true);
    });

    it('should not allow rescheduling past appointments', () => {
      const pastAppointment: CalendarAppointment = {
        id: '1',
        therapistId: 'therapist1',
        clientId: 'client1',
        serviceId: 'service1',
        startTime: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        endTime: new Date(Date.now() - 30 * 60 * 1000),
        status: 'scheduled',
        type: 'appointment',
        title: 'Test Appointment',
        color: 'blue'
      };

      expect(AppointmentService.canReschedule(pastAppointment)).toBe(false);
    });
  });

  describe('getDurationMinutes', () => {
    it('should calculate duration correctly', () => {
      const appointment: CalendarAppointment = {
        id: '1',
        therapistId: 'therapist1',
        clientId: 'client1',
        serviceId: 'service1',
        startTime: new Date('2024-01-01T10:00:00'),
        endTime: new Date('2024-01-01T11:30:00'),
        status: 'scheduled',
        type: 'appointment',
        title: 'Test Appointment',
        color: 'blue'
      };

      expect(AppointmentService.getDurationMinutes(appointment)).toBe(90);
    });
  });
});

describe('WorkingHoursService', () => {
  describe('isWithinWorkingHours', () => {
    it('should correctly identify working hours', () => {
      const workingHours = { start: '09:00', end: '17:00' };
      
      const morningTime = new Date('2024-01-01T10:00:00');
      const eveningTime = new Date('2024-01-01T18:00:00');
      const earlyTime = new Date('2024-01-01T08:00:00');

      expect(WorkingHoursService.isWithinWorkingHours(morningTime, workingHours)).toBe(true);
      expect(WorkingHoursService.isWithinWorkingHours(eveningTime, workingHours)).toBe(false);
      expect(WorkingHoursService.isWithinWorkingHours(earlyTime, workingHours)).toBe(false);
    });
  });

  describe('getTotalWorkingMinutes', () => {
    it('should calculate total working minutes without breaks', () => {
      const workingHours = { start: '09:00', end: '17:00' };
      expect(WorkingHoursService.getTotalWorkingMinutes(workingHours)).toBe(480); // 8 hours
    });

    it('should calculate total working minutes with breaks', () => {
      const workingHours = {
        start: '09:00',
        end: '17:00',
        breaks: [
          { start: '12:00', end: '13:00', title: 'Lunch' },
          { start: '15:00', end: '15:15', title: 'Break' }
        ]
      };
      expect(WorkingHoursService.getTotalWorkingMinutes(workingHours)).toBe(405); // 8 hours - 1 hour - 15 minutes
    });
  });
});

describe('MockDataService', () => {
  describe('generateSampleTherapists', () => {
    it('should generate therapists with required fields', () => {
      const therapists = MockDataService.generateSampleTherapists();
      
      expect(therapists.length).toBeGreaterThan(0);
      
      therapists.forEach(therapist => {
        expect(therapist.id).toBeDefined();
        expect(therapist.name).toBeDefined();
        expect(therapist.specialty).toBeDefined();
        expect(therapist.workingHours).toBeDefined();
        expect(therapist.services.length).toBeGreaterThan(0);
      });
    });
  });

  describe('generateSampleAppointments', () => {
    it('should generate appointments for a given date', () => {
      const testDate = new Date('2024-01-01');
      const appointments = MockDataService.generateSampleAppointments(testDate);
      
      expect(appointments.length).toBeGreaterThan(0);
      
      appointments.forEach(appointment => {
        expect(appointment.id).toBeDefined();
        expect(appointment.therapistId).toBeDefined();
        expect(appointment.startTime).toBeDefined();
        expect(appointment.endTime).toBeDefined();
        expect(appointment.title).toBeDefined();
      });
    });
  });
});