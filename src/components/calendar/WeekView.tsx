'use client';

import { format, addDays, startOfDay, endOfDay, addHours } from 'date-fns';
import React from 'react';
import { CalendarAppointment } from '@/lib/calendar-types';
import { AppointmentBlock } from './appointment-block';

interface WeekViewProps {
  startDate: Date;
  appointments: CalendarAppointment[];
  onAppointmentClick: (appointment: CalendarAppointment) => void;
  onSlotSelect: (start: Date, end: Date) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS = Array.from({ length: 7 }, (_, i) => i);

const getCurrentTimePosition = () => {
  const now = new Date();
  return (now.getHours() + now.getMinutes() / 60) * 60;
};

export const WeekView: React.FC<WeekViewProps> = ({
  startDate,
  appointments,
  onAppointmentClick,
  onSlotSelect,
}) => {
  const weekStart = startOfDay(startDate);
  const weekDays = DAYS.map(i => addDays(weekStart, i));

  const getPositionStyles = (appointment: CalendarAppointment) => {
    const overlappingAppts = getOverlappingAppointments(appointment);
    const startHour = appointment.startTime.getHours();
    const startMinutes = appointment.startTime.getMinutes();
    const endHour = appointment.endTime.getHours();
    const endMinutes = appointment.endTime.getMinutes();
    const dayIndex = appointment.startTime.getDay();

    const top = (startHour + startMinutes / 60) * 60;
    const height = ((endHour - startHour) * 60 + (endMinutes - startMinutes));
    const columnWidth = 100 / 7;
    const left = dayIndex * columnWidth;
    
    // Handle overlapping appointments
    const position = overlappingAppts.indexOf(appointment);
    const total = overlappingAppts.length;
    const width = columnWidth / total;
    const offsetLeft = left + (position * width);

    return {
      top: `${top}px`,
      height: `${height}px`,
      left: `${offsetLeft}%`,
      width: `${width}%`,
      zIndex: 10 + position
    };

    return {
      top: `${top}px`,
      height: `${height}px`,
      left,
      width,
    };
  };

  const handleSlotClick = (day: number, hour: number) => {
    const start = addHours(addDays(weekStart, day), hour);
    const end = addHours(start, 1);
    onSlotSelect(start, end);
  };

  return (
        <div className="relative h-[calc(100vh-12rem)] border rounded-lg overflow-auto bg-white">
      {/* Week header */}
      <div className="sticky top-0 z-20 flex border-b bg-white">
        <div className="w-16" /> {/* Spacer for time column */}
        {DAYS.map((day) => {
          const date = addDays(weekStart, day);
          return (
            <div key={day} className="flex-1 text-center py-2">
              <div className="text-sm font-medium">{format(date, 'EEE')}</div>
              <div className="text-xs text-gray-500">{format(date, 'MMM d')}</div>
            </div>
          );
        })}
      </div>

      {/* Current time indicator */}
      <div className="sticky top-0 z-10 flex border-b bg-white">
        <div className="w-16" /> {/* Spacer for time column */}
        {weekDays.map((day) => (
          <div key={day.toISOString()} className="flex-1 text-center py-2 font-medium">
            <div className="text-sm">{format(day, 'EEE')}</div>
            <div className="text-xs text-gray-500">{format(day, 'MMM d')}</div>
          </div>
        ))}
      </div>
      {/* Time column */}
            {/* Grid */}
      <div className="absolute left-16 top-8 right-0 h-full grid grid-cols-7 divide-x divide-gray-100">
        {DAYS.map((day) => (
          <div key={day} className="relative h-full">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="h-[60px] border-b border-gray-100 group cursor-pointer hover:bg-gray-50"
                onClick={() => handleSlotClick(day, hour)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Time column */}
      <div className="absolute left-0 top-8 w-16 h-full border-r bg-white sticky">
        {HOURS.map((hour) => (
          <div
            key={hour}
            className="h-[60px] border-b text-xs px-2 py-1 text-gray-500 sticky left-0 bg-white"
          >
            {format(addHours(new Date(), hour), 'h a')}
            {format(addHours(weekStart, hour), 'h a')}
          </div>
        ))}
      </div>

      {/* Day headers */}
      <div className="ml-16 h-8 flex border-b">
        {DAYS.map((day) => (
          <div
            key={day}
            className="flex-1 text-center text-sm font-medium py-1"
          >
            {format(addDays(weekStart, day), 'EEE dd')}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="ml-16 relative">
        {HOURS.map((hour) => (
          <div key={hour} className="flex h-[60px] border-b">
            {DAYS.map((day) => (
              <div
                key={`${day}-${hour}`}
                className="flex-1 border-r group cursor-pointer hover:bg-gray-50"
                onClick={() => handleSlotClick(day, hour)}
              >
                <div className="hidden group-hover:block text-xs text-gray-400 p-1">
                  Click to add
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* Appointments */}
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            className="absolute px-1"
            style={getPositionStyles(appointment)}
          >
            <AppointmentBlock
              appointment={appointment}
              onClick={() => onAppointmentClick(appointment)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeekView;