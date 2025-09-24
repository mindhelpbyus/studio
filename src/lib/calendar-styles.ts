import { AppointmentColor } from './calendar-types';

// Appointment color schemes matching the reference design
export const appointmentColors: Record<AppointmentColor, {
  bg: string;
  border: string;
  text: string;
  hover: string;
}> = {
  blue: {
    bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
    border: 'border-l-4 border-blue-400',
    text: 'text-blue-900',
    hover: 'hover:from-blue-100 hover:to-blue-150'
  },
  pink: {
    bg: 'bg-gradient-to-br from-pink-50 to-pink-100',
    border: 'border-l-4 border-pink-400',
    text: 'text-pink-900',
    hover: 'hover:from-pink-100 hover:to-pink-150'
  },
  orange: {
    bg: 'bg-gradient-to-br from-orange-50 to-orange-100',
    border: 'border-l-4 border-orange-400',
    text: 'text-orange-900',
    hover: 'hover:from-orange-100 hover:to-orange-150'
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
    border: 'border-l-4 border-purple-400',
    text: 'text-purple-900',
    hover: 'hover:from-purple-100 hover:to-purple-150'
  },
  green: {
    bg: 'bg-gradient-to-br from-green-50 to-green-100',
    border: 'border-l-4 border-green-400',
    text: 'text-green-900',
    hover: 'hover:from-green-100 hover:to-green-150'
  },
  gray: {
    bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
    border: 'border-l-4 border-gray-400',
    text: 'text-gray-700',
    hover: 'hover:from-gray-100 hover:to-gray-150'
  }
};

// Active/selected appointment colors
export const activeAppointmentColors: Record<AppointmentColor, {
  bg: string;
  border: string;
  text: string;
  ring: string;
}> = {
  blue: {
    bg: 'bg-gradient-to-br from-blue-100 to-blue-200',
    border: 'border-l-4 border-blue-500',
    text: 'text-blue-900',
    ring: 'ring-2 ring-blue-200'
  },
  pink: {
    bg: 'bg-gradient-to-br from-pink-100 to-pink-200',
    border: 'border-l-4 border-pink-500',
    text: 'text-pink-900',
    ring: 'ring-2 ring-pink-200'
  },
  orange: {
    bg: 'bg-gradient-to-br from-orange-100 to-orange-200',
    border: 'border-l-4 border-orange-500',
    text: 'text-orange-900',
    ring: 'ring-2 ring-orange-200'
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-100 to-purple-200',
    border: 'border-l-4 border-purple-500',
    text: 'text-purple-900',
    ring: 'ring-2 ring-purple-200'
  },
  green: {
    bg: 'bg-gradient-to-br from-green-100 to-green-200',
    border: 'border-l-4 border-green-500',
    text: 'text-green-900',
    ring: 'ring-2 ring-green-200'
  },
  gray: {
    bg: 'bg-gradient-to-br from-gray-100 to-gray-200',
    border: 'border-l-4 border-gray-500',
    text: 'text-gray-800',
    ring: 'ring-2 ring-gray-200'
  }
};

// Break/blocked time styling
export const breakAppointmentStyles = {
  opacity: 'opacity-75',
  pattern: 'bg-stripes bg-stripes-gray-300',
  border: 'border-dashed'
};

// Calendar layout constants
export const CALENDAR_CONSTANTS = {
  TIME_SLOT_HEIGHT: 4, // rem per hour (64px)
  APPOINTMENT_PADDING: 0.75, // rem (12px)
  MINIMUM_APPOINTMENT_HEIGHT: 2, // rem (32px)
  SIDEBAR_WIDTH: 24, // rem (384px)
  COLUMN_MIN_WIDTH: 12, // rem (192px)
  APPOINTMENT_GAP: 0.25, // rem gap between appointments
  HEADER_HEIGHT: 4 // rem (64px)
};

// Typography classes
export const TYPOGRAPHY = {
  appointmentTitle: 'text-sm font-semibold uppercase tracking-wide truncate',
  clientName: 'text-base font-medium truncate',
  timeRange: 'text-sm opacity-75 truncate',
  therapistName: 'text-lg font-bold',
  columnHeader: 'text-sm font-medium uppercase tracking-wide',
  dayHeader: 'text-2xl font-bold',
  dayLabel: 'text-sm font-medium uppercase tracking-wide text-muted-foreground'
};

// Service type to color mapping
export const SERVICE_COLORS: Record<string, AppointmentColor> = {
  'massage': 'blue',
  'facial': 'pink',
  'manicure': 'orange',
  'pedicure': 'purple',
  'consultation': 'green',
  'break': 'gray',
  'blocked': 'gray'
};

// Status-based styling modifiers
export const STATUS_MODIFIERS = {
  cancelled: 'opacity-50 line-through',
  'no-show': 'opacity-60 border-red-400',
  'checked-in': 'ring-2 ring-green-300',
  completed: 'opacity-80'
};