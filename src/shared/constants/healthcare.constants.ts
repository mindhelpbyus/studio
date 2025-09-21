/**
 * @fileoverview Healthcare Constants
 * @description Healthcare industry standard constants and enumerations
 * @compliance HL7 FHIR, Medical Standards
 */

// HIPAA Compliance Constants
export const HIPAA_CONSTANTS = {
  MINIMUM_RETENTION_YEARS: 6,
  MAXIMUM_SESSION_TIMEOUT_MINUTES: 30,
  BREACH_NOTIFICATION_DAYS: 60,
  AUDIT_LOG_RETENTION_YEARS: 6,
  ENCRYPTION_ALGORITHM: 'aes-256-gcm',
  KEY_DERIVATION_ITERATIONS: 100000
} as const;

// GDPR Compliance Constants
export const GDPR_CONSTANTS = {
  MAXIMUM_RETENTION_YEARS: 7,
  DATA_PORTABILITY_FORMAT: 'json',
  CONSENT_WITHDRAWAL_PROCESSING_DAYS: 30,
  BREACH_NOTIFICATION_HOURS: 72,
  DATA_SUBJECT_REQUEST_RESPONSE_DAYS: 30
} as const;

// Medical Record Constants
export const MEDICAL_RECORD_CONSTANTS = {
  MRN_PREFIX: 'MRN',
  PATIENT_ID_PREFIX: 'PAT',
  PROVIDER_ID_PREFIX: 'PRV',
  APPOINTMENT_ID_PREFIX: 'APT',
  ENCOUNTER_ID_PREFIX: 'ENC'
} as const;

// Gender Options (HL7 FHIR Compliant)
export const GENDER_OPTIONS = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
  UNKNOWN: 'unknown',
  PREFER_NOT_TO_SAY: 'prefer-not-to-say'
} as const;

// Marital Status Options (HL7 FHIR Compliant)
export const MARITAL_STATUS_OPTIONS = {
  SINGLE: 'single',
  MARRIED: 'married',
  DIVORCED: 'divorced',
  WIDOWED: 'widowed',
  SEPARATED: 'separated',
  DOMESTIC_PARTNER: 'domestic-partner',
  OTHER: 'other',
  UNKNOWN: 'unknown'
} as const;

// Contact Method Preferences
export const CONTACT_METHODS = {
  EMAIL: 'email',
  PHONE: 'phone',
  SMS: 'sms',
  MAIL: 'mail',
  PORTAL: 'portal',
  FAX: 'fax'
} as const;

// Appointment Types
export const APPOINTMENT_TYPES = {
  CONSULTATION: 'consultation',
  FOLLOW_UP: 'follow-up',
  PROCEDURE: 'procedure',
  TELEHEALTH: 'telehealth',
  EMERGENCY: 'emergency',
  PREVENTIVE: 'preventive',
  DIAGNOSTIC: 'diagnostic',
  THERAPEUTIC: 'therapeutic'
} as const;

// Appointment Status
export const APPOINTMENT_STATUS = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  CHECKED_IN: 'checked-in',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no-show',
  RESCHEDULED: 'rescheduled'
} as const;

// Priority Levels
export const PRIORITY_LEVELS = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
  CRITICAL: 'critical'
} as const;

// Insurance Plan Types
export const INSURANCE_PLAN_TYPES = {
  HMO: 'HMO',
  PPO: 'PPO',
  EPO: 'EPO',
  POS: 'POS',
  HDHP: 'HDHP',
  INDEMNITY: 'indemnity',
  OTHER: 'other'
} as const;

// Relationship Types
export const RELATIONSHIP_TYPES = {
  SELF: 'self',
  SPOUSE: 'spouse',
  CHILD: 'child',
  PARENT: 'parent',
  SIBLING: 'sibling',
  GRANDPARENT: 'grandparent',
  GRANDCHILD: 'grandchild',
  GUARDIAN: 'guardian',
  FRIEND: 'friend',
  OTHER: 'other'
} as const;

// User Roles
export const USER_ROLES = {
  PATIENT: 'patient',
  PROVIDER: 'provider',
  NURSE: 'nurse',
  ADMIN: 'admin',
  STAFF: 'staff',
  AUDITOR: 'auditor',
  BILLING: 'billing',
  SUPPORT: 'support'
} as const;

// Provider Specialties (Common Medical Specialties)
export const PROVIDER_SPECIALTIES = {
  FAMILY_MEDICINE: 'family-medicine',
  INTERNAL_MEDICINE: 'internal-medicine',
  PEDIATRICS: 'pediatrics',
  CARDIOLOGY: 'cardiology',
  DERMATOLOGY: 'dermatology',
  ENDOCRINOLOGY: 'endocrinology',
  GASTROENTEROLOGY: 'gastroenterology',
  NEUROLOGY: 'neurology',
  ONCOLOGY: 'oncology',
  ORTHOPEDICS: 'orthopedics',
  PSYCHIATRY: 'psychiatry',
  RADIOLOGY: 'radiology',
  SURGERY: 'surgery',
  UROLOGY: 'urology',
  OBSTETRICS_GYNECOLOGY: 'obstetrics-gynecology',
  OPHTHALMOLOGY: 'ophthalmology',
  OTOLARYNGOLOGY: 'otolaryngology',
  ANESTHESIOLOGY: 'anesthesiology',
  EMERGENCY_MEDICINE: 'emergency-medicine',
  PATHOLOGY: 'pathology'
} as const;

// Audit Event Types
export const AUDIT_EVENT_TYPES = {
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  DATA_ACCESS: 'data-access',
  DATA_MODIFICATION: 'data-modification',
  DATA_EXPORT: 'data-export',
  SYSTEM_ACCESS: 'system-access',
  CONFIGURATION_CHANGE: 'configuration-change',
  SECURITY_EVENT: 'security-event',
  COMPLIANCE_CHECK: 'compliance-check',
  ERROR_EVENT: 'error-event'
} as const;

// Compliance Standards
export const COMPLIANCE_STANDARDS = {
  HIPAA: 'HIPAA',
  GDPR: 'GDPR',
  PCI_DSS: 'PCI-DSS',
  ISO_27001: 'ISO-27001',
  ISO_27799: 'ISO-27799',
  NIST: 'NIST',
  FDA_21_CFR_PART_11: 'FDA-21-CFR-Part-11',
  HL7_FHIR: 'HL7-FHIR'
} as const;

// Data Classification Levels
export const DATA_CLASSIFICATION = {
  PUBLIC: 'public',
  INTERNAL: 'internal',
  CONFIDENTIAL: 'confidential',
  RESTRICTED: 'restricted',
  PHI: 'phi',
  PII: 'pii'
} as const;

// Encryption Strength Levels
export const ENCRYPTION_STRENGTH = {
  WEAK: 'weak',
  MODERATE: 'moderate',
  STRONG: 'strong',
  VERY_STRONG: 'very-strong'
} as const;

// Time Zones (Common US Time Zones)
export const TIME_ZONES = {
  EASTERN: 'America/New_York',
  CENTRAL: 'America/Chicago',
  MOUNTAIN: 'America/Denver',
  PACIFIC: 'America/Los_Angeles',
  ALASKA: 'America/Anchorage',
  HAWAII: 'Pacific/Honolulu'
} as const;

// Language Codes (ISO 639-1)
export const LANGUAGE_CODES = {
  ENGLISH: 'en',
  SPANISH: 'es',
  FRENCH: 'fr',
  GERMAN: 'de',
  ITALIAN: 'it',
  PORTUGUESE: 'pt',
  CHINESE: 'zh',
  JAPANESE: 'ja',
  KOREAN: 'ko',
  ARABIC: 'ar',
  RUSSIAN: 'ru',
  HINDI: 'hi'
} as const;

// Country Codes (ISO 3166-1 Alpha-2)
export const COUNTRY_CODES = {
  UNITED_STATES: 'US',
  CANADA: 'CA',
  MEXICO: 'MX',
  UNITED_KINGDOM: 'GB',
  FRANCE: 'FR',
  GERMANY: 'DE',
  ITALY: 'IT',
  SPAIN: 'ES',
  AUSTRALIA: 'AU',
  JAPAN: 'JP',
  CHINA: 'CN',
  INDIA: 'IN'
} as const;

// State Codes (US States)
export const US_STATE_CODES = {
  ALABAMA: 'AL',
  ALASKA: 'AK',
  ARIZONA: 'AZ',
  ARKANSAS: 'AR',
  CALIFORNIA: 'CA',
  COLORADO: 'CO',
  CONNECTICUT: 'CT',
  DELAWARE: 'DE',
  FLORIDA: 'FL',
  GEORGIA: 'GA',
  HAWAII: 'HI',
  IDAHO: 'ID',
  ILLINOIS: 'IL',
  INDIANA: 'IN',
  IOWA: 'IA',
  KANSAS: 'KS',
  KENTUCKY: 'KY',
  LOUISIANA: 'LA',
  MAINE: 'ME',
  MARYLAND: 'MD',
  MASSACHUSETTS: 'MA',
  MICHIGAN: 'MI',
  MINNESOTA: 'MN',
  MISSISSIPPI: 'MS',
  MISSOURI: 'MO',
  MONTANA: 'MT',
  NEBRASKA: 'NE',
  NEVADA: 'NV',
  NEW_HAMPSHIRE: 'NH',
  NEW_JERSEY: 'NJ',
  NEW_MEXICO: 'NM',
  NEW_YORK: 'NY',
  NORTH_CAROLINA: 'NC',
  NORTH_DAKOTA: 'ND',
  OHIO: 'OH',
  OKLAHOMA: 'OK',
  OREGON: 'OR',
  PENNSYLVANIA: 'PA',
  RHODE_ISLAND: 'RI',
  SOUTH_CAROLINA: 'SC',
  SOUTH_DAKOTA: 'SD',
  TENNESSEE: 'TN',
  TEXAS: 'TX',
  UTAH: 'UT',
  VERMONT: 'VT',
  VIRGINIA: 'VA',
  WASHINGTON: 'WA',
  WEST_VIRGINIA: 'WV',
  WISCONSIN: 'WI',
  WYOMING: 'WY',
  DISTRICT_OF_COLUMBIA: 'DC'
} as const;

// Export all constants as a single object for easy importing
export const HEALTHCARE_CONSTANTS = {
  HIPAA: HIPAA_CONSTANTS,
  GDPR: GDPR_CONSTANTS,
  MEDICAL_RECORD: MEDICAL_RECORD_CONSTANTS,
  GENDER: GENDER_OPTIONS,
  MARITAL_STATUS: MARITAL_STATUS_OPTIONS,
  CONTACT_METHODS,
  APPOINTMENT_TYPES,
  APPOINTMENT_STATUS,
  PRIORITY_LEVELS,
  INSURANCE_PLAN_TYPES,
  RELATIONSHIP_TYPES,
  USER_ROLES,
  PROVIDER_SPECIALTIES,
  AUDIT_EVENT_TYPES,
  COMPLIANCE_STANDARDS,
  DATA_CLASSIFICATION,
  ENCRYPTION_STRENGTH,
  TIME_ZONES,
  LANGUAGE_CODES,
  COUNTRY_CODES,
  US_STATE_CODES
} as const;