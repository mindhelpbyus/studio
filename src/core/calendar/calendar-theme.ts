import { CalendarAppointment } from './calendar-types';

export interface CalendarTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    muted: string;
    border: string;
    hover: string;
    selected: string;
    currentTime: string;
    status: {
      scheduled: string;
      'checked-in': string;
      completed: string;
      cancelled: string;
      'no-show': string;
    };
    services: {
      therapy: string;
      consultation: string;
      group: string;
      workshop: string;
      assessment: string;
    };
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
    };
    fontWeight: {
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
    };
  };
  spacing: {
    unit: number;
    timeSlotHeight: number;
    headerHeight: number;
    sidebarWidth: number;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
  animations: {
    duration: string;
    easing: string;
  };
}

export const defaultTheme: CalendarTheme = {
  colors: {
    primary: 'var(--primary)',
    secondary: 'var(--secondary)',
    accent: 'var(--accent)',
    background: 'var(--background)',
    text: 'var(--foreground)',
    muted: 'var(--muted)',
    border: 'var(--border)',
    hover: 'var(--accent-foreground)',
    selected: 'var(--primary)',
    currentTime: 'var(--destructive)',
    status: {
      scheduled: 'var(--blue-500)',
      'checked-in': 'var(--green-500)',
      completed: 'var(--gray-500)',
      cancelled: 'var(--red-500)',
      'no-show': 'var(--yellow-500)',
    },
    services: {
      therapy: 'var(--blue-500)',
      consultation: 'var(--purple-500)',
      group: 'var(--green-500)',
      workshop: 'var(--orange-500)',
      assessment: 'var(--pink-500)',
    },
  },
  typography: {
    fontFamily: 'var(--font-sans)',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  spacing: {
    unit: 4,
    timeSlotHeight: 60,
    headerHeight: 64,
    sidebarWidth: 300,
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  },
  animations: {
    duration: '200ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// Utility functions for working with themes
export const getAppointmentColors = (
  appointment: CalendarAppointment,
  theme: CalendarTheme = defaultTheme,
  isActive: boolean = false
) => {
  const getStatusColor = () => {
    const statusColors = {
      ...theme.colors.status,
      'waitlist': theme.colors.status['scheduled'] // Use scheduled color for waitlist
    };
    return statusColors[appointment.status] || theme.colors.muted;
  };
  const getServiceColor = () => {
    if (appointment.service?.category) {
      return theme.colors.services[appointment.service.category as keyof typeof theme.colors.services] || theme.colors.primary;
    }
    return theme.colors.primary;
  };

  return {
    background: isActive ? `${getStatusColor()}20` : `${getStatusColor()}10`,
    border: getStatusColor(),
    text: theme.colors.text,
    accent: getServiceColor(),
  };
};

export const generateCalendarStyles = (theme: CalendarTheme = defaultTheme) => {
  return {
    container: `bg-${theme.colors.background} text-${theme.colors.text}`,
    header: `h-[${theme.spacing.headerHeight}px] border-b border-${theme.colors.border}`,
    sidebar: `w-[${theme.spacing.sidebarWidth}px] border-r border-${theme.colors.border}`,
    timeSlot: `h-[${theme.spacing.timeSlotHeight}px] border-b border-${theme.colors.border}`,
    appointment: `rounded-${theme.borderRadius.md} shadow-${theme.shadows.sm} transition-all duration-${theme.animations.duration}`,
  };
};