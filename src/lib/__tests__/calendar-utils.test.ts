import { describe, it, expect } from '@jest/globals';
import {
  generateTimeSlots,
  formatTimeSlot,
  calculateAppointmentPosition,
  filterAppointmentsForDay,
  sortAppointmentsByTime,
  appointmentsOverlap,
  formatAppointmentTime
} from '../calendar-utils';
import { CalendarAppointment } from '../calendar-types';

describe('Calendar Utils', () => {
  describe('generateTimeSlots', () => {
    it('should generate 24 time slots', () => {
      const slots = generateTimeSlots();
      expect(slots).toHaveLength(24);
      expect(slots[0]).toBe('0:00');
      expect(slots[23]).toBe('23:00');
    });
  });

  describe('formatTimeSlot', () => {
    it('should format time slots correctly', () => {
      expect(formatTimeSlot('0:00')).toBe('12:00 AM');
      expect(formatTimeSlot('9:00')).toBe('9:00 AM');
      expect(formatTimeSlot('12:00')).toBe('12:00 PM');
      expect(formatTimeSlot('15:00')).toBe('3:00 PM');
      expect(formatTimeSlot('23:00')).toBe('11:00 PM');
    });
  });

  describe('calculateAppointmentPosition', () => {
    it('should calculate correct position and height', () => {
      const appointment: CalendarAppointment = {
        id: '1',
        therapistId: 'therapist1',
        clientId: 'client1',
        serviceId: 'service1',
        startTime: new Date('2024-01-01T10:30:00'),
        endTime: new Date('2024-01-01T12:00:00'),
        status: 'scheduled',
        type: 'appointment',
        title: 'Test Appointment',
        color: 'blue'
      };

      const position = calculateAppointmentPosition(appointment);
      
      // 10.5 hours * 4 rem = 42 rem
      expect(position.top).toBe(42);
      // 1.5 hours * 4 rem - 0.25 gap = 5.75 rem
      expect(position.height).toBe(5.75);
    });
  });

  describe('appointmentsOverlap', () => {
    it('should detect overlapping appointments', () => {
      const apt1: CalendarAppointment = {
        id: '1',
        therapistId: 'therapist1',
        clientId: 'client1',
        serviceId: 'service1',
        startTime: new Date('2024-01-01T10:00:00'),
        endTime: new Date('2024-01-01T11:00:00'),
        status: 'scheduled',
        type: 'appointment',
        title: 'Appointment 1',
        color: 'blue'
      };

      const apt2: CalendarAppointment = {
        id: '2',
        therapistId: 'therapist1',
        clientId: 'client2',
        serviceId: 'service2',
        startTime: new Date('2024-01-01T10:30:00'),
        endTime: new Date('2024-01-01T11:30:00'),
        status: 'scheduled',
        type: 'appointment',
        title: 'Appointment 2',
        color: 'pink'
      };

      const apt3: CalendarAppointment = {
        id: '3',
        therapistId: 'therapist1',
        clientId: 'client3',
        serviceId: 'service3',
        startTime: new Date('2024-01-01T12:00:00'),
        endTime: new Date('2024-01-01T13:00:00'),
        status: 'scheduled',
        type: 'appointment',
        title: 'Appointment 3',
        color: 'green'
      };

      expect(appointmentsOverlap(apt1, apt2)).toBe(true);
      expect(appointmentsOverlap(apt1, apt3)).toBe(false);
      expect(appointmentsOverlap(apt2, apt3)).toBe(false);
    });
  });

  describe('sortAppointmentsByTime', () => {
    it('should sort appointments by start time', () => {
      const appointments: CalendarAppointment[] = [
        {
          id: '2',
          therapistId: 'therapist1',
          clientId: 'client2',
          serviceId: 'service2',
          startTime: new Date('2024-01-01T14:00:00'),
          endTime: new Date('2024-01-01T15:00:00'),
          status: 'scheduled',
          type: 'appointment',
          title: 'Later Appointment',
          color: 'pink'
        },
        {
          id: '1',
          therapistId: 'therapist1',
          clientId: 'client1',
          serviceId: 'service1',
          startTime: new Date('2024-01-01T10:00:00'),
          endTime: new Date('2024-01-01T11:00:00'),
          status: 'scheduled',
          type: 'appointment',
          title: 'Earlier Appointment',
          color: 'blue'
        }
      ];

      const sorted = sortAppointmentsByTime(appointments);
      expect(sorted[0].id).toBe('1');
      expect(sorted[1].id).toBe('2');
    });
  });
});