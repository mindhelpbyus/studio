import { Appointment, Therapist, Client } from '../types/appointment';

// Mock data
const mockTherapists: Therapist[] = [
  { id: '1', name: 'Dr. Sarah Johnson', color: '#3b82f6', email: 'sarah@wellness.com' },
  { id: '2', name: 'Dr. Michael Chen', color: '#10b981', email: 'michael@wellness.com' },
  { id: '3', name: 'Dr. Emily Rodriguez', color: '#f59e0b', email: 'emily@wellness.com' },
  { id: '4', name: 'Dr. David Thompson', color: '#ef4444', email: 'david@wellness.com' },
  { id: '5', name: 'Dr. Jessica Williams', color: '#8b5cf6', email: 'jessica@wellness.com' },
  { id: '6', name: 'Dr. Robert Martinez', color: '#ec4899', email: 'robert@wellness.com' },
  { id: '7', name: 'Dr. Lisa Anderson', color: '#06b6d4', email: 'lisa@wellness.com' },
  { id: '8', name: 'Dr. Mark Taylor', color: '#84cc16', email: 'mark@wellness.com' },
];

const mockClients: Client[] = [
  { id: '1', name: 'John Smith', email: 'john@email.com', phone: '555-0123', membershipType: 'Premium' },
  { id: '2', name: 'Emma Wilson', email: 'emma@email.com', phone: '555-0124', membershipType: 'Basic' },
  { id: '3', name: 'James Brown', email: 'james@email.com', phone: '555-0125', membershipType: 'Premium' },
  { id: '4', name: 'Lisa Davis', email: 'lisa@email.com', phone: '555-0126', membershipType: 'Standard' },
  { id: '5', name: 'Robert Miller', email: 'robert@email.com', phone: '555-0127', membershipType: 'Basic' },
];

// Generate mock appointments
const generateMockAppointments = (): Appointment[] => {
  const appointments: Appointment[] = [];
  const today = new Date();
  
  // Generate appointments for the next 30 days
  for (let dayOffset = -7; dayOffset < 30; dayOffset++) {
    const date = new Date(today);
    date.setDate(today.getDate() + dayOffset);
    
    // Skip weekends for most appointments
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    const appointmentsPerDay = Math.floor(Math.random() * 6) + 2; // 2-7 appointments per day
    
    for (let i = 0; i < appointmentsPerDay; i++) {
      const therapist = mockTherapists[Math.floor(Math.random() * mockTherapists.length)];
      const client = mockClients[Math.floor(Math.random() * mockClients.length)];
      
      const startHour = 9 + Math.floor(Math.random() * 8); // 9 AM to 4 PM
      const startMinute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
      const duration = [30, 45, 60, 90][Math.floor(Math.random() * 4)]; // Duration in minutes
      
      const startTime = new Date(date);
      startTime.setHours(startHour, startMinute, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setMinutes(startTime.getMinutes() + duration);
      
      const appointmentTypes = ['appointment', 'appointment', 'appointment', 'break', 'tentative'];
      const type = appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)] as 'appointment' | 'break' | 'tentative';
      
      let title = '';
      let clientName = '';
      
      if (type === 'break') {
        const breakTypes = ['Lunch Break', 'Coffee Break', 'Personal Break', 'Meeting Break'];
        title = breakTypes[Math.floor(Math.random() * breakTypes.length)];
        clientName = '';
      } else if (type === 'tentative') {
        title = `Tentative: ${client.name}`;
        clientName = client.name;
      } else {
        title = `Session with ${client.name}`;
        clientName = client.name;
      }
      
      appointments.push({
        id: `${dayOffset}-${i}-${Date.now()}`,
        therapistId: therapist.id,
        clientId: type !== 'break' ? client.id : undefined,
        title,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        color: type === 'break' ? '#6b7280' : therapist.color,
        type,
        status: Math.random() > 0.2 ? 'confirmed' : 'pending',
        createdBy: Math.random() > 0.7 ? 'patient' : 'therapist',
        notes: type === 'break' ? undefined : `Notes for ${clientName}`,
        clientName,
        therapistName: therapist.name,
      });
    }
  }
  
  return appointments.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
};

let mockAppointments = generateMockAppointments();

// API functions
export const appointmentsApi = {
  async getAppointments(startDate?: string, endDate?: string, therapistIds?: string[]): Promise<Appointment[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    let filtered = [...mockAppointments];
    
    if (startDate) {
      filtered = filtered.filter(apt => apt.startTime >= startDate);
    }
    
    if (endDate) {
      filtered = filtered.filter(apt => apt.startTime <= endDate);
    }
    
    if (therapistIds && therapistIds.length > 0) {
      filtered = filtered.filter(apt => therapistIds.includes(apt.therapistId));
    }
    
    return filtered;
  },

  async createAppointment(appointment: Omit<Appointment, 'id'>): Promise<Appointment> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const newAppointment: Appointment = {
      ...appointment,
      id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    
    mockAppointments.push(newAppointment);
    return newAppointment;
  },

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const index = mockAppointments.findIndex(apt => apt.id === id);
    if (index === -1) {
      throw new Error('Appointment not found');
    }
    
    mockAppointments[index] = { ...mockAppointments[index], ...updates };
    return mockAppointments[index];
  },

  async deleteAppointment(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    mockAppointments = mockAppointments.filter(apt => apt.id !== id);
  },

  async getTherapists(): Promise<Therapist[]> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return [...mockTherapists];
  },

  async getClients(): Promise<Client[]> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return [...mockClients];
  },
};