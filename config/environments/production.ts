/**
 * @fileoverview Production Environment Configuration
 * @description Production-specific configuration settings
 * @compliance HIPAA, GDPR, PCI DSS, ISO/IEC 27001
 */

export const productionConfig = {
  environment: 'production',
  
  // Application settings
  app: {
    name: 'Vivalé Healthcare Platform',
    version: process.env.APP_VERSION || '1.0.0',
    port: parseInt(process.env.PORT || '3000'),
    host: process.env.HOST || '0.0.0.0',
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://healthcare.vivale.com'
  },

  // Security settings (Production-hardened)
  security: {
    jwtSecret: process.env.JWT_SECRET!, // Required in production
    jwtExpiresIn: '15m', // Shorter for production
    refreshTokenExpiresIn: '24h', // Shorter for production
    sessionTimeout: 15 * 60, // 15 minutes
    maxLoginAttempts: 3, // Stricter for production
    lockoutDuration: 30 * 60, // 30 minutes
    passwordMinLength: 12, // Stronger passwords
    requireMFA: true, // Required in production
    encryptionAlgorithm: 'aes-256-gcm',
    hashRounds: 15, // Higher for production
    csrfProtection: true,
    rateLimiting: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100,
      skipSuccessfulRequests: false
    }
  },

  // Database settings
  database: {
    type: 'postgresql',
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME!,
    username: process.env.DB_USERNAME!,
    password: process.env.DB_PASSWORD!,
    ssl: {
      rejectUnauthorized: true,
      ca: process.env.DB_SSL_CA,
      cert: process.env.DB_SSL_CERT,
      key: process.env.DB_SSL_KEY
    },
    logging: false, // Disabled for performance
    synchronize: false, // Never in production
    dropSchema: false,
    connectionPoolSize: 20,
    acquireTimeout: 60000,
    timeout: 60000
  },

  // Logging settings
  logging: {
    level: 'info',
    format: 'json',
    auditLevel: 'info',
    enableConsole: false,
    enableFile: true,
    enableAuditFile: true,
    enableSyslog: true,
    maxFileSize: '100MB',
    maxFiles: 30,
    syslogHost: process.env.SYSLOG_HOST,
    syslogPort: parseInt(process.env.SYSLOG_PORT || '514')
  },

  // Compliance settings (Strict production compliance)
  compliance: {
    hipaa: {
      enabled: true,
      strictMode: true,
      auditAllAccess: true,
      minimumNecessaryCheck: true,
      dataRetentionDays: 2555, // 7 years
      breachNotificationEnabled: true,
      businessAssociateAgreementRequired: true
    },
    gdpr: {
      enabled: true,
      consentRequired: true,
      dataPortability: true,
      rightToErasure: true,
      dataProcessingAgreementRequired: true,
      cookieConsent: true
    },
    pciDss: {
      enabled: true,
      tokenizeCardData: true,
      encryptTransmissions: true,
      restrictAccess: true
    },
    iso27001: {
      enabled: true,
      riskAssessment: true,
      incidentResponse: true,
      businessContinuity: true
    }
  },

  // Monitoring settings
  monitoring: {
    healthCheckInterval: 30000, // 30 seconds
    metricsCollection: true,
    performanceMonitoring: true,
    errorTracking: true,
    distributedTracing: true,
    alerting: {
      enabled: true,
      channels: ['email', 'sms', 'slack', 'pagerduty'],
      criticalAlertThreshold: 1, // Immediate for critical
      warningAlertThreshold: 5 // 5 minutes for warnings
    },
    siem: {
      enabled: true,
      endpoint: process.env.SIEM_ENDPOINT,
      apiKey: process.env.SIEM_API_KEY
    }
  },

  // External services
  externalServices: {
    emailService: {
      provider: 'sendgrid',
      apiKey: process.env.SENDGRID_API_KEY!,
      fromEmail: process.env.FROM_EMAIL!,
      templates: {
        welcome: process.env.WELCOME_TEMPLATE_ID,
        passwordReset: process.env.PASSWORD_RESET_TEMPLATE_ID,
        appointmentReminder: process.env.APPOINTMENT_REMINDER_TEMPLATE_ID
      }
    },
    smsService: {
      provider: 'twilio',
      accountSid: process.env.TWILIO_ACCOUNT_SID!,
      authToken: process.env.TWILIO_AUTH_TOKEN!,
      fromNumber: process.env.TWILIO_FROM_NUMBER!
    },
    paymentProcessor: {
      provider: 'stripe',
      publicKey: process.env.STRIPE_PUBLIC_KEY!,
      secretKey: process.env.STRIPE_SECRET_KEY!,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!
    }
  },

  // Cloud settings
  cloud: {
    provider: process.env.CLOUD_PROVIDER || 'aws',
    region: process.env.CLOUD_REGION || 'us-east-1',
    storage: {
      bucket: process.env.STORAGE_BUCKET!,
      encryption: true,
      versioning: true,
      lifecycle: {
        transitionToIA: 30, // days
        transitionToGlacier: 90, // days
        expiration: 2555 // days (7 years)
      }
    },
    secrets: {
      service: process.env.SECRETS_SERVICE || 'aws-secrets-manager',
      keyId: process.env.KMS_KEY_ID
    }
  },

  // Feature flags
  features: {
    enableTelehealth: true,
    enableMobileApp: true,
    enableAnalytics: true,
    enableAI: true,
    enableIntegrations: true,
    enableAdvancedSecurity: true,
    enableComplianceReporting: true
  },

  // Performance settings
  performance: {
    caching: {
      enabled: true,
      ttl: 300, // 5 minutes
      maxSize: 1000
    },
    compression: {
      enabled: true,
      level: 6
    },
    cdn: {
      enabled: true,
      endpoint: process.env.CDN_ENDPOINT
    }
  }
};