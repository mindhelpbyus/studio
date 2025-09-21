/**
 * @fileoverview Compliance Validator Service
 * @description Validates operations against healthcare compliance standards
 * @compliance HIPAA, GDPR, PCI DSS, ISO/IEC 27001
 */

import { Injectable } from '../../security/decorators/injectable.decorator';
import { AuditLogger } from '../../security/audit/audit-logger.service';
import { HIPAACompliancePolicy, DEFAULT_HIPAA_POLICY } from '../policies/hipaa-policy';

export interface ComplianceValidationResult {
  readonly isCompliant: boolean;
  readonly violations: ComplianceViolation[];
  readonly warnings: ComplianceWarning[];
  readonly recommendations: string[];
  readonly complianceScore: number; // 0-100
}

export interface ComplianceViolation {
  readonly standard: string;
  readonly rule: string;
  readonly severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  readonly description: string;
  readonly remediation: string;
}

export interface ComplianceWarning {
  readonly standard: string;
  readonly rule: string;
  readonly description: string;
  readonly recommendation: string;
}

export interface DataAccessRequest {
  readonly userId: string;
  readonly resourceType: string;
  readonly resourceId: string;
  readonly action: string;
  readonly purpose: string;
  readonly patientId?: string;
  readonly minimumNecessary: boolean;
}

@Injectable()
export class ComplianceValidatorService {
  constructor(
    private readonly auditLogger: AuditLogger,
    private readonly hipaaPolicy: HIPAACompliancePolicy = DEFAULT_HIPAA_POLICY
  ) {}

  async validateDataAccess(request: DataAccessRequest): Promise<ComplianceValidationResult> {
    const violations: ComplianceViolation[] = [];
    const warnings: ComplianceWarning[] = [];
    const recommendations: string[] = [];

    // HIPAA Privacy Rule - Minimum Necessary Standard
    if (!request.minimumNecessary) {
      violations.push({
        standard: 'HIPAA',
        rule: 'Privacy Rule - Minimum Necessary',
        severity: 'HIGH',
        description: 'Data access request does not specify minimum necessary standard',
        remediation: 'Ensure only minimum necessary PHI is accessed for the stated purpose'
      });
    }

    // HIPAA Privacy Rule - Purpose Validation
    const validPurposes = [
      'treatment',
      'payment',
      'healthcare_operations',
      'patient_request',
      'legal_requirement'
    ];
    
    if (!validPurposes.includes(request.purpose)) {
      violations.push({
        standard: 'HIPAA',
        rule: 'Privacy Rule - Authorized Uses',
        severity: 'CRITICAL',
        description: `Invalid purpose for PHI access: ${request.purpose}`,
        remediation: 'Use only authorized purposes for PHI access'
      });
    }

    // Patient-specific data access validation
    if (request.resourceType === 'patient' || request.patientId) {
      const patientAccessResult = await this.validatePatientDataAccess(request);
      violations.push(...patientAccessResult.violations);
      warnings.push(...patientAccessResult.warnings);
    }

    // Calculate compliance score
    const complianceScore = this.calculateComplianceScore(violations, warnings);

    // Log compliance check
    await this.auditLogger.logComplianceEvent({
      userId: request.userId,
      complianceType: 'DATA_ACCESS_VALIDATION',
      checkResult: violations.length === 0 ? 'PASS' : 'FAIL',
      details: {
        request,
        violations: violations.length,
        warnings: warnings.length,
        complianceScore
      }
    });

    return {
      isCompliant: violations.length === 0,
      violations,
      warnings,
      recommendations,
      complianceScore
    };
  }

  async validateDataModification(
    request: {
      userId: string;
      resourceType: string;
      resourceId: string;
      oldData: any;
      newData: any;
      reason: string;
    }
  ): Promise<ComplianceValidationResult> {
    const violations: ComplianceViolation[] = [];
    const warnings: ComplianceWarning[] = [];
    const recommendations: string[] = [];

    // HIPAA Security Rule - Integrity Controls
    if (!request.reason || request.reason.trim().length < 10) {
      violations.push({
        standard: 'HIPAA',
        rule: 'Security Rule - Integrity',
        severity: 'MEDIUM',
        description: 'Data modification lacks adequate justification',
        remediation: 'Provide detailed reason for all PHI modifications'
      });
    }

    // Validate sensitive field changes
    const sensitiveFields = ['ssn', 'dateOfBirth', 'medicalRecordNumber'];
    for (const field of sensitiveFields) {
      if (request.oldData[field] !== request.newData[field]) {
        warnings.push({
          standard: 'HIPAA',
          rule: 'Privacy Rule - Amendment Rights',
          description: `Sensitive field '${field}' was modified`,
          recommendation: 'Ensure patient was notified of sensitive data changes'
        });
      }
    }

    const complianceScore = this.calculateComplianceScore(violations, warnings);

    await this.auditLogger.logComplianceEvent({
      userId: request.userId,
      complianceType: 'DATA_MODIFICATION_VALIDATION',
      checkResult: violations.length === 0 ? 'PASS' : 'FAIL',
      details: {
        request: {
          ...request,
          oldData: '[REDACTED]',
          newData: '[REDACTED]'
        },
        violations: violations.length,
        warnings: warnings.length,
        complianceScore
      }
    });

    return {
      isCompliant: violations.length === 0,
      violations,
      warnings,
      recommendations,
      complianceScore
    };
  }

  async validateDataExport(
    request: {
      userId: string;
      dataType: string;
      recordCount: number;
      exportFormat: string;
      destination: string;
      purpose: string;
      patientConsent?: boolean;
    }
  ): Promise<ComplianceValidationResult> {
    const violations: ComplianceViolation[] = [];
    const warnings: ComplianceWarning[] = [];
    const recommendations: string[] = [];

    // HIPAA Privacy Rule - Patient Consent for Marketing
    if (request.purpose === 'marketing' && !request.patientConsent) {
      violations.push({
        standard: 'HIPAA',
        rule: 'Privacy Rule - Marketing Authorization',
        severity: 'CRITICAL',
        description: 'Patient consent required for marketing use of PHI',
        remediation: 'Obtain written patient authorization before using PHI for marketing'
      });
    }

    // Large data export warning
    if (request.recordCount > 1000) {
      warnings.push({
        standard: 'HIPAA',
        rule: 'Privacy Rule - Minimum Necessary',
        description: `Large data export requested: ${request.recordCount} records`,
        recommendation: 'Verify that all exported data is necessary for the stated purpose'
      });
    }

    // Unsecured export format warning
    const secureFormats = ['encrypted-csv', 'encrypted-json', 'hl7-fhir-encrypted'];
    if (!secureFormats.includes(request.exportFormat)) {
      violations.push({
        standard: 'HIPAA',
        rule: 'Security Rule - Transmission Security',
        severity: 'HIGH',
        description: `Unsecured export format: ${request.exportFormat}`,
        remediation: 'Use encrypted format for PHI exports'
      });
    }

    const complianceScore = this.calculateComplianceScore(violations, warnings);

    await this.auditLogger.logComplianceEvent({
      userId: request.userId,
      complianceType: 'DATA_EXPORT_VALIDATION',
      checkResult: violations.length === 0 ? 'PASS' : 'FAIL',
      details: {
        request,
        violations: violations.length,
        warnings: warnings.length,
        complianceScore
      }
    });

    return {
      isCompliant: violations.length === 0,
      violations,
      warnings,
      recommendations,
      complianceScore
    };
  }

  async validateSystemAccess(
    request: {
      userId: string;
      systemComponent: string;
      accessLevel: string;
      justification: string;
      sessionTimeout: number;
    }
  ): Promise<ComplianceValidationResult> {
    const violations: ComplianceViolation[] = [];
    const warnings: ComplianceWarning[] = [];
    const recommendations: string[] = [];

    // HIPAA Security Rule - Access Control
    const maxSessionTimeout = 30 * 60; // 30 minutes
    if (request.sessionTimeout > maxSessionTimeout) {
      violations.push({
        standard: 'HIPAA',
        rule: 'Security Rule - Access Control',
        severity: 'MEDIUM',
        description: `Session timeout exceeds maximum: ${request.sessionTimeout}s`,
        remediation: `Set session timeout to maximum ${maxSessionTimeout} seconds`
      });
    }

    // Administrative access validation
    if (request.accessLevel === 'admin' && !request.justification) {
      violations.push({
        standard: 'HIPAA',
        rule: 'Security Rule - Information Access Management',
        severity: 'HIGH',
        description: 'Administrative access requires justification',
        remediation: 'Provide business justification for administrative access'
      });
    }

    const complianceScore = this.calculateComplianceScore(violations, warnings);

    await this.auditLogger.logComplianceEvent({
      userId: request.userId,
      complianceType: 'SYSTEM_ACCESS_VALIDATION',
      checkResult: violations.length === 0 ? 'PASS' : 'FAIL',
      details: {
        request,
        violations: violations.length,
        warnings: warnings.length,
        complianceScore
      }
    });

    return {
      isCompliant: violations.length === 0,
      violations,
      warnings,
      recommendations,
      complianceScore
    };
  }

  private async validatePatientDataAccess(
    request: DataAccessRequest
  ): Promise<{ violations: ComplianceViolation[]; warnings: ComplianceWarning[] }> {
    const violations: ComplianceViolation[] = [];
    const warnings: ComplianceWarning[] = [];

    // Check if user has relationship with patient (placeholder)
    const hasPatientRelationship = await this.checkPatientRelationship(
      request.userId,
      request.patientId || request.resourceId
    );

    if (!hasPatientRelationship && request.purpose === 'treatment') {
      violations.push({
        standard: 'HIPAA',
        rule: 'Privacy Rule - Treatment Relationship',
        severity: 'HIGH',
        description: 'No established treatment relationship with patient',
        remediation: 'Establish treatment relationship or use appropriate authorization'
      });
    }

    return { violations, warnings };
  }

  private async checkPatientRelationship(userId: string, patientId: string): Promise<boolean> {
    // Implementation would check if user has an established relationship with patient
    // This could involve checking provider assignments, care team membership, etc.
    return true; // Placeholder
  }

  private calculateComplianceScore(
    violations: ComplianceViolation[],
    warnings: ComplianceWarning[]
  ): number {
    let score = 100;
    
    // Deduct points for violations
    for (const violation of violations) {
      switch (violation.severity) {
        case 'CRITICAL':
          score -= 25;
          break;
        case 'HIGH':
          score -= 15;
          break;
        case 'MEDIUM':
          score -= 10;
          break;
        case 'LOW':
          score -= 5;
          break;
      }
    }
    
    // Deduct points for warnings
    score -= warnings.length * 2;
    
    return Math.max(0, score);
  }
}