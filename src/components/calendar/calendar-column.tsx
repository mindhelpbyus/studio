'use client';

import React from 'react';
import { CalendarAppointment, Therapist, CalendarViewConfig } from '@/lib/calendar-types';
import { AppointmentBlock } from './appointment-block';
import { generateTimeSlots, getWeekDays, filterAppointmentsForDay } from '@/lib/calendar-utils';
import { CALENDAR_CONSTANTS } from '@/lib/calendar-styles';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CalendarColumnProps {
  therapist: Therapist;
  appointments: CalendarAppointment[];
  viewConfig: CalendarViewConfig;
  onAppointmentClick: (appointment: CalendarAppointment) => void;
  onTimeSlotClick: (time: Date, therapistId?: string) => void;
  showTherapistHeader?: boolean;
  isWeekView?: boolean;
}

export function CalendarColumn({
  therapist,
  appointments,
  viewConfig,
  onAppointmentClick,
  onTimeSlotClick,
  showTherapistHeader = false,
  isWeekView = false
}: CalendarColumnProps) {
  const { currentDate } = viewConfig;
  const timeSlots = generateTimeSlots();

  // For week view, get the days of the week
  const weekDays = isWeekView ? getWeekDays(currentDate) : [];

  const renderDayColumn = (date: Date, dayLabel?: string) => {
    const dayAppointments = filterAppointmentsForDay(appointments, date, therapist.id);

    return (
      <div key={date.toISOString()} className="relative flex-1 min-w-0">
        {/* Day header for week view */}
        {isWeekView && dayLabel && (
          <div className="text-center border-b flex flex-col items-center justify-center sticky top-0 bg-card z-10 shadow-sm"
               style={{ height: `${CALENDAR_CONSTANTS.HEADER_HEIGHT}rem` }}>
            <span className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              {dayLabel}
            </span>
            <span className="font-bold text-2xl text-foreground">
              {date.getDate()}
            </span>
          </div>
        )}

        {/* Time grid background */}
        <div className="relative">
          {timeSlots.map((_, index) => (
            <div
              key={index}
              style={{ height: `${CALENDAR_CONSTANTS.TIME_SLOT_HEIGHT}rem` }}
              className="border-b border-muted/50 hover:bg-muted/20 transition-colors relative cursor-pointer"
              onClick={() => {
                const clickTime = new Date(date);
                clickTime.setHours(index, 0, 0, 0);
                onTimeSlotClick(clickTime, therapist.id);
              }}
            >
              {/* Hour marker line for alignment reference */}
              <div className="absolute top-0 left-0 w-4 h-px bg-muted-foreground/20" />
            </div>
          ))}

          {/* Appointments */}
          {dayAppointments.map((appointment, index) => (
            <AppointmentBlock
              key={`${appointment.id}-${index}`}
              appointment={appointment}
              onClick={() => onAppointmentClick(appointment)}
              isWeekView={isWeekView}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="border-r last:border-r-0 relative flex flex-col">
      {/* Therapist Header (for admin view) */}
      {showTherapistHeader && (
        <div className="text-center border-b flex flex-col items-center justify-center sticky top-0 bg-card z-10 shadow-sm p-3"
             style={{ height: `${CALENDAR_CONSTANTS.HEADER_HEIGHT}rem` }}>
          <Avatar className="w-8 h-8 mb-1">
            <AvatarImage src={therapist.avatar} alt={therapist.name} />
            <AvatarFallback className="text-xs">
              {therapist.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <span className="font-semibold text-sm truncate max-w-full">
            {therapist.name}
          </span>
          <span className="text-xs text-muted-foreground truncate max-w-full">
            {therapist.specialty}
          </span>
        </div>
      )}

      {/* Calendar Content */}
      {isWeekView ? (
        // Week view - multiple day columns
        <div className="flex flex-1 min-h-0">
          {weekDays.map(({ day, fullDate }) => 
            renderDayColumn(fullDate, day)
          )}
        </div>
      ) : (
        // Day view - single day column
        renderDayColumn(currentDate)
      )}
    </div>
  );
}