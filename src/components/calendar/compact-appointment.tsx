'use client';

import { format } from 'date-fns';
import React from 'react';
import { getAppointmentColor } from '@/lib/calendar-utils';
import { CalendarAppointment } from '@/lib/enhanced-appointments';
import { cn } from '@/lib/utils';

interface CompactAppointmentProps {
  appointment: CalendarAppointment;
  onClick: (e: React.MouseEvent) => void;
}

export const CompactAppointment: React.FC<CompactAppointmentProps> = ({
  appointment,
  onClick,
}) => {
  const colorScheme = getAppointmentColor(appointment);
  const startTime = format(appointment.startTime, 'h:mm a');
  
  return (
    <div
      className={cn(
        'text-xs p-1 rounded cursor-pointer transition-all duration-200',
        'hover:shadow-sm hover:scale-105',
        colorScheme.bg,
        colorScheme.text,
        colorScheme.border,
        colorScheme.shadow,
        appointment.createdBy === 'patient' && 'ring-1 ring-green-300'
      )}
      onClick={onClick}
      title={`${appointment.title} - ${appointment.clientName} (${startTime})`}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium truncate flex-1">
          {appointment.title}
        </span>
        {appointment.createdBy === 'patient' && (
          <span className="ml-1 bg-green-100 text-green-800 text-xs px-1 rounded-full">
            P
          </span>
        )}
      </div>
      
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs opacity-75 truncate">
          {appointment.clientName}
        </span>
        <span className="text-xs opacity-75 ml-1">
          {startTime}
        </span>
      </div>
    </div>
  );
};