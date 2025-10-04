import React, { useState, useEffect } from 'react';
import { Appointment, Therapist, Client } from '../../types/appointment';
import { appointmentsApi } from '@/api/appointments';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea, RadioGroup, RadioGroupItem } from '@/components/nexus-ui';
import { X, Calendar, Clock, User, FileText } from 'lucide-react';

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: Omit<Appointment, 'id'>) => void;
  therapists: Therapist[];
  initialData?: {
    date?: Date;
    time?: string;
    therapistId?: string;
  } | null;
  editingAppointment?: Appointment;
}

export function AppointmentForm({
  isOpen,
  onClose,
  onSave,
  therapists,
  initialData,
  editingAppointment,
}: AppointmentFormProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    therapistId: '',
    clientId: '',
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    type: 'appointment' as 'appointment' | 'break' | 'tentative',
    status: 'confirmed' as 'scheduled' | 'confirmed' | 'pending' | 'cancelled',
    notes: '',
    color: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadClients();
      initializeForm();
    }
  }, [isOpen, initialData, editingAppointment, therapists]); // Added therapists to dependency array

  const loadClients = async () => {
    try {
      const clientsData = await appointmentsApi.getClients();
      setClients(clientsData);
    } catch (error) {
      console.error('Failed to load clients:', error);
    }
  };

  const initializeForm = () => {
    if (editingAppointment) {
      const startDate = editingAppointment.startTime;
      const endDate = editingAppointment.endTime;
      
      setFormData({
        therapistId: editingAppointment.therapistId ?? '',
        clientId: editingAppointment.clientId ?? '',
        title: editingAppointment.title ?? '',
        date: startDate.toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }),
        startTime: startDate.toTimeString().slice(0, 5),
        endTime: endDate.toTimeString().slice(0, 5),
        type: editingAppointment.type,
        status: editingAppointment.status,
        notes: editingAppointment.notes ?? '',
        color: editingAppointment.color ?? '',
      });
    } else {
      const date = initialData?.date || new Date();
      const time = initialData?.time || '09:00';
      const initialTherapistId = initialData?.therapistId;
      
      let finalTherapistId: string;
      if (initialTherapistId) {
        finalTherapistId = initialTherapistId;
      } else if (therapists.length > 0) {
        finalTherapistId = therapists[0]?.id || '';
      } else {
        finalTherapistId = '';
      }
      
      const selectedTherapist = therapists.find(t => t.id === finalTherapistId);
      
      // Calculate end time (default 1 hour later)
      const timeToSplit: string = time;
      const timeParts = timeToSplit.split(':');
      const hours = parseInt(timeParts[0] || '0', 10);
      const minutes = parseInt(timeParts[1] || '0', 10);
      
      const safeHours = isNaN(hours) ? 0 : hours;
      const safeMinutes = isNaN(minutes) ? 0 : minutes;

      const endHours = safeHours + 1;
      const endTime = `${endHours.toString().padStart(2, '0')}:${safeMinutes.toString().padStart(2, '0')}`;
      
      setFormData({
        therapistId: finalTherapistId,
        clientId: '',
        title: '',
        date: date.toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }),
        startTime: time,
        endTime,
        type: 'appointment',
        status: 'confirmed',
        notes: '',
        color: selectedTherapist?.color || '#3b82f6',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.date}T${formData.endTime}`);
      
      const selectedClient = clients.find(c => c.id === formData.clientId);
      const selectedTherapist = therapists.find(t => t.id === formData.therapistId);
      
      const appointmentData = {
        therapistId: formData.therapistId,
        clientId: formData.clientId,
        serviceId: '',
        title: formData.title || (formData.type === 'break' ? 'Break' : `Session with ${selectedClient?.name || 'Client'}`),
        startTime: startDateTime,
        endTime: endDateTime,
        type: formData.type,
        status: formData.status,
        patientName: selectedClient?.name || 'Unknown',
        color: (formData.color || selectedTherapist?.color || '#3b82f6') as string,
        isDraggable: true,
        isResizable: true,
        createdBy: 'therapist',
        notes: formData.notes,
        therapistName: (selectedTherapist?.name ?? '') as string, // Ensure it's always a string
      } as Omit<Appointment, 'id'>;

      await onSave(appointmentData);
      onClose();
    } catch (error) {
      console.error('Failed to save appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Update color when therapist changes
    if (field === 'therapistId') {
      const therapist = therapists.find(t => t.id === value);
      if (therapist) {
        setFormData(prev => ({ ...prev, color: therapist.color }));
      }
    }
  };

  const handleDurationChange = (duration: string) => {
    const [startHours, startMinutes] = formData.startTime.split(':').map(Number);
    const durationMinutes = parseInt(duration);
    
    const endTime = new Date();
    endTime.setHours(Number(startHours ?? 0), Number((startMinutes ?? 0) + durationMinutes), 0, 0);
    
    const endTimeString = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
    setFormData(prev => ({ ...prev, endTime: endTimeString }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {editingAppointment ? 'Edit Appointment' : 'New Appointment'}
          </DialogTitle>
          <DialogDescription>
            {editingAppointment 
              ? 'Update the appointment details below.'
              : 'Fill in the details to create a new appointment.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Appointment Type */}
          <div className="space-y-2">
            <Label>Appointment Type</Label>
            <RadioGroup
              value={formData.type}
              onValueChange={(value: 'appointment' | 'break' | 'tentative') => 
                handleInputChange('type', value)
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="appointment" id="appointment" />
                <Label htmlFor="appointment">Client Appointment</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="break" id="break" />
                <Label htmlFor="break">Break/Lunch</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tentative" id="tentative" />
                <Label htmlFor="tentative">Tentative</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Therapist Selection */}
          <div className="space-y-2">
            <Label htmlFor="therapist">
              <User className="h-4 w-4 inline mr-1" />
              Therapist
            </Label>
            <Select value={formData.therapistId} onValueChange={(value: string) => handleInputChange('therapistId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select therapist" />
              </SelectTrigger>
              <SelectContent>
                {therapists.map(therapist => (
                  <SelectItem key={therapist.id} value={therapist.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: therapist.color }}
                      />
                      {therapist.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Client Selection (only for appointments) */}
          {formData.type === 'appointment' && (
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
            <Select value={formData.clientId} onValueChange={(value: string) => handleInputChange('clientId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                      <div>
                        <div>{client.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {client.membershipType} • {client.phone}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Title (optional override) */}
          <div className="space-y-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder={formData.type === 'break' ? 'Break' : 'Auto-generated from client name'}
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">
                <Clock className="h-4 w-4 inline mr-1" />
                Start Time
              </Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Duration Presets */}
          <div className="space-y-2">
            <Label>Duration</Label>
            <div className="flex gap-2">
              {['30', '45', '60', '90'].map(duration => (
                <Button
                  key={duration}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDurationChange(duration)}
                >
                  {duration}min
                </Button>
              ))}
            </div>
            <Input
              type="time"
              value={formData.endTime}
              onChange={(e) => handleInputChange('endTime', e.target.value)}
              required
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={formData.status} onValueChange={(value: 'confirmed' | 'pending') => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              <FileText className="h-4 w-4 inline mr-1" />
              Notes
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes or instructions..."
              rows={3}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (editingAppointment ? 'Update' : 'Create')} Appointment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
