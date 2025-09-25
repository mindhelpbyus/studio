'use client';

import {
  addDays,
  addMonths,
  addWeeks,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  endOfWeek,
  addHours
} from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Settings } from 'lucide-react';
import React, { useState, useCallback } from 'react';
import { defaultTheme, CalendarTheme } from '@/core/calendar/theme';
import { AppointmentForm, ExtendedAppointmentFormProps } from '@/healthcare/appointment-management/presentation/components/calendar/appointment-form';
import { AdvancedConflictDetectionService } from '@/lib/advanced-conflict-detection';
import { CalendarView, CalendarAppointment, Therapist, Service } from '@/lib/calendar-types';
import { ConflictDetectionService } from '@/lib/conflict-detection';
import { useKeyboardNavigation } from '@/lib/use-keyboard-navigation';
import { Button } from '../ui/button';
import { AppointmentDetailSidebar } from './appointment-detail-sidebar';
import { DayView } from './DayView';
import { WeekView } from './WeekView';
import { MonthView } from './MonthView';
import { AgendaView } from './views/agenda-view';
import { ResourceTimeline } from './views/resource-timeline';
import { CalendarWithContextMenu } from './calendar-with-context-menu';
import { CalendarWithDragDrop } from './calendar-with-drag-drop';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { KeyboardShortcutsDialog } from './keyboard-shortcuts-dialog';

type CalendarViewType = 'day' | 'week' | 'month'; // Removed 'agenda' and 'timeline'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Checkbox } from '../ui/checkbox';
import { Users, ChevronDown } from 'lucide-react';

interface EnhancedCalendarContainerProps {
  therapists: Therapist[];
  services: Service[];
  currentTherapist: Therapist | undefined; // Reintroduced, explicitly allow undefined
  userRole: 'therapist' | 'admin';
  appointments: CalendarAppointment[];
  onAppointmentCreate: (appointment: Omit<CalendarAppointment, 'id'>) => Promise<void>;
  onAppointmentUpdate: (appointment: CalendarAppointment) => Promise<void>;
  onAppointmentDelete: (appointmentId: string) => Promise<void>;
  initialView?: CalendarViewType;
  initialDate?: Date;
  currentDate: Date; // Add currentDate prop
  onDateChange: (date: Date) => void; // Add onDateChange prop
}

export const EnhancedCalendarContainer: React.FC<EnhancedCalendarContainerProps> = ({
  therapists,
  services,
  currentTherapist, // Reintroduced
  userRole,
  appointments,
  onAppointmentCreate,
  onAppointmentUpdate,
  onAppointmentDelete,
  currentDate, // Destructure currentDate
  onDateChange, // Destructure onDateChange
}) => {
  // No-op change to force TypeScript re-evaluation
  const [view, setView] = useState<CalendarView>('week');
  // Remove internal currentDate state, use prop instead
  const [selectedTherapistIds, setSelectedTherapistIds] = useState<string[]>(
    userRole === 'therapist' && currentTherapist?.id ? [currentTherapist.id] : []
  );
  const [selectedAppointment, setSelectedAppointment] = useState<CalendarAppointment | null>(null);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [showSidebar, setShowSidebar] = useState(false);
  const [formInitialTime, setFormInitialTime] = useState<Date | null>(null);
  const [theme, setTheme] = useState<CalendarTheme>(defaultTheme);

  // Initialize therapist selection for admin users if none are selected
  React.useEffect(() => {
    if (userRole === 'admin' && therapists.length > 0 && selectedTherapistIds.length === 0) {
      setSelectedTherapistIds(therapists.map(t => t.id));
    }
  }, [therapists, userRole, selectedTherapistIds.length]);

  // Keyboard navigation
  const { shortcuts } = useKeyboardNavigation({
    onDateChange: onDateChange, // Use prop for date change
    onViewChange: setView,
    onNewAppointment: () => {
      setFormMode('create');
      setFormInitialTime(new Date());
      setShowAppointmentForm(true);
    },
    onToday: () => onDateChange(new Date()), // Use prop for today
    currentDate,
    currentView: view,
  });

  // Navigation handlers
  const handlePrevious = () => {
    switch (view) {
      case 'day':
        onDateChange(addDays(currentDate, -1));
        break;
      case 'week':
        onDateChange(addWeeks(currentDate, -1));
        break;
      case 'month':
        onDateChange(addMonths(currentDate, -1));
        break;
    }
  };

  const handleNext = () => {
    switch (view) {
      case 'day':
        onDateChange(addDays(currentDate, 1));
        break;
      case 'week':
        onDateChange(addWeeks(currentDate, 1));
        break;
      case 'month':
        onDateChange(addMonths(currentDate, 1));
        break;
    }
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  // Appointment handlers
  const handleAppointmentClick = useCallback((appointment: CalendarAppointment) => {
    setSelectedAppointment(appointment);
    setShowSidebar(true);
  }, []);

  const handleEditAppointment = useCallback((appointment: CalendarAppointment) => {
    setSelectedAppointment(appointment);
    setFormMode('edit');
    setShowAppointmentForm(true);
    setShowSidebar(false); // Close sidebar when opening form
  }, []);

  const handleSlotSelect = useCallback((start: Date, end: Date) => {
    setFormMode('create');
    setFormInitialTime(start);
    setShowAppointmentForm(true);
  }, []);

  const handleAppointmentCreate = async (appointmentData: Omit<CalendarAppointment, 'id'>) => {
    try {
      const targetTherapist = therapists.find(t => t.id === appointmentData.therapistId);

      if (!targetTherapist) {
        console.error('Therapist not found for conflict check during creation.');
        // Potentially show a toast or error message to the user
        return;
      }

      const conflicts = await ConflictDetectionService.checkAppointmentConflicts(
        appointmentData as CalendarAppointment,
        appointmentData.startTime,
        undefined,
        appointments.filter(apt => apt.therapistId === targetTherapist.id),
        targetTherapist
      );

      if (conflicts.hasConflict) {
        console.warn('Appointment conflicts detected:', conflicts);
        // Handle conflicts - you might want to show a warning or suggestion dialog
        return;
      }

      await onAppointmentCreate(appointmentData);
      setShowAppointmentForm(false);
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  const handleAppointmentUpdate = async (appointment: CalendarAppointment) => {
    try {
      const targetTherapist = therapists.find(t => t.id === appointment.therapistId);

      if (!targetTherapist) {
        console.error('Therapist not found for conflict check during update.');
        // Potentially show a toast or error message to the user
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
        console.warn('Appointment conflicts detected:', conflicts);
        // Handle conflicts - you might want to show a warning or suggestion dialog
        return;
      }

      await onAppointmentUpdate(appointment);
      setShowAppointmentForm(false);
      setShowSidebar(false);
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const handleAppointmentDelete = async (appointmentId: string) => {
    try {
      await onAppointmentDelete(appointmentId);
      setShowAppointmentForm(false);
      setShowSidebar(false);
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Calendar Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={handlePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleToday}>
            Today
          </Button>
          <h2 className="text-xl font-semibold">
            {format(currentDate, view === 'month' ? 'MMMM yyyy' : 'MMMM d, yyyy')}
          </h2>
        </div>

        <div className="flex items-center space-x-4">
          {/* Therapist Filter (Admin only) */}
          {userRole === 'admin' && (
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-muted-foreground" />

              {/* Therapist Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="min-w-48">
                    <Users className="h-4 w-4 mr-2" />
                    {selectedTherapistIds.length === 0
                      ? "No Doctors Selected"
                      : selectedTherapistIds.length === therapists.length
                      ? "All Doctors Selected"
                      : `${selectedTherapistIds.length} Doctor${selectedTherapistIds.length !== 1 ? 's' : ''} Selected`
                    }
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto">
                  <DropdownMenuLabel>Select Doctors</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {/* Quick Actions */}
                  <div className="flex gap-2 p-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setSelectedTherapistIds(therapists.map(t => t.id))}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setSelectedTherapistIds([])}
                    >
                      Select None
                    </Button>
                  </div>

                  <DropdownMenuSeparator />

                  {/* Doctor List */}
                  {therapists.map(therapist => (
                    <DropdownMenuItem
                      key={therapist.id}
                      className="flex items-center gap-3 p-3 cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        const checked = !selectedTherapistIds.includes(therapist.id);
                        setSelectedTherapistIds(prev =>
                          checked
                            ? [...prev, therapist.id]
                            : prev.filter(id => id !== therapist.id)
                        );
                      }}
                    >
                      <Checkbox
                        id={`dropdown-${therapist.id}`}
                        checked={selectedTherapistIds.includes(therapist.id)}
                        onCheckedChange={(checked) => {
                          setSelectedTherapistIds(prev =>
                            checked as boolean
                              ? [...prev, therapist.id]
                              : prev.filter(id => id !== therapist.id)
                          );
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: therapist.color || '#ccc' }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{therapist.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{therapist.specialty}</div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Selection Summary */}
              {selectedTherapistIds.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  {selectedTherapistIds.length} of {therapists.length} doctors
                </div>
              )}
            </div>
          )}

          <Tabs value={view} onValueChange={(v) => setView(v as CalendarViewType)}>
            <TabsList>
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center space-x-2">
            <Button onClick={() => {
              setFormMode('create');
              setFormInitialTime(new Date());
              setShowAppointmentForm(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              New Appointment
            </Button>
            <KeyboardShortcutsDialog shortcuts={shortcuts} />
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="relative flex-1 overflow-auto">
        <CalendarWithDragDrop
          appointments={appointments.filter(apt => selectedTherapistIds.includes(apt.therapistId))}
          therapists={therapists.filter(t => selectedTherapistIds.includes(t.id))}
          viewConfig={{
            userRole,
            viewType: view,
            currentDate: currentDate,
          }}
          filters={{
            therapistIds: selectedTherapistIds,
            serviceTypes: [],
            appointmentStatuses: ['scheduled', 'checked-in'],
            dateRange: {
              start: startOfWeek(currentDate),
              end: endOfWeek(currentDate)
            }
          }}
          onAppointmentUpdate={async (appointment) => {
            await handleAppointmentUpdate(appointment);
            return true;
          }}
          onAppointmentClick={handleAppointmentClick}
          onTimeSlotClick={(time, therapistId) => {
            setFormMode('create');
            setFormInitialTime(time);
            setShowAppointmentForm(true);
            setSelectedAppointment(null); // Clear selected appointment for new form
          }}
          selectedAppointmentId={selectedAppointment ? selectedAppointment.id : ''}
        />
      </div>

      {/* Appointment Form */}
      {showAppointmentForm && (
        <AppointmentForm
          isOpen={showAppointmentForm}
          mode={formMode}
          {...(selectedAppointment ? { appointment: selectedAppointment } : {})}
          initialTime={formInitialTime || new Date()}
          // If only one therapist is selected, pre-fill the therapistId for new appointments
          therapistId={selectedAppointment?.therapistId || (userRole === 'therapist' && currentTherapist?.id ? currentTherapist.id : (selectedTherapistIds.length === 1 ? selectedTherapistIds[0] : '')) || ''}
          therapists={therapists}
          services={services}
          onSave={formMode === 'create' ? handleAppointmentCreate : handleAppointmentUpdate}
          onCancel={() => setShowAppointmentForm(false)}
          onDelete={handleAppointmentDelete}
          onConflictCheck={async (apt: CalendarAppointment) => {
            const targetTherapist = userRole === 'therapist' && currentTherapist ? currentTherapist : therapists.find(t => t.id === apt.therapistId);
            if (!targetTherapist) {
              console.error('Therapist not found for conflict check in form.');
              return [];
            }
            const result = await ConflictDetectionService.checkAppointmentConflicts(
              apt,
              apt.startTime,
              undefined,
              appointments.filter(existingApt => existingApt.id !== apt.id && existingApt.therapistId === targetTherapist.id),
              targetTherapist
            );
            return result.conflicts;
          }}
        />
      )}

      {/* Appointment Detail Sidebar */}
      {selectedAppointment && (
        <AppointmentDetailSidebar
          appointment={selectedAppointment}
          onClose={() => setShowSidebar(false)}
          onEdit={handleEditAppointment}
          onDelete={() => handleAppointmentDelete(selectedAppointment.id)}
        />
      )}
    </div>
  );
};
