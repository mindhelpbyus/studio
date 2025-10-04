import React from 'react';
import { Appointment, Therapist } from '../../types/appointment';

interface MonthViewProps {
  date: Date;
  appointments: Appointment[];
  therapists: Therapist[];
  onDayClick: (date: Date) => void;
  onAppointmentClick: (appointment: Appointment) => void;
}

export function MonthView({
  date,
  appointments,
  therapists,
  onDayClick,
  onAppointmentClick,
}: MonthViewProps) {
  // Get the first day of the month
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  
  // Get the first day of the calendar (may be from previous month)
  const firstDayOfCalendar = new Date(firstDayOfMonth);
  const dayOfWeek = firstDayOfMonth.getDay();
  firstDayOfCalendar.setDate(firstDayOfMonth.getDate() - dayOfWeek);
  
  // Generate 42 days (6 weeks) for the calendar grid
  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const day = new Date(firstDayOfCalendar);
    day.setDate(firstDayOfCalendar.getDate() + i);
    return day;
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.startTime);
      return (
        aptDate.getFullYear() === day.getFullYear() &&
        aptDate.getMonth() === day.getMonth() &&
        aptDate.getDate() === day.getDate()
      );
    });
  };

  const isCurrentMonth = (day: Date) => {
    return day.getMonth() === date.getMonth();
  };

  const isToday = (day: Date) => {
    const today = new Date();
    return (
      day.getFullYear() === today.getFullYear() &&
      day.getMonth() === today.getMonth() &&
      day.getDate() === today.getDate()
    );
  };

  const getTherapistById = (id: string) => {
    return therapists.find(t => t.id === id);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header with day names */}
      <div className="grid grid-cols-7 border-b border-border bg-card">
        {weekDays.map(day => (
          <div
            key={day}
            className="p-3 text-center font-medium text-sm text-muted-foreground border-r border-border last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-6">
        {calendarDays.map((day, index) => {
          const dayAppointments = getAppointmentsForDay(day);
          const isCurrentMonthDay = isCurrentMonth(day);
          const isTodayDay = isToday(day);
          
          return (
            <div
              key={day.toISOString()}
              className={`
                border-r border-b border-border last:border-r-0 p-2 cursor-pointer transition-colors
                hover:bg-muted/50 min-h-24
                ${!isCurrentMonthDay ? 'bg-muted/20 text-muted-foreground' : 'bg-background'}
                ${isTodayDay ? 'bg-blue-50' : ''}
              `}
              onClick={() => onDayClick(day)}
            >
              {/* Day number */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`
                    text-sm font-medium
                    ${isTodayDay ? 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}
                    ${!isCurrentMonthDay ? 'text-muted-foreground' : ''}
                  `}
                >
                  {day.getDate()}
                </span>
                
                {/* Appointment count indicator */}
                {dayAppointments.length > 3 && (
                  <span className="text-xs text-muted-foreground bg-muted rounded px-1">
                    +{dayAppointments.length - 3}
                  </span>
                )}
              </div>

              {/* Appointments preview */}
              <div className="space-y-1">
                {dayAppointments.slice(0, 3).map(appointment => {
                  const therapist = getTherapistById(appointment.therapistId);
                  const startTime = new Date(appointment.startTime);
                  
                  return (
                    <div
                      key={appointment.id}
                      className={`
                        text-xs p-1 rounded cursor-pointer transition-colors
                        ${appointment.type === 'break' 
                          ? 'bg-gray-200 text-gray-700' 
                          : 'bg-white border-l-2 shadow-sm hover:shadow-md'
                        }
                      `}
                      style={{
                        borderLeftColor: appointment.type === 'break' ? '#6b7280' : (appointment.color || therapist?.color || '#3b82f6'),
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAppointmentClick(appointment);
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <span className="font-medium">
                          {startTime.toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </span>
                        {appointment.status === 'pending' && (
                          <span className="w-1 h-1 bg-yellow-500 rounded-full" />
                        )}
                      </div>
                      
                      <div className="truncate" title={appointment.title}>
                        {appointment.title}
                      </div>
                      
                      {therapists.length > 1 && therapist && (
                        <div className="text-xs text-muted-foreground truncate" title={therapist.name}>
                          {therapist.name}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Empty state */}
              {dayAppointments.length === 0 && isCurrentMonthDay && (
                <div className="h-full flex items-center justify-center text-muted-foreground text-xs opacity-0 hover:opacity-100 transition-opacity">
                  Click to add
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
