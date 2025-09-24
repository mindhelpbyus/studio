import { 
  Appointment, 
  RecurringAppointment, 
  AppointmentStatus 
} from './appointment.entity';
import { AppointmentRepository } from './appointment.repository';

export class AppointmentService {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  async validateAppointment(appointment: Partial<Appointment>): Promise<string[]> {
    const errors: string[] = [];

    if (!appointment.therapistId) {
      errors.push('Therapist ID is required');
    }

    if (!appointment.clientId) {
      errors.push('Client ID is required');
    }

    if (!appointment.serviceId) {
      errors.push('Service ID is required');
    }

    if (!appointment.startTime || !appointment.endTime) {
      errors.push('Start and end times are required');
    } else if (appointment.startTime >= appointment.endTime) {
      errors.push('End time must be after start time');
    }

    // Check for conflicts
    if (appointment.therapistId && appointment.startTime && appointment.endTime) {
      const hasConflict = await this.appointmentRepository.checkConflicts(
        appointment.therapistId,
        appointment.startTime,
        appointment.endTime,
        appointment.id // exclude current appointment for updates
      );

      if (hasConflict) {
        errors.push('The selected time slot conflicts with another appointment');
      }
    }

    return errors;
  }

  async scheduleAppointment(appointment: Omit<Appointment, 'id'>): Promise<Appointment> {
    const errors = await this.validateAppointment(appointment);
    if (errors.length > 0) {
      throw new Error('Invalid appointment: ' + errors.join(', '));
    }

    return this.appointmentRepository.create(appointment);
  }

  async scheduleRecurringAppointment(appointment: Omit<RecurringAppointment, 'id'>): Promise<RecurringAppointment> {
    const errors = await this.validateAppointment(appointment);
    if (errors.length > 0) {
      throw new Error('Invalid appointment: ' + errors.join(', '));
    }

    return this.appointmentRepository.createRecurring(appointment);
  }

  async updateAppointmentStatus(id: string, status: AppointmentStatus, reason?: string): Promise<Appointment> {
    return this.appointmentRepository.update(id, { 
      status, 
      cancellationReason: status === 'cancelled' ? reason : undefined 
    });
  }

  async getTherapistSchedule(therapistId: string, startDate: Date, endDate: Date): Promise<Appointment[]> {
    return this.appointmentRepository.findByTherapist(therapistId, startDate, endDate);
  }

  async getClientAppointments(clientId: string, startDate: Date, endDate: Date): Promise<Appointment[]> {
    return this.appointmentRepository.findByClient(clientId, startDate, endDate);
  }

  async cancelAppointment(id: string, reason: string): Promise<Appointment> {
    return this.updateAppointmentStatus(id, 'cancelled', reason);
  }

  async cancelRecurringSequence(parentAppointmentId: string): Promise<void> {
    return this.appointmentRepository.deleteRecurringSequence(parentAppointmentId);
  }
}