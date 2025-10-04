'use client';

import { format } from 'date-fns';
import { Calendar, Clock, User, Phone, Mail, FileText, AlertTriangle } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/nexus-ui/alert-dialog';
import { Button } from '@/components/nexus-ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/nexus-ui/dialog';
import { Input } from '@/components/nexus-ui/input';
import { Label } from '@/components/nexus-ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/nexus-ui/select';
import { Textarea } from '@/components/nexus-ui/textarea';
import { CalendarAppointment, Therapist, Service, AppointmentFormProps } from '@/lib/calendar-types';
import { AppointmentService } from '@/lib/enhanced-appointments';
import { cn } from '@/lib/utils';

interface AppointmentFormData {
  title: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  serviceId: string;
  therapistId: string;
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  date: string;      // YYYY-MM-DD format
  notes: string;
  status: 'scheduled' | 'checked-in' | 'completed' | 'cancelled' | 'no-show' | 'waitlist'; // Added 'waitlist'
  type: 'appointment' | 'break' | 'blocked';
}

export interface ExtendedAppointmentFormProps extends AppointmentFormProps { // Exported
  therapists: Therapist[];
  services: Service[];
  onConflictCheck?: (appointment: CalendarAppointment) => Promise<CalendarAppointment[]>;
  therapistId?: string; // Explicitly make optional here as well
}

export const AppointmentForm: React.FC<ExtendedAppointmentFormProps> = ({
  isOpen,
  mode,
  appointment,
  initialTime,
  therapistId: propTherapistId, // Renamed to avoid conflict with state
  therapists,
  services,
  onSave,
  onCancel,
  onDelete,
  onConflictCheck,
}) => {
  const [formData, setFormData] = useState<AppointmentFormData>({
    title: '',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    serviceId: '',
    therapistId: propTherapistId || '', // Use propTherapistId
    startTime: '',
    endTime: '',
    date: '',
    notes: '',
    status: 'scheduled',
    type: 'appointment',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [conflicts, setConflicts] = useState<CalendarAppointment[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && appointment) {
        setFormData({
          title: appointment.title,
          clientName: appointment.clientName || '',
          clientPhone: '', // Would come from extended client data
          clientEmail: '',  // Would come from extended client data
          serviceId: appointment.serviceId,
          therapistId: appointment.therapistId,
          startTime: format(appointment.startTime, 'HH:mm'),
          endTime: format(appointment.endTime, 'HH:mm'),
          date: format(appointment.startTime, 'yyyy-MM-dd'),
          notes: appointment.notes || '',
          status: appointment.status,
          type: appointment.type,
        });
      } else if (mode === 'create') {
        const defaultDate = initialTime || new Date();
        const defaultEndTime = new Date(defaultDate.getTime() + 60 * 60 * 1000); // 1 hour later

        setFormData({
          title: '',
          clientName: '',
          clientPhone: '',
          clientEmail: '',
          serviceId: '',
          therapistId: propTherapistId || '', // Use propTherapistId here
          startTime: format(defaultDate, 'HH:mm'),
          endTime: format(defaultEndTime, 'HH:mm'),
          date: format(defaultDate, 'yyyy-MM-dd'),
          notes: '',
          status: 'scheduled',
          type: 'appointment',
        });
      }
      setErrors({});
      setConflicts([]);
    }
  }, [isOpen, mode, appointment, initialTime, propTherapistId]);

  // Update end time when service changes
  useEffect(() => {
    if (formData.serviceId) {
      const service = services.find(s => s.id === formData.serviceId);
      if (service && formData.startTime) {
      const timeParts = formData.startTime.split(':');
      const hours = parseInt(timeParts[0] ?? '0', 10) || 0;
      const minutes = parseInt(timeParts[1] ?? '0', 10) || 0;
      const startDate = new Date();
      startDate.setHours(hours, minutes, 0, 0);
      const endDate = new Date(startDate.getTime() + service.duration * 60 * 1000);
        
        setFormData(prev => ({
          ...prev,
          title: service.name,
          endTime: format(endDate, 'HH:mm'),
        }));
      }
    }
  }, [formData.serviceId, formData.startTime, services]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.clientName.trim() && formData.type === 'appointment') {
      newErrors.clientName = 'Client name is required';
    }

    if (!formData.therapistId) {
      newErrors.therapistId = 'Therapist is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (formData.startTime && formData.endTime) {
      const startTimeParts = formData.startTime.split(':');
      const startHours = parseInt(startTimeParts[0] ?? '0', 10) || 0;
      const startMinutes = parseInt(startTimeParts[1] ?? '0', 10) || 0;

      const endTimeParts = formData.endTime.split(':');
      const endHours = parseInt(endTimeParts[0] ?? '0', 10) || 0;
      const endMinutes = parseInt(endTimeParts[1] ?? '0', 10) || 0;
      
      const startMinutesTotal = startHours * 60 + startMinutes;
      const endMinutesTotal = endHours * 60 + endMinutes;
      
      if (endMinutesTotal <= startMinutesTotal) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    if (formData.clientEmail && !isValidEmail(formData.clientEmail)) {
      newErrors.clientEmail = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check for conflicts
  const checkConflicts = async (appointmentData: CalendarAppointment): Promise<boolean> => {
    if (!onConflictCheck) return true;

    try {
      const conflictingAppointments = await onConflictCheck(appointmentData);
      setConflicts(conflictingAppointments);
      return conflictingAppointments.length === 0;
    } catch (error) {
      console.error('Error checking conflicts:', error);
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

      setIsLoading(true);

      try {
        // Create appointment object
        const startTimeParts = formData.startTime.split(':');
        const startHours = parseInt(startTimeParts[0] ?? '0', 10) || 0;
        const startMinutes = parseInt(startTimeParts[1] ?? '0', 10) || 0;

        const endTimeParts = formData.endTime.split(':');
        const endHours = parseInt(endTimeParts[0] ?? '0', 10) || 0;
        const endMinutes = parseInt(endTimeParts[1] ?? '0', 10) || 0;
        
        const appointmentDate = new Date(formData.date);
        const startTime = new Date(appointmentDate);
        startTime.setHours(startHours, startMinutes, 0, 0);
        
        const endTime = new Date(appointmentDate);
        endTime.setHours(endHours, endMinutes, 0, 0);

        const appointmentData: CalendarAppointment = {
          id: appointment?.id || `apt-${Date.now()}`,
          therapistId: formData.therapistId,
          clientId: appointment?.clientId || `client-${Date.now()}`,
          serviceId: formData.serviceId,
          startTime,
          endTime,
          status: formData.status,
          type: formData.type,
          title: formData.title,
          patientName: formData.clientName, // Use clientName for patientName
          clientName: formData.clientName,   // Add clientName
          notes: formData.notes,
          color: 'blue', // Would be determined by service
          createdBy: 'therapist',
        };

      // Validate appointment business rules
      const validationErrors = AppointmentService.validateAppointment(appointmentData);
      if (validationErrors.length > 0) {
        setErrors({ general: validationErrors.join(', ') });
        return;
      }

      // Check for conflicts
      const hasNoConflicts = await checkConflicts(appointmentData);
      if (!hasNoConflicts && conflicts.length > 0) {
        // Show conflicts but allow user to proceed
        return;
      }

      // Save appointment
      onSave(appointmentData);
      onCancel(); // Close form
    } catch (error) {
      console.error('Error saving appointment:', error);
      setErrors({ general: 'Failed to save appointment. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (appointment && onDelete) {
      onDelete(appointment.id);
      onCancel();
    }
  };

  // Get available therapists
  // Always show all therapists in the dropdown, validation will handle if a therapist is required.
  const availableTherapists = therapists;

  // Get available services for selected therapist
  const availableServices = formData.therapistId 
    ? therapists.find(t => t.id === formData.therapistId)?.services || []
    : services;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onCancel}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {mode === 'create' ? 'Create Appointment' : 'Edit Appointment'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">{errors.general}</span>
                </div>
              </div>
            )}

            {/* Conflicts Warning */}
            {conflicts.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex items-center gap-2 text-yellow-800 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">Scheduling Conflicts Detected</span>
                </div>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {conflicts.map(conflict => (
                    <li key={conflict.id}>
                      • {conflict.title} ({format(conflict.startTime, 'h:mm a')} - {format(conflict.endTime, 'h:mm a')})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Appointment Type */}
              <div className="md:col-span-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'appointment' | 'break' | 'blocked') =>
                    setFormData(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="appointment">Appointment</SelectItem>
                    <SelectItem value="break">Break</SelectItem>
                    <SelectItem value="blocked">Blocked Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="md:col-span-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
              </div>

              {/* Client Information (only for appointments) */}
              {formData.type === 'appointment' && (
                <>
                  <div>
                    <Label htmlFor="clientName">Client Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="clientName"
                        value={formData.clientName}
                        onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                        className={cn('pl-10', errors.clientName ? 'border-red-500' : '')}
                      />
                    </div>
                    {errors.clientName && <p className="text-sm text-red-500 mt-1">{errors.clientName}</p>}
                  </div>

                  <div>
                    <Label htmlFor="clientPhone">Client Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="clientPhone"
                        value={formData.clientPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="clientEmail">Client Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="clientEmail"
                        type="email"
                        value={formData.clientEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
                        className={cn('pl-10', errors.clientEmail ? 'border-red-500' : '')}
                      />
                    </div>
                    {errors.clientEmail && <p className="text-sm text-red-500 mt-1">{errors.clientEmail}</p>}
                  </div>
                </>
              )}

              {/* Therapist */}
              <div>
                <Label htmlFor="therapistId">Therapist *</Label>
                <Select
                  value={formData.therapistId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, therapistId: value }))}
                >
                  <SelectTrigger className={errors.therapistId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select therapist" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTherapists.map(therapist => (
                      <SelectItem key={therapist.id} value={therapist.id}>
                        {therapist.name} - {therapist.specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.therapistId && <p className="text-sm text-red-500 mt-1">{errors.therapistId}</p>}
              </div>

              {/* Service (only for appointments) */}
              {formData.type === 'appointment' && (
                <div>
                  <Label htmlFor="serviceId">Service</Label>
                  <Select
                    value={formData.serviceId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, serviceId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableServices.map(service => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} ({service.duration}min - ${service.price})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Date */}
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className={errors.date ? 'border-red-500' : ''}
                />
                {errors.date && <p className="text-sm text-red-500 mt-1">{errors.date}</p>}
              </div>

              {/* Time */}
              <div>
                <Label htmlFor="startTime">Start Time *</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    className={cn('pl-10', errors.startTime ? 'border-red-500' : '')}
                  />
                </div>
                {errors.startTime && <p className="text-sm text-red-500 mt-1">{errors.startTime}</p>}
              </div>

              <div>
                <Label htmlFor="endTime">End Time *</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    className={cn('pl-10', errors.endTime ? 'border-red-500' : '')}
                  />
                </div>
                {errors.endTime && <p className="text-sm text-red-500 mt-1">{errors.endTime}</p>}
              </div>

              {/* Status (only for edit mode) */}
              {mode === 'edit' && (
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="checked-in">Checked In</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="no-show">No Show</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Notes */}
              <div className="md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="pl-10 min-h-[80px]"
                    placeholder="Additional notes or special instructions..."
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="flex justify-between">
              <div>
                {mode === 'edit' && onDelete && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    Delete
                  </Button>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className={conflicts.length > 0 ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                >
                  {isLoading ? 'Saving...' : conflicts.length > 0 ? 'Save Anyway' : 'Save'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this appointment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// Helper function
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
