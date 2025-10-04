import { EnvironmentConfig } from './index';

export const prodConfig: EnvironmentConfig = {
  environment: 'prod',
  aws: {
    region: 'us-east-1',
  },
  vpc: {
    cidr: '10.2.0.0/16',
    maxAzs: 3,
    natGateways: 3,
  },
  database: {
    tableName: 'vivale-healthcare-crm-prod',
    billingMode: 'PAY_PER_REQUEST',
    pointInTimeRecovery: true,
    encryption: true,
    streamEnabled: true,
  },
  storage: {
    documentsBucket: 'vivale-documents-prod',
    imagesBucket: 'vivale-images-prod',
    backupsBucket: 'vivale-backups-prod',
    encryption: true,
    versioning: true,
  },
  auth: {
    userPoolName: 'vivale-users-prod',
    userPoolClientName: 'vivale-web-client-prod',
    mfaEnabled: true,
    passwordPolicy: {
      minLength: 14,
      requireLowercase: true,
      requireUppercase: true,
      requireNumbers: true,
      requireSymbols: true,
    },
  },
  api: {
    name: 'vivale-api-prod',
    stageName: 'prod',
    throttle: {
      rateLimit: 5000,
      burstLimit: 10000,
    },
    cors: {
      allowOrigins: ['https://app.vivale.com', 'https://vivale.com'],
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization', 'X-Amz-Date', 'X-Api-Key'],
    },
  },
  lambda: {
    runtime: 'nodejs20.x',
    timeout: 30,
    memorySize: 1024,
    environment: {
      NODE_ENV: 'production',
      LOG_LEVEL: 'warn',
    },
  },
  monitoring: {
    logRetentionDays: 365,
    enableXRay: true,
    enableDetailedMetrics: true,
  },
  security: {
    enableWaf: true,
    enableCloudTrail: true,
    enableConfig: true,
    kmsKeyRotation: true,
  },
};