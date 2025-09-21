/**
 * @fileoverview AWS Healthcare Infrastructure Stack
 * @description CDK stack for HIPAA-compliant healthcare infrastructure
 * @compliance HIPAA, SOC 2, ISO 27001
 */

import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export interface AWSHealthcareStackProps extends cdk.StackProps {
  environment: 'development' | 'staging' | 'production';
  enableEncryption?: boolean;
  enableBackups?: boolean;
}

export class AWSHealthcareStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly patientsTable: dynamodb.Table;
  public readonly providersTable: dynamodb.Table;
  public readonly appointmentsTable: dynamodb.Table;
  public readonly kmsKey: kms.Key;

  constructor(scope: Construct, id: string, props: AWSHealthcareStackProps) {
    super(scope, id, props);

    // Create KMS key for encryption
    this.createKMSKey();
    
    // Create DynamoDB tables
    this.createDynamoDBTables(props);
    
    // Create Cognito User Pool
    this.createCognitoUserPool(props);
    
    // Create IAM roles
    this.createIAMRoles();
    
    // Create secrets
    this.createSecrets();
    
    // Output important values
    this.createOutputs();
  }

  private createKMSKey(): void {
    this.kmsKey = new kms.Key(this, 'VivaleEncryptionKey', {
      description: 'Vivalé Healthcare Platform encryption key',
      enableKeyRotation: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN
    });

    this.kmsKey.addAlias('alias/vivale-healthcare');
  }

  private createDynamoDBTables(props: AWSHealthcareStackProps): void {
    const tableProps = {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: props.enableEncryption !== false ? 
        dynamodb.TableEncryption.CUSTOMER_MANAGED : 
        dynamodb.TableEncryption.AWS_MANAGED,
      encryptionKey: props.enableEncryption !== false ? this.kmsKey : undefined,
      pointInTimeRecovery: props.enableBackups !== false,
      removalPolicy: props.environment === 'production' ? 
        cdk.RemovalPolicy.RETAIN : 
        cdk.RemovalPolicy.DESTROY,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES
    };

    // Patients Table
    this.patientsTable = new dynamodb.Table(this, 'PatientsTable', {
      ...tableProps,
      tableName: `vivale-patients-${props.environment}`,
      partitionKey: { name: 'patientId', type: dynamodb.AttributeType.STRING }
    });

    // Add GSI for email lookup
    this.patientsTable.addGlobalSecondaryIndex({
      indexName: 'EmailIndex',
      partitionKey: { name: 'email', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL
    });

    // Providers Table  
    this.providersTable = new dynamodb.Table(this, 'ProvidersTable', {
      ...tableProps,
      tableName: `vivale-providers-${props.environment}`,
      partitionKey: { name: 'providerId', type: dynamodb.AttributeType.STRING }
    });

    // Appointments Table
    this.appointmentsTable = new dynamodb.Table(this, 'AppointmentsTable', {
      ...tableProps,
      tableName: `vivale-appointments-${props.environment}`,
      partitionKey: { name: 'appointmentId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'scheduledDateTime', type: dynamodb.AttributeType.STRING }
    });

    // Add GSIs for appointments
    this.appointmentsTable.addGlobalSecondaryIndex({
      indexName: 'PatientAppointmentsIndex',
      partitionKey: { name: 'patientId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'scheduledDateTime', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL
    });
  }
} 
 private createCognitoUserPool(props: AWSHealthcareStackProps): void {
    this.userPool = new cognito.UserPool(this, 'VivaleUserPool', {
      userPoolName: `vivale-healthcare-${props.environment}`,
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true
      },
      mfa: cognito.Mfa.OPTIONAL,
      mfaSecondFactor: {
        sms: true,
        otp: true
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: props.environment === 'production' ? 
        cdk.RemovalPolicy.RETAIN : 
        cdk.RemovalPolicy.DESTROY,
      customAttributes: {
        role: new cognito.StringAttribute({ minLen: 1, maxLen: 50, mutable: true }),
        patientId: new cognito.StringAttribute({ minLen: 1, maxLen: 100, mutable: true }),
        providerId: new cognito.StringAttribute({ minLen: 1, maxLen: 100, mutable: true })
      },
      lambdaTriggers: {
        // Add custom triggers for HIPAA compliance logging
      }
    });

    this.userPoolClient = new cognito.UserPoolClient(this, 'VivaleUserPoolClient', {
      userPool: this.userPool,
      userPoolClientName: `vivale-web-client-${props.environment}`,
      generateSecret: true,
      authFlows: {
        userPassword: true,
        userSrp: true,
        custom: true,
        adminUserPassword: true
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
          implicitCodeGrant: false // Disabled for security
        },
        scopes: [
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.PROFILE
        ]
      },
      preventUserExistenceErrors: true,
      refreshTokenValidity: cdk.Duration.days(30),
      accessTokenValidity: cdk.Duration.hours(1),
      idTokenValidity: cdk.Duration.hours(1)
    });

    // Create user groups
    new cognito.CfnUserPoolGroup(this, 'AdminGroup', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'admin',
      description: 'System administrators'
    });

    new cognito.CfnUserPoolGroup(this, 'ProviderGroup', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'provider',
      description: 'Healthcare providers'
    });

    new cognito.CfnUserPoolGroup(this, 'PatientGroup', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'patient',
      description: 'Patients'
    });
  }

  private createIAMRoles(): void {
    // Application execution role
    const appRole = new iam.Role(this, 'VivaleAppRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
      ]
    });

    // DynamoDB permissions
    this.patientsTable.grantReadWriteData(appRole);
    this.providersTable.grantReadWriteData(appRole);
    this.appointmentsTable.grantReadWriteData(appRole);

    // Cognito permissions
    appRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'cognito-idp:AdminGetUser',
        'cognito-idp:AdminCreateUser',
        'cognito-idp:AdminUpdateUserAttributes',
        'cognito-idp:AdminDeleteUser',
        'cognito-idp:ListUsers',
        'cognito-idp:AdminAddUserToGroup',
        'cognito-idp:AdminRemoveUserFromGroup'
      ],
      resources: [this.userPool.userPoolArn]
    }));

    // KMS permissions
    this.kmsKey.grantEncryptDecrypt(appRole);
  }

  private createSecrets(): void {
    // JWT Secret
    new secretsmanager.Secret(this, 'JWTSecret', {
      secretName: `vivale/jwt-secret-${this.stackName}`,
      description: 'JWT signing secret for Vivalé Healthcare',
      encryptionKey: this.kmsKey,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ service: 'vivale' }),
        generateStringKey: 'secret',
        passwordLength: 64,
        excludeCharacters: '"@/\\'
      }
    });

    // Database encryption key
    new secretsmanager.Secret(this, 'DatabaseEncryptionKey', {
      secretName: `vivale/database-encryption-key-${this.stackName}`,
      description: 'Database encryption key for PHI data',
      encryptionKey: this.kmsKey,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ keyType: 'AES256' }),
        generateStringKey: 'key',
        passwordLength: 32,
        excludeCharacters: '"@/\\'
      }
    });
  }

  private createOutputs(): void {
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId,
      description: 'Cognito User Pool ID'
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: this.userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID'
    });

    new cdk.CfnOutput(this, 'PatientsTableName', {
      value: this.patientsTable.tableName,
      description: 'DynamoDB Patients Table Name'
    });

    new cdk.CfnOutput(this, 'ProvidersTableName', {
      value: this.providersTable.tableName,
      description: 'DynamoDB Providers Table Name'
    });

    new cdk.CfnOutput(this, 'AppointmentsTableName', {
      value: this.appointmentsTable.tableName,
      description: 'DynamoDB Appointments Table Name'
    });

    new cdk.CfnOutput(this, 'KMSKeyId', {
      value: this.kmsKey.keyId,
      description: 'KMS Key ID for encryption'
    });
  }
}