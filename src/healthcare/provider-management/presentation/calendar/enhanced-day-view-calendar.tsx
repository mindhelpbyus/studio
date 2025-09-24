'use client';

import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { CalendarAppointment, AppointmentType, AppointmentStatus, AppointmentColor } from '@/lib/calendar-types';
import { CalendarFormAppointment, TimeSlot } from '@/core/calendar/types/calendar.types';
import { Therapist, Service } from '@/core/calendar/calendar-types';
import { DragDropProvider } from '@/shared/components/calendar/drag-drop-provider';
import { DraggableAppointmentBlock } from '@/shared/components/calendar/draggable-appointment-block';
import { DropZone } from '@/shared/components/calendar/drop-zone';
import { ContextMenu, ContextMenuBuilder } from '@/shared/components/calendar/context-menu';
import { AppointmentForm } from '@/healthcare/appointment-management/presentation/components/calendar/appointment-form';
import type { AppointmentFormProps } from '@/healthcare/appointment-management/presentation/components/calendar/appointment-form.types';
import { AppointmentDetailSidebar } from '@/healthcare/appointment-management/presentation/components/calendar/appointment-detail-sidebar';
import type { AppointmentDetailSidebarProps } from '@/healthcare/appointment-management/presentation/components/calendar/appointment-detail-sidebar.types';
import { CustomDragLayer } from '@/shared/components/calendar/custom-drag-layer';
import { useContextMenu } from '@/hooks/use-context-menu';
import { ConflictDetectionService } from '@/lib/conflict-detection';
import { calculateAppointmentPosition } from '@/core/calendar/calendar-utils';
import { MOCK_APPOINTMENTS } from '@/core/calendar/mock-data';

// Convert your existing sample data to the new format
const sampleTherapists: Therapist[] = [
  {
    id: 'therapist-1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Massage & Wellness Therapy',
    avatar: 'https://picsum.photos/seed/sarah/100/100',
    workingHours: {
      monday: { start: '08:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00', title: 'Lunch Break' }] },
      tuesday: { start: '08:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00', title: 'Lunch Break' }] },
      wednesday: { start: '08:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00', title: 'Lunch Break' }] },
      thursday: { start: '08:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00', title: 'Lunch Break' }] },
      friday: { start: '08:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00', title: 'Lunch Break' }] },
    },
    services: [
      { id: 'service-1', name: 'Deep Tissue Massage', duration: 60, price: 120, category: 'Massage', color: 'blue' },
      { id: 'service-2', name: 'Swedish Massage', duration: 90, price: 150, category: 'Massage', color: 'blue' },
      { id: 'service-3', name: '50-Minute Facial', duration: 50, price: 100, category: 'Facial', color: 'pink' },
      { id: 'service-4', name: 'Gel Manicure', duration: 120, price: 80, category: 'Nails', color: 'orange' },
    ],
    allowPatientBooking: true,
  }
];

interface EnhancedDayViewCalendarProps {
  currentDate: Date;
  currentTherapistId: string;
  therapists: Therapist[];
  services: Service[];
  onCreateAppointment?: (appointment: CalendarAppointment) => Promise<void>;
  onUpdateAppointment?: (appointment: CalendarAppointment) => Promise<void>;
  onDeleteAppointment?: (appointmentId: string) => Promise<void>;
}

const sampleServices: Service[] = sampleTherapists[0]?.services ?? [];

// Convert your existing appointments to the new format
function createSampleAppointments(date: Date): CalendarAppointment[] {
  const baseDate = new Date(date);
  baseDate.setHours(0, 0, 0, 0);

  return [
    {
      id: 'apt-1',
      therapistId: 'therapist-1',
      clientId: 'client-1',
      serviceId: 'service-1',
      startTime: new Date(baseDate.getTime() + 9 * 60 * 60 * 1000), // 9:00 AM
      endTime: new Date(baseDate.getTime() + 10 * 60 * 60 * 1000), // 10:00 AM
      status: 'scheduled',
      type: 'appointment',
      title: 'DEEP TISSUE MASSAGE',
      patientName: 'Lisa Brown',
      color: 'blue',
      createdBy: 'therapist',
      isDraggable: true,
      isResizable: true,
    },
    {
      id: 'apt-2',
      therapistId: 'therapist-1',
      clientId: 'client-2',
      serviceId: 'service-2',
      startTime: new Date(baseDate.getTime() + 10 * 60 * 60 * 1000), // 10:00 AM
      endTime: new Date(baseDate.getTime() + 11.5 * 60 * 60 * 1000), // 11:30 AM
      status: 'scheduled',
      type: 'appointment',
      title: 'SWEDISH MASSAGE',
      patientName: 'Mike Davis',
      color: 'blue',
      createdBy: 'therapist',
      isDraggable: true,
      isResizable: true,
    },
    {
      id: 'break-1',
      therapistId: 'therapist-1',
      clientId: '',
      serviceId: '',
      startTime: new Date(baseDate.getTime() + 12 * 60 * 60 * 1000), // 12:00 PM
      endTime: new Date(baseDate.getTime() + 13 * 60 * 60 * 1000), // 1:00 PM
      status: 'scheduled',
      type: 'break',
      title: 'LUNCH BREAK',
      patientName: '',
      color: 'gray',
      createdBy: 'therapist',
      isDraggable: true,
      isResizable: true,
    },
    {
      id: 'apt-3',
      therapistId: 'therapist-1',
      clientId: 'client-3',
      serviceId: 'service-3',
      startTime: new Date(baseDate.getTime() + 13 * 60 * 60 * 1000), // 1:00 PM
      endTime: new Date(baseDate.getTime() + 14 * 60 * 60 * 1000), // 2:00 PM
      status: 'checked-in',
      type: 'appointment',
      title: '50-MINUTE FACIAL',
      patientName: 'Lucy Carmichael',
      color: 'pink',
      createdBy: 'patient', // This one was booked by patient
      isDraggable: true,
      isResizable: true,
    },
    {
      id: 'apt-4',
      therapistId: 'therapist-1',
      clientId: 'client-4',
      serviceId: 'service-4',
      startTime: new Date(baseDate.getTime() + 15 * 60 * 60 * 1000), // 3:00 PM
      endTime: new Date(baseDate.getTime() + 17 * 60 * 60 * 1000), // 5:00 PM
      status: 'scheduled',
      type: 'appointment',
      title: 'GEL MANICURE',
      patientName: 'Kelly Green',
      color: 'orange',
      createdBy: 'therapist',
      isDraggable: true,
      isResizable: true,
    },
  ];
}

interface EnhancedDayViewCalendarProps {
  currentDate: Date;
}

export function EnhancedDayViewCalendar({ currentDate }: EnhancedDayViewCalendarProps) {
  const [appointments, setAppointments] = useState<CalendarAppointment[]>(() => 
    createSampleAppointments(currentDate)
  );
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  // Use a single canonical form open state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formAppointment, setFormAppointment] = useState<CalendarAppointment | undefined>();
  const [formInitialTime, setFormInitialTime] = useState<Date | undefined>();
  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarAppointment, setSidebarAppointment] = useState<CalendarAppointment | undefined>();

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
    setSidebarAppointment(undefined);
  };

  const { contextMenu, openContextMenu, closeContextMenu, handleActionClick } = useContextMenu();

  const timeSlots = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  const slotHeight = 4; // 4rem per hour

  // Handle appointment updates (drag, resize, edit)
  const handleAppointmentUpdate = async (updatedAppointment: CalendarAppointment): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAppointments(prev => 
        prev.map(apt => apt.id === updatedAppointment.id ? updatedAppointment : apt)
      );
      
      return true;
    } catch (error) {
      console.error('Failed to update appointment:', error);
      return false;
    }
  };

  // Handle appointment creation
  const handleAppointmentSave = async (appointment: CalendarAppointment): Promise<void> => {
    if (formMode === 'create') {
      setAppointments(prev => [...prev, appointment]);
    } else {
      await handleAppointmentUpdate(appointment);
    }
    setIsFormOpen(false);
  };

  // Handle appointment deletion
  const handleAppointmentDelete = async (appointmentId: string): Promise<void> => {
    setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
    setIsFormOpen(false);
    setIsSidebarOpen(false);
  };

  // Conflict checking
  const handleConflictCheck = async (appointment: CalendarAppointment): Promise<CalendarAppointment[]> => {
    const therapist = sampleTherapists.find(t => t.id === appointment.therapistId);
    const conflictResult = await ConflictDetectionService.checkAppointmentConflicts(
      appointment,
      appointment.startTime,
      undefined,
      appointments,
      therapist
    );
    return conflictResult.conflicts;
  };

  // Context menu handlers
  const handleAppointmentEdit = (appointment: CalendarAppointment) => {
    setFormMode('edit');
    setFormAppointment(appointment);
    setIsFormOpen(true);
  };

  const handleAppointmentCopy = (appointment: CalendarAppointment) => {
    const newAppointment = {
      ...appointment,
      id: `apt-${Date.now()}`,
      startTime: new Date(appointment.startTime.getTime() + 60 * 60 * 1000), // 1 hour later
      endTime: new Date(appointment.endTime.getTime() + 60 * 60 * 1000),
    };
    setAppointments(prev => [...prev, newAppointment]);
  };

  const handleTimeSlotClick = (time: Date) => {
    setFormMode('create');
    setFormInitialTime(time);
    setFormAppointment(undefined);
    setIsFormOpen(true);
  };

  const handleAppointmentClick = (appointment: CalendarAppointment) => {
    setSelectedAppointmentId(appointment.id);
    setSidebarAppointment(appointment);
    setIsSidebarOpen(true);
  };

  const handleAppointmentContextMenu = (event: React.MouseEvent, appointment: CalendarAppointment) => {
    const actions = ContextMenuBuilder.getAppointmentActions(
      appointment,
      handleAppointmentEdit,
      (apt) => handleAppointmentDelete(apt.id),
      (time) => handleTimeSlotClick(time),
      handleAppointmentCopy,
      (apt) => console.log('Move appointment:', apt)
    );
    openContextMenu(event, appointment as CalendarAppointment, actions);
  };

  const handleTimeSlotContextMenu = (event: React.MouseEvent, time: Date) => {
    const timeSlot = {
      time,
      therapistId: 'therapist-1',
      isAvailable: true,
    };
    
    const actions = ContextMenuBuilder.getTimeSlotActions(
      timeSlot,
      handleTimeSlotClick,
      (time) => console.log('Add break at:', time),
      (time) => console.log('Block time at:', time)
    );
    openContextMenu(event, timeSlot, actions);
  };

  return (
  <DragDropProvider
      onAppointmentDrop={(appointment, newTime) => {
        const updatedAppointment: CalendarAppointment = { ...appointment, startTime: newTime };
        return handleAppointmentUpdate(updatedAppointment);
      }}
      onAppointmentResize={(appointment, newDuration) => {
        const updatedAppointment: CalendarAppointment = { 
          ...appointment, 
          endTime: new Date(appointment.startTime.getTime() + newDuration)
        };
        return handleAppointmentUpdate(updatedAppointment);
      }}
      onConflictCheck={(appointment, newTime) => {
        const updatedAppointment: CalendarAppointment = newTime ? { ...appointment, startTime: newTime } : appointment;
        return handleConflictCheck(updatedAppointment);
      }}
    >
      <div className="h-full overflow-auto">
        <div className="grid grid-cols-[80px_1fr] min-h-full bg-background">
          {/* Time column */}
          <div className="border-r bg-muted/30">
            <div className="h-16 border-b bg-card sticky top-0 z-20"></div>
            <div className="text-xs text-muted-foreground">
              {timeSlots.map((time, index) => (
                <div
                  key={index}
                  style={{ height: `${slotHeight}rem` }}
                  className="flex items-start justify-end pr-3 pt-1 border-b border-muted/50"
                >
                  <span className="font-medium">
                    {parseInt(time) === 0 ? '12:00 AM' :
                      parseInt(time) < 12 ? `${parseInt(time)}:00 AM` :
                        parseInt(time) === 12 ? '12:00 PM' :
                          `${parseInt(time) - 12}:00 PM`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Day column with drag & drop */}
          <div className="relative">
            <div className="h-16 border-b bg-card sticky top-0 z-10 shadow-sm">
              <div className="flex items-center justify-center h-full">
                <h2 className="font-semibold text-lg">
                  {format(currentDate, 'EEEE, MMMM d, yyyy')}
                </h2>
              </div>
            </div>

            {/* Time grid background with drop zones */}
            <div className="relative">
              {timeSlots.map((time, index) => {
                const slotTime = new Date(currentDate);
                slotTime.setHours(parseInt(time), 0, 0, 0);
                
                const isAvailable = ConflictDetectionService.isTimeSlotAvailable(
                  slotTime,
                  60, // 1 hour default
                  'therapist-1',
                  appointments,
                  sampleTherapists[0]
                );

                return (
            <DropZone
                    key={index}
                    timeSlot={{
                      time: slotTime,
                      therapistId: 'therapist-1',
                      isAvailable,
                    }}
                    height={slotHeight * 16} // Convert rem to px (4rem * 16px)
                    top={index * slotHeight * 16}
                    onDrop={handleAppointmentUpdate}
                    onConflictCheck={handleConflictCheck}
                    className="border-b border-muted/50 hover:bg-muted/20 transition-colors"
                  >
                    <div
                      className="h-full w-full cursor-pointer"
                      onClick={() => handleTimeSlotClick(slotTime)}
                      onContextMenu={(e) => handleTimeSlotContextMenu(e, slotTime)}
                    >
                      <div className="absolute top-0 left-0 w-4 h-px bg-muted-foreground/20"></div>
                    </div>
                  </DropZone>
                );
              })}

              {/* Draggable Appointments */}
              {appointments.map((appointment) => {
                const { top, height } = calculateAppointmentPosition(appointment);
                
                return (
                  <DraggableAppointmentBlock
                    key={appointment.id}
                    appointment={appointment}
                    height={height}
                    top={top}
                    onClick={() => handleAppointmentClick(appointment)}
                    onContextMenu={(e) => handleAppointmentContextMenu(e, appointment)}
                    isActive={selectedAppointmentId === appointment.id}
                    canDrag={appointment.isDraggable !== false}
                    canResize={appointment.isResizable !== false}
                    onResize={(newDuration) => {
                      const updatedAppointment = {
                        ...appointment,
                        endTime: new Date(appointment.startTime.getTime() + newDuration * 60 * 1000),
                      };
                      handleAppointmentUpdate(updatedAppointment);
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Context Menu */}
        <ContextMenu
          isOpen={contextMenu.isOpen}
          position={contextMenu.position}
          target={contextMenu.target}
          actions={contextMenu.actions}
          onClose={closeContextMenu}
          onActionClick={handleActionClick}
        />

        {/* Appointment Form */}
        <AppointmentForm
          key={formAppointment?.id || 'new'}
          isOpen={isFormOpen}
          mode={formMode}
          appointment={formAppointment || null}
          initialTime={formInitialTime || null}
          therapistId="therapist-1"
          therapists={sampleTherapists}
          services={sampleServices}
          onSave={handleAppointmentSave}
          onCancel={() => setIsFormOpen(false)}
          onDelete={handleAppointmentDelete}
          onConflictCheck={handleConflictCheck}
        />

        {/* Appointment Detail Sidebar */}
        {sidebarAppointment && (
          <AppointmentDetailSidebar
            isOpen={isSidebarOpen}
            appointment={sidebarAppointment}
            onClose={handleSidebarClose}
            onAction={(action, id) => {
              // handle common actions from sidebar
              if (action === 'edit' && id) {
                const apt = appointments.find(a => a.id === id);
                if (apt) {
                  setFormMode('edit');
                  setFormAppointment(apt);
                  setIsFormOpen(true);
                }
              }
              if (action === 'delete' && id) {
                handleAppointmentDelete(id);
              }
              if (action === 'check-in' && id) {
                const apt = appointments.find(a => a.id === id);
                if (apt) handleAppointmentUpdate({ ...apt, status: 'checked-in' } as CalendarAppointment);
              }
            }}
            onDelete={async (id?: string) => {
              if (id) await handleAppointmentDelete(id);
            }}
          />
        )}

        {/* Custom Drag Layer */}
        <CustomDragLayer />
      </div>
    </DragDropProvider>
  );
}