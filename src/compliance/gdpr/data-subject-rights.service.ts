/**
 * @fileoverview GDPR Data Subject Rights Service
 * @description Automated handling of GDPR data subject rights requests
 * @compliance GDPR Articles 15-22
 */

import { AuditLogger } from '../../security/audit/audit-logger.service';
import { Injectable } from '../../security/decorators/injectable.decorator';
import { EncryptionService } from '../../security/encryption/encryption.service';

export interface DataSubjectRequest {
    readonly requestId: string;
    readonly subjectId: string;
    readonly requestType: DataSubjectRightType;
    readonly submissionDate: Date;
    readonly requestDetails: string;
    readonly verificationStatus: VerificationStatus;
    readonly processingStatus: ProcessingStatus;
    readonly completionDeadline: Date;
    readonly requestorEmail: string;
    readonly verificationMethod: string;
}

export type DataSubjectRightType =
    | 'ACCESS'           // Article 15 - Right of access
    | 'RECTIFICATION'    // Article 16 - Right to rectification
    | 'ERASURE'          // Article 17 - Right to erasure (right to be forgotten)
    | 'RESTRICT'         // Article 18 - Right to restrict processing
    | 'PORTABILITY'      // Article 20 - Right to data portability
    | 'OBJECT'           // Article 21 - Right to object
    | 'AUTOMATED_DECISION'; // Article 22 - Rights related to automated decision-making

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type ProcessingStatus = 'RECEIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';

export interface PersonalDataExport {
    readonly subjectId: string;
    readonly exportDate: Date;
    readonly dataCategories: DataCategory[];
    readonly processingPurposes: ProcessingPurpose[];
    readonly dataRetentionPeriods: RetentionPeriod[];
    readonly thirdPartyRecipients: ThirdPartyRecipient[];
    readonly dataSource: string;
    readonly exportFormat: 'JSON' | 'CSV' | 'PDF';
}

export interface DataCategory {
    readonly category: string;
    readonly data: Record<string, any>;
    readonly collectionDate: Date;
    readonly lastModified: Date;
    readonly legalBasis: string;
}

export interface ErasureResult {
    readonly success: boolean;
    readonly erasedRecords: ErasedRecord[];
    readonly retainedRecords: RetainedRecord[];
    readonly reason: string;
    readonly completionDate: Date;
}

export interface ErasedRecord {
    readonly recordType: string;
    readonly recordId: string;
    readonly erasureMethod: 'DELETION' | 'ANONYMIZATION' | 'PSEUDONYMIZATION';
    readonly erasureDate: Date;
}

export interface RetainedRecord {
    readonly recordType: string;
    readonly recordId: string;
    readonly retentionReason: string;
    readonly legalBasis: string;
    readonly retentionPeriod: Date;
}

@Injectable()
export class DataSubjectRightsService {
    constructor(
        private readonly auditLogger: AuditLogger,
        private readonly encryptionService: EncryptionService
    ) { }

    /**
     * Submit a new data subject rights request
     */
    async submitRequest(
        request: Omit<DataSubjectRequest, 'requestId' | 'submissionDate' | 'completionDeadline'>
    ): Promise<string> {
        const requestId = this.generateRequestId();

        const fullRequest: DataSubjectRequest = {
            ...request,
            requestId,
            submissionDate: new Date(),
            completionDeadline: this.calculateDeadline(request.requestType)
        };

        // Store the request
        await this.storeRequest(fullRequest);

        // Log the request submission
        await this.auditLogger.logComplianceEvent({
            complianceType: 'DATA_SUBJECT_REQUEST_SUBMITTED',
            checkResult: 'PASS',
            details: {
                requestId,
                requestType: request.requestType,
                subjectId: request.subjectId
            }
        });

        // Start automated processing
        await this.processRequest(fullRequest);

        return requestId;
    }

    /**
     * Process access request (Article 15)
     */
    async processAccessRequest(subjectId: string): Promise<PersonalDataExport> {
        // Collect all personal data for the subject
        const personalData = await this.collectPersonalData(subjectId);

        const exportData: PersonalDataExport = {
            subjectId,
            exportDate: new Date(),
            dataCategories: personalData,
            processingPurposes: await this.getProcessingPurposes(subjectId),
            dataRetentionPeriods: await this.getRetentionPeriods(subjectId),
            thirdPartyRecipients: await this.getThirdPartyRecipients(subjectId),
            dataSource: 'Vivalé Healthcare Platform',
            exportFormat: 'JSON'
        };

        // Log the data access
        await this.auditLogger.logDataAccess({
            userId: 'system',
            sessionId: 'data-subject-request',
            resourceType: 'personal-data-export',
            resourceId: subjectId,
            action: 'EXPORT_PERSONAL_DATA'
        });

        return exportData;
    }

    /**
     * Process erasure request (Article 17 - Right to be forgotten)
     */
    async processErasureRequest(
        subjectId: string,
        reason: ErasureReason
    ): Promise<ErasureResult> {
        const erasureResult = await this.performDataErasure(subjectId, reason);

        await this.auditLogger.logComplianceEvent({
            complianceType: 'DATA_ERASURE',
            checkResult: erasureResult.success ? 'PASS' : 'FAIL',
            details: {
                subjectId,
                reason,
                erasedRecords: erasureResult.erasedRecords.length,
                retainedRecords: erasureResult.retainedRecords.length
            }
        });

        return erasureResult;
    }

    /**
     * Process rectification request (Article 16)
     */
    async processRectificationRequest(
        subjectId: string,
        corrections: DataCorrection[]
    ): Promise<RectificationResult> {
        const results = [];

        for (const correction of corrections) {
            try {
                await this.updatePersonalData(subjectId, correction);
                results.push({
                    field: correction.field,
                    success: true,
                    oldValue: correction.oldValue,
                    newValue: correction.newValue
                });
            } catch (error) {
                results.push({
                    field: correction.field,
                    success: false,
                    error: error.message
                });
            }
        }

        await this.auditLogger.logDataModification({
            userId: 'system',
            sessionId: 'data-subject-request',
            resourceType: 'personal-data',
            resourceId: subjectId,
            action: 'RECTIFY_PERSONAL_DATA',
            newValues: corrections
        });

        return {
            subjectId,
            correctionResults: results,
            completionDate: new Date()
        };
    }

    /**
     * Process data portability request (Article 20)
     */
    async processPortabilityRequest(
        subjectId: string,
        format: 'JSON' | 'CSV' | 'XML'
    ): Promise<PortabilityExport> {
        const portableData = await this.extractPortableData(subjectId);

        const exportData: PortabilityExport = {
            subjectId,
            exportDate: new Date(),
            format,
            data: portableData,
            dataIntegrityHash: await this.calculateDataHash(portableData),
            exportSize: JSON.stringify(portableData).length
        };

        await this.auditLogger.logComplianceEvent({
            complianceType: 'DATA_PORTABILITY_REQUEST',
            checkResult: 'PASS',
            details: {
                subjectId,
                format,
                exportSize: exportData.exportSize
            }
        });

        return exportData;
    }

    /**
     * Process restriction request (Article 18)
     */
    async processRestrictionRequest(
        subjectId: string,
        restrictionReason: RestrictionReason,
        processingCategories: string[]
    ): Promise<RestrictionResult> {
        const restrictions = [];

        for (const category of processingCategories) {
            await this.restrictProcessing(subjectId, category, restrictionReason);
            restrictions.push({
                category,
                restricted: true,
                restrictionDate: new Date(),
                reason: restrictionReason
            });
        }

        await this.auditLogger.logComplianceEvent({
            complianceType: 'PROCESSING_RESTRICTION',
            checkResult: 'PASS',
            details: {
                subjectId,
                restrictedCategories: processingCategories,
                reason: restrictionReason
            }
        });

        return {
            subjectId,
            restrictions,
            effectiveDate: new Date()
        };
    }

    /**
     * Verify data subject identity
     */
    async verifyDataSubjectIdentity(
        requestId: string,
        verificationData: VerificationData
    ): Promise<boolean> {
        const request = await this.getRequest(requestId);

        if (!request) {
            throw new Error('Request not found');
        }

        // Implement identity verification logic
        const isVerified = await this.performIdentityVerification(
            request.subjectId,
            verificationData
        );

        await this.updateRequestVerificationStatus(
            requestId,
            isVerified ? 'VERIFIED' : 'REJECTED'
        );

        await this.auditLogger.logSecurityEvent({
            event: 'DATA_SUBJECT_IDENTITY_VERIFICATION',
            userId: request.subjectId,
            sessionId: requestId,
            timestamp: new Date(),
            details: {
                requestId,
                verificationResult: isVerified ? 'SUCCESS' : 'FAILURE'
            }
        });

        return isVerified;
    }

    /**
     * Get request status
     */
    async getRequestStatus(requestId: string): Promise<RequestStatus> {
        const request = await this.getRequest(requestId);

        if (!request) {
            throw new Error('Request not found');
        }

        return {
            requestId,
            status: request.processingStatus,
            submissionDate: request.submissionDate,
            completionDeadline: request.completionDeadline,
            estimatedCompletion: await this.estimateCompletion(request),
            progress: await this.calculateProgress(request)
        };
    }

    // Private helper methods

    private generateRequestId(): string {
        return `DSR-${Date.now()}-${this.encryptionService.generateSecureId(8)}`;
    }

    private calculateDeadline(requestType: DataSubjectRightType): Date {
        // GDPR Article 12 - Response within one month
        const deadline = new Date();
        deadline.setMonth(deadline.getMonth() + 1);
        return deadline;
    }

    private async processRequest(request: DataSubjectRequest): Promise<void> {
        // Update status to in progress
        await this.updateRequestStatus(request.requestId, 'IN_PROGRESS');

        try {
            switch (request.requestType) {
                case 'ACCESS':
                    await this.processAccessRequest(request.subjectId);
                    break;
                case 'ERASURE':
                    await this.processErasureRequest(request.subjectId, 'DATA_SUBJECT_REQUEST');
                    break;
                case 'RECTIFICATION':
                    // Will be handled when correction data is provided
                    break;
                case 'PORTABILITY':
                    await this.processPortabilityRequest(request.subjectId, 'JSON');
                    break;
                case 'RESTRICT':
                    // Will be handled when restriction details are provided
                    break;
                default:
                    throw new Error(`Unsupported request type: ${request.requestType}`);
            }

            await this.updateRequestStatus(request.requestId, 'COMPLETED');
        } catch (error) {
            await this.updateRequestStatus(request.requestId, 'REJECTED');
            throw error;
        }
    }

    private async collectPersonalData(subjectId: string): Promise<DataCategory[]> {
        // Collect data from all systems
        const categories: DataCategory[] = [];

        // Patient data
        const patientData = await this.getPatientData(subjectId);
        if (patientData) {
            categories.push({
                category: 'Patient Information',
                data: patientData,
                collectionDate: patientData.createdAt,
                lastModified: patientData.updatedAt,
                legalBasis: 'Consent for healthcare services'
            });
        }

        // Appointment data
        const appointmentData = await this.getAppointmentData(subjectId);
        if (appointmentData.length > 0) {
            categories.push({
                category: 'Appointment History',
                data: appointmentData,
                collectionDate: appointmentData[0].createdAt,
                lastModified: new Date(),
                legalBasis: 'Legitimate interest for healthcare delivery'
            });
        }

        // Communication data
        const communicationData = await this.getCommunicationData(subjectId);
        if (communicationData.length > 0) {
            categories.push({
                category: 'Communications',
                data: communicationData,
                collectionDate: communicationData[0].createdAt,
                lastModified: new Date(),
                legalBasis: 'Consent for communication'
            });
        }

        return categories;
    }

    private async performDataErasure(
        subjectId: string,
        reason: ErasureReason
    ): Promise<ErasureResult> {
        const erasedRecords: ErasedRecord[] = [];
        const retainedRecords: RetainedRecord[] = [];

        // Check for legal obligations to retain data
        const retentionRequirements = await this.checkRetentionRequirements(subjectId);

        // Erase patient data (if no legal obligation)
        if (!retentionRequirements.patientData) {
            await this.erasePatientData(subjectId);
            erasedRecords.push({
                recordType: 'patient-data',
                recordId: subjectId,
                erasureMethod: 'DELETION',
                erasureDate: new Date()
            });
        } else {
            retainedRecords.push({
                recordType: 'patient-data',
                recordId: subjectId,
                retentionReason: 'Legal obligation - medical records retention',
                legalBasis: 'HIPAA retention requirements',
                retentionPeriod: retentionRequirements.patientDataRetentionDate
            });
        }

        // Anonymize appointment data
        await this.anonymizeAppointmentData(subjectId);
        erasedRecords.push({
            recordType: 'appointment-data',
            recordId: subjectId,
            erasureMethod: 'ANONYMIZATION',
            erasureDate: new Date()
        });

        return {
            success: true,
            erasedRecords,
            retainedRecords,
            reason: `Data erasure completed for reason: ${reason}`,
            completionDate: new Date()
        };
    }

    // Placeholder methods - implement based on your data architecture
    private async storeRequest(request: DataSubjectRequest): Promise<void> {
        // Implementation depends on your database
    }

    private async getRequest(requestId: string): Promise<DataSubjectRequest | null> {
        // Implementation depends on your database
        return null;
    }

    private async updateRequestStatus(requestId: string, status: ProcessingStatus): Promise<void> {
        // Implementation depends on your database
    }

    private async updateRequestVerificationStatus(requestId: string, status: VerificationStatus): Promise<void> {
        // Implementation depends on your database
    }

    private async getPatientData(subjectId: string): Promise<any> {
        // Implementation depends on your patient data structure
        return null;
    }

    private async getAppointmentData(subjectId: string): Promise<any[]> {
        // Implementation depends on your appointment data structure
        return [];
    }

    private async getCommunicationData(subjectId: string): Promise<any[]> {
        // Implementation depends on your communication data structure
        return [];
    }

    private async getProcessingPurposes(subjectId: string): Promise<ProcessingPurpose[]> {
        return [
            {
                purpose: 'Healthcare Treatment',
                legalBasis: 'Consent',
                dataCategories: ['Patient Information', 'Medical Records']
            }
        ];
    }

    private async getRetentionPeriods(subjectId: string): Promise<RetentionPeriod[]> {
        return [
            {
                dataCategory: 'Patient Information',
                retentionPeriod: '6 years after last treatment',
                legalBasis: 'HIPAA requirements'
            }
        ];
    }

    private async getThirdPartyRecipients(subjectId: string): Promise<ThirdPartyRecipient[]> {
        return [
            {
                recipient: 'Insurance Provider',
                purpose: 'Claims Processing',
                dataShared: ['Patient Information', 'Treatment Records'],
                legalBasis: 'Legitimate interest'
            }
        ];
    }
}

// Supporting interfaces
export type ErasureReason = 'DATA_SUBJECT_REQUEST' | 'CONSENT_WITHDRAWN' | 'PURPOSE_FULFILLED' | 'UNLAWFUL_PROCESSING';
export type RestrictionReason = 'ACCURACY_CONTESTED' | 'UNLAWFUL_PROCESSING' | 'DATA_NO_LONGER_NEEDED' | 'OBJECTION_PENDING';

export interface DataCorrection {
    readonly field: string;
    readonly oldValue: any;
    readonly newValue: any;
    readonly justification: string;
}

export interface RectificationResult {
    readonly subjectId: string;
    readonly correctionResults: CorrectionResult[];
    readonly completionDate: Date;
}

export interface CorrectionResult {
    readonly field: string;
    readonly success: boolean;
    readonly oldValue?: any;
    readonly newValue?: any;
    readonly error?: string;
}

export interface PortabilityExport {
    readonly subjectId: string;
    readonly exportDate: Date;
    readonly format: string;
    readonly data: any;
    readonly dataIntegrityHash: string;
    readonly exportSize: number;
}

export interface RestrictionResult {
    readonly subjectId: string;
    readonly restrictions: ProcessingRestriction[];
    readonly effectiveDate: Date;
}

export interface ProcessingRestriction {
    readonly category: string;
    readonly restricted: boolean;
    readonly restrictionDate: Date;
    readonly reason: RestrictionReason;
}

export interface VerificationData {
    readonly email: string;
    readonly dateOfBirth?: Date;
    readonly lastFourSSN?: string;
    readonly securityQuestion?: string;
    readonly securityAnswer?: string;
}

export interface RequestStatus {
    readonly requestId: string;
    readonly status: ProcessingStatus;
    readonly submissionDate: Date;
    readonly completionDeadline: Date;
    readonly estimatedCompletion: Date;
    readonly progress: number; // 0-100
}

export interface ProcessingPurpose {
    readonly purpose: string;
    readonly legalBasis: string;
    readonly dataCategories: string[];
}

export interface RetentionPeriod {
    readonly dataCategory: string;
    readonly retentionPeriod: string;
    readonly legalBasis: string;
}

export interface ThirdPartyRecipient {
    readonly recipient: string;
    readonly purpose: string;
    readonly dataShared: string[];
    readonly legalBasis: string;
}