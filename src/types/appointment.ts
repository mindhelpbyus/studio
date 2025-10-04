export interface Appointment {
  id: string;
  therapistId: string;
  clientId: string;
  serviceId: string;
  title: string;
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'confirmed' | 'pending' | 'cancelled';
  type: 'appointment' | 'break' | 'tentative';
  patientName: string;
  color: string;
  isDraggable: boolean;
  isResizable: boolean;
  createdBy: 'therapist' | 'patient';
  notes?: string;
  therapistName: string;
  clientName: string; // Added clientName
}

export interface Therapist {
  id: string;
  name: string;
  color: string;
  email: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  membershipType?: string;
}

export type CalendarView = 'day' | 'week' | 'month' | 'agenda';
export type UserRole = 'therapist' | 'admin';

export interface CalendarState {
  currentDate: Date;
  view: CalendarView;
  selectedTherapistIds: string[];
  userRole: UserRole;
  currentUserId: string;
}
