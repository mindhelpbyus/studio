import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DragDropProvider, useDragDrop } from '../drag-drop-provider';
import { CalendarAppointment, TimeSlot } from '@/lib/calendar-types';

// Mock react-dnd
jest.mock('react-dnd', () => ({
  DndProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="dnd-provider">{children}</div>,
}));

jest.mock('react-dnd-html5-backend', () => ({
  HTML5Backend: 'HTML5Backend',
}));

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

// Test component that uses the drag drop context
const TestComponent: React.FC = () => {
  const { state, startDrag, updateDropTarget, endDrag, cancelDrag } = useDragDrop();

  return (
    <div>
      <div data-testid="is-dragging">{state.isDragging.toString()}</div>
      <div data-testid="can-drop">{state.canDrop.toString()}</div>
      <div data-testid="drag-type">{state.dragType || 'none'}</div>
      <div data-testid="conflicts-count">{state.conflictingAppointments.length}</div>
      
      <button
        data-testid="start-drag"
        onClick={() => startDrag(mockAppointment, 'appointment', { top: 100, height: 64 })}
      >
        Start Drag
      </button>
      
      <button
        data-testid="update-drop-target"
        onClick={() => updateDropTarget(mockTimeSlot, true, [])}
      >
        Update Drop Target
      </button>
      
      <button data-testid="end-drag" onClick={endDrag}>
        End Drag
      </button>
      
      <button data-testid="cancel-drag" onClick={cancelDrag}>
        Cancel Drag
      </button>
    </div>
  );
};

describe('DragDropProvider', () => {
  const defaultProps = {
    onAppointmentDrop: jest.fn(),
    onAppointmentResize: jest.fn(),
    onConflictCheck: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides initial state correctly', () => {
    render(
      <DragDropProvider {...defaultProps}>
        <TestComponent />
      </DragDropProvider>
    );

    expect(screen.getByTestId('is-dragging')).toHaveTextContent('false');
    expect(screen.getByTestId('can-drop')).toHaveTextContent('false');
    expect(screen.getByTestId('drag-type')).toHaveTextContent('none');
    expect(screen.getByTestId('conflicts-count')).toHaveTextContent('0');
  });

  it('updates state when starting drag', () => {
    render(
      <DragDropProvider {...defaultProps}>
        <TestComponent />
      </DragDropProvider>
    );

    fireEvent.click(screen.getByTestId('start-drag'));

    expect(screen.getByTestId('is-dragging')).toHaveTextContent('true');
    expect(screen.getByTestId('drag-type')).toHaveTextContent('appointment');
  });

  it('updates drop target state', async () => {
    render(
      <DragDropProvider {...defaultProps}>
        <TestComponent />
      </DragDropProvider>
    );

    // Start drag first
    fireEvent.click(screen.getByTestId('start-drag'));
    
    // Update drop target
    fireEvent.click(screen.getByTestId('update-drop-target'));

    await waitFor(() => {
      expect(screen.getByTestId('can-drop')).toHaveTextContent('true');
    });
  });

  it('calls conflict checker when updating drop target', async () => {
    const onConflictCheck = jest.fn().mockResolvedValue([]);
    
    render(
      <DragDropProvider {...defaultProps} onConflictCheck={onConflictCheck}>
        <TestComponent />
      </DragDropProvider>
    );

    // Start drag first
    fireEvent.click(screen.getByTestId('start-drag'));
    
    // Update drop target
    fireEvent.click(screen.getByTestId('update-drop-target'));

    await waitFor(() => {
      expect(onConflictCheck).toHaveBeenCalledWith(mockAppointment, mockTimeSlot.time, undefined);
    });
  });

  it('handles conflicts correctly', async () => {
    const conflictingAppointment: CalendarAppointment = {
      ...mockAppointment,
      id: 'conflict-apt',
      title: 'Conflicting Appointment',
    };
    
    const onConflictCheck = jest.fn().mockResolvedValue([conflictingAppointment]);
    
    render(
      <DragDropProvider {...defaultProps} onConflictCheck={onConflictCheck}>
        <TestComponent />
      </DragDropProvider>
    );

    // Start drag first
    fireEvent.click(screen.getByTestId('start-drag'));
    
    // Update drop target
    fireEvent.click(screen.getByTestId('update-drop-target'));

    await waitFor(() => {
      expect(screen.getByTestId('can-drop')).toHaveTextContent('false');
      expect(screen.getByTestId('conflicts-count')).toHaveTextContent('1');
    });
  });

  it('calls onAppointmentDrop when ending successful drag', async () => {
    const onAppointmentDrop = jest.fn().mockResolvedValue(true);
    
    render(
      <DragDropProvider {...defaultProps} onAppointmentDrop={onAppointmentDrop}>
        <TestComponent />
      </DragDropProvider>
    );

    // Start drag
    fireEvent.click(screen.getByTestId('start-drag'));
    
    // Set valid drop target
    fireEvent.click(screen.getByTestId('update-drop-target'));
    
    await waitFor(() => {
      expect(screen.getByTestId('can-drop')).toHaveTextContent('true');
    });

    // End drag
    fireEvent.click(screen.getByTestId('end-drag'));

    await waitFor(() => {
      expect(onAppointmentDrop).toHaveBeenCalledWith(mockAppointment, mockTimeSlot.time);
      expect(screen.getByTestId('is-dragging')).toHaveTextContent('false');
    });
  });

  it('resets state when cancelling drag', () => {
    render(
      <DragDropProvider {...defaultProps}>
        <TestComponent />
      </DragDropProvider>
    );

    // Start drag
    fireEvent.click(screen.getByTestId('start-drag'));
    expect(screen.getByTestId('is-dragging')).toHaveTextContent('true');

    // Cancel drag
    fireEvent.click(screen.getByTestId('cancel-drag'));
    expect(screen.getByTestId('is-dragging')).toHaveTextContent('false');
    expect(screen.getByTestId('drag-type')).toHaveTextContent('none');
  });

  it('handles drag operation failure gracefully', async () => {
    const onAppointmentDrop = jest.fn().mockResolvedValue(false);
    
    render(
      <DragDropProvider {...defaultProps} onAppointmentDrop={onAppointmentDrop}>
        <TestComponent />
      </DragDropProvider>
    );

    // Start drag
    fireEvent.click(screen.getByTestId('start-drag'));
    
    // Set valid drop target
    fireEvent.click(screen.getByTestId('update-drop-target'));
    
    await waitFor(() => {
      expect(screen.getByTestId('can-drop')).toHaveTextContent('true');
    });

    // End drag (should fail)
    fireEvent.click(screen.getByTestId('end-drag'));

    await waitFor(() => {
      expect(onAppointmentDrop).toHaveBeenCalled();
      expect(screen.getByTestId('is-dragging')).toHaveTextContent('false');
    });
  });

  it('throws error when useDragDrop is used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useDragDrop must be used within a DragDropProvider');
    
    consoleSpy.mockRestore();
  });

  it('handles resize drag type', () => {
    render(
      <DragDropProvider {...defaultProps}>
        <TestComponent />
      </DragDropProvider>
    );

    // Manually trigger resize drag
    const { startDrag } = useDragDrop();
    
    render(
      <DragDropProvider {...defaultProps}>
        <button
          data-testid="start-resize"
          onClick={() => startDrag(mockAppointment, 'resize', { top: 100, height: 64 })}
        >
          Start Resize
        </button>
        <TestComponent />
      </DragDropProvider>
    );

    fireEvent.click(screen.getByTestId('start-resize'));
    expect(screen.getByTestId('drag-type')).toHaveTextContent('resize');
  });
});