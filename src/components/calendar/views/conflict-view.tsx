'use client';

import React from 'react';
import { CalendarAppointment, Therapist } from '@/lib/calendar-types';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertOctagon, Clock, ArrowRightLeft } from 'lucide-react';

interface ConflictViewProps {
  appointments: CalendarAppointment[];
  therapists: Therapist[];
  onAppointmentClick?: (appointment: CalendarAppointment) => void;
  onResolveConflict?: (appointments: CalendarAppointment[]) => void;
}

interface ConflictGroup {
  appointments: CalendarAppointment[];
  type: 'overlap' | 'double-booked' | 'capacity';
  severity: 'high' | 'medium' | 'low';
}

export function ConflictView({
  appointments,
  therapists,
  onAppointmentClick,
  onResolveConflict,
}: ConflictViewProps) {
  // Find conflicts in appointments
  const conflicts = React.useMemo(() => {
    const conflictGroups: ConflictGroup[] = [];

    // Helper to check if appointments overlap
    const checkOverlap = (apt1: CalendarAppointment, apt2: CalendarAppointment) => {
      return (
        apt1.startTime < apt2.endTime &&
        apt2.startTime < apt1.endTime
      );
    };

    // Check for overlapping appointments for the same therapist
    appointments.forEach((apt1, i) => {
      appointments.slice(i + 1).forEach(apt2 => {
        if (apt1.therapistId === apt2.therapistId && checkOverlap(apt1, apt2)) {
          conflictGroups.push({
            appointments: [apt1, apt2],
            type: 'double-booked',
            severity: 'high',
          });
        }
      });
    });

    // Check for capacity conflicts (too many concurrent appointments)
    const timeSlots = appointments.reduce((slots, apt) => {
      const key = format(apt.startTime, 'yyyy-MM-dd HH:mm');
      if (!slots[key]) slots[key] = [];
      slots[key].push(apt);
      return slots;
    }, {} as Record<string, CalendarAppointment[]>);

    Object.values(timeSlots).forEach(slotApts => {
      if (slotApts.length > therapists.length) {
        conflictGroups.push({
          appointments: slotApts,
          type: 'capacity',
          severity: 'medium',
        });
      }
    });

    return conflictGroups;
  }, [appointments, therapists]);

  const getSeverityColor = (severity: ConflictGroup['severity']) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getConflictDescription = (conflict: ConflictGroup) => {
    switch (conflict.type) {
      case 'double-booked':
        return 'Double-booked therapist';
      case 'overlap':
        return 'Overlapping appointments';
      case 'capacity':
        return 'Exceeds facility capacity';
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-6">
        <div className="grid gap-6">
          {conflicts.map((conflict, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <AlertOctagon className="h-5 w-5 text-destructive" />
                <h3 className="font-semibold">
                  {getConflictDescription(conflict)}
                </h3>
                <Badge variant={getSeverityColor(conflict.severity)}>
                  {conflict.severity}
                </Badge>
              </div>

              <div className="space-y-4">
                {conflict.appointments.map(appointment => (
                  <div
                    key={appointment.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    onClick={() => onAppointmentClick?.(appointment)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(appointment.startTime, 'MMM d, h:mm a')} -{' '}
                          {format(appointment.endTime, 'h:mm a')}
                        </span>
                      </div>
                      <Badge>
                        {appointment.status}
                      </Badge>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      With: {therapists.find(t => t.id === appointment.therapistId)?.name}
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => onResolveConflict?.(conflict.appointments)}
                >
                  <ArrowRightLeft className="mr-2 h-4 w-4" />
                  Resolve Conflict
                </Button>
              </div>
            </Card>
          ))}

          {conflicts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No conflicts detected
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}