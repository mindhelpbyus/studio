export type Appointment = {
  id: string;
  providerId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  patientName: string;
};

// Mock available time slots for a given day
export const availableTimeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30',
];

// Using an array to simulate a collection in a database.
const appointments: Appointment[] = [];

export const appointmentsDb = {
  findForProviderByDate: async (providerId: string, date: string): Promise<Appointment[]> => {
    return appointments.filter(a => a.providerId === providerId && a.date === date);
  },

  bookAppointment: async (booking: Omit<Appointment, 'id'>): Promise<Appointment | null> => {
    const existingBooking = appointments.find(
        a => a.providerId === booking.providerId && a.date === booking.date && a.time === booking.time
    );

    if (existingBooking) {
      return null; // Slot is already booked
    }

    const newAppointment: Appointment = {
        id: String(appointments.length + 1),
        ...booking
    };
    appointments.push(newAppointment);
    return newAppointment;
  },

  cancelAppointment: async (id: string): Promise<boolean> => {
    const index = appointments.findIndex(a => a.id === id);
    if (index === -1) {
        return false;
    }
    appointments.splice(index, 1);
    return true;
  },
};
