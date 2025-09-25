
'use client';

import React from 'react';
import { CalendarProvider } from '@/lib/calendar-context';
import { EnhancedCalendarContainer } from '@/components/calendar/enhanced-calendar-container';
import { LeftSidebar } from '@/components/calendar/left-sidebar'; // Import LeftSidebar
import { CalendarAppointment, AppointmentColor, Service, Therapist } from '@/lib/calendar-types'; // Import Therapist
import { toast } from '@/hooks/use-toast';
import { ConflictDetectionService } from '@/lib/conflict-detection';

const MOCK_APPOINTMENTS: CalendarAppointment[] = [
  {
    id: '1',
    therapistId: 'th1',
    clientId: 'cl1',
    serviceId: 'srv1',
    startTime: new Date(2025, 8, 24, 10, 0), // Today at 10:00 AM
    endTime: new Date(2025, 8, 24, 11, 0),   // Today at 11:00 AM
    status: 'scheduled',
    type: 'appointment',
    title: 'Therapy Session with John',
    patientName: 'John Doe',
    color: '#8B5CF6', // Vibrant color
    isDraggable: true,
    isResizable: true,
  },
  {
    id: '2',
    therapistId: 'th1',
    clientId: 'cl2',
    serviceId: 'srv2',
    startTime: new Date(2025, 8, 24, 14, 0), // Today at 2:00 PM
    endTime: new Date(2025, 8, 24, 15, 30),  // Today at 3:30 PM
    status: 'scheduled',
    type: 'appointment',
    title: 'Group Session',
    patientName: 'Group Therapy',
    color: '#10B981', // Vibrant color
    isDraggable: true,
    isResizable: true,
  },
  {
    id: '3',
    therapistId: 'th1',
    clientId: 'break',
    serviceId: 'break',
    startTime: new Date(2025, 8, 24, 12, 0), // Today at 12:00 PM
    endTime: new Date(2025, 8, 24, 13, 0),   // Today at 1:00 PM
    status: 'scheduled',
    type: 'break',
    title: 'Lunch Break',
    patientName: 'Break',
    color: '#F59E0B', // Vibrant color
    isDraggable: false,
    isResizable: false,
  }
];

const MOCK_SERVICES: Service[] = [
  { 
    id: 'srv1', 
    name: 'Individual Therapy', 
    duration: 60,
    price: 150,
    category: 'therapy',
    color: '#8B5CF6' as AppointmentColor // Vibrant color
  },
  { 
    id: 'srv2', 
    name: 'Group Therapy', 
    duration: 90,
    price: 100,
    category: 'group',
    color: '#10B981' as AppointmentColor // Vibrant color
  },
  {
    id: 'srv3',
    name: 'Couples Therapy',
    duration: 75,
    price: 180,
    category: 'therapy',
    color: '#0EA5E9' as AppointmentColor // Vibrant color
  },
];

const MOCK_THERAPISTS = [
  {
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
    services: MOCK_SERVICES,
    allowPatientBooking: true,
    color: '#8B5CF6' // Example color
  },
  {
    id: 'th2',
    name: 'Dr. Alice',
    specialty: 'Child Psychology',
    workingHours: {
      monday: { start: '10:00', end: '18:00' },
      wednesday: { start: '10:00', end: '18:00' },
      friday: { start: '10:00', end: '18:00' }
    },
    services: MOCK_SERVICES,
    allowPatientBooking: true,
    color: '#10B981' // Example color
  },
  {
    id: 'th3',
    name: 'Dr. Bob',
    specialty: 'Family Therapy',
    workingHours: {
      tuesday: { start: '08:00', end: '16:00' },
      thursday: { start: '08:00', end: '16:00' }
    },
    services: MOCK_SERVICES,
    allowPatientBooking: false,
    color: '#0EA5E9' // Example color
  }
];

const MOCK_APPOINTMENTS_WITH_MULTIPLE_THERAPISTS: CalendarAppointment[] = [
  ...MOCK_APPOINTMENTS,
  {
    id: '4',
    therapistId: 'th2',
    clientId: 'cl3',
    serviceId: 'srv1',
    startTime: new Date(2025, 8, 24, 10, 0), // Today at 10:00 AM for Dr. Alice
    endTime: new Date(2025, 8, 24, 11, 0),   // Today at 11:00 AM for Dr. Alice
    status: 'scheduled',
    type: 'appointment',
    title: 'Session with Jane',
    patientName: 'Jane Doe',
    color: '#F59E0B', // Vibrant color
    isDraggable: true,
    isResizable: true,
  },
  {
    id: '5',
    therapistId: 'th3',
    clientId: 'cl4',
    serviceId: 'srv3',
    startTime: new Date(2025, 8, 24, 9, 0), // Today at 9:00 AM for Dr. Bob
    endTime: new Date(2025, 8, 24, 10, 0),   // Today at 10:00 AM for Dr. Bob
    status: 'scheduled',
    type: 'appointment',
    title: 'Family Session',
    patientName: 'The Johnsons',
    color: '#FFE4E6', // Vibrant color
    isDraggable: true,
    isResizable: true,
  }
];

export default function Page() {
  const [currentTherapist] = React.useState<Therapist | undefined>(MOCK_THERAPISTS[0]); // Default to first therapist, explicitly cast and allow undefined
  const [appointments, setAppointments] = React.useState<CalendarAppointment[]>(MOCK_APPOINTMENTS_WITH_MULTIPLE_THERAPISTS);
  const [currentDate, setCurrentDate] = React.useState(new Date()); // Lift currentDate state
  const userRole = 'therapist'; // Set to therapist for individual view

  const handleAppointmentCreate = async (appointment: Omit<CalendarAppointment, 'id'>) => {
    try {
      // For therapist role, assume appointment is for the current therapist
      const targetTherapist = userRole === 'therapist' ? currentTherapist : MOCK_THERAPISTS.find(t => t.id === appointment.therapistId);

      if (!targetTherapist) {
        toast({
          title: "Error",
          description: "Therapist not found for conflict check.",
          variant: "destructive"
        });
        return;
      }

      const conflicts = await ConflictDetectionService.checkAppointmentConflicts(
        appointment as CalendarAppointment,
        appointment.startTime,
        undefined,
        appointments.filter(apt => apt.therapistId === targetTherapist.id),
        targetTherapist
      );

      if (conflicts.hasConflict) {
        toast({
          title: "Scheduling Conflict",
          description: conflicts.reason || "This time slot is not available.",
          variant: "destructive"
        });
        return;
      }

      const newAppointment: CalendarAppointment = {
        ...appointment,
        id: `apt-${Date.now()}`,
        therapistId: targetTherapist.id, // Ensure therapistId is set
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
      // For therapist role, assume appointment is for the current therapist
      const targetTherapist = userRole === 'therapist' ? currentTherapist : MOCK_THERAPISTS.find(t => t.id === appointment.therapistId);

      if (!targetTherapist) {
        toast({
          title: "Error",
          description: "Therapist not found for conflict check.",
          variant: "destructive"
        });
        return;
      }

      const conflicts = await ConflictDetectionService.checkAppointmentConflicts(
        appointment,
        appointment.startTime,
        undefined,
        appointments.filter(apt => apt.id !== appointment.id && apt.therapistId === targetTherapist.id),
        targetTherapist
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
    <CalendarProvider>
      <div className="flex h-[calc(100vh-4rem)] p-4"> {/* Use flex for side-by-side layout */}
        <LeftSidebar
          appointments={appointments}
          currentDate={currentDate}
          onDateSelect={setCurrentDate} // Pass setCurrentDate to LeftSidebar
        />
        <EnhancedCalendarContainer
          userRole={userRole}
          currentTherapist={currentTherapist} // Pass currentTherapist
          therapists={MOCK_THERAPISTS}
          services={MOCK_SERVICES}
          appointments={appointments}
          onAppointmentCreate={handleAppointmentCreate}
          onAppointmentUpdate={handleAppointmentUpdate}
          onAppointmentDelete={handleAppointmentDelete}
          currentDate={currentDate} // Pass currentDate to EnhancedCalendarContainer
          onDateChange={setCurrentDate} // Pass onDateChange to EnhancedCalendarContainer
        />
      </div>
    </CalendarProvider>
  );
}
