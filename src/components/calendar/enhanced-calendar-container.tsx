'use client';

import React, { useState, useCallback } from 'react';
import { DayView } from './DayView';
import { WeekView } from './WeekView';
import { MonthView } from './MonthView';
import { AgendaView } from './views/agenda-view';
import { ResourceTimeline } from './views/resource-timeline';
import { CalendarView, CalendarAppointment, Therapist, Service } from '@/lib/calendar-types';
import { AppointmentForm } from '@/healthcare/appointment-management/presentation/components/calendar/appointment-form';
import { AppointmentDetailSidebar } from './appointment-detail-sidebar';
import { CalendarWithContextMenu } from './calendar-with-context-menu';
import { CalendarWithDragDrop } from './calendar-with-drag-drop';
import { ConflictDetectionService } from '@/lib/conflict-detection';
import { AdvancedConflictDetectionService } from '@/lib/advanced-conflict-detection';
import { Button } from '../ui/button';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Settings } from 'lucide-react';
import { KeyboardShortcutsDialog } from './keyboard-shortcuts-dialog';
import { defaultTheme, CalendarTheme } from '@/core/calendar/theme';
import { useKeyboardNavigation } from '@/lib/use-keyboard-navigation';
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

type CalendarViewType = 'day' | 'week' | 'month' | 'agenda' | 'timeline';

interface EnhancedCalendarContainerProps {
  therapists: Therapist[];
  services: Service[];
  currentTherapist?: Therapist;
  userRole: 'therapist' | 'admin';
  appointments: CalendarAppointment[];
  onAppointmentCreate: (appointment: Omit<CalendarAppointment, 'id'>) => Promise<void>;
  onAppointmentUpdate: (appointment: CalendarAppointment) => Promise<void>;
  onAppointmentDelete: (appointmentId: string) => Promise<void>;
  initialView?: CalendarViewType;
  initialDate?: Date;
}

export const EnhancedCalendarContainer: React.FC<EnhancedCalendarContainerProps> = ({
  therapists,
  services,
  currentTherapist,
  userRole,
  appointments,
  onAppointmentCreate,
  onAppointmentUpdate,
  onAppointmentDelete,
}) => {
  const [view, setView] = useState<CalendarView>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTherapistId, setSelectedTherapistId] = useState<string | undefined>(currentTherapist?.id);
  const [selectedAppointment, setSelectedAppointment] = useState<CalendarAppointment | null>(null);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [showSidebar, setShowSidebar] = useState(false);
  const [formInitialTime, setFormInitialTime] = useState<Date | null>(null);
  const [theme, setTheme] = useState<CalendarTheme>(defaultTheme);

  // Keyboard navigation
  const { shortcuts } = useKeyboardNavigation({
    onDateChange: setCurrentDate,
    onViewChange: setView,
    onNewAppointment: () => {
      setFormMode('create');
      setFormInitialTime(new Date());
      setShowAppointmentForm(true);
    },
    onToday: () => setCurrentDate(new Date()),
    currentDate,
    currentView: view,
  });

  // Navigation handlers
  const handlePrevious = () => {
    switch (view) {
      case 'day':
        setCurrentDate(prev => addDays(prev, -1));
        break;
      case 'week':
        setCurrentDate(prev => addWeeks(prev, -1));
        break;
      case 'month':
        setCurrentDate(prev => addMonths(prev, -1));
        break;
    }
  };

  const handleNext = () => {
    switch (view) {
      case 'day':
        setCurrentDate(prev => addDays(prev, 1));
        break;
      case 'week':
        setCurrentDate(prev => addWeeks(prev, 1));
        break;
      case 'month':
        setCurrentDate(prev => addMonths(prev, 1));
        break;
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Appointment handlers
  const handleAppointmentClick = useCallback((appointment: CalendarAppointment) => {
    setSelectedAppointment(appointment);
    setShowSidebar(true);
  }, []);

  const handleSlotSelect = useCallback((start: Date, end: Date) => {
    setFormMode('create');
    setFormInitialTime(start);
    setShowAppointmentForm(true);
  }, []);

  const handleAppointmentCreate = async (appointmentData: Omit<CalendarAppointment, 'id'>) => {
    try {
      // Check for conflicts
      const conflicts = await ConflictDetectionService.checkAppointmentConflicts(
        appointmentData as CalendarAppointment,
        appointmentData.startTime,
        undefined,
        appointments,
        currentTherapist
      );

      if (conflicts.hasConflict) {
        // Handle conflicts - you might want to show a warning or suggestion dialog
        console.warn('Appointment conflicts detected:', conflicts);
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
          <Tabs value={view} onValueChange={(v) => setView(v as CalendarViewType)}>
            <TabsList>
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="agenda">Agenda</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
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
        {view === 'agenda' ? (
          <AgendaView
            appointments={appointments}
            startDate={startOfWeek(currentDate)}
            endDate={endOfWeek(currentDate)}
            onAppointmentClick={handleAppointmentClick}
          />
        ) : view === 'timeline' ? (
          <ResourceTimeline
            date={currentDate}
            therapists={therapists}
            appointments={appointments}
            onAppointmentClick={handleAppointmentClick}
            onSlotSelect={(start, end, therapistId) => {
              setFormMode('create');
              setFormInitialTime(start);
              setSelectedTherapistId(therapistId);
              setShowAppointmentForm(true);
            }}
          />
        ) : (
          <CalendarWithDragDrop
            appointments={appointments}
            therapists={therapists}
            viewConfig={{
              userRole,
              viewType: view,
              currentDate: currentDate,
              selectedTherapistId: selectedTherapistId || '',
            }}
            filters={{
              therapistIds: currentTherapist ? [currentTherapist.id] : [],
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
            onTimeSlotClick={(time) => handleSlotSelect(time, addHours(time, 1))}
            selectedAppointmentId={selectedAppointment ? selectedAppointment.id : ''}
          />
        )}
      </div>

      {/* Appointment Form */}
      {showAppointmentForm && (
        <AppointmentForm
          isOpen={showAppointmentForm}
          mode={formMode}
          {...(selectedAppointment ? { appointment: selectedAppointment } : {})}
          initialTime={formInitialTime || new Date()}
          therapistId={currentTherapist?.id || ''}
          therapists={therapists}
          services={services}
          onSave={formMode === 'create' ? handleAppointmentCreate : handleAppointmentUpdate}
          onCancel={() => setShowAppointmentForm(false)}
          onDelete={handleAppointmentDelete}
          onConflictCheck={async (apt: CalendarAppointment) => {
            const result = await ConflictDetectionService.checkAppointmentConflicts(
              apt,
              apt.startTime,
              undefined,
              appointments,
              currentTherapist
            );
            return result.conflicts;
          }}
        />
      )}

      {/* Appointment Detail Sidebar */}
      {selectedAppointment && (
        <AppointmentDetailSidebar
          isOpen={showSidebar}
          appointment={selectedAppointment}
          onClose={() => setShowSidebar(false)}
          onAction={(action: string) => {
            setFormMode('edit');
            setShowAppointmentForm(true);
          }}
          onDelete={() => handleAppointmentDelete(selectedAppointment.id)}
        />
      )}
    </div>
  );
};