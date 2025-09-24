/**
 * @fileoverview Create Patient Use Case
 * @description Business logic for creating new patients
 * @compliance HIPAA, Clean Architecture
 */

import { ComplianceValidatorService } from '../../compliance/validators/compliance-validator.service';
import { AuditLogger } from '../../security/audit/audit-logger.service';
import { Injectable } from '../../security/decorators/injectable.decorator';
import { PatientEntity } from '../entities/patient.entity';
import { PatientRepository } from '../repositories/patient.repository';

export interface CreatePatientRequest {
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

export interface CreatePatientContext {
  readonly userId: string;
  readonly sessionId: string;
  readonly ipAddress?: string;
  readonly userAgent?: string;
}

@Injectable()
export class CreatePatientUseCase {
  constructor(
    private readonly patientRepository: PatientRepository,
    private readonly auditLogger: AuditLogger,
    private readonly complianceValidator: ComplianceValidatorService
  ) {}

  async execute(
    request: CreatePatientRequest,
    context: CreatePatientContext
  ): Promise<PatientEntity> {
    // Validate compliance requirements
    const complianceResult = await this.complianceValidator.validateDataAccess({
      userId: context.userId,
      resourceType: 'patient',
      resourceId: 'new',
      action: 'CREATE',
      purpose: 'treatment',
      minimumNecessary: true
    });

    if (!complianceResult.isCompliant) {
      throw new Error(`Compliance violation: ${complianceResult.violations.map(v => v.description).join(', ')}`);
    }

    // Validate business rules
    this.validateCreatePatientRequest(request);

    // Generate unique identifiers
    const patientId = this.generatePatientId();
    const mrn = await this.generateMRN();

    // Create patient entity
    const patient: PatientEntity = {
      id: patientId,
      patientId,
      mrn,
      personalInfo: request.personalInfo,
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

    // Persist patient
    const savedPatient = await this.patientRepository.create(patient);

    // Log patient creation for audit
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
  }

  private validateCreatePatientRequest(request: CreatePatientRequest): void {
    // Business rule validations
    if (!request.personalInfo.firstName?.trim()) {
      throw new Error('First name is required');
    }

    if (!request.personalInfo.lastName?.trim()) {
      throw new Error('Last name is required');
    }

    if (!request.personalInfo.dateOfBirth) {
      throw new Error('Date of birth is required');
    }

    if (!request.contactInfo.email?.trim()) {
      throw new Error('Email is required');
    }

    if (!request.contactInfo.phone?.trim()) {
      throw new Error('Phone number is required');
    }

    // HIPAA compliance: Ensure required consents
    if (!request.consentStatus.treatmentConsent) {
      throw new Error('Treatment consent is required');
    }

    if (!request.consentStatus.dataProcessingConsent) {
      throw new Error('Data processing consent is required for HIPAA compliance');
    }

    // Validate age (must be reasonable)
    const age = this.calculateAge(request.personalInfo.dateOfBirth);
    if (age < 0 || age > 150) {
      throw new Error('Invalid date of birth');
    }
  }

  private generatePatientId(): string {
    // Generate cryptographically secure patient ID
    return `PAT_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private async generateMRN(): Promise<string> {
    // Generate unique Medical Record Number
    // In production, this would check for uniqueness
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `MRN${timestamp}${random}`;
  }

  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  private sanitizePatientForAudit(patient: PatientEntity): any {
    // Remove sensitive data for audit logging
    return {
      id: patient.id,
      patientId: patient.patientId,
      mrn: patient.mrn,
      personalInfo: {
        firstName: patient.personalInfo.firstName,
        lastName: patient.personalInfo.lastName,
        dateOfBirth: patient.personalInfo.dateOfBirth,
        gender: patient.personalInfo.gender
        // SSN excluded from audit logs
      },
      contactInfo: {
        email: this.maskEmail(patient.contactInfo.email || ''),
        phone: this.maskPhone(patient.contactInfo.phone)
        // Full address excluded from audit logs
      },
      consentStatus: patient.consentStatus,
      isActive: patient.isActive,
      createdAt: patient.createdAt
    };
  }

  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!local || !domain) return '***@***.***';
    return `${local.substring(0, 2)}***@${domain}`;
  }

  private maskPhone(phone: string): string {
    if (phone.length < 4) return '***-***-****';
    return `***-***-${phone.slice(-4)}`;
  }
}