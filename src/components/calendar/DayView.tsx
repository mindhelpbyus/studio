'use client';

import React from 'react';
import { CalendarAppointment } from '@/lib/calendar-types';
import { AppointmentBlock } from './appointment-block';
import { format, addHours, startOfDay, endOfDay } from 'date-fns';

interface DayViewProps {
  date: Date;
  appointments: CalendarAppointment[];
  onAppointmentClick: (appointment: CalendarAppointment) => void;
  onSlotSelect: (start: Date, end: Date) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export const DayView: React.FC<DayViewProps> = ({
  date,
  appointments,
  onAppointmentClick,
  onSlotSelect,
}) => {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);
  
  const dayAppointments = appointments.filter(
    (apt) => apt.startTime >= dayStart && apt.endTime <= dayEnd
  );

  const getPositionStyles = (appointment: CalendarAppointment) => {
    const startHour = appointment.startTime.getHours();
    const startMinutes = appointment.startTime.getMinutes();
    const endHour = appointment.endTime.getHours();
    const endMinutes = appointment.endTime.getMinutes();

    const top = (startHour + startMinutes / 60) * 60;
    const height = ((endHour - startHour) * 60 + (endMinutes - startMinutes));

    return {
      top: `${top}px`,
      height: `${height}px`,
    };
  };

  const handleSlotClick = (hour: number) => {
    const start = addHours(dayStart, hour);
    const end = addHours(start, 1);
    onSlotSelect(start, end);
  };

  return (
    <div className="relative h-[1440px] border rounded-lg overflow-auto bg-white">
      {/* Time slots */}
      <div className="absolute left-0 top-0 w-16 h-full border-r">
        {HOURS.map((hour) => (
          <div
            key={hour}
            className="h-[60px] border-b text-xs px-2 py-1 text-gray-500"
          >
            {format(addHours(dayStart, hour), 'h a')}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="ml-16 relative">
        {HOURS.map((hour) => (
          <div
            key={hour}
            className="h-[60px] border-b border-gray-100 group cursor-pointer hover:bg-gray-50"
            onClick={() => handleSlotClick(hour)}
          >
            <div className="hidden group-hover:block text-xs text-gray-400 p-1">
              Click to add appointment
            </div>
          </div>
        ))}

        {/* Appointments */}
        {dayAppointments.map((appointment) => (
          <div
            key={appointment.id}
            className="absolute left-0 right-0 px-2"
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

export default DayView;