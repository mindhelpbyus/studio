'use client';

import React from 'react';
import { CalendarAppointment } from '@/lib/calendar-types';
import { formatAppointmentTime } from '@/lib/calendar-utils';
import { AppointmentService, MockDataService } from '@/lib/enhanced-appointments';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  User, 
  Phone, 
  Mail, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Calendar,
  MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppointmentDetailSidebarProps {
  appointment: CalendarAppointment | null;
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: string, appointmentId: string) => void;
}

export function AppointmentDetailSidebar({
  appointment,
  isOpen,
  onClose,
  onAction
}: AppointmentDetailSidebarProps) {
  if (!appointment) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-96">
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No appointment selected
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Mock extended data - in real app, this would come from API
  const therapists = MockDataService.generateSampleTherapists();
  const therapist = therapists.find(t => t.id === appointment.therapistId);
  const service = therapist?.services.find(s => s.id === appointment.serviceId);
  
  // Mock client data
  const mockClient = {
    id: appointment.clientId,
    name: appointment.clientName || 'Unknown Client',
    phone: '+1 (555) 123-4567',
    email: 'client@example.com',
    membershipType: 'Premium',
    membershipStatus: 'active' as const,
    notes: 'Regular client, prefers firm pressure'
  };

  const canReschedule = AppointmentService.canReschedule(appointment);
  const canCancel = AppointmentService.canCancel(appointment);
  const duration = AppointmentService.getDurationMinutes(appointment);
  const statusText = AppointmentService.getStatusDisplayText(appointment.status);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'checked-in': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMembershipColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-96 overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl">Appointment Details</SheetTitle>
            <Badge className={cn('text-xs', getStatusColor(appointment.status))}>
              {statusText}
            </Badge>
          </div>
          
          <SheetDescription className="text-base font-medium">
            {appointment.title}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Time and Duration */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{formatAppointmentTime(appointment)}</p>
                <p className="text-sm text-muted-foreground">{duration} minutes</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Client Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center">
              <User className="h-5 w-5 mr-2" />
              Client Information
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`https://picsum.photos/seed/${mockClient.id}/100/100`} />
                  <AvatarFallback>
                    {mockClient.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{mockClient.name}</p>
                  <div className="flex items-center space-x-2">
                    <Badge className={cn('text-xs', getMembershipColor(mockClient.membershipStatus))}>
                      {mockClient.membershipType}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{mockClient.phone}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{mockClient.email}</span>
                </div>
              </div>

              {mockClient.notes && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Notes:</p>
                  <p className="text-sm">{mockClient.notes}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Service Information */}
          {service && (
            <>
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Service Details
                </h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Service:</span>
                    <span className="text-sm font-medium">{service.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Duration:</span>
                    <span className="text-sm">{service.duration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Price:</span>
                    <span className="text-sm font-medium">${service.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Category:</span>
                    <span className="text-sm">{service.category}</span>
                  </div>
                </div>
              </div>

              <Separator />
            </>
          )}

          {/* Therapist Information */}
          {therapist && (
            <>
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Therapist
                </h3>
                
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={therapist.avatar} />
                    <AvatarFallback>
                      {therapist.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{therapist.name}</p>
                    <p className="text-sm text-muted-foreground">{therapist.specialty}</p>
                  </div>
                </div>
              </div>

              <Separator />
            </>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Actions</h3>
            
            <div className="space-y-2">
              {appointment.status === 'scheduled' && (
                <Button
                  className="w-full"
                  onClick={() => onAction('check-in', appointment.id)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Check In
                </Button>
              )}

              {canReschedule && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => onAction('reschedule', appointment.id)}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Reschedule
                </Button>
              )}

              {canCancel && (
                <Button
                  variant="outline"
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onAction('cancel', appointment.id)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Appointment
                </Button>
              )}

              {appointment.status === 'checked-in' && (
                <Button
                  className="w-full"
                  onClick={() => onAction('complete', appointment.id)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}