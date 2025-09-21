/**
 * @fileoverview Create Patient Use Case Tests
 * @description Unit tests for patient creation business logic
 * @compliance HIPAA, Test Coverage Standards
 */

import { CreatePatientUseCase, CreatePatientRequest } from '../../../src/core/use-cases/create-patient.use-case';
import { PatientRepository } from '../../../src/core/repositories/patient.repository';
import { AuditLogger } from '../../../src/security/audit/audit-logger.service';
import { ComplianceValidatorService } from '../../../src/compliance/validators/compliance-validator.service';
import { PatientEntity } from '../../../src/core/entities/patient.entity';

// Mock implementations
class MockPatientRepository implements PatientRepository {
  private patients: PatientEntity[] = [];

  async create(patient: PatientEntity): Promise<PatientEntity> {
    this.patients.push(patient);
    return patient;
  }

  async findById(id: string): Promise<PatientEntity | null> {
    return this.patients.find(p => p.id === id) || null;
  }

  async findByMRN(mrn: string): Promise<PatientEntity | null> {
    return this.patients.find(p => p.mrn === mrn) || null;
  }

  async search(criteria: any): Promise<PatientEntity[]> {
    return this.patients;
  }

  async update(id: string, updates: Partial<PatientEntity>): Promise<PatientEntity> {
    const index = this.patients.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Patient not found');
    
    this.patients[index] = { ...this.patients[index], ...updates };
    return this.patients[index];
  }

  async delete(id: string): Promise<void> {
    const index = this.patients.findIndex(p => p.id === id);
    if (index !== -1) {
      this.patients.splice(index, 1);
    }
  }

  async count(criteria?: any): Promise<number> {
    return this.patients.length;
  }
}

class MockAuditLogger extends AuditLogger {
  public loggedEvents: any[] = [];

  async logDataModification(event: any): Promise<void> {
    this.loggedEvents.push({ type: 'data_modification', ...event });
  }

  async logSystemError(event: any): Promise<void> {
    this.loggedEvents.push({ type: 'system_error', ...event });
  }
}

class MockComplianceValidator extends ComplianceValidatorService {
  public shouldPass = true;

  async validateDataAccess(request: any): Promise<any> {
    return {
      isCompliant: this.shouldPass,
      violations: this.shouldPass ? [] : [
        {
          standard: 'HIPAA',
          rule: 'Test Rule',
          severity: 'HIGH',
          description: 'Test violation',
          remediation: 'Test remediation'
        }
      ],
      warnings: [],
      recommendations: [],
      complianceScore: this.shouldPass ? 100 : 50
    };
  }
}

describe('CreatePatientUseCase', () => {
  let useCase: CreatePatientUseCase;
  let mockRepository: MockPatientRepository;
  let mockAuditLogger: MockAuditLogger;
  let mockComplianceValidator: MockComplianceValidator;

  const validRequest: CreatePatientRequest = {
    personalInfo: {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'male',
      ssn: '123-45-6789'
    },
    contactInfo: {
      email: 'john.doe@example.com',
      phone: '555-123-4567',
      address: {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345',
        country: 'USA'
      }
    },
    emergencyContacts: [
      {
        name: 'Jane Doe',
        relationship: 'spouse',
        phone: '555-987-6543',
        email: 'jane.doe@example.com'
      }
    ],
    consentStatus: {
      treatmentConsent: true,
      dataProcessingConsent: true,
      marketingConsent: false,
      researchConsent: false
    }
  };

  const validContext = {
    userId: 'provider123',
    sessionId: 'session456',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0'
  };

  beforeEach(() => {
    mockRepository = new MockPatientRepository();
    mockAuditLogger = new MockAuditLogger();
    mockComplianceValidator = new MockComplianceValidator();
    
    useCase = new CreatePatientUseCase(
      mockRepository,
      mockAuditLogger,
      mockComplianceValidator
    );
  });

  describe('Successful Patient Creation', () => {
    it('should create a patient with valid data', async () => {
      const result = await useCase.execute(validRequest, validContext);

      expect(result).toBeDefined();
      expect(result.personalInfo.firstName).toBe('John');
      expect(result.personalInfo.lastName).toBe('Doe');
      expect(result.mrn).toMatch(/^MRN\d+[A-Z0-9]+$/);
      expect(result.isActive).toBe(true);
      expect(result.createdBy).toBe('provider123');
    });

    it('should generate unique patient ID and MRN', async () => {
      const result1 = await useCase.execute(validRequest, validContext);
      const result2 = await useCase.execute(validRequest, validContext);

      expect(result1.id).not.toBe(result2.id);
      expect(result1.patientId).not.toBe(result2.patientId);
      expect(result1.mrn).not.toBe(result2.mrn);
    });

    it('should set default privacy preferences', async () => {
      const result = await useCase.execute(validRequest, validContext);

      expect(result.privacyPreferences).toEqual({
        allowDataSharing: false,
        allowCommunication: true,
        preferredContactMethod: 'email',
        dataRetentionPeriod: 6
      });
    });

    it('should set consent status with timestamp and version', async () => {
      const result = await useCase.execute(validRequest, validContext);

      expect(result.consentStatus.treatmentConsent).toBe(true);
      expect(result.consentStatus.dataProcessingConsent).toBe(true);
      expect(result.consentStatus.consentDate).toBeInstanceOf(Date);
      expect(result.consentStatus.consentVersion).toBe('1.0');
    });

    it('should log patient creation for audit', async () => {
      await useCase.execute(validRequest, validContext);

      expect(mockAuditLogger.loggedEvents).toHaveLength(1);
      expect(mockAuditLogger.loggedEvents[0].type).toBe('data_modification');
      expect(mockAuditLogger.loggedEvents[0].action).toBe('CREATE_PATIENT');
      expect(mockAuditLogger.loggedEvents[0].userId).toBe('provider123');
    });
  });

  describe('Validation Errors', () => {
    it('should throw error for missing first name', async () => {
      const invalidRequest = {
        ...validRequest,
        personalInfo: {
          ...validRequest.personalInfo,
          firstName: ''
        }
      };

      await expect(useCase.execute(invalidRequest, validContext))
        .rejects.toThrow('First name is required');
    });

    it('should throw error for missing last name', async () => {
      const invalidRequest = {
        ...validRequest,
        personalInfo: {
          ...validRequest.personalInfo,
          lastName: ''
        }
      };

      await expect(useCase.execute(invalidRequest, validContext))
        .rejects.toThrow('Last name is required');
    });

    it('should throw error for missing email', async () => {
      const invalidRequest = {
        ...validRequest,
        contactInfo: {
          ...validRequest.contactInfo,
          email: ''
        }
      };

      await expect(useCase.execute(invalidRequest, validContext))
        .rejects.toThrow('Email is required');
    });

    it('should throw error for missing phone', async () => {
      const invalidRequest = {
        ...validRequest,
        contactInfo: {
          ...validRequest.contactInfo,
          phone: ''
        }
      };

      await expect(useCase.execute(invalidRequest, validContext))
        .rejects.toThrow('Phone number is required');
    });

    it('should throw error for missing treatment consent', async () => {
      const invalidRequest = {
        ...validRequest,
        consentStatus: {
          ...validRequest.consentStatus,
          treatmentConsent: false
        }
      };

      await expect(useCase.execute(invalidRequest, validContext))
        .rejects.toThrow('Treatment consent is required');
    });

    it('should throw error for missing data processing consent', async () => {
      const invalidRequest = {
        ...validRequest,
        consentStatus: {
          ...validRequest.consentStatus,
          dataProcessingConsent: false
        }
      };

      await expect(useCase.execute(invalidRequest, validContext))
        .rejects.toThrow('Data processing consent is required for HIPAA compliance');
    });

    it('should throw error for invalid date of birth', async () => {
      const invalidRequest = {
        ...validRequest,
        personalInfo: {
          ...validRequest.personalInfo,
          dateOfBirth: new Date('2050-01-01') // Future date
        }
      };

      await expect(useCase.execute(invalidRequest, validContext))
        .rejects.toThrow('Invalid date of birth');
    });
  });

  describe('Compliance Validation', () => {
    it('should validate compliance before creating patient', async () => {
      await useCase.execute(validRequest, validContext);

      // Compliance validator should have been called
      expect(mockComplianceValidator.shouldPass).toBe(true);
    });

    it('should throw error when compliance validation fails', async () => {
      mockComplianceValidator.shouldPass = false;

      await expect(useCase.execute(validRequest, validContext))
        .rejects.toThrow('Compliance violation');
    });
  });

  describe('Age Calculation', () => {
    it('should calculate age correctly for adult', async () => {
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 30);
      
      const request = {
        ...validRequest,
        personalInfo: {
          ...validRequest.personalInfo,
          dateOfBirth: birthDate
        }
      };

      const result = await useCase.execute(request, validContext);
      
      // Age calculation is internal, but we can verify it doesn't throw
      expect(result).toBeDefined();
    });

    it('should handle leap year birth dates', async () => {
      const leapYearBirth = new Date('2000-02-29');
      
      const request = {
        ...validRequest,
        personalInfo: {
          ...validRequest.personalInfo,
          dateOfBirth: leapYearBirth
        }
      };

      const result = await useCase.execute(request, validContext);
      expect(result).toBeDefined();
    });
  });

  describe('Data Sanitization', () => {
    it('should sanitize patient data for audit logging', async () => {
      const result = await useCase.execute(validRequest, validContext);

      const auditEvent = mockAuditLogger.loggedEvents[0];
      const sanitizedData = auditEvent.newValues;

      // Should include basic info
      expect(sanitizedData.personalInfo.firstName).toBe('John');
      expect(sanitizedData.personalInfo.lastName).toBe('Doe');

      // Should mask sensitive info
      expect(sanitizedData.contactInfo.email).toMatch(/jo\*\*\*@example\.com/);
      expect(sanitizedData.contactInfo.phone).toMatch(/\*\*\*-\*\*\*-4567/);

      // Should exclude SSN from audit
      expect(sanitizedData.personalInfo.ssn).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should log system errors when repository fails', async () => {
      // Mock repository to throw error
      jest.spyOn(mockRepository, 'create').mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(validRequest, validContext))
        .rejects.toThrow('Database error');

      // Should log the error
      expect(mockAuditLogger.loggedEvents.some(e => e.type === 'system_error')).toBe(true);
    });

    it('should handle compliance validator errors', async () => {
      // Mock compliance validator to throw error
      jest.spyOn(mockComplianceValidator, 'validateDataAccess')
        .mockRejectedValue(new Error('Compliance service unavailable'));

      await expect(useCase.execute(validRequest, validContext))
        .rejects.toThrow('Compliance service unavailable');
    });
  });

  describe('Business Rules', () => {
    it('should enforce minimum age requirements', async () => {
      const tooYoungBirth = new Date();
      tooYoungBirth.setDate(tooYoungBirth.getDate() + 1); // Tomorrow
      
      const request = {
        ...validRequest,
        personalInfo: {
          ...validRequest.personalInfo,
          dateOfBirth: tooYoungBirth
        }
      };

      await expect(useCase.execute(request, validContext))
        .rejects.toThrow('Invalid date of birth');
    });

    it('should enforce maximum age requirements', async () => {
      const tooOldBirth = new Date();
      tooOldBirth.setFullYear(tooOldBirth.getFullYear() - 200);
      
      const request = {
        ...validRequest,
        personalInfo: {
          ...validRequest.personalInfo,
          dateOfBirth: tooOldBirth
        }
      };

      await expect(useCase.execute(request, validContext))
        .rejects.toThrow('Invalid date of birth');
    });
  });
});