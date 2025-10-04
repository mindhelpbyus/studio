/**
 * EHR Repository Interfaces
 * Following Clean Architecture principles for data access abstraction
 */

import {
  PatientRecord,
  MedicalHistory,
  VitalSigns,
  Medication,
  Allergy,
  Diagnosis,
  Immunization,
  Procedure,
  LabResult,
  RadiologyReport,
  AuditEntry,
} from '../entities/patient-record';

export interface IPatientRecordRepository {
  // Patient Record CRUD
  findById(id: string): Promise<PatientRecord | null>;
  findByPatientId(patientId: string): Promise<PatientRecord | null>;
  findByMRN(mrn: string): Promise<PatientRecord | null>;
  save(record: PatientRecord): Promise<PatientRecord>;
  update(id: string, updates: Partial<PatientRecord>): Promise<PatientRecord>;
  delete(id: string): Promise<void>;

  // Bulk operations
  findActiveRecords(): Promise<PatientRecord[]>;
  findRecordsByProvider(providerId: string): Promise<PatientRecord[]>;
  findRecordsByStatus(status: 'active' | 'inactive' | 'archived'): Promise<PatientRecord[]>;

  // Access Control
  getPatientRecordsByAccess(userId: string, permissions: string[]): Promise<PatientRecord[]>;
  addAccessRule(recordId: string, rule: any): Promise<void>;
  revokeAccess(recordId: string, userId: string): Promise<void>;

  // Audit Logging
  logAccess(recordId: string, auditEntry: AuditEntry): Promise<void>;
  getAuditLog(recordId: string, startDate?: Date, endDate?: Date): Promise<AuditEntry[]>;
}

export interface IMedicalHistoryRepository {
  findByPatientRecordId(recordId: string): Promise<MedicalHistory | null>;
  save(history: MedicalHistory): Promise<MedicalHistory>;
  update(recordId: string, updates: Partial<MedicalHistory>): Promise<MedicalHistory>;
}

export interface IVitalSignsRepository {
  findByPatientRecordId(recordId: string): Promise<VitalSigns[]>;
  findLatest(recordId: string): Promise<VitalSigns | null>;
  findByDateRange(recordId: string, start: Date, end: Date): Promise<VitalSigns[]>;
  save(vitals: VitalSigns): Promise<VitalSigns>;
  update(id: string, updates: Partial<VitalSigns>): Promise<VitalSigns>;
  delete(id: string): Promise<void>;

  // Analytics
  getVitalTrends(recordId: string, vitalType: string, days: number): Promise<any[]>;
  getVitalAlerts(recordId: string): Promise<VitalSigns[]>;
}

export interface IMedicationRepository {
  findByPatientRecordId(recordId: string): Promise<Medication[]>;
  findActive(recordId: string): Promise<Medication[]>;
  findById(id: string): Promise<Medication | null>;
  save(medication: Medication): Promise<Medication>;
  update(id: string, updates: Partial<Medication>): Promise<Medication>;
  discontinue(id: string, reason?: string): Promise<Medication>;

  // Drug Interactions
  checkInteractions(recordId: string, drugName: string): Promise<any[]>;
  getInteractionAlerts(recordId: string): Promise<any[]>;

  // Prescriptions
  findPrescriptionsByProvider(providerId: string): Promise<Medication[]>;
}

export interface IAllergyRepository {
  findByPatientRecordId(recordId: string): Promise<Allergy[]>;
  findSevereAllergies(recordId: string): Promise<Allergy[]>;
  save(allergy: Allergy): Promise<Allergy>;
  update(id: string, updates: Partial<Allergy>): Promise<Allergy>;
  delete(id: string): Promise<void>;

  // Screening
  checkAllergy(medicationName: string, recordId: string): Promise<boolean>;
}

export interface IDiagnosisRepository {
  findByPatientRecordId(recordId: string): Promise<Diagnosis[]>;
  findActive(recordId: string): Promise<Diagnosis[]>;
  findByCode(recordId: string, code: string): Promise<Diagnosis[]>;
  save(diagnosis: Diagnosis): Promise<Diagnosis>;
  update(id: string, updates: Partial<Diagnosis>): Promise<Diagnosis>;
  resolve(id: string): Promise<Diagnosis>;
}

export interface IImmunizationRepository {
  findByPatientRecordId(recordId: string): Promise<Immunization[]>;
  findDueVaccines(recordId: string): Promise<any[]>;
  save(immunization: Immunization): Promise<Immunization>;
  update(id: string, updates: Partial<Immunization>): Promise<Immunization>;

  // CDC Recommendations
  getRecommendedVaccines(patientId: string, age?: number): Promise<any[]>;
  getVaccinationHistory(patientId: string): Promise<Immunization[]>;
}

export interface IProcedureRepository {
  findByPatientRecordId(recordId: string): Promise<Procedure[]>;
  findByDateRange(recordId: string, start: Date, end: Date): Promise<Procedure[]>;
  save(procedure: Procedure): Promise<Procedure>;
  update(id: string, updates: Partial<Procedure>): Promise<Procedure>;
}

export interface ILabResultRepository {
  findByPatientRecordId(recordId: string): Promise<LabResult[]>;
  findByTestType(recordId: string, testType: string): Promise<LabResult[]>;
  findAbnormalResults(recordId: string): Promise<LabResult[]>;
  findCriticalResults(recordId: string): Promise<LabResult[]>;
  save(result: LabResult): Promise<LabResult>;
  update(id: string, updates: Partial<LabResult>): Promise<LabResult>;
  amendResult(id: string, amendment: string): Promise<LabResult>;

  // Analytics
  getLabTrends(recordId: string, testCode: string, days: number): Promise<any[]>;
}

export interface IRadiologyRepository {
  findByPatientRecordId(recordId: string): Promise<RadiologyReport[]>;
  findPreliminaryReports(recordId: string): Promise<RadiologyReport[]>;
  save(report: RadiologyReport): Promise<RadiologyReport>;
  update(id: string, updates: Partial<RadiologyReport>): Promise<RadiologyReport>;
  finalizeReport(id: string): Promise<RadiologyReport>;
}

// Composite Repository for unified EHR operations
export interface IEHRCompositeRepository {
  // Core operations
  getCompleteRecord(patientId: string): Promise<PatientRecord>;
  createPatientRecord(patientId: string): Promise<PatientRecord>;
  archiveRecord(id: string): Promise<void>;

  // Search and filtering
  searchRecords(query: SearchQuery): Promise<PatientRecord[]>;
  findRecordsByCriteria(criteria: RecordCriteria): Promise<PatientRecord[]>;

  // Cross-entity queries
  getRecentActivity(patientId: string, days: number): Promise<any[]>;
  getClinicalAlerts(recordId: string): Promise<any[]>;
  getPatientSummary(patientId: string): Promise<any>;
}

// Search interfaces
export interface SearchQuery {
  query?: string;
  filters?: {
    providerId?: string;
    diagnosisCode?: string;
    medication?: string;
    dateRange?: {
      start: Date;
      end: Date;
    };
    recordStatus?: 'active' | 'inactive' | 'archived';
  };
  pagination?: {
    page: number;
    limit: number;
  };
  sortBy?: 'createdAt' | 'updatedAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface RecordCriteria {
  patientId?: string;
  mrn?: string;
  diagnosis?: string[];
  medication?: string[];
  appointmentDate?: Date;
  ageRange?: { min: number; max: number };
  gender?: string;
  insurance?: string;
}
