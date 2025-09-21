#!/usr/bin/env tsx
/**
 * Multi-Cloud System Test
 * Verifies that the multi-cloud abstraction layer works correctly
 */

import { getCloudFactory } from '../src/lib/cloud/factory';
import { CloudProvider } from '../src/lib/cloud/interfaces';

async function testMultiCloudSystem() {
  console.log('🧪 Testing Multi-Cloud System...\n');

  const providers: CloudProvider[] = ['aws', 'azure', 'gcp', 'oci'];
  
  for (const provider of providers) {
    console.log(`🌩️  Testing ${provider.toUpperCase()} provider...`);
    
    try {
      // Initialize factory with provider
      const factory = getCloudFactory({
        provider,
        region: 'us-east-1',
        [provider]: {
          // Provider-specific config would go here
        }
      });

      // Test storage service
      const storage = factory.createStorageService();
      await storage.uploadFile('test-bucket', 'test-file.txt', 'Hello World');
      
      // Test secrets service
      const secrets = factory.createSecretsService();
      await secrets.createSecret('test-secret', 'secret-value');
      
      // Test monitoring service
      const monitoring = factory.createMonitoringService();
      await monitoring.putMetric('test-metric', 1, 'count');
      await monitoring.log('info', 'Test log message');
      
      console.log(`   ✅ ${provider.toUpperCase()} provider working correctly`);
      
    } catch (error) {
      console.error(`   ❌ ${provider.toUpperCase()} provider failed:`, error);
    }
    
    console.log('');
  }

  // Test provider switching
  console.log('🔄 Testing provider switching...');
  
  try {
    const factory = getCloudFactory({
      provider: 'aws',
      region: 'us-east-1',
    });

    console.log(`   Current provider: ${factory.getCurrentProvider()}`);
    
    // Switch to Azure
    factory.switchProvider('azure');
    console.log(`   Switched to: ${factory.getCurrentProvider()}`);
    
    // Test service after switch
    const storage = factory.createStorageService();
    await storage.uploadFile('azure-container', 'test-file.txt', 'Hello Azure');
    
    console.log('   ✅ Provider switching working correctly');
    
  } catch (error) {
    console.error('   ❌ Provider switching failed:', error);
  }

  console.log('\n🎉 Multi-cloud system test completed!');
}

// Run test if called directly
if (require.main === module) {
  testMultiCloudSystem().catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
}

export { testMultiCloudSystem };