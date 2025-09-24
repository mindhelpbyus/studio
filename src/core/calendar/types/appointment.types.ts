import { AppointmentStatus } from '@/healthcare/appointment-management/domain/appointment.entity';

export interface CalendarAppointment {
  id: string;
  therapistId: string;
  clientId: string;
  clientName: string;  // Required for calendar display
  serviceId: string;
  serviceName?: string;
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
  notes?: string;
  color?: string;
  isRecurring?: boolean;
  isBlocked?: boolean;
  isDragging?: boolean;
  isResizing?: boolean;
}

export type CalendarFormAppointment = CalendarAppointment | null | undefined;

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  therapistId: string;
}

export interface CalendarViewConfig {
  view: 'day' | 'week' | 'month' | 'agenda';
  date: Date;
  therapistId?: string;
}