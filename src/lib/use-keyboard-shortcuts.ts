import { addDays, addWeeks, addMonths, subDays, subWeeks, subMonths } from 'date-fns';
import { useEffect, useCallback } from 'react';
import { CalendarView } from '../types/appointment';

interface KeyboardShortcutOptions {
  onDateChange: (date: Date) => void;
  onViewChange: (view: CalendarView) => void;
  onNewAppointment: () => void;
  onToday: () => void;
  onDeleteAppointment?: () => void;
  onEditAppointment?: () => void;
  onCopyAppointment?: () => void;
  onRefresh?: () => void;
  onSearch?: () => void;
  onToggleSidebar?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onPrint?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  currentDate: Date;
  currentView: CalendarView;
}

export function useKeyboardShortcuts(options: KeyboardShortcutOptions) {
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Don't handle shortcuts when typing in inputs
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement
    ) {
      return;
    }

    const isCtrlPressed = event.ctrlKey || event.metaKey;
    const isShiftPressed = event.shiftKey;
    const isAltPressed = event.altKey;

    // Navigation shortcuts
    switch (event.key.toLowerCase()) {
      // Basic navigation
      case 'arrowleft':
        if (!isCtrlPressed && !isShiftPressed) {
          event.preventDefault();
          options.onDateChange(subDays(options.currentDate, 1));
        } else if (isCtrlPressed && !isShiftPressed) {
          event.preventDefault();
          options.onDateChange(subWeeks(options.currentDate, 1));
        } else if (isCtrlPressed && isShiftPressed) {
          event.preventDefault();
          options.onDateChange(subMonths(options.currentDate, 1));
        }
        break;

      case 'arrowright':
        if (!isCtrlPressed && !isShiftPressed) {
          event.preventDefault();
          options.onDateChange(addDays(options.currentDate, 1));
        } else if (isCtrlPressed && !isShiftPressed) {
          event.preventDefault();
          options.onDateChange(addWeeks(options.currentDate, 1));
        } else if (isCtrlPressed && isShiftPressed) {
          event.preventDefault();
          options.onDateChange(addMonths(options.currentDate, 1));
        }
        break;

      // View switching
      case '1':
        if (isCtrlPressed) {
          event.preventDefault();
          options.onViewChange('day');
        }
        break;
      case '2':
        if (isCtrlPressed) {
          event.preventDefault();
          options.onViewChange('week');
        }
        break;
      case '3':
        if (isCtrlPressed) {
          event.preventDefault();
          options.onViewChange('month');
        }
        break;
      case '4':
        if (isCtrlPressed) {
          event.preventDefault();
          options.onViewChange('agenda');
        }
        break;

      // Appointment actions
      case 'n':
        if (isCtrlPressed) {
          event.preventDefault();
          options.onNewAppointment();
        }
        break;
      case 'e':
        if (isCtrlPressed && options.onEditAppointment) {
          event.preventDefault();
          options.onEditAppointment();
        }
        break;
      case 'd':
        if (isCtrlPressed && options.onDeleteAppointment) {
          event.preventDefault();
          options.onDeleteAppointment();
        }
        break;
      case 'c':
        if (isCtrlPressed && isAltPressed && options.onCopyAppointment) {
          event.preventDefault();
          options.onCopyAppointment();
        }
        break;

      // Other actions
      case 't':
        if (isCtrlPressed) {
          event.preventDefault();
          options.onToday();
        }
        break;
      case 'f':
        if (isCtrlPressed && options.onSearch) {
          event.preventDefault();
          options.onSearch();
        }
        break;
      case 'b':
        if (isCtrlPressed && options.onToggleSidebar) {
          event.preventDefault();
          options.onToggleSidebar();
        }
        break;
      case '=':
        if (isCtrlPressed && options.onZoomIn) {
          event.preventDefault();
          options.onZoomIn();
        }
        break;
      case '-':
        if (isCtrlPressed && options.onZoomOut) {
          event.preventDefault();
          options.onZoomOut();
        }
        break;
      case 'p':
        if (isCtrlPressed && options.onPrint) {
          event.preventDefault();
          options.onPrint();
        }
        break;
      case 'z':
        if (isCtrlPressed && !isShiftPressed && options.onUndo) {
          event.preventDefault();
          options.onUndo();
        } else if (isCtrlPressed && isShiftPressed && options.onRedo) {
          event.preventDefault();
          options.onRedo();
        }
        break;
      case 'r':
        if (isCtrlPressed && options.onRefresh) {
          event.preventDefault();
          options.onRefresh();
        }
        break;
    }
  }, [options]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return {
    shortcuts: [
      { key: '←/→', description: 'Previous/Next Day' },
      { key: 'Ctrl + ←/→', description: 'Previous/Next Week' },
      { key: 'Ctrl + Shift + ←/→', description: 'Previous/Next Month' },
      { key: 'Ctrl + 1-4', description: 'Switch Views' },
      { key: 'Ctrl + N', description: 'New Appointment' },
      { key: 'Ctrl + E', description: 'Edit Selected Appointment' },
      { key: 'Ctrl + D', description: 'Delete Selected Appointment' },
      { key: 'Ctrl + Alt + C', description: 'Copy Appointment' },
      { key: 'Ctrl + T', description: 'Go to Today' },
      { key: 'Ctrl + F', description: 'Search' },
      { key: 'Ctrl + B', description: 'Toggle Sidebar' },
      { key: 'Ctrl + +/-', description: 'Zoom In/Out' },
      { key: 'Ctrl + P', description: 'Print Calendar' },
      { key: 'Ctrl + Z', description: 'Undo' },
      { key: 'Ctrl + Shift + Z', description: 'Redo' },
      { key: 'Ctrl + R', description: 'Refresh Calendar' },
    ],
  };
}
