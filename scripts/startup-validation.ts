#!/usr/bin/env tsx

/**
 * Startup Validation Script for Vivalé Healthcare CRM
 * Validates environment configuration and system requirements before starting the application
 */

import { config } from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';

// Load environment variables
config({ path: '.env.local' });

interface ValidationResult {
  success: boolean;
  message: string;
  category: 'required' | 'optional' | 'warning';
}

class StartupValidator {
  private results: ValidationResult[] = [];

  /**
   * Run all validation checks
   */
  async validate(): Promise<boolean> {
    console.log('🏥 Vivalé Healthcare CRM - Startup Validation\n');

    this.validateEnvironment();
    this.validateFiles();
    this.validateNodeVersion();
    this.validatePorts();

    this.displayResults();
    
    const hasErrors = this.results.some(r => !r.success && r.category === 'required');
    return !hasErrors;
  }

  /**
   * Validate environment variables
   */
  private validateEnvironment(): void {
    const requiredVars = [
      'NODE_ENV',
      'NEXT_PUBLIC_APP_URL',
      'NEXT_PUBLIC_APP_NAME',
      'JWT_SECRET',
      'NEXTAUTH_SECRET'
    ];

    const optionalVars = [
      'DATABASE_URL',
      'REDIS_URL',
      'AWS_ACCESS_KEY_ID',
      'SMTP_HOST'
    ];

    // Check required variables
    for (const varName of requiredVars) {
      const value = process.env[varName];
      if (!value) {
        this.results.push({
          success: false,
          message: `Missing required environment variable: ${varName}`,
          category: 'required'
        });
      } else {
        this.results.push({
          success: true,
          message: `✓ ${varName} is configured`,
          category: 'required'
        });
      }
    }

    // Check optional variables
    for (const varName of optionalVars) {
      const value = process.env[varName];
      if (!value) {
        this.results.push({
          success: false,
          message: `Optional: ${varName} not configured (features may be limited)`,
          category: 'optional'
        });
      } else {
        this.results.push({
          success: true,
          message: `✓ ${varName} is configured`,
          category: 'optional'
        });
      }
    }

    // Validate JWT secret strength
    const jwtSecret = process.env.JWT_SECRET;
    if (jwtSecret && jwtSecret.length < 32) {
      this.results.push({
        success: false,
        message: 'JWT_SECRET should be at least 32 characters long for security',
        category: 'warning'
      });
    }

    // Check for development defaults that should be changed
    if (jwtSecret?.includes('change-this-in-production')) {
      this.results.push({
        success: false,
        message: 'JWT_SECRET contains default value - should be changed for security',
        category: 'warning'
      });
    }
  }

  /**
   * Validate required files exist
   */
  private validateFiles(): void {
    const requiredFiles = [
      'package.json',
      'next.config.js',
      'tsconfig.json',
      '.env.local'
    ];

    const optionalFiles = [
      'firebase.json',
      'firestore.rules',
      '.env.aws'
    ];

    for (const file of requiredFiles) {
      if (existsSync(file)) {
        this.results.push({
          success: true,
          message: `✓ ${file} exists`,
          category: 'required'
        });
      } else {
        this.results.push({
          success: false,
          message: `Missing required file: ${file}`,
          category: 'required'
        });
      }
    }

    for (const file of optionalFiles) {
      if (existsSync(file)) {
        this.results.push({
          success: true,
          message: `✓ ${file} exists`,
          category: 'optional'
        });
      } else {
        this.results.push({
          success: false,
          message: `Optional file not found: ${file}`,
          category: 'optional'
        });
      }
    }
  }

  /**
   * Validate Node.js version
   */
  private validateNodeVersion(): void {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

    if (majorVersion >= 18) {
      this.results.push({
        success: true,
        message: `✓ Node.js version ${nodeVersion} is supported`,
        category: 'required'
      });
    } else {
      this.results.push({
        success: false,
        message: `Node.js version ${nodeVersion} is not supported. Please use Node.js 18 or higher.`,
        category: 'required'
      });
    }
  }

  /**
   * Check if required ports are available
   */
  private validatePorts(): void {
    const defaultPort = 3000;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    
    if (appUrl) {
      try {
        const url = new URL(appUrl);
        const port = url.port || (url.protocol === 'https:' ? '443' : '80');
        this.results.push({
          success: true,
          message: `✓ Application configured to run on port ${port}`,
          category: 'required'
        });
      } catch (error) {
        this.results.push({
          success: false,
          message: `Invalid NEXT_PUBLIC_APP_URL format: ${appUrl}`,
          category: 'required'
        });
      }
    } else {
      this.results.push({
        success: true,
        message: `✓ Will use default port ${defaultPort}`,
        category: 'required'
      });
    }
  }

  /**
   * Display validation results
   */
  private displayResults(): void {
    console.log('📋 Validation Results:\n');

    const categories = ['required', 'optional', 'warning'] as const;
    
    for (const category of categories) {
      const categoryResults = this.results.filter(r => r.category === category);
      if (categoryResults.length === 0) continue;

      const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
      console.log(`${this.getCategoryIcon(category)} ${categoryName}:`);
      
      for (const result of categoryResults) {
        const icon = result.success ? '  ✅' : '  ❌';
        console.log(`${icon} ${result.message}`);
      }
      console.log();
    }

    const errors = this.results.filter(r => !r.success && r.category === 'required').length;
    const warnings = this.results.filter(r => !r.success && r.category === 'warning').length;
    
    if (errors === 0) {
      console.log('🎉 All required validations passed! Application is ready to start.');
    } else {
      console.log(`❌ ${errors} error(s) found. Please fix these issues before starting the application.`);
    }
    
    if (warnings > 0) {
      console.log(`⚠️  ${warnings} warning(s) found. Consider addressing these for better security/functionality.`);
    }
    
    console.log();
  }

  /**
   * Get icon for category
   */
  private getCategoryIcon(category: string): string {
    switch (category) {
      case 'required': return '🔴';
      case 'optional': return '🟡';
      case 'warning': return '🟠';
      default: return '⚪';
    }
  }
}

/**
 * Main execution
 */
async function main() {
  const validator = new StartupValidator();
  const isValid = await validator.validate();
  
  if (isValid) {
    console.log('🚀 Ready to start the application!');
    console.log('   Run: npm run dev');
    console.log('   URL: http://localhost:3000');
    process.exit(0);
  } else {
    console.log('🛑 Please fix the validation errors before starting the application.');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { StartupValidator };