/**
 * Enhanced User Repository with Database Abstraction
 * Supports multiple database backends through abstraction layer
 */

import { CloudDatabaseService } from '../../cloud/interfaces';
import { NotFoundError, ConflictError } from '../../errors/error-handler';
import { AbstractRepository, QueryOptions } from '../abstract-repository';
import { User } from '../types';

export class UserRepository extends AbstractRepository<User, string> {
  constructor(db: CloudDatabaseService) {
    super(db, 'users');
  }

  async findById(id: string): Promise<User | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE id = $1 AND deleted_at IS NULL`;
    const result = await this.db.query<User>(query, [id]);
    return result[0] || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE email = $1 AND deleted_at IS NULL`;
    const result = await this.db.query<User>(query, [email.toLowerCase()]);
    return result[0] || null;
  }

  async findAll(options?: QueryOptions): Promise<User[]> {
    const { sql, params } = this.buildSelectQuery({
      ...options,
      filters: {
        ...options?.filters,
        deleted_at: null,
      },
    });
    return this.db.query<User>(sql, params);
  }

  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    // Check if email already exists
    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    const user = {
      id: this.generateId(),
      ...this.sanitizeInput(userData),
      email: userData.email.toLowerCase(),
      createdAt: this.now(),
      updatedAt: this.now(),
    };

    const { sql, params } = this.buildInsertQuery(user);
    const result = await this.db.query<User>(sql, params);
    return result[0];
  }

  async update(id: string, updates: Partial<User>): Promise<User> {
    const existingUser = await this.findById(id);
    if (!existingUser) {
      throw new NotFoundError('User');
    }

    // If email is being updated, check for conflicts
    if (updates.email && updates.email !== existingUser.email) {
      const emailExists = await this.findByEmail(updates.email);
      if (emailExists && emailExists.id !== id) {
        throw new ConflictError('User with this email already exists');
      }
      updates.email = updates.email.toLowerCase();
    }

    const sanitizedUpdates = this.sanitizeInput(updates);
    const { sql, params } = this.buildUpdateQuery(id, sanitizedUpdates);
    const result = await this.db.query<User>(sql, params);
    return result[0];
  }

  async delete(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Soft delete
    await this.update(id, { deletedAt: this.now() } as Partial<User>);
  }

  async hardDelete(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundError('User');
    }

    const { sql, params } = this.buildDeleteQuery(id);
    await this.db.query(sql, params);
  }

  // User-specific methods
  async findByRole(role: User['role'], options?: QueryOptions): Promise<User[]> {
    return this.findAll({
      ...options,
      filters: {
        ...options?.filters,
        role,
      },
    });
  }

  async findActiveUsers(options?: QueryOptions): Promise<User[]> {
    return this.findAll({
      ...options,
      filters: {
        ...options?.filters,
        isActive: true,
      },
    });
  }

  async findVerifiedUsers(options?: QueryOptions): Promise<User[]> {
    return this.findAll({
      ...options,
      filters: {
        ...options?.filters,
        emailVerified: true,
      },
    });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.update(id, { 
      lastLoginAt: this.now(),
      updatedAt: this.now(),
    } as Partial<User>);
  }

  async deactivateUser(id: string): Promise<User> {
    return this.update(id, { 
      isActive: false,
      deactivatedAt: this.now(),
    } as Partial<User>);
  }

  async activateUser(id: string): Promise<User> {
    return this.update(id, { 
      isActive: true,
      deactivatedAt: null,
    } as Partial<User>);
  }

  async verifyEmail(id: string): Promise<User> {
    return this.update(id, { 
      emailVerified: true,
      emailVerifiedAt: this.now(),
    } as Partial<User>);
  }

  async updatePassword(id: string, passwordHash: string): Promise<User> {
    return this.update(id, { 
      passwordHash,
      passwordChangedAt: this.now(),
    } as Partial<User>);
  }

  // Bulk operations
  async bulkCreate(users: Omit<User, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<User[]> {
    return this.transaction(async (repo) => {
      const results: User[] = [];
      for (const userData of users) {
        const user = await repo.create(userData);
        results.push(user);
      }
      return results;
    });
  }

  async bulkUpdate(updates: { id: string; data: Partial<User> }[]): Promise<User[]> {
    return this.transaction(async (repo) => {
      const results: User[] = [];
      for (const { id, data } of updates) {
        const user = await repo.update(id, data);
        results.push(user);
      }
      return results;
    });
  }

  async bulkDelete(ids: string[]): Promise<void> {
    return this.transaction(async (repo) => {
      for (const id of ids) {
        await repo.delete(id);
      }
    });
  }

  // Search and filtering
  async searchUsers(query: string, options?: QueryOptions): Promise<User[]> {
    const searchQuery = `
      SELECT * FROM ${this.tableName}
      WHERE (
        LOWER(first_name) LIKE LOWER($1) OR
        LOWER(last_name) LIKE LOWER($1) OR
        LOWER(email) LIKE LOWER($1)
      )
      AND deleted_at IS NULL
      ${options?.orderBy ? `ORDER BY ${options.orderBy} ${options.orderDirection || 'ASC'}` : ''}
      ${options?.limit ? `LIMIT ${options.limit}` : ''}
      ${options?.offset ? `OFFSET ${options.offset}` : ''}
    `;

    const searchPattern = `%${query}%`;
    return this.db.query<User>(searchQuery, [searchPattern]);
  }

  async getUserStats(): Promise<{
    total: number;
    active: number;
    verified: number;
    byRole: Record<string, number>;
  }> {
    const [totalResult, activeResult, verifiedResult, roleResult] = await Promise.all([
      this.count(),
      this.count({ isActive: true }),
      this.count({ emailVerified: true }),
      this.db.query<{ role: string; count: number }>(`
        SELECT role, COUNT(*) as count
        FROM ${this.tableName}
        WHERE deleted_at IS NULL
        GROUP BY role
      `),
    ]);

    const byRole: Record<string, number> = {};
    roleResult.forEach(row => {
      byRole[row.role] = Number(row.count);
    });

    return {
      total: totalResult,
      active: activeResult,
      verified: verifiedResult,
      byRole,
    };
  }

  // Audit and compliance
  async getAuditLog(userId: string, limit: number = 100): Promise<any[]> {
    // This would typically query an audit log table
    const query = `
      SELECT * FROM user_audit_log
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;
    return this.db.query(query, [userId, limit]);
  }

  async logUserAction(userId: string, action: string, metadata?: Record<string, any>): Promise<void> {
    const auditEntry = {
      id: this.generateId(),
      user_id: userId,
      action,
      metadata: JSON.stringify(metadata || {}),
      created_at: this.now(),
    };

    const query = `
      INSERT INTO user_audit_log (id, user_id, action, metadata, created_at)
      VALUES ($1, $2, $3, $4, $5)
    `;

    await this.db.query(query, [
      auditEntry.id,
      auditEntry.user_id,
      auditEntry.action,
      auditEntry.metadata,
      auditEntry.created_at,
    ]);
  }

  // Data export for compliance
  async exportUserData(userId: string): Promise<any> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Get all related data
    const [auditLog, /* other related data */] = await Promise.all([
      this.getAuditLog(userId),
      // Add other related data queries here
    ]);

    return {
      user: {
        ...user,
        passwordHash: '[REDACTED]', // Don't export password hash
      },
      auditLog,
      exportedAt: this.now(),
    };
  }
}