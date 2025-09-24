import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { CalendarAppointment } from '@/lib/calendar-types';
import { CompactAppointment } from '../compact-appointment';

// Mock the utility functions
jest.mock('@/lib/calendar-utils', () => ({
  getAppointmentColor: jest.fn(() => ({
    bg: 'bg-blue-100',
    border: 'border-l-4 border-blue-500',
    text: 'text-blue-900',
    shadow: 'shadow-sm',
    hover: 'hover:shadow-md',
    status: ''
  }))
}));

const createMockAppointment = (overrides: Partial<CalendarAppointment> = {}): CalendarAppointment => ({
  id: 'apt-1',
  therapistId: 'therapist-1',
  clientId: 'client-1',
  serviceId: 'service-1',
  startTime: new Date(2024, 0, 15, 10, 0), // 10:00 AM
  endTime: new Date(2024, 0, 15, 11, 0), // 11:00 AM
  status: 'scheduled',
  type: 'appointment',
  title: 'Deep Tissue Massage',
  clientName: 'John Doe',
  color: 'blue',
  createdBy: 'therapist',
  ...overrides
});

describe('CompactAppointment', () => {
  const defaultProps = {
    appointment: createMockAppointment(),
    onClick: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders appointment title and client name', () => {
    render(<CompactAppointment {...defaultProps} />);
    
    expect(screen.getByText('Deep Tissue Massage')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('displays formatted start time', () => {
    render(<CompactAppointment {...defaultProps} />);
    
    expect(screen.getByText('10:00 AM')).toBeInTheDocument();
  });

  it('shows patient booking indicator for patient-created appointments', () => {
    const patientAppointment = createMockAppointment({ createdBy: 'patient' });
    render(<CompactAppointment {...defaultProps} appointment={patientAppointment} />);
    
    expect(screen.getByText('P')).toBeInTheDocument();
    expect(screen.getByText('P')).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('does not show patient indicator for therapist-created appointments', () => {
    const therapistAppointment = createMockAppointment({ createdBy: 'therapist' });
    render(<CompactAppointment {...defaultProps} appointment={therapistAppointment} />);
    
    expect(screen.queryByText('P')).not.toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    render(<CompactAppointment {...defaultProps} />);
    
    const appointmentElement = screen.getByText('Deep Tissue Massage').closest('div');
    expect(appointmentElement).toHaveClass(
      'text-xs',
      'p-1',
      'rounded',
      'cursor-pointer',
      'transition-all',
      'duration-200',
      'hover:shadow-sm',
      'hover:scale-105'
    );
  });

  it('adds ring styling for patient-booked appointments', () => {
    const patientAppointment = createMockAppointment({ createdBy: 'patient' });
    render(<CompactAppointment {...defaultProps} appointment={patientAppointment} />);
    
    const appointmentElement = screen.getByText('Deep Tissue Massage').closest('div');
    expect(appointmentElement).toHaveClass('ring-1', 'ring-green-300');
  });

  it('calls onClick when appointment is clicked', () => {
    const onClick = jest.fn();
    render(<CompactAppointment {...defaultProps} onClick={onClick} />);
    
    const appointmentElement = screen.getByText('Deep Tissue Massage').closest('div');
    fireEvent.click(appointmentElement!);
    
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('shows correct tooltip with appointment details', () => {
    render(<CompactAppointment {...defaultProps} />);
    
    const appointmentElement = screen.getByText('Deep Tissue Massage').closest('div');
    expect(appointmentElement).toHaveAttribute(
      'title',
      'Deep Tissue Massage - John Doe (10:00 AM)'
    );
  });

  it('truncates long appointment titles', () => {
    const longTitleAppointment = createMockAppointment({
      title: 'Very Long Appointment Title That Should Be Truncated'
    });
    render(<CompactAppointment {...defaultProps} appointment={longTitleAppointment} />);
    
    const titleElement = screen.getByText('Very Long Appointment Title That Should Be Truncated');
    expect(titleElement).toHaveClass('truncate', 'flex-1');
  });

  it('truncates long client names', () => {
    const longNameAppointment = createMockAppointment({
      clientName: 'Very Long Client Name That Should Be Truncated'
    });
    render(<CompactAppointment {...defaultProps} appointment={longNameAppointment} />);
    
    const clientElement = screen.getByText('Very Long Client Name That Should Be Truncated');
    expect(clientElement).toHaveClass('truncate');
  });

  it('handles appointments with different time formats', () => {
    const afternoonAppointment = createMockAppointment({
      startTime: new Date(2024, 0, 15, 14, 30) // 2:30 PM
    });
    render(<CompactAppointment {...defaultProps} appointment={afternoonAppointment} />);
    
    expect(screen.getByText('2:30 PM')).toBeInTheDocument();
  });

  it('handles appointments without client names gracefully', () => {
    const noClientAppointment = createMockAppointment({
      clientName: undefined
    });
    render(<CompactAppointment {...defaultProps} appointment={noClientAppointment} />);
    
    expect(screen.getByText('Deep Tissue Massage')).toBeInTheDocument();
    // Should not crash and should still show the time
    expect(screen.getByText('10:00 AM')).toBeInTheDocument();
  });

  it('applies hover effects on mouse interaction', () => {
    render(<CompactAppointment {...defaultProps} />);
    
    const appointmentElement = screen.getByText('Deep Tissue Massage').closest('div');
    
    // Check that hover classes are present
    expect(appointmentElement).toHaveClass('hover:shadow-sm', 'hover:scale-105');
  });

  it('maintains accessibility with proper semantic structure', () => {
    render(<CompactAppointment {...defaultProps} />);
    
    const appointmentElement = screen.getByText('Deep Tissue Massage').closest('div');
    
    // Should be clickable and have proper cursor
    expect(appointmentElement).toHaveClass('cursor-pointer');
    
    // Should have meaningful tooltip
    expect(appointmentElement).toHaveAttribute('title');
  });
});