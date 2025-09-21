/**
 * @fileoverview Encryption Service
 * @description HIPAA-compliant encryption for PHI/PII data
 * @compliance HIPAA, GDPR, NIST, FIPS 140-2
 */

import { Injectable } from '../decorators/injectable.decorator';
import { randomBytes, createCipher, createDecipher, pbkdf2Sync, createHash } from 'crypto';

export interface EncryptionResult {
  readonly encryptedData: string;
  readonly iv: string;
  readonly salt: string;
  readonly algorithm: string;
  readonly keyDerivation: string;
}

export interface DecryptionOptions {
  readonly encryptedData: string;
  readonly iv: string;
  readonly salt: string;
  readonly algorithm: string;
  readonly keyDerivation: string;
}

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyDerivation = 'pbkdf2';
  private readonly iterations = 100000; // NIST recommended minimum
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 16; // 128 bits
  private readonly saltLength = 32; // 256 bits
  private readonly tagLength = 16; // 128 bits

  /**
   * Encrypts sensitive data using AES-256-GCM with PBKDF2 key derivation
   * @param data - Data to encrypt
   * @param masterKey - Master encryption key
   * @returns Encryption result with all necessary components
   */
  async encryptSensitiveData(data: string, masterKey: string): Promise<EncryptionResult> {
    try {
      // Generate random salt and IV
      const salt = randomBytes(this.saltLength);
      const iv = randomBytes(this.ivLength);
      
      // Derive encryption key using PBKDF2
      const key = pbkdf2Sync(masterKey, salt, this.iterations, this.keyLength, 'sha256');
      
      // Create cipher
      const cipher = createCipher(this.algorithm, key);
      cipher.setAAD(Buffer.from('healthcare-platform-aad')); // Additional authenticated data
      
      // Encrypt data
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Get authentication tag
      const tag = cipher.getAuthTag();
      
      return {
        encryptedData: encrypted + ':' + tag.toString('hex'),
        iv: iv.toString('hex'),
        salt: salt.toString('hex'),
        algorithm: this.algorithm,
        keyDerivation: this.keyDerivation
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypts sensitive data
   * @param options - Decryption options
   * @param masterKey - Master encryption key
   * @returns Decrypted data
   */
  async decryptSensitiveData(options: DecryptionOptions, masterKey: string): Promise<string> {
    try {
      // Parse encrypted data and tag
      const [encryptedData, tagHex] = options.encryptedData.split(':');
      const tag = Buffer.from(tagHex, 'hex');
      
      // Convert hex strings back to buffers
      const salt = Buffer.from(options.salt, 'hex');
      const iv = Buffer.from(options.iv, 'hex');
      
      // Derive decryption key
      const key = pbkdf2Sync(masterKey, salt, this.iterations, this.keyLength, 'sha256');
      
      // Create decipher
      const decipher = createDecipher(options.algorithm, key);
      decipher.setAAD(Buffer.from('healthcare-platform-aad'));
      decipher.setAuthTag(tag);
      
      // Decrypt data
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Generates a cryptographically secure random ID
   * @param length - Length of the ID (default: 32)
   * @returns Secure random ID
   */
  generateSecureId(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }

  /**
   * Hashes data using SHA-256
   * @param data - Data to hash
   * @param salt - Optional salt
   * @returns Hash result
   */
  hashData(data: string, salt?: string): string {
    const hash = createHash('sha256');
    hash.update(data);
    if (salt) {
      hash.update(salt);
    }
    return hash.digest('hex');
  }

  /**
   * Generates a secure salt
   * @param length - Salt length (default: 32)
   * @returns Random salt
   */
  generateSalt(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }

  /**
   * Encrypts PHI data with additional compliance metadata
   * @param phi - Personal Health Information
   * @param masterKey - Master encryption key
   * @param context - Encryption context for audit
   * @returns Encrypted PHI with metadata
   */
  async encryptPHI(
    phi: Record<string, any>, 
    masterKey: string,
    context: {
      userId: string;
      purpose: string;
      dataClassification: 'PHI' | 'PII' | 'SENSITIVE' | 'PUBLIC';
    }
  ): Promise<{
    encryptedData: EncryptionResult;
    metadata: {
      encryptedAt: Date;
      encryptedBy: string;
      purpose: string;
      dataClassification: string;
      retentionPeriod?: number;
    };
  }> {
    const serializedPHI = JSON.stringify(phi);
    const encryptedData = await this.encryptSensitiveData(serializedPHI, masterKey);
    
    return {
      encryptedData,
      metadata: {
        encryptedAt: new Date(),
        encryptedBy: context.userId,
        purpose: context.purpose,
        dataClassification: context.dataClassification,
        retentionPeriod: this.getRetentionPeriod(context.dataClassification)
      }
    };
  }

  /**
   * Decrypts PHI data with audit logging
   * @param encryptedPHI - Encrypted PHI data
   * @param masterKey - Master encryption key
   * @param context - Decryption context for audit
   * @returns Decrypted PHI data
   */
  async decryptPHI(
    encryptedPHI: {
      encryptedData: EncryptionResult;
      metadata: any;
    },
    masterKey: string,
    context: {
      userId: string;
      purpose: string;
      sessionId: string;
    }
  ): Promise<Record<string, any>> {
    // Audit the decryption attempt
    console.log('PHI Decryption Attempt:', {
      userId: context.userId,
      purpose: context.purpose,
      sessionId: context.sessionId,
      timestamp: new Date()
    });
    
    const decryptedData = await this.decryptSensitiveData(
      encryptedPHI.encryptedData, 
      masterKey
    );
    
    return JSON.parse(decryptedData);
  }

  /**
   * Validates encryption strength meets compliance requirements
   * @param algorithm - Encryption algorithm
   * @param keyLength - Key length in bits
   * @returns Validation result
   */
  validateEncryptionStrength(algorithm: string, keyLength: number): {
    isCompliant: boolean;
    standards: string[];
    recommendations?: string[];
  } {
    const compliantAlgorithms = ['aes-256-gcm', 'aes-256-cbc', 'chacha20-poly1305'];
    const minKeyLength = 256;
    
    const isCompliant = compliantAlgorithms.includes(algorithm) && keyLength >= minKeyLength;
    
    return {
      isCompliant,
      standards: isCompliant ? ['HIPAA', 'NIST', 'FIPS 140-2'] : [],
      recommendations: isCompliant ? undefined : [
        'Use AES-256-GCM for authenticated encryption',
        'Ensure key length is at least 256 bits',
        'Implement proper key management'
      ]
    };
  }

  private getRetentionPeriod(dataClassification: string): number {
    // Return retention period in years based on data classification
    switch (dataClassification) {
      case 'PHI':
        return 6; // HIPAA minimum retention
      case 'PII':
        return 7; // GDPR maximum retention
      case 'SENSITIVE':
        return 3;
      default:
        return 1;
    }
  }
}