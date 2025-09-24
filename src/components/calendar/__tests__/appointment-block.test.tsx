import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from '@jest/globals';
import { AppointmentBlock } from '../appointment-block';
import { CalendarAppointment } from '@/lib/calendar-types';

// Mock the utility functions
vi.mock('@/lib/calendar-utils', () => ({
  calculateAppointmentPosition: () => ({ top: 10, height: 4 }),
  formatAppointmentTime: () => '10:00 AM - 11:00 AM'
}));

vi.mock('@/lib/enhanced-appointments', () => ({
  AppointmentService: {
    isCurrentAppointment: () => false,
    getUrgencyLevel: () => 'low',
    getStatusDisplayText: (status: string) => status
  }
}));

describe('AppointmentBlock', () => {
  const mockAppointment: CalendarAppointment = {
    id: '1',
    therapistId: 'therapist1',
    clientId: 'client1',
    serviceId: 'service1',
    startTime: new Date('2024-01-01T10:00:00'),
    endTime: new Date('2024-01-01T11:00:00'),
    status: 'scheduled',
    type: 'appointment',
    title: 'Deep Tissue Massage',
    clientName: 'John Smith',
    color: 'blue'
  };

  const mockOnClick = vi.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('renders appointment information correctly', () => {
    render(
      <AppointmentBlock
        appointment={mockAppointment}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('Deep Tissue Massage')).toBeInTheDocument();
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('10:00 AM - 11:00 AM')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    render(
      <AppointmentBlock
        appointment={mockAppointment}
        onClick={mockOnClick}
      />
    );

    const appointmentElement = screen.getByRole('button');
    fireEvent.click(appointmentElement);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard navigation', () => {
    render(
      <AppointmentBlock
        appointment={mockAppointment}
        onClick={mockOnClick}
      />
    );

    const appointmentElement = screen.getByRole('button');
    
    fireEvent.keyDown(appointmentElement, { key: 'Enter' });
    expect(mockOnClick).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(appointmentElement, { key: ' ' });
    expect(mockOnClick).toHaveBeenCalledTimes(2);
  });

  it('renders break appointments differently', () => {
    const breakAppointment: CalendarAppointment = {
      ...mockAppointment,
      type: 'break',
      title: 'Lunch Break',
      clientName: undefined,
      color: 'gray'
    };

    render(
      <AppointmentBlock
        appointment={breakAppointment}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('Lunch Break')).toBeInTheDocument();
    expect(screen.queryByText('John Smith')).not.toBeInTheDocument();
  });

  it('shows status indicators for non-scheduled appointments', () => {
    const checkedInAppointment: CalendarAppointment = {
      ...mockAppointment,
      status: 'checked-in'
    };

    render(
      <AppointmentBlock
        appointment={checkedInAppointment}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('checked-in')).toBeInTheDocument();
  });

  it('applies week view styling', () => {
    const { container } = render(
      <AppointmentBlock
        appointment={mockAppointment}
        onClick={mockOnClick}
        isWeekView={true}
      />
    );

    // Check that smaller padding is applied in week view
    const appointmentDiv = container.querySelector('.calendar-appointment > div');
    expect(appointmentDiv).toHaveClass('p-1');
  });
});