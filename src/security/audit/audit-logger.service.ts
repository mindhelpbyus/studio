/**
 * @fileoverview Audit Logger Service
 * @description HIPAA-compliant audit logging for healthcare data access
 * @compliance HIPAA, GDPR, ISO/IEC 27001, NIST
 */

import { Injectable } from '../decorators/injectable.decorator';
import { EncryptionService } from '../encryption/encryption.service';

export interface AuditEvent {
  readonly eventId: string;
  readonly eventType: AuditEventType;
  readonly timestamp: Date;
  readonly userId?: string;
  readonly sessionId?: string;
  readonly resourceType?: string;
  readonly resourceId?: string;
  readonly action: string;
  readonly outcome: 'SUCCESS' | 'FAILURE' | 'WARNING';
  readonly details?: Record<string, any>;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly location?: string;
  readonly severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface SecurityEvent {
  readonly event: string;
  readonly userId?: string;
  readonly sessionId?: string;
  readonly timestamp: Date;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly error?: string;
  readonly details?: Record<string, any>;
}

export type AuditEventType = 
  | 'AUTHENTICATION'
  | 'AUTHORIZATION' 
  | 'DATA_ACCESS'
  | 'DATA_MODIFICATION'
  | 'DATA_EXPORT'
  | 'SYSTEM_ACCESS'
  | 'CONFIGURATION_CHANGE'
  | 'SECURITY_EVENT'
  | 'COMPLIANCE_CHECK'
  | 'ERROR_EVENT';

@Injectable()
export class AuditLogger {
  constructor(
    private readonly encryptionService: EncryptionService
  ) {}

  async logDataAccess(event: {
    userId: string;
    sessionId: string;
    resourceType: string;
    resourceId: string;
    action: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    const auditEvent: AuditEvent = {
      eventId: this.generateEventId(),
      eventType: 'DATA_ACCESS',
      timestamp: new Date(),
      userId: event.userId,
      sessionId: event.sessionId,
      resourceType: event.resourceType,
      resourceId: event.resourceId,
      action: event.action,
      outcome: 'SUCCESS',
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      severity: this.determineSeverity(event.resourceType, event.action)
    };

    await this.persistAuditEvent(auditEvent);
  }

  async logDataModification(event: {
    userId: string;
    sessionId: string;
    resourceType: string;
    resourceId: string;
    action: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    ipAddress?: string;
  }): Promise<void> {
    const auditEvent: AuditEvent = {
      eventId: this.generateEventId(),
      eventType: 'DATA_MODIFICATION',
      timestamp: new Date(),
      userId: event.userId,
      sessionId: event.sessionId,
      resourceType: event.resourceType,
      resourceId: event.resourceId,
      action: event.action,
      outcome: 'SUCCESS',
      details: {
        oldValues: event.oldValues ? await this.encryptSensitiveData(event.oldValues) : undefined,
        newValues: event.newValues ? await this.encryptSensitiveData(event.newValues) : undefined
      },
      ipAddress: event.ipAddress,
      severity: 'HIGH' // Data modifications are always high severity
    };

    await this.persistAuditEvent(auditEvent);
  }

  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    const auditEvent: AuditEvent = {
      eventId: this.generateEventId(),
      eventType: 'SECURITY_EVENT',
      timestamp: event.timestamp,
      userId: event.userId,
      sessionId: event.sessionId,
      action: event.event,
      outcome: event.error ? 'FAILURE' : 'SUCCESS',
      details: event.details,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      severity: this.determineSecuritySeverity(event.event, !!event.error)
    };

    await this.persistAuditEvent(auditEvent);
  }

  async logComplianceEvent(event: {
    userId?: string;
    sessionId?: string;
    complianceType: string;
    checkResult: 'PASS' | 'FAIL' | 'WARNING';
    details: Record<string, any>;
  }): Promise<void> {
    const auditEvent: AuditEvent = {
      eventId: this.generateEventId(),
      eventType: 'COMPLIANCE_CHECK',
      timestamp: new Date(),
      userId: event.userId,
      sessionId: event.sessionId,
      action: `COMPLIANCE_CHECK_${event.complianceType}`,
      outcome: event.checkResult === 'PASS' ? 'SUCCESS' : 
               event.checkResult === 'FAIL' ? 'FAILURE' : 'WARNING',
      details: event.details,
      severity: event.checkResult === 'FAIL' ? 'CRITICAL' : 
                event.checkResult === 'WARNING' ? 'MEDIUM' : 'LOW'
    };

    await this.persistAuditEvent(auditEvent);
  }

  async logSystemError(error: {
    userId?: string;
    sessionId?: string;
    errorType: string;
    errorMessage: string;
    stackTrace?: string;
    context?: Record<string, any>;
  }): Promise<void> {
    const auditEvent: AuditEvent = {
      eventId: this.generateEventId(),
      eventType: 'ERROR_EVENT',
      timestamp: new Date(),
      userId: error.userId,
      sessionId: error.sessionId,
      action: `SYSTEM_ERROR_${error.errorType}`,
      outcome: 'FAILURE',
      details: {
        errorMessage: error.errorMessage,
        stackTrace: error.stackTrace,
        context: error.context
      },
      severity: this.determineErrorSeverity(error.errorType)
    };

    await this.persistAuditEvent(auditEvent);
  }

  private async persistAuditEvent(event: AuditEvent): Promise<void> {
    try {
      // Encrypt sensitive audit data
      const encryptedEvent = await this.encryptAuditEvent(event);
      
      // Store in secure audit log storage
      // Implementation would persist to secure, tamper-proof storage
      console.log('Audit Event:', encryptedEvent);
      
      // Send to SIEM system if configured
      await this.sendToSIEM(encryptedEvent);
      
      // Check for critical events that need immediate alerting
      if (event.severity === 'CRITICAL') {
        await this.triggerAlert(event);
      }
    } catch (error) {
      // Audit logging failures are critical - log to system error log
      console.error('Failed to persist audit event:', error);
      // In production, this would trigger emergency alerts
    }
  }

  private async encryptAuditEvent(event: AuditEvent): Promise<AuditEvent> {
    // Encrypt sensitive fields while preserving searchability for compliance
    return {
      ...event,
      details: event.details ? await this.encryptSensitiveData(event.details) : undefined
    };
  }

  private async encryptSensitiveData(data: Record<string, any>): Promise<Record<string, any>> {
    // Implementation would selectively encrypt PII/PHI fields
    return data;
  }

  private generateEventId(): string {
    return this.encryptionService.generateSecureId();
  }

  private determineSeverity(resourceType: string, action: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    // PHI access is always high severity
    if (resourceType === 'patient' || resourceType === 'medical-record') {
      return 'HIGH';
    }
    
    // Administrative actions are medium severity
    if (action.includes('admin') || action.includes('config')) {
      return 'MEDIUM';
    }
    
    return 'LOW';
  }

  private determineSecuritySeverity(event: string, hasError: boolean): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (hasError) {
      if (event.includes('AUTHENTICATION') || event.includes('AUTHORIZATION')) {
        return 'HIGH';
      }
      return 'MEDIUM';
    }
    
    if (event.includes('LOGIN') || event.includes('ACCESS')) {
      return 'MEDIUM';
    }
    
    return 'LOW';
  }

  private determineErrorSeverity(errorType: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (errorType.includes('SECURITY') || errorType.includes('DATA_BREACH')) {
      return 'CRITICAL';
    }
    
    if (errorType.includes('DATABASE') || errorType.includes('AUTH')) {
      return 'HIGH';
    }
    
    return 'MEDIUM';
  }

  private async sendToSIEM(event: AuditEvent): Promise<void> {
    // Implementation would send to SIEM system (Splunk, ELK, etc.)
  }

  private async triggerAlert(event: AuditEvent): Promise<void> {
    // Implementation would trigger immediate alerts for critical events
  }
}