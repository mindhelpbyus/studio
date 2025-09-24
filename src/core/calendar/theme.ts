export interface CalendarTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: {
    primary: string;
    secondary: string;
  };
  text: {
    primary: string;
    secondary: string;
    accent: string;
  };
  grid: {
    color: string;
    backgroundColor: string;
  };
  appointment: {
    defaultBackground: string;
    defaultText: string;
    activeBackground: string;
    activeText: string;
    dragBackground: string;
    conflictBackground: string;
  };
}

export const defaultTheme: CalendarTheme = {
  primary: '#2563eb',
  secondary: '#64748b',
  accent: '#f59e0b',
  background: {
    primary: '#ffffff',
    secondary: '#f8fafc'
  },
  text: {
    primary: '#1e293b',
    secondary: '#64748b',
    accent: '#f59e0b'
  },
  grid: {
    color: '#e2e8f0',
    backgroundColor: '#ffffff'
  },
  appointment: {
    defaultBackground: '#2563eb',
    defaultText: '#ffffff',
    activeBackground: '#1d4ed8',
    activeText: '#ffffff',
    dragBackground: 'rgba(37, 99, 235, 0.5)',
    conflictBackground: '#ef4444'
  }
};