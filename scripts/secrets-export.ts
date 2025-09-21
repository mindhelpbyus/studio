#!/usr/bin/env tsx
/**
 * Secrets Export Script
 * Exports secrets in encrypted format for Git storage
 */

import { SecretsManager } from '../src/lib/security/secrets-manager';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

class SecretsExporter {
  private secretsManager: SecretsManager;

  constructor() {
    this.secretsManager = SecretsManager.getInstance();
  }

  async exportSecrets(outputPath: string = '.secrets.encrypted.json'): Promise<void> {
    console.log('🔐 Exporting secrets in encrypted format...');

    try {
      // Initialize secrets manager
      await this.secretsManager.initialize({
        provider: 'local',
        encryptionKey: process.env.ENCRYPTION_KEY,
      });

      // Export encrypted secrets
      const encryptedSecrets = await this.secretsManager.exportSecretsForGit();

      // Add metadata
      const exportData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        secrets: encryptedSecrets,
      };

      // Write to file
      writeFileSync(outputPath, JSON.stringify(exportData, null, 2));

      console.log(`✅ Secrets exported to: ${outputPath}`);
      console.log(`📊 Exported ${Object.keys(encryptedSecrets).length} secrets`);
      
      // Show summary
      console.log('\n📋 Exported secrets:');
      Object.keys(encryptedSecrets).forEach(name => {
        console.log(`   - ${name}`);
      });

    } catch (error) {
      console.error('❌ Failed to export secrets:', error);
      throw error;
    }
  }

  async importSecrets(inputPath: string = '.secrets.encrypted.json'): Promise<void> {
    console.log('🔓 Importing secrets from encrypted format...');

    try {
      if (!existsSync(inputPath)) {
        throw new Error(`Secrets file not found: ${inputPath}`);
      }

      // Read encrypted secrets file
      const fileContent = readFileSync(inputPath, 'utf8');
      const importData = JSON.parse(fileContent);

      console.log(`📋 Import metadata:`);
      console.log(`   - Version: ${importData.version}`);
      console.log(`   - Timestamp: ${importData.timestamp}`);
      console.log(`   - Environment: ${importData.environment}`);
      console.log(`   - Secrets count: ${Object.keys(importData.secrets).length}`);

      // Initialize secrets manager
      await this.secretsManager.initialize({
        provider: 'local',
        encryptionKey: process.env.ENCRYPTION_KEY,
      });

      // Import secrets
      await this.secretsManager.importSecretsFromGit(importData.secrets);

      console.log('✅ Secrets imported successfully');

    } catch (error) {
      console.error('❌ Failed to import secrets:', error);
      throw error;
    }
  }

  async listSecrets(): Promise<void> {
    console.log('📋 Listing available secrets...');

    try {
      // Initialize secrets manager
      await this.secretsManager.initialize({
        provider: 'local',
        encryptionKey: process.env.ENCRYPTION_KEY,
      });

      const secretNames = await this.secretsManager.listSecrets();

      if (secretNames.length === 0) {
        console.log('No secrets found');
        return;
      }

      console.log(`Found ${secretNames.length} secrets:`);
      secretNames.forEach(name => {
        console.log(`   - ${name}`);
      });

    } catch (error) {
      console.error('❌ Failed to list secrets:', error);
      throw error;
    }
  }

  async rotateSecret(secretName: string): Promise<void> {
    console.log(`🔄 Rotating secret: ${secretName}`);

    try {
      // Initialize secrets manager
      await this.secretsManager.initialize({
        provider: 'local',
        encryptionKey: process.env.ENCRYPTION_KEY,
      });

      // Generate new secret value (this is a simplified example)
      const newValue = this.generateSecureValue();

      // Rotate the secret
      await this.secretsManager.rotateSecret(secretName, newValue);

      console.log(`✅ Secret rotated: ${secretName}`);
      console.log(`🔑 New value: ${newValue.substring(0, 8)}...`);

    } catch (error) {
      console.error(`❌ Failed to rotate secret ${secretName}:`, error);
      throw error;
    }
  }

  async validateSecrets(): Promise<void> {
    console.log('🔍 Validating secrets...');

    try {
      // Initialize secrets manager
      await this.secretsManager.initialize({
        provider: 'local',
        encryptionKey: process.env.ENCRYPTION_KEY,
      });

      const isHealthy = await this.secretsManager.healthCheck();

      if (isHealthy) {
        console.log('✅ Secrets manager is healthy');
      } else {
        console.log('❌ Secrets manager health check failed');
        process.exit(1);
      }

      // Check required secrets
      const requiredSecrets = [
        'jwt-secret',
        'database-password',
        'encryption-key',
      ];

      let missingSecrets = 0;

      for (const secretName of requiredSecrets) {
        const value = await this.secretsManager.getSecret(secretName);
        if (value) {
          console.log(`✅ ${secretName}: present`);
        } else {
          console.log(`❌ ${secretName}: missing`);
          missingSecrets++;
        }
      }

      if (missingSecrets > 0) {
        console.log(`\n⚠️  ${missingSecrets} required secrets are missing`);
        process.exit(1);
      } else {
        console.log('\n✅ All required secrets are present');
      }

    } catch (error) {
      console.error('❌ Failed to validate secrets:', error);
      throw error;
    }
  }

  private generateSecureValue(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const exporter = new SecretsExporter();

  try {
    switch (command) {
      case 'export':
        const outputPath = args[1] || '.secrets.encrypted.json';
        await exporter.exportSecrets(outputPath);
        break;

      case 'import':
        const inputPath = args[1] || '.secrets.encrypted.json';
        await exporter.importSecrets(inputPath);
        break;

      case 'list':
        await exporter.listSecrets();
        break;

      case 'rotate':
        const secretName = args[1];
        if (!secretName) {
          console.error('❌ Secret name required for rotation');
          process.exit(1);
        }
        await exporter.rotateSecret(secretName);
        break;

      case 'validate':
        await exporter.validateSecrets();
        break;

      default:
        console.log('Usage:');
        console.log('  npm run secrets:export [file]     # Export secrets to encrypted file');
        console.log('  npm run secrets:import [file]     # Import secrets from encrypted file');
        console.log('  npm run secrets:list              # List available secrets');
        console.log('  npm run secrets:rotate <name>     # Rotate a specific secret');
        console.log('  npm run secrets:validate          # Validate secrets configuration');
        process.exit(1);
    }
  } catch (error) {
    console.error('Secrets command failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { SecretsExporter };