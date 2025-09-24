'use client';

import React, { memo, useMemo, useCallback } from 'react';
import { CalendarAppointment, Therapist } from '@/lib/calendar-types';
import { AppointmentBlock } from './appointment-block';

/**
 * Memoized appointment block to prevent unnecessary re-renders
 */
export const MemoizedAppointmentBlock = memo(AppointmentBlock, (prevProps, nextProps) => {
  return (
    prevProps.appointment.id === nextProps.appointment.id &&
    prevProps.appointment.status === nextProps.appointment.status &&
    prevProps.isActive === nextProps.isActive &&
    prevProps.isWeekView === nextProps.isWeekView
  );
});

MemoizedAppointmentBlock.displayName = 'MemoizedAppointmentBlock';

/**
 * Virtualized time slots for better performance with large calendars
 */
interface VirtualizedTimeSlotsProps {
  startHour?: number;
  endHour?: number;
  slotHeight: number;
  onTimeSlotClick: (hour: number) => void;
}

export const VirtualizedTimeSlots = memo(({
  startHour = 0,
  endHour = 24,
  slotHeight,
  onTimeSlotClick
}: VirtualizedTimeSlotsProps) => {
  const timeSlots = useMemo(() => {
    return Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  }, [startHour, endHour]);

  const handleSlotClick = useCallback((hour: number) => {
    onTimeSlotClick(hour);
  }, [onTimeSlotClick]);

  return (
    <>
      {timeSlots.map((hour) => (
        <div
          key={hour}
          style={{ height: `${slotHeight}rem` }}
          className="border-b border-muted/50 hover:bg-muted/20 transition-colors relative cursor-pointer"
          onClick={() => handleSlotClick(hour)}
        >
          <div className="absolute top-0 left-0 w-4 h-px bg-muted-foreground/20" />
        </div>
      ))}
    </>
  );
});

VirtualizedTimeSlots.displayName = 'VirtualizedTimeSlots';

/**
 * Optimized appointment list with memoization
 */
interface OptimizedAppointmentListProps {
  appointments: CalendarAppointment[];
  onAppointmentClick: (appointment: CalendarAppointment) => void;
  selectedAppointmentId?: string;
  isWeekView?: boolean;
}

export const OptimizedAppointmentList = memo(({
  appointments,
  onAppointmentClick,
  selectedAppointmentId,
  isWeekView = false
}: OptimizedAppointmentListProps) => {
  // Sort appointments by start time for consistent rendering
  const sortedAppointments = useMemo(() => {
    return [...appointments].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }, [appointments]);

  // Memoize click handlers to prevent recreation on every render
  const clickHandlers = useMemo(() => {
    const handlers: Record<string, () => void> = {};
    sortedAppointments.forEach(appointment => {
      handlers[appointment.id] = () => onAppointmentClick(appointment);
    });
    return handlers;
  }, [sortedAppointments, onAppointmentClick]);

  return (
    <>
      {sortedAppointments.map((appointment) => (
        <MemoizedAppointmentBlock
          key={appointment.id}
          appointment={appointment}
          onClick={clickHandlers[appointment.id]}
          isActive={selectedAppointmentId === appointment.id}
          isWeekView={isWeekView}
        />
      ))}
    </>
  );
});

OptimizedAppointmentList.displayName = 'OptimizedAppointmentList';

/**
 * Debounced filter hook for performance
 */
export function useDebouncedFilter<T>(
  items: T[],
  filterFn: (item: T) => boolean,
  delay: number = 300
): T[] {
  const [filteredItems, setFilteredItems] = React.useState<T[]>(items);
  const [debouncedFilterFn, setDebouncedFilterFn] = React.useState<(item: T) => boolean>(() => filterFn);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilterFn(() => filterFn);
    }, delay);

    return () => clearTimeout(timer);
  }, [filterFn, delay]);

  React.useEffect(() => {
    setFilteredItems(items.filter(debouncedFilterFn));
  }, [items, debouncedFilterFn]);

  return filteredItems;
}

/**
 * Memoized therapist list to prevent unnecessary re-renders
 */
interface OptimizedTherapistListProps {
  therapists: Therapist[];
  selectedTherapistIds: string[];
  onTherapistToggle: (therapistId: string, selected: boolean) => void;
}

export const OptimizedTherapistList = memo(({
  therapists,
  selectedTherapistIds,
  onTherapistToggle
}: OptimizedTherapistListProps) => {
  const toggleHandlers = useMemo(() => {
    const handlers: Record<string, (selected: boolean) => void> = {};
    therapists.forEach(therapist => {
      handlers[therapist.id] = (selected: boolean) => onTherapistToggle(therapist.id, selected);
    });
    return handlers;
  }, [therapists, onTherapistToggle]);

  return (
    <div className="space-y-2">
      {therapists.map(therapist => (
        <TherapistFilterItem
          key={therapist.id}
          therapist={therapist}
          isSelected={selectedTherapistIds.includes(therapist.id)}
          onToggle={toggleHandlers[therapist.id]}
        />
      ))}
    </div>
  );
});

OptimizedTherapistList.displayName = 'OptimizedTherapistList';

/**
 * Individual therapist filter item with memoization
 */
interface TherapistFilterItemProps {
  therapist: Therapist;
  isSelected: boolean;
  onToggle: (selected: boolean) => void;
}

const TherapistFilterItem = memo(({
  therapist,
  isSelected,
  onToggle
}: TherapistFilterItemProps) => {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        id={`therapist-${therapist.id}`}
        checked={isSelected}
        onChange={(e) => onToggle(e.target.checked)}
        className="rounded border-gray-300"
      />
      <label htmlFor={`therapist-${therapist.id}`} className="text-sm cursor-pointer flex-1">
        {therapist.name}
        <span className="text-muted-foreground ml-1">({therapist.specialty})</span>
      </label>
    </div>
  );
});

TherapistFilterItem.displayName = 'TherapistFilterItem';

/**
 * Performance monitoring hook
 */
export function useCalendarPerformance() {
  const [renderTime, setRenderTime] = React.useState<number>(0);
  const [appointmentCount, setAppointmentCount] = React.useState<number>(0);

  const startMeasure = useCallback(() => {
    return performance.now();
  }, []);

  const endMeasure = useCallback((startTime: number, count: number) => {
    const endTime = performance.now();
    setRenderTime(endTime - startTime);
    setAppointmentCount(count);
  }, []);

  return {
    renderTime,
    appointmentCount,
    startMeasure,
    endMeasure
  };
}

/**
 * Intersection Observer hook for lazy loading appointments
 */
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options?: IntersectionObserverInit
) {
  const [isIntersecting, setIsIntersecting] = React.useState(false);

  React.useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      options
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, options]);

  return isIntersecting;
}

/**
 * Optimized calendar container with performance monitoring
 */
interface OptimizedCalendarContainerProps {
  children: React.ReactNode;
  appointmentCount: number;
}

export const OptimizedCalendarContainer = memo(({
  children,
  appointmentCount
}: OptimizedCalendarContainerProps) => {
  const { renderTime, startMeasure, endMeasure } = useCalendarPerformance();

  React.useEffect(() => {
    const startTime = startMeasure();
    
    // Use requestAnimationFrame to measure after render
    requestAnimationFrame(() => {
      endMeasure(startTime, appointmentCount);
    });
  }, [appointmentCount, startMeasure, endMeasure]);

  // Log performance in development
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development' && renderTime > 0) {
      console.log(`Calendar render time: ${renderTime.toFixed(2)}ms for ${appointmentCount} appointments`);
      
      if (renderTime > 100) {
        console.warn('Calendar render time is high. Consider optimizing.');
      }
    }
  }, [renderTime, appointmentCount]);

  return <div className="calendar-container">{children}</div>;
});

OptimizedCalendarContainer.displayName = 'OptimizedCalendarContainer';