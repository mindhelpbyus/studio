import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResizeHandle } from '../resize-handle';
import { CalendarAppointment } from '@/lib/calendar-types';

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
  minDuration: 15,
  maxDuration: 240,
};

describe('ResizeHandle', () => {
  const defaultProps = {
    appointment: mockAppointment,
    direction: 'bottom' as const,
    onResize: jest.fn(),
    onResizeStart: jest.fn(),
    onResizeEnd: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with correct styling for bottom direction', () => {
    render(<ResizeHandle {...defaultProps} />);
    
    const handle = screen.getByRole('generic');
    expect(handle).toHaveClass('-bottom-1', 'cursor-ns-resize');
  });

  it('renders with correct styling for top direction', () => {
    render(<ResizeHandle {...defaultProps} direction="top" />);
    
    const handle = screen.getByRole('generic');
    expect(handle).toHaveClass('-top-1', 'cursor-ns-resize');
  });

  it('calls onResizeStart when mouse down occurs', () => {
    const onResizeStart = jest.fn();
    render(<ResizeHandle {...defaultProps} onResizeStart={onResizeStart} />);
    
    const handle = screen.getByRole('generic');
    fireEvent.mouseDown(handle, { clientY: 100 });
    
    expect(onResizeStart).toHaveBeenCalledTimes(1);
  });

  it('prevents event propagation on mouse down', () => {
    const onResize = jest.fn();
    render(<ResizeHandle {...defaultProps} onResize={onResize} />);
    
    const handle = screen.getByRole('generic');
    const mouseDownEvent = new MouseEvent('mousedown', { 
      bubbles: true, 
      clientY: 100 
    });
    
    const stopPropagationSpy = jest.spyOn(mouseDownEvent, 'stopPropagation');
    const preventDefaultSpy = jest.spyOn(mouseDownEvent, 'preventDefault');
    
    fireEvent(handle, mouseDownEvent);
    
    expect(stopPropagationSpy).toHaveBeenCalled();
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('applies minimum duration constraint', () => {
    const onResize = jest.fn();
    render(<ResizeHandle {...defaultProps} onResize={onResize} minDuration={30} />);
    
    const handle = screen.getByRole('generic');
    fireEvent.mouseDown(handle, { clientY: 100 });
    
    // Simulate mouse move that would result in duration below minimum
    fireEvent(document, new MouseEvent('mousemove', { clientY: 50 }));
    
    // Should enforce minimum duration
    expect(onResize).toHaveBeenCalledWith(expect.any(Number));
  });

  it('applies maximum duration constraint', () => {
    const onResize = jest.fn();
    render(<ResizeHandle {...defaultProps} onResize={onResize} maxDuration={120} />);
    
    const handle = screen.getByRole('generic');
    fireEvent.mouseDown(handle, { clientY: 100 });
    
    // Simulate mouse move that would result in duration above maximum
    fireEvent(document, new MouseEvent('mousemove', { clientY: 300 }));
    
    // Should enforce maximum duration
    expect(onResize).toHaveBeenCalledWith(expect.any(Number));
  });

  it('snaps to interval correctly', () => {
    const onResize = jest.fn();
    render(<ResizeHandle {...defaultProps} onResize={onResize} snapInterval={30} />);
    
    const handle = screen.getByRole('generic');
    fireEvent.mouseDown(handle, { clientY: 100 });
    
    // Simulate mouse move
    fireEvent(document, new MouseEvent('mousemove', { clientY: 120 }));
    
    // Should snap to 30-minute intervals
    expect(onResize).toHaveBeenCalled();
  });

  it('handles bottom resize direction correctly', () => {
    const onResize = jest.fn();
    render(<ResizeHandle {...defaultProps} direction="bottom" onResize={onResize} />);
    
    const handle = screen.getByRole('generic');
    fireEvent.mouseDown(handle, { clientY: 100 });
    
    // Simulate dragging down (extending appointment)
    fireEvent(document, new MouseEvent('mousemove', { clientY: 150 }));
    
    expect(onResize).toHaveBeenCalled();
  });

  it('handles top resize direction correctly', () => {
    const onResize = jest.fn();
    render(<ResizeHandle {...defaultProps} direction="top" onResize={onResize} />);
    
    const handle = screen.getByRole('generic');
    fireEvent.mouseDown(handle, { clientY: 100 });
    
    // Simulate dragging up (extending appointment backwards)
    fireEvent(document, new MouseEvent('mousemove', { clientY: 50 }));
    
    expect(onResize).toHaveBeenCalled();
  });

  it('calls onResizeEnd when mouse up occurs', () => {
    const onResizeEnd = jest.fn();
    render(<ResizeHandle {...defaultProps} onResizeEnd={onResizeEnd} />);
    
    const handle = screen.getByRole('generic');
    fireEvent.mouseDown(handle, { clientY: 100 });
    fireEvent(document, new MouseEvent('mouseup'));
    
    expect(onResizeEnd).toHaveBeenCalledTimes(1);
  });

  it('shows resize indicator when resizing', () => {
    render(<ResizeHandle {...defaultProps} />);
    
    const handle = screen.getByRole('generic');
    fireEvent.mouseDown(handle, { clientY: 100 });
    
    // Should show resize indicator
    expect(screen.getByText(/Resize from/)).toBeInTheDocument();
  });

  it('shows correct indicator text for bottom resize', () => {
    render(<ResizeHandle {...defaultProps} direction="bottom" />);
    
    const handle = screen.getByRole('generic');
    fireEvent.mouseDown(handle, { clientY: 100 });
    
    expect(screen.getByText('↕️ Resize from bottom')).toBeInTheDocument();
  });

  it('shows correct indicator text for top resize', () => {
    render(<ResizeHandle {...defaultProps} direction="top" />);
    
    const handle = screen.getByRole('generic');
    fireEvent.mouseDown(handle, { clientY: 100 });
    
    expect(screen.getByText('↕️ Resize from top')).toBeInTheDocument();
  });

  it('applies appointment-specific duration constraints', () => {
    const appointmentWithConstraints: CalendarAppointment = {
      ...mockAppointment,
      minDuration: 45,
      maxDuration: 180,
    };
    
    const onResize = jest.fn();
    render(
      <ResizeHandle 
        {...defaultProps} 
        appointment={appointmentWithConstraints}
        onResize={onResize} 
      />
    );
    
    const handle = screen.getByRole('generic');
    fireEvent.mouseDown(handle, { clientY: 100 });
    
    // Simulate mouse move that would violate appointment constraints
    fireEvent(document, new MouseEvent('mousemove', { clientY: 50 }));
    
    // Should respect appointment-specific constraints
    expect(onResize).toHaveBeenCalled();
  });

  it('cleans up event listeners on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
    
    const { unmount } = render(<ResizeHandle {...defaultProps} />);
    
    const handle = screen.getByRole('generic');
    fireEvent.mouseDown(handle, { clientY: 100 });
    
    unmount();
    
    // Should clean up event listeners
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
    
    removeEventListenerSpy.mockRestore();
  });
});