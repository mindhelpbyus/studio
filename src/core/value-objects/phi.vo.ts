/**
 * @fileoverview Personal Health Information Value Object
 * @description HIPAA-compliant PHI data structure
 * @compliance HIPAA, GDPR
 */

export interface PersonalHealthInformation {
  readonly firstName: string;
  readonly lastName: string;
  readonly middleName?: string;
  readonly dateOfBirth: Date;
  readonly gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  readonly ssn?: string;
  readonly race?: string;
  readonly ethnicity?: string;
  readonly preferredLanguage?: string;
  readonly maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed' | 'other';
}