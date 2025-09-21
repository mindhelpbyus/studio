/**
 * @fileoverview HIPAA Compliance Policy
 * @description HIPAA compliance rules and validation
 * @compliance HIPAA Privacy Rule, Security Rule, Breach Notification Rule
 */

export interface HIPAACompliancePolicy {
  readonly privacyRule: PrivacyRulePolicy;
  readonly securityRule: SecurityRulePolicy;
  readonly breachNotification: BreachNotificationPolicy;
  readonly businessAssociate: BusinessAssociatePolicy;
}

export interface PrivacyRulePolicy {
  readonly minimumNecessary: boolean;
  readonly authorizedDisclosures: string[];
  readonly patientRights: PatientRights;
  readonly noticeOfPrivacyPractices: boolean;
  readonly complaintProcess: boolean;
}

export interface PatientRights {
  readonly accessToRecords: boolean;
  readonly requestAmendments: boolean;
  readonly requestRestrictions: boolean;
  readonly requestAlternativeCommunications: boolean;
  readonly accountingOfDisclosures: boolean;
}

export interface SecurityRulePolicy {
  readonly administrativeSafeguards: AdministrativeSafeguards;
  readonly physicalSafeguards: PhysicalSafeguards;
  readonly technicalSafeguards: TechnicalSafeguards;
}

export interface AdministrativeSafeguards {
  readonly securityOfficer: boolean;
  readonly workforceTraining: boolean;
  readonly accessManagement: boolean;
  readonly informationAccessManagement: boolean;
  readonly securityAwareness: boolean;
  readonly securityIncidentProcedures: boolean;
  readonly contingencyPlan: boolean;
  readonly regularSecurityEvaluations: boolean;
}

export interface PhysicalSafeguards {
  readonly facilityAccessControls: boolean;
  readonly workstationUse: boolean;
  readonly deviceAndMediaControls: boolean;
}

export interface TechnicalSafeguards {
  readonly accessControl: boolean;
  readonly auditControls: boolean;
  readonly integrity: boolean;
  readonly personOrEntityAuthentication: boolean;
  readonly transmissionSecurity: boolean;
}

export interface BreachNotificationPolicy {
  readonly riskAssessment: boolean;
  readonly individualNotification: boolean;
  readonly mediaNotification: boolean;
  readonly hhsNotification: boolean;
  readonly timeframes: {
    readonly individualNotification: number; // days
    readonly mediaNotification: number; // days
    readonly hhsNotification: number; // days
  };
}

export interface BusinessAssociatePolicy {
  readonly agreementRequired: boolean;
  readonly safeguardRequirements: boolean;
  readonly subcontractorOversight: boolean;
  readonly incidentReporting: boolean;
}

export const DEFAULT_HIPAA_POLICY: HIPAACompliancePolicy = {
  privacyRule: {
    minimumNecessary: true,
    authorizedDisclosures: [
      'treatment',
      'payment',
      'healthcare_operations',
      'public_health',
      'law_enforcement',
      'judicial_proceedings'
    ],
    patientRights: {
      accessToRecords: true,
      requestAmendments: true,
      requestRestrictions: true,
      requestAlternativeCommunications: true,
      accountingOfDisclosures: true
    },
    noticeOfPrivacyPractices: true,
    complaintProcess: true
  },
  securityRule: {
    administrativeSafeguards: {
      securityOfficer: true,
      workforceTraining: true,
      accessManagement: true,
      informationAccessManagement: true,
      securityAwareness: true,
      securityIncidentProcedures: true,
      contingencyPlan: true,
      regularSecurityEvaluations: true
    },
    physicalSafeguards: {
      facilityAccessControls: true,
      workstationUse: true,
      deviceAndMediaControls: true
    },
    technicalSafeguards: {
      accessControl: true,
      auditControls: true,
      integrity: true,
      personOrEntityAuthentication: true,
      transmissionSecurity: true
    }
  },
  breachNotification: {
    riskAssessment: true,
    individualNotification: true,
    mediaNotification: true,
    hhsNotification: true,
    timeframes: {
      individualNotification: 60,
      mediaNotification: 60,
      hhsNotification: 60
    }
  },
  businessAssociate: {
    agreementRequired: true,
    safeguardRequirements: true,
    subcontractorOversight: true,
    incidentReporting: true
  }
};