/**
 * AWS Service Factory Implementation
 */

import { CloudConfig, CloudServiceFactory } from '../../interfaces';
import { AWSComputeService } from './compute';
import { AWSDatabaseService } from './database';
import { AWSIAMService } from './iam';
import { AWSMessagingService } from './messaging';
import { AWSMonitoringService } from './monitoring';
import { AWSSecretsService } from './secrets';
import { AWSStorageService } from './storage';

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