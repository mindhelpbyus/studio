
'use client';

import * as React from 'react';
import { format, addDays } from 'date-fns';
import { EnhancedCalendarContainer } from '@/components/calendar/enhanced-calendar-container';
import { CalendarAppointment, AppointmentColor, Service } from '@/lib/calendar-types';
import { ConflictDetectionService } from '@/lib/conflict-detection';
import { AdvancedConflictDetectionService } from '@/lib/advanced-conflict-detection';
import { toast } from '@/hooks/use-toast';

const MOCK_APPOINTMENTS: CalendarAppointment[] = [
  {
    id: '1',
    therapistId: 'th1',
    clientId: 'cl1',
    serviceId: 'srv1',
    startTime: new Date(2025, 8, 23, 10, 0), // 10:00 AM
    endTime: new Date(2025, 8, 23, 11, 0),   // 11:00 AM
    status: 'scheduled',
    type: 'appointment',
    title: 'Therapy Session with John',
    patientName: 'John Doe',
    color: 'blue',
    isDraggable: true,
    isResizable: true,
  },
  // Add more mock appointments as needed
];

const MOCK_THERAPIST = {
  id: 'th1',
  name: 'Dr. Smith',
  specialty: 'Psychotherapy',
  workingHours: {
    monday: { 
      start: '09:00', 
      end: '17:00',
      breaks: [{ start: '12:00', end: '13:00', title: 'Lunch Break' }]
    },
    tuesday: { 
      start: '09:00', 
      end: '17:00',
      breaks: [{ start: '12:00', end: '13:00', title: 'Lunch Break' }]
    },
    wednesday: { 
      start: '09:00', 
      end: '17:00',
      breaks: [{ start: '12:00', end: '13:00', title: 'Lunch Break' }]
    },
    thursday: { 
      start: '09:00', 
      end: '17:00',
      breaks: [{ start: '12:00', end: '13:00', title: 'Lunch Break' }]
    },
    friday: { 
      start: '09:00', 
      end: '17:00',
      breaks: [{ start: '12:00', end: '13:00', title: 'Lunch Break' }]
    }
  },
  services: [
    { 
      id: 'srv1', 
      name: 'Individual Therapy', 
      duration: 60,
      price: 150,
      category: 'therapy',
      color: 'blue' as AppointmentColor
    },
    { 
      id: 'srv2', 
      name: 'Group Therapy', 
      duration: 90,
      price: 100,
      category: 'group',
      color: 'green' as AppointmentColor
    },
  ],
  allowPatientBooking: true
};

const MOCK_SERVICES: Service[] = [
  { 
    id: 'srv1', 
    name: 'Individual Therapy', 
    duration: 60,
    price: 150,
    category: 'therapy',
    color: 'blue' as AppointmentColor
  },
  { 
    id: 'srv2', 
    name: 'Group Therapy', 
    duration: 90,
    price: 100,
    category: 'group',
    color: 'green' as AppointmentColor
  },
  {
    id: 'srv3',
    name: 'Couples Therapy',
    duration: 75,
    price: 180,
    category: 'therapy',
    color: 'purple' as AppointmentColor
  },
];

export default function CalendarPage() {
  const [currentTherapist] = React.useState(MOCK_THERAPIST);
  const [appointments, setAppointments] = React.useState<CalendarAppointment[]>(MOCK_APPOINTMENTS);

  const handleAppointmentCreate = async (appointment: Omit<CalendarAppointment, 'id'>) => {
    try {
      // Check for conflicts
      const conflicts = await ConflictDetectionService.checkAppointmentConflicts(
        appointment as CalendarAppointment,
        appointment.startTime,
        undefined,
        appointments,
        currentTherapist
      );

      if (conflicts.hasConflict) {
        toast({
          title: "Scheduling Conflict",
          description: conflicts.reason || "This time slot is not available.",
          variant: "destructive"
        });
        return;
      }

      // Create new appointment
      const newAppointment: CalendarAppointment = {
        ...appointment,
        id: `apt-${Date.now()}`, // In production, use proper ID generation
      };

      setAppointments(prev => [...prev, newAppointment]);
      toast({
        title: "Success",
        description: "Appointment created successfully",
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: "Error",
        description: "Failed to create appointment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAppointmentUpdate = async (appointment: CalendarAppointment) => {
    try {
      // Check for conflicts excluding the current appointment
      const conflicts = await ConflictDetectionService.checkAppointmentConflicts(
        appointment,
        appointment.startTime,
        undefined,
        appointments.filter(apt => apt.id !== appointment.id),
        currentTherapist
      );

      if (conflicts.hasConflict) {
        toast({
          title: "Scheduling Conflict",
          description: conflicts.reason || "This time slot is not available.",
          variant: "destructive"
        });
        return;
      }

      setAppointments(prev =>
        prev.map(apt => apt.id === appointment.id ? appointment : apt)
      );
      toast({
        title: "Success",
        description: "Appointment updated successfully",
      });
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast({
        title: "Error",
        description: "Failed to update appointment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAppointmentDelete = async (appointmentId: string) => {
    try {
      setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
      toast({
        title: "Success",
        description: "Appointment deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast({
        title: "Error",
        description: "Failed to delete appointment. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <EnhancedCalendarContainer
        therapists={[currentTherapist]}
        services={MOCK_SERVICES}
        currentTherapist={currentTherapist}
        userRole="therapist"
        appointments={appointments}
        onAppointmentCreate={handleAppointmentCreate}
        onAppointmentUpdate={handleAppointmentUpdate}
        onAppointmentDelete={handleAppointmentDelete}
      />
    </div>
  );
}
