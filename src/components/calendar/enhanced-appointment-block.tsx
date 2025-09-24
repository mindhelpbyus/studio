'use client';

import { User, Clock, AlertTriangle } from 'lucide-react';
import React from 'react';
import { CalendarAppointment } from '@/lib/calendar-types';
import { calculateAppointmentPosition, formatTime } from '@/lib/calendar-utils';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

interface AppointmentBlockProps {
  appointment: CalendarAppointment;
  onClick: () => void;
  isActive?: boolean;
  isWeekView?: boolean;
  showTherapistName?: boolean;
}

export function EnhancedAppointmentBlock({
  appointment,
  onClick,
  isActive = false,
  isWeekView = false,
  showTherapistName = false,
}: AppointmentBlockProps) {
  const { top, height } = calculateAppointmentPosition(appointment);
  
  // Dynamic styling based on appointment type and status
  const getAppointmentStyle = () => {
    const baseStyle = "absolute left-1 right-1 rounded-md p-2 overflow-hidden shadow-sm transition-all duration-200 cursor-pointer hover:shadow-md";
    const statusStyles: Record<string, string> = {
      scheduled: "bg-blue-100 hover:bg-blue-200 border-l-4 border-blue-500",
      'checked-in': "bg-green-100 hover:bg-green-200 border-l-4 border-green-500",
      completed: "bg-gray-100 hover:bg-gray-200 border-l-4 border-gray-500",
      cancelled: "bg-red-100 hover:bg-red-200 border-l-4 border-red-500",
      'no-show': "bg-yellow-100 hover:bg-yellow-200 border-l-4 border-yellow-500",
      waitlist: "bg-purple-100 hover:bg-purple-200 border-l-4 border-purple-500"
    };
    
    const typeStyles = {
      appointment: "",
      break: "bg-gray-100 hover:bg-gray-200 border-l-4 border-gray-500",
      blocked: "bg-red-100 hover:bg-red-200 border-l-4 border-red-500"
    };

    return cn(
      baseStyle,
      statusStyles[appointment.status],
      typeStyles[appointment.type],
      isActive && "ring-2 ring-primary ring-offset-2",
      "hover:scale-[1.02]"
    );
  };

  const duration = (appointment.endTime.getTime() - appointment.startTime.getTime()) / (1000 * 60);
  const showFullDetails = duration >= 30; // Only show full details for appointments 30 mins or longer

  return (
    <Tooltip>
      <TooltipTrigger>
        <div
          className={getAppointmentStyle()}
          style={{ top: `${top}px`, height: `${height}px` }}
          onClick={onClick}
        >
          <div className="flex flex-col h-full">
            {showFullDetails ? (
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className="font-medium text-sm truncate">
                      {appointment.title}
                    </span>
                    {appointment.patientName && (
                      <div className="flex items-center text-sm">
                        <User className="w-3 h-3 mr-1" />
                        <span className="truncate">{appointment.patientName}</span>
                      </div>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {appointment.status}
                  </Badge>
                </div>
                {showTherapistName && (
                  <div className="flex items-center text-xs text-gray-600 mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    <span className="truncate">{duration}min</span>
                  </div>
                )}
                {appointment.status === 'cancelled' && (
                  <div className="flex items-center text-xs text-red-600 mt-1">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    <span>Cancelled</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between h-full px-1">
                <span className="text-xs font-medium truncate">
                  {appointment.title}
                </span>
                <Badge variant="outline" className="text-xs">
                  {appointment.status}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="space-y-2">
          <p className="font-medium">{appointment.title}</p>
          <p className="text-sm">{appointment.patientName}</p>
          <p className="text-sm">
            {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
          </p>
          {appointment.notes && (
            <p className="text-sm text-gray-500">{appointment.notes}</p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}