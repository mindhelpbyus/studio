/**
 * Electronic Health Records (EHR) Entities
 * Core domain entities for patient medical records following Clean Architecture
 */

export interface PatientRecord {
  id: string;
  patientId: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'inactive' | 'archived';

  // Relationships
  medicalHistory?: MedicalHistory;
  vitals?: VitalSigns[];
  medications?: Medication[];
  allergies?: Allergy[];
  diagnoses?: Diagnosis[];
  immunizations?: Immunization[];
  procedures?: Procedure[];
  labResults?: LabResult[];
  radiologyReports?: RadiologyReport[];

  // Access control
  accessControl: AccessControl;
}

export interface MedicalHistory {
  id: string;
  patientRecordId: string;
  chiefComplaint: string;
  historyOfPresentIllness: string;
  pastMedicalHistory: string;
  surgicalHistory: string;
  familyHistory: string;
  socialHistory: string;
  reviewOfSystems: string;
  physicalExam: string;
  assessment: string;
  plan: string;
}

export interface VitalSigns {
  id: string;
  patientRecordId: string;
  recordedAt: Date;
  bpSystolic: number; // mmHg
  bpDiastolic: number; // mmHg
  heartRate: number; // bpm
  temperature: number; // degrees Celsius
  temperatureUnit: 'C' | 'F';
  respiratoryRate: number; // breaths/min
  oxygenSaturation: number; // %
  weight: number; // kg
  height: number; // cm
  bmi?: number; // calculated
  recordedBy: string; // provider ID
  notes?: string;
}

export interface Medication {
  id: string;
  patientRecordId: string;
  drugName: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  route: string;
  startDate: Date;
  endDate?: Date;
  prescribedBy: string; // provider ID
  prescriptionId: string;
  status: 'active' | 'discontinued' | 'completed';
  indication: string;
  instructions: string;
  sideEffects?: string[];
  interactions?: DrugInteraction[];
}

export interface DrugInteraction {
  id: string;
  medicationId: string;
  interactingDrug: string;
  severity: 'minor' | 'moderate' | 'major';
  description: string;
  management: string;
}

export interface Allergy {
  id: string;
  patientRecordId: string;
  allergen: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe';
  onset?: 'immediate' | 'delayed';
  notes?: string;
}

export interface Diagnosis {
  id: string;
  patientRecordId: string;
  diagnosisCode: string; // ICD-10
  description: string;
  dateOfDiagnosis: Date;
  severity?: 'acute' | 'chronic';
  status: 'active' | 'resolved' | 'recurring';
  providerId: string;
}

export interface Immunization {
  id: string;
  patientRecordId: string;
  vaccineName: string;
  cvxCode?: string; // CDC vaccine code
  administeredDate: Date;
  administeredBy: string;
  lotNumber?: string;
  expirationDate?: Date;
  site?: string;
  route?: string;
  dose?: string;
  notes?: string;
}

export interface Procedure {
  id: string;
  patientRecordId: string;
  procedureCode: string; // CPT
  description: string;
  performedAt: Date;
  providerId: string;
  notes?: string;
  complications?: string[];
}

export interface LabResult {
  id: string;
  patientRecordId: string;
  testName: string;
  loincCode?: string;
  value: string;
  unit?: string;
  referenceRange?: string;
  interpretation: 'normal' | 'abnormal' | 'critical';
  status: 'preliminary' | 'final' | 'amended';
  collectedAt: Date;
  resultedAt?: Date;
  orderedBy: string;
  performedBy?: string;
  notes?: string;
}

export interface RadiologyReport {
  id: string;
  patientRecordId: string;
  examType: string;
  cptCode?: string;
  findings: string;
  impression: string;
  recommendations?: string;
  orderedBy: string;
  performedBy?: string;
  examDate: Date;
  reportDate: Date;
  status: 'preliminary' | 'final';
  attachments?: string[]; // URLs to images/DICOM files
}

// Security & Access Control
export interface AccessControl {
  patientRecordId: string;
  accessRules: AccessRule[];
  auditLog: AuditEntry[];
}

export interface AccessRule {
  id: string;
  userId: string;
  userRole: 'patient' | 'provider' | 'admin' | 'caregiver';
  permissions: Permission[];
  effectiveFrom?: Date;
  effectiveTo?: Date;
}

export type Permission =
  | 'read_basic'
  | 'read_full'
  | 'write'
  | 'share'
  | 'delete'
  | 'export';

export interface AuditEntry {
  id: string;
  patientRecordId: string;
  userId: string;
  action: 'viewed' | 'created' | 'updated' | 'deleted' | 'exported' | 'shared';
  timestamp: Date;
  details?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
}

// Value Objects
export interface PatientIdentifier {
  id: string;
  type: 'MRN' | 'SSN' | 'MPI'; // Medical Record Number, Social Security Number, Master Patient Index
  value: string;
  assigningAuthority?: string;
}

export interface VitalSignRange {
  min: number;
  max: number;
  unit: string;
  ageRange?: string;
  gender?: 'male' | 'female' | 'other';
}
