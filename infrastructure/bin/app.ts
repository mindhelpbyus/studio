#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NetworkStack } from '../lib/stacks/network-stack';
import { DatabaseStack } from '../lib/stacks/database-stack';
import { StorageStack } from '../lib/stacks/storage-stack';
import { AuthStack } from '../lib/stacks/auth-stack';
import { ApiStack } from '../lib/stacks/api-stack';
import { LambdaStack } from '../lib/stacks/lambda-stack';
import { MessagingStack } from '../lib/stacks/messaging-stack';
import { MonitoringStack } from '../lib/stacks/monitoring-stack';
import { SecurityStack } from '../lib/stacks/security-stack';
import { getConfig } from '../lib/config';

const app = new cdk.App();

// Get environment from context
const environment = app.node.tryGetContext('environment') || 'dev';
const config = getConfig(environment);

// Common stack props
const stackProps: cdk.StackProps = {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || config.aws.region,
  },
  tags: {
    Project: 'Vivale-Healthcare-CRM',
    Environment: environment,
    Owner: 'Healthcare-Team',
    CostCenter: 'Healthcare-IT',
  },
};

// Create stacks in dependency order
const networkStack = new NetworkStack(app, `VivaleNetwork-${environment}`, {
  ...stackProps,
  config,
});

const securityStack = new SecurityStack(app, `VivaleSecurity-${environment}`, {
  ...stackProps,
  config,
  vpc: networkStack.vpc,
});

const databaseStack = new DatabaseStack(app, `VivaleDatabase-${environment}`, {
  ...stackProps,
  config,
  vpc: networkStack.vpc,
});

const storageStack = new StorageStack(app, `VivaleStorage-${environment}`, {
  ...stackProps,
  config,
});

const authStack = new AuthStack(app, `VivaleAuth-${environment}`, {
  ...stackProps,
  config,
});

const lambdaStack = new LambdaStack(app, `VivaleLambda-${environment}`, {
  ...stackProps,
  config,
  vpc: networkStack.vpc,
  table: databaseStack.table,
  documentsBucket: storageStack.documentsBucket,
  userPool: authStack.userPool,
});

const messagingStack = new MessagingStack(app, `VivaleMessaging-${environment}`, {
  ...stackProps,
  config,
});

const apiStack = new ApiStack(app, `VivaleApi-${environment}`, {
  ...stackProps,
  config,
  userPool: authStack.userPool,
  userPoolClient: authStack.userPoolClient,
  lambdaFunctions: lambdaStack.functions,
  webAcl: securityStack.webAcl,
});

const monitoringStack = new MonitoringStack(app, `VivaleMonitoring-${environment}`, {
  ...stackProps,
  config,
  api: apiStack.api,
  lambdaFunctions: lambdaStack.functions,
  table: databaseStack.table,
});

// Add stack dependencies
databaseStack.addDependency(networkStack);
storageStack.addDependency(networkStack);
lambdaStack.addDependency(databaseStack);
lambdaStack.addDependency(storageStack);
lambdaStack.addDependency(authStack);
apiStack.addDependency(lambdaStack);
apiStack.addDependency(securityStack);
monitoringStack.addDependency(apiStack);