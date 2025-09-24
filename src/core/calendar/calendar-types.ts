export type AppointmentStatus = 'scheduled' | 'checked-in' | 'completed' | 'cancelled' | 'no-show' | 'waitlist';
export type AppointmentType = 'appointment' | 'break' | 'blocked';
export type AppointmentColor = 'blue' | 'pink' | 'orange' | 'purple' | 'green' | 'gray';
export type UserRole = 'therapist' | 'admin';
export type CalendarView = 'day' | 'week' | 'month' | 'agenda' | 'timeline' | 'waitlist' | 'conflicts';

export interface CalendarAppointment {
  id: string;
  therapistId: string;
  clientId: string;
  serviceId: string;
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
  type: AppointmentType;
  title: string;
  patientName: string;
  notes?: string | undefined;
  color: AppointmentColor;
  createdBy?: 'therapist' | 'patient' | 'admin' | undefined;
  isDraggable?: boolean | undefined;
  isResizable?: boolean | undefined;
  minDuration?: number | undefined; // minutes
  maxDuration?: number | undefined; // minutes
  service?: Service | undefined;
  // Recurring appointment properties
  isRecurring?: boolean | undefined;
  recurrenceGroupId?: string | undefined;
  isException?: boolean | undefined;
  recurrencePattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate: Date | null;
    daysOfWeek?: number[] | undefined;
    dayOfMonth?: number | undefined;
    occurrences?: number | undefined;
  } | undefined;
}

export interface Therapist {
  id: string;
  name: string;
  avatar?: string;
  specialty: string;
  workingHours: WorkingHours;
  services: Service[];
  allowPatientBooking?: boolean;
}

export interface Service {
  id: string;
  name: string;
  duration: number; // minutes
  price: number;
  category: string;
  color: AppointmentColor;
}

export interface WorkingHours {
  [key: string]: { // day of week (monday, tuesday, etc.)
    start: string; // HH:mm format
    end: string;   // HH:mm format
    breaks: Array<{
      start: string;
      end: string;
      title: string;
    }>;
  };
}

export interface CalendarFilter {
  therapistIds: string[];
  serviceTypes: string[];
  appointmentStatuses: AppointmentStatus[];
  dateRange: {
    start: Date;
    end: Date;
  };
  createdBy?: ('therapist' | 'patient' | 'admin')[];
}

export interface CalendarViewConfig {
  userRole: UserRole;
  viewType: CalendarView;
  currentDate: Date;
  selectedTherapistId: string; // for therapist role
}

export interface ExtendedAppointment extends CalendarAppointment {
  client: {
    id: string;
    name: string;
    phone: string;
    email: string;
    membershipType?: string;
    membershipStatus?: 'active' | 'expired' | 'suspended';
    notes?: string;
  };
  service: Service;
  therapist: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface CalendarError {
  type: 'network' | 'permission' | 'validation' | 'unknown';
  message: string;
  recoverable: boolean;
  retryAction?: () => void;
}

// Component Props Interfaces
export interface CalendarContainerProps {
  userRole: UserRole;
  currentTherapistId?: string;
  initialDate?: Date;
  initialView?: CalendarView;
}

export interface CalendarGridProps {
  appointments: CalendarAppointment[];
  therapists: Therapist[];
  viewConfig: CalendarViewConfig;
  filters: CalendarFilter;
  onAppointmentClick: (appointment: CalendarAppointment) => void;
  onTimeSlotClick: (time: Date, therapistId?: string) => void;
}

export interface AppointmentBlockProps {
  appointment: CalendarAppointment;
  height: number;
  top: number;
  onClick: () => void;
  isActive?: boolean;
}

// New interfaces for month view and drag-drop
export interface MonthViewProps {
  appointments: CalendarAppointment[];
  therapists: Therapist[];
  currentDate: Date;
  userRole: UserRole;
  onDayClick: (date: Date) => void;
  onAppointmentClick: (appointment: CalendarAppointment) => void;
  maxEventsPerDay?: number;
}

export interface DragDropContext {
  draggedAppointment: CalendarAppointment | null;
  dropTarget: TimeSlot | null;
  isDragging: boolean;
  canDrop: boolean;
  conflictingAppointments: CalendarAppointment[];
}

export interface TimeSlot {
  time: Date;
  therapistId?: string;
  isAvailable: boolean;
}

export interface ContextMenuAction {
  id: string;
  label: string;
  icon: string;
  action: (target: CalendarAppointment | TimeSlot) => void;
  disabled?: boolean;
  separator?: boolean;
}

export interface DraggableAppointmentBlockProps {
  appointment: CalendarAppointment;
  height: number;
  top: number;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  isActive?: boolean;
  isDragging?: boolean;
  canDrag?: boolean;
  canResize?: boolean;
  onDragStart?: () => void;
  onDragEnd?: (newTime: Date) => void;
  onResize?: (newDuration: number) => void;
}

export interface ContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  target: CalendarAppointment | TimeSlot | null;
  actions: ContextMenuAction[];
  onClose: () => void;
  onActionClick: (action: ContextMenuAction) => void;
}

export interface AppointmentFormProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  appointment?: CalendarAppointment;
  initialTime?: Date;
  therapistId?: string;
  onSave: (appointment: CalendarAppointment) => void;
  onCancel: () => void;
  onDelete?: (appointmentId: string) => void;
}