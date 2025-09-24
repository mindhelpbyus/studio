'use client';

import React from 'react';
import { CalendarAppointment } from '@/lib/calendar-types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';

interface MonthViewProps {
  date: Date;
  appointments: CalendarAppointment[];
  onDateClick: (date: Date) => void;
  onAppointmentClick: (appointment: CalendarAppointment) => void;
}

export const MonthView: React.FC<MonthViewProps> = ({
  date,
  appointments,
  onDateClick,
  onAppointmentClick,
}) => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.startTime);
      return (
        aptDate.getDate() === day.getDate() &&
        aptDate.getMonth() === day.getMonth() &&
        aptDate.getFullYear() === day.getFullYear()
      );
    });
  };

  return (
    <div className="h-full grid grid-cols-7 gap-px bg-gray-200">
      {/* Day headers */}
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
        <div
          key={day}
          className="bg-white p-2 text-sm font-medium text-center"
        >
          {day}
        </div>
      ))}

      {/* Calendar grid */}
      {days.map((day, dayIdx) => {
        const dayAppointments = getAppointmentsForDay(day);
        const isCurrentMonth = isSameMonth(day, date);

        return (
          <div
            key={day.toISOString()}
            className={`bg-white p-2 min-h-[120px] ${
              !isCurrentMonth ? 'text-gray-400' : ''
            } hover:bg-gray-50 cursor-pointer`}
            onClick={() => onDateClick(day)}
          >
            <div className="font-medium text-sm mb-1">
              {format(day, 'd')}
            </div>

            <div className="space-y-1">
              {dayAppointments.slice(0, 3).map((apt) => (
                <div
                  key={apt.id}
                  className={`text-xs p-1 rounded truncate bg-${apt.color}-100 text-${apt.color}-800 cursor-pointer hover:bg-${apt.color}-200`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAppointmentClick(apt);
                  }}
                >
                  {format(apt.startTime, 'h:mm a')} - {apt.title}
                </div>
              ))}
              {dayAppointments.length > 3 && (
                <div className="text-xs text-gray-500 pl-1">
                  +{dayAppointments.length - 3} more...
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MonthView;