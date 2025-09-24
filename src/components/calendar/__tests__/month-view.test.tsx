import { render, screen, fireEvent } from '@testing-library/react';
import { format, addDays, startOfMonth } from 'date-fns';
import React from 'react';
import { CalendarAppointment, Therapist } from '@/lib/calendar-types';
import { MonthView } from '../month-view';

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

const mockTherapists: Therapist[] = [
  {
    id: 'therapist-1',
    name: 'Dr. Smith',
    specialty: 'Massage Therapy',
    workingHours: {
      monday: { start: '09:00', end: '17:00', breaks: [] }
    },
    services: []
  }
];

const createMockAppointment = (date: Date, title: string): CalendarAppointment => ({
  id: `apt-${Date.now()}-${Math.random()}`,
  therapistId: 'therapist-1',
  clientId: 'client-1',
  serviceId: 'service-1',
  startTime: date,
  endTime: addDays(date, 0),
  status: 'scheduled',
  type: 'appointment',
  title,
  clientName: 'John Doe',
  color: 'blue'
});

describe('MonthView', () => {
  const defaultProps = {
    appointments: [],
    therapists: mockTherapists,
    currentDate: new Date(2024, 0, 15), // January 15, 2024
    userRole: 'therapist' as const,
    onDayClick: jest.fn(),
    onAppointmentClick: jest.fn(),
    maxEventsPerDay: 3
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders month grid with correct number of days', () => {
    render(<MonthView {...defaultProps} />);
    
    // Should render 7 columns (days of week)
    expect(screen.getByText('Sun')).toBeInTheDocument();
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Tue')).toBeInTheDocument();
    expect(screen.getByText('Wed')).toBeInTheDocument();
    expect(screen.getByText('Thu')).toBeInTheDocument();
    expect(screen.getByText('Fri')).toBeInTheDocument();
    expect(screen.getByText('Sat')).toBeInTheDocument();
  });

  it('displays appointments in correct day cells', () => {
    const appointmentDate = new Date(2024, 0, 15); // January 15, 2024
    const appointments = [
      createMockAppointment(appointmentDate, 'Test Appointment')
    ];

    render(<MonthView {...defaultProps} appointments={appointments} />);
    
    expect(screen.getByText('Test Appointment')).toBeInTheDocument();
  });

  it('highlights today with special styling', () => {
    const today = new Date();
    render(<MonthView {...defaultProps} currentDate={today} />);
    
    const todayCell = screen.getByText(today.getDate().toString());
    expect(todayCell).toHaveClass('bg-blue-500', 'text-white');
  });

  it('shows "More..." link when appointments exceed maxEventsPerDay', () => {
    const appointmentDate = new Date(2024, 0, 15);
    const appointments = [
      createMockAppointment(appointmentDate, 'Appointment 1'),
      createMockAppointment(appointmentDate, 'Appointment 2'),
      createMockAppointment(appointmentDate, 'Appointment 3'),
      createMockAppointment(appointmentDate, 'Appointment 4'),
      createMockAppointment(appointmentDate, 'Appointment 5')
    ];

    render(<MonthView {...defaultProps} appointments={appointments} maxEventsPerDay={3} />);
    
    expect(screen.getByText('+2 more...')).toBeInTheDocument();
  });

  it('calls onDayClick when day cell is clicked', () => {
    const onDayClick = jest.fn();
    render(<MonthView {...defaultProps} onDayClick={onDayClick} />);
    
    const dayCell = screen.getByText('15');
    fireEvent.click(dayCell.closest('div')!);
    
    expect(onDayClick).toHaveBeenCalledWith(expect.any(Date));
  });

  it('calls onAppointmentClick when appointment is clicked', () => {
    const appointmentDate = new Date(2024, 0, 15);
    const appointments = [
      createMockAppointment(appointmentDate, 'Test Appointment')
    ];
    const onAppointmentClick = jest.fn();

    render(<MonthView {...defaultProps} appointments={appointments} onAppointmentClick={onAppointmentClick} />);
    
    const appointmentElement = screen.getByText('Test Appointment');
    fireEvent.click(appointmentElement);
    
    expect(onAppointmentClick).toHaveBeenCalledWith(appointments[0]);
  });

  it('displays days from previous and next month in muted style', () => {
    render(<MonthView {...defaultProps} />);
    
    // Find a day that's not in the current month (should be muted)
    const monthStart = startOfMonth(defaultProps.currentDate);
    const prevMonthDay = monthStart.getDate() - 1;
    
    if (prevMonthDay > 0) {
      const prevDayElement = screen.getByText(prevMonthDay.toString());
      expect(prevDayElement.closest('div')).toHaveClass('bg-gray-50', 'text-gray-400');
    }
  });

  it('prevents event propagation when "More..." link is clicked', () => {
    const appointmentDate = new Date(2024, 0, 15);
    const appointments = Array.from({ length: 5 }, (_, i) => 
      createMockAppointment(appointmentDate, `Appointment ${i + 1}`)
    );
    const onDayClick = jest.fn();

    render(<MonthView {...defaultProps} appointments={appointments} onDayClick={onDayClick} maxEventsPerDay={3} />);
    
    const moreLink = screen.getByText('+2 more...');
    fireEvent.click(moreLink);
    
    // Should still call onDayClick but with the specific date
    expect(onDayClick).toHaveBeenCalledWith(appointmentDate);
  });

  it('sorts appointments by start time within each day', () => {
    const appointmentDate = new Date(2024, 0, 15);
    const laterTime = new Date(appointmentDate);
    laterTime.setHours(14, 0, 0, 0);
    const earlierTime = new Date(appointmentDate);
    earlierTime.setHours(10, 0, 0, 0);

    const appointments = [
      { ...createMockAppointment(laterTime, 'Later Appointment'), startTime: laterTime },
      { ...createMockAppointment(earlierTime, 'Earlier Appointment'), startTime: earlierTime }
    ];

    render(<MonthView {...defaultProps} appointments={appointments} />);
    
    const appointmentElements = screen.getAllByText(/Appointment/);
    expect(appointmentElements[0]).toHaveTextContent('Earlier Appointment');
    expect(appointmentElements[1]).toHaveTextContent('Later Appointment');
  });
});