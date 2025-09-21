export interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: 'patient' | 'provider' | 'admin';
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Provider extends Omit<User, 'role'> {
  role: 'provider';
  specialization: string;
  licenseNumber: string;
  phone: string;
  bio?: string;
  rating?: number;
  availability?: ProviderAvailability[];
}

export interface Patient extends Omit<User, 'role'> {
  role: 'patient';
  phone?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  address?: Address;
  emergencyContact?: EmergencyContact;
}

export interface ProviderAvailability {
  id: string;
  providerId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isActive: boolean;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface Appointment {
  id: string;
  providerId: string;
  patientId: string;
  startTime: Date;
  endTime: Date;
  type: 'consultation' | 'follow-up' | 'emergency' | 'telehealth';
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  notes?: string;
  meetingLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MentalHealthAssessment {
  id: string;
  patientId?: string;
  sessionId?: string;
  responses: AssessmentResponse[];
  score?: number;
  recommendations?: string[];
  createdAt: Date;
}

export interface AssessmentResponse {
  questionId: string;
  answer: string | number | boolean;
}

export interface MentalHealthQuestion {
  id: string;
  text: string;
  type: 'multiple-choice' | 'scale' | 'text' | 'boolean';
  options?: string[];
  category: string;
  weight: number;
  isActive: boolean;
}

// Repository interfaces
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  update(id: string, updates: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
}

export interface ProviderRepository {
  findById(id: string): Promise<Provider | null>;
  findAll(filters?: ProviderFilters): Promise<Provider[]>;
  findBySpecialization(specialization: string): Promise<Provider[]>;
  create(provider: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>): Promise<Provider>;
  update(id: string, updates: Partial<Provider>): Promise<Provider>;
  delete(id: string): Promise<void>;
}

export interface PatientRepository {
  findById(id: string): Promise<Patient | null>;
  findAll(filters?: PatientFilters): Promise<Patient[]>;
  create(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient>;
  update(id: string, updates: Partial<Patient>): Promise<Patient>;
  delete(id: string): Promise<void>;
}

export interface AppointmentRepository {
  findById(id: string): Promise<Appointment | null>;
  findByPatientId(patientId: string): Promise<Appointment[]>;
  findByProviderId(providerId: string): Promise<Appointment[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Appointment[]>;
  create(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment>;
  update(id: string, updates: Partial<Appointment>): Promise<Appointment>;
  delete(id: string): Promise<void>;
}

export interface MentalHealthRepository {
  findById(id: string): Promise<MentalHealthAssessment | null>;
  findByPatientId(patientId: string): Promise<MentalHealthAssessment[]>;
  findBySessionId(sessionId: string): Promise<MentalHealthAssessment | null>;
  create(assessment: Omit<MentalHealthAssessment, 'id' | 'createdAt'>): Promise<MentalHealthAssessment>;
  getQuestions(): Promise<MentalHealthQuestion[]>;
}

// Filter types
export interface ProviderFilters {
  specialization?: string;
  rating?: number;
  availability?: boolean;
  page?: number;
  limit?: number;
}

export interface PatientFilters {
  age?: { min?: number; max?: number };
  gender?: string;
  page?: number;
  limit?: number;
}

// Database connection interface
export interface DatabaseConnection {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
}