import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { EnhancedCalendarContainer } from '../enhanced-calendar-container';
import { CalendarProvider } from '@/lib/calendar-context';
import { toast } from '@/hooks/use-toast';
import { AppointmentStatus, AppointmentType } from '@/lib/calendar-types';

// Mock dependencies
jest.mock('@/hooks/use-toast', () => ({
  toast: jest.fn(),
}));

// Mock data
const mockTherapist = {
  id: 'th1',
  name: 'Dr. Smith',
  specialty: 'Psychotherapy',
  workingHours: {
    monday: { 
      start: '09:00', 
      end: '17:00',
      breaks: [{ start: '12:00', end: '13:00', title: 'Lunch Break' }]
    }
  },
  services: [
    { 
      id: 'srv1', 
      name: 'Individual Therapy', 
      duration: 60,
      price: 150,
      category: 'therapy',
      color: 'blue'
    }
  ],
  allowPatientBooking: true
};

const mockAppointments = [
  {
    id: '1',
    therapistId: 'th1',
    clientId: 'cl1',
    serviceId: 'srv1',
    startTime: new Date(2025, 8, 24, 10, 0),
    endTime: new Date(2025, 8, 24, 11, 0),
    status: 'scheduled' as AppointmentStatus,
    type: 'appointment' as AppointmentType,
    title: 'Test Appointment',
    patientName: 'John Doe',
    color: 'blue',
    isDraggable: true,
    isResizable: true,
  }
];

describe('Calendar Component', () => {
  const mockHandleCreate = jest.fn();
  const mockHandleUpdate = jest.fn();
  const mockHandleDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderCalendar = () => {
    return render(
      <CalendarProvider>
        <EnhancedCalendarContainer
          userRole="therapist"
          currentTherapist={mockTherapist}
          therapists={[mockTherapist]}
          services={mockTherapist.services}
          appointments={mockAppointments}
          onAppointmentCreate={mockHandleCreate}
          onAppointmentUpdate={mockHandleUpdate}
          onAppointmentDelete={mockHandleDelete}
          currentDate={new Date()}
          onDateChange={jest.fn()}
        />
      </CalendarProvider>
    );
  };

  it('renders calendar with appointments', async () => {
    renderCalendar();
    await waitFor(() => {
      expect(screen.getByText('Test Appointment')).toBeInTheDocument();
    });
  });

  it('displays therapist information', () => {
    renderCalendar();
    expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
  });

  it('shows available services', () => {
    renderCalendar();
    expect(screen.getByText('Individual Therapy')).toBeInTheDocument();
  });

  // Add more tests as needed for specific functionality
});
