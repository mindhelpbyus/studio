'use client';

import React from 'react';
import { format, addDays, subDays, addWeeks, subWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
    if (viewType === 'day') {
      return format(currentDate, 'EEEE, MMMM d, yyyy');
    } else {
      const weekStart = subDays(currentDate, currentDate.getDay());
      const weekEnd = addDays(weekStart, 6);
      return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
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
          className="px-4"
        >
          Day
        </Button>
        <Button
          variant={viewType === 'week' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('week')}
          className="px-4"
        >
          Week
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