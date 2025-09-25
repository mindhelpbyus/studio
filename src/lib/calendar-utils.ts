import { CalendarAppointment } from './calendar-types';

export const HOUR_HEIGHT = 96; // pixels per hour

export const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  for (let i = 0; i < 24; i++) {
    slots.push(`${i.toString().padStart(2, '0')}:00`);
  }
  return slots;
};

export const calculateAppointmentPosition = (appointment: CalendarAppointment): { top: number; height: number } => {
  const start = new Date(appointment.startTime);
  const end = new Date(appointment.endTime);
  const startOfDay = new Date(start);
  startOfDay.setHours(0, 0, 0, 0);

  const top = (start.getTime() - startOfDay.getTime()) / (1000 * 60) * (HOUR_HEIGHT / 60);
  const height = (end.getTime() - start.getTime()) / (1000 * 60) * (HOUR_HEIGHT / 60);

  return { top, height };
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
