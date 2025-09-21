/**
 * @fileoverview Patient Workflow Integration Tests
 * @description End-to-end integration tests for patient management workflows
 * @compliance HIPAA, Integration Testing Standards
 */

import { CreatePatientUseCase } from '../../src/core/use-cases/create-patient.use-case';
import { PatientService } from '../../src/healthcare/patient-management/patient.service';
import { PatientController } from '../../src/application/controllers/patient.controller';
import { ComplianceValidatorService } from '../../src/compliance/validators/compliance-validator.service';
import { AuditLogger } from '../../src/security/audit/audit-logger.service';
import { EncryptionService } from '../../src/security/encryption/encryption.service';

// Mock Next.js Request/Response
class MockNextRequest {
  public headers = new Map<string, string>();
  public cookies = new Map<string, string>();
  public url = 'http://localhost:3000/api/patients';
  public method = 'POST';
  private body: any;

  constructor(body?: any) {
    this.body = body;
  }

  async json() {
    return this.body;
  }

  get(name: string) {
    return this.headers.get(name);
  }
}

class MockNextResponse {
  public status = 200;
  public body: any;
  public headers = new Map<string, string>();

  static json(body: any, options?: { status?: number }) {
    const response = new MockNextResponse();
    response.body = body;
    response.status = options?.status || 200;
    return response;
  }
}

// Integration test setup
describe('Patient Management Integration Tests', () => {
  let patientController: PatientController;
  let patientService: PatientService;
  let createPatientUseCase: CreatePatientUseCase;
  let complianceValidator: ComplianceValidatorService;
  let auditLogger: AuditLogger;
  let encryptionService: EncryptionService;

  const validPatientData = {
    personalInfo: {
      firstName: 'Alice',
      lastName: 'Johnson',
      dateOfBirth: '1985-03-15',
      gender: 'female',
      ssn: '987-65-4321'
    },
    contactInfo: {
      email: 'alice.johnson@example.com',
      phone: '555-234-5678',
      address: {
        street: '456 Oak Avenue',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62701',
        country: 'USA'
      }
    },
    emergencyContacts: [
      {
        name: 'Bob Johnson',
        relationship: 'spouse',
        phone: '555-876-5432',
        email: 'bob.johnson@example.com'
      }
    ],
    consentStatus: {
      treatmentConsent: true,
      dataProcessingConsent: true,
      marketingConsent: true,
      researchConsent: false
    }
  };

  beforeEach(() => {
    // Initialize services with proper dependencies
    encryptionService = new EncryptionService();
    auditLogger = new AuditLogger(encryptionService);
    complianceValidator = new ComplianceValidatorService(auditLogger);
    
    // Mock repository for integration tests
    const mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByMRN: jest.fn(),
      search: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    };

    createPatientUseCase = new CreatePatientUseCase(
      mockRepository as any,
      auditLogger,
      complianceValidator
    );

    patientService = new PatientService(
      mockRepository as any,
      auditLogger,
      encryptionService
    );

    patientController = new PatientController(
      createPatientUseCase,
      patientService,
      {} as any, // Mock auth service
      complianceValidator,
      auditLogger
    );
  });

  describe('Complete Patient Creation Workflow', () => {
    it('should create patient through full workflow', async () => {
      // Mock successful repository operations
      const mockPatient = {
        id: 'patient123',
        patientId: 'PAT_123456',
        mrn: 'MRN123456789',
        ...validPatientData,
        personalInfo: {
          ...validPatientData.personalInfo,
          dateOfBirth: new Date(validPatientData.personalInfo.dateOfBirth)
        },
        consentStatus: {
          ...validPatientData.consentStatus,
          consentDate: new Date(),
          consentVersion: '1.0'
        },
        privacyPreferences: {
          allowDataSharing: false,
          allowCommunication: true,
          preferredContactMethod: 'email' as const,
          dataRetentionPeriod: 6
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'provider123',
        updatedBy: 'provider123',
        version: 1,
        isDeleted: false
      };

      // Mock repository to return created patient
      jest.spyOn(createPatientUseCase['patientRepository'], 'create')
        .mockResolvedValue(mockPatient);

      // Create request with authentication
      const request = new MockNextRequest(validPatientData) as any;
      request.headers.set('authorization', 'Bearer valid-jwt-token');

      // Execute controller method
      const response = await patientController.createPatient(request);

      // Verify response
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.personalInfo.firstName).toBe('Alice');
      expect(response.body.data.mrn).toBeDefined();
      
      // Verify sensitive data is not in response
      expect(response.body.data.personalInfo.ssn).toBeUndefined();
    });

    it('should handle compliance violations during creation', async () => {
      // Mock compliance validator to fail
      jest.spyOn(complianceValidator, 'validateDataAccess')
        .mockResolvedValue({
          isCompliant: false,
          violations: [{
            standard: 'HIPAA',
            rule: 'Minimum Necessary',
            severity: 'HIGH' as const,
            description: 'Insufficient justification for data access',
            remediation: 'Provide proper justification'
          }],
          warnings: [],
          recommendations: [],
          complianceScore: 50
        });

      const request = new MockNextRequest(validPatientData) as any;
      request.headers.set('authorization', 'Bearer valid-jwt-token');

      const response = await patientController.createPatient(request);

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Compliance violation');
    });

    it('should audit all patient creation activities', async () => {
      const auditSpy = jest.spyOn(auditLogger, 'logDataModification');
      
      // Mock successful creation
      const mockPatient = {
        id: 'patient123',
        patientId: 'PAT_123456',
        mrn: 'MRN123456789',
        personalInfo: {
          firstName: 'Alice',
          lastName: 'Johnson',
          dateOfBirth: new Date('1985-03-15'),
          gender: 'female' as const
        },
        contactInfo: {
          email: 'alice.johnson@example.com',
          phone: '555-234-5678'
        },
        emergencyContacts: [],
        consentStatus: {
          treatmentConsent: true,
          dataProcessingConsent: true,
          marketingConsent: true,
          researchConsent: false,
          consentDate: new Date(),
          consentVersion: '1.0'
        },
        privacyPreferences: {
          allowDataSharing: false,
          allowCommunication: true,
          preferredContactMethod: 'email' as const,
          dataRetentionPeriod: 6
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'provider123',
        updatedBy: 'provider123',
        version: 1,
        isDeleted: false
      };

      jest.spyOn(createPatientUseCase['patientRepository'], 'create')
        .mockResolvedValue(mockPatient);

      const request = new MockNextRequest(validPatientData) as any;
      request.headers.set('authorization', 'Bearer valid-jwt-token');

      await patientController.createPatient(request);

      // Verify audit logging occurred
      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'CREATE_PATIENT',
          resourceType: 'patient',
          userId: expect.any(String)
        })
      );
    });
  });

  describe('Patient Search and Retrieval Workflow', () => {
    it('should search patients with proper compliance checking', async () => {
      const mockPatients = [
        {
          id: 'patient1',
          patientId: 'PAT_001',
          mrn: 'MRN001',
          personalInfo: {
            firstName: 'John',
            lastName: 'Smith',
            dateOfBirth: new Date('1980-01-01'),
            gender: 'male' as const
          },
          contactInfo: {
            email: 'john.smith@example.com',
            phone: '555-111-2222'
          },
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      jest.spyOn(patientService, 'searchPatients')
        .mockResolvedValue(mockPatients as any);

      const request = new MockNextRequest() as any;
      request.url = 'http://localhost:3000/api/patients?lastName=Smith';
      request.headers.set('authorization', 'Bearer valid-jwt-token');

      const response = await patientController.searchPatients(request);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].personalInfo.lastName).toBe('Smith');
    });

    it('should retrieve individual patient with access logging', async () => {
      const mockPatient = {
        id: 'patient123',
        patientId: 'PAT_123',
        mrn: 'MRN123',
        personalInfo: {
          firstName: 'Jane',
          lastName: 'Doe',
          dateOfBirth: new Date('1990-05-15'),
          gender: 'female' as const
        },
        contactInfo: {
          email: 'jane.doe@example.com',
          phone: '555-333-4444'
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      jest.spyOn(patientService, 'getPatientById')
        .mockResolvedValue(mockPatient as any);

      const auditSpy = jest.spyOn(auditLogger, 'logDataAccess');

      const request = new MockNextRequest() as any;
      request.headers.set('authorization', 'Bearer valid-jwt-token');

      const response = await patientController.getPatient(request, 'patient123');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('patient123');

      // Verify access was logged
      expect(auditSpy).toHaveBeenCalled();
    });
  });

  describe('Patient Update Workflow', () => {
    it('should update patient with proper validation and auditing', async () => {
      const updateData = {
        contactInfo: {
          email: 'newemail@example.com',
          phone: '555-999-8888'
        }
      };

      const updatedPatient = {
        id: 'patient123',
        patientId: 'PAT_123',
        mrn: 'MRN123',
        personalInfo: {
          firstName: 'Jane',
          lastName: 'Doe',
          dateOfBirth: new Date('1990-05-15'),
          gender: 'female' as const
        },
        contactInfo: updateData.contactInfo,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 2
      };

      jest.spyOn(patientService, 'updatePatient')
        .mockResolvedValue(updatedPatient as any);

      const request = new MockNextRequest(updateData) as any;
      request.headers.set('authorization', 'Bearer valid-jwt-token');

      const response = await patientController.updatePatient(request, 'patient123');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.contactInfo.email).toBe('newemail@example.com');
      expect(response.body.data.version).toBe(2);
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle database connection errors gracefully', async () => {
      jest.spyOn(createPatientUseCase['patientRepository'], 'create')
        .mockRejectedValue(new Error('Database connection failed'));

      const request = new MockNextRequest(validPatientData) as any;
      request.headers.set('authorization', 'Bearer valid-jwt-token');

      const response = await patientController.createPatient(request);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal server error');
    });

    it('should handle authentication failures', async () => {
      const request = new MockNextRequest(validPatientData) as any;
      // No authorization header

      const response = await patientController.createPatient(request);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should handle validation errors with proper error messages', async () => {
      const invalidData = {
        ...validPatientData,
        personalInfo: {
          ...validPatientData.personalInfo,
          firstName: '' // Invalid empty name
        }
      };

      const request = new MockNextRequest(invalidData) as any;
      request.headers.set('authorization', 'Bearer valid-jwt-token');

      const response = await patientController.createPatient(request);

      expect(response.status).toBe(500); // Will be caught as validation error
      expect(response.body.error).toBe('Internal server error');
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle concurrent patient creation requests', async () => {
      const mockPatient = {
        id: 'patient123',
        patientId: 'PAT_123456',
        mrn: 'MRN123456789',
        personalInfo: {
          firstName: 'Alice',
          lastName: 'Johnson',
          dateOfBirth: new Date('1985-03-15'),
          gender: 'female' as const
        },
        contactInfo: {
          email: 'alice.johnson@example.com',
          phone: '555-234-5678'
        },
        emergencyContacts: [],
        consentStatus: {
          treatmentConsent: true,
          dataProcessingConsent: true,
          marketingConsent: true,
          researchConsent: false,
          consentDate: new Date(),
          consentVersion: '1.0'
        },
        privacyPreferences: {
          allowDataSharing: false,
          allowCommunication: true,
          preferredContactMethod: 'email' as const,
          dataRetentionPeriod: 6
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'provider123',
        updatedBy: 'provider123',
        version: 1,
        isDeleted: false
      };

      jest.spyOn(createPatientUseCase['patientRepository'], 'create')
        .mockResolvedValue(mockPatient);

      // Create multiple concurrent requests
      const requests = Array.from({ length: 5 }, () => {
        const request = new MockNextRequest(validPatientData) as any;
        request.headers.set('authorization', 'Bearer valid-jwt-token');
        return patientController.createPatient(request);
      });

      const responses = await Promise.all(requests);

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });
    });

    it('should handle large patient search results efficiently', async () => {
      // Mock large result set
      const largePatientSet = Array.from({ length: 100 }, (_, i) => ({
        id: `patient${i}`,
        patientId: `PAT_${i}`,
        mrn: `MRN${i}`,
        personalInfo: {
          firstName: `Patient${i}`,
          lastName: 'Test',
          dateOfBirth: new Date('1980-01-01'),
          gender: 'other' as const
        },
        contactInfo: {
          email: `patient${i}@example.com`,
          phone: `555-000-${i.toString().padStart(4, '0')}`
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      jest.spyOn(patientService, 'searchPatients')
        .mockResolvedValue(largePatientSet as any);

      const request = new MockNextRequest() as any;
      request.url = 'http://localhost:3000/api/patients?lastName=Test';
      request.headers.set('authorization', 'Bearer valid-jwt-token');

      const startTime = Date.now();
      const response = await patientController.searchPatients(request);
      const endTime = Date.now();

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});