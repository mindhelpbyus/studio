'use client';

import React, { useState } from 'react';
import { DayView } from './DayView';
import { WeekView } from './WeekView';
import { MonthView } from './MonthView';
import { CalendarView, CalendarAppointment, Therapist } from '@/lib/calendar-types';
import { AppointmentForm } from './appointment-form';
import { AppointmentDetailSidebar } from './appointment-detail-sidebar';
import { Button } from '../ui/button';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { addDays, addMonths, addWeeks, format, startOfDay, startOfMonth, startOfWeek } from 'date-fns';

interface CalendarContainerProps {
  therapists: Therapist[];
  currentTherapist?: Therapist;
  userRole: 'therapist' | 'admin';
  appointments: CalendarAppointment[];
  onAppointmentCreate: (appointment: Omit<CalendarAppointment, 'id'>) => Promise<void>;
  onAppointmentUpdate: (appointment: CalendarAppointment) => Promise<void>;
  onAppointmentDelete: (appointmentId: string) => Promise<void>;
}

const CalendarContainer: React.FC<CalendarContainerProps> = ({
  therapists,
  currentTherapist,
  userRole,
  appointments,
  onAppointmentCreate,
  onAppointmentUpdate,
  onAppointmentDelete,
}) => {
  const [view, setView] = useState<CalendarView>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<CalendarAppointment | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTherapists, setSelectedTherapists] = useState<string[]>(
    currentTherapist ? [currentTherapist.id] : []
  );

  const handleDateChange = (amount: number) => {
    switch (view) {
      case 'day':
        setCurrentDate(addDays(currentDate, amount));
        break;
      case 'week':
        setCurrentDate(addWeeks(currentDate, amount));
        break;
      case 'month':
        setCurrentDate(addMonths(currentDate, amount));
        break;
    }
  };

  const handleViewChange = (newView: CalendarView) => {
    setView(newView);
    switch (newView) {
      case 'day':
        setCurrentDate(startOfDay(currentDate));
        break;
      case 'week':
        setCurrentDate(startOfWeek(currentDate));
        break;
      case 'month':
        setCurrentDate(startOfMonth(currentDate));
        break;
    }
  };

  const filteredAppointments = appointments.filter((apt) => 
    selectedTherapists.length === 0 || selectedTherapists.includes(apt.therapistId)
  );

  const handleAppointmentClick = (appointment: CalendarAppointment) => {
    setSelectedAppointment(appointment);
  };

  const handleCloseDetailPanel = () => {
    setSelectedAppointment(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => handleDateChange(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => handleDateChange(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="text-lg font-semibold">
            {format(currentDate, 'MMMM yyyy')}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={view === 'day' ? 'default' : 'outline'}
            onClick={() => handleViewChange('day')}
          >
            Day
          </Button>
          <Button
            variant={view === 'week' ? 'default' : 'outline'}
            onClick={() => handleViewChange('week')}
          >
            Week
          </Button>
          <Button
            variant={view === 'month' ? 'default' : 'outline'}
            onClick={() => handleViewChange('month')}
          >
            Month
          </Button>
        </div>
      </div>

      <div className="flex-1 relative">
        {view === 'day' && (
          <DayView
            date={currentDate}
            appointments={filteredAppointments}
            onAppointmentClick={handleAppointmentClick}
            onSlotSelect={() => setIsFormOpen(true)}
          />
        )}
        {view === 'week' && (
          <WeekView
            startDate={currentDate}
            appointments={filteredAppointments}
            onAppointmentClick={handleAppointmentClick}
            onSlotSelect={() => setIsFormOpen(true)}
          />
        )}
        {view === 'month' && (
          <MonthView
            date={currentDate}
            appointments={filteredAppointments}
            onDateClick={(date) => {
              setCurrentDate(date);
              handleViewChange('day');
            }}
            onAppointmentClick={handleAppointmentClick}
          />
        )}
      </div>

      {selectedAppointment && (
        <AppointmentDetailSidebar
          appointment={selectedAppointment}
          onClose={handleCloseDetailPanel}
          onEdit={(apt) => {
            setSelectedAppointment(apt);
            setIsFormOpen(true);
          }}
          onDelete={onAppointmentDelete}
        />
      )}

      <AppointmentForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        mode={selectedAppointment ? 'edit' : 'create'}
        initialAppointment={selectedAppointment}
        therapists={therapists}
        services={currentTherapist?.services || []}
        onSubmit={selectedAppointment ? onAppointmentUpdate : onAppointmentCreate}
      />
    </div>
  );
};

export default CalendarContainer;