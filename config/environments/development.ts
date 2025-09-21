/**
 * @fileoverview Development Environment Configuration
 * @description Development-specific configuration settings
 * @compliance Environment-specific security settings
 */

export const developmentConfig = {
  environment: 'development',
  
  // Application settings
  app: {
    name: 'Vivalé Healthcare Platform',
    version: '1.0.0',
    port: 9002,
    host: 'localhost',
    baseUrl: 'http://localhost:9002'
  },

  // Security settings
  security: {
    jwtSecret: process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production',
    jwtExpiresIn: '1h',
    refreshTokenExpiresIn: '7d',
    sessionTimeout: 30 * 60, // 30 minutes
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60, // 15 minutes
    passwordMinLength: 8,
    requireMFA: false, // Disabled for development
    encryptionAlgorithm: 'aes-256-gcm',
    hashRounds: 12
  },

  // Database settings
  database: {
    type: 'postgresql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'healthcare_dev',
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    ssl: false,
    logging: true,
    synchronize: true, // Only for development
    dropSchema: false
  },

  // Logging settings
  logging: {
    level: 'debug',
    format: 'combined',
    auditLevel: 'info',
    enableConsole: true,
    enableFile: true,
    enableAuditFile: true,
    maxFileSize: '10MB',
    maxFiles: 5
  },

  // Compliance settings
  compliance: {
    hipaa: {
      enabled: true,
      strictMode: false, // Relaxed for development
      auditAllAccess: true,
      minimumNecessaryCheck: true,
      dataRetentionDays: 2555 // 7 years
    },
    gdpr: {
      enabled: true,
      consentRequired: true,
      dataPortability: true,
      rightToErasure: true
    }
  },

  // Monitoring settings
  monitoring: {
    healthCheckInterval: 60000, // 1 minute
    metricsCollection: true,
    performanceMonitoring: true,
    errorTracking: true,
    alerting: {
      enabled: false, // Disabled for development
      channels: ['console']
    }
  },

  // External services
  externalServices: {
    emailService: {
      provider: 'console', // Log emails to console in dev
      apiKey: process.env.EMAIL_API_KEY
    },
    smsService: {
      provider: 'console', // Log SMS to console in dev
      apiKey: process.env.SMS_API_KEY
    }
  },

  // Feature flags
  features: {
    enableTelehealth: true,
    enableMobileApp: true,
    enableAnalytics: false, // Disabled for development
    enableAI: true,
    enableIntegrations: false
  }
};