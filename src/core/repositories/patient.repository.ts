/**
 * @fileoverview Patient Repository Interface
 * @description Repository pattern for patient data access
 * @compliance Clean Architecture, Repository Pattern
 */

import { PatientEntity } from '../entities/patient.entity';

export interface PatientSearchCriteria {
  readonly mrn?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly dateOfBirth?: Date;
  readonly lastName?: string;
  readonly providerId?: string;
  readonly isActive?: boolean;
}

export interface PatientRepository {
  create(patient: PatientEntity): Promise<PatientEntity>;
  findById(id: string): Promise<PatientEntity | null>;
  findByMRN(mrn: string): Promise<PatientEntity | null>;
  search(criteria: PatientSearchCriteria): Promise<PatientEntity[]>;
  update(id: string, updates: Partial<PatientEntity>): Promise<PatientEntity>;
  delete(id: string): Promise<void>;
  count(criteria?: PatientSearchCriteria): Promise<number>;
}