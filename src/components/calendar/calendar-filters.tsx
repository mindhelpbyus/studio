'use client';

import React, { useState } from 'react';
import { CalendarFilter, Therapist, AppointmentStatus } from '@/lib/calendar-types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface CalendarFiltersProps {
  filters: CalendarFilter;
  therapists: Therapist[];
  onFilterChange: (filters: Partial<CalendarFilter>) => void;
}

const SERVICE_CATEGORIES = [
  'Massage',
  'Facial',
  'Nails',
  'Hair',
  'Consultation'
];

const APPOINTMENT_STATUSES: { value: AppointmentStatus; label: string }[] = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'checked-in', label: 'Checked In' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no-show', label: 'No Show' }
];

export function CalendarFilters({
  filters,
  therapists,
  onFilterChange
}: CalendarFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Count active filters
  const activeFilterCount = 
    filters.therapistIds.length +
    filters.serviceTypes.length +
    filters.appointmentStatuses.length;

  // Handle therapist filter changes
  const handleTherapistToggle = (therapistId: string, checked: boolean) => {
    const newTherapistIds = checked
      ? [...filters.therapistIds, therapistId]
      : filters.therapistIds.filter(id => id !== therapistId);
    
    onFilterChange({ therapistIds: newTherapistIds });
  };

  // Handle service type filter changes
  const handleServiceTypeToggle = (serviceType: string, checked: boolean) => {
    const newServiceTypes = checked
      ? [...filters.serviceTypes, serviceType]
      : filters.serviceTypes.filter(type => type !== serviceType);
    
    onFilterChange({ serviceTypes: newServiceTypes });
  };

  // Handle appointment status filter changes
  const handleStatusToggle = (status: AppointmentStatus, checked: boolean) => {
    const newStatuses = checked
      ? [...filters.appointmentStatuses, status]
      : filters.appointmentStatuses.filter(s => s !== status);
    
    onFilterChange({ appointmentStatuses: newStatuses });
  };

  // Clear all filters
  const handleClearAll = () => {
    onFilterChange({
      therapistIds: [],
      serviceTypes: [],
      appointmentStatuses: []
    });
  };

  // Clear specific filter type
  const handleClearTherapists = () => {
    onFilterChange({ therapistIds: [] });
  };

  const handleClearServiceTypes = () => {
    onFilterChange({ serviceTypes: [] });
  };

  const handleClearStatuses = () => {
    onFilterChange({ appointmentStatuses: [] });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge 
              variant="secondary" 
              className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Filter Calendar</h3>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-xs"
              >
                Clear All
              </Button>
            )}
          </div>

          {/* Active Filters Summary */}
          {activeFilterCount > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Active filters:</p>
              <div className="flex flex-wrap gap-1">
                {filters.therapistIds.map(id => {
                  const therapist = therapists.find(t => t.id === id);
                  return therapist ? (
                    <Badge key={id} variant="secondary" className="text-xs">
                      {therapist.name}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => handleTherapistToggle(id, false)}
                      />
                    </Badge>
                  ) : null;
                })}
                {filters.serviceTypes.map(type => (
                  <Badge key={type} variant="secondary" className="text-xs">
                    {type}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => handleServiceTypeToggle(type, false)}
                    />
                  </Badge>
                ))}
                {filters.appointmentStatuses.map(status => {
                  const statusObj = APPOINTMENT_STATUSES.find(s => s.value === status);
                  return statusObj ? (
                    <Badge key={status} variant="secondary" className="text-xs">
                      {statusObj.label}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => handleStatusToggle(status, false)}
                      />
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          )}

          <Separator />

          {/* Therapist Filter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-medium">Therapists</Label>
              {filters.therapistIds.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearTherapists}
                  className="text-xs h-auto p-1"
                >
                  Clear
                </Button>
              )}
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {therapists.map(therapist => (
                <div key={therapist.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`therapist-${therapist.id}`}
                    checked={filters.therapistIds.includes(therapist.id)}
                    onCheckedChange={(checked) => 
                      handleTherapistToggle(therapist.id, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`therapist-${therapist.id}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {therapist.name}
                    <span className="text-muted-foreground ml-1">
                      ({therapist.specialty})
                    </span>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Service Type Filter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-medium">Service Types</Label>
              {filters.serviceTypes.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearServiceTypes}
                  className="text-xs h-auto p-1"
                >
                  Clear
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {SERVICE_CATEGORIES.map(category => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`service-${category}`}
                    checked={filters.serviceTypes.includes(category)}
                    onCheckedChange={(checked) => 
                      handleServiceTypeToggle(category, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`service-${category}`}
                    className="text-sm cursor-pointer"
                  >
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Appointment Status Filter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-medium">Appointment Status</Label>
              {filters.appointmentStatuses.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearStatuses}
                  className="text-xs h-auto p-1"
                >
                  Clear
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {APPOINTMENT_STATUSES.map(({ value, label }) => (
                <div key={value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${value}`}
                    checked={filters.appointmentStatuses.includes(value)}
                    onCheckedChange={(checked) => 
                      handleStatusToggle(value, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`status-${value}`}
                    className="text-sm cursor-pointer"
                  >
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}