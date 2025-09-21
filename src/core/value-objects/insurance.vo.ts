/**
 * @fileoverview Insurance Information Value Object
 * @description Insurance data structure for healthcare billing
 * @compliance HIPAA, PCI DSS
 */

export interface InsuranceInformation {
  readonly primary: InsurancePolicy;
  readonly secondary?: InsurancePolicy;
  readonly tertiary?: InsurancePolicy;
}

export interface InsurancePolicy {
  readonly policyId: string;
  readonly insuranceCompany: string;
  readonly policyNumber: string;
  readonly groupNumber?: string;
  readonly subscriberId: string;
  readonly subscriberName: string;
  readonly subscriberRelationship: 'self' | 'spouse' | 'child' | 'other';
  readonly effectiveDate: Date;
  readonly expirationDate?: Date;
  readonly copay?: number;
  readonly deductible?: number;
  readonly isActive: boolean;
  readonly planType: 'HMO' | 'PPO' | 'EPO' | 'POS' | 'HDHP' | 'other';
  readonly coverageDetails?: CoverageDetails;
}

export interface CoverageDetails {
  readonly preventiveCare: boolean;
  readonly emergencyCare: boolean;
  readonly prescriptionDrugs: boolean;
  readonly mentalHealth: boolean;
  readonly maternitycare: boolean;
  readonly pediatricCare: boolean;
  readonly visionCare: boolean;
  readonly dentalCare: boolean;
}