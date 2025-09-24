'use client';

import React from 'react';
import { CalendarAppointment } from '@/lib/calendar-types';

interface AppointmentDetailSidebarProps {
  appointment: CalendarAppointment | null;
  onClose: () => void;
  onEdit: (appointment: CalendarAppointment) => void;
  onDelete: (appointmentId: string) => void;
}

export const AppointmentDetailSidebar: React.FC<AppointmentDetailSidebarProps> = ({
  appointment,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!appointment) {
    return null;
  }

  return (
    <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-lg p-6 z-50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Appointment Details</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          &times;
        </button>
      </div>
      <div>
        <p>
          <strong>Patient:</strong> {appointment.patientName}
        </p>
        <p>
          <strong>Therapist:</strong> {appointment.therapistId}
        </p>
        <p>
          <strong>Time:</strong>{' '}
          {`${appointment.startTime.toLocaleTimeString()} - ${appointment.endTime.toLocaleTimeString()}`}
        </p>
        <div className="mt-6 flex space-x-4">
          <button
            onClick={() => onEdit(appointment)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(appointment.id)}
            className="bg-red-500 text-white px-4 py-2 rounded-lg"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
