import { 
  Appointment, 
  RecurringAppointment,
  AppointmentWithDetails 
} from '../domain/appointment.entity';
import { AppointmentRepository } from '../domain/appointment.repository';
import { createClient } from '@/infrastructure/database';

export class AppointmentRepositoryImpl implements AppointmentRepository {
  private readonly db = createClient();

  async findById(id: string): Promise<Appointment | null> {
    const appointment = await this.db.appointment.findUnique({
      where: { id }
    });
    return appointment;
  }

  async findByTherapist(therapistId: string, startDate: Date, endDate: Date): Promise<Appointment[]> {
    return this.db.appointment.findMany({
      where: {
        therapistId,
        startTime: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });
  }

  async findByClient(clientId: string, startDate: Date, endDate: Date): Promise<Appointment[]> {
    return this.db.appointment.findMany({
      where: {
        clientId,
        startTime: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });
  }

  async findRecurring(parentAppointmentId: string): Promise<RecurringAppointment[]> {
    return this.db.appointment.findMany({
      where: {
        parentAppointmentId
      },
      orderBy: {
        startTime: 'asc'
      }
    }) as Promise<RecurringAppointment[]>;
  }

  async create(appointment: Omit<Appointment, 'id'>): Promise<Appointment> {
    return this.db.appointment.create({
      data: appointment
    });
  }

  async createRecurring(appointment: Omit<RecurringAppointment, 'id'>): Promise<RecurringAppointment> {
    return this.db.appointment.create({
      data: appointment
    }) as Promise<RecurringAppointment>;
  }

  async update(id: string, appointment: Partial<Appointment>): Promise<Appointment> {
    return this.db.appointment.update({
      where: { id },
      data: appointment
    });
  }

  async delete(id: string): Promise<void> {
    await this.db.appointment.delete({
      where: { id }
    });
  }

  async deleteRecurringSequence(parentAppointmentId: string): Promise<void> {
    await this.db.appointment.deleteMany({
      where: {
        parentAppointmentId
      }
    });
  }

  async checkConflicts(
    therapistId: string, 
    startTime: Date, 
    endTime: Date, 
    excludeAppointmentId?: string
  ): Promise<boolean> {
    const conflicts = await this.db.appointment.findMany({
      where: {
        therapistId,
        id: {
          not: excludeAppointmentId
        },
        OR: [
          {
            // New appointment starts during an existing appointment
            startTime: {
              gte: startTime,
              lt: endTime
            }
          },
          {
            // New appointment ends during an existing appointment
            endTime: {
              gt: startTime,
              lte: endTime
            }
          },
          {
            // New appointment completely encompasses an existing appointment
            AND: [
              {
                startTime: {
                  lte: startTime
                }
              },
              {
                endTime: {
                  gte: endTime
                }
              }
            ]
          }
        ]
      }
    });

    return conflicts.length > 0;
  }
}