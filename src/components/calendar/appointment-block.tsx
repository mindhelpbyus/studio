'use client';

import React from 'react';
import { CalendarAppointment } from '@/lib/calendar-types';
import { calculateAppointmentPosition, formatAppointmentTime } from '@/lib/calendar-utils';
import { AppointmentService } from '@/lib/enhanced-appointments';
import { cn } from '@/lib/utils';
import { appointmentColors, activeAppointmentColors, breakAppointmentStyles, STATUS_MODIFIERS, TYPOGRAPHY } from '@/lib/calendar-styles';

interface AppointmentBlockProps {
  appointment: CalendarAppointment;
  onClick: () => void;
  isActive?: boolean;
  isWeekView?: boolean;
}

export function AppointmentBlock({
  appointment,
  onClick,
  isActive = false,
  isWeekView = false
}: AppointmentBlockProps) {
  const { top, height } = calculateAppointmentPosition(appointment);
  const colorSet = isActive ? activeAppointmentColors : appointmentColors;
  const colors = colorSet[appointment.color];
  
  // Check if appointment is currently happening
  const isCurrent = AppointmentService.isCurrentAppointment(appointment);
  const urgencyLevel = AppointmentService.getUrgencyLevel(appointment);
  
  // Get status modifier classes
  const statusModifier = STATUS_MODIFIERS[appointment.status] || '';
  
  // Determine if this is a break/blocked time
  const isBreak = appointment.type === 'break' || appointment.type === 'blocked';
  
  // Calculate responsive sizing for week view
  const padding = isWeekView ? 'p-1' : 'p-3';
  const titleSize = isWeekView ? 'text-xs' : 'text-sm';
  const nameSize = isWeekView ? 'text-xs' : 'text-base';
  const timeSize = isWeekView ? 'text-xs' : 'text-sm';

  return (
    <div
      className="absolute left-1 right-1 cursor-pointer calendar-appointment group"
      style={{
        top: `${top}rem`,
        height: `${height}rem`
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`${appointment.title} ${appointment.clientName ? `with ${appointment.clientName}` : ''} at ${formatAppointmentTime(appointment)}`}
    >
      <div
        className={cn(
          // Base styles
          `${padding} rounded-lg ${colors.border} h-full overflow-hidden shadow-sm hover:shadow-md transition-all duration-200`,
          
          // Background and text colors
          colors.bg,
          colors.text,
          
          // Break styling
          isBreak && breakAppointmentStyles.opacity,
          isBreak && 'border-dashed',
          
          // Active/current appointment styling
          isActive && 'ring-2 ring-offset-1',
          isCurrent && 'ring-2 ring-primary ring-offset-1',
          
          // Status modifiers
          statusModifier,
          
          // Urgency indicators
          urgencyLevel === 'high' && 'ring-1 ring-orange-300',
          urgencyLevel === 'overdue' && 'ring-1 ring-red-300',
          
          // Hover effects
          'hover:scale-[1.02] hover:z-10'
        )}
      >
        <div className="flex flex-col h-full justify-between">
          <div className="min-h-0">
            {/* Appointment Title */}
            <p className={cn(TYPOGRAPHY.appointmentTitle, titleSize, 'mb-1')}>
              {appointment.title}
            </p>
            
            {/* Client Name */}
            {appointment.clientName && (
              <p className={cn(TYPOGRAPHY.clientName, nameSize, 'mb-1')}>
                {appointment.clientName}
              </p>
            )}
            
            {/* Status indicator for non-scheduled appointments */}
            {appointment.status !== 'scheduled' && (
              <div className="flex items-center mb-1">
                <span className={cn(
                  'inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium',
                  appointment.status === 'checked-in' && 'bg-green-100 text-green-800',
                  appointment.status === 'completed' && 'bg-blue-100 text-blue-800',
                  appointment.status === 'cancelled' && 'bg-red-100 text-red-800',
                  appointment.status === 'no-show' && 'bg-orange-100 text-orange-800'
                )}>
                  {AppointmentService.getStatusDisplayText(appointment.status)}
                </span>
              </div>
            )}
          </div>
          
          {/* Time Range */}
          <p className={cn(TYPOGRAPHY.timeRange, timeSize, 'mt-auto')}>
            {formatAppointmentTime(appointment)}
          </p>
        </div>
        
        {/* Current time indicator */}
        {isCurrent && (
          <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l-lg" />
        )}
        
        {/* Break pattern overlay */}
        {isBreak && (
          <div className="absolute inset-0 opacity-20 pointer-events-none"
               style={{
                 backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, currentColor 4px, currentColor 8px)'
               }} />
        )}
      </div>
    </div>
  );
}