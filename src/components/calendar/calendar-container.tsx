'use client';

import React, { useState, useCallback } from 'react';
import { CalendarViewConfig, CalendarFilter, CalendarAppointment, Therapist, UserRole, CalendarView } from '@/lib/calendar-types';
import { MockDataService } from '@/lib/enhanced-appointments';
import { AppointmentDetailSidebar } from './appointment-detail-sidebar';
import { CalendarGrid } from './calendar-grid';
import { CalendarHeader } from './calendar-header';
import { ConflictView } from './views/conflict-view';
import { WaitlistView } from './views/waitlist-view';

interface CalendarContainerProps {
  userRole: UserRole;
  currentTherapistId?: string;
  initialDate?: Date;
  initialView?: CalendarView;
}

export function CalendarContainer({
  userRole,
  currentTherapistId,
  initialDate = new Date(),
  initialView = 'day'
}: CalendarContainerProps) {
  // State management
  const [viewConfig, setViewConfig] = useState<CalendarViewConfig>({
    userRole,
    viewType: initialView || 'week',
    currentDate: initialDate,
    selectedTherapistId: currentTherapistId || ''
  });

  const [filters, setFilters] = useState<CalendarFilter>({
    therapistIds: currentTherapistId ? [currentTherapistId] : [],
    serviceTypes: [],
    appointmentStatuses: [],
    dateRange: {
      start: initialDate,
      end: initialDate
    }
  });

  const [selectedAppointment, setSelectedAppointment] = useState<CalendarAppointment | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock data - in real app, this would come from API
  const therapists = MockDataService.generateSampleTherapists();
  const appointments = MockDataService.generateSampleAppointments(viewConfig.currentDate);

  // Filter therapists based on user role
  const visibleTherapists = userRole === 'therapist' && currentTherapistId
    ? therapists.filter(t => t.id === currentTherapistId)
    : therapists;

  // Event handlers
  const handleViewChange = useCallback((newView: CalendarView) => {
    setViewConfig(prev => ({ ...prev, viewType: newView }));
  }, []);

  const handleDateChange = useCallback((newDate: Date) => {
    setViewConfig(prev => ({ ...prev, currentDate: newDate }));
    setFilters(prev => ({
      ...prev,
      dateRange: { start: newDate, end: newDate }
    }));
  }, []);

  const handleFilterChange = useCallback((newFilters: Partial<CalendarFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleAppointmentClick = useCallback((appointment: CalendarAppointment) => {
    setSelectedAppointment(appointment);
    setSidebarOpen(true);
  }, []);

  const handleTimeSlotClick = useCallback((time: Date, therapistId?: string) => {
    // Handle creating new appointment
    console.log('Time slot clicked:', time, therapistId);
  }, []);

  const handleSidebarClose = useCallback(() => {
    setSidebarOpen(false);
    setSelectedAppointment(null);
  }, []);

  const handleAppointmentAction = (action: string, appointmentId?: string) => {
    // Handle appointment actions (check-in, cancel, reschedule)
    console.log('Appointment action:', action, appointmentId);
    // In real app, this would make API calls and update state
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Calendar Header */}
      <CalendarHeader
        viewConfig={viewConfig}
        filters={filters}
        therapists={visibleTherapists}
        onViewChange={handleViewChange}
        onDateChange={handleDateChange}
        onFilterChange={handleFilterChange}
      />

      {/* Calendar Views */}
      <div className="flex-1 overflow-hidden">
        {viewConfig.viewType === 'waitlist' ? (
          <WaitlistView
            appointments={appointments}
            therapists={visibleTherapists}
            onAppointmentClick={handleAppointmentClick}
            onAcceptWaitlist={(appointment) => {
              // Handle accepting waitlist appointment
              console.log('Accept waitlist:', appointment);
            }}
          />
        ) : viewConfig.viewType === 'conflicts' ? (
          <ConflictView
            appointments={appointments}
            therapists={visibleTherapists}
            onAppointmentClick={handleAppointmentClick}
            onResolveConflict={(conflictingAppointments) => {
              // Handle resolving conflicts
              console.log('Resolve conflict:', conflictingAppointments);
            }}
          />
        ) : (
          <CalendarGrid
            appointments={appointments}
            therapists={visibleTherapists}
            viewConfig={viewConfig}
            filters={filters}
            onAppointmentClick={handleAppointmentClick}
            onTimeSlotClick={handleTimeSlotClick}
          />
        )}
      </div>

      {/* Appointment Detail Sidebar */}
      {selectedAppointment && (
        <AppointmentDetailSidebar
          appointment={selectedAppointment}
          isOpen={sidebarOpen}
          onClose={handleSidebarClose}
          onAction={handleAppointmentAction}
        />
      )}
    </div>
  );
}