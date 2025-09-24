'use client';

import { format } from 'date-fns';
import { ArrowRight, Clock, AlertTriangle } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarAppointment, Therapist } from '@/lib/calendar-types';

interface WaitlistViewProps {
  appointments: CalendarAppointment[];
  therapists: Therapist[];
  onAppointmentClick?: (appointment: CalendarAppointment) => void;
  onAcceptWaitlist?: (appointment: CalendarAppointment) => void;
}

interface WaitlistEntry {
  appointment: CalendarAppointment;
  suggestedSlots: {
    startTime: Date;
    therapistId: string;
  }[];
}

export function WaitlistView({
  appointments,
  therapists,
  onAppointmentClick,
  onAcceptWaitlist,
}: WaitlistViewProps) {
  // Filter appointments in waitlist status (assuming we add this status)
  const waitlistAppointments = appointments.filter(
    apt => apt.status === 'waitlist'
  );

  // Group waitlist entries by preferred time slot
  const groupedByTime = React.useMemo(() => {
    const groups: Record<string, WaitlistEntry[]> = {};
    
    waitlistAppointments.forEach(apt => {
      const timeKey = format(apt.startTime, 'HH:mm');
      if (!groups[timeKey]) {
        groups[timeKey] = [];
      }
      
      // Find alternative slots (simplified example)
      const suggestedSlots = therapists
        .filter(t => t.id !== apt.therapistId)
        .map(t => ({
          startTime: apt.startTime,
          therapistId: t.id,
        }));
      
      groups[timeKey].push({
        appointment: apt,
        suggestedSlots,
      });
    });
    
    return groups;
  }, [waitlistAppointments, therapists]);

  return (
    <ScrollArea className="h-full">
      <div className="p-6">
        <div className="grid gap-6">
          {Object.entries(groupedByTime).map(([timeSlot, entries]) => (
            <Card key={timeSlot} className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">Preferred Time: {timeSlot}</h3>
              </div>
              
              <div className="space-y-4">
                {entries.map(({ appointment, suggestedSlots }) => (
                  <div
                    key={appointment.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{appointment.patientName}</div>
                        <div className="text-sm text-muted-foreground">
                          {appointment.type} with{' '}
                          {therapists.find(t => t.id === appointment.therapistId)?.name}
                        </div>
                      </div>
                      <Badge variant="secondary">Waitlist</Badge>
                    </div>
                    
                    {suggestedSlots.length > 0 ? (
                      <div>
                        <div className="text-sm font-medium mb-2">
                          Available Alternatives:
                        </div>
                        <div className="space-y-2">
                          {suggestedSlots.map((slot, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-muted p-2 rounded-md"
                            >
                              <div className="text-sm">
                                {format(slot.startTime, 'MMM d, h:mm a')} with{' '}
                                {therapists.find(t => t.id === slot.therapistId)?.name}
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onAcceptWaitlist?.(appointment)}
                              >
                                Accept
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <AlertTriangle className="h-4 w-4" />
                        No alternative slots available
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ))}
          
          {Object.keys(groupedByTime).length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No appointments in waitlist
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}