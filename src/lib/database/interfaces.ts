/**
 * Database Interfaces - Common contracts for all database adapters
 */

export interface DatabaseConfig {
  type: 'postgresql' | 'mysql' | 'mongodb' | 'dynamodb' | 'cosmosdb' | 'firestore';
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  connectionString?: string;
  ssl?: boolean;
  poolSize?: number;
  timeout?: number;
  region?: string; // For cloud databases
  endpoint?: string; // For custom endpoints
  credentials?: any; // Cloud-specific credentials
  readReplicas?: DatabaseConfig[]; // Read replica configurations
  options?: Record<string, any>; // Database-specific options
}

export interface QueryResult {
  rows?: any[];
  rowCount?: number;
  fields?: any[];
  insertId?: any;
  affectedRows?: number;
  metadata?: Record<string, any>;
}

export interface Transaction {
  query(sql: string, params?: any[]): Promise<QueryResult>;
  execute(sql: string, params?: any[]): Promise<QueryResult>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  findOne(collection: string, filter: any): Promise<any>;
  findMany(collection: string, filter: any, options?: any): Promise<any[]>;
  insertOne(collection: string, document: any): Promise<any>;
  insertMany(collection: string, documents: any[]): Promise<any[]>;
  updateOne(collection: string, filter: any, update: any): Promise<any>;
  updateMany(collection: string, filter: any, update: any): Promise<any>;
  deleteOne(collection: string, filter: any): Promise<any>;
  deleteMany(collection: string, filter: any): Promise<any>;
}

export interface DatabaseAdapter {
  // Connection management
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  healthCheck(): Promise<boolean>;

  // SQL operations (for relational databases)
  query(sql: string, params?: any[]): Promise<QueryResult>;
  execute(sql: string, params?: any[]): Promise<QueryResult>;
  transaction<T>(callback: (tx: Transaction) => Promise<T>): Promise<T>;

  // Document/NoSQL operations (for document databases)
  findOne(collection: string, filter: any): Promise<any>;
  findMany(collection: string, filter: any, options?: any): Promise<any[]>;
  insertOne(collection: string, document: any): Promise<any>;
  insertMany(collection: string, documents: any[]): Promise<any[]>;
  updateOne(collection: string, filter: any, update: any): Promise<any>;
  updateMany(collection: string, filter: any, update: any): Promise<any>;
  deleteOne(collection: string, filter: any): Promise<any>;
  deleteMany(collection: string, filter: any): Promise<any>;

  // Schema management
  createTable?(tableName: string, schema: TableSchema): Promise<void>;
  dropTable?(tableName: string): Promise<void>;
  createIndex?(tableName: string, indexName: string, columns: string[]): Promise<void>;
  dropIndex?(tableName: string, indexName: string): Promise<void>;

  // Migration support
  runMigration?(migration: Migration): Promise<void>;
  getMigrationHistory?(): Promise<Migration[]>;
}

export interface TableSchema {
  columns: ColumnDefinition[];
  primaryKey?: string[];
  foreignKeys?: ForeignKeyDefinition[];
  indexes?: IndexDefinition[];
  constraints?: ConstraintDefinition[];
}

export interface ColumnDefinition {
  name: string;
  type: string;
  nullable?: boolean;
  defaultValue?: any;
  autoIncrement?: boolean;
  unique?: boolean;
  length?: number;
  precision?: number;
  scale?: number;
}

export interface ForeignKeyDefinition {
  name: string;
  columns: string[];
  referencedTable: string;
  referencedColumns: string[];
  onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
  onUpdate?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
}

export interface IndexDefinition {
  name: string;
  columns: string[];
  unique?: boolean;
  type?: 'BTREE' | 'HASH' | 'GIN' | 'GIST';
}

export interface ConstraintDefinition {
  name: string;
  type: 'CHECK' | 'UNIQUE' | 'NOT NULL';
  expression?: string;
  columns?: string[];
}

export interface Migration {
  id: string;
  name: string;
  version: string;
  up: string | ((adapter: DatabaseAdapter) => Promise<void>);
  down: string | ((adapter: DatabaseAdapter) => Promise<void>);
  timestamp: Date;
  checksum?: string;
}

// Common database errors
export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class ConnectionError extends DatabaseError {
  constructor(message: string, originalError?: Error) {
    super(message, 'CONNECTION_ERROR', originalError);
    this.name = 'ConnectionError';
  }
}

export class QueryError extends DatabaseError {
  constructor(
    message: string,
    public query?: string,
    public params?: any[],
    originalError?: Error
  ) {
    super(message, 'QUERY_ERROR', originalError);
    this.name = 'QueryError';
  }
}

export class TransactionError extends DatabaseError {
  constructor(message: string, originalError?: Error) {
    super(message, 'TRANSACTION_ERROR', originalError);
    this.name = 'TransactionError';
  }
}

export class ValidationError extends DatabaseError {
  constructor(message: string, public field?: string, originalError?: Error) {
    super(message, 'VALIDATION_ERROR', originalError);
    this.name = 'ValidationError';
  }
}

// Query builder interfaces
export interface QueryBuilder {
  select(columns?: string[]): QueryBuilder;
  from(table: string): QueryBuilder;
  where(condition: string | Record<string, any>, params?: any[]): QueryBuilder;
  join(table: string, condition: string, type?: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL'): QueryBuilder;
  orderBy(column: string, direction?: 'ASC' | 'DESC'): QueryBuilder;
  groupBy(columns: string[]): QueryBuilder;
  having(condition: string, params?: any[]): QueryBuilder;
  limit(count: number): QueryBuilder;
  offset(count: number): QueryBuilder;
  build(): { sql: string; params: any[] };
  execute(): Promise<QueryResult>;
}

export interface InsertBuilder {
  into(table: string): InsertBuilder;
  values(data: Record<string, any> | Record<string, any>[]): InsertBuilder;
  onConflict(action: 'IGNORE' | 'UPDATE', columns?: string[]): InsertBuilder;
  returning(columns?: string[]): InsertBuilder;
  build(): { sql: string; params: any[] };
  execute(): Promise<QueryResult>;
}

export interface UpdateBuilder {
  table(name: string): UpdateBuilder;
  set(data: Record<string, any>): UpdateBuilder;
  where(condition: string | Record<string, any>, params?: any[]): UpdateBuilder;
  returning(columns?: string[]): UpdateBuilder;
  build(): { sql: string; params: any[] };
  execute(): Promise<QueryResult>;
}

export interface DeleteBuilder {
  from(table: string): DeleteBuilder;
  where(condition: string | Record<string, any>, params?: any[]): DeleteBuilder;
  returning(columns?: string[]): DeleteBuilder;
  build(): { sql: string; params: any[] };
  execute(): Promise<QueryResult>;
}

// Repository pattern interfaces
export interface Repository<T> {
  findById(id: any): Promise<T | null>;
  findOne(filter: Partial<T>): Promise<T | null>;
  findMany(filter?: Partial<T>, options?: FindOptions): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: any, data: Partial<T>): Promise<T>;
  delete(id: any): Promise<boolean>;
  count(filter?: Partial<T>): Promise<number>;
  exists(filter: Partial<T>): Promise<boolean>;
}

export interface FindOptions {
  limit?: number;
  offset?: number;
  orderBy?: { field: string; direction: 'ASC' | 'DESC' }[];
  include?: string[];
  select?: string[];
}

// Event sourcing interfaces
export interface Event {
  id: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  eventData: Record<string, any>;
  eventVersion: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface EventStore {
  saveEvents(aggregateId: string, events: Event[], expectedVersion: number): Promise<void>;
  getEvents(aggregateId: string, fromVersion?: number): Promise<Event[]>;
  getAllEvents(fromTimestamp?: Date): Promise<Event[]>;
  getEventsByType(eventType: string, fromTimestamp?: Date): Promise<Event[]>;
}

// Cache interfaces
export interface CacheAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
  exists(key: string): Promise<boolean>;
  increment(key: string, amount?: number): Promise<number>;
  decrement(key: string, amount?: number): Promise<number>;
  expire(key: string, ttl: number): Promise<boolean>;
  ttl(key: string): Promise<number>;
}