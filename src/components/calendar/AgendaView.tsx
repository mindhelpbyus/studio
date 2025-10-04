import React from 'react';
import { Appointment, Therapist } from '../types/appointment';
import { format, isSameDay, isToday, isTomorrow, isThisWeek } from 'date-fns';
import { Clock, Calendar, User, List } from 'lucide-react';
import { Badge } from '@/components/nexus-ui';

interface AgendaViewProps {
  appointments: Appointment[];
  therapists: Therapist[];
  currentDate: Date;
  onAppointmentClick: (appointment: Appointment) => void;
}

export function AgendaView({ appointments, therapists, currentDate, onAppointmentClick }: AgendaViewProps) {
  // Get upcoming appointments (next 7 days)
  const now = new Date();
  const upcomingAppointments = appointments
    .filter(apt => {
      const aptDate = new Date(apt.startTime);
      return aptDate >= now && isThisWeek(aptDate);
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  // Group appointments by date
  const groupedAppointments = upcomingAppointments.reduce((groups, appointment) => {
    const date = new Date(appointment.startTime);
    const dateKey = format(date, 'yyyy-MM-dd');
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(appointment);
    return groups;
  }, {} as Record<string, Appointment[]>);

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEEE, MMM d');
  };

  const getTherapist = (therapistId: string) => {
    return therapists.find(t => t.id === therapistId);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-sidebar">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <List className="h-4 w-4 text-sidebar-foreground/60" />
          <h3 className="font-medium text-sm text-sidebar-foreground">Agenda</h3>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {Object.keys(groupedAppointments).length === 0 ? (
          <div className="text-center py-6">
            <Calendar className="h-6 w-6 text-sidebar-foreground/40 mx-auto mb-2" />
            <p className="text-xs text-sidebar-foreground/60">No upcoming appointments</p>
          </div>
        ) : (
          Object.entries(groupedAppointments).map(([dateStr, dayAppointments]) => (
            <div key={dateStr} className="space-y-2">
              <h4 className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wide">
                {getDateLabel(dateStr)}
              </h4>
              
              <div className="space-y-1">
                {dayAppointments.map((appointment) => {
                  const therapist = getTherapist(appointment.therapistId);
                  const startTime = new Date(appointment.startTime);
                  const endTime = new Date(appointment.endTime);
                  
                  return (
                    <button
                      key={appointment.id}
                      onClick={() => onAppointmentClick(appointment)}
                      className="w-full text-left p-2 rounded-md hover:bg-sidebar-accent transition-colors group"
                    >
                      <div className="flex items-start gap-2">
                        {/* Color indicator */}
                        <div
                          className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                          style={{ backgroundColor: therapist?.color || '#666' }}
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 mb-1">
                            <Clock className="h-3 w-3 text-sidebar-foreground/50" />
                            <span className="text-xs text-sidebar-foreground/70">
                              {format(startTime, 'h:mm a')}
                            </span>
                          </div>
                          
                          <div className="font-medium text-xs text-sidebar-foreground truncate mb-1">
                            {appointment.clientName || appointment.title}
                          </div>
                          
                          {therapist && (
                            <div className="text-xs text-sidebar-foreground/60 truncate">
                              {therapist.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}