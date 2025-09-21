/**
 * Abstract Database Repository
 * Provides database-agnostic data access layer
 */

import { CloudDatabaseService, DatabaseTransaction } from '../cloud/interfaces';

export interface DatabaseConfig {
  type: 'postgresql' | 'mysql' | 'mongodb' | 'dynamodb' | 'cosmosdb' | 'firestore';
  connectionString: string;
  poolSize?: number;
  timeout?: number;
  ssl?: boolean;
  migrations?: boolean;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
  filters?: Record<string, any>;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export abstract class AbstractRepository<T, ID = string> {
  protected db: CloudDatabaseService;
  protected tableName: string;

  constructor(db: CloudDatabaseService, tableName: string) {
    this.db = db;
    this.tableName = tableName;
  }

  // Abstract methods that must be implemented by concrete repositories
  abstract findById(id: ID): Promise<T | null>;
  abstract findAll(options?: QueryOptions): Promise<T[]>;
  abstract create(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  abstract update(id: ID, updates: Partial<T>): Promise<T>;
  abstract delete(id: ID): Promise<void>;

  // Common methods with default implementations
  async findMany(ids: ID[]): Promise<T[]> {
    const results: T[] = [];
    for (const id of ids) {
      const entity = await this.findById(id);
      if (entity) {
        results.push(entity);
      }
    }
    return results;
  }

  async exists(id: ID): Promise<boolean> {
    const entity = await this.findById(id);
    return entity !== null;
  }

  async count(filters?: Record<string, any>): Promise<number> {
    const query = this.buildCountQuery(filters);
    const result = await this.db.query<{ count: number }>(query.sql, query.params);
    return result[0]?.count || 0;
  }

  async paginate(page: number = 1, limit: number = 10, options?: QueryOptions): Promise<PaginationResult<T>> {
    const offset = (page - 1) * limit;
    const total = await this.count(options?.filters);
    
    const data = await this.findAll({
      ...options,
      limit,
      offset,
    });

    return {
      data,
      total,
      page,
      limit,
      hasNext: offset + limit < total,
      hasPrevious: page > 1,
    };
  }

  async transaction<R>(callback: (repo: this) => Promise<R>): Promise<R> {
    return this.db.transaction(async (tx) => {
      // Create a new repository instance with the transaction
      const txRepo = Object.create(this);
      txRepo.db = tx;
      return callback(txRepo);
    });
  }

  // Helper methods for building queries
  protected buildSelectQuery(options?: QueryOptions): { sql: string; params: any[] } {
    let sql = `SELECT * FROM ${this.tableName}`;
    const params: any[] = [];
    let paramIndex = 1;

    // Add WHERE clause
    if (options?.filters) {
      const conditions: string[] = [];
      for (const [key, value] of Object.entries(options.filters)) {
        if (value !== undefined && value !== null) {
          conditions.push(`${key} = $${paramIndex}`);
          params.push(value);
          paramIndex++;
        }
      }
      if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(' AND ')}`;
      }
    }

    // Add ORDER BY clause
    if (options?.orderBy) {
      sql += ` ORDER BY ${options.orderBy} ${options.orderDirection || 'ASC'}`;
    }

    // Add LIMIT and OFFSET
    if (options?.limit) {
      sql += ` LIMIT $${paramIndex}`;
      params.push(options.limit);
      paramIndex++;
    }

    if (options?.offset) {
      sql += ` OFFSET $${paramIndex}`;
      params.push(options.offset);
    }

    return { sql, params };
  }

  protected buildCountQuery(filters?: Record<string, any>): { sql: string; params: any[] } {
    let sql = `SELECT COUNT(*) as count FROM ${this.tableName}`;
    const params: any[] = [];
    let paramIndex = 1;

    if (filters) {
      const conditions: string[] = [];
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null) {
          conditions.push(`${key} = $${paramIndex}`);
          params.push(value);
          paramIndex++;
        }
      }
      if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(' AND ')}`;
      }
    }

    return { sql, params };
  }

  protected buildInsertQuery(entity: Record<string, any>): { sql: string; params: any[] } {
    const keys = Object.keys(entity);
    const values = Object.values(entity);
    const placeholders = keys.map((_, index) => `$${index + 1}`);

    const sql = `
      INSERT INTO ${this.tableName} (${keys.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;

    return { sql, params: values };
  }

  protected buildUpdateQuery(id: ID, updates: Record<string, any>): { sql: string; params: any[] } {
    const keys = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');

    const sql = `
      UPDATE ${this.tableName}
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    return { sql, params: [id, ...values] };
  }

  protected buildDeleteQuery(id: ID): { sql: string; params: any[] } {
    const sql = `DELETE FROM ${this.tableName} WHERE id = $1`;
    return { sql, params: [id] };
  }

  // Utility methods
  protected generateId(): string {
    return crypto.randomUUID();
  }

  protected now(): Date {
    return new Date();
  }

  protected sanitizeInput(input: any): any {
    if (typeof input === 'string') {
      return input.trim();
    }
    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[key] = this.sanitizeInput(value);
      }
      return sanitized;
    }
    return input;
  }
}

// Specialized repository for entities with soft delete
export abstract class SoftDeleteRepository<T extends { deletedAt?: Date }, ID = string> extends AbstractRepository<T, ID> {
  async softDelete(id: ID): Promise<void> {
    await this.update(id, { deletedAt: this.now() } as Partial<T>);
  }

  async restore(id: ID): Promise<void> {
    await this.update(id, { deletedAt: null } as Partial<T>);
  }

  async findAllActive(options?: QueryOptions): Promise<T[]> {
    return this.findAll({
      ...options,
      filters: {
        ...options?.filters,
        deletedAt: null,
      },
    });
  }

  async findAllDeleted(options?: QueryOptions): Promise<T[]> {
    return this.findAll({
      ...options,
      filters: {
        ...options?.filters,
        deletedAt: { $ne: null },
      },
    });
  }
}

// Repository factory for different database types
export class RepositoryFactory {
  private static repositories: Map<string, any> = new Map();

  static register<T>(name: string, repository: new (...args: any[]) => T): void {
    this.repositories.set(name, repository);
  }

  static create<T>(name: string, ...args: any[]): T {
    const RepositoryClass = this.repositories.get(name);
    if (!RepositoryClass) {
      throw new Error(`Repository ${name} not found`);
    }
    return new RepositoryClass(...args);
  }

  static getRegistered(): string[] {
    return Array.from(this.repositories.keys());
  }
}

// Database connection manager
export class DatabaseManager {
  private static instance: DatabaseManager;
  private connections: Map<string, CloudDatabaseService> = new Map();
  private config: DatabaseConfig;

  private constructor(config: DatabaseConfig) {
    this.config = config;
  }

  static getInstance(config?: DatabaseConfig): DatabaseManager {
    if (!DatabaseManager.instance) {
      if (!config) {
        throw new Error('Database configuration required');
      }
      DatabaseManager.instance = new DatabaseManager(config);
    }
    return DatabaseManager.instance;
  }

  async getConnection(name: string = 'default'): Promise<CloudDatabaseService> {
    if (!this.connections.has(name)) {
      // This would be implemented by the specific cloud provider
      throw new Error('Database connection not implemented');
    }
    return this.connections.get(name)!;
  }

  async createConnection(name: string, service: CloudDatabaseService): Promise<void> {
    await service.connect(this.config.connectionString);
    this.connections.set(name, service);
  }

  async closeConnection(name: string): Promise<void> {
    const connection = this.connections.get(name);
    if (connection) {
      await connection.disconnect();
      this.connections.delete(name);
    }
  }

  async closeAllConnections(): Promise<void> {
    const promises = Array.from(this.connections.keys()).map(name => 
      this.closeConnection(name)
    );
    await Promise.all(promises);
  }
}