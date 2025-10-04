import { EnvironmentConfig } from './index';

export const stagingConfig: EnvironmentConfig = {
  environment: 'staging',
  aws: {
    region: 'us-east-1',
  },
  vpc: {
    cidr: '10.1.0.0/16',
    maxAzs: 2,
    natGateways: 2,
  },
  database: {
    tableName: 'vivale-healthcare-crm-staging',
    billingMode: 'PAY_PER_REQUEST',
    pointInTimeRecovery: true,
    encryption: true,
    streamEnabled: true,
  },
  storage: {
    documentsBucket: 'vivale-documents-staging',
    imagesBucket: 'vivale-images-staging',
    backupsBucket: 'vivale-backups-staging',
    encryption: true,
    versioning: true,
  },
  auth: {
    userPoolName: 'vivale-users-staging',
    userPoolClientName: 'vivale-web-client-staging',
    mfaEnabled: true,
    passwordPolicy: {
      minLength: 12,
      requireLowercase: true,
      requireUppercase: true,
      requireNumbers: true,
      requireSymbols: true,
    },
  },
  api: {
    name: 'vivale-api-staging',
    stageName: 'staging',
    throttle: {
      rateLimit: 2000,
      burstLimit: 4000,
    },
    cors: {
      allowOrigins: ['https://staging.vivale.com'],
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization', 'X-Amz-Date', 'X-Api-Key'],
    },
  },
  lambda: {
    runtime: 'nodejs20.x',
    timeout: 30,
    memorySize: 1024,
    environment: {
      NODE_ENV: 'staging',
      LOG_LEVEL: 'info',
    },
  },
  monitoring: {
    logRetentionDays: 30,
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