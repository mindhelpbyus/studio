/**
 * EHR Repository Implementation
 * Infrastructure layer implementation using Clean Architecture principles
 */

import {
  IPatientRecordRepository,
  IEHRCompositeRepository,
  IMedicalHistoryRepository,
  IVitalSignsRepository,
  IMedicationRepository,
  IAllergyRepository,
  IDiagnosisRepository,
  IImmunizationRepository,
  ILabResultRepository,
  IRadiologyRepository,
  SearchQuery,
  RecordCriteria,
} from '../../core/repositories/patient-record.repository';
import {
  PatientRecord,
  MedicalHistory,
  VitalSigns,
  Medication,
  Allergy,
  Diagnosis,
  Immunization,
  LabResult,
  RadiologyReport,
  AuditEntry,
} from '../../core/entities/patient-record';

export class PatientRecordRepositoryImpl implements IPatientRecordRepository {
  private records: Map<string, PatientRecord> = new Map();

  async findById(id: string): Promise<PatientRecord | null> {
    return this.records.get(id) || null;
  }

  async findByPatientId(patientId: string): Promise<PatientRecord | null> {
    for (const record of this.records.values()) {
      if (record.patientId === patientId) {
        return record;
      }
    }
    return null;
  }

  async findByMRN(mrn: string): Promise<PatientRecord | null> {
    for (const record of this.records.values()) {
      // Assume MRN is stored in patient identifiers
      // This would need proper implementation based on your patient identifier system
      return record;
    }
    return null;
  }

  async save(record: PatientRecord): Promise<PatientRecord> {
    this.records.set(record.id, { ...record, updatedAt: new Date() });
    return record;
  }

  async update(id: string, updates: Partial<PatientRecord>): Promise<PatientRecord> {
    const existing = this.records.get(id);
    if (!existing) {
      throw new Error('Patient record not found');
    }

    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.records.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    if (!this.records.has(id)) {
      throw new Error('Patient record not found');
    }
    this.records.delete(id);
  }

  async findActiveRecords(): Promise<PatientRecord[]> {
    return Array.from(this.records.values()).filter(r => r.status === 'active');
  }

  async findRecordsByProvider(providerId: string): Promise<PatientRecord[]> {
    // Implementation would check provider access rules
    return Array.from(this.records.values());
  }

  async findRecordsByStatus(status: 'active' | 'inactive' | 'archived'): Promise<PatientRecord[]> {
    return Array.from(this.records.values()).filter(r => r.status === status);
  }

  async getPatientRecordsByAccess(userId: string, permissions: string[]): Promise<PatientRecord[]> {
    // Implementation would check access control rules
    return Array.from(this.records.values());
  }

  async addAccessRule(recordId: string, rule: any): Promise<void> {
    const record = this.records.get(recordId);
    if (!record) {
      throw new Error('Patient record not found');
    }

    record.accessControl.accessRules.push(rule);
    this.records.set(recordId, record);
  }

  async revokeAccess(recordId: string, userId: string): Promise<void> {
    const record = this.records.get(recordId);
    if (!record) {
      throw new Error('Patient record not found');
    }

    record.accessControl.accessRules = record.accessControl.accessRules.filter(
      rule => rule.userId !== userId
    );
    this.records.set(recordId, record);
  }

  async logAccess(recordId: string, auditEntry: AuditEntry): Promise<void> {
    const record = this.records.get(recordId);
    if (!record) {
      throw new Error('Patient record not found');
    }

    record.accessControl.auditLog.push(auditEntry);
    this.records.set(recordId, record);
  }

  async getAuditLog(recordId: string, startDate?: Date, endDate?: Date): Promise<AuditEntry[]> {
    const record = this.records.get(recordId);
    if (!record) {
      return [];
    }

    let logs = record.accessControl.auditLog;
    if (startDate) {
      logs = logs.filter(log => log.timestamp >= startDate);
    }
    if (endDate) {
      logs = logs.filter(log => log.timestamp <= endDate);
    }

    return logs;
  }
}

export class EHRCompositeRepositoryImpl implements IEHRCompositeRepository {
  constructor(
    private patientRepo: IPatientRecordRepository,
    private historyRepo: IMedicalHistoryRepository,
    private vitalsRepo: IVitalSignsRepository,
    private medicationRepo: IMedicationRepository,
    private allergyRepo: IAllergyRepository,
    private diagnosisRepo: IDiagnosisRepository,
    private immunizationRepo: IImmunizationRepository,
    private labRepo: ILabResultRepository,
    private radiologyRepo: IRadiologyRepository
  ) {}

  async getCompleteRecord(patientId: string): Promise<PatientRecord> {
    const record = await this.patientRepo.findByPatientId(patientId);
    if (!record) {
      throw new Error('Patient record not found');
    }

    // Load all related data
    const [
      medicalHistory,
      vitals,
      medications,
      allergies,
      diagnoses,
      immunizations,
      labResults,
      radiologyReports,
    ] = await Promise.all([
      this.historyRepo.findByPatientRecordId(record.id).then(h => h || null),
      this.vitalsRepo.findByPatientRecordId(record.id),
      this.medicationRepo.findByPatientRecordId(record.id),
      this.allergyRepo.findByPatientRecordId(record.id),
      this.diagnosisRepo.findByPatientRecordId(record.id),
      this.immunizationRepo.findByPatientRecordId(record.id),
      this.labRepo.findByPatientRecordId(record.id),
      this.radiologyRepo.findByPatientRecordId(record.id),
    ]);

    return {
      ...record,
      medicalHistory,
      vitals,
      medications,
      allergies,
      diagnoses,
      immunizations,
      labResults,
      radiologyReports,
    };
  }

  async createPatientRecord(patientId: string): Promise<PatientRecord> {
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

    return await this.patientRepo.save(record);
  }

  async archiveRecord(id: string): Promise<void> {
    await this.patientRepo.update(id, { status: 'archived' });
  }

  async searchRecords(query: SearchQuery): Promise<PatientRecord[]> {
    // Basic implementation - would need proper search logic
    const allRecords = await this.patientRepo.findActiveRecords();
    if (!query.query && !query.filters) {
      return allRecords;
    }

    // Apply filtering
    let results = allRecords;
    if (query.filters) {
      results = results.filter(record => {
        if (query.filters?.diagnosisCode && record.diagnoses) {
          return record.diagnoses.some(d => d.diagnosisCode === query.filters?.diagnosisCode);
        }
        if (query.filters?.medication && record.medications) {
          return record.medications.some(m => m.drugName.includes(query.filters?.medication || ''));
        }
        return true;
      });
    }

    return results;
  }

  async findRecordsByCriteria(criteria: RecordCriteria): Promise<PatientRecord[]> {
    // Implementation would apply complex criteria filtering
    return await this.patientRepo.findActiveRecords();
  }

  async getRecentActivity(patientId: string, days: number): Promise<any[]> {
    const record = await this.patientRepo.findByPatientId(patientId);
    if (!record) return [];

    const since = new Date();
    since.setDate(since.getDate() - days);

    // Get recent audit log entries
    const auditLog = await this.patientRepo.getAuditLog(record.id, since);

    // Add other recent activities
    const recentVitals = await this.vitalsRepo.findByDateRange(record.id, since, new Date());
    const recentMedications = await this.patientRepo.findByPatientId(patientId).then(() =>
      [] // Would filter medications by date
    );

    return [
      ...auditLog.map(log => ({ type: 'access', ...log })),
      ...recentVitals.map(v => ({ type: 'vitals', ...v })),
    ];
  }

  async getClinicalAlerts(recordId: string): Promise<any[]> {
    const alerts: any[] = [];

    // Check for critical vitals
    const vitalsAlerts = await this.vitalsRepo.getVitalAlerts(recordId);
    alerts.push(...vitalsAlerts.map(v => ({ type: 'vitals', severity: 'critical', data: v })));

    // Check for drug interactions
    const medicationAlerts = await this.medicationRepo.getInteractionAlerts(recordId);
    alerts.push(...medicationAlerts.map(a => ({ type: 'medication', ...a })));

    // Check for abnormal lab results
    const abnormalLabs = await this.labRepo.findAbnormalResults(recordId);
    alerts.push(...abnormalLabs.map(l => ({ type: 'lab', severity: 'abnormal', data: l })));

    return alerts;
  }

  async getPatientSummary(patientId: string): Promise<any> {
    const record = await this.getCompleteRecord(patientId);

    return {
      patientId,
      status: record.status,
      lastUpdated: record.updatedAt,
      activeProblems: record.diagnoses?.filter(d => d.status === 'active').length || 0,
      activeMedications: record.medications?.filter(m => m.status === 'active').length || 0,
      allergies: record.allergies?.length || 0,
      recentVitals: record.vitals?.slice(-1)[0], // Most recent vitals
      upcomingAppointments: [], // Would integrate with appointment system
      alerts: await this.getClinicalAlerts(record.id),
    };
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}

// Additional repository implementations would follow similar patterns
// For brevity, I'll implement a few key ones

export class MedicalHistoryRepositoryImpl implements IMedicalHistoryRepository {
  private histories: Map<string, MedicalHistory> = new Map();

  async findByPatientRecordId(recordId: string): Promise<MedicalHistory | null> {
    for (const history of this.histories.values()) {
      if (history.patientRecordId === recordId) {
        return history;
      }
    }
    return null;
  }

  async save(history: MedicalHistory): Promise<MedicalHistory> {
    this.histories.set(history.id, history);
    return history;
  }

  async update(recordId: string, updates: Partial<MedicalHistory>): Promise<MedicalHistory> {
    const existing = await this.findByPatientRecordId(recordId);
    if (!existing) {
      throw new Error('Medical history not found');
    }

    const updated = { ...existing, ...updates };
    this.histories.set(existing.id, updated);
    return updated;
  }
}

export class VitalSignsRepositoryImpl implements IVitalSignsRepository {
  private vitals: Map<string, VitalSigns> = new Map();

  async findByPatientRecordId(recordId: string): Promise<VitalSigns[]> {
    return Array.from(this.vitals.values()).filter(v => v.patientRecordId === recordId);
  }

  async findLatest(recordId: string): Promise<VitalSigns | null> {
    const patientVitals = await this.findByPatientRecordId(recordId);
    if (patientVitals.length === 0) return null;

    return patientVitals.sort((a, b) =>
      new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
    )[0];
  }

  async findByDateRange(recordId: string, start: Date, end: Date): Promise<VitalSigns[]> {
    const patientVitals = await this.findByPatientRecordId(recordId);
    return patientVitals.filter(v =>
      new Date(v.recordedAt) >= start && new Date(v.recordedAt) <= end
    );
  }

  async save(vitals: VitalSigns): Promise<VitalSigns> {
    this.vitals.set(vitals.id, vitals);
    return vitals;
  }

  async update(id: string, updates: Partial<VitalSigns>): Promise<VitalSigns> {
    const existing = this.vitals.get(id);
    if (!existing) {
      throw new Error('Vital signs not found');
    }

    const updated = { ...existing, ...updates };
    this.vitals.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    if (!this.vitals.has(id)) {
      throw new Error('Vital signs not found');
    }
    this.vitals.delete(id);
  }

  async getVitalTrends(recordId: string, vitalType: string, days: number): Promise<any[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const vitals = await this.findByDateRange(recordId, startDate, endDate);

    // Group and calculate trends
    const trends = vitals.map(v => ({
      date: v.recordedAt,
      value: this.getVitalValue(v, vitalType),
      type: vitalType,
    }));

    return trends;
  }

  async getVitalAlerts(recordId: string): Promise<VitalSigns[]> {
    const vitals = await this.findByPatientRecordId(recordId);

    return vitals.filter(v =>
      // Check for critical values
      v.heartRate < 50 || v.heartRate > 150 ||
      v.bpSystolic < 90 || v.bpSystolic > 180 ||
      v.bpDiastolic < 50 || v.bpDiastolic > 110 ||
      v.temperature > 38.5 || v.temperature < 35 ||
      v.oxygenSaturation < 92
    );
  }

  private getVitalValue(vitals: VitalSigns, type: string): number {
    switch (type) {
      case 'heartRate': return vitals.heartRate;
      case 'bloodPressure': return vitals.bpSystolic;
      case 'temperature': return vitals.temperature;
      case 'weight': return vitals.weight;
      default: return 0;
    }
  }
}
