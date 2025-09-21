/**
 * AWS Service Factory Implementation
 */

import { CloudConfig, CloudServiceFactory } from '../../interfaces';
import { AWSStorageService } from './storage';
import { AWSDatabaseService } from './database';
import { AWSSecretsService } from './secrets';
import { AWSMessagingService } from './messaging';
import { AWSMonitoringService } from './monitoring';
import { AWSComputeService } from './compute';
import { AWSIAMService } from './iam';

export class AWSServiceFactory implements CloudServiceFactory {
  constructor(private config: CloudConfig) {}

  createStorageService() {
    return new AWSStorageService(this.config);
  }

  createDatabaseService() {
    return new AWSDatabaseService(this.config);
  }

  createSecretsService() {
    return new AWSSecretsService(this.config);
  }

  createMessagingService() {
    return new AWSMessagingService(this.config);
  }

  createMonitoringService() {
    return new AWSMonitoringService(this.config);
  }

  createComputeService() {
    return new AWSComputeService(this.config);
  }

  createIAMService() {
    return new AWSIAMService(this.config);
  }
}