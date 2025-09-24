'use client';

import React, { useState, useEffect } from 'react';
import { CalendarContainer } from './calendar-container';
import { UserRole, CalendarView } from '@/lib/calendar-types';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResponsiveCalendarProps {
  userRole: UserRole;
  currentTherapistId?: string;
  initialDate?: Date;
  initialView?: CalendarView;
}

/**
 * Responsive wrapper for the calendar that adapts to different screen sizes
 */
export function ResponsiveCalendar({
  userRole,
  currentTherapistId,
  initialDate,
  initialView
}: ResponsiveCalendarProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Force day view on mobile for better UX
  const mobileView = isMobile ? 'day' : initialView;

  if (isMobile) {
    return (
      <div className="h-full flex flex-col">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b bg-card">
          <h1 className="text-lg font-semibold">Calendar</h1>
          {userRole === 'admin' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          )}
        </div>

        {/* Mobile Calendar */}
        <div className="flex-1 overflow-hidden">
          <CalendarContainer
            userRole={userRole}
            currentTherapistId={currentTherapistId}
            initialDate={initialDate}
            initialView={mobileView}
          />
        </div>
      </div>
    );
  }

  // Desktop view
  return (
    <CalendarContainer
      userRole={userRole}
      currentTherapistId={currentTherapistId}
      initialDate={initialDate}
      initialView={initialView}
    />
  );
}

/**
 * Hook for responsive calendar behavior
 */
export function useResponsiveCalendar() {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');

  useEffect(() => {
    const updateScreenInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Determine screen size
      if (width < 768) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }

      // Determine orientation
      setOrientation(height > width ? 'portrait' : 'landscape');
    };

    updateScreenInfo();
    window.addEventListener('resize', updateScreenInfo);
    window.addEventListener('orientationchange', updateScreenInfo);

    return () => {
      window.removeEventListener('resize', updateScreenInfo);
      window.removeEventListener('orientationchange', updateScreenInfo);
    };
  }, []);

  return { screenSize, orientation };
}

/**
 * Responsive grid layout calculator
 */
export function calculateResponsiveLayout(
  screenSize: 'mobile' | 'tablet' | 'desktop',
  viewType: CalendarView,
  therapistCount: number
): {
  columns: string;
  appointmentSize: 'sm' | 'md' | 'lg';
  showTherapistAvatars: boolean;
  maxVisibleTherapists: number;
} {
  switch (screenSize) {
    case 'mobile':
      return {
        columns: '60px 1fr', // Smaller time column
        appointmentSize: 'sm',
        showTherapistAvatars: false,
        maxVisibleTherapists: 1
      };

    case 'tablet':
      return {
        columns: viewType === 'day' 
          ? `80px repeat(${Math.min(therapistCount, 2)}, 1fr)`
          : '80px repeat(7, 1fr)',
        appointmentSize: 'md',
        showTherapistAvatars: true,
        maxVisibleTherapists: 2
      };

    case 'desktop':
    default:
      return {
        columns: viewType === 'day'
          ? `80px repeat(${therapistCount}, 1fr)`
          : '80px repeat(7, 1fr)',
        appointmentSize: 'lg',
        showTherapistAvatars: true,
        maxVisibleTherapists: therapistCount
      };
  }
}

/**
 * Touch-friendly appointment block for mobile
 */
interface TouchAppointmentBlockProps {
  appointment: any;
  onClick: () => void;
  className?: string;
}

export function TouchAppointmentBlock({
  appointment,
  onClick,
  className
}: TouchAppointmentBlockProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleTouchStart = () => {
    setIsPressed(true);
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
    onClick();
  };

  const handleTouchCancel = () => {
    setIsPressed(false);
  };

  return (
    <div
      className={cn(
        'touch-manipulation select-none transition-transform duration-150',
        isPressed && 'scale-95',
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      {/* Appointment content */}
      <div className="p-3 rounded-lg border-l-4 h-full overflow-hidden shadow-sm">
        <div className="flex flex-col h-full justify-between">
          <div>
            <p className="font-semibold text-sm uppercase tracking-wide truncate mb-1">
              {appointment.title}
            </p>
            {appointment.clientName && (
              <p className="font-medium text-base truncate mb-1">
                {appointment.clientName}
              </p>
            )}
          </div>
          <p className="text-sm opacity-75 truncate mt-auto">
            {appointment.time}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Mobile-optimized time column
 */
export function MobileTimeColumn() {
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    if (hour === 0) return '12a';
    if (hour < 12) return `${hour}a`;
    if (hour === 12) return '12p';
    return `${hour - 12}p`;
  });

  return (
    <div className="border-r bg-muted/30 w-15">
      <div className="h-16 border-b bg-card sticky top-0 z-20" />
      <div className="text-xs text-muted-foreground">
        {timeSlots.map((time, index) => (
          <div
            key={index}
            className="h-16 flex items-start justify-end pr-2 pt-1 border-b border-muted/50"
          >
            <span className="font-medium text-xs">{time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}