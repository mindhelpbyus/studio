'use client';

import React from 'react';
import { CalendarAppointment } from '@/lib/calendar-types';
import { format, isSameDay, startOfDay, endOfDay } from 'date-fns';
import { EnhancedAppointmentBlock } from '../../calendar/enhanced-appointment-block';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

interface AgendaViewProps {
  appointments: CalendarAppointment[];
  startDate: Date;
  endDate: Date;
  onAppointmentClick: (appointment: CalendarAppointment) => void;
}

export function AgendaView({
  appointments,
  startDate,
  endDate,
  onAppointmentClick,
}: AgendaViewProps) {
  // Group appointments by date
  const groupedAppointments = React.useMemo(() => {
    const groups = new Map<string, CalendarAppointment[]>();
    
    appointments.forEach(appointment => {
      if (appointment.startTime >= startOfDay(startDate) && 
          appointment.endTime <= endOfDay(endDate)) {
        const dateKey = format(appointment.startTime, 'yyyy-MM-dd');
        if (!groups.has(dateKey)) {
          groups.set(dateKey, []);
        }
        groups.get(dateKey)?.push(appointment);
      }
    });

    // Sort appointments within each day
    groups.forEach(dayAppointments => {
      dayAppointments.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    });

    return groups;
  }, [appointments, startDate, endDate]);

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {Array.from(groupedAppointments.entries()).map(([dateKey, dayAppointments]) => (
          <Card key={dateKey}>
            <CardHeader>
              <CardTitle>
                {format(new Date(dateKey), 'EEEE, MMMM d, yyyy')}
              </CardTitle>
              <CardDescription>
                {dayAppointments.length} appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {dayAppointments.map(appointment => (
                  <div
                    key={appointment.id}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    onClick={() => onAppointmentClick(appointment)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{appointment.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {appointment.patientName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {format(appointment.startTime, 'h:mm a')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(appointment.endTime, 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}