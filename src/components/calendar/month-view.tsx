'use client';

import React, { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { CalendarAppointment, Therapist } from '@/lib/enhanced-appointments';
import { cn } from '@/lib/utils';
import { CompactAppointment } from './compact-appointment';
import { MoreEventsLink } from './more-events-link';

interface MonthViewProps {
  appointments: CalendarAppointment[];
  therapists: Therapist[];
  currentDate: Date;
  userRole: 'therapist' | 'admin';
  onDayClick: (date: Date) => void;
  onAppointmentClick: (appointment: CalendarAppointment) => void;
  maxEventsPerDay?: number;
}

interface DayCellProps {
  date: Date;
  appointments: CalendarAppointment[];
  isCurrentMonth: boolean;
  isToday: boolean;
  maxEvents: number;
  onDayClick: (date: Date) => void;
  onAppointmentClick: (appointment: CalendarAppointment) => void;
}

const DayCell: React.FC<DayCellProps> = ({
  date,
  appointments,
  isCurrentMonth,
  isToday,
  maxEvents,
  onDayClick,
  onAppointmentClick,
}) => {
  const visibleAppointments = appointments.slice(0, maxEvents);
  const hiddenCount = Math.max(0, appointments.length - maxEvents);

  return (
    <div
      className={cn(
        'min-h-[120px] border border-gray-200 bg-white p-2 cursor-pointer transition-colors hover:bg-gray-50',
        !isCurrentMonth && 'bg-gray-50 text-gray-400',
        isToday && 'bg-blue-50 border-blue-200'
      )}
      onClick={() => onDayClick(date)}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className={cn(
            'text-sm font-medium',
            isToday && 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs'
          )}
        >
          {format(date, 'd')}
        </span>
      </div>
      
      <div className="space-y-1">
        {visibleAppointments.map((appointment) => (
          <CompactAppointment
            key={appointment.id}
            appointment={appointment}
            onClick={(e) => {
              e.stopPropagation();
              onAppointmentClick(appointment);
            }}
          />
        ))}
        
        {hiddenCount > 0 && (
          <MoreEventsLink
            count={hiddenCount}
            onClick={(e) => {
              e.stopPropagation();
              onDayClick(date);
            }}
          />
        )}
      </div>
    </div>
  );
};

const MonthHeader: React.FC = () => {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div className="grid grid-cols-7 border-b border-gray-200">
      {dayNames.map((day) => (
        <div
          key={day}
          className="p-3 text-center text-sm font-medium text-gray-700 bg-gray-50 border-r border-gray-200 last:border-r-0"
        >
          {day}
        </div>
      ))}
    </div>
  );
};

export const MonthView: React.FC<MonthViewProps> = ({
  appointments,
  therapists,
  currentDate,
  userRole,
  onDayClick,
  onAppointmentClick,
  maxEventsPerDay = 3,
}) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  // Get all days to display (including days from previous/next month to fill the grid)
  const calendarStart = new Date(monthStart);
  calendarStart.setDate(calendarStart.getDate() - monthStart.getDay());
  
  const calendarEnd = new Date(monthEnd);
  calendarEnd.setDate(calendarEnd.getDate() + (6 - monthEnd.getDay()));
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  // Group appointments by date
  const appointmentsByDate = useMemo(() => {
    const grouped: Record<string, CalendarAppointment[]> = {};
    
    appointments.forEach((appointment) => {
      const dateKey = format(appointment.startTime, 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(appointment);
    });
    
    // Sort appointments by start time for each date
    Object.keys(grouped).forEach((dateKey) => {
      grouped[dateKey].sort((a, b) => 
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
    });
    
    return grouped;
  }, [appointments]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <MonthHeader />
      
      <div className="grid grid-cols-7">
        {calendarDays.map((date) => {
          const dateKey = format(date, 'yyyy-MM-dd');
          const dayAppointments = appointmentsByDate[dateKey] || [];
          
          return (
            <DayCell
              key={dateKey}
              date={date}
              appointments={dayAppointments}
              isCurrentMonth={isSameMonth(date, currentDate)}
              isToday={isToday(date)}
              maxEvents={maxEventsPerDay}
              onDayClick={onDayClick}
              onAppointmentClick={onAppointmentClick}
            />
          );
        })}
      </div>
    </div>
  );
};