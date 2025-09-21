#!/usr/bin/env tsx
/**
 * Health Check Script
 * Performs comprehensive health checks across all services
 */

import { observability } from '../src/lib/monitoring/observability';
import { DatabaseManager } from '../src/lib/database/database-factory';
import { SecretsManager } from '../src/lib/security/secrets-manager';

interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  details?: any;
  error?: string;
}

class HealthChecker {
  private results: HealthCheckResult[] = [];

  async runAllChecks(): Promise<void> {
    console.log('🏥 Running comprehensive health checks...\n');

    const checks = [
      this.checkDatabase(),
      this.checkSecrets(),
      this.checkObservability(),
      this.checkExternalServices(),
      this.checkSystemResources(),
    ];

    await Promise.all(checks);

    this.printResults();
    this.exitWithStatus();
  }

  private async checkDatabase(): Promise<void> {
    const startTime = Date.now();
    
    try {
      const db = DatabaseManager.getInstance();
      const isHealthy = await db.healthCheck();
      
      this.results.push({
        service: 'Database',
        status: isHealthy ? 'healthy' : 'unhealthy',
        responseTime: Date.now() - startTime,
        details: { connected: isHealthy },
      });
    } catch (error) {
      this.results.push({
        service: 'Database',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private async checkSecrets(): Promise<void> {
    const startTime = Date.now();
    
    try {
      const secrets = SecretsManager.getInstance();
      const isHealthy = await secrets.healthCheck();
      
      this.results.push({
        service: 'Secrets Manager',
        status: isHealthy ? 'healthy' : 'unhealthy',
        responseTime: Date.now() - startTime,
        details: { accessible: isHealthy },
      });
    } catch (error) {
      this.results.push({
        service: 'Secrets Manager',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private async checkObservability(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Test observability system
      await observability.recordMetric('health_check_test', 1);
      await observability.log('info', 'Health check test log');
      
      this.results.push({
        service: 'Observability',
        status: 'healthy',
        responseTime: Date.now() - startTime,
        details: { metrics: true, logging: true },
      });
    } catch (error) {
      this.results.push({
        service: 'Observability',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private async checkExternalServices(): Promise<void> {
    const services = [
      { name: 'Google AI', url: 'https://generativelanguage.googleapis.com' },
      // Add other external services as needed
    ];

    for (const service of services) {
      const startTime = Date.now();
      
      try {
        // Simple connectivity check
        const response = await fetch(service.url, { 
          method: 'HEAD',
          signal: AbortSignal.timeout(5000),
        });
        
        this.results.push({
          service: service.name,
          status: response.ok ? 'healthy' : 'degraded',
          responseTime: Date.now() - startTime,
          details: { 
            statusCode: response.status,
            url: service.url,
          },
        });
      } catch (error) {
        this.results.push({
          service: service.name,
          status: 'unhealthy',
          responseTime: Date.now() - startTime,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  private async checkSystemResources(): Promise<void> {
    const startTime = Date.now();
    
    try {
      const memoryUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      
      // Check memory usage (warn if over 80% of heap limit)
      const heapUsedPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
      const memoryStatus = heapUsedPercent > 80 ? 'degraded' : 'healthy';
      
      this.results.push({
        service: 'System Resources',
        status: memoryStatus,
        responseTime: Date.now() - startTime,
        details: {
          memory: {
            heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
            heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
            heapUsedPercent: Math.round(heapUsedPercent) + '%',
          },
          cpu: {
            user: cpuUsage.user,
            system: cpuUsage.system,
          },
        },
      });
    } catch (error) {
      this.results.push({
        service: 'System Resources',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private printResults(): void {
    console.log('📊 Health Check Results');
    console.log('='.repeat(50));
    
    let healthyCount = 0;
    let degradedCount = 0;
    let unhealthyCount = 0;
    
    for (const result of this.results) {
      const statusIcon = this.getStatusIcon(result.status);
      const responseTime = result.responseTime.toString().padStart(4) + 'ms';
      
      console.log(`${statusIcon} ${result.service.padEnd(20)} ${responseTime}`);
      
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      
      if (result.details && Object.keys(result.details).length > 0) {
        console.log(`   Details: ${JSON.stringify(result.details)}`);
      }
      
      switch (result.status) {
        case 'healthy':
          healthyCount++;
          break;
        case 'degraded':
          degradedCount++;
          break;
        case 'unhealthy':
          unhealthyCount++;
          break;
      }
      
      console.log('');
    }
    
    console.log('Summary:');
    console.log(`✅ Healthy: ${healthyCount}`);
    console.log(`⚠️  Degraded: ${degradedCount}`);
    console.log(`❌ Unhealthy: ${unhealthyCount}`);
    console.log('');
  }

  private getStatusIcon(status: string): string {
    switch (status) {
      case 'healthy':
        return '✅';
      case 'degraded':
        return '⚠️ ';
      case 'unhealthy':
        return '❌';
      default:
        return '❓';
    }
  }

  private exitWithStatus(): void {
    const hasUnhealthy = this.results.some(r => r.status === 'unhealthy');
    const hasDegraded = this.results.some(r => r.status === 'degraded');
    
    if (hasUnhealthy) {
      console.log('🚨 Health check failed - unhealthy services detected');
      process.exit(1);
    } else if (hasDegraded) {
      console.log('⚠️  Health check passed with warnings - degraded services detected');
      process.exit(0);
    } else {
      console.log('✅ All health checks passed');
      process.exit(0);
    }
  }
}

// Run health checks if called directly
if (require.main === module) {
  const checker = new HealthChecker();
  checker.runAllChecks().catch(error => {
    console.error('Health check failed:', error);
    process.exit(1);
  });
}

export { HealthChecker };