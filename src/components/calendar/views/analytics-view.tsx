'use client';

import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CalendarAppointment, Therapist } from '@/lib/calendar-types';

interface AnalyticsViewProps {
  appointments: CalendarAppointment[];
  therapists: Therapist[];
  startDate: Date;
  endDate: Date;
}

export function AnalyticsView({
  appointments,
  therapists,
  startDate,
  endDate,
}: AnalyticsViewProps) {
  // Calculate statistics
  const stats = React.useMemo(() => {
    const range = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Initialize stats object
    const stats = {
      totalAppointments: appointments.length,
      byStatus: {} as Record<string, number>,
      byTherapist: {} as Record<string, number>,
      byDayOfWeek: {} as Record<string, number>,
      byTimeOfDay: {
        morning: 0,   // 6-12
        afternoon: 0, // 12-17
        evening: 0,   // 17-22
      },
      utilization: {
        totalSlots: range.length * 12, // Assuming 12 slots per day
        booked: 0,
      },
    };

    // Calculate stats
    appointments.forEach(apt => {
      // By status
      stats.byStatus[apt.status] = (stats.byStatus[apt.status] || 0) + 1;

      // By therapist
      stats.byTherapist[apt.therapistId] = (stats.byTherapist[apt.therapistId] || 0) + 1;

      // By day of week
      const dayOfWeek = format(apt.startTime, 'EEEE');
      stats.byDayOfWeek[dayOfWeek] = (stats.byDayOfWeek[dayOfWeek] || 0) + 1;

      // By time of day
      const hour = apt.startTime.getHours();
      if (hour >= 6 && hour < 12) stats.byTimeOfDay.morning++;
      else if (hour >= 12 && hour < 17) stats.byTimeOfDay.afternoon++;
      else if (hour >= 17 && hour < 22) stats.byTimeOfDay.evening++;

      // Count as booked slot
      stats.utilization.booked++;
    });

    return stats;
  }, [appointments, startDate, endDate]);

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Total Appointments</h3>
            <p className="text-2xl">{stats.totalAppointments}</p>
          </Card>
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Utilization Rate</h3>
            <p className="text-2xl">
              {Math.round((stats.utilization.booked / stats.utilization.totalSlots) * 100)}%
            </p>
          </Card>
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Busiest Day</h3>
            <p className="text-2xl">
              {Object.entries(stats.byDayOfWeek)
                .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
            </p>
          </Card>
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Peak Time</h3>
            <p className="text-2xl">
              {Object.entries(stats.byTimeOfDay)
                .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
            </p>
          </Card>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status Breakdown */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Status Breakdown</h3>
            <div className="space-y-2">
              {Object.entries(stats.byStatus).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <Badge variant={status as any}>{status}</Badge>
                  <span>{count}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Therapist Workload */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Therapist Workload</h3>
            <div className="space-y-2">
              {therapists.map(therapist => (
                <Tooltip key={therapist.id}>
                  <TooltipTrigger asChild>
                    <div className="flex justify-between items-center">
                      <span>{therapist.name}</span>
                      <span>{stats.byTherapist[therapist.id] || 0}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {((stats.byTherapist[therapist.id] || 0) / stats.totalAppointments * 100)
                        .toFixed(1)}% of total appointments
                    </p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </ScrollArea>
  );
}