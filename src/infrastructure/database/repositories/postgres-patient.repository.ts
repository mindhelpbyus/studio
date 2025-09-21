/**
 * @fileoverview PostgreSQL Patient Repository Implementation
 * @description Database implementation of patient repository using PostgreSQL
 * @compliance HIPAA, Database Security Standards
 */

import { Injectable } from '../../../security/decorators/injectable.decorator';
import { PatientRepository, PatientSearchCriteria } from '../../../core/repositories/patient.repository';
import { PatientEntity } from '../../../core/entities/patient.entity';
import { EncryptionService } from '../../../security/encryption/encryption.service';
import { AuditLogger } from '../../../security/audit/audit-logger.service';

// Mock database interface - in production this would be a real database client
interface DatabaseClient {
  query(sql: string, params: any[]): Promise<any[]>;
  transaction<T>(callback: (client: DatabaseClient) => Promise<T>): Promise<T>;
}

@Injectable()
export class PostgresPatientRepository implements PatientRepository {
  constructor(
    private readonly db: DatabaseClient,
    private readonly encryptionService: EncryptionService,
    private readonly auditLogger: AuditLogger
  ) {}

  async create(patient: PatientEntity): Promise<PatientEntity> {
    try {
      // Encrypt sensitive PHI data before storage
      const encryptedPatient = await this.encryptPatientData(patient);

      const sql = `
        INSERT INTO patients (
          id, patient_id, mrn, encrypted_personal_info, encrypted_contact_info,
          encrypted_emergency_contacts, consent_status, privacy_preferences,
          is_active, created_at, updated_at, created_by, updated_by, version, is_deleted
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *
      `;

      const params = [
        encryptedPatient.id,
        encryptedPatient.patientId,
        encryptedPatient.mrn,
        encryptedPatient.encryptedPersonalInfo,
        encryptedPatient.encryptedContactInfo,
        encryptedPatient.encryptedEmergencyContacts,
        JSON.stringify(patient.consentStatus),
        JSON.stringify(patient.privacyPreferences),
        patient.isActive,
        patient.createdAt,
        patient.updatedAt,
        patient.createdBy,
        patient.updatedBy,
        patient.version,
        patient.isDeleted
      ];

      const result = await this.db.query(sql, params);
      
      if (result.length === 0) {
        throw new Error('Failed to create patient');
      }

      // Decrypt and return the created patient
      return await this.decryptPatientData(result[0]);
    } catch (error) {
      await this.auditLogger.logSystemError({
        errorType: 'PATIENT_CREATE_ERROR',
        errorMessage: error.message,
        context: { patientId: patient.id }
      });
      throw error;
    }
  }

  async findById(id: string): Promise<PatientEntity | null> {
    try {
      const sql = `
        SELECT * FROM patients 
        WHERE id = $1 AND is_deleted = false
      `;

      const result = await this.db.query(sql, [id]);
      
      if (result.length === 0) {
        return null;
      }

      return await this.decryptPatientData(result[0]);
    } catch (error) {
      await this.auditLogger.logSystemError({
        errorType: 'PATIENT_FIND_ERROR',
        errorMessage: error.message,
        context: { patientId: id }
      });
      throw error;
    }
  }

  async findByMRN(mrn: string): Promise<PatientEntity | null> {
    try {
      const sql = `
        SELECT * FROM patients 
        WHERE mrn = $1 AND is_deleted = false
      `;

      const result = await this.db.query(sql, [mrn]);
      
      if (result.length === 0) {
        return null;
      }

      return await this.decryptPatientData(result[0]);
    } catch (error) {
      await this.auditLogger.logSystemError({
        errorType: 'PATIENT_FIND_BY_MRN_ERROR',
        errorMessage: error.message,
        context: { mrn }
      });
      throw error;
    }
  }

  async search(criteria: PatientSearchCriteria): Promise<PatientEntity[]> {
    try {
      let sql = `
        SELECT * FROM patients 
        WHERE is_deleted = false
      `;
      const params: any[] = [];
      let paramIndex = 1;

      // Build dynamic WHERE clause based on criteria
      if (criteria.mrn) {
        sql += ` AND mrn = $${paramIndex}`;
        params.push(criteria.mrn);
        paramIndex++;
      }

      if (criteria.isActive !== undefined) {
        sql += ` AND is_active = $${paramIndex}`;
        params.push(criteria.isActive);
        paramIndex++;
      }

      // Note: Searching by encrypted fields (email, phone) requires special handling
      // In production, you might use searchable encryption or hash-based lookups

      sql += ` ORDER BY created_at DESC LIMIT 100`; // Limit results for performance

      const result = await this.db.query(sql, params);
      
      // Decrypt all results
      const patients = await Promise.all(
        result.map(row => this.decryptPatientData(row))
      );

      // Apply additional filtering for encrypted fields
      return this.filterEncryptedFields(patients, criteria);
    } catch (error) {
      await this.auditLogger.logSystemError({
        errorType: 'PATIENT_SEARCH_ERROR',
        errorMessage: error.message,
        context: { criteria }
      });
      throw error;
    }
  }

  async update(id: string, updates: Partial<PatientEntity>): Promise<PatientEntity> {
    try {
      return await this.db.transaction(async (client) => {
        // First, get the current patient
        const current = await this.findById(id);
        if (!current) {
          throw new Error('Patient not found');
        }

        // Merge updates with current data
        const updatedPatient: PatientEntity = {
          ...current,
          ...updates,
          updatedAt: new Date(),
          version: current.version + 1
        };

        // Encrypt sensitive data
        const encryptedPatient = await this.encryptPatientData(updatedPatient);

        const sql = `
          UPDATE patients SET
            encrypted_personal_info = $2,
            encrypted_contact_info = $3,
            encrypted_emergency_contacts = $4,
            consent_status = $5,
            privacy_preferences = $6,
            is_active = $7,
            updated_at = $8,
            updated_by = $9,
            version = $10
          WHERE id = $1 AND version = $11
          RETURNING *
        `;

        const params = [
          id,
          encryptedPatient.encryptedPersonalInfo,
          encryptedPatient.encryptedContactInfo,
          encryptedPatient.encryptedEmergencyContacts,
          JSON.stringify(updatedPatient.consentStatus),
          JSON.stringify(updatedPatient.privacyPreferences),
          updatedPatient.isActive,
          updatedPatient.updatedAt,
          updatedPatient.updatedBy,
          updatedPatient.version,
          current.version // Optimistic locking
        ];

        const result = await client.query(sql, params);
        
        if (result.length === 0) {
          throw new Error('Patient update failed - version conflict or patient not found');
        }

        return await this.decryptPatientData(result[0]);
      });
    } catch (error) {
      await this.auditLogger.logSystemError({
        errorType: 'PATIENT_UPDATE_ERROR',
        errorMessage: error.message,
        context: { patientId: id, updates }
      });
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      // Soft delete for HIPAA compliance (maintain audit trail)
      const sql = `
        UPDATE patients SET
          is_deleted = true,
          deleted_at = $2,
          updated_at = $2
        WHERE id = $1
      `;

      const result = await this.db.query(sql, [id, new Date()]);
      
      if (result.length === 0) {
        throw new Error('Patient not found');
      }
    } catch (error) {
      await this.auditLogger.logSystemError({
        errorType: 'PATIENT_DELETE_ERROR',
        errorMessage: error.message,
        context: { patientId: id }
      });
      throw error;
    }
  }

  async count(criteria?: PatientSearchCriteria): Promise<number> {
    try {
      let sql = `
        SELECT COUNT(*) as count FROM patients 
        WHERE is_deleted = false
      `;
      const params: any[] = [];
      let paramIndex = 1;

      if (criteria?.isActive !== undefined) {
        sql += ` AND is_active = $${paramIndex}`;
        params.push(criteria.isActive);
        paramIndex++;
      }

      const result = await this.db.query(sql, params);
      return parseInt(result[0].count);
    } catch (error) {
      await this.auditLogger.logSystemError({
        errorType: 'PATIENT_COUNT_ERROR',
        errorMessage: error.message,
        context: { criteria }
      });
      throw error;
    }
  }

  private async encryptPatientData(patient: PatientEntity): Promise<any> {
    const masterKey = process.env.PATIENT_ENCRYPTION_KEY || 'default-key-change-in-production';

    // Encrypt PHI data
    const encryptedPersonalInfo = await this.encryptionService.encryptPHI(
      patient.personalInfo,
      masterKey,
      {
        userId: patient.createdBy,
        purpose: 'storage',
        dataClassification: 'PHI'
      }
    );

    const encryptedContactInfo = await this.encryptionService.encryptPHI(
      patient.contactInfo,
      masterKey,
      {
        userId: patient.createdBy,
        purpose: 'storage',
        dataClassification: 'PII'
      }
    );

    const encryptedEmergencyContacts = await this.encryptionService.encryptPHI(
      patient.emergencyContacts,
      masterKey,
      {
        userId: patient.createdBy,
        purpose: 'storage',
        dataClassification: 'PII'
      }
    );

    return {
      ...patient,
      encryptedPersonalInfo: JSON.stringify(encryptedPersonalInfo),
      encryptedContactInfo: JSON.stringify(encryptedContactInfo),
      encryptedEmergencyContacts: JSON.stringify(encryptedEmergencyContacts)
    };
  }

  private async decryptPatientData(row: any): Promise<PatientEntity> {
    const masterKey = process.env.PATIENT_ENCRYPTION_KEY || 'default-key-change-in-production';

    try {
      // Decrypt PHI data
      const encryptedPersonalInfo = JSON.parse(row.encrypted_personal_info);
      const personalInfo = await this.encryptionService.decryptPHI(
        encryptedPersonalInfo,
        masterKey,
        {
          userId: 'system', // In production, use actual user context
          purpose: 'retrieval',
          sessionId: 'system-session'
        }
      );

      const encryptedContactInfo = JSON.parse(row.encrypted_contact_info);
      const contactInfo = await this.encryptionService.decryptPHI(
        encryptedContactInfo,
        masterKey,
        {
          userId: 'system',
          purpose: 'retrieval',
          sessionId: 'system-session'
        }
      );

      const encryptedEmergencyContacts = JSON.parse(row.encrypted_emergency_contacts);
      const emergencyContacts = await this.encryptionService.decryptPHI(
        encryptedEmergencyContacts,
        masterKey,
        {
          userId: 'system',
          purpose: 'retrieval',
          sessionId: 'system-session'
        }
      );

      return {
        id: row.id,
        patientId: row.patient_id,
        mrn: row.mrn,
        personalInfo,
        contactInfo,
        emergencyContacts,
        consentStatus: JSON.parse(row.consent_status),
        privacyPreferences: JSON.parse(row.privacy_preferences),
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        createdBy: row.created_by,
        updatedBy: row.updated_by,
        version: row.version,
        isDeleted: row.is_deleted,
        deletedAt: row.deleted_at,
        deletedBy: row.deleted_by,
        tenantId: row.tenant_id
      };
    } catch (error) {
      await this.auditLogger.logSystemError({
        errorType: 'PATIENT_DECRYPTION_ERROR',
        errorMessage: error.message,
        context: { patientId: row.id }
      });
      throw new Error('Failed to decrypt patient data');
    }
  }

  private filterEncryptedFields(
    patients: PatientEntity[], 
    criteria: PatientSearchCriteria
  ): PatientEntity[] {
    return patients.filter(patient => {
      // Filter by email if specified
      if (criteria.email && patient.contactInfo.email !== criteria.email) {
        return false;
      }

      // Filter by phone if specified
      if (criteria.phone && patient.contactInfo.phone !== criteria.phone) {
        return false;
      }

      // Filter by last name if specified
      if (criteria.lastName && 
          !patient.personalInfo.lastName.toLowerCase().includes(criteria.lastName.toLowerCase())) {
        return false;
      }

      // Filter by date of birth if specified
      if (criteria.dateOfBirth && 
          patient.personalInfo.dateOfBirth.getTime() !== criteria.dateOfBirth.getTime()) {
        return false;
      }

      return true;
    });
  }
}