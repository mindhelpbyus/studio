import { devConfig } from './dev';
import { stagingConfig } from './staging';
import { prodConfig } from './prod';

export interface EnvironmentConfig {
  environment: string;
  aws: {
    region: string;
    account?: string;
  };
  vpc: {
    cidr: string;
    maxAzs: number;
    natGateways: number;
  };
  database: {
    tableName: string;
    billingMode: 'PAY_PER_REQUEST' | 'PROVISIONED';
    pointInTimeRecovery: boolean;
    encryption: boolean;
    streamEnabled: boolean;
  };
  storage: {
    documentsBucket: string;
    imagesBucket: string;
    backupsBucket: string;
    encryption: boolean;
    versioning: boolean;
  };
  auth: {
    userPoolName: string;
    userPoolClientName: string;
    mfaEnabled: boolean;
    passwordPolicy: {
      minLength: number;
      requireLowercase: boolean;
      requireUppercase: boolean;
      requireNumbers: boolean;
      requireSymbols: boolean;
    };
  };
  api: {
    name: string;
    stageName: string;
    throttle: {
      rateLimit: number;
      burstLimit: number;
    };
    cors: {
      allowOrigins: string[];
      allowMethods: string[];
      allowHeaders: string[];
    };
  };
  lambda: {
    runtime: string;
    timeout: number;
    memorySize: number;
    environment: Record<string, string>;
  };
  monitoring: {
    logRetentionDays: number;
    enableXRay: boolean;
    enableDetailedMetrics: boolean;
  };
  security: {
    enableWaf: boolean;
    enableCloudTrail: boolean;
    enableConfig: boolean;
    kmsKeyRotation: boolean;
  };
}

export function getConfig(environment: string): EnvironmentConfig {
  switch (environment) {
    case 'dev':
      return devConfig;
    case 'staging':
      return stagingConfig;
    case 'prod':
      return prodConfig;
    default:
      throw new Error(`Unknown environment: ${environment}`);
  }
}