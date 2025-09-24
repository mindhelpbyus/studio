'use client';

import { format, addHours, startOfDay, endOfDay, isSameDay } from 'date-fns';
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarAppointment, Therapist } from '@/lib/calendar-types';
import { EnhancedAppointmentBlock } from '../../calendar/enhanced-appointment-block';

interface ResourceTimelineProps {
  date: Date;
  therapists: Therapist[];
  appointments: CalendarAppointment[];
  onAppointmentClick: (appointment: CalendarAppointment) => void;
  onSlotSelect: (start: Date, end: Date, therapistId: string) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 60; // pixels per hour

export function ResourceTimeline({
  date,
  therapists,
  appointments,
  onAppointmentClick,
  onSlotSelect,
}: ResourceTimelineProps) {
  const timelineRef = React.useRef<HTMLDivElement>(null);
  
  // Scroll to current time on mount
  React.useEffect(() => {
    if (timelineRef.current) {
      const now = new Date();
      const currentHour = now.getHours();
      timelineRef.current.scrollTop = (currentHour - 1) * HOUR_HEIGHT;
    }
  }, []);

  // Group appointments by therapist
  const appointmentsByTherapist = React.useMemo(() => {
    const groups = new Map<string, CalendarAppointment[]>();
    
    therapists.forEach(therapist => {
      const therapistAppointments = appointments.filter(
        apt => apt.therapistId === therapist.id &&
        apt.startTime >= startOfDay(date) &&
        apt.endTime <= endOfDay(date)
      );
      groups.set(therapist.id, therapistAppointments);
    });
    
    return groups;
  }, [appointments, therapists, date]);

  // Current time indicator
  const CurrentTimeIndicator = () => {
    const now = new Date();
    const top = (now.getHours() + now.getMinutes() / 60) * HOUR_HEIGHT;
    
    return isSameDay(now, date) ? (
      <div 
        className="absolute left-0 right-0 flex items-center z-10"
        style={{ top: `${top}px` }}
      >
        <div className="w-2 h-2 rounded-full bg-red-500" />
        <div className="flex-1 h-px bg-red-500" />
      </div>
    ) : null;
  };

  return (
    <div className="flex h-full">
      {/* Time column */}
      <div className="w-20 flex-shrink-0 border-r bg-muted/5">
        {HOURS.map(hour => (
          <div 
            key={hour}
            className="h-[60px] border-b px-2 text-xs font-medium text-muted-foreground"
          >
            {format(addHours(startOfDay(date), hour), 'h a')}
          </div>
        ))}
      </div>

      {/* Resource columns */}
      <ScrollArea className="flex-1">
        <div className="flex min-w-full" ref={timelineRef}>
          {therapists.map(therapist => (
            <div 
              key={therapist.id}
              className="flex-1 min-w-[200px] border-r relative"
            >
              {/* Therapist header */}
              <div className="sticky top-0 z-10 h-14 border-b bg-background p-2">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={therapist.avatar} />
                    <AvatarFallback>
                      {therapist.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{therapist.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {therapist.specialty}
                    </div>
                  </div>
                </div>
              </div>

              {/* Time slots */}
              {HOURS.map(hour => (
                <div
                  key={hour}
                  className="h-[60px] border-b"
                  onClick={() => {
                    const start = addHours(startOfDay(date), hour);
                    const end = addHours(start, 1);
                    onSlotSelect(start, end, therapist.id);
                  }}
                />
              ))}

              {/* Appointments */}
              {appointmentsByTherapist.get(therapist.id)?.map(appointment => (
                <EnhancedAppointmentBlock
                  key={appointment.id}
                  appointment={appointment}
                  onClick={() => onAppointmentClick(appointment)}
                  showTherapistName={false}
                />
              ))}

              {/* Current time indicator */}
              <CurrentTimeIndicator />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}