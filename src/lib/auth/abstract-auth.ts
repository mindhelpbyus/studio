/**
 * Abstract Authentication System
 * Supports multiple identity providers (AWS IAM, Azure AD, GCP IAM, OCI IAM)
 */

import { CloudProvider } from '../cloud/interfaces';

export interface AuthConfig {
  provider: CloudProvider;
  clientId: string;
  clientSecret?: string;
  tenantId?: string;
  domain?: string;
  redirectUri: string;
  scopes: string[];
  tokenEndpoint?: string;
  authorizationEndpoint?: string;
  userInfoEndpoint?: string;
  jwksUri?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
  provider: CloudProvider;
  providerUserId: string;
  metadata?: Record<string, any>;
  tokenExpiry?: Date;
}

export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  tokenType: string;
  expiresIn: number;
  scope?: string;
}

export interface AuthSession {
  id: string;
  userId: string;
  token: AuthToken;
  user: AuthUser;
  createdAt: Date;
  expiresAt: Date;
  lastAccessedAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface LoginRequest {
  email?: string;
  password?: string;
  provider?: CloudProvider;
  code?: string; // OAuth authorization code
  state?: string; // OAuth state parameter
  redirectUri?: string;
}

export interface LoginResponse {
  success: boolean;
  session?: AuthSession;
  redirectUrl?: string;
  error?: string;
}

export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface Role {
  name: string;
  permissions: Permission[];
  description?: string;
}

// Abstract Authentication Provider
export abstract class AbstractAuthProvider {
  protected config: AuthConfig;

  constructor(config: AuthConfig) {
    this.config = config;
  }

  // Abstract methods that must be implemented by concrete providers
  abstract login(request: LoginRequest): Promise<LoginResponse>;
  abstract logout(sessionId: string): Promise<void>;
  abstract refreshToken(refreshToken: string): Promise<AuthToken>;
  abstract validateToken(token: string): Promise<AuthUser | null>;
  abstract getAuthorizationUrl(state?: string): string;
  abstract getUserInfo(token: string): Promise<AuthUser>;

  // Common methods with default implementations
  async createSession(user: AuthUser, token: AuthToken, metadata?: Record<string, any>): Promise<AuthSession> {
    const session: AuthSession = {
      id: this.generateSessionId(),
      userId: user.id,
      token,
      user,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + token.expiresIn * 1000),
      lastAccessedAt: new Date(),
      ...metadata,
    };

    await this.storeSession(session);
    return session;
  }

  async getSession(sessionId: string): Promise<AuthSession | null> {
    return this.retrieveSession(sessionId);
  }

  async updateSession(sessionId: string, updates: Partial<AuthSession>): Promise<AuthSession | null> {
    const session = await this.getSession(sessionId);
    if (!session) return null;

    const updatedSession = {
      ...session,
      ...updates,
      lastAccessedAt: new Date(),
    };

    await this.storeSession(updatedSession);
    return updatedSession;
  }

  async isSessionValid(sessionId: string): Promise<boolean> {
    const session = await this.getSession(sessionId);
    if (!session) return false;

    return session.expiresAt > new Date();
  }

  async extendSession(sessionId: string, extensionMinutes: number = 30): Promise<boolean> {
    const session = await this.getSession(sessionId);
    if (!session) return false;

    const newExpiryTime = new Date(Date.now() + extensionMinutes * 60 * 1000);
    await this.updateSession(sessionId, { expiresAt: newExpiryTime });
    return true;
  }

  // Permission and role management
  async hasPermission(user: AuthUser, resource: string, action: string): Promise<boolean> {
    return user.permissions.some(permission => {
      const [permResource, permAction] = permission.split(':');
      return (permResource === '*' || permResource === resource) &&
             (permAction === '*' || permAction === action);
    });
  }

  async hasRole(user: AuthUser, roleName: string): Promise<boolean> {
    return user.roles.includes(roleName);
  }

  async hasAnyRole(user: AuthUser, roleNames: string[]): Promise<boolean> {
    return roleNames.some(role => user.roles.includes(role));
  }

  // Abstract methods for session storage (to be implemented by concrete providers)
  protected abstract storeSession(session: AuthSession): Promise<void>;
  protected abstract retrieveSession(sessionId: string): Promise<AuthSession | null>;
  protected abstract deleteSession(sessionId: string): Promise<void>;

  // Utility methods
  protected generateSessionId(): string {
    return crypto.randomUUID();
  }

  protected generateState(): string {
    return crypto.randomUUID();
  }

  protected validateState(state: string, expectedState: string): boolean {
    return state === expectedState;
  }

  protected isTokenExpired(token: AuthToken): boolean {
    if (!token.expiresIn) return false;
    // Add some buffer time (5 minutes) to account for clock skew
    const bufferTime = 5 * 60 * 1000;
    return Date.now() + bufferTime >= token.expiresIn * 1000;
  }
}

// Multi-Provider Authentication Manager
export class MultiProviderAuthManager {
  private providers: Map<CloudProvider, AbstractAuthProvider> = new Map();
  private defaultProvider: CloudProvider;

  constructor(defaultProvider: CloudProvider) {
    this.defaultProvider = defaultProvider;
  }

  registerProvider(provider: CloudProvider, authProvider: AbstractAuthProvider): void {
    this.providers.set(provider, authProvider);
  }

  getProvider(provider?: CloudProvider): AbstractAuthProvider {
    const targetProvider = provider || this.defaultProvider;
    const authProvider = this.providers.get(targetProvider);
    
    if (!authProvider) {
      throw new Error(`Authentication provider ${targetProvider} not registered`);
    }
    
    return authProvider;
  }

  async login(request: LoginRequest): Promise<LoginResponse> {
    const provider = this.getProvider(request.provider);
    return provider.login(request);
  }

  async logout(sessionId: string, provider?: CloudProvider): Promise<void> {
    const authProvider = this.getProvider(provider);
    return authProvider.logout(sessionId);
  }

  async validateToken(token: string, provider?: CloudProvider): Promise<AuthUser | null> {
    const authProvider = this.getProvider(provider);
    return authProvider.validateToken(token);
  }

  async refreshToken(refreshToken: string, provider?: CloudProvider): Promise<AuthToken> {
    const authProvider = this.getProvider(provider);
    return authProvider.refreshToken(refreshToken);
  }

  // Cross-provider session management
  async federateSession(primarySessionId: string, targetProvider: CloudProvider): Promise<AuthSession | null> {
    const primaryProvider = this.getProvider();
    const targetAuthProvider = this.getProvider(targetProvider);
    
    const primarySession = await primaryProvider.getSession(primarySessionId);
    if (!primarySession) return null;

    // Create federated session in target provider
    return targetAuthProvider.createSession(primarySession.user, primarySession.token);
  }

  // Single Sign-On (SSO) support
  async initiateSSOLogin(provider: CloudProvider, returnUrl?: string): Promise<string> {
    const authProvider = this.getProvider(provider);
    const state = returnUrl ? btoa(JSON.stringify({ returnUrl, provider })) : undefined;
    return authProvider.getAuthorizationUrl(state);
  }

  async completeSSOLogin(code: string, state?: string): Promise<LoginResponse> {
    let provider = this.defaultProvider;
    let returnUrl: string | undefined;

    if (state) {
      try {
        const stateData = JSON.parse(atob(state));
        provider = stateData.provider;
        returnUrl = stateData.returnUrl;
      } catch (error) {
        // Invalid state, use default provider
      }
    }

    const response = await this.login({ code, state, provider });
    
    if (response.success && returnUrl) {
      response.redirectUrl = returnUrl;
    }

    return response;
  }

  // Multi-factor authentication support
  async initiateMFA(sessionId: string, method: 'sms' | 'email' | 'totp'): Promise<boolean> {
    // Implementation would depend on the specific provider
    // This is a placeholder for MFA functionality
    return true;
  }

  async verifyMFA(sessionId: string, code: string): Promise<boolean> {
    // Implementation would depend on the specific provider
    // This is a placeholder for MFA verification
    return true;
  }

  // Session management across providers
  async getAllSessions(userId: string): Promise<AuthSession[]> {
    const sessions: AuthSession[] = [];
    
    for (const [provider, authProvider] of this.providers) {
      try {
        // This would need to be implemented in each provider
        // For now, we'll just return empty array
      } catch (error) {
        console.warn(`Failed to get sessions from ${provider}:`, error);
      }
    }
    
    return sessions;
  }

  async logoutAllSessions(userId: string): Promise<void> {
    const sessions = await this.getAllSessions(userId);
    
    const logoutPromises = sessions.map(session => 
      this.logout(session.id, session.user.provider)
    );
    
    await Promise.allSettled(logoutPromises);
  }

  // Provider health check
  async checkProviderHealth(provider?: CloudProvider): Promise<boolean> {
    try {
      const authProvider = this.getProvider(provider);
      // Perform a basic health check (e.g., validate configuration)
      return true;
    } catch (error) {
      return false;
    }
  }

  getAvailableProviders(): CloudProvider[] {
    return Array.from(this.providers.keys());
  }

  setDefaultProvider(provider: CloudProvider): void {
    if (!this.providers.has(provider)) {
      throw new Error(`Provider ${provider} not registered`);
    }
    this.defaultProvider = provider;
  }
}

// Authentication errors
export class AuthenticationError extends Error {
  constructor(message: string, public provider?: CloudProvider, public code?: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string, public requiredPermission?: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class SessionExpiredError extends Error {
  constructor(message: string = 'Session has expired') {
    super(message);
    this.name = 'SessionExpiredError';
  }
}