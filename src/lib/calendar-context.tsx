'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Appointment as CalendarAppointment, Therapist, UserRole, CalendarView } from '@/types/appointment';

interface CalendarContextType {
  view: CalendarView;
  currentDate: Date;
  selectedDate: Date;
  selectedAppointment: CalendarAppointment | null;
  isFormOpen: boolean;
  userRole: UserRole;
  currentTherapist: Therapist | null;
  therapists: Therapist[];
  appointments: CalendarAppointment[];
  setView: (view: CalendarView) => void;
  setCurrentDate: (date: Date) => void;
  setSelectedDate: (date: Date) => void;
  setSelectedAppointment: (appointment: CalendarAppointment | null) => void;
  setIsFormOpen: (isOpen: boolean) => void;
  createAppointment: (appointment: Omit<CalendarAppointment, 'id'>) => Promise<void>;
  updateAppointment: (appointment: CalendarAppointment) => Promise<void>;
  deleteAppointment: (appointmentId: string) => Promise<void>;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState<CalendarView>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<CalendarAppointment | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [appointments, setAppointments] = useState<CalendarAppointment[]>([]);

  // Mock API calls
  const createAppointment = useCallback(async (appointment: Omit<CalendarAppointment, 'id'>) => {
    const newAppointment = {
      ...appointment,
      id: Math.random().toString(36).substr(2, 9),
    };
    setAppointments(prev => [...prev, newAppointment as CalendarAppointment]);
  }, []);

  const updateAppointment = useCallback(async (appointment: CalendarAppointment) => {
    setAppointments(prev => 
      prev.map(apt => apt.id === appointment.id ? appointment : apt)
    );
  }, []);

  const deleteAppointment = useCallback(async (appointmentId: string) => {
    setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
  }, []);

  const value = {
    view,
    currentDate,
    selectedDate,
    selectedAppointment,
    isFormOpen,
    userRole: 'therapist' as const,
    currentTherapist: null,
    therapists: [],
    appointments,
    setView,
    setCurrentDate,
    setSelectedDate,
    setSelectedAppointment,
    setIsFormOpen,
    createAppointment,
    updateAppointment,
    deleteAppointment,
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
}
