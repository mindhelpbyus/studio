
'use client';

import * as React from 'react';
import { WeekViewCalendar } from '@/components/provider-portal/week-view-calendar';
import { DayViewCalendar } from '@/components/provider-portal/day-view-calendar';
import { AppointmentDetail } from '@/components/provider-portal/appointment-detail';
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { addDays, format, subDays } from 'date-fns';

export default function CalendarPage() {
  const [view, setView] = React.useState<'day' | 'week'>('day');
  // Initialize with null to prevent hydration mismatch. Date will be set on client mount.
  const [currentDate, setCurrentDate] = React.useState<Date | null>(null);

  React.useEffect(() => {
    // Set the date only on the client-side after the component has mounted.
    setCurrentDate(new Date());
  }, []);

  const handleNext = () => {
    if (currentDate) {
        if (view === 'day') {
        setCurrentDate(addDays(currentDate, 1));
        } else {
        setCurrentDate(addDays(currentDate, 7));
        }
    }
  };

  const handlePrev = () => {
    if (currentDate) {
        if (view === 'day') {
        setCurrentDate(subDays(currentDate, 1));
        } else {
        setCurrentDate(subDays(currentDate, 7));
        }
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Render a loading state or nothing until the date is set on the client
  if (!currentDate) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b bg-card/80 backdrop-blur-sm p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <Button onClick={handleToday} variant="outline" className="font-semibold uppercase text-xs hover:bg-primary hover:text-primary-foreground transition-colors">
            Today
          </Button>
          <div className="flex items-center gap-2">
            <Button onClick={handlePrev} variant="ghost" size="icon" className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xl font-bold min-w-[250px] text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {view === 'day' 
                ? format(currentDate, 'EEEE, MMMM d, yyyy') 
                : `${format(currentDate, 'MMM d')} - ${format(addDays(currentDate, 6), 'MMM d, yyyy')}`
              }
            </span>
            <Button onClick={handleNext} variant="ghost" size="icon" className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="gap-2 hidden sm:flex hover:bg-muted/50 transition-colors">
            <SlidersHorizontal size={16} />
            Filters
          </Button>
          <div className="flex items-center rounded-lg border bg-background text-sm font-medium overflow-hidden shadow-sm">
            <button
              onClick={() => setView('day')}
              className={`px-6 py-2.5 transition-all duration-200 ${view === 'day' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-muted/50'}`}
            >
              Day
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-6 py-2.5 border-l transition-all duration-200 ${view === 'week' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-muted/50'}`}
            >
              Week
            </button>
          </div>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-hidden">
          {view === 'week' ? <WeekViewCalendar currentDate={currentDate} /> : <DayViewCalendar currentDate={currentDate} />}
        </main>
        <aside className="w-[380px] shrink-0 border-l bg-card/50 backdrop-blur-sm hidden lg:block">
          <AppointmentDetail />
        </aside>
      </div>
    </div>
  );
}
