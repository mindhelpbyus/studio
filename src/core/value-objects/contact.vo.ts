/**
 * @fileoverview Contact Information Value Object
 * @description Contact information data structure
 * @compliance HIPAA, GDPR
 */

export interface ContactInformation {
  readonly name?: string;
  readonly relationship?: string;
  readonly email?: string;
  readonly phone: string;
  readonly alternatePhone?: string;
  readonly address?: Address;
  readonly preferredContactMethod?: 'email' | 'phone' | 'sms' | 'mail';
  readonly isPrimary?: boolean;
}

export interface Address {
  readonly street: string;
  readonly street2?: string;
  readonly city: string;
  readonly state: string;
  readonly zipCode: string;
  readonly country: string;
  readonly type?: 'home' | 'work' | 'billing' | 'shipping';
}