/**
 * PostgreSQL Database Adapter
 * Implements the DatabaseAdapter interface for PostgreSQL
 */

import { Pool, PoolClient, PoolConfig } from 'pg';
import {
  DatabaseAdapter,
  DatabaseConfig,
  QueryResult,
  Transaction,
  TableSchema,
  Migration,
  ConnectionError,
  QueryError,
  TransactionError,
} from '../interfaces';

export class PostgreSQLAdapter implements DatabaseAdapter {
  private pool: Pool | null = null;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      const poolConfig: PoolConfig = {
        host: this.config.host,
        port: this.config.port || 5432,
        database: this.config.database,
        user: this.config.username,
        password: this.config.password,
        ssl: this.config.ssl ? { rejectUnauthorized: false } : false,
        max: this.config.poolSize || 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: this.config.timeout || 30000,
      };

      // Use connection string if provided
      if (this.config.connectionString) {
        poolConfig.connectionString = this.config.connectionString;
      }

      this.pool = new Pool(poolConfig);

      // Test connection
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      client.release();

      console.log('PostgreSQL connection established');
    } catch (error) {
      throw new ConnectionError(
        `Failed to connect to PostgreSQL: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      console.log('PostgreSQL connection closed');
    }
  }

  isConnected(): boolean {
    return this.pool !== null && !this.pool.ended;
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this.pool) return false;
      
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      client.release();
      return true;
    } catch (error) {
      return false;
    }
  }

  async query(sql: string, params?: any[]): Promise<QueryResult> {
    if (!this.pool) {
      throw new ConnectionError('Database not connected');
    }

    try {
      const result = await this.pool.query(sql, params);
      return {
        rows: result.rows,
        rowCount: result.rowCount || 0,
        fields: result.fields,
      };
    } catch (error) {
      throw new QueryError(
        `Query failed: ${error instanceof Error ? error.message : String(error)}`,
        sql,
        params,
        error instanceof Error ? error : undefined
      );
    }
  }

  async execute(sql: string, params?: any[]): Promise<QueryResult> {
    return this.query(sql, params);
  }

  async transaction<T>(callback: (tx: Transaction) => Promise<T>): Promise<T> {
    if (!this.pool) {
      throw new ConnectionError('Database not connected');
    }

    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const transaction = new PostgreSQLTransaction(client);
      const result = await callback(transaction);
      
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw new TransactionError(
        `Transaction failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error : undefined
      );
    } finally {
      client.release();
    }
  }

  // Document operations (mapped to JSONB operations)
  async findOne(collection: string, filter: any): Promise<any> {
    const whereClause = this.buildWhereClause(filter);
    const sql = `SELECT data FROM ${collection} WHERE ${whereClause.clause} LIMIT 1`;
    const result = await this.query(sql, whereClause.params);
    return result.rows?.[0]?.data || null;
  }

  async findMany(collection: string, filter: any, options?: any): Promise<any[]> {
    const whereClause = this.buildWhereClause(filter);
    let sql = `SELECT data FROM ${collection} WHERE ${whereClause.clause}`;
    
    if (options?.orderBy) {
      sql += ` ORDER BY ${options.orderBy}`;
    }
    
    if (options?.limit) {
      sql += ` LIMIT ${options.limit}`;
    }
    
    if (options?.offset) {
      sql += ` OFFSET ${options.offset}`;
    }

    const result = await this.query(sql, whereClause.params);
    return result.rows?.map(row => row.data) || [];
  }

  async insertOne(collection: string, document: any): Promise<any> {
    const sql = `INSERT INTO ${collection} (data) VALUES ($1) RETURNING data`;
    const result = await this.execute(sql, [JSON.stringify(document)]);
    return result.rows?.[0]?.data;
  }

  async insertMany(collection: string, documents: any[]): Promise<any[]> {
    const values = documents.map((doc, index) => `($${index + 1})`).join(', ');
    const sql = `INSERT INTO ${collection} (data) VALUES ${values} RETURNING data`;
    const params = documents.map(doc => JSON.stringify(doc));
    const result = await this.execute(sql, params);
    return result.rows?.map(row => row.data) || [];
  }

  async updateOne(collection: string, filter: any, update: any): Promise<any> {
    const whereClause = this.buildWhereClause(filter);
    const sql = `UPDATE ${collection} SET data = $${whereClause.params.length + 1} WHERE ${whereClause.clause} RETURNING data`;
    const params = [...whereClause.params, JSON.stringify(update)];
    const result = await this.execute(sql, params);
    return result.rows?.[0]?.data;
  }

  async updateMany(collection: string, filter: any, update: any): Promise<any> {
    const whereClause = this.buildWhereClause(filter);
    const sql = `UPDATE ${collection} SET data = $${whereClause.params.length + 1} WHERE ${whereClause.clause}`;
    const params = [...whereClause.params, JSON.stringify(update)];
    const result = await this.execute(sql, params);
    return { modifiedCount: result.rowCount || 0 };
  }

  async deleteOne(collection: string, filter: any): Promise<any> {
    const whereClause = this.buildWhereClause(filter);
    const sql = `DELETE FROM ${collection} WHERE ${whereClause.clause} RETURNING data`;
    const result = await this.execute(sql, whereClause.params);
    return result.rows?.[0]?.data;
  }

  async deleteMany(collection: string, filter: any): Promise<any> {
    const whereClause = this.buildWhereClause(filter);
    const sql = `DELETE FROM ${collection} WHERE ${whereClause.clause}`;
    const result = await this.execute(sql, whereClause.params);
    return { deletedCount: result.rowCount || 0 };
  }

  // Schema management
  async createTable(tableName: string, schema: TableSchema): Promise<void> {
    const columns = schema.columns.map(col => {
      let columnDef = `${col.name} ${this.mapDataType(col.type)}`;
      
      if (col.length) {
        columnDef += `(${col.length})`;
      }
      
      if (!col.nullable) {
        columnDef += ' NOT NULL';
      }
      
      if (col.defaultValue !== undefined) {
        columnDef += ` DEFAULT ${this.formatDefaultValue(col.defaultValue)}`;
      }
      
      if (col.autoIncrement) {
        columnDef = `${col.name} SERIAL`;
      }
      
      return columnDef;
    }).join(', ');

    let sql = `CREATE TABLE ${tableName} (${columns}`;
    
    if (schema.primaryKey) {
      sql += `, PRIMARY KEY (${schema.primaryKey.join(', ')})`;
    }
    
    sql += ')';
    
    await this.execute(sql);

    // Create indexes
    if (schema.indexes) {
      for (const index of schema.indexes) {
        await this.createIndex(tableName, index.name, index.columns);
      }
    }
  }

  async dropTable(tableName: string): Promise<void> {
    await this.execute(`DROP TABLE IF EXISTS ${tableName}`);
  }

  async createIndex(tableName: string, indexName: string, columns: string[]): Promise<void> {
    const sql = `CREATE INDEX ${indexName} ON ${tableName} (${columns.join(', ')})`;
    await this.execute(sql);
  }

  async dropIndex(tableName: string, indexName: string): Promise<void> {
    await this.execute(`DROP INDEX IF EXISTS ${indexName}`);
  }

  // Migration support
  async runMigration(migration: Migration): Promise<void> {
    if (typeof migration.up === 'string') {
      await this.execute(migration.up);
    } else {
      await migration.up(this);
    }
    
    // Record migration in history
    await this.execute(
      'INSERT INTO migrations (id, name, version, timestamp, checksum) VALUES ($1, $2, $3, $4, $5)',
      [migration.id, migration.name, migration.version, migration.timestamp, migration.checksum]
    );
  }

  async getMigrationHistory(): Promise<Migration[]> {
    const result = await this.query('SELECT * FROM migrations ORDER BY timestamp');
    return result.rows || [];
  }

  // Helper methods
  private buildWhereClause(filter: any): { clause: string; params: any[] } {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(filter)) {
      conditions.push(`data->>'${key}' = $${paramIndex}`);
      params.push(value);
      paramIndex++;
    }

    return {
      clause: conditions.length > 0 ? conditions.join(' AND ') : '1=1',
      params,
    };
  }

  private mapDataType(type: string): string {
    const typeMap: Record<string, string> = {
      'string': 'VARCHAR',
      'text': 'TEXT',
      'integer': 'INTEGER',
      'bigint': 'BIGINT',
      'decimal': 'DECIMAL',
      'float': 'REAL',
      'double': 'DOUBLE PRECISION',
      'boolean': 'BOOLEAN',
      'date': 'DATE',
      'datetime': 'TIMESTAMP',
      'timestamp': 'TIMESTAMP WITH TIME ZONE',
      'json': 'JSONB',
      'uuid': 'UUID',
    };

    return typeMap[type.toLowerCase()] || type.toUpperCase();
  }

  private formatDefaultValue(value: any): string {
    if (typeof value === 'string') {
      return `'${value}'`;
    }
    if (value === null) {
      return 'NULL';
    }
    return String(value);
  }
}

class PostgreSQLTransaction implements Transaction {
  constructor(private client: PoolClient) {}

  async query(sql: string, params?: any[]): Promise<QueryResult> {
    try {
      const result = await this.client.query(sql, params);
      return {
        rows: result.rows,
        rowCount: result.rowCount || 0,
        fields: result.fields,
      };
    } catch (error) {
      throw new QueryError(
        `Transaction query failed: ${error instanceof Error ? error.message : String(error)}`,
        sql,
        params,
        error instanceof Error ? error : undefined
      );
    }
  }

  async execute(sql: string, params?: any[]): Promise<QueryResult> {
    return this.query(sql, params);
  }

  async commit(): Promise<void> {
    await this.client.query('COMMIT');
  }

  async rollback(): Promise<void> {
    await this.client.query('ROLLBACK');
  }

  // Document operations within transaction
  async findOne(collection: string, filter: any): Promise<any> {
    const adapter = new PostgreSQLAdapter({} as DatabaseConfig);
    return adapter.findOne(collection, filter);
  }

  async findMany(collection: string, filter: any, options?: any): Promise<any[]> {
    const adapter = new PostgreSQLAdapter({} as DatabaseConfig);
    return adapter.findMany(collection, filter, options);
  }

  async insertOne(collection: string, document: any): Promise<any> {
    const sql = `INSERT INTO ${collection} (data) VALUES ($1) RETURNING data`;
    const result = await this.execute(sql, [JSON.stringify(document)]);
    return result.rows?.[0]?.data;
  }

  async insertMany(collection: string, documents: any[]): Promise<any[]> {
    const values = documents.map((doc, index) => `($${index + 1})`).join(', ');
    const sql = `INSERT INTO ${collection} (data) VALUES ${values} RETURNING data`;
    const params = documents.map(doc => JSON.stringify(doc));
    const result = await this.execute(sql, params);
    return result.rows?.map(row => row.data) || [];
  }

  async updateOne(collection: string, filter: any, update: any): Promise<any> {
    const adapter = new PostgreSQLAdapter({} as DatabaseConfig);
    const whereClause = (adapter as any).buildWhereClause(filter);
    const sql = `UPDATE ${collection} SET data = $${whereClause.params.length + 1} WHERE ${whereClause.clause} RETURNING data`;
    const params = [...whereClause.params, JSON.stringify(update)];
    const result = await this.execute(sql, params);
    return result.rows?.[0]?.data;
  }

  async updateMany(collection: string, filter: any, update: any): Promise<any> {
    const adapter = new PostgreSQLAdapter({} as DatabaseConfig);
    const whereClause = (adapter as any).buildWhereClause(filter);
    const sql = `UPDATE ${collection} SET data = $${whereClause.params.length + 1} WHERE ${whereClause.clause}`;
    const params = [...whereClause.params, JSON.stringify(update)];
    const result = await this.execute(sql, params);
    return { modifiedCount: result.rowCount || 0 };
  }

  async deleteOne(collection: string, filter: any): Promise<any> {
    const adapter = new PostgreSQLAdapter({} as DatabaseConfig);
    const whereClause = (adapter as any).buildWhereClause(filter);
    const sql = `DELETE FROM ${collection} WHERE ${whereClause.clause} RETURNING data`;
    const result = await this.execute(sql, whereClause.params);
    return result.rows?.[0]?.data;
  }

  async deleteMany(collection: string, filter: any): Promise<any> {
    const adapter = new PostgreSQLAdapter({} as DatabaseConfig);
    const whereClause = (adapter as any).buildWhereClause(filter);
    const sql = `DELETE FROM ${collection} WHERE ${whereClause.clause}`;
    const result = await this.execute(sql, whereClause.params);
    return { deletedCount: result.rowCount || 0 };
  }
}