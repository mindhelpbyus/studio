/**
 * Database Factory - Multi-Database Abstraction Layer
 * Supports PostgreSQL, MySQL, MongoDB, DynamoDB, CosmosDB
 */

import { DatabaseAdapter, DatabaseConfig, QueryResult, Transaction } from './interfaces';
import { PostgreSQLAdapter } from './adapters/postgresql';
import { FirestoreAdapter } from './adapters/firestore';
// Note: Other adapters are stubs - implement as needed
// import { MySQLAdapter } from './adapters/mysql';
// import { MongoDBAdapter } from './adapters/mongodb';
// import { DynamoDBAdapter } from './adapters/dynamodb';
// import { CosmosDBAdapter } from './adapters/cosmosdb';

export type DatabaseType = 'postgresql' | 'mysql' | 'mongodb' | 'dynamodb' | 'cosmosdb' | 'firestore';

export class DatabaseFactory {
  private static adapters: Map<DatabaseType, DatabaseAdapter> = new Map();

  static async createAdapter(config: DatabaseConfig): Promise<DatabaseAdapter> {
    const cacheKey = config.type;
    
    // Return cached adapter if available
    if (this.adapters.has(cacheKey)) {
      const adapter = this.adapters.get(cacheKey)!;
      if (adapter.isConnected()) {
        return adapter;
      }
    }

    // Create new adapter based on type
    let adapter: DatabaseAdapter;
    
    switch (config.type) {
      case 'postgresql':
        adapter = new PostgreSQLAdapter(config);
        break;
      case 'firestore':
        adapter = new FirestoreAdapter(config);
        break;
      case 'mysql':
        throw new Error('MySQL adapter not yet implemented - use PostgreSQL or Firestore');
      case 'mongodb':
        throw new Error('MongoDB adapter not yet implemented - use PostgreSQL or Firestore');
      case 'dynamodb':
        throw new Error('DynamoDB adapter not yet implemented - use PostgreSQL or Firestore');
      case 'cosmosdb':
        throw new Error('CosmosDB adapter not yet implemented - use PostgreSQL or Firestore');
      default:
        throw new Error(`Unsupported database type: ${config.type}`);
    }

    // Initialize connection
    await adapter.connect();
    
    // Cache the adapter
    this.adapters.set(cacheKey, adapter);
    
    return adapter;
  }

  static async closeAll(): Promise<void> {
    const closePromises = Array.from(this.adapters.values()).map(adapter => 
      adapter.disconnect()
    );
    
    await Promise.all(closePromises);
    this.adapters.clear();
  }

  static getAdapter(type: DatabaseType): DatabaseAdapter | undefined {
    return this.adapters.get(type);
  }

  static listAdapters(): DatabaseType[] {
    return Array.from(this.adapters.keys());
  }
}

// Singleton database manager
export class DatabaseManager {
  private static instance: DatabaseManager;
  private primaryAdapter: DatabaseAdapter | null = null;
  private readReplicas: DatabaseAdapter[] = [];
  private config: DatabaseConfig | null = null;

  private constructor() {}

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  async initialize(config: DatabaseConfig): Promise<void> {
    this.config = config;
    this.primaryAdapter = await DatabaseFactory.createAdapter(config);

    // Initialize read replicas if configured
    if (config.readReplicas) {
      for (const replicaConfig of config.readReplicas) {
        const replica = await DatabaseFactory.createAdapter(replicaConfig);
        this.readReplicas.push(replica);
      }
    }
  }

  getPrimaryAdapter(): DatabaseAdapter {
    if (!this.primaryAdapter) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.primaryAdapter;
  }

  getReadAdapter(): DatabaseAdapter {
    // Use read replica if available, otherwise use primary
    if (this.readReplicas.length > 0) {
      // Simple round-robin selection
      const index = Math.floor(Math.random() * this.readReplicas.length);
      return this.readReplicas[index];
    }
    return this.getPrimaryAdapter();
  }

  async query(sql: string, params?: any[]): Promise<QueryResult> {
    const adapter = this.getReadAdapter();
    return adapter.query(sql, params);
  }

  async execute(sql: string, params?: any[]): Promise<QueryResult> {
    const adapter = this.getPrimaryAdapter();
    return adapter.execute(sql, params);
  }

  async transaction<T>(callback: (tx: Transaction) => Promise<T>): Promise<T> {
    const adapter = this.getPrimaryAdapter();
    return adapter.transaction(callback);
  }

  async findOne(collection: string, filter: any): Promise<any> {
    const adapter = this.getReadAdapter();
    return adapter.findOne(collection, filter);
  }

  async findMany(collection: string, filter: any, options?: any): Promise<any[]> {
    const adapter = this.getReadAdapter();
    return adapter.findMany(collection, filter, options);
  }

  async insertOne(collection: string, document: any): Promise<any> {
    const adapter = this.getPrimaryAdapter();
    return adapter.insertOne(collection, document);
  }

  async insertMany(collection: string, documents: any[]): Promise<any[]> {
    const adapter = this.getPrimaryAdapter();
    return adapter.insertMany(collection, documents);
  }

  async updateOne(collection: string, filter: any, update: any): Promise<any> {
    const adapter = this.getPrimaryAdapter();
    return adapter.updateOne(collection, filter, update);
  }

  async updateMany(collection: string, filter: any, update: any): Promise<any> {
    const adapter = this.getPrimaryAdapter();
    return adapter.updateMany(collection, filter, update);
  }

  async deleteOne(collection: string, filter: any): Promise<any> {
    const adapter = this.getPrimaryAdapter();
    return adapter.deleteOne(collection, filter);
  }

  async deleteMany(collection: string, filter: any): Promise<any> {
    const adapter = this.getPrimaryAdapter();
    return adapter.deleteMany(collection, filter);
  }

  async healthCheck(): Promise<boolean> {
    try {
      const adapter = this.getPrimaryAdapter();
      return await adapter.healthCheck();
    } catch (error) {
      return false;
    }
  }

  async close(): Promise<void> {
    if (this.primaryAdapter) {
      await this.primaryAdapter.disconnect();
      this.primaryAdapter = null;
    }

    for (const replica of this.readReplicas) {
      await replica.disconnect();
    }
    this.readReplicas = [];

    await DatabaseFactory.closeAll();
  }
}

// Convenience functions
export const db = DatabaseManager.getInstance();

export async function initializeDatabase(config: DatabaseConfig): Promise<void> {
  return db.initialize(config);
}

export async function query(sql: string, params?: any[]): Promise<QueryResult> {
  return db.query(sql, params);
}

export async function execute(sql: string, params?: any[]): Promise<QueryResult> {
  return db.execute(sql, params);
}

export async function transaction<T>(callback: (tx: Transaction) => Promise<T>): Promise<T> {
  return db.transaction(callback);
}

export async function findOne(collection: string, filter: any): Promise<any> {
  return db.findOne(collection, filter);
}

export async function findMany(collection: string, filter: any, options?: any): Promise<any[]> {
  return db.findMany(collection, filter, options);
}

export async function insertOne(collection: string, document: any): Promise<any> {
  return db.insertOne(collection, document);
}

export async function insertMany(collection: string, documents: any[]): Promise<any[]> {
  return db.insertMany(collection, documents);
}

export async function updateOne(collection: string, filter: any, update: any): Promise<any> {
  return db.updateOne(collection, filter, update);
}

export async function updateMany(collection: string, filter: any, update: any): Promise<any> {
  return db.updateMany(collection, filter, update);
}

export async function deleteOne(collection: string, filter: any): Promise<any> {
  return db.deleteOne(collection, filter);
}

export async function deleteMany(collection: string, filter: any): Promise<any> {
  return db.deleteMany(collection, filter, update);
}