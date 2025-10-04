import React, { useState, useEffect } from 'react';
import { CalendarView, UserRole, Appointment, Therapist, CalendarState } from '../../types/appointment';
import { appointmentsApi } from '@/api/appointments';
import { DayView } from './DayView';
import { WeekView } from './WeekView';
import { MonthView } from './MonthView';
import { AgendaView } from './AgendaView';
import { AppointmentForm } from './AppointmentForm';
import { AppointmentPanel } from './AppointmentPanel';
import { CalendarSidebar } from './CalendarSidebar';
import { KeyboardShortcutsDialog } from './keyboard-shortcuts-dialog';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Checkbox } from './ui/checkbox';
import { ChevronLeft, ChevronRight, Plus, Calendar, Users, ChevronDown, Search } from 'lucide-react';
import { useKeyboardShortcuts } from '@/lib/use-keyboard-shortcuts';

interface CalendarContainerProps {
  userRole: UserRole;
  currentUserId: string;
}

export function CalendarContainer({ userRole, currentUserId }: CalendarContainerProps) {
  const [state, setState] = useState<CalendarState>({
    currentDate: new Date(),
    view: 'week',
    selectedTherapistIds: userRole === 'therapist' ? [currentUserId] : [],
    userRole,
    currentUserId,
  });

  // Track if initial selection has been made to prevent auto-selection
  const [initialSelectionDone, setInitialSelectionDone] = useState(userRole === 'therapist');

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [formInitialData, setFormInitialData] = useState<{
    date?: Date;
    time?: string;
    therapistId?: string;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, [state.currentDate, state.view, state.selectedTherapistIds]);

  // Note: Removed auto-selection - let admin users manually choose therapists

  // Debug therapist data loading
  useEffect(() => {
    console.log('Therapists loaded:', therapists.length, therapists.map(t => `${t.name} (${t.id})`));
    console.log('Current selected therapist IDs:', state.selectedTherapistIds);
    console.log('User role:', userRole);
  }, [therapists, state.selectedTherapistIds, userRole]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [appointmentsData, therapistsData] = await Promise.all([
        appointmentsApi.getAppointments(
          getStartDate().toISOString(),
          getEndDate().toISOString(),
          state.selectedTherapistIds.length > 0 ? state.selectedTherapistIds : undefined
        ),
        appointmentsApi.getTherapists(),
      ]);
      
      setAppointments(appointmentsData);
      setTherapists(therapistsData);
      console.log('Data loaded successfully - Therapists:', therapistsData.length, 'Appointments:', appointmentsData.length);
    } catch (error) {
      console.error('Failed to load data:', error);
      // Set empty arrays as fallback
      setAppointments([]);
      setTherapists([]);
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = () => {
    const date = new Date(state.currentDate);
    if (state.view === 'day') {
      date.setHours(0, 0, 0, 0);
      return date;
    } else if (state.view === 'week') {
      const dayOfWeek = date.getDay();
      const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust when day is Sunday
      date.setDate(diff);
      date.setHours(0, 0, 0, 0);
      return date;
    } else {
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
      return date;
    }
  };

  const getEndDate = () => {
    const date = new Date(state.currentDate);
    if (state.view === 'day') {
      date.setHours(23, 59, 59, 999);
      return date;
    } else if (state.view === 'week') {
      const dayOfWeek = date.getDay();
      const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? 0 : 7);
      date.setDate(diff);
      date.setHours(23, 59, 59, 999);
      return date;
    } else {
      date.setMonth(date.getMonth() + 1, 0);
      date.setHours(23, 59, 59, 999);
      return date;
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(state.currentDate);
    
    if (state.view === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (state.view === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    
    setState(prev => ({ ...prev, currentDate: newDate }));
  };

  const handleViewChange = (view: CalendarView) => {
    setState(prev => ({ ...prev, view }));
  };

  const handleTherapistToggle = (therapistId: string, checked: boolean) => {
    if (userRole === 'therapist') return; // Therapists can't change this
    
    console.log('Toggling therapist:', therapistId, 'checked:', checked);
    
    setState(prev => {
      const newSelectedIds = checked
        ? [...prev.selectedTherapistIds, therapistId]
        : prev.selectedTherapistIds.filter(id => id !== therapistId);
      
      console.log('New selected therapist IDs:', newSelectedIds);
      
      return {
        ...prev,
        selectedTherapistIds: newSelectedIds
      };
    });
  };

  const handleSlotClick = (date: Date, time: string, therapistId?: string) => {
    setFormInitialData({ date, time, therapistId: therapistId || '' });
    setShowAppointmentForm(true);
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleAppointmentUpdate = async (appointmentId: string, updates: Partial<Appointment>) => {
    try {
      await appointmentsApi.updateAppointment(appointmentId, updates);
      await loadData();
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Failed to update appointment:', error);
    }
  };

  const handleAppointmentDelete = async (appointmentId: string) => {
    try {
      await appointmentsApi.deleteAppointment(appointmentId);
      await loadData();
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Failed to delete appointment:', error);
    }
  };

  const handleAppointmentCreate = async (appointmentData: Omit<Appointment, 'id'>) => {
    try {
      await appointmentsApi.createAppointment(appointmentData);
      await loadData();
      setShowAppointmentForm(false);
      setFormInitialData(null);
    } catch (error) {
      console.error('Failed to create appointment:', error);
    }
  };

  const formatDateHeader = () => {
    const date = state.currentDate;
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric',
      month: 'long'
    };
    
    if (state.view === 'day') {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } else if (state.view === 'week') {
      const startOfWeek = getStartDate();
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return date.toLocaleDateString('en-US', options);
    }
  };

  const currentTherapists = userRole === 'admin'
    ? therapists.filter(t => state.selectedTherapistIds.includes(t.id))
    : therapists.filter(t => t.id === currentUserId);

  // Keyboard shortcuts
  const { shortcuts } = useKeyboardShortcuts({
    currentDate: state.currentDate,
    onDateChange: (date: Date) => setState(prev => ({ ...prev, currentDate: date })),
    onToday: () => setState(prev => ({ ...prev, currentDate: new Date() })),
    onViewChange: handleViewChange,
    onNewAppointment: () => setShowAppointmentForm(true),
    currentView: state.view,
  });

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header - Fantastical Style */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-background">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => navigateDate('prev')} className="h-8 w-8 p-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigateDate('next')} className="h-8 w-8 p-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setState(prev => ({ ...prev, currentDate: new Date() }))}
            className="px-3 py-1 h-8"
          >
            Today
          </Button>
          
          <h1 className="text-xl font-semibold text-foreground">{formatDateHeader()}</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* View Switcher - Fantastical Style */}
          <div className="flex items-center bg-muted rounded-lg p-0.5">
            {(['day', 'week', 'month', 'agenda'] as CalendarView[]).map((view) => (
              <Button
                key={view}
                variant={state.view === view ? "default" : "ghost"}
                size="sm"
                onClick={() => handleViewChange(view)}
                className="capitalize text-sm px-4 py-1.5 h-8"
              >
                {view}
              </Button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search appointments..."
              className="pl-10 pr-4 py-2 text-sm bg-muted border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring w-72 h-9"
            />
          </div>

          {/* Therapist Filter (Admin only) - Simplified */}
          {userRole === 'admin' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Users className="h-4 w-4 mr-2" />
                  {state.selectedTherapistIds.length === 0 
                    ? "Doctors"
                    : state.selectedTherapistIds.length === therapists.length && therapists.length > 0
                    ? "All Doctors"
                    : `${state.selectedTherapistIds.length} Doctor${state.selectedTherapistIds.length !== 1 ? 's' : ''}`
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
                    onClick={(e: React.MouseEvent) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setState(prev => ({ ...prev, selectedTherapistIds: therapists.map(t => t.id) }));
                    }}
                  >
                    Select All
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                    onClick={(e: React.MouseEvent) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setState(prev => ({ ...prev, selectedTherapistIds: [] }));
                    }}
                  >
                    Select None
                  </Button>
                </div>
                
                <DropdownMenuSeparator />
                
                {/* Doctor List */}
                {therapists.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No doctors available
                  </div>
                ) : (
                  therapists.map(therapist => (
                    <DropdownMenuItem 
                      key={therapist.id} 
                      className="flex items-center gap-3 p-3 cursor-pointer focus:bg-accent"
                      onSelect={(e: Event) => e.preventDefault()}
                      onClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const isCurrentlySelected = state.selectedTherapistIds.includes(therapist.id);
                        handleTherapistToggle(therapist.id, !isCurrentlySelected);
                      }}
                    >
                      <Checkbox
                        id={`dropdown-${therapist.id}`}
                        checked={state.selectedTherapistIds.includes(therapist.id)}
                        onCheckedChange={(checked: boolean) => {
                          handleTherapistToggle(therapist.id, checked);
                        }}
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                      />
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: therapist.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{therapist.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{therapist.email}</div>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <KeyboardShortcutsDialog shortcuts={shortcuts} />

          <Button onClick={() => setShowAppointmentForm(true)} size="sm" className="h-9">
            <Plus className="h-4 w-4 mr-2" />
            New
          </Button>
        </div>
      </div>

      {/* Main Content Area with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <CalendarSidebar
          currentDate={state.currentDate}
          appointments={appointments}
          therapists={therapists}
          onDateChange={(date) => setState(prev => ({ ...prev, currentDate: date }))}
          onNavigate={navigateDate}
          onAppointmentClick={handleAppointmentClick}
        />

        {/* Calendar Content */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : userRole === 'admin' && state.selectedTherapistIds.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-muted/50 rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-muted-foreground">No Doctors Selected</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Please select one or more doctors from the dropdown to view their calendars.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {state.view === 'day' && (
                <DayView
                  date={state.currentDate}
                  appointments={appointments}
                  therapists={currentTherapists}
                  onSlotClick={handleSlotClick}
                  onAppointmentClick={handleAppointmentClick}
                  onAppointmentUpdate={handleAppointmentUpdate}
                  showMultipleTherapists={userRole === 'admin'}
                />
              )}
              {state.view === 'week' && (
                <WeekView
                  startDate={getStartDate()}
                  appointments={appointments}
                  therapists={currentTherapists}
                  onSlotClick={handleSlotClick}
                  onAppointmentClick={handleAppointmentClick}
                  onAppointmentUpdate={handleAppointmentUpdate}
                  showMultipleTherapists={userRole === 'admin'}
                />
              )}
              {state.view === 'month' && (
                <MonthView
                  date={state.currentDate}
                  appointments={appointments}
                  therapists={currentTherapists}
                  onDayClick={(date) => setState(prev => ({ ...prev, currentDate: date, view: 'day' }))}
                  onAppointmentClick={handleAppointmentClick}
                />
              )}
              {state.view === 'agenda' && (
                <AgendaView
                  appointments={appointments}
                  therapists={currentTherapists}
                  currentDate={state.currentDate}
                  onAppointmentClick={handleAppointmentClick}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Appointment Form Modal */}
      {showAppointmentForm && (
        <AppointmentForm
          isOpen={showAppointmentForm}
          onClose={() => {
            setShowAppointmentForm(false);
            setFormInitialData(null);
          }}
          onSave={handleAppointmentCreate}
          therapists={therapists}
          initialData={formInitialData}
        />
      )}

      {/* Appointment Detail Panel */}
      {selectedAppointment && (
        <AppointmentPanel
          appointment={selectedAppointment}
          isOpen={!!selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onUpdate={handleAppointmentUpdate}
          onDelete={handleAppointmentDelete}
          therapists={therapists}
        />
      )}
    </div>
  );
}
