'use client';

import { 
  Edit, 
  Trash2, 
  Coffee, 
  Plus, 
  Clock, 
  User, 
  Calendar,
  Copy,
  Move,
  MoreHorizontal
} from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { CalendarAppointment, TimeSlot, ContextMenuAction, ContextMenuProps } from '@/lib/calendar-types';
import { cn } from '@/lib/utils';

const iconMap = {
  edit: Edit,
  delete: Trash2,
  break: Coffee,
  add: Plus,
  time: Clock,
  user: User,
  calendar: Calendar,
  copy: Copy,
  move: Move,
  more: MoreHorizontal,
};

export const ContextMenu: React.FC<ContextMenuProps> = ({
  isOpen,
  position,
  target,
  actions,
  onClose,
  onActionClick,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Adjust menu position to stay within viewport
  const getAdjustedPosition = () => {
    if (!menuRef.current) return position;

    const menuRect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let { x, y } = position;

    // Adjust horizontal position
    if (x + menuRect.width > viewportWidth) {
      x = viewportWidth - menuRect.width - 10;
    }
    if (x < 10) {
      x = 10;
    }

    // Adjust vertical position
    if (y + menuRect.height > viewportHeight) {
      y = viewportHeight - menuRect.height - 10;
    }
    if (y < 10) {
      y = 10;
    }

    return { x, y };
  };

  if (!isOpen) return null;

  const adjustedPosition = getAdjustedPosition();

  return (
    <div
      ref={menuRef}
      className={cn(
        'fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200',
        'min-w-48 py-2 animate-in fade-in-0 zoom-in-95 duration-100'
      )}
      style={{
        left: `${adjustedPosition.x}px`,
        top: `${adjustedPosition.y}px`,
      }}
      role="menu"
      aria-orientation="vertical"
    >
      {actions.map((action, index) => {
        if (action.separator) {
          return (
            <div
              key={`separator-${index}`}
              className="h-px bg-gray-200 my-1 mx-2"
              role="separator"
            />
          );
        }

        const IconComponent = iconMap[action.icon as keyof typeof iconMap] || MoreHorizontal;

        return (
          <button
            key={action.id}
            className={cn(
              'w-full flex items-center px-4 py-2 text-sm text-left',
              'hover:bg-gray-100 focus:bg-gray-100 focus:outline-none',
              'transition-colors duration-150',
              action.disabled && 'opacity-50 cursor-not-allowed'
            )}
            onClick={() => {
              if (!action.disabled) {
                onActionClick(action);
                onClose();
              }
            }}
            disabled={action.disabled}
            role="menuitem"
          >
            <IconComponent className="w-4 h-4 mr-3 text-gray-500" />
            <span className="flex-1">{action.label}</span>
          </button>
        );
      })}
    </div>
  );
};

// Context menu action builders
export class ContextMenuBuilder {
  /**
   * Get context menu actions for an appointment
   */
  static getAppointmentActions(
    appointment: CalendarAppointment,
    onEdit: (appointment: CalendarAppointment) => void,
    onDelete: (appointment: CalendarAppointment) => void,
    onAddBreak: (time: Date) => void,
    onCopy: (appointment: CalendarAppointment) => void,
    onMove: (appointment: CalendarAppointment) => void
  ): ContextMenuAction[] {
    const canEdit = appointment.status !== 'completed' && appointment.status !== 'cancelled';
    const canDelete = appointment.status !== 'completed';
    const isPastAppointment = appointment.endTime < new Date();

    return [
      {
        id: 'edit',
        label: 'Edit Appointment',
        icon: 'edit',
        action: () => onEdit(appointment),
        disabled: !canEdit || isPastAppointment,
      },
      {
        id: 'copy',
        label: 'Copy Appointment',
        icon: 'copy',
        action: () => onCopy(appointment),
      },
      {
        id: 'move',
        label: 'Move Appointment',
        icon: 'move',
        action: () => onMove(appointment),
        disabled: !canEdit || isPastAppointment,
      },
      {
        id: 'separator-1',
        label: '',
        icon: '',
        action: () => {},
        separator: true,
      },
      {
        id: 'add-break-before',
        label: 'Add Break Before',
        icon: 'break',
        action: () => {
          const breakTime = new Date(appointment.startTime.getTime() - 30 * 60 * 1000);
          onAddBreak(breakTime);
        },
      },
      {
        id: 'add-break-after',
        label: 'Add Break After',
        icon: 'break',
        action: () => onAddBreak(appointment.endTime),
      },
      {
        id: 'separator-2',
        label: '',
        icon: '',
        action: () => {},
        separator: true,
      },
      {
        id: 'delete',
        label: 'Delete Appointment',
        icon: 'delete',
        action: () => onDelete(appointment),
        disabled: !canDelete,
      },
    ];
  }

  /**
   * Get context menu actions for a time slot
   */
  static getTimeSlotActions(
    timeSlot: TimeSlot,
    onCreateAppointment: (time: Date, therapistId?: string) => void,
    onAddBreak: (time: Date, therapistId?: string) => void,
    onBlockTime: (time: Date, therapistId?: string) => void
  ): ContextMenuAction[] {
    const isPastTime = timeSlot.time < new Date();

    return [
      {
        id: 'create-appointment',
        label: 'New Appointment',
        icon: 'add',
        action: () => onCreateAppointment(timeSlot.time, timeSlot.therapistId),
        disabled: !timeSlot.isAvailable || isPastTime,
      },
      {
        id: 'separator-1',
        label: '',
        icon: '',
        action: () => {},
        separator: true,
      },
      {
        id: 'add-break',
        label: 'Add Break',
        icon: 'break',
        action: () => onAddBreak(timeSlot.time, timeSlot.therapistId),
        disabled: !timeSlot.isAvailable || isPastTime,
      },
      {
        id: 'block-time',
        label: 'Block Time',
        icon: 'time',
        action: () => onBlockTime(timeSlot.time, timeSlot.therapistId),
        disabled: !timeSlot.isAvailable || isPastTime,
      },
    ];
  }

  /**
   * Get context menu actions for a break
   */
  static getBreakActions(
    appointment: CalendarAppointment,
    onEdit: (appointment: CalendarAppointment) => void,
    onDelete: (appointment: CalendarAppointment) => void,
    onConvertToAppointment: (appointment: CalendarAppointment) => void
  ): ContextMenuAction[] {
    const isPastBreak = appointment.endTime < new Date();

    return [
      {
        id: 'edit-break',
        label: 'Edit Break',
        icon: 'edit',
        action: () => onEdit(appointment),
        disabled: isPastBreak,
      },
      {
        id: 'convert-to-appointment',
        label: 'Convert to Appointment',
        icon: 'calendar',
        action: () => onConvertToAppointment(appointment),
        disabled: isPastBreak,
      },
      {
        id: 'separator-1',
        label: '',
        icon: '',
        action: () => {},
        separator: true,
      },
      {
        id: 'delete-break',
        label: 'Remove Break',
        icon: 'delete',
        action: () => onDelete(appointment),
        disabled: isPastBreak,
      },
    ];
  }
}