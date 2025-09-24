import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { CalendarAppointment, Therapist, Service } from '@/lib/calendar-types';
import { AppointmentForm } from '../appointment-form';

// Mock the enhanced appointments service
jest.mock('@/lib/enhanced-appointments', () => ({
  AppointmentService: {
    validateAppointment: jest.fn(() => []),
  },
}));

const mockTherapists: Therapist[] = [
  {
    id: 'therapist-1',
    name: 'Dr. Smith',
    specialty: 'Massage Therapy',
    workingHours: {
      monday: { start: '09:00', end: '17:00', breaks: [] }
    },
    services: [
      {
        id: 'service-1',
        name: 'Deep Tissue Massage',
        duration: 60,
        price: 120,
        category: 'Massage',
        color: 'blue'
      }
    ]
  },
  {
    id: 'therapist-2',
    name: 'Dr. Johnson',
    specialty: 'Physical Therapy',
    workingHours: {
      monday: { start: '08:00', end: '16:00', breaks: [] }
    },
    services: [
      {
        id: 'service-2',
        name: 'Physical Therapy Session',
        duration: 45,
        price: 100,
        category: 'Therapy',
        color: 'green'
      }
    ]
  }
];

const mockServices: Service[] = [
  {
    id: 'service-1',
    name: 'Deep Tissue Massage',
    duration: 60,
    price: 120,
    category: 'Massage',
    color: 'blue'
  },
  {
    id: 'service-2',
    name: 'Physical Therapy Session',
    duration: 45,
    price: 100,
    category: 'Therapy',
    color: 'green'
  }
];

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
};

describe('AppointmentForm', () => {
  const defaultProps = {
    isOpen: true,
    mode: 'create' as const,
    therapists: mockTherapists,
    services: mockServices,
    onSave: jest.fn(),
    onCancel: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders create form correctly', () => {
    render(<AppointmentForm {...defaultProps} />);
    
    expect(screen.getByText('Create Appointment')).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/client name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/therapist/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end time/i)).toBeInTheDocument();
  });

  it('renders edit form correctly', () => {
    render(
      <AppointmentForm 
        {...defaultProps} 
        mode="edit" 
        appointment={mockAppointment}
      />
    );
    
    expect(screen.getByText('Edit Appointment')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Deep Tissue Massage')).toBeInTheDocument();
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<AppointmentForm {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Create Appointment')).not.toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<AppointmentForm {...defaultProps} />);
    
    // Try to submit without filling required fields
    const saveButton = screen.getByText('Save');
    await user.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
      expect(screen.getByText('Client name is required')).toBeInTheDocument();
      expect(screen.getByText('Therapist is required')).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    render(<AppointmentForm {...defaultProps} />);
    
    const emailInput = screen.getByLabelText(/client email/i);
    await user.type(emailInput, 'invalid-email');
    
    const saveButton = screen.getByText('Save');
    await user.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    });
  });

  it('validates time range', async () => {
    const user = userEvent.setup();
    render(<AppointmentForm {...defaultProps} />);
    
    const startTimeInput = screen.getByLabelText(/start time/i);
    const endTimeInput = screen.getByLabelText(/end time/i);
    
    await user.type(startTimeInput, '10:00');
    await user.type(endTimeInput, '09:00'); // End before start
    
    const saveButton = screen.getByText('Save');
    await user.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('End time must be after start time')).toBeInTheDocument();
    });
  });

  it('updates end time when service is selected', async () => {
    const user = userEvent.setup();
    render(<AppointmentForm {...defaultProps} />);
    
    // Set start time first
    const startTimeInput = screen.getByLabelText(/start time/i);
    await user.type(startTimeInput, '10:00');
    
    // Select service
    const serviceSelect = screen.getByRole('combobox', { name: /service/i });
    await user.click(serviceSelect);
    
    const serviceOption = screen.getByText('Deep Tissue Massage (60min - $120)');
    await user.click(serviceOption);
    
    // Check that title and end time are updated
    await waitFor(() => {
      expect(screen.getByDisplayValue('Deep Tissue Massage')).toBeInTheDocument();
      expect(screen.getByDisplayValue('11:00')).toBeInTheDocument(); // 10:00 + 60 minutes
    });
  });

  it('filters services by selected therapist', async () => {
    const user = userEvent.setup();
    render(<AppointmentForm {...defaultProps} />);
    
    // Select therapist
    const therapistSelect = screen.getByRole('combobox', { name: /therapist/i });
    await user.click(therapistSelect);
    
    const therapistOption = screen.getByText('Dr. Smith - Massage Therapy');
    await user.click(therapistOption);
    
    // Check service options
    const serviceSelect = screen.getByRole('combobox', { name: /service/i });
    await user.click(serviceSelect);
    
    expect(screen.getByText('Deep Tissue Massage (60min - $120)')).toBeInTheDocument();
    expect(screen.queryByText('Physical Therapy Session')).not.toBeInTheDocument();
  });

  it('handles form submission successfully', async () => {
    const user = userEvent.setup();
    const onSave = jest.fn();
    
    render(<AppointmentForm {...defaultProps} onSave={onSave} />);
    
    // Fill out form
    await user.type(screen.getByLabelText(/title/i), 'Test Appointment');
    await user.type(screen.getByLabelText(/client name/i), 'Jane Doe');
    
    const therapistSelect = screen.getByRole('combobox', { name: /therapist/i });
    await user.click(therapistSelect);
    await user.click(screen.getByText('Dr. Smith - Massage Therapy'));
    
    await user.type(screen.getByLabelText(/date/i), '2024-01-15');
    await user.type(screen.getByLabelText(/start time/i), '10:00');
    await user.type(screen.getByLabelText(/end time/i), '11:00');
    
    // Submit form
    const saveButton = screen.getByText('Save');
    await user.click(saveButton);
    
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Test Appointment',
        clientName: 'Jane Doe',
        therapistId: 'therapist-1',
      }));
    });
  });

  it('shows conflicts when detected', async () => {
    const conflictingAppointment: CalendarAppointment = {
      ...mockAppointment,
      id: 'conflict-apt',
      title: 'Conflicting Appointment',
    };
    
    const onConflictCheck = jest.fn().mockResolvedValue([conflictingAppointment]);
    
    const user = userEvent.setup();
    render(
      <AppointmentForm 
        {...defaultProps} 
        onConflictCheck={onConflictCheck}
      />
    );
    
    // Fill out form
    await user.type(screen.getByLabelText(/title/i), 'Test Appointment');
    await user.type(screen.getByLabelText(/client name/i), 'Jane Doe');
    
    const therapistSelect = screen.getByRole('combobox', { name: /therapist/i });
    await user.click(therapistSelect);
    await user.click(screen.getByText('Dr. Smith - Massage Therapy'));
    
    await user.type(screen.getByLabelText(/date/i), '2024-01-15');
    await user.type(screen.getByLabelText(/start time/i), '10:00');
    await user.type(screen.getByLabelText(/end time/i), '11:00');
    
    // Submit form
    const saveButton = screen.getByText('Save');
    await user.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('Scheduling Conflicts Detected')).toBeInTheDocument();
      expect(screen.getByText('Conflicting Appointment')).toBeInTheDocument();
      expect(screen.getByText('Save Anyway')).toBeInTheDocument();
    });
  });

  it('handles delete confirmation', async () => {
    const user = userEvent.setup();
    const onDelete = jest.fn();
    
    render(
      <AppointmentForm 
        {...defaultProps} 
        mode="edit"
        appointment={mockAppointment}
        onDelete={onDelete}
      />
    );
    
    // Click delete button
    const deleteButton = screen.getByText('Delete');
    await user.click(deleteButton);
    
    // Confirm deletion
    await waitFor(() => {
      expect(screen.getByText('Delete Appointment')).toBeInTheDocument();
    });
    
    const confirmButton = screen.getByRole('button', { name: /delete/i });
    await user.click(confirmButton);
    
    expect(onDelete).toHaveBeenCalledWith('apt-1');
  });

  it('handles different appointment types', async () => {
    const user = userEvent.setup();
    render(<AppointmentForm {...defaultProps} />);
    
    // Change to break type
    const typeSelect = screen.getByRole('combobox', { name: /type/i });
    await user.click(typeSelect);
    await user.click(screen.getByText('Break'));
    
    // Client fields should not be required for breaks
    expect(screen.queryByText('Client name is required')).not.toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();
    
    render(<AppointmentForm {...defaultProps} onCancel={onCancel} />);
    
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    
    expect(onCancel).toHaveBeenCalled();
  });

  it('initializes with initial time when provided', () => {
    const initialTime = new Date(2024, 0, 15, 14, 30);
    
    render(
      <AppointmentForm 
        {...defaultProps} 
        initialTime={initialTime}
      />
    );
    
    expect(screen.getByDisplayValue('2024-01-15')).toBeInTheDocument();
    expect(screen.getByDisplayValue('14:30')).toBeInTheDocument();
    expect(screen.getByDisplayValue('15:30')).toBeInTheDocument(); // +1 hour
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    const onSave = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
    
    render(<AppointmentForm {...defaultProps} onSave={onSave} />);
    
    // Fill required fields
    await user.type(screen.getByLabelText(/title/i), 'Test');
    await user.type(screen.getByLabelText(/client name/i), 'Test Client');
    
    const therapistSelect = screen.getByRole('combobox', { name: /therapist/i });
    await user.click(therapistSelect);
    await user.click(screen.getByText('Dr. Smith - Massage Therapy'));
    
    await user.type(screen.getByLabelText(/date/i), '2024-01-15');
    await user.type(screen.getByLabelText(/start time/i), '10:00');
    await user.type(screen.getByLabelText(/end time/i), '11:00');
    
    // Submit form
    const saveButton = screen.getByText('Save');
    await user.click(saveButton);
    
    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  });
});