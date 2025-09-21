#!/usr/bin/env tsx
/**
 * Database Migration Script
 * Runs database migrations across all supported databases
 */

import { DatabaseManager } from '../src/lib/database/database-factory';
import { Migration } from '../src/lib/database/interfaces';

interface MigrationConfig {
  databaseType: 'postgresql' | 'mysql' | 'mongodb' | 'dynamodb' | 'cosmosdb' | 'firestore';
  connectionString: string;
  migrationsPath: string;
}

class MigrationRunner {
  private db: DatabaseManager;

  constructor() {
    this.db = DatabaseManager.getInstance();
  }

  async runMigrations(config: MigrationConfig): Promise<void> {
    console.log(`🔄 Running migrations for ${config.databaseType}...`);

    try {
      // Initialize database connection
      await this.db.initialize({
        type: config.databaseType,
        connectionString: config.connectionString,
        projectId: process.env.FIREBASE_PROJECT_ID,
        credentials: process.env.FIREBASE_SERVICE_ACCOUNT_KEY ? 
          JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY) : undefined,
      });

      // Create migrations table if it doesn't exist
      await this.createMigrationsTable();

      // Get pending migrations
      const pendingMigrations = await this.getPendingMigrations(config.migrationsPath);

      if (pendingMigrations.length === 0) {
        console.log('✅ No pending migrations found');
        return;
      }

      console.log(`📋 Found ${pendingMigrations.length} pending migrations:`);
      pendingMigrations.forEach(migration => {
        console.log(`   - ${migration.name} (${migration.version})`);
      });

      // Run migrations
      for (const migration of pendingMigrations) {
        await this.runMigration(migration);
      }

      console.log('✅ All migrations completed successfully');
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    } finally {
      await this.db.close();
    }
  }

  private async createMigrationsTable(): Promise<void> {
    const adapter = this.db.getPrimaryAdapter();
    
    if (adapter.createTable) {
      await adapter.createTable('migrations', {
        columns: [
          { name: 'id', type: 'string', nullable: false },
          { name: 'name', type: 'string', nullable: false },
          { name: 'version', type: 'string', nullable: false },
          { name: 'timestamp', type: 'datetime', nullable: false },
          { name: 'checksum', type: 'string', nullable: true },
        ],
        primaryKey: ['id'],
        indexes: [
          { name: 'idx_migrations_version', columns: ['version'] },
          { name: 'idx_migrations_timestamp', columns: ['timestamp'] },
        ],
      });
    }
  }

  private async getPendingMigrations(migrationsPath: string): Promise<Migration[]> {
    // In a real implementation, this would read migration files from the filesystem
    // For now, return sample migrations
    const sampleMigrations: Migration[] = [
      {
        id: '001',
        name: 'create_users_table',
        version: '1.0.0',
        timestamp: new Date(),
        up: `
          CREATE TABLE users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            first_name VARCHAR(100),
            last_name VARCHAR(100),
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `,
        down: 'DROP TABLE users;',
      },
      {
        id: '002',
        name: 'create_appointments_table',
        version: '1.0.1',
        timestamp: new Date(),
        up: `
          CREATE TABLE appointments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            patient_id UUID REFERENCES users(id),
            provider_id UUID REFERENCES users(id),
            appointment_date TIMESTAMP NOT NULL,
            duration_minutes INTEGER DEFAULT 30,
            status VARCHAR(50) DEFAULT 'scheduled',
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `,
        down: 'DROP TABLE appointments;',
      },
    ];

    // Get already applied migrations
    const adapter = this.db.getPrimaryAdapter();
    let appliedMigrations: Migration[] = [];
    
    try {
      if (adapter.getMigrationHistory) {
        appliedMigrations = await adapter.getMigrationHistory();
      }
    } catch (error) {
      // Migrations table might not exist yet
      console.log('No migration history found, will create migrations table');
    }

    // Filter out already applied migrations
    const appliedIds = new Set(appliedMigrations.map(m => m.id));
    return sampleMigrations.filter(m => !appliedIds.has(m.id));
  }

  private async runMigration(migration: Migration): Promise<void> {
    console.log(`🔄 Running migration: ${migration.name}`);
    
    const adapter = this.db.getPrimaryAdapter();
    
    try {
      if (adapter.runMigration) {
        await adapter.runMigration(migration);
      } else {
        // Fallback: run the SQL directly
        if (typeof migration.up === 'string') {
          await adapter.execute(migration.up);
        }
      }
      
      console.log(`✅ Migration completed: ${migration.name}`);
    } catch (error) {
      console.error(`❌ Migration failed: ${migration.name}`, error);
      throw error;
    }
  }

  async rollback(version: string): Promise<void> {
    console.log(`🔄 Rolling back to version: ${version}`);
    
    try {
      const adapter = this.db.getPrimaryAdapter();
      let appliedMigrations: Migration[] = [];
      
      if (adapter.getMigrationHistory) {
        appliedMigrations = await adapter.getMigrationHistory();
      }

      // Find migrations to rollback (newer than target version)
      const migrationsToRollback = appliedMigrations
        .filter(m => m.version > version)
        .sort((a, b) => b.version.localeCompare(a.version)); // Reverse order

      if (migrationsToRollback.length === 0) {
        console.log('✅ No migrations to rollback');
        return;
      }

      console.log(`📋 Rolling back ${migrationsToRollback.length} migrations:`);
      migrationsToRollback.forEach(migration => {
        console.log(`   - ${migration.name} (${migration.version})`);
      });

      // Rollback migrations
      for (const migration of migrationsToRollback) {
        await this.rollbackMigration(migration);
      }

      console.log('✅ Rollback completed successfully');
    } catch (error) {
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }

  private async rollbackMigration(migration: Migration): Promise<void> {
    console.log(`🔄 Rolling back migration: ${migration.name}`);
    
    const adapter = this.db.getPrimaryAdapter();
    
    try {
      if (typeof migration.down === 'string') {
        await adapter.execute(migration.down);
      } else if (typeof migration.down === 'function') {
        await migration.down(adapter);
      }
      
      // Remove from migration history
      await adapter.execute('DELETE FROM migrations WHERE id = $1', [migration.id]);
      
      console.log(`✅ Rollback completed: ${migration.name}`);
    } catch (error) {
      console.error(`❌ Rollback failed: ${migration.name}`, error);
      throw error;
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const config: MigrationConfig = {
    databaseType: (process.env.DATABASE_TYPE as any) || 'postgresql',
    connectionString: process.env.DATABASE_URL || 
      (process.env.DATABASE_TYPE === 'firestore' ? 
        `firestore://${process.env.FIREBASE_PROJECT_ID}` : 
        'postgresql://localhost:5432/vivale_dev'),
    migrationsPath: './migrations',
  };

  const runner = new MigrationRunner();

  try {
    switch (command) {
      case 'up':
      case 'migrate':
        await runner.runMigrations(config);
        break;
      
      case 'down':
      case 'rollback':
        const version = args[1];
        if (!version) {
          console.error('❌ Version required for rollback');
          process.exit(1);
        }
        await runner.rollback(version);
        break;
      
      default:
        console.log('Usage:');
        console.log('  npm run db:migrate          # Run pending migrations');
        console.log('  npm run db:migrate up       # Run pending migrations');
        console.log('  npm run db:migrate down 1.0.0  # Rollback to version 1.0.0');
        process.exit(1);
    }
  } catch (error) {
    console.error('Migration command failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { MigrationRunner };