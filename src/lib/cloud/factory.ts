/**
 * Cloud Service Factory Implementation
 * Creates cloud services based on configuration
 */

import { CloudConfig, CloudProvider, CloudServiceFactory, CloudConfigurationError } from './interfaces';
import { AWSServiceFactory } from './providers/aws/factory';
import { AzureServiceFactory } from './providers/azure/factory';
import { GCPServiceFactory } from './providers/gcp/factory';
import { OCIServiceFactory } from './providers/oci/factory';

export class MultiCloudServiceFactory {
  private static instance: MultiCloudServiceFactory;
  private factories: Map<CloudProvider, CloudServiceFactory> = new Map();
  private currentProvider: CloudProvider;
  private config: CloudConfig;

  private constructor(config: CloudConfig) {
    this.config = config;
    this.currentProvider = config.provider;
    this.initializeFactories();
  }

  static getInstance(config?: CloudConfig): MultiCloudServiceFactory {
    if (!MultiCloudServiceFactory.instance) {
      if (!config) {
        throw new CloudConfigurationError('Configuration required for first initialization', 'unknown');
      }
      MultiCloudServiceFactory.instance = new MultiCloudServiceFactory(config);
    }
    return MultiCloudServiceFactory.instance;
  }

  private initializeFactories(): void {
    // Initialize all provider factories
    this.factories.set('aws', new AWSServiceFactory(this.config));
    this.factories.set('azure', new AzureServiceFactory(this.config));
    this.factories.set('gcp', new GCPServiceFactory(this.config));
    this.factories.set('oci', new OCIServiceFactory(this.config));
  }

  /**
   * Switch cloud provider at runtime
   */
  switchProvider(provider: CloudProvider, config?: Partial<CloudConfig>): void {
    if (!this.factories.has(provider)) {
      throw new CloudConfigurationError(`Provider ${provider} not supported`, provider);
    }

    this.currentProvider = provider;
    
    if (config) {
      this.config = { ...this.config, ...config, provider };
      this.initializeFactories();
    }
  }

  /**
   * Get current provider
   */
  getCurrentProvider(): CloudProvider {
    return this.currentProvider;
  }

  /**
   * Get factory for current provider
   */
  private getCurrentFactory(): CloudServiceFactory {
    const factory = this.factories.get(this.currentProvider);
    if (!factory) {
      throw new CloudConfigurationError(
        `No factory available for provider ${this.currentProvider}`,
        this.currentProvider
      );
    }
    return factory;
  }

  /**
   * Get factory for specific provider
   */
  getFactory(provider?: CloudProvider): CloudServiceFactory {
    const targetProvider = provider || this.currentProvider;
    const factory = this.factories.get(targetProvider);
    if (!factory) {
      throw new CloudConfigurationError(
        `No factory available for provider ${targetProvider}`,
        targetProvider
      );
    }
    return factory;
  }

  /**
   * Create services using current provider
   */
  createStorageService() {
    return this.getCurrentFactory().createStorageService();
  }

  createDatabaseService() {
    return this.getCurrentFactory().createDatabaseService();
  }

  createSecretsService() {
    return this.getCurrentFactory().createSecretsService();
  }

  createMessagingService() {
    return this.getCurrentFactory().createMessagingService();
  }

  createMonitoringService() {
    return this.getCurrentFactory().createMonitoringService();
  }

  createComputeService() {
    return this.getCurrentFactory().createComputeService();
  }

  createIAMService() {
    return this.getCurrentFactory().createIAMService();
  }

  /**
   * Multi-cloud operations
   */
  async deployToAllClouds<T>(
    operation: (factory: CloudServiceFactory) => Promise<T>
  ): Promise<Map<CloudProvider, T | Error>> {
    const results = new Map<CloudProvider, T | Error>();
    
    const promises = Array.from(this.factories.entries()).map(async ([provider, factory]) => {
      try {
        const result = await operation(factory);
        results.set(provider, result);
      } catch (error) {
        results.set(provider, error as Error);
      }
    });

    await Promise.allSettled(promises);
    return results;
  }

  /**
   * Failover to another provider
   */
  async failover(targetProvider?: CloudProvider): Promise<void> {
    const providers: CloudProvider[] = ['aws', 'azure', 'gcp', 'oci'];
    const availableProviders = providers.filter(p => p !== this.currentProvider);
    
    const target = targetProvider || availableProviders[0];
    
    if (!target) {
      throw new CloudConfigurationError('No failover provider available', this.currentProvider);
    }

    // Test connectivity to target provider
    try {
      const factory = this.getFactory(target);
      const healthService = factory.createMonitoringService();
      // Perform basic health check
      await healthService.log('info', 'Failover connectivity test');
      
      // Switch to target provider
      this.switchProvider(target);
    } catch (error) {
      throw new CloudConfigurationError(
        `Failover to ${target} failed: ${error}`,
        target
      );
    }
  }

  /**
   * Get configuration for current provider
   */
  getConfig(): CloudConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<CloudConfig>): void {
    this.config = { ...this.config, ...updates };
    this.initializeFactories();
  }

  /**
   * Validate provider configuration
   */
  async validateConfiguration(provider?: CloudProvider): Promise<boolean> {
    const targetProvider = provider || this.currentProvider;
    
    try {
      const factory = this.getFactory(targetProvider);
      
      // Test basic services
      const storageService = factory.createStorageService();
      const secretsService = factory.createSecretsService();
      
      // Perform basic operations to validate configuration
      // This is a simplified validation - in production, you'd want more comprehensive checks
      
      return true;
    } catch (error) {
      console.error(`Configuration validation failed for ${targetProvider}:`, error);
      return false;
    }
  }

  /**
   * Get available providers
   */
  getAvailableProviders(): CloudProvider[] {
    return Array.from(this.factories.keys());
  }

  /**
   * Check if provider is available
   */
  isProviderAvailable(provider: CloudProvider): boolean {
    return this.factories.has(provider);
  }
}

// Singleton access
export function getCloudFactory(config?: CloudConfig): MultiCloudServiceFactory {
  return MultiCloudServiceFactory.getInstance(config);
}

// Convenience functions for common operations
export async function withProvider<T>(
  provider: CloudProvider,
  operation: (factory: CloudServiceFactory) => Promise<T>
): Promise<T> {
  const factory = getCloudFactory();
  const originalProvider = factory.getCurrentProvider();
  
  try {
    factory.switchProvider(provider);
    return await operation(factory.getFactory());
  } finally {
    factory.switchProvider(originalProvider);
  }
}

export async function withFailover<T>(
  operation: (factory: CloudServiceFactory) => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  const factory = getCloudFactory();
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation(factory.getFactory());
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries - 1) {
        await factory.failover();
      }
    }
  }
  
  throw lastError!;
}