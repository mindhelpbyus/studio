import { CalendarAppointment } from '@/core/calendar/types/appointment.types';

export interface AppointmentDetailSidebarProps {
  isOpen: boolean;
  appointment: CalendarAppointment;
  onClose: () => void;
  onUpdate: () => Promise<void>;
  onDelete: () => Promise<void>;
  onCheckIn: () => void;
  onCancel: () => void;
}