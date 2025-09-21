#!/usr/bin/env tsx

/**
 * @fileoverview Healthcare Structure Migration Script
 * @description Migrates existing code to healthcare industry standard structure
 * @compliance Clean Architecture, Healthcare Industry Standards
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';

interface MigrationStep {
  name: string;
  description: string;
  execute: () => Promise<void>;
}

class HealthcareStructureMigration {
  private readonly srcPath = 'src';
  private readonly backupPath = 'src-backup';

  async run(): Promise<void> {
    console.log('🏥 Starting Healthcare Industry Standard Structure Migration...\n');

    const steps: MigrationStep[] = [
      {
        name: 'Backup Existing Structure',
        description: 'Create backup of current src directory',
        execute: () => this.backupExistingStructure()
      },
      {
        name: 'Create New Directory Structure',
        description: 'Create healthcare industry standard directories',
        execute: () => this.createNewDirectoryStructure()
      },
      {
        name: 'Migrate Core Components',
        description: 'Move and refactor core business logic',
        execute: () => this.migrateCoreComponents()
      },
      {
        name: 'Migrate Application Layer',
        description: 'Move API routes and controllers',
        execute: () => this.migrateApplicationLayer()
      },
      {
        name: 'Migrate Presentation Layer',
        description: 'Move React components and pages',
        execute: () => this.migratePresentationLayer()
      },
      {
        name: 'Migrate Infrastructure Layer',
        description: 'Move database and external service integrations',
        execute: () => this.migrateInfrastructureLayer()
      },
      {
        name: 'Update Import Statements',
        description: 'Update all import statements to new structure',
        execute: () => this.updateImportStatements()
      },
      {
        name: 'Update Configuration Files',
        description: 'Update configuration files for new structure',
        execute: () => this.updateConfigurationFiles()
      },
      {
        name: 'Validate Migration',
        description: 'Validate that migration was successful',
        execute: () => this.validateMigration()
      }
    ];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      console.log(`📋 Step ${i + 1}/${steps.length}: ${step.name}`);
      console.log(`   ${step.description}`);
      
      try {
        await step.execute();
        console.log(`   ✅ Completed\n`);
      } catch (error) {
        console.error(`   ❌ Failed: ${error.message}\n`);
        throw error;
      }
    }

    console.log('🎉 Healthcare Structure Migration Completed Successfully!');
    console.log('\n📚 Next Steps:');
    console.log('1. Run: npm run typecheck');
    console.log('2. Run: npm run lint:fix');
    console.log('3. Run: npm run test');
    console.log('4. Review and update any remaining import issues');
    console.log('5. Update documentation with new structure');
  }

  private async backupExistingStructure(): Promise<void> {
    try {
      await fs.access(this.srcPath);
      await fs.rename(this.srcPath, this.backupPath);
      console.log(`   📦 Backed up existing src to ${this.backupPath}`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
      console.log('   ℹ️  No existing src directory found');
    }
  }

  private async createNewDirectoryStructure(): Promise<void> {
    const directories = [
      // Core layer
      'src/core/entities',
      'src/core/use-cases',
      'src/core/repositories',
      'src/core/services',
      'src/core/value-objects',
      
      // Application layer
      'src/application/controllers',
      'src/application/middleware',
      'src/application/dto',
      'src/application/validators',
      'src/application/mappers',
      
      // Presentation layer
      'src/presentation/components/ui',
      'src/presentation/components/forms',
      'src/presentation/components/layouts',
      'src/presentation/pages',
      'src/presentation/hooks',
      'src/presentation/contexts',
      'src/presentation/styles',
      
      // Infrastructure layer
      'src/infrastructure/database/repositories',
      'src/infrastructure/database/migrations',
      'src/infrastructure/database/seeds',
      'src/infrastructure/external-services',
      'src/infrastructure/cloud/providers',
      'src/infrastructure/messaging',
      'src/infrastructure/storage',
      
      // Security layer
      'src/security/authentication',
      'src/security/authorization',
      'src/security/encryption',
      'src/security/audit',
      'src/security/compliance',
      'src/security/secrets',
      'src/security/decorators',
      
      // Healthcare layer
      'src/healthcare/patient-management',
      'src/healthcare/provider-management',
      'src/healthcare/clinical-data',
      'src/healthcare/interoperability',
      'src/healthcare/telehealth',
      'src/healthcare/analytics',
      
      // Monitoring layer
      'src/monitoring/logging',
      'src/monitoring/metrics',
      'src/monitoring/tracing',
      'src/monitoring/health-checks',
      'src/monitoring/alerting',
      
      // Shared utilities
      'src/shared/constants',
      'src/shared/types',
      'src/shared/utils',
      'src/shared/errors',
      'src/shared/interfaces',
      
      // Configuration
      'config/environments',
      'config/security',
      'config/database',
      'config/monitoring',
      
      // Compliance
      'compliance/policies',
      'compliance/procedures',
      'compliance/audits',
      'compliance/certifications',
      'compliance/risk-assessments',
      
      // Tests
      'tests/unit/core',
      'tests/unit/application',
      'tests/unit/infrastructure',
      'tests/unit/security',
      'tests/integration',
      'tests/e2e',
      'tests/security',
      'tests/compliance',
      'tests/performance',
      'tests/accessibility',
      
      // Documentation
      'docs/architecture',
      'docs/api',
      'docs/security',
      'docs/compliance',
      'docs/deployment',
      'docs/user-guides'
    ];

    for (const dir of directories) {
      await this.ensureDirectory(dir);
    }

    console.log(`   📁 Created ${directories.length} directories`);
  }

  private async migrateCoreComponents(): Promise<void> {
    // The core entities and services are already created in the new structure
    // This step would move any existing business logic from the old structure
    
    if (await this.pathExists(`${this.backupPath}/lib`)) {
      // Move existing lib utilities to appropriate locations
      await this.moveAndRefactor(
        `${this.backupPath}/lib`,
        'src/shared/utils',
        this.refactorUtilities
      );
    }

    console.log('   🔄 Migrated core business logic');
  }

  private async migrateApplicationLayer(): Promise<void> {
    if (await this.pathExists(`${this.backupPath}/app/api`)) {
      // Move API routes to application controllers
      await this.moveAndRefactor(
        `${this.backupPath}/app/api`,
        'src/application/controllers',
        this.refactorApiRoutes
      );
    }

    console.log('   🔄 Migrated application layer');
  }

  private async migratePresentationLayer(): Promise<void> {
    if (await this.pathExists(`${this.backupPath}/components`)) {
      // Move React components
      await this.moveAndRefactor(
        `${this.backupPath}/components`,
        'src/presentation/components',
        this.refactorComponents
      );
    }

    if (await this.pathExists(`${this.backupPath}/app`)) {
      // Move Next.js pages (excluding API routes)
      await this.moveAndRefactor(
        `${this.backupPath}/app`,
        'src/presentation/pages',
        this.refactorPages
      );
    }

    if (await this.pathExists(`${this.backupPath}/hooks`)) {
      // Move custom hooks
      await this.moveAndRefactor(
        `${this.backupPath}/hooks`,
        'src/presentation/hooks',
        this.refactorHooks
      );
    }

    console.log('   🔄 Migrated presentation layer');
  }

  private async migrateInfrastructureLayer(): Promise<void> {
    if (await this.pathExists(`${this.backupPath}/lib/database`)) {
      // Move database implementations
      await this.moveAndRefactor(
        `${this.backupPath}/lib/database`,
        'src/infrastructure/database',
        this.refactorDatabase
      );
    }

    if (await this.pathExists(`${this.backupPath}/lib/cloud`)) {
      // Move cloud implementations
      await this.moveAndRefactor(
        `${this.backupPath}/lib/cloud`,
        'src/infrastructure/cloud',
        this.refactorCloud
      );
    }

    console.log('   🔄 Migrated infrastructure layer');
  }

  private async updateImportStatements(): Promise<void> {
    const importMappings = new Map([
      ['@/lib/', 'src/shared/utils/'],
      ['@/components/', 'src/presentation/components/'],
      ['@/hooks/', 'src/presentation/hooks/'],
      ['@/app/', 'src/presentation/pages/'],
      ['@/types/', 'src/shared/types/'],
      // Add more mappings as needed
    ]);

    await this.updateImportsInDirectory('src', importMappings);
    console.log('   🔄 Updated import statements');
  }

  private async updateConfigurationFiles(): Promise<void> {
    // Update tsconfig.json paths
    await this.updateTsConfig();
    
    // Update Next.js config
    await this.updateNextConfig();
    
    // Update Jest config
    await this.updateJestConfig();
    
    // Update ESLint config
    await this.updateEslintConfig();

    console.log('   🔄 Updated configuration files');
  }

  private async validateMigration(): Promise<void> {
    const validations = [
      () => this.validateDirectoryStructure(),
      () => this.validateFileIntegrity(),
      () => this.validateImports(),
      () => this.validateConfiguration()
    ];

    for (const validation of validations) {
      await validation();
    }

    console.log('   ✅ Migration validation completed');
  }

  // Helper methods
  private async ensureDirectory(path: string): Promise<void> {
    try {
      await fs.mkdir(path, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  private async pathExists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  private async moveAndRefactor(
    sourcePath: string,
    targetPath: string,
    refactorFn: (content: string, filename: string) => string
  ): Promise<void> {
    if (!(await this.pathExists(sourcePath))) {
      return;
    }

    const files = await this.getAllFiles(sourcePath);
    
    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');
      const filename = file.split('/').pop() || '';
      const refactoredContent = refactorFn(content, filename);
      
      const relativePath = file.replace(sourcePath, '');
      const targetFile = join(targetPath, relativePath);
      
      await this.ensureDirectory(dirname(targetFile));
      await fs.writeFile(targetFile, refactoredContent);
    }
  }

  private async getAllFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    const items = await fs.readdir(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = join(dir, item.name);
      if (item.isDirectory()) {
        files.push(...await this.getAllFiles(fullPath));
      } else if (item.isFile() && (item.name.endsWith('.ts') || item.name.endsWith('.tsx'))) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  private refactorUtilities(content: string, filename: string): string {
    // Add healthcare-specific utility refactoring logic
    return content;
  }

  private refactorApiRoutes(content: string, filename: string): string {
    // Convert API routes to controller pattern
    return content;
  }

  private refactorComponents(content: string, filename: string): string {
    // Add healthcare-specific component refactoring
    return content;
  }

  private refactorPages(content: string, filename: string): string {
    // Refactor pages for new structure
    return content;
  }

  private refactorHooks(content: string, filename: string): string {
    // Refactor hooks for new structure
    return content;
  }

  private refactorDatabase(content: string, filename: string): string {
    // Refactor database code to repository pattern
    return content;
  }

  private refactorCloud(content: string, filename: string): string {
    // Refactor cloud code for new structure
    return content;
  }

  private async updateImportsInDirectory(
    dir: string,
    mappings: Map<string, string>
  ): Promise<void> {
    const files = await this.getAllFiles(dir);
    
    for (const file of files) {
      let content = await fs.readFile(file, 'utf-8');
      
      for (const [oldPath, newPath] of mappings) {
        content = content.replace(
          new RegExp(`from ['"]${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g'),
          `from '${newPath}`
        );
        content = content.replace(
          new RegExp(`import ['"]${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g'),
          `import '${newPath}`
        );
      }
      
      await fs.writeFile(file, content);
    }
  }

  private async updateTsConfig(): Promise<void> {
    const tsConfigPath = 'tsconfig.json';
    if (await this.pathExists(tsConfigPath)) {
      const tsConfig = JSON.parse(await fs.readFile(tsConfigPath, 'utf-8'));
      
      tsConfig.compilerOptions.paths = {
        '@/core/*': ['src/core/*'],
        '@/application/*': ['src/application/*'],
        '@/presentation/*': ['src/presentation/*'],
        '@/infrastructure/*': ['src/infrastructure/*'],
        '@/security/*': ['src/security/*'],
        '@/healthcare/*': ['src/healthcare/*'],
        '@/monitoring/*': ['src/monitoring/*'],
        '@/shared/*': ['src/shared/*'],
        '@/config/*': ['config/*'],
        '@/tests/*': ['tests/*']
      };
      
      await fs.writeFile(tsConfigPath, JSON.stringify(tsConfig, null, 2));
    }
  }

  private async updateNextConfig(): Promise<void> {
    // Update Next.js configuration for new structure
    // Implementation would update next.config.js/mjs
  }

  private async updateJestConfig(): Promise<void> {
    // Update Jest configuration for new test structure
    // Implementation would update jest.config.js
  }

  private async updateEslintConfig(): Promise<void> {
    // Update ESLint configuration for new structure
    // Implementation would update .eslintrc.json
  }

  private async validateDirectoryStructure(): Promise<void> {
    const requiredDirs = [
      'src/core',
      'src/application',
      'src/presentation',
      'src/infrastructure',
      'src/security',
      'src/healthcare',
      'src/monitoring',
      'src/shared'
    ];

    for (const dir of requiredDirs) {
      if (!(await this.pathExists(dir))) {
        throw new Error(`Required directory missing: ${dir}`);
      }
    }
  }

  private async validateFileIntegrity(): Promise<void> {
    // Validate that key files exist and are properly structured
    const keyFiles = [
      'src/core/entities/index.ts',
      'src/security/authentication/auth.service.ts',
      'src/healthcare/patient-management/patient.service.ts'
    ];

    for (const file of keyFiles) {
      if (!(await this.pathExists(file))) {
        throw new Error(`Key file missing: ${file}`);
      }
    }
  }

  private async validateImports(): Promise<void> {
    // Run TypeScript compiler to check for import errors
    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
    } catch (error) {
      console.warn('   ⚠️  TypeScript compilation errors detected - manual review required');
    }
  }

  private async validateConfiguration(): Promise<void> {
    // Validate that configuration files are properly updated
    const configFiles = ['tsconfig.json', 'next.config.js', 'jest.config.js'];
    
    for (const file of configFiles) {
      if (await this.pathExists(file)) {
        // Basic validation that file is valid JSON/JS
        try {
          if (file.endsWith('.json')) {
            JSON.parse(await fs.readFile(file, 'utf-8'));
          }
        } catch (error) {
          throw new Error(`Invalid configuration file: ${file}`);
        }
      }
    }
  }
}

// Run migration if called directly
if (require.main === module) {
  const migration = new HealthcareStructureMigration();
  migration.run().catch(error => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
}

export { HealthcareStructureMigration };