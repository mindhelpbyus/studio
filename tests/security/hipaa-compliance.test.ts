/**
 * @fileoverview HIPAA Compliance Tests
 * @description Test suite for HIPAA compliance validation
 * @compliance HIPAA Privacy Rule, Security Rule, Breach Notification Rule
 */

import { ComplianceValidatorService } from '../../src/compliance/validators/compliance-validator.service';
import { AuditLogger } from '../../src/security/audit/audit-logger.service';
import { EncryptionService } from '../../src/security/encryption/encryption.service';

describe('HIPAA Compliance Tests', () => {
  let complianceValidator: ComplianceValidatorService;
  let auditLogger: AuditLogger;
  let encryptionService: EncryptionService;

  beforeEach(() => {
    encryptionService = new EncryptionService();
    auditLogger = new AuditLogger(encryptionService);
    complianceValidator = new ComplianceValidatorService(auditLogger);
  });

  describe('Privacy Rule Compliance', () => {
    it('should enforce minimum necessary standard', async () => {
      const request = {
        userId: 'user123',
        resourceType: 'patient',
        resourceId: 'patient456',
        action: 'READ',
        purpose: 'treatment',
        minimumNecessary: false
      };

      const result = await complianceValidator.validateDataAccess(request);

      expect(result.isCompliant).toBe(false);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].rule).toContain('Minimum Necessary');
      expect(result.violations[0].severity).toBe('HIGH');
    });

    it('should validate authorized purposes for PHI access', async () => {
      const request = {
        userId: 'user123',
        resourceType: 'patient',
        resourceId: 'patient456',
        action: 'READ',
        purpose: 'marketing', // Invalid purpose without consent
        minimumNecessary: true
      };

      const result = await complianceValidator.validateDataAccess(request);

      expect(result.isCompliant).toBe(false);
      expect(result.violations.some(v => v.rule.includes('Authorized Uses'))).toBe(true);
    });

    it('should allow valid treatment purposes', async () => {
      const request = {
        userId: 'provider123',
        resourceType: 'patient',
        resourceId: 'patient456',
        action: 'READ',
        purpose: 'treatment',
        minimumNecessary: true
      };

      const result = await complianceValidator.validateDataAccess(request);

      expect(result.isCompliant).toBe(true);
      expect(result.violations).toHaveLength(0);
    });
  });

  describe('Security Rule Compliance', () => {
    it('should require justification for data modifications', async () => {
      const request = {
        userId: 'user123',
        resourceType: 'patient',
        resourceId: 'patient456',
        oldData: { name: 'John Doe' },
        newData: { name: 'John Smith' },
        reason: '' // Empty reason
      };

      const result = await complianceValidator.validateDataModification(request);

      expect(result.isCompliant).toBe(false);
      expect(result.violations.some(v => v.rule.includes('Integrity'))).toBe(true);
    });

    it('should validate session timeout limits', async () => {
      const request = {
        userId: 'user123',
        systemComponent: 'patient-portal',
        accessLevel: 'user',
        justification: 'Patient care',
        sessionTimeout: 3600 // 1 hour - exceeds 30 minute limit
      };

      const result = await complianceValidator.validateSystemAccess(request);

      expect(result.isCompliant).toBe(false);
      expect(result.violations.some(v => v.rule.includes('Access Control'))).toBe(true);
    });

    it('should require justification for administrative access', async () => {
      const request = {
        userId: 'admin123',
        systemComponent: 'admin-panel',
        accessLevel: 'admin',
        justification: '', // No justification
        sessionTimeout: 1800
      };

      const result = await complianceValidator.validateSystemAccess(request);

      expect(result.isCompliant).toBe(false);
      expect(result.violations.some(v => v.rule.includes('Information Access Management'))).toBe(true);
    });
  });

  describe('Data Export Compliance', () => {
    it('should require patient consent for marketing exports', async () => {
      const request = {
        userId: 'user123',
        dataType: 'patient-demographics',
        recordCount: 100,
        exportFormat: 'csv',
        destination: 'marketing-team',
        purpose: 'marketing',
        patientConsent: false
      };

      const result = await complianceValidator.validateDataExport(request);

      expect(result.isCompliant).toBe(false);
      expect(result.violations.some(v => v.rule.includes('Marketing Authorization'))).toBe(true);
      expect(result.violations.some(v => v.severity === 'CRITICAL')).toBe(true);
    });

    it('should require encrypted format for PHI exports', async () => {
      const request = {
        userId: 'user123',
        dataType: 'patient-records',
        recordCount: 50,
        exportFormat: 'csv', // Unencrypted format
        destination: 'research-team',
        purpose: 'healthcare_operations',
        patientConsent: true
      };

      const result = await complianceValidator.validateDataExport(request);

      expect(result.isCompliant).toBe(false);
      expect(result.violations.some(v => v.rule.includes('Transmission Security'))).toBe(true);
    });

    it('should warn about large data exports', async () => {
      const request = {
        userId: 'user123',
        dataType: 'patient-records',
        recordCount: 5000, // Large export
        exportFormat: 'encrypted-csv',
        destination: 'analytics-team',
        purpose: 'healthcare_operations',
        patientConsent: true
      };

      const result = await complianceValidator.validateDataExport(request);

      expect(result.warnings.some(w => w.rule.includes('Minimum Necessary'))).toBe(true);
    });
  });

  describe('Audit Logging Compliance', () => {
    it('should log all PHI access attempts', async () => {
      const logSpy = jest.spyOn(auditLogger, 'logDataAccess');

      await complianceValidator.validateDataAccess({
        userId: 'user123',
        resourceType: 'patient',
        resourceId: 'patient456',
        action: 'READ',
        purpose: 'treatment',
        minimumNecessary: true
      });

      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          event: expect.any(String),
          userId: 'user123',
          resourceType: 'patient',
          resourceId: expect.any(String)
        })
      );
    });

    it('should log compliance violations', async () => {
      const logSpy = jest.spyOn(auditLogger, 'logComplianceEvent');

      await complianceValidator.validateDataAccess({
        userId: 'user123',
        resourceType: 'patient',
        resourceId: 'patient456',
        action: 'READ',
        purpose: 'invalid-purpose',
        minimumNecessary: false
      });

      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          complianceType: 'DATA_ACCESS_VALIDATION',
          checkResult: 'FAIL'
        })
      );
    });
  });

  describe('Encryption Compliance', () => {
    it('should use HIPAA-compliant encryption algorithms', async () => {
      const testData = 'sensitive-patient-data';
      const masterKey = 'test-master-key-32-characters-long';

      const encrypted = await encryptionService.encryptSensitiveData(testData, masterKey);

      expect(encrypted.algorithm).toBe('aes-256-gcm');
      expect(encrypted.keyDerivation).toBe('pbkdf2');
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.salt).toBeDefined();
    });

    it('should validate encryption strength', () => {
      const validation = encryptionService.validateEncryptionStrength('aes-256-gcm', 256);

      expect(validation.isCompliant).toBe(true);
      expect(validation.standards).toContain('HIPAA');
      expect(validation.standards).toContain('NIST');
      expect(validation.standards).toContain('FIPS 140-2');
    });

    it('should reject weak encryption', () => {
      const validation = encryptionService.validateEncryptionStrength('aes-128-cbc', 128);

      expect(validation.isCompliant).toBe(false);
      expect(validation.recommendations).toBeDefined();
      expect(validation.recommendations!.length).toBeGreaterThan(0);
    });
  });

  describe('Compliance Score Calculation', () => {
    it('should calculate compliance score correctly', async () => {
      const perfectRequest = {
        userId: 'provider123',
        resourceType: 'patient',
        resourceId: 'patient456',
        action: 'READ',
        purpose: 'treatment',
        minimumNecessary: true
      };

      const result = await complianceValidator.validateDataAccess(perfectRequest);

      expect(result.complianceScore).toBe(100);
      expect(result.isCompliant).toBe(true);
    });

    it('should penalize critical violations heavily', async () => {
      const criticalViolationRequest = {
        userId: 'user123',
        dataType: 'patient-records',
        recordCount: 100,
        exportFormat: 'csv',
        destination: 'marketing-team',
        purpose: 'marketing',
        patientConsent: false
      };

      const result = await complianceValidator.validateDataExport(criticalViolationRequest);

      expect(result.complianceScore).toBeLessThan(80);
      expect(result.isCompliant).toBe(false);
    });
  });
});