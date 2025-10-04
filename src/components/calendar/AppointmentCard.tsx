import React from 'react';
import { Appointment, Therapist } from '../types/appointment';
import { Clock, User, AlertCircle } from 'lucide-react';
import { useDrag } from 'react-dnd';

interface AppointmentCardProps {
  appointment: Appointment;
  therapist?: Therapist;
  onClick: () => void;
  showTherapistName?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export function AppointmentCard({ 
  appointment, 
  therapist, 
  onClick, 
  showTherapistName = false,
  style = {},
  className = ''
}: AppointmentCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'appointment',
    item: { appointment },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getDuration = () => {
    const start = new Date(appointment.startTime);
    const end = new Date(appointment.endTime);
    const minutes = (end.getTime() - start.getTime()) / (1000 * 60);
    
    if (minutes < 60) {
      return `${minutes}m`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h${remainingMinutes > 0 ? ` ${remainingMinutes}m` : ''}`;
    }
  };

  const getStatusColor = () => {
    if (appointment.type === 'break') return 'bg-gray-200 border-gray-400 text-gray-800';
    if (appointment.status === 'pending') return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    if (appointment.type === 'tentative') return 'bg-blue-50 border-blue-300 text-blue-900';
    return 'bg-white border-gray-200 text-gray-900';
  };

  const isBreakOrTentative = appointment.type === 'break' || appointment.type === 'tentative';

  const getAccentColor = () => {
    if (appointment.type === 'break') return '#6b7280';
    return appointment.color || therapist?.color || '#3b82f6';
  };

  return (
    <div
      ref={drag}
      onClick={onClick}
      style={{
        ...style,
        borderLeftColor: getAccentColor(),
        opacity: isDragging ? 0.5 : 1,
      }}
      className={`
        ${getStatusColor()}
        border border-l-4 rounded-md p-2 cursor-pointer transition-all duration-200
        hover:shadow-md hover:border-gray-300 active:scale-95
        ${isBreakOrTentative ? 'relative' : ''}
        ${className}
      `}
    >
      {/* Cross-bar overlay for breaks and tentative appointments */}
      {isBreakOrTentative && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div 
            className={`w-full h-px transform ${
              appointment.type === 'break' ? 'bg-gray-600' : 'bg-blue-600'
            }`}
          />
        </div>
      )}
      
      <div className="space-y-1 relative z-10">
        {/* Title */}
        <div className="font-medium text-sm leading-tight flex items-center gap-1">
          {appointment.type === 'break' && (
            <span className="text-xs bg-gray-600 text-white px-1 rounded">BREAK</span>
          )}
          {appointment.type === 'tentative' && (
            <span className="text-xs bg-blue-600 text-white px-1 rounded">TENTATIVE</span>
          )}
          <span className={isBreakOrTentative ? 'line-through opacity-75' : ''}>
            {appointment.title}
          </span>
        </div>

        {/* Time and Duration */}
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Clock className="h-3 w-3" />
          <span>
            {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
          </span>
          <span className="text-gray-400">({getDuration()})</span>
        </div>

        {/* Therapist Name (if shown) */}
        {showTherapistName && therapist && (
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <User className="h-3 w-3" />
            <span>{therapist.name}</span>
          </div>
        )}

        {/* Client Name (for non-break appointments) */}
        {appointment.type !== 'break' && appointment.clientName && (
          <div className="text-xs text-gray-600">
            {appointment.clientName}
          </div>
        )}

        {/* Status Indicators */}
        <div className="flex items-center gap-2">
          {appointment.status === 'pending' && (
            <div className="flex items-center gap-1 text-xs text-yellow-600">
              <AlertCircle className="h-3 w-3" />
              <span>Pending</span>
            </div>
          )}
          
          {appointment.type === 'tentative' && (
            <div className="text-xs text-blue-600 font-medium">
              Tentative
            </div>
          )}

          {appointment.createdBy === 'patient' && (
            <div className="text-xs bg-green-100 text-green-700 px-1 rounded">
              Self-booked
            </div>
          )}
        </div>
      </div>
    </div>
  );
}