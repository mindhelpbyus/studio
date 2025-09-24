import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from '@jest/globals';
import { CalendarFilters } from '../calendar-filters';
import { CalendarFilter, Therapist } from '@/lib/calendar-types';

describe('CalendarFilters', () => {
  const mockTherapists: Therapist[] = [
    {
      id: 'therapist-1',
      name: 'John Doe',
      specialty: 'Massage Therapy',
      avatar: '',
      workingHours: {},
      services: []
    },
    {
      id: 'therapist-2',
      name: 'Jane Smith',
      specialty: 'Facial Treatments',
      avatar: '',
      workingHours: {},
      services: []
    }
  ];

  const mockFilters: CalendarFilter = {
    therapistIds: [],
    serviceTypes: [],
    appointmentStatuses: [],
    dateRange: {
      start: new Date(),
      end: new Date()
    }
  };

  const mockOnFilterChange = vi.fn();

  beforeEach(() => {
    mockOnFilterChange.mockClear();
  });

  it('renders filter button with no active filters', () => {
    render(
      <CalendarFilters
        filters={mockFilters}
        therapists={mockTherapists}
        onFilterChange={mockOnFilterChange}
      />
    );

    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.queryByText('1')).not.toBeInTheDocument(); // No filter count badge
  });

  it('shows active filter count', () => {
    const filtersWithActive: CalendarFilter = {
      ...mockFilters,
      therapistIds: ['therapist-1'],
      serviceTypes: ['Massage']
    };

    render(
      <CalendarFilters
        filters={filtersWithActive}
        therapists={mockTherapists}
        onFilterChange={mockOnFilterChange}
      />
    );

    expect(screen.getByText('2')).toBeInTheDocument(); // Filter count badge
  });

  it('opens filter popover when clicked', () => {
    render(
      <CalendarFilters
        filters={mockFilters}
        therapists={mockTherapists}
        onFilterChange={mockOnFilterChange}
      />
    );

    fireEvent.click(screen.getByText('Filters'));
    expect(screen.getByText('Filter Calendar')).toBeInTheDocument();
  });

  it('displays therapist options', () => {
    render(
      <CalendarFilters
        filters={mockFilters}
        therapists={mockTherapists}
        onFilterChange={mockOnFilterChange}
      />
    );

    fireEvent.click(screen.getByText('Filters'));
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('(Massage Therapy)')).toBeInTheDocument();
    expect(screen.getByText('(Facial Treatments)')).toBeInTheDocument();
  });

  it('handles therapist filter selection', () => {
    render(
      <CalendarFilters
        filters={mockFilters}
        therapists={mockTherapists}
        onFilterChange={mockOnFilterChange}
      />
    );

    fireEvent.click(screen.getByText('Filters'));
    
    const johnCheckbox = screen.getByLabelText(/John Doe/);
    fireEvent.click(johnCheckbox);

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      therapistIds: ['therapist-1']
    });
  });

  it('displays service type options', () => {
    render(
      <CalendarFilters
        filters={mockFilters}
        therapists={mockTherapists}
        onFilterChange={mockOnFilterChange}
      />
    );

    fireEvent.click(screen.getByText('Filters'));
    
    expect(screen.getByText('Massage')).toBeInTheDocument();
    expect(screen.getByText('Facial')).toBeInTheDocument();
    expect(screen.getByText('Nails')).toBeInTheDocument();
    expect(screen.getByText('Hair')).toBeInTheDocument();
    expect(screen.getByText('Consultation')).toBeInTheDocument();
  });

  it('displays appointment status options', () => {
    render(
      <CalendarFilters
        filters={mockFilters}
        therapists={mockTherapists}
        onFilterChange={mockOnFilterChange}
      />
    );

    fireEvent.click(screen.getByText('Filters'));
    
    expect(screen.getByText('Scheduled')).toBeInTheDocument();
    expect(screen.getByText('Checked In')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
    expect(screen.getByText('No Show')).toBeInTheDocument();
  });

  it('clears all filters when Clear All is clicked', () => {
    const filtersWithActive: CalendarFilter = {
      ...mockFilters,
      therapistIds: ['therapist-1'],
      serviceTypes: ['Massage'],
      appointmentStatuses: ['scheduled']
    };

    render(
      <CalendarFilters
        filters={filtersWithActive}
        therapists={mockTherapists}
        onFilterChange={mockOnFilterChange}
      />
    );

    fireEvent.click(screen.getByText('Filters'));
    fireEvent.click(screen.getByText('Clear All'));

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      therapistIds: [],
      serviceTypes: [],
      appointmentStatuses: []
    });
  });
});