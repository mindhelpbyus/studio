/**
 * GDPR Compliance Implementation
 * Handles consent management, data portability, and privacy rights
 */

import { observability } from '../monitoring/observability';

export interface ConsentRecord {
  id: string;
  userId: string;
  purpose: string;
  consentGiven: boolean;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  withdrawnAt?: Date;
  legalBasis: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests';
}

export interface DataProcessingActivity {
  id: string;
  name: string;
  purpose: string;
  dataCategories: string[];
  dataSubjects: string[];
  recipients: string[];
  retentionPeriod: number;
  securityMeasures: string[];
  transfersOutsideEU: boolean;
  legalBasis: string;
}

export interface DataSubjectRequest {
  id: string;
  userId: string;
  type: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction' | 'objection';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requestDate: Date;
  completionDate?: Date;
  reason?: string;
  metadata?: Record<string, any>;
}

export class GDPRComplianceManager {
  private static instance: GDPRComplianceManager;

  static getInstance(): GDPRComplianceManager {
    if (!GDPRComplianceManager.instance) {
      GDPRComplianceManager.instance = new GDPRComplianceManager();
    }
    return GDPRComplianceManager.instance;
  }

  /**
   * Record user consent (Article 7)
   */
  async recordConsent(consent: Omit<ConsentRecord, 'id' | 'timestamp'>): Promise<string> {
    const consentRecord: ConsentRecord = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...consent,
    };

    // Store consent record (immutable)
    await this.storeConsentRecord(consentRecord);
    
    // Log for audit
    await observability.log('info', 'GDPR Consent Recorded', {
      consentId: consentRecord.id,
      userId: consent.userId,
      purpose: consent.purpose,
      consentGiven: consent.consentGiven,
    });
    
    return consentRecord.id;
  }

  /**
   * Withdraw consent (Article 7.3)
   */
  async withdrawConsent(userId: string, purpose: string, ipAddress: string, userAgent: string): Promise<void> {
    const consentRecord: ConsentRecord = {
      id: crypto.randomUUID(),
      userId,
      purpose,
      consentGiven: false,
      timestamp: new Date(),
      withdrawnAt: new Date(),
      ipAddress,
      userAgent,
      legalBasis: 'consent',
    };

    await this.storeConsentRecord(consentRecord);
    
    // Log withdrawal
    await observability.log('info', 'GDPR Consent Withdrawn', {
      consentId: consentRecord.id,
      userId,
      purpose,
    });
  }

  /**
   * Handle data subject access request (Article 15)
   */
  async handleAccessRequest(userId: string): Promise<DataSubjectRequest> {
    const request: DataSubjectRequest = {
      id: crypto.randomUUID(),
      userId,
      type: 'access',
      status: 'processing',
      requestDate: new Date(),
    };

    // Store request
    await this.storeDataSubjectRequest(request);
    
    // Process request asynchronously
    this.processAccessRequest(request.id).catch(error => {
      console.error('Failed to process access request:', error);
    });
    
    return request;
  }

  /**
   * Export user data (Article 20 - Right to Data Portability)
   */
  async exportUserData(userId: string): Promise<{
    personalData: any;
    processingActivities: DataProcessingActivity[];
    consentHistory: ConsentRecord[];
    exportDate: Date;
    format: string;
  }> {
    const personalData = await this.getUserPersonalData(userId);
    const processingActivities = await this.getUserProcessingActivities(userId);
    const consentHistory = await this.getUserConsentHistory(userId);

    const exportData = {
      personalData,
      processingActivities,
      consentHistory,
      exportDate: new Date(),
      format: 'JSON',
    };

    // Log data export
    await observability.log('info', 'GDPR Data Export', {
      userId,
      recordCount: Object.keys(personalData).length,
    });

    return exportData;
  }

  /**
   * Delete user data (Article 17 - Right to be Forgotten)
   */
  async deleteUserData(userId: string, reason: string): Promise<void> {
    // Verify legal basis for deletion
    const canDelete = await this.verifyDeletionRights(userId);
    
    if (!canDelete) {
      throw new Error('Data deletion not permitted due to legal obligations (e.g., medical records retention)');
    }

    // Create deletion request
    const request: DataSubjectRequest = {
      id: crypto.randomUUID(),
      userId,
      type: 'erasure',
      status: 'processing',
      requestDate: new Date(),
      reason,
    };

    await this.storeDataSubjectRequest(request);

    // Anonymize or delete personal data
    await this.anonymizeUserData(userId);
    
    // Update request status
    request.status = 'completed';
    request.completionDate = new Date();
    await this.updateDataSubjectRequest(request);
    
    // Log deletion for audit
    await observability.log('info', 'GDPR Data Deletion', {
      userId,
      reason,
      requestId: request.id,
    });
  }

  /**
   * Rectify user data (Article 16)
   */
  async rectifyUserData(userId: string, corrections: Record<string, any>): Promise<void> {
    const request: DataSubjectRequest = {
      id: crypto.randomUUID(),
      userId,
      type: 'rectification',
      status: 'processing',
      requestDate: new Date(),
      metadata: { corrections },
    };

    await this.storeDataSubjectRequest(request);
    
    // Apply corrections
    await this.applyDataCorrections(userId, corrections);
    
    // Update request status
    request.status = 'completed';
    request.completionDate = new Date();
    await this.updateDataSubjectRequest(request);
    
    // Log rectification
    await observability.log('info', 'GDPR Data Rectification', {
      userId,
      requestId: request.id,
      fieldsUpdated: Object.keys(corrections),
    });
  }

  /**
   * Check if user is EU resident (GDPR applicability)
   */
  isEUResident(userLocation: { country?: string; ip?: string }): boolean {
    const euCountries = [
      'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
      'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
      'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
    ];

    if (userLocation.country) {
      return euCountries.includes(userLocation.country.toUpperCase());
    }

    // IP-based detection would require GeoIP service
    return false; // Default to false, implement GeoIP lookup
  }

  /**
   * Generate privacy notice
   */
  generatePrivacyNotice(): {
    dataController: string;
    purposes: string[];
    legalBasis: string[];
    retentionPeriods: Record<string, string>;
    rights: string[];
    contact: string;
  } {
    return {
      dataController: 'Nexus Healthcare',
      purposes: [
        'Providing healthcare services',
        'Appointment scheduling',
        'Medical record management',
        'Communication with healthcare providers',
        'Billing and insurance processing',
        'Legal compliance',
      ],
      legalBasis: [
        'Consent for marketing communications',
        'Contract for service delivery',
        'Legal obligation for medical records',
        'Vital interests for emergency care',
      ],
      retentionPeriods: {
        'Medical Records': '7 years after last treatment',
        'Appointment Data': '3 years',
        'Billing Information': '7 years',
        'Marketing Consent': 'Until withdrawn',
        'System Logs': '1 year',
      },
      rights: [
        'Right to access your data',
        'Right to rectify inaccurate data',
        'Right to erase data (where legally permissible)',
        'Right to data portability',
        'Right to restrict processing',
        'Right to object to processing',
        'Right to withdraw consent',
      ],
      contact: 'privacy@nexus.com',
    };
  }

  // Private helper methods
  private async storeConsentRecord(record: ConsentRecord): Promise<void> {
    // Implementation would store in immutable consent log
    console.log('Storing consent record:', record.id);
  }

  private async storeDataSubjectRequest(request: DataSubjectRequest): Promise<void> {
    // Implementation would store in request tracking system
    console.log('Storing data subject request:', request.id);
  }

  private async updateDataSubjectRequest(request: DataSubjectRequest): Promise<void> {
    // Implementation would update request status
    console.log('Updating data subject request:', request.id);
  }

  private async processAccessRequest(requestId: string): Promise<void> {
    // Implementation would process access request
    console.log('Processing access request:', requestId);
  }

  private async getUserPersonalData(userId: string): Promise<any> {
    // Implementation would collect all personal data
    return {
      profile: {},
      appointments: [],
      medicalRecords: [],
      communications: [],
    };
  }

  private async getUserProcessingActivities(userId: string): Promise<DataProcessingActivity[]> {
    // Implementation would return processing activities
    return [];
  }

  private async getUserConsentHistory(userId: string): Promise<ConsentRecord[]> {
    // Implementation would return consent history
    return [];
  }

  private async verifyDeletionRights(userId: string): Promise<boolean> {
    // Check if user has active medical records that must be retained
    // Check if user has pending legal obligations
    return true; // Simplified - implement proper checks
  }

  private async anonymizeUserData(userId: string): Promise<void> {
    // Replace personal identifiers with anonymous IDs
    // Keep medical data for legal retention but anonymize PII
    console.log('Anonymizing user data:', userId);
  }

  private async applyDataCorrections(userId: string, corrections: Record<string, any>): Promise<void> {
    // Apply user-requested data corrections
    console.log('Applying data corrections:', userId, corrections);
  }
}

export const gdprCompliance = GDPRComplianceManager.getInstance();

// Middleware for GDPR compliance
export function gdprComplianceMiddleware() {
  return async (req: any, res: any, next: any) => {
    // Check if user is EU resident
    const isEU = gdprCompliance.isEUResident({
      country: req.headers['cf-ipcountry'], // Cloudflare header
      ip: req.ip,
    });

    // Add GDPR context to request
    req.gdpr = {
      applicable: isEU,
      consentRequired: isEU && req.path.includes('/marketing'),
    };

    next();
  };
}