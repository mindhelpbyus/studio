/**
 * @fileoverview Healthcare-Specific Error Definitions
 * @description Custom error classes for healthcare domain
 * @compliance HIPAA, Error Handling Standards
 */

// Base Healthcare Error
export abstract class HealthcareError extends Error {
  public readonly code: string;
  public readonly severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  public readonly isOperational: boolean;
  public readonly timestamp: Date;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    code: string,
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM',
    context?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.severity = severity;
    this.isOperational = true;
    this.timestamp = new Date();
    this.context = context;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

// Patient-Related Errors
export class PatientNotFoundError extends HealthcareError {
  constructor(patientId: string, context?: Record<string, any>) {
    super(
      `Patient not found: ${patientId}`,
      'PATIENT_NOT_FOUND',
      'MEDIUM',
      { patientId, ...context }
    );
  }
}

export class PatientValidationError extends HealthcareError {
  constructor(field: string, value: any, constraint: string, context?: Record<string, any>) {
    super(
      `Patient validation failed for field '${field}': ${constraint}`,
      'PATIENT_VALIDATION_ERROR',
      'MEDIUM',
      { field, value, constraint, ...context }
    );
  }
}

export class DuplicatePatientError extends HealthcareError {
  constructor(identifier: string, identifierType: string, context?: Record<string, any>) {
    super(
      `Duplicate patient found with ${identifierType}: ${identifier}`,
      'DUPLICATE_PATIENT',
      'HIGH',
      { identifier, identifierType, ...context }
    );
  }
}

export class PatientConsentError extends HealthcareError {
  constructor(consentType: string, patientId: string, context?: Record<string, any>) {
    super(
      `Patient consent required for ${consentType}`,
      'PATIENT_CONSENT_REQUIRED',
      'HIGH',
      { consentType, patientId, ...context }
    );
  }
}

// Provider-Related Errors
export class ProviderNotFoundError extends HealthcareError {
  constructor(providerId: string, context?: Record<string, any>) {
    super(
      `Provider not found: ${providerId}`,
      'PROVIDER_NOT_FOUND',
      'MEDIUM',
      { providerId, ...context }
    );
  }
}

export class ProviderUnavailableError extends HealthcareError {
  constructor(providerId: string, requestedTime: Date, context?: Record<string, any>) {
    super(
      `Provider ${providerId} is not available at ${requestedTime.toISOString()}`,
      'PROVIDER_UNAVAILABLE',
      'MEDIUM',
      { providerId, requestedTime, ...context }
    );
  }
}

export class ProviderLicenseError extends HealthcareError {
  constructor(providerId: string, licenseIssue: string, context?: Record<string, any>) {
    super(
      `Provider license issue for ${providerId}: ${licenseIssue}`,
      'PROVIDER_LICENSE_ERROR',
      'HIGH',
      { providerId, licenseIssue, ...context }
    );
  }
}

// Appointment-Related Errors
export class AppointmentNotFoundError extends HealthcareError {
  constructor(appointmentId: string, context?: Record<string, any>) {
    super(
      `Appointment not found: ${appointmentId}`,
      'APPOINTMENT_NOT_FOUND',
      'MEDIUM',
      { appointmentId, ...context }
    );
  }
}

export class AppointmentConflictError extends HealthcareError {
  constructor(
    providerId: string,
    conflictingTime: Date,
    existingAppointmentId: string,
    context?: Record<string, any>
  ) {
    super(
      `Appointment conflict for provider ${providerId} at ${conflictingTime.toISOString()}`,
      'APPOINTMENT_CONFLICT',
      'MEDIUM',
      { providerId, conflictingTime, existingAppointmentId, ...context }
    );
  }
}

export class AppointmentCancellationError extends HealthcareError {
  constructor(appointmentId: string, reason: string, context?: Record<string, any>) {
    super(
      `Cannot cancel appointment ${appointmentId}: ${reason}`,
      'APPOINTMENT_CANCELLATION_ERROR',
      'MEDIUM',
      { appointmentId, reason, ...context }
    );
  }
}

// Authentication and Authorization Errors
export class AuthenticationError extends HealthcareError {
  constructor(reason: string, context?: Record<string, any>) {
    super(
      `Authentication failed: ${reason}`,
      'AUTHENTICATION_FAILED',
      'HIGH',
      context
    );
  }
}

export class AuthorizationError extends HealthcareError {
  constructor(userId: string, resource: string, action: string, context?: Record<string, any>) {
    super(
      `User ${userId} not authorized to ${action} ${resource}`,
      'AUTHORIZATION_FAILED',
      'HIGH',
      { userId, resource, action, ...context }
    );
  }
}

export class SessionExpiredError extends HealthcareError {
  constructor(sessionId: string, context?: Record<string, any>) {
    super(
      `Session expired: ${sessionId}`,
      'SESSION_EXPIRED',
      'MEDIUM',
      { sessionId, ...context }
    );
  }
}

export class MFARequiredError extends HealthcareError {
  constructor(userId: string, context?: Record<string, any>) {
    super(
      `Multi-factor authentication required for user: ${userId}`,
      'MFA_REQUIRED',
      'HIGH',
      { userId, ...context }
    );
  }
}

// Compliance and Security Errors
export class ComplianceViolationError extends HealthcareError {
  constructor(
    standard: string,
    rule: string,
    violation: string,
    context?: Record<string, any>
  ) {
    super(
      `${standard} compliance violation - ${rule}: ${violation}`,
      'COMPLIANCE_VIOLATION',
      'CRITICAL',
      { standard, rule, violation, ...context }
    );
  }
}

export class DataEncryptionError extends HealthcareError {
  constructor(operation: string, dataType: string, context?: Record<string, any>) {
    super(
      `Data encryption failed during ${operation} for ${dataType}`,
      'DATA_ENCRYPTION_ERROR',
      'CRITICAL',
      { operation, dataType, ...context }
    );
  }
}

export class AuditLogError extends HealthcareError {
  constructor(eventType: string, reason: string, context?: Record<string, any>) {
    super(
      `Audit logging failed for ${eventType}: ${reason}`,
      'AUDIT_LOG_ERROR',
      'CRITICAL',
      { eventType, reason, ...context }
    );
  }
}

export class PHIAccessViolationError extends HealthcareError {
  constructor(
    userId: string,
    patientId: string,
    accessType: string,
    context?: Record<string, any>
  ) {
    super(
      `Unauthorized PHI access attempt by ${userId} for patient ${patientId}`,
      'PHI_ACCESS_VIOLATION',
      'CRITICAL',
      { userId, patientId, accessType, ...context }
    );
  }
}

// Data and Database Errors
export class DatabaseConnectionError extends HealthcareError {
  constructor(database: string, reason: string, context?: Record<string, any>) {
    super(
      `Database connection failed for ${database}: ${reason}`,
      'DATABASE_CONNECTION_ERROR',
      'CRITICAL',
      { database, reason, ...context }
    );
  }
}

export class DataIntegrityError extends HealthcareError {
  constructor(
    table: string,
    recordId: string,
    integrityCheck: string,
    context?: Record<string, any>
  ) {
    super(
      `Data integrity violation in ${table} for record ${recordId}: ${integrityCheck}`,
      'DATA_INTEGRITY_ERROR',
      'HIGH',
      { table, recordId, integrityCheck, ...context }
    );
  }
}

export class ConcurrencyError extends HealthcareError {
  constructor(resource: string, resourceId: string, context?: Record<string, any>) {
    super(
      `Concurrency conflict for ${resource} ${resourceId}`,
      'CONCURRENCY_ERROR',
      'MEDIUM',
      { resource, resourceId, ...context }
    );
  }
}

// External Service Errors
export class ExternalServiceError extends HealthcareError {
  constructor(service: string, operation: string, reason: string, context?: Record<string, any>) {
    super(
      `External service error - ${service} ${operation}: ${reason}`,
      'EXTERNAL_SERVICE_ERROR',
      'HIGH',
      { service, operation, reason, ...context }
    );
  }
}

export class PaymentProcessingError extends HealthcareError {
  constructor(
    transactionId: string,
    paymentMethod: string,
    reason: string,
    context?: Record<string, any>
  ) {
    super(
      `Payment processing failed for transaction ${transactionId}: ${reason}`,
      'PAYMENT_PROCESSING_ERROR',
      'HIGH',
      { transactionId, paymentMethod, reason, ...context }
    );
  }
}

export class InsuranceVerificationError extends HealthcareError {
  constructor(
    patientId: string,
    insuranceId: string,
    reason: string,
    context?: Record<string, any>
  ) {
    super(
      `Insurance verification failed for patient ${patientId}: ${reason}`,
      'INSURANCE_VERIFICATION_ERROR',
      'MEDIUM',
      { patientId, insuranceId, reason, ...context }
    );
  }
}

// Business Logic Errors
export class BusinessRuleViolationError extends HealthcareError {
  constructor(rule: string, violation: string, context?: Record<string, any>) {
    super(
      `Business rule violation - ${rule}: ${violation}`,
      'BUSINESS_RULE_VIOLATION',
      'MEDIUM',
      { rule, violation, ...context }
    );
  }
}

export class WorkflowError extends HealthcareError {
  constructor(
    workflow: string,
    step: string,
    reason: string,
    context?: Record<string, any>
  ) {
    super(
      `Workflow error in ${workflow} at step ${step}: ${reason}`,
      'WORKFLOW_ERROR',
      'MEDIUM',
      { workflow, step, reason, ...context }
    );
  }
}

// Configuration and System Errors
export class ConfigurationError extends HealthcareError {
  constructor(component: string, setting: string, context?: Record<string, any>) {
    super(
      `Configuration error in ${component}: ${setting}`,
      'CONFIGURATION_ERROR',
      'HIGH',
      { component, setting, ...context }
    );
  }
}

export class SystemUnavailableError extends HealthcareError {
  constructor(system: string, reason: string, context?: Record<string, any>) {
    super(
      `System unavailable - ${system}: ${reason}`,
      'SYSTEM_UNAVAILABLE',
      'CRITICAL',
      { system, reason, ...context }
    );
  }
}

// Rate Limiting and Performance Errors
export class RateLimitExceededError extends HealthcareError {
  constructor(userId: string, limit: number, timeWindow: string, context?: Record<string, any>) {
    super(
      `Rate limit exceeded for user ${userId}: ${limit} requests per ${timeWindow}`,
      'RATE_LIMIT_EXCEEDED',
      'MEDIUM',
      { userId, limit, timeWindow, ...context }
    );
  }
}

export class PerformanceThresholdError extends HealthcareError {
  constructor(
    operation: string,
    threshold: number,
    actual: number,
    context?: Record<string, any>
  ) {
    super(
      `Performance threshold exceeded for ${operation}: ${actual}ms > ${threshold}ms`,
      'PERFORMANCE_THRESHOLD_EXCEEDED',
      'MEDIUM',
      { operation, threshold, actual, ...context }
    );
  }
}

// Error Factory for creating errors from error codes
export class HealthcareErrorFactory {
  static createError(
    code: string,
    message: string,
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM',
    context?: Record<string, any>
  ): HealthcareError {
    switch (code) {
      case 'PATIENT_NOT_FOUND':
        return new PatientNotFoundError(context?.patientId || 'unknown', context);
      case 'PROVIDER_NOT_FOUND':
        return new ProviderNotFoundError(context?.providerId || 'unknown', context);
      case 'APPOINTMENT_NOT_FOUND':
        return new AppointmentNotFoundError(context?.appointmentId || 'unknown', context);
      case 'AUTHENTICATION_FAILED':
        return new AuthenticationError(message, context);
      case 'AUTHORIZATION_FAILED':
        return new AuthorizationError(
          context?.userId || 'unknown',
          context?.resource || 'unknown',
          context?.action || 'unknown',
          context
        );
      case 'COMPLIANCE_VIOLATION':
        return new ComplianceViolationError(
          context?.standard || 'unknown',
          context?.rule || 'unknown',
          message,
          context
        );
      default:
        // Generic healthcare error for unknown codes
        return new (class extends HealthcareError {
          constructor() {
            super(message, code, severity, context);
          }
        })();
    }
  }
}

// Error Handler Utility
export class HealthcareErrorHandler {
  static isHealthcareError(error: any): error is HealthcareError {
    return error instanceof HealthcareError;
  }

  static isCriticalError(error: HealthcareError): boolean {
    return error.severity === 'CRITICAL';
  }

  static shouldRetry(error: HealthcareError): boolean {
    // Don't retry authentication, authorization, or validation errors
    const nonRetryableCodes = [
      'AUTHENTICATION_FAILED',
      'AUTHORIZATION_FAILED',
      'PATIENT_VALIDATION_ERROR',
      'COMPLIANCE_VIOLATION',
      'PHI_ACCESS_VIOLATION'
    ];
    
    return !nonRetryableCodes.includes(error.code);
  }

  static getHttpStatusCode(error: HealthcareError): number {
    switch (error.code) {
      case 'PATIENT_NOT_FOUND':
      case 'PROVIDER_NOT_FOUND':
      case 'APPOINTMENT_NOT_FOUND':
        return 404;
      
      case 'AUTHENTICATION_FAILED':
        return 401;
      
      case 'AUTHORIZATION_FAILED':
      case 'PHI_ACCESS_VIOLATION':
      case 'COMPLIANCE_VIOLATION':
        return 403;
      
      case 'PATIENT_VALIDATION_ERROR':
      case 'BUSINESS_RULE_VIOLATION':
        return 400;
      
      case 'APPOINTMENT_CONFLICT':
      case 'DUPLICATE_PATIENT':
        return 409;
      
      case 'RATE_LIMIT_EXCEEDED':
        return 429;
      
      case 'SYSTEM_UNAVAILABLE':
      case 'DATABASE_CONNECTION_ERROR':
        return 503;
      
      default:
        return 500;
    }
  }
}

// Export all error classes and utilities
export {
  HealthcareError,
  HealthcareErrorFactory,
  HealthcareErrorHandler
};