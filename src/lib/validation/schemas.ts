import { z } from 'zod';

// Authentication schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['patient', 'provider'], {
    errorMap: () => ({ message: 'Role must be either patient or provider' })
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Appointment schemas
export const appointmentSchema = z.object({
  providerId: z.string().uuid('Invalid provider ID'),
  patientId: z.string().uuid('Invalid patient ID'),
  startTime: z.string().datetime('Invalid start time'),
  endTime: z.string().datetime('Invalid end time'),
  type: z.enum(['consultation', 'follow-up', 'emergency', 'telehealth']),
  notes: z.string().optional(),
  status: z.enum(['scheduled', 'confirmed', 'cancelled', 'completed']).default('scheduled'),
}).refine((data) => new Date(data.endTime) > new Date(data.startTime), {
  message: "End time must be after start time",
  path: ["endTime"],
});

export const updateAppointmentSchema = appointmentSchema.partial().extend({
  id: z.string().uuid('Invalid appointment ID'),
});

// Provider schemas
export const providerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  specialization: z.string().min(1, 'Specialization is required'),
  licenseNumber: z.string().min(1, 'License number is required'),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number'),
  bio: z.string().optional(),
  availability: z.array(z.object({
    dayOfWeek: z.number().min(0).max(6),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  })).optional(),
});

// Patient schemas
export const patientSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number'),
  dateOfBirth: z.string().date('Invalid date of birth'),
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']).optional(),
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
    country: z.string().min(1, 'Country is required'),
  }).optional(),
  emergencyContact: z.object({
    name: z.string().min(1, 'Emergency contact name is required'),
    phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number'),
    relationship: z.string().min(1, 'Relationship is required'),
  }).optional(),
});

// Mental health assessment schema
export const mentalHealthAssessmentSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID').optional(),
  responses: z.array(z.object({
    questionId: z.string(),
    answer: z.union([z.string(), z.number(), z.boolean()]),
  })),
  sessionId: z.string().optional(),
});

// Common validation helpers
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type AppointmentInput = z.infer<typeof appointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type ProviderInput = z.infer<typeof providerSchema>;
export type PatientInput = z.infer<typeof patientSchema>;
export type MentalHealthAssessmentInput = z.infer<typeof mentalHealthAssessmentSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type IdParam = z.infer<typeof idParamSchema>;