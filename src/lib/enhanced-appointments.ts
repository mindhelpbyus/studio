import { Appointment, appointmentsDb } from './appointments';
import { CalendarAppointment, ExtendedAppointment, Therapist, Service, AppointmentStatus } from './calendar-types';
import { Provider, providersDb } from './providers';

/**
 * Enhanced appointment service with validation and business logic
 */
export class AppointmentService {
  /**
   * Validate appointment data
   */
  static validateAppointment(appointment: Partial<CalendarAppointment>): string[] {
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

    if (!appointment.startTime) {
      errors.push('Start time is required');
    }

    if (!appointment.endTime) {
      errors.push('End time is required');
    }

    if (appointment.startTime && appointment.endTime) {
      if (appointment.startTime >= appointment.endTime) {
        errors.push('End time must be after start time');
      }

      const duration = appointment.endTime.getTime() - appointment.startTime.getTime();
      const minDuration = 15 * 60 * 1000; // 15 minutes
      const maxDuration = 8 * 60 * 60 * 1000; // 8 hours

      if (duration < minDuration) {
        errors.push('Appointment must be at least 15 minutes long');
      }

      if (duration > maxDuration) {
        errors.push('Appointment cannot exceed 8 hours');
      }
    }

    if (!appointment.title || appointment.title.trim().length === 0) {
      errors.push('Appointment title is required');
    }

    return errors;
  }

  /**
   * Create a break/blocked time appointment
   */
  static createBreakAppointment(
    therapistId: string,
    startTime: Date,
    endTime: Date,
    title: string
  ): CalendarAppointment {
    return {
      id: `break-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      therapistId,
      clientId: '',
      serviceId: '',
      startTime,
      endTime,
      status: 'scheduled',
      type: 'break',
      title,
      color: 'gray'
    };
  }

  /**
   * Check if appointment can be rescheduled
   */
  static canReschedule(appointment: CalendarAppointment): boolean {
    const now = new Date();
    const appointmentTime = appointment.startTime;
    const hoursUntilAppointment = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Can't reschedule if appointment is in the past
    if (appointmentTime < now) {
      return false;
    }

    // Can't reschedule if appointment is within 2 hours
    if (hoursUntilAppointment < 2) {
      return false;
    }

    // Can't reschedule completed or cancelled appointments
    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return false;
    }

    return true;
  }

  /**
   * Check if appointment can be cancelled
   */
  static canCancel(appointment: CalendarAppointment): boolean {
    const now = new Date();
    const appointmentTime = appointment.startTime;

    // Can't cancel if appointment is in the past
    if (appointmentTime < now) {
      return false;
    }

    // Can't cancel already completed or cancelled appointments
    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return false;
    }

    return true;
  }

  /**
   * Get appointment status display text
   */
  static getStatusDisplayText(status: AppointmentStatus): string {
    const statusMap: Record<AppointmentStatus, string> = {
      'scheduled': 'Scheduled',
      'checked-in': 'Checked In',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'no-show': 'No Show'
    };

    return statusMap[status] || status;
  }

  /**
   * Calculate appointment duration in minutes
   */
  static getDurationMinutes(appointment: CalendarAppointment): number {
    return Math.round((appointment.endTime.getTime() - appointment.startTime.getTime()) / (1000 * 60));
  }

  /**
   * Check if appointment is happening now
   */
  static isCurrentAppointment(appointment: CalendarAppointment): boolean {
    const now = new Date();
    return now >= appointment.startTime && now <= appointment.endTime;
  }

  /**
   * Get appointment urgency level
   */
  static getUrgencyLevel(appointment: CalendarAppointment): 'low' | 'medium' | 'high' | 'overdue' {
    const now = new Date();
    const minutesUntil = (appointment.startTime.getTime() - now.getTime()) / (1000 * 60);

    if (minutesUntil < 0) {
      return 'overdue';
    } else if (minutesUntil <= 15) {
      return 'high';
    } else if (minutesUntil <= 60) {
      return 'medium';
    } else {
      return 'low';
    }
  }
}

/**
 * Working hours utility functions
 */
export class WorkingHoursService {
  /**
   * Check if a time falls within working hours
   */
  static isWithinWorkingHours(
    time: Date,
    workingHours: { start: string; end: string }
  ): boolean {
    const timeHours = time.getHours();
    const timeMinutes = time.getMinutes();
    const timeInMinutes = timeHours * 60 + timeMinutes;

    const [startHour, startMinute] = workingHours.start.split(':').map(Number);
    const [endHour, endMinute] = workingHours.end.split(':').map(Number);

    const startInMinutes = (startHour || 0) * 60 + (startMinute || 0);
    const endInMinutes = (endHour || 0) * 60 + (endMinute || 0);

    return timeInMinutes >= startInMinutes && timeInMinutes <= endInMinutes;
  }

  /**
   * Get break periods for a day
   */
  static getBreakPeriods(
    workingHours: { start: string; end: string; breaks: Array<{ start: string; end: string; title: string }> }
  ): Array<{ start: string; end: string; title: string }> {
    return workingHours.breaks || [];
  }

  /**
   * Calculate total working minutes in a day
   */
  static getTotalWorkingMinutes(
    workingHours: { start: string; end: string; breaks?: Array<{ start: string; end: string; title: string }> }
  ): number {
    const [startHour, startMinute] = workingHours.start.split(':').map(Number);
    const [endHour, endMinute] = workingHours.end.split(':').map(Number);

    const startInMinutes = (startHour || 0) * 60 + (startMinute || 0);
    const endInMinutes = (endHour || 0) * 60 + (endMinute || 0);

    let totalMinutes = endInMinutes - startInMinutes;

    // Subtract break time
    if (workingHours.breaks) {
      for (const breakPeriod of workingHours.breaks) {
        const [breakStartHour, breakStartMinute] = breakPeriod.start.split(':').map(Number);
        const [breakEndHour, breakEndMinute] = breakPeriod.end.split(':').map(Number);

        const breakStartInMinutes = (breakStartHour || 0) * 60 + (breakStartMinute || 0);
        const breakEndInMinutes = (breakEndHour || 0) * 60 + (breakEndMinute || 0);

        totalMinutes -= (breakEndInMinutes - breakStartInMinutes);
      }
    }

    return Math.max(0, totalMinutes);
  }
}

/**
 * Mock data generators for testing and development
 */
export class MockDataService {
  /**
   * Generate sample therapists
   */
  static generateSampleTherapists(): Therapist[] {
    return [
      {
        id: 'therapist-1',
        name: 'Marissa Johnson',
        avatar: 'https://picsum.photos/seed/marissa/100/100',
        specialty: 'Massage Therapy',
        workingHours: {
          monday: { start: '09:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00', title: 'Lunch Break' }] },
          tuesday: { start: '09:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00', title: 'Lunch Break' }] },
          wednesday: { start: '09:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00', title: 'Lunch Break' }] },
          thursday: { start: '09:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00', title: 'Lunch Break' }] },
          friday: { start: '09:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00', title: 'Lunch Break' }] }
        },
        services: [
          { id: 'service-1', name: 'Deep Tissue Massage', duration: 60, price: 120, category: 'Massage', color: 'blue' },
          { id: 'service-2', name: 'Swedish Massage', duration: 90, price: 150, category: 'Massage', color: 'blue' }
        ]
      },
      {
        id: 'therapist-2',
        name: 'Natalie Chen',
        avatar: 'https://picsum.photos/seed/natalie/100/100',
        specialty: 'Facial Treatments',
        workingHours: {
          monday: { start: '10:00', end: '18:00', breaks: [{ start: '13:00', end: '14:00', title: 'Lunch Break' }] },
          tuesday: { start: '10:00', end: '18:00', breaks: [{ start: '13:00', end: '14:00', title: 'Lunch Break' }] },
          wednesday: { start: '10:00', end: '18:00', breaks: [{ start: '13:00', end: '14:00', title: 'Lunch Break' }] },
          thursday: { start: '10:00', end: '18:00', breaks: [{ start: '13:00', end: '14:00', title: 'Lunch Break' }] },
          friday: { start: '10:00', end: '18:00', breaks: [{ start: '13:00', end: '14:00', title: 'Lunch Break' }] }
        },
        services: [
          { id: 'service-3', name: '60-Minute Facial', duration: 60, price: 100, category: 'Facial', color: 'pink' },
          { id: 'service-4', name: 'Anti-Aging Treatment', duration: 90, price: 180, category: 'Facial', color: 'pink' }
        ]
      },
      {
        id: 'therapist-3',
        name: 'Michael Rodriguez',
        avatar: 'https://picsum.photos/seed/michael/100/100',
        specialty: 'Nail Services',
        workingHours: {
          monday: { start: '09:00', end: '16:00', breaks: [{ start: '12:30', end: '13:30', title: 'Lunch Break' }] },
          tuesday: { start: '09:00', end: '16:00', breaks: [{ start: '12:30', end: '13:30', title: 'Lunch Break' }] },
          wednesday: { start: '09:00', end: '16:00', breaks: [{ start: '12:30', end: '13:30', title: 'Lunch Break' }] },
          thursday: { start: '09:00', end: '16:00', breaks: [{ start: '12:30', end: '13:30', title: 'Lunch Break' }] },
          friday: { start: '09:00', end: '16:00', breaks: [{ start: '12:30', end: '13:30', title: 'Lunch Break' }] }
        },
        services: [
          { id: 'service-5', name: 'Gel Manicure', duration: 45, price: 60, category: 'Nails', color: 'orange' },
          { id: 'service-6', name: 'Pedicure', duration: 60, price: 80, category: 'Nails', color: 'orange' }
        ]
      },
      {
        id: 'therapist-4',
        name: 'Chelsea Williams',
        avatar: 'https://picsum.photos/seed/chelsea/100/100',
        specialty: 'Hair Services',
        workingHours: {
          monday: { start: '08:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00', title: 'Lunch Break' }] },
          tuesday: { start: '08:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00', title: 'Lunch Break' }] },
          wednesday: { start: '08:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00', title: 'Lunch Break' }] },
          thursday: { start: '08:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00', title: 'Lunch Break' }] },
          friday: { start: '08:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00', title: 'Lunch Break' }] }
        },
        services: [
          { id: 'service-7', name: 'Haircut & Style', duration: 60, price: 85, category: 'Hair', color: 'purple' },
          { id: 'service-8', name: 'Hair Color', duration: 120, price: 150, category: 'Hair', color: 'purple' }
        ]
      }
    ];
  }

  /**
   * Generate sample appointments for a date
   */
  static generateSampleAppointments(date: Date): CalendarAppointment[] {
    const appointments: CalendarAppointment[] = [];
    const therapists = this.generateSampleTherapists();

    // Generate appointments for each therapist
    therapists.forEach((therapist, therapistIndex) => {
      const appointmentCount = Math.floor(Math.random() * 4) + 2; // 2-5 appointments per therapist

      for (let i = 0; i < appointmentCount; i++) {
        const startHour = 9 + Math.floor(Math.random() * 7); // 9 AM to 4 PM
        const startTime = new Date(date);
        startTime.setHours(startHour, Math.random() > 0.5 ? 0 : 30, 0, 0);

        const service = therapist.services[Math.floor(Math.random() * therapist.services.length)];
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + service.duration);

        appointments.push({
          id: `apt-${therapistIndex}-${i}`,
          therapistId: therapist.id,
          clientId: `client-${Math.floor(Math.random() * 100)}`,
          serviceId: service.id,
          startTime,
          endTime,
          status: ['scheduled', 'checked-in', 'completed'][Math.floor(Math.random() * 3)] as AppointmentStatus,
          type: 'appointment',
          title: service.name,
          clientName: ['John Smith', 'Sarah Johnson', 'Mike Davis', 'Lisa Brown', 'Tom Wilson'][Math.floor(Math.random() * 5)],
          color: service.color
        });
      }

      // Add lunch break
      const lunchStart = new Date(date);
      lunchStart.setHours(12, 0, 0, 0);
      const lunchEnd = new Date(date);
      lunchEnd.setHours(13, 0, 0, 0);

      appointments.push({
        id: `break-${therapistIndex}`,
        therapistId: therapist.id,
        clientId: '',
        serviceId: '',
        startTime: lunchStart,
        endTime: lunchEnd,
        status: 'scheduled',
        type: 'break',
        title: 'Lunch Break',
        color: 'gray'
      });
    });

    return appointments;
  }
}
/*
*
 * Integration service to connect new calendar system with existing appointment system
 */
export class CalendarIntegrationService {
  /**
   * Convert existing Appointment to CalendarAppointment
   */
  static convertToCalendarAppointment(
    appointment: Appointment,
    provider: Provider,
    serviceInfo?: { name: string; duration: number; color: string }
  ): CalendarAppointment {
    const [hours, minutes] = appointment.time.split(':').map(Number);
    const startTime = new Date(appointment.date);
    startTime.setHours(hours || 0, minutes || 0, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + (serviceInfo?.duration || 60));

    return {
      id: appointment.id,
      therapistId: appointment.providerId,
      clientId: appointment.patientName, // Using patient name as client ID for now
      serviceId: serviceInfo?.name || 'general',
      startTime,
      endTime,
      status: 'scheduled',
      type: 'appointment',
      title: serviceInfo?.name || 'Appointment',
      clientName: appointment.patientName,
      color: (serviceInfo?.color as any) || 'blue'
    };
  }

  /**
   * Convert CalendarAppointment back to existing Appointment format
   */
  static convertFromCalendarAppointment(calendarAppointment: CalendarAppointment): Omit<Appointment, 'id'> {
    const timeString = `${calendarAppointment.startTime.getHours().toString().padStart(2, '0')}:${calendarAppointment.startTime.getMinutes().toString().padStart(2, '0')}`;
    
    return {
      providerId: calendarAppointment.therapistId,
      date: calendarAppointment.startTime.toISOString().split('T')[0],
      time: timeString,
      patientName: calendarAppointment.clientName || 'Unknown'
    };
  }

  /**
   * Fetch appointments for calendar from existing system
   */
  static async fetchCalendarAppointments(
    providerId: string,
    date: Date
  ): Promise<CalendarAppointment[]> {
    try {
      const dateString = date.toISOString().split('T')[0];
      const appointments = await appointmentsDb.findForProviderByDate(providerId, dateString);
      const provider = await providersDb.findById(providerId);
      
      if (!provider) {
        throw new Error(`Provider not found: ${providerId}`);
      }

      return appointments.map(apt => 
        this.convertToCalendarAppointment(apt, provider, {
          name: `${provider.specialty} Session`,
          duration: 60,
          color: 'blue'
        })
      );
    } catch (error) {
      console.error('Error fetching calendar appointments:', error);
      return [];
    }
  }

  /**
   * Book appointment through existing system
   */
  static async bookCalendarAppointment(
    calendarAppointment: CalendarAppointment
  ): Promise<CalendarAppointment | null> {
    try {
      const appointmentData = this.convertFromCalendarAppointment(calendarAppointment);
      const bookedAppointment = await appointmentsDb.bookAppointment(appointmentData);
      
      if (!bookedAppointment) {
        return null; // Slot already booked
      }

      const provider = await providersDb.findById(bookedAppointment.providerId);
      if (!provider) {
        throw new Error(`Provider not found: ${bookedAppointment.providerId}`);
      }

      return this.convertToCalendarAppointment(bookedAppointment, provider, {
        name: calendarAppointment.title,
        duration: 60,
        color: calendarAppointment.color
      });
    } catch (error) {
      console.error('Error booking calendar appointment:', error);
      return null;
    }
  }

  /**
   * Cancel appointment through existing system
   */
  static async cancelCalendarAppointment(appointmentId: string): Promise<boolean> {
    try {
      return await appointmentsDb.cancelAppointment(appointmentId);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      return false;
    }
  }

  /**
   * Convert existing providers to therapists
   */
  static async fetchTherapists(): Promise<Therapist[]> {
    try {
      const providers = await providersDb.findAll();
      
      return providers.map(provider => ({
        id: provider.id,
        name: provider.name,
        avatar: provider.imageUrl,
        specialty: provider.specialty,
        workingHours: {
          monday: { start: '09:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00', title: 'Lunch Break' }] },
          tuesday: { start: '09:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00', title: 'Lunch Break' }] },
          wednesday: { start: '09:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00', title: 'Lunch Break' }] },
          thursday: { start: '09:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00', title: 'Lunch Break' }] },
          friday: { start: '09:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00', title: 'Lunch Break' }] }
        },
        services: [{
          id: `${provider.id}-service`,
          name: `${provider.specialty} Session`,
          duration: 60,
          price: 100,
          category: provider.specialty,
          color: this.getServiceColor(provider.specialty)
        }]
      }));
    } catch (error) {
      console.error('Error fetching therapists:', error);
      return [];
    }
  }

  /**
   * Get service color based on specialty
   */
  private static getServiceColor(specialty: string): any {
    const colorMap: Record<string, string> = {
      'Cardiology': 'blue',
      'Pediatrics': 'green',
      'Dermatology': 'pink',
      'Neurology': 'purple',
      'Oncology': 'orange',
      'General Practice': 'gray'
    };
    
    return colorMap[specialty] || 'blue';
  }
}