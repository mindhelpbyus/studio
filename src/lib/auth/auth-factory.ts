/**
 * Authentication Factory - Multi-Provider Authentication System
 * Supports AWS IAM, Azure AD, GCP IAM, OCI IAM, and custom JWT
 */

import { AuthProvider, AuthConfig, AuthResult, User, TokenInfo } from './interfaces';
import { FirebaseAuthProvider } from './providers/firebase';
import { JWTProvider } from './providers/jwt';
// Note: Other providers are stubs - implement as needed
// import { AWSIAMProvider } from './providers/aws-iam';
// import { AzureADProvider } from './providers/azure-ad';
// import { GCPIAMProvider } from './providers/gcp-iam';
// import { OCIIAMProvider } from './providers/oci-iam';

export type AuthProviderType = 'aws-iam' | 'azure-ad' | 'gcp-iam' | 'oci-iam' | 'jwt' | 'firebase' | 'custom';

export class AuthFactory {
  private static providers: Map<AuthProviderType, AuthProvider> = new Map();

  static createProvider(config: AuthConfig): AuthProvider {
    const cacheKey = config.type;
    
    // Return cached provider if available
    if (this.providers.has(cacheKey)) {
      return this.providers.get(cacheKey)!;
    }

    let provider: AuthProvider;
    
    switch (config.type) {
      case 'firebase':
        provider = new FirebaseAuthProvider(config as any);
        break;
      case 'jwt':
        provider = new JWTProvider(config);
        break;
      case 'aws-iam':
        throw new Error('AWS IAM provider not yet implemented - use Firebase or JWT');
      case 'azure-ad':
        throw new Error('Azure AD provider not yet implemented - use Firebase or JWT');
      case 'gcp-iam':
        throw new Error('GCP IAM provider not yet implemented - use Firebase or JWT');
      case 'oci-iam':
        throw new Error('OCI IAM provider not yet implemented - use Firebase or JWT');
      default:
        throw new Error(`Unsupported auth provider: ${config.type}`);
    }

    // Cache the provider
    this.providers.set(cacheKey, provider);
    
    return provider;
  }

  static getProvider(type: AuthProviderType): AuthProvider | undefined {
    return this.providers.get(type);
  }

  static listProviders(): AuthProviderType[] {
    return Array.from(this.providers.keys());
  }

  static clearCache(): void {
    this.providers.clear();
  }
}

// Multi-provider authentication manager
export class AuthManager {
  private static instance: AuthManager;
  private primaryProvider: AuthProvider | null = null;
  private fallbackProviders: AuthProvider[] = [];
  private config: AuthConfig | null = null;

  private constructor() {}

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  initialize(config: AuthConfig, fallbackConfigs?: AuthConfig[]): void {
    this.config = config;
    this.primaryProvider = AuthFactory.createProvider(config);

    // Initialize fallback providers
    if (fallbackConfigs) {
      this.fallbackProviders = fallbackConfigs.map(cfg => AuthFactory.createProvider(cfg));
    }
  }

  getPrimaryProvider(): AuthProvider {
    if (!this.primaryProvider) {
      throw new Error('Auth manager not initialized. Call initialize() first.');
    }
    return this.primaryProvider;
  }

  async authenticate(credentials: any): Promise<AuthResult> {
    try {
      // Try primary provider first
      const result = await this.primaryProvider!.authenticate(credentials);
      if (result.success) {
        return result;
      }
    } catch (error) {
      console.warn('Primary auth provider failed:', error);
    }

    // Try fallback providers
    for (const provider of this.fallbackProviders) {
      try {
        const result = await provider.authenticate(credentials);
        if (result.success) {
          return result;
        }
      } catch (error) {
        console.warn('Fallback auth provider failed:', error);
      }
    }

    return {
      success: false,
      error: 'Authentication failed with all providers',
    };
  }

  async validateToken(token: string): Promise<TokenInfo | null> {
    try {
      // Try primary provider first
      const tokenInfo = await this.primaryProvider!.validateToken(token);
      if (tokenInfo) {
        return tokenInfo;
      }
    } catch (error) {
      console.warn('Primary token validation failed:', error);
    }

    // Try fallback providers
    for (const provider of this.fallbackProviders) {
      try {
        const tokenInfo = await provider.validateToken(token);
        if (tokenInfo) {
          return tokenInfo;
        }
      } catch (error) {
        console.warn('Fallback token validation failed:', error);
      }
    }

    return null;
  }

  async refreshToken(refreshToken: string): Promise<AuthResult> {
    try {
      return await this.primaryProvider!.refreshToken(refreshToken);
    } catch (error) {
      // Try fallback providers
      for (const provider of this.fallbackProviders) {
        try {
          const result = await provider.refreshToken(refreshToken);
          if (result.success) {
            return result;
          }
        } catch (fallbackError) {
          console.warn('Fallback token refresh failed:', fallbackError);
        }
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async revokeToken(token: string): Promise<boolean> {
    try {
      return await this.primaryProvider!.revokeToken(token);
    } catch (error) {
      console.warn('Token revocation failed:', error);
      return false;
    }
  }

  async getUser(userId: string): Promise<User | null> {
    try {
      return await this.primaryProvider!.getUser(userId);
    } catch (error) {
      console.warn('Get user failed:', error);
      return null;
    }
  }

  async createUser(userData: Partial<User>): Promise<User> {
    return await this.primaryProvider!.createUser(userData);
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    return await this.primaryProvider!.updateUser(userId, userData);
  }

  async deleteUser(userId: string): Promise<boolean> {
    return await this.primaryProvider!.deleteUser(userId);
  }

  async hasPermission(userId: string, resource: string, action: string): Promise<boolean> {
    try {
      return await this.primaryProvider!.hasPermission(userId, resource, action);
    } catch (error) {
      console.warn('Permission check failed:', error);
      return false;
    }
  }

  async assignRole(userId: string, role: string): Promise<boolean> {
    try {
      return await this.primaryProvider!.assignRole(userId, role);
    } catch (error) {
      console.warn('Role assignment failed:', error);
      return false;
    }
  }

  async removeRole(userId: string, role: string): Promise<boolean> {
    try {
      return await this.primaryProvider!.removeRole(userId, role);
    } catch (error) {
      console.warn('Role removal failed:', error);
      return false;
    }
  }

  // Multi-factor authentication
  async enableMFA(userId: string, method: 'totp' | 'sms' | 'email'): Promise<{ secret?: string; qrCode?: string }> {
    return await this.primaryProvider!.enableMFA(userId, method);
  }

  async verifyMFA(userId: string, code: string, method: 'totp' | 'sms' | 'email'): Promise<boolean> {
    return await this.primaryProvider!.verifyMFA(userId, code, method);
  }

  async disableMFA(userId: string): Promise<boolean> {
    return await this.primaryProvider!.disableMFA(userId);
  }

  // Session management
  async createSession(userId: string, metadata?: Record<string, any>): Promise<string> {
    return await this.primaryProvider!.createSession(userId, metadata);
  }

  async getSession(sessionId: string): Promise<any> {
    return await this.primaryProvider!.getSession(sessionId);
  }

  async updateSession(sessionId: string, metadata: Record<string, any>): Promise<boolean> {
    return await this.primaryProvider!.updateSession(sessionId, metadata);
  }

  async destroySession(sessionId: string): Promise<boolean> {
    return await this.primaryProvider!.destroySession(sessionId);
  }

  // Password management
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<boolean> {
    return await this.primaryProvider!.changePassword(userId, oldPassword, newPassword);
  }

  async resetPassword(email: string): Promise<boolean> {
    return await this.primaryProvider!.resetPassword(email);
  }

  async confirmPasswordReset(token: string, newPassword: string): Promise<boolean> {
    return await this.primaryProvider!.confirmPasswordReset(token, newPassword);
  }
}

// Middleware for authentication
export function authMiddleware(options: {
  required?: boolean;
  roles?: string[];
  permissions?: { resource: string; action: string }[];
} = {}) {
  const authManager = AuthManager.getInstance();
  
  return async (req: any, res: any, next: any) => {
    try {
      const token = extractToken(req);
      
      if (!token) {
        if (options.required) {
          return res.status(401).json({ error: 'Authentication required' });
        }
        return next();
      }

      const tokenInfo = await authManager.validateToken(token);
      
      if (!tokenInfo) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      // Add user info to request
      req.user = tokenInfo.user;
      req.tokenInfo = tokenInfo;

      // Check roles if specified
      if (options.roles && options.roles.length > 0) {
        const hasRole = options.roles.some(role => 
          tokenInfo.user.roles?.includes(role)
        );
        
        if (!hasRole) {
          return res.status(403).json({ error: 'Insufficient permissions' });
        }
      }

      // Check permissions if specified
      if (options.permissions && options.permissions.length > 0) {
        for (const permission of options.permissions) {
          const hasPermission = await authManager.hasPermission(
            tokenInfo.user.id,
            permission.resource,
            permission.action
          );
          
          if (!hasPermission) {
            return res.status(403).json({ 
              error: `Permission denied: ${permission.action} on ${permission.resource}` 
            });
          }
        }
      }

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(500).json({ error: 'Authentication error' });
    }
  };
}

// Helper function to extract token from request
function extractToken(req: any): string | null {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookies
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }

  // Check query parameter
  if (req.query && req.query.token) {
    return req.query.token;
  }

  return null;
}

// Singleton access
export const auth = AuthManager.getInstance();

// Convenience functions
export async function authenticate(credentials: any): Promise<AuthResult> {
  return auth.authenticate(credentials);
}

export async function validateToken(token: string): Promise<TokenInfo | null> {
  return auth.validateToken(token);
}

export async function refreshToken(refreshToken: string): Promise<AuthResult> {
  return auth.refreshToken(refreshToken);
}

export async function hasPermission(userId: string, resource: string, action: string): Promise<boolean> {
  return auth.hasPermission(userId, resource, action);
}

export async function createUser(userData: Partial<User>): Promise<User> {
  return auth.createUser(userData);
}

export async function getUser(userId: string): Promise<User | null> {
  return auth.getUser(userId);
}