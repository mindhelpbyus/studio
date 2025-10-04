import React, { useState } from 'react';
import { Appointment, Therapist } from '../types/appointment';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, Button, Badge, Separator } from '@/components/nexus-ui';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  Edit, 
  Trash2, 
  AlertCircle,
  CheckCircle,
  MapPin
} from 'lucide-react';
import { AppointmentForm } from './AppointmentForm';

interface AppointmentPanelProps {
  appointment: Appointment;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (appointmentId: string, updates: Partial<Appointment>) => void;
  onDelete: (appointmentId: string) => void;
  therapists: Therapist[];
}

export function AppointmentPanel({
  appointment,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  therapists,
}: AppointmentPanelProps) {
  const [showEditForm, setShowEditForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const therapist = therapists.find(t => t.id === appointment.therapistId);
  
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
    };
  };

  const getDuration = () => {
    const start = new Date(appointment.startTime);
    const end = new Date(appointment.endTime);
    const minutes = (end.getTime() - start.getTime()) / (1000 * 60);
    
    if (minutes < 60) {
      return `${minutes} minutes`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours} hour${hours > 1 ? 's' : ''}${remainingMinutes > 0 ? ` ${remainingMinutes} minutes` : ''}`;
    }
  };

  const handleStatusToggle = async () => {
    setLoading(true);
    try {
      const newStatus = appointment.status === 'confirmed' ? 'pending' : 'confirmed';
      await onUpdate(appointment.id, { status: newStatus });
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      setLoading(true);
      try {
        await onDelete(appointment.id);
        onClose();
      } catch (error) {
        console.error('Failed to delete appointment:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUpdate = async (updatedAppointment: Omit<Appointment, 'id'>) => {
    setLoading(true);
    try {
      await onUpdate(appointment.id, updatedAppointment);
      setShowEditForm(false);
    } catch (error) {
      console.error('Failed to update appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const startDateTime = formatDateTime(appointment.startTime);
  const endDateTime = formatDateTime(appointment.endTime);

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-96 overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: appointment.color }}
              />
              {appointment.title}
            </SheetTitle>
            <SheetDescription>
              View and manage appointment details
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Status and Type Badges */}
            <div className="flex gap-2 flex-wrap">
              <Badge 
                variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}
                className="flex items-center gap-1"
              >
                {appointment.status === 'confirmed' ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <AlertCircle className="h-3 w-3" />
                )}
                {appointment.status === 'confirmed' ? 'Confirmed' : 'Pending'}
              </Badge>

              {appointment.type === 'break' && (
                <Badge variant="outline">Break</Badge>
              )}

              {appointment.type === 'tentative' && (
                <Badge variant="outline">Tentative</Badge>
              )}

              {appointment.createdBy === 'patient' && (
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Self-booked
                </Badge>
              )}
            </div>

            {/* Date and Time */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">{startDateTime.date}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">
                    {startDateTime.time} - {endDateTime.time}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Duration: {getDuration()}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Therapist Information */}
            {therapist && (
              <div className="space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Therapist
                </h3>
                
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: therapist.color }}
                    />
                    <span className="font-medium">{therapist.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span>{therapist.email}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Client Information (for appointments) */}
            {appointment.type !== 'break' && appointment.clientName && (
              <div className="space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Client
                </h3>
                
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="font-medium mb-2">{appointment.clientName}</div>
                  
                  {/* Mock client details - in real app, this would come from client data */}
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      <span>+1 (555) 123-4567</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      <span>{appointment.clientName?.toLowerCase().replace(' ', '.')}@email.com</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {appointment.notes && (
              <div className="space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Notes
                </h3>
                
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-sm whitespace-pre-wrap">{appointment.notes}</p>
                </div>
              </div>
            )}

            <Separator />

            {/* Actions */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditForm(true)}
                  disabled={loading}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStatusToggle}
                  disabled={loading}
                  className="flex-1"
                >
                  {appointment.status === 'confirmed' ? (
                    <>
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Mark Pending
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm
                    </>
                  )}
                </Button>
              </div>

              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={loading}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Appointment
              </Button>
            </div>

            {/* Metadata */}
            <div className="pt-4 border-t text-xs text-muted-foreground space-y-1">
              <div>Created by: {appointment.createdBy}</div>
              <div>Appointment ID: {appointment.id}</div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Form */}
      {showEditForm && (
        <AppointmentForm
          isOpen={showEditForm}
          onClose={() => setShowEditForm(false)}
          onSave={handleUpdate}
          therapists={therapists}
          editingAppointment={appointment}
        />
      )}
    </>
  );
}