import React from 'react';
import { Appointment, Therapist } from '../../types/appointment';
import { AppointmentCard } from '../calendar-system/AppointmentCard';
import { useDrop } from 'react-dnd';

interface WeekViewProps {
  startDate: Date;
  appointments: Appointment[];
  therapists: Therapist[];
  onSlotClick: (date: Date, time: string, therapistId?: string) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  onAppointmentUpdate: (appointmentId: string, updates: Partial<Appointment>) => void;
  showMultipleTherapists: boolean;
}

export function WeekView({
  startDate,
  appointments,
  therapists,
  onSlotClick,
  onAppointmentClick,
  onAppointmentUpdate,
  showMultipleTherapists,
}: WeekViewProps) {
  // Generate 7 days starting from startDate
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    return date;
  });

  // Generate time slots from 6 AM to 10 PM (business hours)
  const timeSlots = Array.from({ length: 16 }, (_, i) => {
    const hour = i + 6; // Start from 6 AM
    return {
      hour,
      time: `${hour.toString().padStart(2, '0')}:00`,
      displayTime: new Date(0, 0, 0, hour).toLocaleTimeString('en-US', {
        hour: 'numeric',
        hour12: true,
      }),
    };
  });

  const getAppointmentsForSlot = (date: Date, hour: number, therapistId?: string) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.startTime);
      const aptHour = aptDate.getHours();
      const matchesDate = (
        aptDate.getFullYear() === date.getFullYear() &&
        aptDate.getMonth() === date.getMonth() &&
        aptDate.getDate() === date.getDate()
      );
      const matchesHour = aptHour === hour;
      const matchesTherapist = !therapistId || apt.therapistId === therapistId;
      
      return matchesDate && matchesHour && matchesTherapist;
    });
  };

  const handleSlotClick = (date: Date, hour: number, therapistId?: string) => {
    const time = `${hour.toString().padStart(2, '0')}:00`;
    onSlotClick(date, time, therapistId);
  };

  const handleDrop = (item: { appointment: Appointment }, date: Date, hour: number, therapistId?: string) => {
    const newStartTime = new Date(date);
    newStartTime.setHours(hour, 0, 0, 0);
    
    const originalStart = new Date(item.appointment.startTime);
    const originalEnd = new Date(item.appointment.endTime);
    const duration = originalEnd.getTime() - originalStart.getTime();
    
    const newEndTime = new Date(newStartTime.getTime() + duration);
    
    onAppointmentUpdate(item.appointment.id, {
      startTime: newStartTime,
      endTime: newEndTime,
      ...(therapistId && { therapistId }),
    });
  };

  const formatDayHeader = (date: Date) => {
    const today = new Date();
    const isToday = (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );

    return {
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: date.getDate(),
      isToday,
    };
  };

  if (showMultipleTherapists) {
    return (
      <div className="h-full overflow-auto">
        {/* Warning for many therapists */}
        {therapists.length > 6 && (
          <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-sm text-yellow-800">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              Viewing {therapists.length} therapists. Consider filtering to improve performance and readability.
            </div>
          </div>
        )}
        <div className="min-w-max" style={{ minWidth: `${Math.max(800, therapists.length * 200)}px` }}>
          {/* Header Row */}
          <div className="sticky top-0 bg-background z-10 border-b border-border">
            <div className="flex">
              <div className="w-20 border-r border-border bg-muted/30 flex items-center justify-center text-sm font-medium p-2">
                Time
              </div>
              {therapists.map(therapist => (
                <div key={therapist.id} className="flex-1" style={{ minWidth: '200px' }}>
                  <div className="bg-card border-r border-border p-3 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: therapist.color }}
                      />
                      <span className="font-medium text-sm">{therapist.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{therapist.email}</div>
                  </div>
                  <div className="flex border-r border-border">
                    {weekDays.map(date => {
                      const dayInfo = formatDayHeader(date);
                      return (
                        <div
                          key={date.toISOString()}
                          className={`
                            flex-1 p-2 text-center border-r border-border bg-card text-xs
                            ${dayInfo.isToday ? 'bg-blue-50 text-blue-900' : ''}
                          `}
                        >
                          <div className="font-medium">{dayInfo.dayName}</div>
                          <div className={`text-lg ${dayInfo.isToday ? 'font-bold' : ''}`}>
                            {dayInfo.dayNumber}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Time Slots */}
          {timeSlots.map(slot => (
            <div key={slot.hour} className="flex border-b border-border">
              <div className="w-20 border-r border-border bg-muted/30 flex items-center justify-center text-xs text-muted-foreground p-2">
                {slot.displayTime}
              </div>
              {therapists.map(therapist => (
                <div key={therapist.id} className="flex-1 border-r border-border" style={{ minWidth: '200px' }}>
                  <div className="flex h-20">
                    {weekDays.map(date => (
                      <WeekSlot
                        key={`${therapist.id}-${date.toISOString()}-${slot.hour}`}
                        date={date}
                        hour={slot.hour}
                        appointments={getAppointmentsForSlot(date, slot.hour, therapist.id)}
                        therapist={therapist}
                        onSlotClick={() => handleSlotClick(date, slot.hour, therapist.id)}
                        onAppointmentClick={onAppointmentClick}
                        onDrop={(item) => handleDrop(item, date, slot.hour, therapist.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Single therapist view
  const therapist = therapists[0];
  return (
    <div className="h-full overflow-auto">
      <div className="min-w-max">
        {/* Header Row */}
        <div className="sticky top-0 bg-background z-10 border-b border-border">
          <div className="flex">
            <div className="w-16 border-r border-border bg-muted/30 flex items-center justify-center text-sm font-medium p-2">
              Time
            </div>
            {weekDays.map(date => {
              const dayInfo = formatDayHeader(date);
              return (
                <div
                  key={date.toISOString()}
                  className={`
                    flex-1 min-w-32 p-3 text-center border-r border-border bg-card
                    ${dayInfo.isToday ? 'bg-blue-50 text-blue-900' : ''}
                  `}
                >
                  <div className="font-medium text-sm">{dayInfo.dayName}</div>
                  <div className={`text-xl ${dayInfo.isToday ? 'font-bold' : ''}`}>
                    {dayInfo.dayNumber}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Time Slots */}
        {timeSlots.map(slot => (
          <div key={slot.hour} className="flex border-b border-border">
            <div className="w-16 border-r border-border bg-muted/30 flex items-center justify-center text-xs text-muted-foreground p-2">
              {slot.displayTime}
            </div>
            {weekDays.map(date => (
              <WeekSlot
                key={`${date.toISOString()}-${slot.hour}`}
                date={date}
                hour={slot.hour}
                appointments={getAppointmentsForSlot(date, slot.hour, therapist?.id)}
                therapist={therapist}
                onSlotClick={() => handleSlotClick(date, slot.hour, therapist?.id)}
                onAppointmentClick={onAppointmentClick}
                onDrop={(item) => handleDrop(item, date, slot.hour, therapist?.id)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

interface WeekSlotProps {
  date: Date;
  hour: number;
  appointments: Appointment[];
  therapist: Therapist | undefined;
  onSlotClick: () => void;
  onAppointmentClick: (appointment: Appointment) => void;
  onDrop: (item: { appointment: Appointment }) => void;
}

function WeekSlot({
  date,
  hour,
  appointments,
  therapist,
  onSlotClick,
  onAppointmentClick,
  onDrop,
}: WeekSlotProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'appointment',
    drop: (item: { appointment: Appointment }) => onDrop(item),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const now = new Date();
  const isCurrentHour = (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate() &&
    hour === now.getHours()
  );

  const isPastHour = date.getTime() + (hour * 60 * 60 * 1000) < now.getTime();

  return (
    <div
      ref={drop as unknown as React.Ref<HTMLDivElement>}
      className={`
        flex-1 h-20 border-r border-border p-1 transition-colors cursor-pointer
        ${isOver ? 'bg-primary/10' : 'hover:bg-muted/50'}
        ${isCurrentHour ? 'bg-blue-50' : ''}
        ${isPastHour ? 'bg-gray-50' : ''}
      `}
      style={{ minWidth: '28px' }}
      onClick={appointments.length === 0 ? onSlotClick : undefined}
    >
      <div className="h-full overflow-hidden">
        {appointments.map(appointment => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            therapist={therapist}
            onClick={() => onAppointmentClick(appointment)}
            className="text-xs mb-1 h-fit"
            showTherapistName={false}
          />
        ))}
      </div>
    </div>
  );
}
