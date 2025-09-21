/**
 * Authentication Interfaces - Common contracts for all auth providers
 */

export interface AuthConfig {
  type: 'aws-iam' | 'azure-ad' | 'gcp-iam' | 'oci-iam' | 'jwt' | 'firebase' | 'custom';
  
  // Common settings
  issuer?: string;
  audience?: string;
  algorithm?: string;
  
  // JWT specific
  secretKey?: string;
  publicKey?: string;
  privateKey?: string;
  expiresIn?: string | number;
  refreshExpiresIn?: string | number;
  
  // AWS IAM specific
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  sessionToken?: string;
  
  // Azure AD specific
  tenantId?: string;
  clientId?: string;
  clientSecret?: string;
  
  // GCP IAM specific
  projectId?: string;
  keyFilename?: string;
  credentials?: any;
  
  // OCI IAM specific
  compartmentId?: string;
  userId?: string;
  fingerprint?: string;
  privateKeyPath?: string;
  
  // Additional options
  options?: Record<string, any>;
}

export interface User {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatar?: string;
  roles?: string[];
  permissions?: Permission[];
  metadata?: Record<string, any>;
  isActive?: boolean;
  isVerified?: boolean;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  
  // MFA settings
  mfaEnabled?: boolean;
  mfaMethods?: MFAMethod[];
  
  // Provider-specific data
  providerData?: Record<string, any>;
}

export interface Permission {
  resource: string;
  actions: string[];
  conditions?: Record<string, any>;
}

export interface MFAMethod {
  type: 'totp' | 'sms' | 'email';
  enabled: boolean;
  verified: boolean;
  secret?: string;
  backupCodes?: string[];
}

export interface AuthResult {
  success: boolean;
  user?: User;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
  error?: string;
  metadata?: Record<string, any>;
}

export interface TokenInfo {
  user: User;
  issuedAt: number;
  expiresAt: number;
  issuer: string;
  audience?: string;
  scopes?: string[];
  metadata?: Record<string, any>;
}

export interface AuthProvider {
  // Core authentication
  authenticate(credentials: any): Promise<AuthResult>;
  validateToken(token: string): Promise<TokenInfo | null>;
  refreshToken(refreshToken: string): Promise<AuthResult>;
  revokeToken(token: string): Promise<boolean>;
  
  // User management
  getUser(userId: string): Promise<User | null>;
  createUser(userData: Partial<User>): Promise<User>;
  updateUser(userId: string, userData: Partial<User>): Promise<User>;
  deleteUser(userId: string): Promise<boolean>;
  
  // Authorization
  hasPermission(userId: string, resource: string, action: string): Promise<boolean>;
  assignRole(userId: string, role: string): Promise<boolean>;
  removeRole(userId: string, role: string): Promise<boolean>;
  
  // Multi-factor authentication
  enableMFA(userId: string, method: 'totp' | 'sms' | 'email'): Promise<{ secret?: string; qrCode?: string }>;
  verifyMFA(userId: string, code: string, method: 'totp' | 'sms' | 'email'): Promise<boolean>;
  disableMFA(userId: string): Promise<boolean>;
  
  // Session management
  createSession(userId: string, metadata?: Record<string, any>): Promise<string>;
  getSession(sessionId: string): Promise<any>;
  updateSession(sessionId: string, metadata: Record<string, any>): Promise<boolean>;
  destroySession(sessionId: string): Promise<boolean>;
  
  // Password management
  changePassword(userId: string, oldPassword: string, newPassword: string): Promise<boolean>;
  resetPassword(email: string): Promise<boolean>;
  confirmPasswordReset(token: string, newPassword: string): Promise<boolean>;
}

// Common authentication errors
export class AuthError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export class AuthenticationError extends AuthError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AuthError {
  constructor(message: string = 'Access denied') {
    super(message, 'AUTHORIZATION_ERROR', 403);
    this.name = 'AuthorizationError';
  }
}

export class TokenExpiredError extends AuthError {
  constructor(message: string = 'Token has expired') {
    super(message, 'TOKEN_EXPIRED', 401);
    this.name = 'TokenExpiredError';
  }
}

export class InvalidTokenError extends AuthError {
  constructor(message: string = 'Invalid token') {
    super(message, 'INVALID_TOKEN', 401);
    this.name = 'InvalidTokenError';
  }
}

export class UserNotFoundError extends AuthError {
  constructor(message: string = 'User not found') {
    super(message, 'USER_NOT_FOUND', 404);
    this.name = 'UserNotFoundError';
  }
}

export class UserExistsError extends AuthError {
  constructor(message: string = 'User already exists') {
    super(message, 'USER_EXISTS', 409);
    this.name = 'UserExistsError';
  }
}

export class MFARequiredError extends AuthError {
  constructor(message: string = 'Multi-factor authentication required') {
    super(message, 'MFA_REQUIRED', 428);
    this.name = 'MFARequiredError';
  }
}

export class InvalidMFACodeError extends AuthError {
  constructor(message: string = 'Invalid MFA code') {
    super(message, 'INVALID_MFA_CODE', 400);
    this.name = 'InvalidMFACodeError';
  }
}

// Role and permission definitions
export interface Role {
  name: string;
  description?: string;
  permissions: Permission[];
  isSystem?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RoleAssignment {
  userId: string;
  roleName: string;
  assignedBy: string;
  assignedAt: Date;
  expiresAt?: Date;
  conditions?: Record<string, any>;
}

// OAuth/OIDC specific interfaces
export interface OAuthConfig extends AuthConfig {
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl?: string;
  scope?: string[];
  redirectUri: string;
  state?: string;
  nonce?: string;
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  tokenType: string;
  expiresIn: number;
  scope?: string;
}

// SAML specific interfaces
export interface SAMLConfig extends AuthConfig {
  entryPoint: string;
  issuer: string;
  cert: string;
  privateKey?: string;
  signatureAlgorithm?: string;
  digestAlgorithm?: string;
  authnRequestBinding?: string;
  wantAssertionsSigned?: boolean;
  wantAuthnResponseSigned?: boolean;
}

// LDAP specific interfaces
export interface LDAPConfig extends AuthConfig {
  url: string;
  bindDN: string;
  bindCredentials: string;
  searchBase: string;
  searchFilter: string;
  searchAttributes?: string[];
  tlsOptions?: any;
}

// Session interfaces
export interface Session {
  id: string;
  userId: string;
  data: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
}

export interface SessionStore {
  create(session: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>): Promise<Session>;
  get(sessionId: string): Promise<Session | null>;
  update(sessionId: string, data: Partial<Session>): Promise<Session | null>;
  delete(sessionId: string): Promise<boolean>;
  deleteByUserId(userId: string): Promise<number>;
  cleanup(): Promise<number>; // Remove expired sessions
}

// Audit interfaces
export interface AuditEvent {
  id: string;
  userId?: string;
  sessionId?: string;
  action: string;
  resource?: string;
  result: 'success' | 'failure';
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface AuditLogger {
  log(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<void>;
  query(filters: Partial<AuditEvent>, options?: {
    limit?: number;
    offset?: number;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
  }): Promise<AuditEvent[]>;
}

// Rate limiting interfaces
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: any) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  onLimitReached?: (req: any, res: any) => void;
}

export interface RateLimiter {
  check(key: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: Date;
  }>;
  reset(key: string): Promise<void>;
}

// Password policy interfaces
export interface PasswordPolicy {
  minLength: number;
  maxLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumbers?: boolean;
  requireSpecialChars?: boolean;
  forbiddenPasswords?: string[];
  maxAge?: number; // days
  preventReuse?: number; // number of previous passwords to check
}

export interface PasswordValidator {
  validate(password: string, policy: PasswordPolicy): {
    valid: boolean;
    errors: string[];
  };
  generateSecure(length?: number): string;
  checkStrength(password: string): {
    score: number; // 0-4
    feedback: string[];
  };
}