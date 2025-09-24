'use client';

import React from 'react';
import { CalendarAppointment } from '@/lib/calendar-types';
import { AppointmentBlock } from './appointment-block';
import { format, addDays, startOfDay, endOfDay, addHours } from 'date-fns';

interface WeekViewProps {
  startDate: Date;
  appointments: CalendarAppointment[];
  onAppointmentClick: (appointment: CalendarAppointment) => void;
  onSlotSelect: (start: Date, end: Date) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS = Array.from({ length: 7 }, (_, i) => i);

export const WeekView: React.FC<WeekViewProps> = ({
  startDate,
  appointments,
  onAppointmentClick,
  onSlotSelect,
}) => {
  const weekStart = startOfDay(startDate);

  const getPositionStyles = (appointment: CalendarAppointment) => {
    const startHour = appointment.startTime.getHours();
    const startMinutes = appointment.startTime.getMinutes();
    const endHour = appointment.endTime.getHours();
    const endMinutes = appointment.endTime.getMinutes();
    const dayIndex = appointment.startTime.getDay();

    const top = (startHour + startMinutes / 60) * 60;
    const height = ((endHour - startHour) * 60 + (endMinutes - startMinutes));
    const left = `${(dayIndex * 100) / 7}%`;
    const width = `${100 / 7}%`;

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
    <div className="relative h-[1440px] border rounded-lg overflow-auto bg-white">
      {/* Time column */}
      <div className="absolute left-0 top-8 w-16 h-full border-r">
        {HOURS.map((hour) => (
          <div
            key={hour}
            className="h-[60px] border-b text-xs px-2 py-1 text-gray-500"
          >
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