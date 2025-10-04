import React from 'react';
import { Appointment, Therapist } from '../../types/appointment';
import { AppointmentCard } from './AppointmentCard';
import { useDrop } from 'react-dnd';

interface DayViewProps {
  date: Date;
  appointments: Appointment[];
  therapists: Therapist[];
  onSlotClick: (date: Date, time: string, therapistId?: string) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  onAppointmentUpdate: (appointmentId: string, updates: Partial<Appointment>) => void;
  showMultipleTherapists: boolean;
}

export function DayView({
  date,
  appointments,
  therapists,
  onSlotClick,
  onAppointmentClick,
  onAppointmentUpdate,
  showMultipleTherapists,
}: DayViewProps) {
  // Generate time slots from 12:00 AM to 11:00 PM
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    return {
      hour,
      time: `${hour.toString().padStart(2, '0')}:00`,
      displayTime: new Date(0, 0, 0, hour).toLocaleTimeString('en-US', {
        hour: 'numeric',
        hour12: true,
      }),
    };
  });

  // Filter appointments for this day
  const dayAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.startTime);
    return (
      aptDate.getFullYear() === date.getFullYear() &&
      aptDate.getMonth() === date.getMonth() &&
      aptDate.getDate() === date.getDate()
    );
  });

  const getAppointmentsForSlot = (hour: number, therapistId?: string) => {
    return dayAppointments.filter(apt => {
      const aptStart = new Date(apt.startTime);
      const aptHour = aptStart.getHours();
      const matchesTherapist = !therapistId || apt.therapistId === therapistId;
      return aptHour === hour && matchesTherapist;
    });
  };

  const handleSlotClick = (hour: number, therapistId?: string) => {
    const time = `${hour.toString().padStart(2, '0')}:00`;
    onSlotClick(date, time, therapistId);
  };

  const handleDrop = (item: { appointment: Appointment }, hour: number, therapistId?: string) => {
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

  if (showMultipleTherapists) {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        {/* Warning for many therapists */}
        {therapists.length > 6 && (
          <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-sm text-yellow-800 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              Viewing {therapists.length} therapists. Consider filtering to improve performance and readability.
            </div>
          </div>
        )}
        <div className="flex-1 overflow-auto">
          <div className="flex" style={{ minWidth: `${Math.max(600, therapists.length * 200)}px` }}>
            {/* Time Column */}
            <div className="w-20 border-r border-border bg-muted/30 flex-shrink-0">
              <div className="h-16 border-b border-border flex items-center justify-center text-sm font-medium">
                Time
              </div>
              {timeSlots.map(slot => (
                <div
                  key={slot.hour}
                  className="h-16 border-b border-border flex items-center justify-center text-xs text-muted-foreground"
                >
                  {slot.displayTime}
                </div>
              ))}
            </div>

            {/* Therapist Columns */}
            {therapists.map(therapist => (
              <TherapistColumn
                key={therapist.id}
                therapist={therapist}
                timeSlots={timeSlots}
                appointments={dayAppointments.filter(apt => apt.therapistId === therapist.id)}
                onSlotClick={handleSlotClick}
                onAppointmentClick={onAppointmentClick}
                onDrop={handleDrop}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Single therapist view
  const therapist = therapists[0];
  return (
    <div className="h-full overflow-y-auto">
      <div className="flex min-h-full">
        {/* Time Column */}
        <div className="w-20 border-r border-border bg-muted/30 flex-shrink-0">
          {timeSlots.map(slot => (
            <div
              key={slot.hour}
              className="h-16 border-b border-border flex items-center justify-center text-xs text-muted-foreground"
            >
              {slot.displayTime}
            </div>
          ))}
        </div>

        {/* Appointments Column */}
        <div className="flex-1 min-w-0">
          {timeSlots.map(slot => (
            <TimeSlot
              key={slot.hour}
              hour={slot.hour}
              appointments={getAppointmentsForSlot(slot.hour, therapist?.id)}
              therapist={therapist}
              onSlotClick={() => handleSlotClick(slot.hour, therapist?.id)}
              onAppointmentClick={onAppointmentClick}
              onDrop={(item) => handleDrop(item, slot.hour, therapist?.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface TherapistColumnProps {
  therapist: Therapist;
  timeSlots: Array<{ hour: number; displayTime: string }>;
  appointments: Appointment[];
  onSlotClick: (hour: number, therapistId: string) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  onDrop: (item: { appointment: Appointment }, hour: number, therapistId: string) => void;
}

function TherapistColumn({
  therapist,
  timeSlots,
  appointments,
  onSlotClick,
  onAppointmentClick,
  onDrop,
}: TherapistColumnProps) {
  const getAppointmentsForSlot = (hour: number) => {
    return appointments.filter(apt => {
      const aptStart = new Date(apt.startTime);
      return aptStart.getHours() === hour;
    });
  };

  return (
    <div className="border-r border-border flex-shrink-0" style={{ minWidth: '200px', width: '200px' }}>
      {/* Header */}
      <div className="h-16 border-b border-border bg-card px-3 py-2 flex flex-col items-center justify-center">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: therapist.color }}
          />
          <span className="font-medium text-sm">{therapist.name}</span>
        </div>
        <div className="text-xs text-muted-foreground truncate max-w-full">
          {therapist.email}
        </div>
      </div>

      {/* Time Slots */}
      {timeSlots.map(slot => (
        <TimeSlot
          key={slot.hour}
          hour={slot.hour}
          appointments={getAppointmentsForSlot(slot.hour)}
          therapist={therapist}
          onSlotClick={() => onSlotClick(slot.hour, therapist.id)}
          onAppointmentClick={onAppointmentClick}
          onDrop={(item) => onDrop(item, slot.hour, therapist.id)}
        />
      ))}
    </div>
  );
}

interface TimeSlotProps {
  hour: number;
  appointments: Appointment[];
  therapist?: Therapist | undefined;
  onSlotClick: () => void;
  onAppointmentClick: (appointment: Appointment) => void;
  onDrop: (item: { appointment: Appointment }) => void;
}

function TimeSlot({
  hour,
  appointments,
  therapist,
  onSlotClick,
  onAppointmentClick,
  onDrop,
}: TimeSlotProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'appointment',
    drop: (item: { appointment: Appointment }) => onDrop(item),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const isCurrentHour = new Date().getHours() === hour;

  return (
    <div
      ref={drop as unknown as React.Ref<HTMLDivElement>}
      className={`
        h-16 border-b border-border p-2 transition-colors relative
        ${isOver ? 'bg-primary/10' : 'hover:bg-muted/50'}
        ${isCurrentHour ? 'bg-blue-50' : ''}
        ${appointments.length === 0 ? 'cursor-pointer' : ''}
      `}
      onClick={(e) => {
        // Only trigger slot click if clicking on empty space
        if (appointments.length === 0 && e.target === e.currentTarget) {
          onSlotClick();
        }
      }}
    >
      <div className="space-y-1 h-full">
        {appointments.length === 0 && (
          <div className="flex items-center justify-center h-full text-xs text-muted-foreground opacity-0 hover:opacity-100 transition-opacity">
            Click to book
          </div>
        )}
        {appointments.map(appointment => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            therapist={therapist}
            onClick={() => onAppointmentClick(appointment)}
            className="text-xs"
          />
        ))}
      </div>
    </div>
  );
}
