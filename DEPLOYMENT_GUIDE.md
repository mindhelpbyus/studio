# Vivalé Healthcare - Multi-Cloud Deployment Guide

This guide provides comprehensive instructions for deploying the Vivalé Healthcare platform across multiple cloud providers (AWS, Azure, GCP, OCI).

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Configuration](#configuration)
3. [Local Development](#local-development)
4. [Cloud Provider Setup](#cloud-provider-setup)
5. [Deployment](#deployment)
6. [Monitoring & Observability](#monitoring--observability)
7. [Security](#security)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Tools

- **Node.js** 18+ and npm
- **Docker** and Docker Compose
- **Git** for version control
- **Cloud CLI tools** (install as needed):
  - AWS CLI v2
  - Azure CLI
  - Google Cloud SDK
  - OCI CLI

### Development Dependencies

```bash
npm install -g tsx typescript
npm install -g aws-cdk
```

## Configuration

### Environment Variables

Create environment files for each environment:

```bash
# .env.local (development)
NODE_ENV=development
CLOUD_PROVIDER=aws
DATABASE_TYPE=postgresql
JWT_SECRET=your-jwt-secret-here
ENCRYPTION_KEY=your-encryption-key-here

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/vivale_dev

# AWS (if using AWS)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Azure (if using Azure)
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
AZURE_SUBSCRIPTION_ID=your-subscription-id

# GCP (if using GCP)
GCP_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json

# OCI (if using OCI)
OCI_TENANCY_ID=your-tenancy-id
OCI_USER_ID=your-user-id
OCI_FINGERPRINT=your-fingerprint
OCI_PRIVATE_KEY=path/to/private-key.pem
OCI_REGION=us-ashburn-1
```

### Multi-Cloud Configuration

The system uses a centralized configuration file that adapts to different cloud providers:

```typescript
// Example configuration
const config = {
  app: {
    name: 'vivale-healthcare',
    environment: 'production',
    region: 'us-east-1'
  },
  provider: 'aws', // or 'azure', 'gcp', 'oci'
  database: {
    type: 'postgresql',
    // Provider-specific settings are auto-configured
  },
  monitoring: {
    enabled: true,
    logLevel: 'info'
  }
};
```

## Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Local Database

```bash
# Using Docker
docker-compose up -d postgres

# Or install PostgreSQL locally
# Then create database
createdb vivale_dev
```

### 3. Run Database Migrations

```bash
npm run db:migrate
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:9002`.

### 5. Run Tests

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run e2e

# All tests
npm run validate
```

## Cloud Provider Setup

### AWS Setup

1. **Create AWS Account** and configure IAM user with appropriate permissions
2. **Install AWS CLI** and configure credentials:
   ```bash
   aws configure
   ```
3. **Bootstrap CDK** (first time only):
   ```bash
   npx cdk bootstrap
   ```

### Azure Setup

1. **Create Azure Account** and subscription
2. **Install Azure CLI** and login:
   ```bash
   az login
   ```
3. **Create Service Principal**:
   ```bash
   az ad sp create-for-rbac --name "vivale-healthcare" --role contributor
   ```

### GCP Setup

1. **Create GCP Project** and enable required APIs
2. **Install Google Cloud SDK** and authenticate:
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```
3. **Create Service Account** and download key file

### OCI Setup

1. **Create OCI Account** and compartment
2. **Install OCI CLI** and configure:
   ```bash
   oci setup config
   ```

## Deployment

### Quick Deployment

```bash
# Development environment (AWS only)
npm run deploy:dev

# Staging environment (AWS + Azure)
npm run deploy:staging

# Production environment (AWS + Azure + GCP)
npm run deploy:prod
```

### Custom Deployment

```bash
# Deploy to specific providers
npm run deploy -- --providers aws,azure --environment production

# Dry run (test without deploying)
npm run deploy -- --dry-run --providers gcp

# Parallel deployment
npm run deploy -- --parallel --providers aws,azure,gcp

# With automatic rollback on failure
npm run deploy -- --rollback --environment production
```

### Infrastructure Only

```bash
# Synthesize CloudFormation templates
npm run infra:synth

# Deploy infrastructure
npm run infra:deploy

# Destroy infrastructure
npm run infra:destroy
```

### Manual Deployment Steps

1. **Build Application**:
   ```bash
   npm run build
   ```

2. **Run Security Scan**:
   ```bash
   npm run security:scan
   ```

3. **Deploy Infrastructure**:
   ```bash
   npm run infra:deploy
   ```

4. **Deploy Application**:
   ```bash
   npm run deploy -- --skip-build --environment production
   ```

5. **Verify Deployment**:
   ```bash
   npm run health-check
   ```

## Monitoring & Observability

### Set Up Monitoring

```bash
npm run monitoring:setup
```

### Health Checks

```bash
# Run comprehensive health checks
npm run health-check

# Check specific services
curl https://your-domain.com/api/health
```

### Logs and Metrics

The system automatically collects:
- **Application logs** with structured logging
- **Performance metrics** (response times, error rates)
- **System metrics** (CPU, memory, disk usage)
- **Business metrics** (user activity, feature usage)

### Dashboards

Access monitoring dashboards:
- **AWS**: CloudWatch Dashboard
- **Azure**: Azure Monitor
- **GCP**: Cloud Monitoring
- **OCI**: Monitoring Service

## Security

### Secrets Management

```bash
# Export secrets for Git (encrypted)
npm run secrets:export

# Import secrets from encrypted file
npm run secrets:import

# Rotate secrets
npm run secrets:rotate
```

### Security Scanning

```bash
# Scan codebase
npm run security:scan

# Scan deployed application
npm run security:scan-deployed
```

### Best Practices

1. **Never commit secrets** to Git
2. **Use environment-specific configurations**
3. **Enable MFA** for all cloud accounts
4. **Regularly rotate secrets** and access keys
5. **Monitor security events** and set up alerts
6. **Keep dependencies updated**

## CI/CD Pipeline

The GitHub Actions workflow automatically:

1. **Runs security scans** on every push
2. **Executes comprehensive tests**
3. **Builds and packages** the application
4. **Deploys to development** on develop branch
5. **Deploys to staging** on main branch
6. **Requires approval** for production deployment

### Manual Triggers

You can manually trigger deployments with custom parameters:

1. Go to **Actions** tab in GitHub
2. Select **Multi-Cloud Deployment Pipeline**
3. Click **Run workflow**
4. Choose environment and providers

## Troubleshooting

### Common Issues

#### Deployment Failures

```bash
# Check deployment logs
npm run deploy -- --providers aws --dry-run

# Verify credentials
aws sts get-caller-identity
az account show
gcloud auth list
```

#### Database Connection Issues

```bash
# Test database connectivity
npm run db:test-connection

# Check database status
npm run health-check
```

#### Authentication Problems

```bash
# Verify JWT configuration
npm run auth:test

# Check secrets
npm run secrets:list
```

### Debug Mode

Enable debug logging:

```bash
export DEBUG=vivale:*
npm run dev
```

### Support Channels

- **Documentation**: Check this guide and inline code comments
- **Issues**: Create GitHub issues for bugs
- **Security**: Email security@vivale.com for security issues

## Performance Optimization

### Database Optimization

- Use connection pooling
- Implement read replicas for scaling
- Add appropriate indexes
- Monitor query performance

### Caching Strategy

- Redis for session storage
- CDN for static assets
- Application-level caching for API responses

### Monitoring Performance

```bash
# Run performance tests
npm run test:performance

# Monitor in production
npm run monitoring:performance
```

## Scaling

### Horizontal Scaling

The application supports:
- **Auto-scaling groups** in AWS
- **Virtual Machine Scale Sets** in Azure
- **Managed Instance Groups** in GCP
- **Instance Pools** in OCI

### Database Scaling

- **Read replicas** for read-heavy workloads
- **Sharding** for write-heavy workloads
- **Connection pooling** for efficient resource usage

### CDN and Caching

- CloudFront (AWS)
- Azure CDN
- Cloud CDN (GCP)
- Content Delivery Network (OCI)

## Backup and Recovery

### Automated Backups

- **Database backups** with point-in-time recovery
- **File storage backups** with versioning
- **Configuration backups** in version control

### Disaster Recovery

- **Multi-region deployment** for high availability
- **Cross-cloud replication** for ultimate resilience
- **Automated failover** procedures

## Cost Optimization

### Monitoring Costs

- Set up billing alerts
- Use cost management tools
- Regular cost reviews

### Optimization Strategies

- **Right-sizing** compute resources
- **Reserved instances** for predictable workloads
- **Spot instances** for development/testing
- **Storage lifecycle policies**

## Compliance

### Healthcare Compliance

- **HIPAA compliance** configurations
- **Data encryption** at rest and in transit
- **Audit logging** for all access
- **Access controls** and role-based permissions

### Data Protection

- **GDPR compliance** for EU users
- **Data residency** requirements
- **Privacy controls** and user consent management

---

For additional help, refer to the inline documentation in the codebase or contact the development team.