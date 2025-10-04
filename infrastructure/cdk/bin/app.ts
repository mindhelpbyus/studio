#!/usr/bin/env node
/**
 * CDK App Entry Point
 * Multi-cloud infrastructure deployment
 */

import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MultiCloudStack } from '../lib/multi-cloud-stack';

const app = new cdk.App();

// Get configuration from environment or context
const environment = app.node.tryGetContext('environment') || process.env.ENVIRONMENT || 'development';
const providers = app.node.tryGetContext('providers') || process.env.PROVIDERS || 'aws';
const region = app.node.tryGetContext('region') || process.env.AWS_REGION || 'us-east-1';
const appName = app.node.tryGetContext('appName') || process.env.APP_NAME || 'VivaleHealthcare';

// Parse providers
const providerList = providers.split(',').map((p: string) => p.trim());

// Create stack for each provider
providerList.forEach((provider: string) => {
  new MultiCloudStack(app, `VivaleHealthcare-${provider}-${environment}`, {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: region,
    } as cdk.Environment, // Cast to cdk.Environment
    provider: provider as any,
    environment: environment as any,
    appName: appName, // Add appName
    region: region, // Add region
    description: `Vivalé Healthcare ${provider.toUpperCase()} infrastructure for ${environment}`,
    tags: {
      Project: 'VivaleHealthcare',
      Environment: environment,
      Provider: provider,
      ManagedBy: 'CDK',
    },
  });
});

app.synth();
