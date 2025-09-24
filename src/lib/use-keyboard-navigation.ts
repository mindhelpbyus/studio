'use client';

import { 
  addDays, 
  subDays, 
  addWeeks, 
  subWeeks, 
  addMonths, 
  subMonths 
} from 'date-fns';
import { useEffect, useCallback } from 'react';
import { CalendarView } from '@/lib/calendar-types';

type KeyboardNavigationProps = {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onToday: () => void;
  onViewChange?: (view: CalendarView) => void;
  onNewAppointment?: () => void;
  currentView?: CalendarView;
};

export function useKeyboardNavigation({
  currentDate,
  onDateChange,
  onToday,
  onViewChange,
  onNewAppointment,
  currentView
}: KeyboardNavigationProps) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Skip if user is typing in an input or textarea
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement
    ) {
      return;
    }

    // Get modifier keys state
    const isCtrlPressed = event.ctrlKey || event.metaKey;
    const isShiftPressed = event.shiftKey;

    // Handle navigation shortcuts
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        if (isCtrlPressed) {
          onDateChange(subMonths(currentDate, 1));
        } else if (isShiftPressed) {
          onDateChange(subWeeks(currentDate, 1));
        } else {
          onDateChange(subDays(currentDate, 1));
        }
        break;

      case 'ArrowRight':
        event.preventDefault();
        if (isCtrlPressed) {
          onDateChange(addMonths(currentDate, 1));
        } else if (isShiftPressed) {
          onDateChange(addWeeks(currentDate, 1));
        } else {
          onDateChange(addDays(currentDate, 1));
        }
        break;

      case 't':
        if (isCtrlPressed) {
          event.preventDefault();
          onToday();
        }
        break;

      case 'd':
        if (isCtrlPressed) {
          event.preventDefault();
          onViewChange?.('day');
        }
        break;

      case 'w':
        if (isCtrlPressed) {
          event.preventDefault();
          onViewChange?.('week');
        }
        break;

      case 'm':
        if (isCtrlPressed) {
          event.preventDefault();
          onViewChange?.('month');
        }
        break;

      case 'a':
        if (isCtrlPressed && !isShiftPressed) {
          event.preventDefault();
          onViewChange?.('agenda');
        }
        break;

      case 'n':
        if (isCtrlPressed) {
          event.preventDefault();
          onNewAppointment?.();
        }
        break;
    }
  }, [currentDate, onDateChange, onToday, onViewChange, onNewAppointment]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    shortcuts: [
      { key: '←', description: 'Previous day' },
      { key: 'Shift + ←', description: 'Previous week' },
      { key: 'Ctrl/⌘ + ←', description: 'Previous month' },
      { key: '→', description: 'Next day' },
      { key: 'Shift + →', description: 'Next week' },
      { key: 'Ctrl/⌘ + →', description: 'Next month' },
      { key: 'Ctrl/⌘ + T', description: 'Go to today' },
      { key: 'Ctrl/⌘ + D', description: 'Day view' },
      { key: 'Ctrl/⌘ + W', description: 'Week view' },
      { key: 'Ctrl/⌘ + M', description: 'Month view' },
      { key: 'Ctrl/⌘ + A', description: 'Agenda view' },
      { key: 'Ctrl/⌘ + N', description: 'New appointment' },
    ]
  };
}