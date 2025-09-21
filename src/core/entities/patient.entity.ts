/**
 * @fileoverview Patient Domain Entity
 * @description Core patient entity with HIPAA-compliant data handling
 * @compliance HIPAA, GDPR, ISO/IEC 27799
 */

import { BaseEntity } from './base.entity';
import { PersonalHealthInformation } from '../value-objects/phi.vo';
import { ContactInformation } from '../value-objects/contact.vo';
import { InsuranceInformation } from '../value-objects/insurance.vo';

export interface PatientEntity extends BaseEntity {
  readonly patientId: string;
  readonly mrn: string; // Medical Record Number
  readonly personalInfo: PersonalHealthInformation;
  readonly contactInfo: ContactInformation;
  readonly insuranceInfo?: InsuranceInformation;
  readonly emergencyContacts: ContactInformation[];
  readonly consentStatus: ConsentStatus;
  readonly privacyPreferences: PrivacyPreferences;
  readonly isActive: boolean;
  readonly lastVisit?: Date;
  readonly assignedProviderId?: string;
}

export interface ConsentStatus {
  readonly treatmentConsent: boolean;
  readonly dataProcessingConsent: boolean;
  readonly marketingConsent: boolean;
  readonly researchConsent: boolean;
  readonly consentDate: Date;
  readonly consentVersion: string;
}

export interface PrivacyPreferences {
  readonly allowDataSharing: boolean;
  readonly allowCommunication: boolean;
  readonly preferredContactMethod: 'email' | 'phone' | 'sms' | 'portal';
  readonly dataRetentionPeriod: number; // in years
}