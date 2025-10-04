/**
 * Electronic Health Records Use Cases
 * Business logic layer following Clean Architecture principles
 */

import {
  IPatientRecordRepository,
  IEHRCompositeRepository,
  IMedicalHistoryRepository,
  IVitalSignsRepository,
  IMedicationRepository,
  SearchQuery,
} from '../repositories/patient-record.repository';
import {
  PatientRecord,
  MedicalHistory,
  VitalSigns,
  Medication,
  AuditEntry,
  Permission,
} from '../entities/patient-record';

export class PatientRecordUseCase {
  constructor(
    private patientRecordRepo: IPatientRecordRepository,
    private compositeRepo: IEHRCompositeRepository,
    private auditService?: any,
    private complianceService?: any
  ) {}

  async getPatientRecord(recordId: string, userId: string): Promise<PatientRecord | null> {
    // Check access permissions
    const hasAccess = await this.checkAccess(recordId, userId, ['read_basic', 'read_full']);
    if (!hasAccess) {
      throw new Error('Access denied');
    }

    const record = await this.patientRecordRepo.findById(recordId);
    if (record) {
      await this.logAccess(recordId, userId, 'viewed');
    }
    return record;
  }

  async createPatientRecord(patientId: string, userId: string): Promise<PatientRecord> {
    // Create new EHR record
    const record: PatientRecord = {
      id: this.generateId(),
      patientId,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active',
      accessControl: {
        patientRecordId: this.generateId(),
        accessRules: [],
        auditLog: [],
      },
    };

    // Ensure HIPAA compliance
    await this.complianceService.encryptPatientData(record);

    const savedRecord = await this.patientRecordRepo.save(record);
    await this.logAccess(savedRecord.id, userId, 'created');

    return savedRecord;
  }

  async updatePatientRecord(
    recordId: string,
    updates: Partial<PatientRecord>,
    userId: string
  ): Promise<PatientRecord> {
    // Check write permissions
    const hasAccess = await this.checkAccess(recordId, userId, ['write']);
    if (!hasAccess) {
      throw new Error('Write access denied');
    }

    const existing = await this.patientRecordRepo.findById(recordId);
    if (!existing) {
      throw new Error('Patient record not found');
    }

    // Validate updates against business rules
    await this.validateRecordUpdates(updates);

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };

    const savedRecord = await this.patientRecordRepo.update(recordId, updated);
    await this.logAccess(recordId, userId, 'updated', updates);

    return savedRecord;
  }

  async searchPatientRecords(query: SearchQuery, userId: string): Promise<PatientRecord[]> {
    // Filter by accessible records
    const accessibleRecords = await this.patientRecordRepo.getPatientRecordsByAccess(
      userId,
      ['read_basic', 'read_full']
    );

    // Apply search query
    const records = await this.compositeRepo.searchRecords(query);

    // Intersection of accessible and searched records
    const accessibleIds = new Set(accessibleRecords.map(r => r.id));
    return records.filter(record => accessibleIds.has(record.id));
  }

  private async checkAccess(recordId: string, userId: string, permissions: string[]): Promise<boolean> {
    const record = await this.patientRecordRepo.findById(recordId);
    if (!record) return false;

    const userRule = record.accessControl.accessRules.find(rule =>
      rule.userId === userId &&
      new Date() >= (rule.effectiveFrom || new Date(0)) &&
      (!rule.effectiveTo || new Date() <= rule.effectiveTo)
    );

    if (!userRule) return false;
    return permissions.some(p => userRule.permissions.includes(p));
  }

  private async logAccess(
    recordId: string,
    userId: string,
    action: string,
    details?: any
  ): Promise<void> {
    const auditEntry: AuditEntry = {
      id: this.generateId(),
      patientRecordId: recordId,
      userId,
      action: action as any,
      timestamp: new Date(),
      details,
      ipAddress: '', // Would be populated by middleware
      userAgent: '', // Would be populated by middleware
    };

    await this.patientRecordRepo.logAccess(recordId, auditEntry);
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  private async validateRecordUpdates(updates: Partial<PatientRecord>): Promise<void> {
    // Validate against business rules and compliance requirements
    // Implementation would include HIPAA compliance checks
  }
}

export class MedicalHistoryUseCase {
  constructor(
    private historyRepo: IMedicalHistoryRepository
  ) {}

  async createMedicalHistory(
    patientRecordId: string,
    userId: string,
    historyData: Omit<MedicalHistory, 'id' | 'patientRecordId'>
  ): Promise<MedicalHistory> {
    const history: MedicalHistory = {
      id: this.generateId(),
      patientRecordId,
      ...historyData,
    };

    return await this.historyRepo.save(history);
  }

  async updateMedicalHistory(
    recordId: string,
    userId: string,
    updates: Partial<MedicalHistory>
  ): Promise<MedicalHistory> {
    return await this.historyRepo.update(recordId, updates);
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}

export class VitalSignsUseCase {
  constructor(
    private vitalsRepo: IVitalSignsRepository,
    private vitalsCalculator?: any
  ) {}

  async recordVitalSigns(
    patientRecordId: string,
    userId: string,
    vitalsData: Omit<VitalSigns, 'id' | 'patientRecordId' | 'bmi'>
  ): Promise<VitalSigns> {
    // Calculate BMI if weight and height provided
    const bmi = vitalsData.weight && vitalsData.height
      ? this.vitalsCalculator.calculateBMI(vitalsData.weight, vitalsData.height)
      : undefined;

    const vitals: VitalSigns = {
      id: this.generateId(),
      patientRecordId,
      ...vitalsData,
      bmi,
    };

    // Validate ranges
    await this.validateVitalRanges(vitals);

    return await this.vitalsRepo.save(vitals);
  }

  async getVitalTrends(
    patientRecordId: string,
    userId: string,
    vitalType: string,
    days: number
  ): Promise<any[]> {
    return await this.vitalsRepo.getVitalTrends(patientRecordId, vitalType, days);
  }

  async getVitalAlerts(patientRecordId: string, userId: string): Promise<VitalSigns[]> {
    // Return vitals that are outside normal ranges or trending abnormally
    return await this.vitalsRepo.getVitalAlerts(patientRecordId);
  }

  private async validateVitalRanges(vitals: VitalSigns): Promise<void> {
    // Implementation would validate against normal ranges
    // and flag abnormal values for provider review
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}

export class MedicationUseCase {
  constructor(
    private medicationRepo: IMedicationRepository,
    private drugInteractionService?: any,
    private allergyRepo?: any
  ) {}

  async prescribeMedication(
    patientRecordId: string,
    userId: string,
    medicationData: Omit<Medication, 'id' | 'patientRecordId' | 'status'>
  ): Promise<Medication> {
    // Check for allergies
    if (this.allergyRepo) {
      const allergies = await this.allergyRepo.findByPatientRecordId(patientRecordId);
      const hasAllergy = await this.checkMedicationAllergy(
        medicationData.drugName,
        patientRecordId
      );
      if (hasAllergy) {
        throw new Error('Patient has allergy to prescribed medication');
      }
    }

    // Check for drug interactions
    if (this.drugInteractionService) {
      const interactions = await this.drugInteractionService.checkInteractions(
        patientRecordId,
        medicationData.drugName
      );
      if (interactions.some((i: any) => i.severity === 'major')) {
        throw new Error('Major drug interaction detected');
      }
    }

    const medication: Medication = {
      id: this.generateId(),
      patientRecordId,
      status: 'active',
      ...medicationData,
    };

    return await this.medicationRepo.save(medication);
  }

  async getActiveMedications(patientRecordId: string, userId: string): Promise<Medication[]> {
    return await this.medicationRepo.findActive(patientRecordId);
  }

  async getInteractionAlerts(patientRecordId: string, userId: string): Promise<any[]> {
    return await this.medicationRepo.getInteractionAlerts(patientRecordId);
  }

  private async checkMedicationAllergy(medication: string, recordId: string): Promise<boolean> {
    // Implementation would check medication ingredients against patient allergies
    return false;
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}

export class EHRCompositeUseCase {
  constructor(
    private compositeRepo: IEHRCompositeRepository
  ) {}

  async getCompleteRecord(patientId: string, userId: string): Promise<PatientRecord> {
    return await this.compositeRepo.getCompleteRecord(patientId);
  }

  async getPatientSummary(patientId: string, userId: string): Promise<any> {
    return await this.compositeRepo.getPatientSummary(patientId);
  }

  async getClinicalAlerts(recordId: string, userId: string): Promise<any[]> {
    return await this.compositeRepo.getClinicalAlerts(recordId);
  }

  async getRecentActivity(patientId: string, userId: string, days: number): Promise<any[]> {
    return await this.compositeRepo.getRecentActivity(patientId, days);
  }
}
