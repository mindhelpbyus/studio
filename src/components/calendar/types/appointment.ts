export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  therapistId: string;
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  type: string;
  notes?: string;
  duration: number;
}

export interface Therapist {
  id: string;
  name: string;
  specialty: string;
  color: string;
  avatar?: string;
}
