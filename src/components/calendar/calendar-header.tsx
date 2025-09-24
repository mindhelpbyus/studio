'use client';

import { format, addDays, subDays, addWeeks, subWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { CalendarViewConfig, CalendarFilter, Therapist, CalendarView } from '@/lib/calendar-types';
import { CalendarFilters } from './calendar-filters';

interface CalendarHeaderProps {
  viewConfig: CalendarViewConfig;
  filters: CalendarFilter;
  therapists: Therapist[];
  onViewChange: (view: CalendarView) => void;
  onDateChange: (date: Date) => void;
  onFilterChange: (filters: Partial<CalendarFilter>) => void;
}

export function CalendarHeader({
  viewConfig,
  filters,
  therapists,
  onViewChange,
  onDateChange,
  onFilterChange
}: CalendarHeaderProps) {
  const { viewType, currentDate, userRole } = viewConfig;

  // Navigation handlers
  const handlePrevious = () => {
    const newDate = viewType === 'day' 
      ? subDays(currentDate, 1)
      : subWeeks(currentDate, 1);
    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = viewType === 'day'
      ? addDays(currentDate, 1)
      : addWeeks(currentDate, 1);
    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  // Format date display
  const formatDateDisplay = () => {
    switch (viewType) {
      case 'day':
        return format(currentDate, 'EEEE, MMMM d, yyyy');
      case 'week':
        const weekStart = subDays(currentDate, currentDate.getDay());
        const weekEnd = addDays(weekStart, 6);
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      case 'waitlist':
        return 'Appointment Waitlist';
      case 'conflicts':
        return 'Schedule Conflicts';
      default:
        return format(currentDate, 'MMMM d, yyyy');
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b bg-card">
      {/* Left side - Date navigation */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="px-3"
          >
            Today
          </Button>
        </div>

        <div className="text-lg font-semibold text-foreground">
          {formatDateDisplay()}
        </div>
      </div>

      {/* Center - View toggle */}
      <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
        <Button
          variant={viewType === 'day' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('day')}
          className="px-3"
        >
          Day
        </Button>
        <Button
          variant={viewType === 'week' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('week')}
          className="px-3"
        >
          Week
        </Button>
        <Button
          variant={viewType === 'month' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('month')}
          className="px-3"
        >
          Month
        </Button>
        <Button
          variant={viewType === 'agenda' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('agenda')}
          className="px-3"
        >
          Agenda
        </Button>
        <Button
          variant={viewType === 'timeline' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('timeline')}
          className="px-3"
        >
          Timeline
        </Button>
      </div>
      
      {/* Right side - Special Views */}
      <div className="flex items-center space-x-2">
        <Button
          variant={viewType === 'waitlist' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('waitlist')}
          className="px-3"
        >
          Waitlist
        </Button>
        <Button
          variant={viewType === 'conflicts' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('conflicts')}
          className="px-3"
        >
          Conflicts
        </Button>
      </div>

      {/* Right side - Filters (admin only) */}
      <div className="flex items-center space-x-2">
        {userRole === 'admin' && (
          <CalendarFilters
            filters={filters}
            therapists={therapists}
            onFilterChange={onFilterChange}
          />
        )}
      </div>
    </div>
  );
}