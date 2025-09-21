/**
 * @fileoverview Base Entity Interface
 * @description Common properties for all domain entities
 * @compliance HIPAA, GDPR, ISO/IEC 27799
 */

export interface BaseEntity {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly createdBy: string;
  readonly updatedBy: string;
  readonly version: number;
  readonly isDeleted: boolean;
  readonly deletedAt?: Date;
  readonly deletedBy?: string;
  readonly tenantId?: string; // Multi-tenancy support
}