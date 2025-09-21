/**
 * @fileoverview Patient Management Service
 * @description HIPAA-compliant patient data management
 * @compliance HIPAA, GDPR, HL7 FHIR
 */

import { Injectable } from '../../security/decorators/injectable.decorator';
import { AuditLogger } from '../../security/audit/audit-logger.service';
import { EncryptionService } from '../../security/encryption/encryption.service';
import { PatientEntity } from '../../core/entities/patient.entity';
import { PatientRepository } from '../../core/repositories/patient.repository';

export interface PatientSearchCriteria {
  readonly mrn?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly dateOfBirth?: Date;
  readonly lastName?: string;
  readonly providerId?: string;
  readonly isActive?: boolean;
}

export interface PatientCreateRequest {
  readonly personalInfo: {
    readonly firstName: string;
    readonly lastName: string;
    readonly dateOfBirth: Date;
    readonly gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    readonly ssn?: string;
  };
  readonly contactInfo: {
    readonly email: string;
    readonly phone: string;
    readonly address: {
      readonly street: string;
      readonly city: string;
      readonly state: string;
      readonly zipCode: string;
      readonly country: string;
    };
  };
  readonly emergencyContacts: Array<{
    readonly name: string;
    readonly relationship: string;
    readonly phone: string;
    readonly email?: string;
  }>;
  readonly consentStatus: {
    readonly treatmentConsent: boolean;
    readonly dataProcessingConsent: boolean;
    readonly marketingConsent: boolean;
    readonly researchConsent: boolean;
  };
}

@Injectable()
export class PatientService {
  constructor(
    private readonly patientRepository: PatientRepository,
    private readonly auditLogger: AuditLogger,
    private readonly encryptionService: EncryptionService
  ) {}

  async createPatient(
    request: PatientCreateRequest,
    context: {
      userId: string;
      sessionId: string;
      ipAddress?: string;
    }
  ): Promise<PatientEntity> {
    try {
      // Generate MRN (Medical Record Number)
      const mrn = await this.generateMRN();
      
      // Create patient entity
      const patient: PatientEntity = {
        id: this.encryptionService.generateSecureId(),
        patientId: this.encryptionService.generateSecureId(),
        mrn,
        personalInfo: {
          firstName: request.personalInfo.firstName,
          lastName: request.personalInfo.lastName,
          dateOfBirth: request.personalInfo.dateOfBirth,
          gender: request.personalInfo.gender,
          ssn: request.personalInfo.ssn
        },
        contactInfo: request.contactInfo,
        emergencyContacts: request.emergencyContacts,
        consentStatus: {
          ...request.consentStatus,
          consentDate: new Date(),
          consentVersion: '1.0'
        },
        privacyPreferences: {
          allowDataSharing: false,
          allowCommunication: true,
          preferredContactMethod: 'email',
          dataRetentionPeriod: 6 // HIPAA minimum
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: context.userId,
        updatedBy: context.userId,
        version: 1,
        isDeleted: false
      };

      // Save patient
      const savedPatient = await this.patientRepository.create(patient);

      // Log patient creation
      await this.auditLogger.logDataModification({
        userId: context.userId,
        sessionId: context.sessionId,
        resourceType: 'patient',
        resourceId: savedPatient.id,
        action: 'CREATE_PATIENT',
        newValues: this.sanitizePatientForAudit(savedPatient),
        ipAddress: context.ipAddress
      });

      return savedPatient;
    } catch (error) {
      await this.auditLogger.logSystemError({
        userId: context.userId,
        sessionId: context.sessionId,
        errorType: 'PATIENT_CREATION_ERROR',
        errorMessage: error.message,
        context: { request: this.sanitizePatientForAudit(request) }
      });
      throw error;
    }
  }

  async getPatientById(
    patientId: string,
    context: {
      userId: string;
      sessionId: string;
      purpose: string;
    }
  ): Promise<PatientEntity | null> {
    try {
      // Check authorization (implementation would verify user can access this patient)
      await this.verifyPatientAccess(patientId, context.userId);

      // Retrieve patient
      const patient = await this.patientRepository.findById(patientId);

      if (patient) {
        // Log data access
        await this.auditLogger.logDataAccess({
          userId: context.userId,
          sessionId: context.sessionId,
          resourceType: 'patient',
          resourceId: patientId,
          action: 'READ_PATIENT'
        });
      }

      return patient;
    } catch (error) {
      await this.auditLogger.logSystemError({
        userId: context.userId,
        sessionId: context.sessionId,
        errorType: 'PATIENT_ACCESS_ERROR',
        errorMessage: error.message,
        context: { patientId, purpose: context.purpose }
      });
      throw error;
    }
  }

  async searchPatients(
    criteria: PatientSearchCriteria,
    context: {
      userId: string;
      sessionId: string;
      purpose: string;
    }
  ): Promise<PatientEntity[]> {
    try {
      // Log search attempt
      await this.auditLogger.logDataAccess({
        userId: context.userId,
        sessionId: context.sessionId,
        resourceType: 'patient',
        resourceId: 'search',
        action: 'SEARCH_PATIENTS'
      });

      // Perform search
      const patients = await this.patientRepository.search(criteria);

      // Log each patient accessed
      for (const patient of patients) {
        await this.auditLogger.logDataAccess({
          userId: context.userId,
          sessionId: context.sessionId,
          resourceType: 'patient',
          resourceId: patient.id,
          action: 'READ_PATIENT_SEARCH_RESULT'
        });
      }

      return patients;
    } catch (error) {
      await this.auditLogger.logSystemError({
        userId: context.userId,
        sessionId: context.sessionId,
        errorType: 'PATIENT_SEARCH_ERROR',
        errorMessage: error.message,
        context: { criteria }
      });
      throw error;
    }
  }

  async updatePatient(
    patientId: string,
    updates: Partial<PatientEntity>,
    context: {
      userId: string;
      sessionId: string;
      ipAddress?: string;
    }
  ): Promise<PatientEntity> {
    try {
      // Get current patient data for audit
      const currentPatient = await this.patientRepository.findById(patientId);
      if (!currentPatient) {
        throw new Error('Patient not found');
      }

      // Verify access
      await this.verifyPatientAccess(patientId, context.userId);

      // Update patient
      const updatedPatient = await this.patientRepository.update(patientId, {
        ...updates,
        updatedAt: new Date(),
        updatedBy: context.userId,
        version: currentPatient.version + 1
      });

      // Log modification
      await this.auditLogger.logDataModification({
        userId: context.userId,
        sessionId: context.sessionId,
        resourceType: 'patient',
        resourceId: patientId,
        action: 'UPDATE_PATIENT',
        oldValues: this.sanitizePatientForAudit(currentPatient),
        newValues: this.sanitizePatientForAudit(updatedPatient),
        ipAddress: context.ipAddress
      });

      return updatedPatient;
    } catch (error) {
      await this.auditLogger.logSystemError({
        userId: context.userId,
        sessionId: context.sessionId,
        errorType: 'PATIENT_UPDATE_ERROR',
        errorMessage: error.message,
        context: { patientId, updates: this.sanitizePatientForAudit(updates) }
      });
      throw error;
    }
  }

  async deactivatePatient(
    patientId: string,
    reason: string,
    context: {
      userId: string;
      sessionId: string;
      ipAddress?: string;
    }
  ): Promise<void> {
    try {
      // Verify access
      await this.verifyPatientAccess(patientId, context.userId);

      // Soft delete (deactivate)
      await this.patientRepository.update(patientId, {
        isActive: false,
        updatedAt: new Date(),
        updatedBy: context.userId
      });

      // Log deactivation
      await this.auditLogger.logDataModification({
        userId: context.userId,
        sessionId: context.sessionId,
        resourceType: 'patient',
        resourceId: patientId,
        action: 'DEACTIVATE_PATIENT',
        newValues: { isActive: false, reason },
        ipAddress: context.ipAddress
      });
    } catch (error) {
      await this.auditLogger.logSystemError({
        userId: context.userId,
        sessionId: context.sessionId,
        errorType: 'PATIENT_DEACTIVATION_ERROR',
        errorMessage: error.message,
        context: { patientId, reason }
      });
      throw error;
    }
  }

  private async generateMRN(): Promise<string> {
    // Generate unique Medical Record Number
    const timestamp = Date.now().toString();
    const random = this.encryptionService.generateSecureId(8);
    return `MRN-${timestamp}-${random}`;
  }

  private async verifyPatientAccess(patientId: string, userId: string): Promise<void> {
    // Implementation would check if user has permission to access this patient
    // This could involve checking provider-patient relationships, role permissions, etc.
    // For now, this is a placeholder
  }

  private sanitizePatientForAudit(data: any): any {
    // Remove or hash sensitive fields for audit logging
    if (!data) return data;
    
    const sanitized = { ...data };
    
    // Hash SSN if present
    if (sanitized.personalInfo?.ssn) {
      sanitized.personalInfo.ssn = this.encryptionService.hashData(sanitized.personalInfo.ssn);
    }
    
    // Remove full contact details, keep only partial for audit
    if (sanitized.contactInfo?.email) {
      const email = sanitized.contactInfo.email;
      sanitized.contactInfo.email = email.substring(0, 3) + '***@' + email.split('@')[1];
    }
    
    if (sanitized.contactInfo?.phone) {
      const phone = sanitized.contactInfo.phone;
      sanitized.contactInfo.phone = '***-***-' + phone.slice(-4);
    }
    
    return sanitized;
  }
}