import { AppointmentStatus } from '@/healthcare/appointment-management/domain/appointment.entity';
import { AppointmentType, AppointmentColor } from '@/lib/calendar-types';

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
  type: AppointmentType;
  title: string;
  patientName: string;
  notes?: string;
  color: AppointmentColor;
  isRecurring?: boolean;
  isBlocked?: boolean;
  isDraggable?: boolean;
  isResizable?: boolean;
  isDragging?: boolean;
  isResizing?: boolean;
  createdBy?: 'therapist' | 'patient' | 'admin';
  recurrencePattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate: Date | null;
    daysOfWeek?: string[];
  };
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