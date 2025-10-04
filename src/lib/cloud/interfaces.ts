/**
 * Cloud Provider Abstraction Interfaces
 * Provides unified interfaces for all cloud providers
 */

export type CloudProvider = 'aws' | 'azure' | 'gcp' | 'oci' | 'local';

export interface CloudConfig {
  provider: CloudProvider;
  region: string;
  credentials: CloudCredentials;
  features: CloudFeatures;
}

export interface CloudCredentials {
  accessKey?: string;
  secretKey?: string;
  tenantId?: string;
  subscriptionId?: string;
  projectId?: string;
  serviceAccountKey?: string;
  compartmentId?: string;
}

export interface CloudFeatures {
  compute: boolean;
  storage: boolean;
  database: boolean;
  messaging: boolean;
  monitoring: boolean;
  secrets: boolean;
}

// Storage Service Interface
export interface CloudStorageService {
  uploadFile(bucket: string, key: string, data: Buffer | string): Promise<string>;
  downloadFile(bucket: string, key: string): Promise<Buffer>;
  deleteFile(bucket: string, key: string): Promise<void>;
  listFiles(bucket: string, prefix?: string): Promise<string[]>;
  getSignedUrl(bucket: string, key: string, expiresIn: number): Promise<string>;
  createBucket(bucket: string): Promise<void>;
  deleteBucket(bucket: string): Promise<void>;
}

// Database Service Interface
export interface CloudDatabaseService {
  connect(connectionString: string): Promise<void>;
  disconnect(): Promise<void>;
  query<T>(sql: string, params?: any[]): Promise<T[]>;
  transaction<T>(callback: (tx: DatabaseTransaction) => Promise<T>): Promise<T>;
  migrate(migrations: Migration[]): Promise<void>;
  backup(destination: string): Promise<string>;
  restore(source: string): Promise<void>;
}

export interface DatabaseTransaction {
  query<T>(sql: string, params?: any[]): Promise<T[]>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

export interface Migration {
  version: string;
  up: string;
  down: string;
}

// Secrets Management Interface
export interface CloudSecretsService {
  getSecret(name: string): Promise<string>;
  setSecret(name: string, value: string): Promise<void>;
  deleteSecret(name: string): Promise<void>;
  listSecrets(): Promise<string[]>;
  rotateSecret(name: string): Promise<void>;
}

// Messaging Service Interface
export interface CloudMessagingService {
  sendMessage(queue: string, message: any): Promise<string>;
  receiveMessages(queue: string, maxMessages?: number): Promise<Message[]>;
  deleteMessage(queue: string, messageId: string): Promise<void>;
  createQueue(name: string): Promise<void>;
  deleteQueue(name: string): Promise<void>;
}

export interface Message {
  id: string;
  body: any;
  attributes?: Record<string, string>;
  timestamp: Date;
}

// Monitoring Service Interface
export interface CloudMonitoringService {
  putMetric(name: string, value: number, unit?: string, dimensions?: Record<string, string>): Promise<void>;
  getMetrics(name: string, startTime: Date, endTime: Date): Promise<MetricData[]>;
  createAlarm(config: AlarmConfig): Promise<string>;
  deleteAlarm(alarmId: string): Promise<void>;
  log(level: LogLevel, message: string, metadata?: Record<string, any>): Promise<void>;
}

export interface MetricData {
  timestamp: Date;
  value: number;
  unit?: string;
}

export interface AlarmConfig {
  name: string;
  metric: string;
  threshold: number;
  comparison: 'GreaterThan' | 'LessThan' | 'GreaterThanOrEqual' | 'LessThanOrEqual';
  evaluationPeriods: number;
  actions: string[];
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

// Compute Service Interface
export interface CloudComputeService {
  deployFunction(config: FunctionConfig): Promise<string>;
  invokeFunction(name: string, payload: any): Promise<any>;
  deleteFunction(name: string): Promise<void>;
  listFunctions(): Promise<FunctionInfo[]>;
  updateFunction(name: string, config: Partial<FunctionConfig>): Promise<void>;
}

export interface FunctionConfig {
  name: string;
  runtime: string;
  handler: string;
  code: Buffer | string;
  environment?: Record<string, string>;
  timeout?: number;
  memory?: number;
}

export interface FunctionInfo {
  name: string;
  runtime: string;
  status: 'Active' | 'Inactive' | 'Failed';
  lastModified: Date;
}

// Identity and Access Management Interface
export interface CloudIAMService {
  createRole(name: string, policies: string[]): Promise<string>;
  deleteRole(name: string): Promise<void>;
  attachPolicy(roleName: string, policyArn: string): Promise<void>;
  detachPolicy(roleName: string, policyArn: string): Promise<void>;
  createUser(username: string): Promise<string>;
  deleteUser(username: string): Promise<void>;
  generateAccessKey(username: string): Promise<AccessKey>;
}

export interface AccessKey {
  accessKeyId: string;
  secretAccessKey: string;
  status: 'Active' | 'Inactive';
}

// Main Cloud Service Factory
export interface CloudServiceFactory {
  createStorageService(): CloudStorageService;
  createDatabaseService(): CloudDatabaseService;
  createSecretsService(): CloudSecretsService;
  createMessagingService(): CloudMessagingService;
  createMonitoringService(): CloudMonitoringService;
  createComputeService(): CloudComputeService;
  createIAMService(): CloudIAMService;
}

// Health Check Interface
export interface HealthCheck {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  message?: string;
  timestamp: Date;
  responseTime?: number;
}

export interface CloudHealthService {
  checkHealth(): Promise<HealthCheck[]>;
  checkService(serviceName: string): Promise<HealthCheck>;
}

// Cost Management Interface
export interface CloudCostService {
  getCurrentCosts(): Promise<CostData>;
  getForecastedCosts(days: number): Promise<CostData>;
  getCostsByService(): Promise<ServiceCostData[]>;
  getCostsByRegion(): Promise<RegionCostData[]>;
  setbudgetAlert(budget: number, threshold: number): Promise<string>;
}

export interface CostData {
  amount: number;
  currency: string;
  period: {
    start: Date;
    end: Date;
  };
}

export interface ServiceCostData extends CostData {
  serviceName: string;
}

export interface RegionCostData extends CostData {
  region: string;
}

// Error Types
export class CloudServiceError extends Error {
  constructor(
    message: string,
    public provider: CloudProvider,
    public service: string,
    public code?: string
  ) {
    super(message);
    this.name = 'CloudServiceError';
  }
}

export class CloudConfigurationError extends Error {
  constructor(message: string, public provider: CloudProvider) {
    super(message);
    this.name = 'CloudConfigurationError';
  }
}

export class CloudAuthenticationError extends Error {
  constructor(message: string, public provider: CloudProvider) {
    super(message);
    this.name = 'CloudAuthenticationError';
  }
}
