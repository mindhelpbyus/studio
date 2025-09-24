import { Service } from '@/lib/calendar-types';

export type AppointmentStatus = 
  | 'scheduled'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no-show';

export interface Appointment {
  id: string;
  therapistId: string;
  clientId: string;
  serviceId: string;
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
  notes?: string | undefined;
  cancellationReason?: string | undefined;
  clientName: string;
}

export interface AppointmentWithDetails extends Appointment {
  therapistName: string;
  clientName: string;
  serviceName: string;
  serviceColor: string;
}

export interface RecurringAppointmentPattern {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number; // e.g., every 2 weeks
  daysOfWeek?: number[]; // 0 = Sunday, 6 = Saturday
  endDate: Date;
  exceptions?: Date[]; // Dates to skip
}

export interface RecurringAppointment extends Appointment {
  recurringPattern: RecurringAppointmentPattern;
  parentAppointmentId?: string;
}