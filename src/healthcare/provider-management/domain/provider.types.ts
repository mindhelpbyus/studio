export interface Service {
  id: string;
  name: string;
  duration: number;
  color: string;
  description?: string;
  price?: number;
}

export interface Therapist {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialties?: string[];
  services: Service[];
  availability?: {
    [key: string]: {
      start: string;
      end: string;
    }[];
  };
  profileImage?: string;
}

export interface TherapistSchedule {
  therapistId: string;
  date: string;
  slots: {
    start: string;
    end: string;
    status: 'available' | 'booked' | 'blocked';
  }[];
}