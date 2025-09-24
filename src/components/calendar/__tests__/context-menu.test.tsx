import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContextMenu, ContextMenuBuilder } from '../context-menu';
import { CalendarAppointment, TimeSlot, ContextMenuAction } from '@/lib/calendar-types';

const mockAppointment: CalendarAppointment = {
  id: 'apt-1',
  therapistId: 'therapist-1',
  clientId: 'client-1',
  serviceId: 'service-1',
  startTime: new Date(2024, 0, 15, 10, 0),
  endTime: new Date(2024, 0, 15, 11, 0),
  status: 'scheduled',
  type: 'appointment',
  title: 'Test Appointment',
  clientName: 'John Doe',
  color: 'blue',
};

const mockTimeSlot: TimeSlot = {
  time: new Date(2024, 0, 15, 14, 0),
  therapistId: 'therapist-1',
  isAvailable: true,
};

const mockActions: ContextMenuAction[] = [
  {
    id: 'edit',
    label: 'Edit Appointment',
    icon: 'edit',
    action: jest.fn(),
  },
  {
    id: 'separator',
    label: '',
    icon: '',
    action: jest.fn(),
    separator: true,
  },
  {
    id: 'delete',
    label: 'Delete Appointment',
    icon: 'delete',
    action: jest.fn(),
  },
];

describe('ContextMenu', () => {
  const defaultProps = {
    isOpen: true,
    position: { x: 100, y: 100 },
    target: mockAppointment,
    actions: mockActions,
    onClose: jest.fn(),
    onActionClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when open', () => {
    render(<ContextMenu {...defaultProps} />);
    
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByText('Edit Appointment')).toBeInTheDocument();
    expect(screen.getByText('Delete Appointment')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<ContextMenu {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('renders separator correctly', () => {
    render(<ContextMenu {...defaultProps} />);
    
    const separators = screen.getAllByRole('separator');
    expect(separators).toHaveLength(1);
  });

  it('calls onActionClick when action is clicked', () => {
    const onActionClick = jest.fn();
    render(<ContextMenu {...defaultProps} onActionClick={onActionClick} />);
    
    fireEvent.click(screen.getByText('Edit Appointment'));
    
    expect(onActionClick).toHaveBeenCalledWith(mockActions[0]);
  });

  it('calls onClose when action is clicked', () => {
    const onClose = jest.fn();
    render(<ContextMenu {...defaultProps} onClose={onClose} />);
    
    fireEvent.click(screen.getByText('Edit Appointment'));
    
    expect(onClose).toHaveBeenCalled();
  });

  it('does not call action when disabled', () => {
    const disabledActions = [
      {
        ...mockActions[0],
        disabled: true,
      },
    ];
    
    const onActionClick = jest.fn();
    render(
      <ContextMenu 
        {...defaultProps} 
        actions={disabledActions}
        onActionClick={onActionClick} 
      />
    );
    
    fireEvent.click(screen.getByText('Edit Appointment'));
    
    expect(onActionClick).not.toHaveBeenCalled();
  });

  it('closes when clicking outside', async () => {
    const onClose = jest.fn();
    render(<ContextMenu {...defaultProps} onClose={onClose} />);
    
    // Click outside the menu
    fireEvent.mouseDown(document.body);
    
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('closes when pressing Escape', async () => {
    const onClose = jest.fn();
    render(<ContextMenu {...defaultProps} onClose={onClose} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('positions menu correctly', () => {
    render(<ContextMenu {...defaultProps} position={{ x: 200, y: 300 }} />);
    
    const menu = screen.getByRole('menu');
    expect(menu).toHaveStyle({
      left: '200px',
      top: '300px',
    });
  });

  it('shows disabled styling for disabled actions', () => {
    const disabledActions = [
      {
        ...mockActions[0],
        disabled: true,
      },
    ];
    
    render(<ContextMenu {...defaultProps} actions={disabledActions} />);
    
    const disabledButton = screen.getByText('Edit Appointment').closest('button');
    expect(disabledButton).toHaveClass('opacity-50', 'cursor-not-allowed');
    expect(disabledButton).toBeDisabled();
  });
});

describe('ContextMenuBuilder', () => {
  const mockHandlers = {
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onAddBreak: jest.fn(),
    onCopy: jest.fn(),
    onMove: jest.fn(),
    onCreateAppointment: jest.fn(),
    onBlockTime: jest.fn(),
    onConvertToAppointment: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAppointmentActions', () => {
    it('returns correct actions for scheduled appointment', () => {
      const actions = ContextMenuBuilder.getAppointmentActions(
        mockAppointment,
        mockHandlers.onEdit,
        mockHandlers.onDelete,
        mockHandlers.onAddBreak,
        mockHandlers.onCopy,
        mockHandlers.onMove
      );

      expect(actions).toHaveLength(8); // Including separators
      expect(actions.find(a => a.id === 'edit')).toBeDefined();
      expect(actions.find(a => a.id === 'copy')).toBeDefined();
      expect(actions.find(a => a.id === 'move')).toBeDefined();
      expect(actions.find(a => a.id === 'delete')).toBeDefined();
    });

    it('disables edit for completed appointment', () => {
      const completedAppointment = {
        ...mockAppointment,
        status: 'completed' as const,
      };

      const actions = ContextMenuBuilder.getAppointmentActions(
        completedAppointment,
        mockHandlers.onEdit,
        mockHandlers.onDelete,
        mockHandlers.onAddBreak,
        mockHandlers.onCopy,
        mockHandlers.onMove
      );

      const editAction = actions.find(a => a.id === 'edit');
      expect(editAction?.disabled).toBe(true);
    });

    it('disables delete for completed appointment', () => {
      const completedAppointment = {
        ...mockAppointment,
        status: 'completed' as const,
      };

      const actions = ContextMenuBuilder.getAppointmentActions(
        completedAppointment,
        mockHandlers.onEdit,
        mockHandlers.onDelete,
        mockHandlers.onAddBreak,
        mockHandlers.onCopy,
        mockHandlers.onMove
      );

      const deleteAction = actions.find(a => a.id === 'delete');
      expect(deleteAction?.disabled).toBe(true);
    });

    it('disables actions for past appointments', () => {
      const pastAppointment = {
        ...mockAppointment,
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        endTime: new Date(Date.now() - 1 * 60 * 60 * 1000),   // 1 hour ago
      };

      const actions = ContextMenuBuilder.getAppointmentActions(
        pastAppointment,
        mockHandlers.onEdit,
        mockHandlers.onDelete,
        mockHandlers.onAddBreak,
        mockHandlers.onCopy,
        mockHandlers.onMove
      );

      const editAction = actions.find(a => a.id === 'edit');
      const moveAction = actions.find(a => a.id === 'move');
      
      expect(editAction?.disabled).toBe(true);
      expect(moveAction?.disabled).toBe(true);
    });
  });

  describe('getTimeSlotActions', () => {
    it('returns correct actions for available time slot', () => {
      const actions = ContextMenuBuilder.getTimeSlotActions(
        mockTimeSlot,
        mockHandlers.onCreateAppointment,
        mockHandlers.onAddBreak,
        mockHandlers.onBlockTime
      );

      expect(actions).toHaveLength(4); // Including separator
      expect(actions.find(a => a.id === 'create-appointment')).toBeDefined();
      expect(actions.find(a => a.id === 'add-break')).toBeDefined();
      expect(actions.find(a => a.id === 'block-time')).toBeDefined();
    });

    it('disables actions for unavailable time slot', () => {
      const unavailableTimeSlot = {
        ...mockTimeSlot,
        isAvailable: false,
      };

      const actions = ContextMenuBuilder.getTimeSlotActions(
        unavailableTimeSlot,
        mockHandlers.onCreateAppointment,
        mockHandlers.onAddBreak,
        mockHandlers.onBlockTime
      );

      const createAction = actions.find(a => a.id === 'create-appointment');
      const breakAction = actions.find(a => a.id === 'add-break');
      const blockAction = actions.find(a => a.id === 'block-time');

      expect(createAction?.disabled).toBe(true);
      expect(breakAction?.disabled).toBe(true);
      expect(blockAction?.disabled).toBe(true);
    });

    it('disables actions for past time slots', () => {
      const pastTimeSlot = {
        ...mockTimeSlot,
        time: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      };

      const actions = ContextMenuBuilder.getTimeSlotActions(
        pastTimeSlot,
        mockHandlers.onCreateAppointment,
        mockHandlers.onAddBreak,
        mockHandlers.onBlockTime
      );

      actions.forEach(action => {
        if (!action.separator) {
          expect(action.disabled).toBe(true);
        }
      });
    });
  });

  describe('getBreakActions', () => {
    const breakAppointment = {
      ...mockAppointment,
      type: 'break' as const,
      title: 'Lunch Break',
    };

    it('returns correct actions for break', () => {
      const actions = ContextMenuBuilder.getBreakActions(
        breakAppointment,
        mockHandlers.onEdit,
        mockHandlers.onDelete,
        mockHandlers.onConvertToAppointment
      );

      expect(actions).toHaveLength(4); // Including separator
      expect(actions.find(a => a.id === 'edit-break')).toBeDefined();
      expect(actions.find(a => a.id === 'convert-to-appointment')).toBeDefined();
      expect(actions.find(a => a.id === 'delete-break')).toBeDefined();
    });

    it('disables actions for past breaks', () => {
      const pastBreak = {
        ...breakAppointment,
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        endTime: new Date(Date.now() - 1 * 60 * 60 * 1000),   // 1 hour ago
      };

      const actions = ContextMenuBuilder.getBreakActions(
        pastBreak,
        mockHandlers.onEdit,
        mockHandlers.onDelete,
        mockHandlers.onConvertToAppointment
      );

      actions.forEach(action => {
        if (!action.separator) {
          expect(action.disabled).toBe(true);
        }
      });
    });
  });
});