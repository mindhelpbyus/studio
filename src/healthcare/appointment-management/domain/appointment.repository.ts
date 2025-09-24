import { Appointment, RecurringAppointment } from './appointment.entity';

export interface AppointmentRepository {
  findById(id: string): Promise<Appointment | null>;
  findByTherapist(therapistId: string, startDate: Date, endDate: Date): Promise<Appointment[]>;
  findByClient(clientId: string, startDate: Date, endDate: Date): Promise<Appointment[]>;
  findRecurring(parentAppointmentId: string): Promise<RecurringAppointment[]>;
  create(appointment: Omit<Appointment, 'id'>): Promise<Appointment>;
  createRecurring(appointment: Omit<RecurringAppointment, 'id'>): Promise<RecurringAppointment>;
  update(id: string, appointment: Partial<Appointment>): Promise<Appointment>;
  delete(id: string): Promise<void>;
  deleteRecurringSequence(parentAppointmentId: string): Promise<void>;
  checkConflicts(therapistId: string, startTime: Date, endTime: Date, excludeAppointmentId?: string): Promise<boolean>;
}