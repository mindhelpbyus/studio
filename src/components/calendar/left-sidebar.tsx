'use client';

import React from 'react';
import { CalendarAppointment } from '@/lib/calendar-types';
import { format, isSameDay, isToday, startOfDay, endOfDay, isPast, isFuture } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar'; // Assuming a shadcn/ui calendar component
import { addDays } from 'date-fns'; // Import addDays

interface LeftSidebarProps {
  appointments: CalendarAppointment[];
  currentDate: Date;
  onDateSelect: (date: Date) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  appointments,
  currentDate,
  onDateSelect,
}) => {
  // Sort appointments by start time
  const sortedAppointments = [...appointments].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  // Group appointments by day for the agenda list
  const groupedAppointments = sortedAppointments.reduce((acc, appointment) => {
    const dateKey = format(startOfDay(appointment.startTime), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(appointment);
    return acc;
  }, {} as Record<string, CalendarAppointment[]>);

  const today = startOfDay(new Date());
  const tomorrow = startOfDay(addDays(new Date(), 1));

  // Filter for upcoming appointments for the agenda list (from today onwards)
  const upcomingAppointments = Object.entries(groupedAppointments)
    .filter(([dateKey]) => {
      const date = new Date(dateKey);
      // Compare start of day to ensure all appointments from today onwards are included
      return startOfDay(date).getTime() >= today.getTime(); // Use the 'today' constant
    })
    .sort(([dateKeyA], [dateKeyB]) => new Date(dateKeyA).getTime() - new Date(dateKeyB).getTime());

  // Get days with appointments for the mini-calendar dot indicators
  const daysWithAppointments = Object.keys(groupedAppointments).map(dateKey => new Date(dateKey));

  // console.log('LeftSidebar - Appointments prop:', appointments); // Removed console.log
  // console.log('LeftSidebar - Grouped Appointments:', groupedAppointments); // Removed console.log
  // console.log('LeftSidebar - Upcoming Appointments:', upcomingAppointments); // Removed console.log
  // console.log('LeftSidebar - Today:', today); // Removed console.log
  // console.log('LeftSidebar - Tomorrow:', tomorrow); // Removed console.log

  return (
    <div className="flex-none w-1/4 min-w-[20rem] border-r p-4 flex flex-col bg-white text-gray-900"> {/* Light theme, dynamic width with min-width */}
      {/* Mini Calendar */}
      <div className="mb-6">
        <Calendar
          mode="single"
          selected={currentDate}
          onSelect={(date) => date && onDateSelect(date)}
          className="rounded-md border border-gray-200 bg-white text-gray-900 w-full" // Light theme for calendar, full width
          classNames={{
            day_selected: "bg-blue-500 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white",
            day_today: "bg-gray-100 text-gray-900",
            day_outside: "text-gray-400 opacity-50",
            head_row: "flex",
            head_cell: "text-gray-500 rounded-md w-9 font-normal text-[0.8rem]",
            row: "flex w-full mt-2",
            cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-range-start)]:rounded-l-md [&:has([aria-selected])]:bg-gray-200 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: "h-10 w-10 p-0 font-normal aria-selected:opacity-100", // Increased size
            day_hidden: "invisible",
            day_disabled: "text-gray-400 opacity-50",
            caption_label: "text-xl font-semibold text-gray-900", // Re-enabled and styled month/year label
            caption_dropdowns: "hidden", // Hide dropdowns, rely on nav buttons
            nav: "flex items-center justify-between",
            nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            caption: "flex justify-between pt-1 relative items-center", // Adjusted caption layout
          }}
        />
      </div>

      {/* Weather Placeholder */}
      <div className="mb-6 p-4 border rounded-md bg-blue-50 border-blue-200 text-blue-800">
        <h3 className="text-lg font-semibold mb-2">Weather Forecast</h3>
        <p className="text-sm">Weather data integration coming soon!</p>
        <p className="text-xs text-blue-600">
          (Requires external API integration for dynamic updates)
        </p>
      </div>

      {/* Agenda List */}
      <div className="flex-1 overflow-y-auto space-y-6">
        <h2 className="text-lg font-semibold mb-4">Upcoming Agenda</h2>
        {upcomingAppointments.length === 0 ? (
          <p className="text-muted-foreground">No upcoming appointments.</p>
        ) : (
          upcomingAppointments.map(([dateKey, dailyAppointments]) => (
            <div key={dateKey}>
              <h3 className="text-sm font-semibold mb-2 text-gray-600">
                {isSameDay(new Date(dateKey), today)
                  ? 'TODAY'
                  : isSameDay(new Date(dateKey), tomorrow)
                  ? 'TOMORROW'
                  : format(new Date(dateKey), 'EEEE, M/d')}
              </h3>
              <div className="space-y-2">
                {dailyAppointments.map(appointment => (
                  <div key={appointment.id} className="flex items-start gap-2 p-2 rounded-md hover:bg-gray-50">
                    <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: appointment.color }}></div>
                    <div>
                      <p className="text-sm font-medium">{appointment.title}</p>
                      <p className="text-xs text-gray-500">
                        {format(appointment.startTime, 'h:mm a')} - {format(appointment.endTime, 'h:mm a')}
                      </p>
                      {appointment.patientName && (
                        <p className="text-xs text-gray-600">{appointment.patientName}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
