/**
 * @fileoverview API Type Definitions
 * @description Shared type definitions for API requests and responses
 * @compliance TypeScript Best Practices, API Standards
 */

// Base API Response Structure
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
  requestId?: string;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// Error Response Types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  field?: string;
}

export interface ValidationError extends ApiError {
  field: string;
  value?: any;
  constraints: string[];
}

// Authentication Types
export interface AuthRequest {
  email: string;
  password: string;
  mfaToken?: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: string;
    permissions: string[];
    lastLogin?: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  session: {
    id: string;
    expiresAt: string;
  };
}

// Patient API Types
export interface PatientCreateRequest {
  personalInfo: {
    firstName: string;
    lastName: string;
    middleName?: string;
    dateOfBirth: string; // ISO date string
    gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    ssn?: string;
    race?: string;
    ethnicity?: string;
    preferredLanguage?: string;
    maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed' | 'other';
  };
  contactInfo: {
    email: string;
    phone: string;
    alternatePhone?: string;
    address: {
      street: string;
      street2?: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    preferredContactMethod?: 'email' | 'phone' | 'sms' | 'mail';
  };
  emergencyContacts: Array<{
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    isPrimary?: boolean;
  }>;
  insuranceInfo?: {
    primary: InsurancePolicyRequest;
    secondary?: InsurancePolicyRequest;
  };
  consentStatus: {
    treatmentConsent: boolean;
    dataProcessingConsent: boolean;
    marketingConsent: boolean;
    researchConsent: boolean;
  };
  privacyPreferences?: {
    allowDataSharing: boolean;
    allowCommunication: boolean;
    preferredContactMethod: 'email' | 'phone' | 'sms' | 'portal';
  };
}

export interface InsurancePolicyRequest {
  insuranceCompany: string;
  policyNumber: string;
  groupNumber?: string;
  subscriberId: string;
  subscriberName: string;
  subscriberRelationship: 'self' | 'spouse' | 'child' | 'other';
  effectiveDate: string; // ISO date string
  expirationDate?: string; // ISO date string
  copay?: number;
  deductible?: number;
  planType: 'HMO' | 'PPO' | 'EPO' | 'POS' | 'HDHP' | 'other';
}

export interface PatientResponse {
  id: string;
  patientId: string;
  mrn: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    middleName?: string;
    dateOfBirth: string;
    gender: string;
    age?: number;
    // Sensitive fields like SSN excluded from standard response
  };
  contactInfo: {
    email: string;
    phone: string;
    // Address may be included based on access level
    address?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  consentStatus: {
    treatmentConsent: boolean;
    dataProcessingConsent: boolean;
    marketingConsent: boolean;
    researchConsent: boolean;
    consentDate: string;
    consentVersion: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastVisit?: string;
}

export interface PatientSearchParams {
  mrn?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  isActive?: boolean;
  providerId?: string;
}

// Provider API Types
export interface ProviderResponse {
  id: string;
  providerId: string;
  npi: string; // National Provider Identifier
  personalInfo: {
    firstName: string;
    lastName: string;
    title: string;
    credentials: string[];
  };
  professionalInfo: {
    specialty: string;
    subSpecialties: string[];
    licenseNumber: string;
    licenseState: string;
    boardCertifications: string[];
  };
  contactInfo: {
    email: string;
    phone: string;
    officeAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
  };
  availability: {
    schedule: WeeklySchedule;
    timeZone: string;
  };
  isActive: boolean;
  acceptingNewPatients: boolean;
}

export interface WeeklySchedule {
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
}

export interface DaySchedule {
  isAvailable: boolean;
  shifts: Array<{
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
    appointmentDuration: number; // minutes
  }>;
}

// Appointment API Types
export interface AppointmentCreateRequest {
  patientId: string;
  providerId: string;
  appointmentType: 'consultation' | 'follow-up' | 'procedure' | 'telehealth' | 'emergency';
  scheduledDateTime: string; // ISO datetime string
  duration: number; // minutes
  reason: string;
  notes?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  isVirtual: boolean;
  reminderPreferences?: {
    email: boolean;
    sms: boolean;
    hoursBeforeAppointment: number[];
  };
}

export interface AppointmentResponse {
  id: string;
  appointmentId: string;
  patient: {
    id: string;
    name: string;
    mrn: string;
  };
  provider: {
    id: string;
    name: string;
    title: string;
    specialty: string;
  };
  scheduledDateTime: string;
  duration: number;
  appointmentType: string;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  reason: string;
  notes?: string;
  isVirtual: boolean;
  virtualMeetingUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Health Check API Types
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  checks: Array<{
    name: string;
    status: 'pass' | 'warn' | 'fail';
    responseTime: number;
    message?: string;
    details?: Record<string, any>;
  }>;
  overallScore: number;
  responseTime: number;
}

// Compliance API Types
export interface ComplianceCheckResponse {
  isCompliant: boolean;
  complianceScore: number;
  violations: Array<{
    standard: string;
    rule: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    remediation: string;
  }>;
  warnings: Array<{
    standard: string;
    rule: string;
    description: string;
    recommendation: string;
  }>;
  timestamp: string;
  checkType: string;
}

// Audit API Types
export interface AuditLogResponse {
  eventId: string;
  eventType: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  resourceType?: string;
  resourceId?: string;
  action: string;
  outcome: 'SUCCESS' | 'FAILURE' | 'WARNING';
  ipAddress?: string;
  userAgent?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  details?: Record<string, any>;
}

export interface AuditSearchParams {
  eventType?: string;
  userId?: string;
  resourceType?: string;
  resourceId?: string;
  action?: string;
  outcome?: 'SUCCESS' | 'FAILURE' | 'WARNING';
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

// File Upload Types
export interface FileUploadResponse {
  fileId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  url?: string; // May be excluded for security
  metadata?: Record<string, any>;
}

// Notification Types
export interface NotificationResponse {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  expiresAt?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

// WebSocket Message Types
export interface WebSocketMessage<T = any> {
  type: string;
  payload: T;
  timestamp: string;
  messageId: string;
}

export interface RealTimeUpdate extends WebSocketMessage {
  type: 'appointment_update' | 'patient_update' | 'system_alert' | 'compliance_alert';
  payload: {
    resourceId: string;
    resourceType: string;
    action: string;
    data: any;
  };
}

// Export all types for easy importing
export type {
  ApiResponse,
  PaginationParams,
  PaginatedResponse,
  ApiError,
  ValidationError,
  AuthRequest,
  AuthResponse,
  PatientCreateRequest,
  PatientResponse,
  PatientSearchParams,
  ProviderResponse,
  AppointmentCreateRequest,
  AppointmentResponse,
  HealthCheckResponse,
  ComplianceCheckResponse,
  AuditLogResponse,
  AuditSearchParams,
  FileUploadResponse,
  NotificationResponse,
  WebSocketMessage,
  RealTimeUpdate
};