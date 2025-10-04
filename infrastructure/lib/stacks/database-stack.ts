import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../config';

export interface DatabaseStackProps extends cdk.StackProps {
  config: EnvironmentConfig;
  vpc: ec2.Vpc;
}

export class DatabaseStack extends cdk.Stack {
  public readonly table: dynamodb.Table;
  public readonly kmsKey: kms.Key;

  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id, props);

    const { config } = props;

    // Create KMS key for DynamoDB encryption
    this.kmsKey = new kms.Key(this, 'DynamoDBKey', {
      description: `KMS key for DynamoDB encryption - ${config.environment}`,
      enableKeyRotation: config.security.kmsKeyRotation,
      removalPolicy: config.environment === 'prod' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
    });

    // Add key alias
    new kms.Alias(this, 'DynamoDBKeyAlias', {
      aliasName: `alias/vivale-dynamodb-${config.environment}`,
      targetKey: this.kmsKey,
    });

    // Create the main DynamoDB table with single-table design
    this.table = new dynamodb.Table(this, 'HealthcareCRMTable', {
      tableName: config.database.tableName,
      
      // Primary key structure for single-table design
      partitionKey: {
        name: 'PK',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'SK',
        type: dynamodb.AttributeType.STRING,
      },

      // Billing configuration
      billingMode: config.database.billingMode === 'PAY_PER_REQUEST' 
        ? dynamodb.BillingMode.PAY_PER_REQUEST 
        : dynamodb.BillingMode.PROVISIONED,

      // Backup and recovery
      pointInTimeRecovery: config.database.pointInTimeRecovery,
      
      // Encryption
      encryption: config.database.encryption 
        ? dynamodb.TableEncryption.CUSTOMER_MANAGED
        : dynamodb.TableEncryption.AWS_MANAGED,
      encryptionKey: config.database.encryption ? this.kmsKey : undefined,

      // DynamoDB Streams for change data capture
      stream: config.database.streamEnabled 
        ? dynamodb.StreamViewType.NEW_AND_OLD_IMAGES 
        : undefined,

      // Deletion protection
      removalPolicy: config.environment === 'prod' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,

      // Tags
      tags: {
        Name: `vivale-healthcare-crm-${config.environment}`,
        Environment: config.environment,
        Service: 'DynamoDB',
        Purpose: 'Healthcare CRM Data Storage',
      },
    });

    // Create Global Secondary Index 1 (GSI1) - For reverse lookups
    this.table.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: {
        name: 'GSI1PK',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'GSI1SK',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Create Global Secondary Index 2 (GSI2) - For time-series queries
    this.table.addGlobalSecondaryIndex({
      indexName: 'GSI2',
      partitionKey: {
        name: 'GSI2PK',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'GSI2SK',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Create Global Secondary Index 3 (GSI3) - For status and type filtering
    this.table.addGlobalSecondaryIndex({
      indexName: 'GSI3',
      partitionKey: {
        name: 'GSI3PK',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'GSI3SK',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Create CloudWatch Log Group for DynamoDB operations
    const logGroup = new logs.LogGroup(this, 'DynamoDBLogGroup', {
      logGroupName: `/aws/dynamodb/${config.database.tableName}`,
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Output important values
    new cdk.CfnOutput(this, 'TableName', {
      value: this.table.tableName,
      description: 'DynamoDB table name',
      exportName: `${this.stackName}-TableName`,
    });

    new cdk.CfnOutput(this, 'TableArn', {
      value: this.table.tableArn,
      description: 'DynamoDB table ARN',
      exportName: `${this.stackName}-TableArn`,
    });

    new cdk.CfnOutput(this, 'TableStreamArn', {
      value: this.table.tableStreamArn || 'No stream enabled',
      description: 'DynamoDB table stream ARN',
      exportName: `${this.stackName}-TableStreamArn`,
    });

    new cdk.CfnOutput(this, 'KMSKeyId', {
      value: this.kmsKey.keyId,
      description: 'KMS key ID for DynamoDB encryption',
      exportName: `${this.stackName}-KMSKeyId`,
    });

    new cdk.CfnOutput(this, 'KMSKeyArn', {
      value: this.kmsKey.keyArn,
      description: 'KMS key ARN for DynamoDB encryption',
      exportName: `${this.stackName}-KMSKeyArn`,
    });
  }
}