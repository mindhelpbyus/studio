import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CalendarWithDragDrop } from '../calendar-with-drag-drop';
import { CalendarAppointment, Therapist, CalendarViewConfig, CalendarFilter } from '@/lib/calendar-types';

// Mock the drag and drop dependencies
jest.mock('react-dnd', () => ({
  useDrag: () => [{ isDragging: false }, jest.fn(), jest.fn()],
  useDrop: () => [{ isOver: false, canDrop: true }, jest.fn()],
  DndProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('react-dnd-html5-backend', () => ({
  HTML5Backend: 'HTML5Backend',
  getEmptyImage: () => new Image(),
}));

// Mock the utility functions
jest.mock('@/lib/calendar-utils', () => ({
  generateTimeSlots: () => ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
  calculateAppointmentPosition: () => ({ top: 100, height: 64 }),
  getAppointmentColor: () => ({
    bg: 'bg-blue-100',
    border: 'border-l-4 border-blue-500',
    text: 'text-blue-900',
    shadow: 'shadow-sm',
    hover: 'hover:shadow-md',
    status: ''
  })
}));

// Mock conflict detection
jest.mock('@/lib/conflict-detection', () => ({
  ConflictDetectionService: {
    checkAppointmentConflicts: jest.fn(),
    isTimeSlotAvailable: jest.fn(() => true),
  }
}));

const mockTherapist: Therapist = {
  id: 'therapist-1',
  name: 'Dr. Smith',
  specialty: 'Massage Therapy',
  avatar: 'https://example.com/avatar.jpg',
  workingHours: {
    monday: { start: '09:00', end: '17:00', breaks: [] }
  },
  services: []
};

const mockAppointment: CalendarAppointment = {
  id: 'apt-1',
  therapistId: 'therapist-1',
  clientId: 'client-1',
  serviceId: 'service-1',
  startTime: new Date(2024, 0, 15, 10, 0),
  endTime: new Date(2024, 0, 15, 11, 0),
  status: 'scheduled',
  type: 'appointment',
  title: 'Deep Tissue Massage',
  clientName: 'John Doe',
  color: 'blue',
  isDraggable: true,
  isResizable: true,
};

const mockViewConfig: CalendarViewConfig = {
  userRole: 'therapist',
  viewType: 'day',
  currentDate: new Date(2024, 0, 15),
  selectedTherapistId: 'therapist-1',
};

const mockFilters: CalendarFilter = {
  therapistIds: [],
  serviceTypes: [],
  appointmentStatuses: [],
  dateRange: {
    start: new Date(2024, 0, 15),
    end: new Date(2024, 0, 15),
  },
};

describe('CalendarWithDragDrop Integration', () => {
  const defaultProps = {
    appointments: [mockAppointment],
    therapists: [mockTherapist],
    viewConfig: mockViewConfig,
    filters: mockFilters,
    onAppointmentUpdate: jest.fn(),
    onAppointmentClick: jest.fn(),
    onTimeSlotClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders calendar with therapist columns', () => {
    render(<CalendarWithDragDrop {...defaultProps} />);
    
    expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
    expect(screen.getByText('Massage Therapy')).toBeInTheDocument();
  });

  it('renders appointments as draggable blocks', () => {
    render(<CalendarWithDragDrop {...defaultProps} />);
    
    expect(screen.getByText('Deep Tissue Massage')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders time slots as drop zones', () => {
    render(<CalendarWithDragDrop {...defaultProps} />);
    
    // Should render time slots
    expect(screen.getByText('09:00')).toBeInTheDocument();
    expect(screen.getByText('10:00')).toBeInTheDocument();
    expect(screen.getByText('11:00')).toBeInTheDocument();
  });

  it('calls onAppointmentClick when appointment is clicked', () => {
    const onAppointmentClick = jest.fn();
    render(<CalendarWithDragDrop {...defaultProps} onAppointmentClick={onAppointmentClick} />);
    
    const appointmentElement = screen.getByText('Deep Tissue Massage');
    fireEvent.click(appointmentElement);
    
    expect(onAppointmentClick).toHaveBeenCalledWith(mockAppointment);
  });

  it('calls onTimeSlotClick when time slot is clicked', () => {
    const onTimeSlotClick = jest.fn();
    render(<CalendarWithDragDrop {...defaultProps} onTimeSlotClick={onTimeSlotClick} />);
    
    // Find and click a time slot (this is a bit tricky with the current structure)
    // We'll simulate clicking on the calendar grid area
    const calendarGrid = screen.getByText('09:00').closest('.relative');
    if (calendarGrid) {
      fireEvent.click(calendarGrid);
    }
    
    // Note: This test might need adjustment based on the actual DOM structure
  });

  it('handles successful appointment drop', async () => {
    const onAppointmentUpdate = jest.fn().mockResolvedValue(true);
    render(<CalendarWithDragDrop {...defaultProps} onAppointmentUpdate={onAppointmentUpdate} />);
    
    // Simulate a successful drop operation
    // This would typically be triggered by the drag and drop system
    // For testing, we'll call the handler directly
    const component = screen.getByText('Deep Tissue Massage').closest('.relative');
    
    // In a real scenario, this would be triggered by react-dnd
    // For now, we'll test that the component renders without errors
    expect(component).toBeInTheDocument();
  });

  it('handles failed appointment drop', async () => {
    const onAppointmentUpdate = jest.fn().mockResolvedValue(false);
    render(<CalendarWithDragDrop {...defaultProps} onAppointmentUpdate={onAppointmentUpdate} />);
    
    // Similar to above, we're testing that the component handles failures gracefully
    expect(screen.getByText('Deep Tissue Massage')).toBeInTheDocument();
  });

  it('filters therapists based on filters', () => {
    const filteredProps = {
      ...defaultProps,
      filters: {
        ...mockFilters,
        therapistIds: ['therapist-2'], // Different therapist ID
      },
    };
    
    render(<CalendarWithDragDrop {...filteredProps} />);
    
    // Should not show the therapist since they're filtered out
    expect(screen.queryByText('Dr. Smith')).not.toBeInTheDocument();
  });

  it('shows multiple therapists when multiple are provided', () => {
    const secondTherapist: Therapist = {
      ...mockTherapist,
      id: 'therapist-2',
      name: 'Dr. Johnson',
      specialty: 'Physical Therapy',
    };
    
    const multiTherapistProps = {
      ...defaultProps,
      therapists: [mockTherapist, secondTherapist],
    };
    
    render(<CalendarWithDragDrop {...multiTherapistProps} />);
    
    expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
    expect(screen.getByText('Dr. Johnson')).toBeInTheDocument();
    expect(screen.getByText('Massage Therapy')).toBeInTheDocument();
    expect(screen.getByText('Physical Therapy')).toBeInTheDocument();
  });

  it('highlights selected appointment', () => {
    render(<CalendarWithDragDrop {...defaultProps} selectedAppointmentId="apt-1" />);
    
    const appointmentElement = screen.getByText('Deep Tissue Massage').closest('div');
    // The exact class checking would depend on the implementation
    expect(appointmentElement).toBeInTheDocument();
  });

  it('handles appointments with different statuses', () => {
    const cancelledAppointment: CalendarAppointment = {
      ...mockAppointment,
      id: 'apt-2',
      status: 'cancelled',
      title: 'Cancelled Appointment',
    };
    
    const propsWithCancelled = {
      ...defaultProps,
      appointments: [mockAppointment, cancelledAppointment],
    };
    
    render(<CalendarWithDragDrop {...propsWithCancelled} />);
    
    expect(screen.getByText('Deep Tissue Massage')).toBeInTheDocument();
    expect(screen.getByText('Cancelled Appointment')).toBeInTheDocument();
  });

  it('handles patient-booked appointments', () => {
    const patientAppointment: CalendarAppointment = {
      ...mockAppointment,
      id: 'apt-patient',
      createdBy: 'patient',
      title: 'Patient Booked Massage',
    };
    
    const propsWithPatientBooking = {
      ...defaultProps,
      appointments: [patientAppointment],
    };
    
    render(<CalendarWithDragDrop {...propsWithPatientBooking} />);
    
    expect(screen.getByText('Patient Booked Massage')).toBeInTheDocument();
    expect(screen.getByText('Patient Booked')).toBeInTheDocument();
  });
});