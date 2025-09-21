/**
 * HIPAA Compliance Implementation
 * Handles PHI protection, audit logging, and breach notification
 */

import { observability } from '../monitoring/observability';

export interface PHIData {
  id: string;
  type: 'medical_record' | 'appointment' | 'prescription' | 'billing' | 'insurance';
  patientId: string;
  providerId?: string;
  data: Record<string, any>;
  classification: 'phi' | 'sensitive' | 'public';
  createdAt: Date;
  updatedAt: Date;
  accessedBy: string[];
  encryptionStatus: 'encrypted' | 'unencrypted';
}

export interface AuditEvent {
  id: string;
  timestamp: Date;
  userId: string;
  userRole: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'export' | 'print';
  resourceType: string;
  resourceId: string;
  patientId?: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  reason?: string;
  metadata?: Record<string, any>;
}

export interface BreachEvent {
  id: string;
  timestamp: Date;
  type: 'unauthorized_access' | 'data_theft' | 'system_breach' | 'disclosure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedRecords: number;
  affectedPatients: string[];
  description: string;
  discoveredBy: string;
  reportedAt?: Date;
  mitigatedAt?: Date;
  status: 'discovered' | 'investigating' | 'contained' | 'resolved';
}

export class HIPAAComplianceManager {
  private static instance: HIPAAComplianceManager;

  static getInstance(): HIPAAComplianceManager {
    if (!HIPAAComplianceManager.instance) {
      HIPAAComplianceManager.instance = new HIPAAComplianceManager();
    }
    return HIPAAComplianceManager.instance;
  }

  /**
   * Log PHI access for audit trail
   */
  async logPHIAccess(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<void> {
    const auditEvent: AuditEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...event,
    };

    try {
      // Store in audit log
      await this.storeAuditEvent(auditEvent);
      
      // Send to monitoring system
      await observability.recordMetric('phi_access_total', 1, {
        action: event.action,
        resource_type: event.resourceType,
        user_role: event.userRole,
        success: event.success.toString(),
      });

      // Log for compliance monitoring
      await observability.log('info', 'PHI Access Event', {
        auditEventId: auditEvent.id,
        userId: event.userId,
        action: event.action,
        resourceType: event.resourceType,
        success: event.success,
      });

    } catch (error) {
      console.error('Failed to log PHI access:', error);
      // This is critical - PHI access must be logged
      throw new Error('Audit logging failure - operation aborted for compliance');
    }
  }

  /**
   * Classify data as PHI or non-PHI
   */
  classifyData(data: any, context: { type: string; patientId?: string }): 'phi' | 'sensitive' | 'public' {
    const phiFields = [
      'ssn', 'social_security_number',
      'medical_record_number', 'mrn',
      'diagnosis', 'treatment', 'medication',
      'lab_results', 'test_results',
      'insurance_number', 'policy_number',
      'date_of_birth', 'dob',
      'phone_number', 'address',
      'email', // When associated with health information
      'biometric_data', 'genetic_data',
      'mental_health_notes', 'therapy_notes'
    ];

    const sensitiveFields = [
      'name', 'first_name', 'last_name',
      'username', 'user_id',
      'appointment_time', 'visit_date'
    ];

    // Check if data contains PHI fields
    const dataString = JSON.stringify(data).toLowerCase();
    
    if (context.patientId && phiFields.some(field => dataString.includes(field))) {
      return 'phi';
    }

    if (sensitiveFields.some(field => dataString.includes(field))) {
      return 'sensitive';
    }

    return 'public';
  }

  /**
   * Encrypt PHI data before storage
   */
  async encryptPHI(data: any): Promise<{ encrypted: string; keyId: string }> {
    // Use AES-256-GCM encryption
    const algorithm = 'aes-256-gcm';
    const key = crypto.getRandomValues(new Uint8Array(32));
    const iv = crypto.getRandomValues(new Uint8Array(16));
    
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(JSON.stringify(data));
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      dataBuffer
    );
    
    const keyId = crypto.randomUUID();
    
    // Store encryption key securely (in production, use HSM or KMS)
    await this.storeEncryptionKey(keyId, key);
    
    return {
      encrypted: Buffer.from(encrypted).toString('base64'),
      keyId,
    };
  }

  /**
   * Report potential breach
   */
  async reportBreach(breach: Omit<BreachEvent, 'id' | 'timestamp' | 'status'>): Promise<void> {
    const breachEvent: BreachEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      status: 'discovered',
      ...breach,
    };

    try {
      // Store breach event
      await this.storeBreachEvent(breachEvent);
      
      // Immediate notification for critical breaches
      if (breach.severity === 'critical' || breach.affectedRecords > 500) {
        await this.sendImmediateBreachNotification(breachEvent);
      }
      
      // Log for monitoring
      await observability.log('error', 'HIPAA Breach Detected', {
        breachId: breachEvent.id,
        type: breach.type,
        severity: breach.severity,
        affectedRecords: breach.affectedRecords,
      });

    } catch (error) {
      console.error('Failed to report breach:', error);
      throw new Error('Breach reporting failure - manual intervention required');
    }
  }

  // Private helper methods
  private async storeAuditEvent(event: AuditEvent): Promise<void> {
    console.log('Storing audit event:', event.id);
  }

  private async storeBreachEvent(event: BreachEvent): Promise<void> {
    console.log('Storing breach event:', event.id);
  }

  private async storeEncryptionKey(keyId: string, key: Uint8Array): Promise<void> {
    console.log('Storing encryption key:', keyId);
  }

  private async sendImmediateBreachNotification(breach: BreachEvent): Promise<void> {
    console.log('Sending immediate breach notification:', breach.id);
  }
}

export const hipaaCompliance = HIPAAComplianceManager.getInstance();