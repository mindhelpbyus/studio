import { EnvironmentConfig } from './index';

export const devConfig: EnvironmentConfig = {
  environment: 'dev',
  aws: {
    region: 'us-east-1',
  },
  vpc: {
    cidr: '10.0.0.0/16',
    maxAzs: 2,
    natGateways: 1,
  },
  database: {
    tableName: 'vivale-healthcare-crm-dev',
    billingMode: 'PAY_PER_REQUEST',
    pointInTimeRecovery: true,
    encryption: true,
    streamEnabled: true,
  },
  storage: {
    documentsBucket: 'vivale-documents-dev',
    imagesBucket: 'vivale-images-dev',
    backupsBucket: 'vivale-backups-dev',
    encryption: true,
    versioning: true,
  },
  auth: {
    userPoolName: 'vivale-users-dev',
    userPoolClientName: 'vivale-web-client-dev',
    mfaEnabled: false, // Disabled for dev environment
    passwordPolicy: {
      minLength: 8,
      requireLowercase: true,
      requireUppercase: true,
      requireNumbers: true,
      requireSymbols: false, // Relaxed for dev
    },
  },
  api: {
    name: 'vivale-api-dev',
    stageName: 'dev',
    throttle: {
      rateLimit: 1000,
      burstLimit: 2000,
    },
    cors: {
      allowOrigins: ['http://localhost:3000', 'https://dev.vivale.com'],
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization', 'X-Amz-Date', 'X-Api-Key'],
    },
  },
  lambda: {
    runtime: 'nodejs20.x',
    timeout: 30,
    memorySize: 512,
    environment: {
      NODE_ENV: 'development',
      LOG_LEVEL: 'debug',
    },
  },
  monitoring: {
    logRetentionDays: 7,
    enableXRay: true,
    enableDetailedMetrics: false,
  },
  security: {
    enableWaf: false, // Disabled for dev to reduce costs
    enableCloudTrail: false,
    enableConfig: false,
    kmsKeyRotation: false,
  },
};