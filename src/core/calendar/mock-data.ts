import { CalendarAppointment } from '@/core/calendar/types/calendar.types';

export const MOCK_APPOINTMENTS: CalendarAppointment[] = [
  {
    id: '1',
    therapistId: 'th1',
    clientId: 'cl1',
    clientName: 'Lisa Brown',
    serviceId: 'srv1',
    serviceName: 'Initial Consultation',
    startTime: new Date(2025, 8, 23, 10, 0),
    endTime: new Date(2025, 8, 23, 11, 0),
    status: 'scheduled',
    type: 'appointment',
    title: 'Initial Consultation',
    patientName: 'Lisa Brown',
    color: 'green'
  },
  {
    id: '2',
    therapistId: 'th1',
    clientId: 'cl2',
    clientName: 'Mike Davis',
    serviceId: 'srv2',
    serviceName: 'Follow-up Session',
    startTime: new Date(2025, 8, 23, 11, 30),
    endTime: new Date(2025, 8, 23, 12, 0),
    status: 'scheduled',
    type: 'appointment',
    title: 'Follow-up Session',
    patientName: 'Mike Davis',
    color: 'blue'
  }
];