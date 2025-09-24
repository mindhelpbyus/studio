import { CalendarAppointment, CalendarFormAppointment } from '@/core/calendar/types/calendar.types';
import { Therapist } from '@/healthcare/provider-management/domain/provider.types';

export interface AppointmentFormProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  appointment: CalendarFormAppointment;
  initialTime: Date | null | undefined;
  therapistId: string;
  therapists: Therapist[];
  onClose: () => void;
  onSave: (appointment: CalendarAppointment) => Promise<void> | void;
  onCancel: () => void;
  onDelete: (id: string) => Promise<void> | void;
  onConflictCheck?: (appointment: CalendarAppointment) => Promise<CalendarAppointment[]> | Promise<boolean> | boolean;
}