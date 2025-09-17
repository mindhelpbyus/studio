
'use client';

import * as React from 'react';
import { WeekViewCalendar } from '@/components/provider-portal/week-view-calendar';
import { DayViewCalendar } from '@/components/provider-portal/day-view-calendar';
import { AppointmentDetail } from '@/components/provider-portal/appointment-detail';
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CalendarPage() {
  const [view, setView] = React.useState<'day' | 'week'>('day');

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b bg-card p-4">
        <div className="flex items-center gap-4">
          <button className="font-semibold uppercase">Today</button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="text-base font-semibold">Tuesday, July 16</span>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="gap-2">
            <SlidersHorizontal size={16} />
            Filters
          </Button>
          <div className="flex items-center rounded-md border bg-background text-sm font-medium">
            <button
              onClick={() => setView('day')}
              className={`px-4 py-1.5 rounded-l-md ${view === 'day' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/50'}`}
            >
              Day
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-4 py-1.5 border-l rounded-r-md ${view === 'week' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/50'}`}
            >
              Week
            </button>
          </div>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-auto">
          {view === 'week' ? <WeekViewCalendar /> : <DayViewCalendar />}
        </main>
        <aside className="w-[380px] shrink-0 border-l bg-card">
          <AppointmentDetail />
        </aside>
      </div>
    </div>
  );
}
