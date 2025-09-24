import { renderHook, act } from '@testing-library/react';
import { useContextMenu, useContextMenuKeyboard } from '../use-context-menu';
import { CalendarAppointment, ContextMenuAction } from '@/lib/calendar-types';

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

const mockActions: ContextMenuAction[] = [
  {
    id: 'edit',
    label: 'Edit Appointment',
    icon: 'edit',
    action: jest.fn(),
  },
  {
    id: 'delete',
    label: 'Delete Appointment',
    icon: 'delete',
    action: jest.fn(),
  },
];

describe('useContextMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('initializes with closed state', () => {
    const { result } = renderHook(() => useContextMenu());

    expect(result.current.contextMenu.isOpen).toBe(false);
    expect(result.current.contextMenu.target).toBe(null);
    expect(result.current.contextMenu.actions).toEqual([]);
  });

  it('opens context menu with correct state', () => {
    const { result } = renderHook(() => useContextMenu());

    const mockEvent = {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      clientX: 100,
      clientY: 200,
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.openContextMenu(mockEvent, mockAppointment, mockActions);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(result.current.contextMenu.isOpen).toBe(true);
    expect(result.current.contextMenu.position).toEqual({ x: 100, y: 200 });
    expect(result.current.contextMenu.target).toBe(mockAppointment);
    expect(result.current.contextMenu.actions).toBe(mockActions);
  });

  it('closes context menu', () => {
    const { result } = renderHook(() => useContextMenu());

    const mockEvent = {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      clientX: 100,
      clientY: 200,
    } as unknown as React.MouseEvent;

    // Open first
    act(() => {
      result.current.openContextMenu(mockEvent, mockAppointment, mockActions);
    });

    expect(result.current.contextMenu.isOpen).toBe(true);

    // Then close
    act(() => {
      result.current.closeContextMenu();
    });

    expect(result.current.contextMenu.isOpen).toBe(false);
  });

  it('clears target and actions after timeout when closing', () => {
    const { result } = renderHook(() => useContextMenu());

    const mockEvent = {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      clientX: 100,
      clientY: 200,
    } as unknown as React.MouseEvent;

    // Open first
    act(() => {
      result.current.openContextMenu(mockEvent, mockAppointment, mockActions);
    });

    expect(result.current.contextMenu.target).toBe(mockAppointment);
    expect(result.current.contextMenu.actions).toBe(mockActions);

    // Close
    act(() => {
      result.current.closeContextMenu();
    });

    // Target and actions should still be there initially
    expect(result.current.contextMenu.target).toBe(mockAppointment);
    expect(result.current.contextMenu.actions).toBe(mockActions);

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(150);
    });

    // Now they should be cleared
    expect(result.current.contextMenu.target).toBe(null);
    expect(result.current.contextMenu.actions).toEqual([]);
  });

  it('handles action click correctly', () => {
    const { result } = renderHook(() => useContextMenu());

    const mockEvent = {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      clientX: 100,
      clientY: 200,
    } as unknown as React.MouseEvent;

    // Open context menu
    act(() => {
      result.current.openContextMenu(mockEvent, mockAppointment, mockActions);
    });

    // Click action
    act(() => {
      result.current.handleActionClick(mockActions[0]);
    });

    expect(mockActions[0].action).toHaveBeenCalledWith(mockAppointment);
    expect(result.current.contextMenu.isOpen).toBe(false);
  });

  it('clears existing timeout when opening new context menu', () => {
    const { result } = renderHook(() => useContextMenu());

    const mockEvent = {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      clientX: 100,
      clientY: 200,
    } as unknown as React.MouseEvent;

    // Open and close first context menu
    act(() => {
      result.current.openContextMenu(mockEvent, mockAppointment, mockActions);
    });

    act(() => {
      result.current.closeContextMenu();
    });

    // Open second context menu before timeout
    act(() => {
      result.current.openContextMenu(mockEvent, mockAppointment, mockActions);
    });

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(150);
    });

    // Target should still be there because timeout was cleared
    expect(result.current.contextMenu.target).toBe(mockAppointment);
  });
});

describe('useContextMenuKeyboard', () => {
  const mockOnActionClick = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with first item selected', () => {
    const { result } = renderHook(() =>
      useContextMenuKeyboard(true, mockActions, mockOnActionClick, mockOnClose)
    );

    expect(result.current.selectedIndex).toBe(0);
  });

  it('handles arrow down navigation', () => {
    const { result } = renderHook(() =>
      useContextMenuKeyboard(true, mockActions, mockOnActionClick, mockOnClose)
    );

    const mockEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    const preventDefaultSpy = jest.spyOn(mockEvent, 'preventDefault');

    act(() => {
      result.current.handleKeyDown(mockEvent);
    });

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(result.current.selectedIndex).toBe(1);
  });

  it('handles arrow up navigation', () => {
    const { result } = renderHook(() =>
      useContextMenuKeyboard(true, mockActions, mockOnActionClick, mockOnClose)
    );

    // Start at index 1
    act(() => {
      const mockEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      result.current.handleKeyDown(mockEvent);
    });

    expect(result.current.selectedIndex).toBe(1);

    // Go back up
    act(() => {
      const mockEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      result.current.handleKeyDown(mockEvent);
    });

    expect(result.current.selectedIndex).toBe(0);
  });

  it('wraps around at end of list', () => {
    const { result } = renderHook(() =>
      useContextMenuKeyboard(true, mockActions, mockOnActionClick, mockOnClose)
    );

    // Go to last item
    act(() => {
      const mockEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      result.current.handleKeyDown(mockEvent);
    });

    expect(result.current.selectedIndex).toBe(1);

    // Go past end - should wrap to beginning
    act(() => {
      const mockEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      result.current.handleKeyDown(mockEvent);
    });

    expect(result.current.selectedIndex).toBe(0);
  });

  it('wraps around at beginning of list', () => {
    const { result } = renderHook(() =>
      useContextMenuKeyboard(true, mockActions, mockOnActionClick, mockOnClose)
    );

    // Start at index 0, go up - should wrap to end
    act(() => {
      const mockEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      result.current.handleKeyDown(mockEvent);
    });

    expect(result.current.selectedIndex).toBe(1);
  });

  it('handles Enter key to select action', () => {
    const { result } = renderHook(() =>
      useContextMenuKeyboard(true, mockActions, mockOnActionClick, mockOnClose)
    );

    act(() => {
      const mockEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      result.current.handleKeyDown(mockEvent);
    });

    expect(mockOnActionClick).toHaveBeenCalledWith(mockActions[0]);
  });

  it('handles Space key to select action', () => {
    const { result } = renderHook(() =>
      useContextMenuKeyboard(true, mockActions, mockOnActionClick, mockOnClose)
    );

    act(() => {
      const mockEvent = new KeyboardEvent('keydown', { key: ' ' });
      result.current.handleKeyDown(mockEvent);
    });

    expect(mockOnActionClick).toHaveBeenCalledWith(mockActions[0]);
  });

  it('handles Escape key to close menu', () => {
    const { result } = renderHook(() =>
      useContextMenuKeyboard(true, mockActions, mockOnActionClick, mockOnClose)
    );

    act(() => {
      const mockEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      result.current.handleKeyDown(mockEvent);
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('handles letter key navigation', () => {
    const { result } = renderHook(() =>
      useContextMenuKeyboard(true, mockActions, mockOnActionClick, mockOnClose)
    );

    // Press 'd' to jump to "Delete Appointment"
    act(() => {
      const mockEvent = new KeyboardEvent('keydown', { key: 'd' });
      result.current.handleKeyDown(mockEvent);
    });

    expect(result.current.selectedIndex).toBe(1);
  });

  it('ignores keyboard events when menu is closed', () => {
    const { result } = renderHook(() =>
      useContextMenuKeyboard(false, mockActions, mockOnActionClick, mockOnClose)
    );

    const initialIndex = result.current.selectedIndex;

    act(() => {
      const mockEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      result.current.handleKeyDown(mockEvent);
    });

    expect(result.current.selectedIndex).toBe(initialIndex);
    expect(mockOnActionClick).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('skips disabled and separator actions', () => {
    const actionsWithDisabled: ContextMenuAction[] = [
      {
        id: 'edit',
        label: 'Edit Appointment',
        icon: 'edit',
        action: jest.fn(),
        disabled: true,
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

    const { result } = renderHook(() =>
      useContextMenuKeyboard(true, actionsWithDisabled, mockOnActionClick, mockOnClose)
    );

    // Should start at first enabled action (delete, index 2 in original array)
    expect(result.current.selectedIndex).toBe(0);

    // Pressing Enter should select the delete action
    act(() => {
      const mockEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      result.current.handleKeyDown(mockEvent);
    });

    expect(mockOnActionClick).toHaveBeenCalledWith(actionsWithDisabled[2]);
  });
});