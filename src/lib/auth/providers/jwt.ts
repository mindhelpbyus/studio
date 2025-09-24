/**
 * JWT Authentication Provider
 * Implements JWT-based authentication with support for access and refresh tokens
 */

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';
import speakeasy from 'speakeasy';
import { DatabaseManager } from '../../database/database-factory';
import {
  AuthProvider,
  AuthConfig,
  AuthResult,
  User,
  TokenInfo,
  AuthenticationError,
  InvalidTokenError,
  TokenExpiredError,
  UserNotFoundError,
  UserExistsError,
  MFARequiredError,
  InvalidMFACodeError,
} from '../interfaces';

export class JWTProvider implements AuthProvider {
  private config: AuthConfig;
  private db: DatabaseManager;

  constructor(config: AuthConfig) {
    this.config = config;
    this.db = DatabaseManager.getInstance();
    
    if (!config.secretKey && !config.privateKey) {
      throw new Error('JWT provider requires either secretKey or privateKey');
    }
  }

  async authenticate(credentials: {
    email?: string;
    username?: string;
    password: string;
    mfaCode?: string;
  }): Promise<AuthResult> {
    try {
      // Find user by email or username
      const identifier = credentials.email || credentials.username;
      if (!identifier) {
        throw new AuthenticationError('Email or username is required');
      }

      const user = await this.findUserByIdentifier(identifier);
      if (!user) {
        throw new AuthenticationError('Invalid credentials');
      }

      if (!user.isActive) {
        throw new AuthenticationError('Account is disabled');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(credentials.password, user.passwordHash);
      if (!isValidPassword) {
        await this.logFailedAttempt(user.id, 'invalid_password');
        throw new AuthenticationError('Invalid credentials');
      }

      // Check if MFA is required
      if (user.mfaEnabled && !credentials.mfaCode) {
        throw new MFARequiredError('Multi-factor authentication code required');
      }

      // Verify MFA if provided
      if (user.mfaEnabled && credentials.mfaCode) {
        const isMFAValid = await this.verifyMFA(user.id, credentials.mfaCode, 'totp');
        if (!isMFAValid) {
          await this.logFailedAttempt(user.id, 'invalid_mfa');
          throw new InvalidMFACodeError('Invalid MFA code');
        }
      }

      // Generate tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // Update last login
      await this.updateLastLogin(user.id);

      // Log successful authentication
      await this.logSuccessfulAuth(user.id);

      return {
        success: true,
        user: this.sanitizeUser(user),
        accessToken,
        refreshToken,
        expiresIn: this.getTokenExpiration(),
        tokenType: 'Bearer',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
    }
  }

  async validateToken(token: string): Promise<TokenInfo | null> {
    try {
      const decoded = this.verifyToken(token) as any;
      
      if (!decoded || !decoded.sub) {
        return null;
      }

      // Check if token is blacklisted
      const isBlacklisted = await this.isTokenBlacklisted(token);
      if (isBlacklisted) {
        return null;
      }

      // Get user data
      const user = await this.getUser(decoded.sub);
      if (!user || !user.isActive) {
        return null;
      }

      return {
        user: this.sanitizeUser(user),
        issuedAt: decoded.iat,
        expiresAt: decoded.exp,
        issuer: decoded.iss || this.config.issuer || 'vivale-healthcare',
        audience: decoded.aud,
        scopes: decoded.scopes || [],
        metadata: decoded.metadata || {},
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new TokenExpiredError();
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new InvalidTokenError();
      }
      return null;
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResult> {
    try {
      const decoded = this.verifyToken(refreshToken, true) as any;
      
      if (!decoded || !decoded.sub || decoded.type !== 'refresh') {
        throw new InvalidTokenError('Invalid refresh token');
      }

      // Check if refresh token is blacklisted
      const isBlacklisted = await this.isTokenBlacklisted(refreshToken);
      if (isBlacklisted) {
        throw new InvalidTokenError('Refresh token has been revoked');
      }

      // Get user
      const user = await this.getUser(decoded.sub);
      if (!user || !user.isActive) {
        throw new UserNotFoundError();
      }

      // Generate new tokens
      const newAccessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      // Blacklist old refresh token
      await this.blacklistToken(refreshToken);

      return {
        success: true,
        user: this.sanitizeUser(user),
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: this.getTokenExpiration(),
        tokenType: 'Bearer',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Token refresh failed',
      };
    }
  }

  async revokeToken(token: string): Promise<boolean> {
    try {
      await this.blacklistToken(token);
      return true;
    } catch (error) {
      console.error('Token revocation failed:', error);
      return false;
    }
  }

  async getUser(userId: string): Promise<User | null> {
    try {
      const result = await this.db.findOne('users', { id: userId });
      return result ? this.mapDatabaseUser(result) : null;
    } catch (error) {
      console.error('Get user failed:', error);
      return null;
    }
  }

  async createUser(userData: Partial<User>): Promise<User> {
    try {
      // Check if user already exists
      if (userData.email) {
        const existingUser = await this.findUserByIdentifier(userData.email);
        if (existingUser) {
          throw new UserExistsError('User with this email already exists');
        }
      }

      // Hash password if provided
      let passwordHash: string | undefined;
      if (userData.password) {
        passwordHash = await bcrypt.hash(userData.password, 12);
      }

      const user = {
        id: crypto.randomUUID(),
        email: userData.email!,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        displayName: userData.displayName || `${userData.firstName} ${userData.lastName}`.trim(),
        avatar: userData.avatar,
        roles: userData.roles || ['user'],
        permissions: userData.permissions || [],
        metadata: userData.metadata || {},
        isActive: userData.isActive !== false,
        isVerified: userData.isVerified || false,
        mfaEnabled: false,
        mfaMethods: [],
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await this.db.insertOne('users', user);
      return this.sanitizeUser(user);
    } catch (error) {
      if (error instanceof UserExistsError) {
        throw error;
      }
      throw new Error(`Failed to create user: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    try {
      const existingUser = await this.getUser(userId);
      if (!existingUser) {
        throw new UserNotFoundError();
      }

      const updates: any = {
        ...userData,
        updatedAt: new Date(),
      };

      // Hash password if provided
      if (userData.password) {
        updates.passwordHash = await bcrypt.hash(userData.password, 12);
        delete updates.password;
      }

      await this.db.updateOne('users', { id: userId }, updates);
      
      const updatedUser = await this.getUser(userId);
      return updatedUser!;
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw error;
      }
      throw new Error(`Failed to update user: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    try {
      const result = await this.db.deleteOne('users', { id: userId });
      return !!result;
    } catch (error) {
      console.error('Delete user failed:', error);
      return false;
    }
  }

  async hasPermission(userId: string, resource: string, action: string): Promise<boolean> {
    try {
      const user = await this.getUser(userId);
      if (!user) return false;

      // Check direct permissions
      const hasDirectPermission = user.permissions?.some(permission =>
        permission.resource === resource && permission.actions.includes(action)
      );

      if (hasDirectPermission) return true;

      // Check role-based permissions
      if (user.roles) {
        for (const roleName of user.roles) {
          const role = await this.getRole(roleName);
          if (role) {
            const hasRolePermission = role.permissions.some(permission =>
              permission.resource === resource && permission.actions.includes(action)
            );
            if (hasRolePermission) return true;
          }
        }
      }

      return false;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  }

  async assignRole(userId: string, role: string): Promise<boolean> {
    try {
      const user = await this.getUser(userId);
      if (!user) return false;

      const roles = user.roles || [];
      if (!roles.includes(role)) {
        roles.push(role);
        await this.updateUser(userId, { roles });
      }

      return true;
    } catch (error) {
      console.error('Role assignment failed:', error);
      return false;
    }
  }

  async removeRole(userId: string, role: string): Promise<boolean> {
    try {
      const user = await this.getUser(userId);
      if (!user) return false;

      const roles = (user.roles || []).filter(r => r !== role);
      await this.updateUser(userId, { roles });

      return true;
    } catch (error) {
      console.error('Role removal failed:', error);
      return false;
    }
  }

  async enableMFA(userId: string, method: 'totp' | 'sms' | 'email'): Promise<{ secret?: string; qrCode?: string }> {
    try {
      const user = await this.getUser(userId);
      if (!user) {
        throw new UserNotFoundError();
      }

      if (method === 'totp') {
        const secret = speakeasy.generateSecret({
          name: `Vivalé Healthcare (${user.email})`,
          issuer: 'Vivalé Healthcare',
        });

        const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

        // Save secret to user
        const mfaMethods = user.mfaMethods || [];
        const existingMethod = mfaMethods.find(m => m.type === 'totp');
        
        if (existingMethod) {
          existingMethod.secret = secret.base32;
          existingMethod.verified = false;
        } else {
          mfaMethods.push({
            type: 'totp',
            enabled: true,
            verified: false,
            secret: secret.base32,
          });
        }

        await this.updateUser(userId, { mfaMethods });

        return {
          secret: secret.base32,
          qrCode,
        };
      }

      // For SMS/Email MFA, implement provider-specific logic
      return {};
    } catch (error) {
      throw new Error(`Failed to enable MFA: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async verifyMFA(userId: string, code: string, method: 'totp' | 'sms' | 'email'): Promise<boolean> {
    try {
      const user = await this.getUser(userId);
      if (!user) return false;

      const mfaMethod = user.mfaMethods?.find(m => m.type === method);
      if (!mfaMethod || !mfaMethod.enabled) return false;

      if (method === 'totp' && mfaMethod.secret) {
        const verified = speakeasy.totp.verify({
          secret: mfaMethod.secret,
          encoding: 'base32',
          token: code,
          window: 2, // Allow 2 time steps of variance
        });

        if (verified && !mfaMethod.verified) {
          // Mark as verified and enable MFA
          mfaMethod.verified = true;
          const mfaMethods = user.mfaMethods!;
          await this.updateUser(userId, { mfaEnabled: true, mfaMethods });
        }

        return verified;
      }

      // For SMS/Email MFA, implement provider-specific verification
      return false;
    } catch (error) {
      console.error('MFA verification failed:', error);
      return false;
    }
  }

  async disableMFA(userId: string): Promise<boolean> {
    try {
      await this.updateUser(userId, { 
        mfaEnabled: false,
        mfaMethods: [],
      });
      return true;
    } catch (error) {
      console.error('MFA disable failed:', error);
      return false;
    }
  }

  async createSession(userId: string, metadata?: Record<string, any>): Promise<string> {
    const sessionId = crypto.randomUUID();
    const session = {
      id: sessionId,
      userId,
      data: metadata || {},
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      isActive: true,
    };

    await this.db.insertOne('sessions', session);
    return sessionId;
  }

  async getSession(sessionId: string): Promise<any> {
    return await this.db.findOne('sessions', { id: sessionId, isActive: true });
  }

  async updateSession(sessionId: string, metadata: Record<string, any>): Promise<boolean> {
    try {
      await this.db.updateOne('sessions', { id: sessionId }, {
        data: metadata,
        updatedAt: new Date(),
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async destroySession(sessionId: string): Promise<boolean> {
    try {
      await this.db.updateOne('sessions', { id: sessionId }, {
        isActive: false,
        updatedAt: new Date(),
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<boolean> {
    try {
      const user = await this.findUserById(userId);
      if (!user) return false;

      const isValidOldPassword = await bcrypt.compare(oldPassword, user.passwordHash);
      if (!isValidOldPassword) return false;

      const newPasswordHash = await bcrypt.hash(newPassword, 12);
      await this.db.updateOne('users', { id: userId }, {
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      });

      return true;
    } catch (error) {
      console.error('Password change failed:', error);
      return false;
    }
  }

  async resetPassword(email: string): Promise<boolean> {
    try {
      const user = await this.findUserByIdentifier(email);
      if (!user) return true; // Don't reveal if user exists

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await this.db.updateOne('users', { id: user.id }, {
        resetToken,
        resetTokenExpiry,
        updatedAt: new Date(),
      });

      // TODO: Send reset email
      console.log(`Password reset token for ${email}: ${resetToken}`);

      return true;
    } catch (error) {
      console.error('Password reset failed:', error);
      return false;
    }
  }

  async confirmPasswordReset(token: string, newPassword: string): Promise<boolean> {
    try {
      const user = await this.db.findOne('users', { 
        resetToken: token,
      });

      if (!user || !user.resetTokenExpiry || new Date() > new Date(user.resetTokenExpiry)) {
        return false;
      }

      const newPasswordHash = await bcrypt.hash(newPassword, 12);
      await this.db.updateOne('users', { id: user.id }, {
        passwordHash: newPasswordHash,
        resetToken: null,
        resetTokenExpiry: null,
        updatedAt: new Date(),
      });

      return true;
    } catch (error) {
      console.error('Password reset confirmation failed:', error);
      return false;
    }
  }

  // Private helper methods
  private generateAccessToken(user: any): string {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles || [],
      type: 'access',
    };

    const options: jwt.SignOptions = {
      expiresIn: this.config.expiresIn || '15m',
      issuer: this.config.issuer || 'vivale-healthcare',
      audience: this.config.audience,
      algorithm: (this.config.algorithm as jwt.Algorithm) || 'HS256',
    };

    return jwt.sign(payload, this.getSigningKey(), options);
  }

  private generateRefreshToken(user: any): string {
    const payload = {
      sub: user.id,
      type: 'refresh',
    };

    const options: jwt.SignOptions = {
      expiresIn: this.config.refreshExpiresIn || '7d',
      issuer: this.config.issuer || 'vivale-healthcare',
      audience: this.config.audience,
      algorithm: (this.config.algorithm as jwt.Algorithm) || 'HS256',
    };

    return jwt.sign(payload, this.getSigningKey(), options);
  }

  private verifyToken(token: string, isRefreshToken: boolean = false): any {
    const options: jwt.VerifyOptions = {
      issuer: this.config.issuer || 'vivale-healthcare',
      audience: this.config.audience,
      algorithms: [(this.config.algorithm as jwt.Algorithm) || 'HS256'],
    };

    return jwt.verify(token, this.getVerificationKey(), options);
  }

  private getSigningKey(): string | Buffer {
    return this.config.privateKey || this.config.secretKey!;
  }

  private getVerificationKey(): string | Buffer {
    return this.config.publicKey || this.config.secretKey!;
  }

  private getTokenExpiration(): number {
    const expiresIn = this.config.expiresIn || '15m';
    if (typeof expiresIn === 'number') return expiresIn;
    
    // Parse string format (e.g., '15m', '1h', '7d')
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 900; // Default 15 minutes
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 24 * 60 * 60;
      default: return 900;
    }
  }

  private async findUserByIdentifier(identifier: string): Promise<any> {
    // Try email first
    let user = await this.db.findOne('users', { email: identifier });
    
    // Try username if not found
    if (!user) {
      user = await this.db.findOne('users', { username: identifier });
    }
    
    return user;
  }

  private async findUserById(userId: string): Promise<any> {
    return await this.db.findOne('users', { id: userId });
  }

  private mapDatabaseUser(dbUser: any): User {
    return {
      id: dbUser.id,
      email: dbUser.email,
      username: dbUser.username,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      displayName: dbUser.displayName,
      avatar: dbUser.avatar,
      roles: dbUser.roles || [],
      permissions: dbUser.permissions || [],
      metadata: dbUser.metadata || {},
      isActive: dbUser.isActive !== false,
      isVerified: dbUser.isVerified || false,
      lastLoginAt: dbUser.lastLoginAt ? new Date(dbUser.lastLoginAt) : undefined,
      createdAt: dbUser.createdAt ? new Date(dbUser.createdAt) : undefined,
      updatedAt: dbUser.updatedAt ? new Date(dbUser.updatedAt) : undefined,
      mfaEnabled: dbUser.mfaEnabled || false,
      mfaMethods: dbUser.mfaMethods || [],
    };
  }

  private sanitizeUser(user: any): User {
    const sanitized = { ...user };
    delete sanitized.passwordHash;
    delete sanitized.resetToken;
    delete sanitized.resetTokenExpiry;
    return sanitized;
  }

  private async blacklistToken(token: string): Promise<void> {
    const decoded = jwt.decode(token) as any;
    if (decoded && decoded.exp) {
      await this.db.insertOne('blacklisted_tokens', {
        token: crypto.createHash('sha256').update(token).digest('hex'),
        expiresAt: new Date(decoded.exp * 1000),
        createdAt: new Date(),
      });
    }
  }

  private async isTokenBlacklisted(token: string): Promise<boolean> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const blacklisted = await this.db.findOne('blacklisted_tokens', { token: tokenHash });
    return !!blacklisted;
  }

  private async getRole(roleName: string): Promise<any> {
    return await this.db.findOne('roles', { name: roleName });
  }

  private async updateLastLogin(userId: string): Promise<void> {
    await this.db.updateOne('users', { id: userId }, {
      lastLoginAt: new Date(),
      updatedAt: new Date(),
    });
  }

  private async logSuccessfulAuth(userId: string): Promise<void> {
    // TODO: Implement audit logging
    console.log(`Successful authentication for user: ${userId}`);
  }

  private async logFailedAttempt(userId: string, reason: string): Promise<void> {
    // TODO: Implement audit logging and rate limiting
    console.log(`Failed authentication for user: ${userId}, reason: ${reason}`);
  }
}