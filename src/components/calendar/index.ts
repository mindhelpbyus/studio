// Main calendar components
export { CalendarContainer } from './calendar-container';
export { CalendarGrid } from './calendar-grid';
export { CalendarHeader } from './calendar-header';
export { CalendarColumn } from './calendar-column';
export { TimeColumn } from './time-column';
export { AppointmentBlock } from './appointment-block';
export { AppointmentDetailSidebar } from './appointment-detail-sidebar';
export { CalendarFilters } from './calendar-filters';

// Responsive and optimized components
export { ResponsiveCalendar } from './responsive-calendar';
export { 
  OptimizedCalendarContainer,
  MemoizedAppointmentBlock,
  OptimizedAppointmentList,
  useDebouncedFilter,
  useCalendarPerformance
} from './optimized-calendar';

// Accessibility components
export { 
  CalendarAccessibility,
  useCalendarKeyboardNavigation,
  CalendarAriaLabels,
  CalendarFocusManager
} from './calendar-accessibility';

// Types and utilities
export type { CalendarContainerProps } from './calendar-container';