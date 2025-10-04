import React from 'react';
import { MiniCalendar } from './MiniCalendar';
import { AgendaView } from './AgendaView';
import { Appointment, Therapist } from '@/types/appointment';

interface CalendarSidebarProps {
  currentDate: Date;
  appointments: Appointment[];
  therapists: Therapist[];
  onDateChange: (date: Date) => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  onAppointmentClick: (appointment: Appointment) => void;
}

export function CalendarSidebar({
  currentDate,
  appointments,
  therapists,
  onDateChange,
  onNavigate,
  onAppointmentClick
}: CalendarSidebarProps) {
  return (
    <div className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      {/* Mini Calendar */}
      <MiniCalendar
        currentDate={currentDate}
        onDateChange={onDateChange}
        onNavigate={onNavigate}
      />

      {/* Agenda View Below Calendar */}
      <AgendaView
        appointments={appointments}
        therapists={therapists}
        currentDate={currentDate}
        onAppointmentClick={onAppointmentClick}
      />
    </div>
  );
}
