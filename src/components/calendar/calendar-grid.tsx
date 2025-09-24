'use client';

import React from 'react';
import { CalendarGridProps } from '@/lib/calendar-types';
import { calculateGridColumns } from '@/lib/calendar-utils';
import { CalendarColumn } from './calendar-column';
import { TimeColumn } from './time-column';

export function CalendarGrid({
  appointments,
  therapists,
  viewConfig,
  filters,
  onAppointmentClick,
  onTimeSlotClick
}: CalendarGridProps) {
  const { viewType, userRole } = viewConfig;
  
  // Calculate grid layout
  const gridColumns = calculateGridColumns(viewType, therapists.length);
  
  // Filter appointments based on current filters
  const filteredAppointments = appointments.filter(apt => {
    // Filter by therapist
    if (filters.therapistIds.length > 0 && !filters.therapistIds.includes(apt.therapistId)) {
      return false;
    }
    
    // Filter by service type
    if (filters.serviceTypes.length > 0) {
      const therapist = therapists.find(t => t.id === apt.therapistId);
      const service = therapist?.services.find(s => s.id === apt.serviceId);
      if (!service || !filters.serviceTypes.includes(service.category)) {
        return false;
      }
    }
    
    // Filter by appointment status
    if (filters.appointmentStatuses.length > 0 && !filters.appointmentStatuses.includes(apt.status)) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="h-full overflow-auto calendar-scroll">
      <div 
        className="grid min-h-full bg-background calendar-grid"
        style={{ gridTemplateColumns: gridColumns }}
      >
        {/* Time Column */}
        <TimeColumn />

        {/* Calendar Columns */}
        {viewType === 'day' ? (
          // Day view - show therapist columns
          therapists.map(therapist => (
            <CalendarColumn
              key={therapist.id}
              therapist={therapist}
              appointments={filteredAppointments.filter(apt => apt.therapistId === therapist.id)}
              viewConfig={viewConfig}
              onAppointmentClick={onAppointmentClick}
              onTimeSlotClick={onTimeSlotClick}
              showTherapistHeader={userRole === 'admin'}
            />
          ))
        ) : (
          // Week view - show day columns
          userRole === 'admin' ? (
            // Admin week view - multiple therapists
            therapists.map(therapist => (
              <CalendarColumn
                key={therapist.id}
                therapist={therapist}
                appointments={filteredAppointments.filter(apt => apt.therapistId === therapist.id)}
                viewConfig={viewConfig}
                onAppointmentClick={onAppointmentClick}
                onTimeSlotClick={onTimeSlotClick}
                showTherapistHeader={true}
                isWeekView={true}
              />
            ))
          ) : (
            // Individual therapist week view - single therapist, multiple days
            <CalendarColumn
              therapist={therapists[0]}
              appointments={filteredAppointments}
              viewConfig={viewConfig}
              onAppointmentClick={onAppointmentClick}
              onTimeSlotClick={onTimeSlotClick}
              showTherapistHeader={false}
              isWeekView={true}
            />
          )
        )}
      </div>
    </div>
  );
}