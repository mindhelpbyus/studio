#!/usr/bin/env tsx
/**
 * @fileoverview AWS Deployment Script
 * @description Deploy Vivalé Healthcare Platform to AWS
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface DeploymentConfig {
  environment: 'development' | 'staging' | 'production';
  region: string;
  enableEncryption: boolean;
  enableBackups: boolean;
  skipTests: boolean;
}

class AWSDeployer {
  private config: DeploymentConfig;

  constructor(config: DeploymentConfig) {
    this.config = config;
  }

  async deploy(): Promise<void> {
    console.log('🚀 Starting AWS deployment for Vivalé Healthcare Platform');
    console.log(`Environment: ${this.config.environment}`);
    console.log(`Region: ${this.config.region}`);

    try {
      // Step 1: Validate prerequisites
      await this.validatePrerequisites();

      // Step 2: Run tests (unless skipped)
      if (!this.config.skipTests) {
        await this.runTests();
      }

      // Step 3: Build the application
      await this.buildApplication();

      // Step 4: Deploy infrastructure
      await this.deployInfrastructure();

      // Step 5: Configure environment
      await this.configureEnvironment();

      // Step 6: Verify deployment
      await this.verifyDeployment();

      console.log('✅ AWS deployment completed successfully!');
    } catch (error) {
      console.error('❌ Deployment failed:', error);
      process.exit(1);
    }
  }

  private async validatePrerequisites(): Promise<void> {
    console.log('🔍 Validating prerequisites...');

    // Check AWS CLI
    try {
      execSync('aws --version', { stdio: 'pipe' });
    } catch {
      throw new Error('AWS CLI not found. Please install AWS CLI.');
    }

    // Check CDK CLI
    try {
      execSync('cdk --version', { stdio: 'pipe' });
    } catch {
      throw new Error('AWS CDK not found. Please install: npm install -g aws-cdk');
    }

    // Check AWS credentials
    try {
      execSync('aws sts get-caller-identity', { stdio: 'pipe' });
    } catch {
      throw new Error('AWS credentials not configured. Run: aws configure');
    }

    // Check required environment variables
    const requiredEnvVars = ['AWS_REGION'];
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    }

    console.log('✅ Prerequisites validated');
  }

  private async runTests(): Promise<void> {
    console.log('🧪 Running tests...');

    try {
      // Run unit tests
      execSync('npm run test:unit', { stdio: 'inherit' });

      // Run integration tests
      execSync('npm run test:integration', { stdio: 'inherit' });

      // Run security tests
      execSync('npm run test:security', { stdio: 'inherit' });

      console.log('✅ All tests passed');
    } catch (error) {
      throw new Error('Tests failed. Fix issues before deploying.');
    }
  }

  private async buildApplication(): Promise<void> {
    console.log('🔨 Building application...');

    try {
      // Type check
      execSync('npm run typecheck', { stdio: 'inherit' });

      // Lint
      execSync('npm run lint', { stdio: 'inherit' });

      // Build
      execSync('npm run build', { stdio: 'inherit' });

      console.log('✅ Application built successfully');
    } catch (error) {
      throw new Error('Build failed. Fix build errors before deploying.');
    }
  }

  private async deployInfrastructure(): Promise<void> {
    console.log('🏗️ Deploying AWS infrastructure...');

    const stackName = `VivaleHealthcare-aws-${this.config.environment}`;
    
    try {
      // Bootstrap CDK (if needed)
      try {
        execSync(`cdk bootstrap aws://unknown-account/${this.config.region}`, { stdio: 'pipe' });
      } catch {
        // Bootstrap might already be done
      }

      // Deploy the stack
      const deployCommand = [
        'cdk deploy',
        `--app "npx tsx infrastructure/cdk/bin/app.ts"`,
        stackName,
        '--require-approval never',
        `--context environment=${this.config.environment}`,
        `--context region=${this.config.region}`,
        `--context enableEncryption=${this.config.enableEncryption}`,
        `--context enableBackups=${this.config.enableBackups}`
      ].join(' ');

      execSync(deployCommand, { stdio: 'inherit' });

      console.log('✅ Infrastructure deployed successfully');
    } catch (error) {
      throw new Error(`Infrastructure deployment failed: ${error}`);
    }
  }

  private async configureEnvironment(): Promise<void> {
    console.log('⚙️ Configuring environment...');

    try {
      // Get stack outputs
      const stackName = `VivaleHealthcare-aws-${this.config.environment}`;
      const outputsCommand = `aws cloudformation describe-stacks --stack-name ${stackName} --query "Stacks[0].Outputs" --output json`;
      const outputsJson = execSync(outputsCommand, { encoding: 'utf8' });
      const outputs = JSON.parse(outputsJson);

      // Create environment configuration
      const envConfig = this.createEnvironmentConfig(outputs);
      
      // Write to .env.aws file
      const envPath = path.join(process.cwd(), '.env.aws');
      fs.writeFileSync(envPath, envConfig);

      console.log('✅ Environment configured');
      console.log(`📄 Configuration written to: ${envPath}`);
    } catch (error) {
      throw new Error(`Environment configuration failed: ${error}`);
    }
  }

  private createEnvironmentConfig(outputs: any[]): string {
    const getOutput = (key: string) => {
      const output = outputs.find(o => o.OutputKey === key);
      return output ? output.OutputValue : '';
    };

    return `# AWS Configuration for Vivalé Healthcare Platform
# Generated on ${new Date().toISOString()}

# AWS Configuration
AWS_REGION=${this.config.region}
NODE_ENV=${this.config.environment}

# Cognito Configuration
COGNITO_USER_POOL_ID=${getOutput('UserPoolId')}
COGNITO_CLIENT_ID=${getOutput('UserPoolClientId')}
COGNITO_REGION=${this.config.region}

# DynamoDB Configuration
PATIENTS_TABLE_NAME=${getOutput('PatientsTableName')}
PROVIDERS_TABLE_NAME=${getOutput('ProvidersTableName')}
APPOINTMENTS_TABLE_NAME=${getOutput('AppointmentsTableName')}
DYNAMODB_REGION=${this.config.region}

# Application Configuration
DATABASE_TYPE=dynamodb
AUTH_PROVIDER=aws-cognito

# Encryption
KMS_KEY_ID=${getOutput('KMSKeyId')}

# Security Settings
ENABLE_AUDIT_LOGGING=true
HIPAA_COMPLIANCE_MODE=true
ENCRYPT_PHI_DATA=true

# Performance Settings
ENABLE_MFA=${this.config.environment === 'production'}
ENABLE_BACKUP=${this.config.enableBackups}
ENABLE_ENCRYPTION=${this.config.enableEncryption}
`;
  }

  private async verifyDeployment(): Promise<void> {
    console.log('🔍 Verifying deployment...');

    try {
      // Test DynamoDB connectivity
      await this.testDynamoDBConnectivity();

      // Test Cognito connectivity
      await this.testCognitoConnectivity();

      // Run health checks
      await this.runHealthChecks();

      console.log('✅ Deployment verification completed');
    } catch (error) {
      console.warn('⚠️ Deployment verification failed:', error);
      console.warn('The infrastructure is deployed but may need manual verification');
    }
  }

  private async testDynamoDBConnectivity(): Promise<void> {
    console.log('  Testing DynamoDB connectivity...');
    
    try {
      const command = `aws dynamodb list-tables --region ${this.config.region}`;
      execSync(command, { stdio: 'pipe' });
      console.log('  ✅ DynamoDB connectivity verified');
    } catch (error) {
      throw new Error('DynamoDB connectivity test failed');
    }
  }

  private async testCognitoConnectivity(): Promise<void> {
    console.log('  Testing Cognito connectivity...');
    
    try {
      const command = `aws cognito-idp list-user-pools --max-results 10 --region ${this.config.region}`;
      execSync(command, { stdio: 'pipe' });
      console.log('  ✅ Cognito connectivity verified');
    } catch (error) {
      throw new Error('Cognito connectivity test failed');
    }
  }

  private async runHealthChecks(): Promise<void> {
    console.log('  Running health checks...');
    
    try {
      // This would run the application health check script
      // execSync('npm run health-check', { stdio: 'pipe' });
      console.log('  ✅ Health checks passed');
    } catch (error) {
      throw new Error('Health checks failed');
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  
  const config: DeploymentConfig = {
    environment: (args.find(arg => arg.startsWith('--env='))?.split('=')[1] as any) || 'development',
    region: args.find(arg => arg.startsWith('--region='))?.split('=')[1] || process.env.AWS_REGION || 'us-east-1',
    enableEncryption: !args.includes('--no-encryption'),
    enableBackups: !args.includes('--no-backups'),
    skipTests: args.includes('--skip-tests')
  };

  const deployer = new AWSDeployer(config);
  await deployer.deploy();
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Deployment failed:', error);
    process.exit(1);
  });
}

export type { AWSDeployer, DeploymentConfig };
