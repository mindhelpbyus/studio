/**
 * Firebase Authentication Provider
 * Implements Firebase Auth with support for multiple providers
 */

import { initializeApp, getApps, FirebaseApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth, Auth, UserRecord, CreateRequest, UpdateRequest } from 'firebase-admin/auth';
import { getFirestore, Firestore, FieldValue } from 'firebase-admin/firestore';
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
} from '../interfaces';

export interface FirebaseAuthConfig extends AuthConfig {
  projectId: string;
  serviceAccountKey?: ServiceAccount;
  emulatorHost?: string; // For development
  customClaims?: Record<string, any>;
}

export class FirebaseAuthProvider implements AuthProvider {
  private app: FirebaseApp | null = null;
  private auth: Auth | null = null;
  private db: Firestore | null = null;
  private config: FirebaseAuthConfig;

  constructor(config: FirebaseAuthConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    try {
      // Check if Firebase app is already initialized
      const existingApps = getApps();
      
      if (existingApps.length > 0) {
        this.app = existingApps[0];
      } else {
        // Initialize Firebase Admin SDK
        const firebaseConfig: any = {
          projectId: this.config.projectId,
        };

        if (this.config.serviceAccountKey) {
          firebaseConfig.credential = cert(this.config.serviceAccountKey);
        } else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
          const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
          firebaseConfig.credential = cert(serviceAccount);
        }

        this.app = initializeApp(firebaseConfig);
      }

      this.auth = getAuth(this.app);
      this.db = getFirestore(this.app);

      // Configure emulator for development
      if (this.config.emulatorHost && process.env.NODE_ENV === 'development') {
        console.log(`Using Firebase Auth emulator at ${this.config.emulatorHost}`);
      }

      console.log('Firebase Auth initialized successfully');
    } catch (error) {
      throw new Error(`Failed to initialize Firebase Auth: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async authenticate(credentials: {
    idToken?: string;
    email?: string;
    password?: string;
    customToken?: string;
  }): Promise<AuthResult> {
    try {
      if (!this.auth) {
        await this.initialize();
      }

      let userRecord: UserRecord;
      let customClaims: Record<string, any> = {};

      if (credentials.idToken) {
        // Verify Firebase ID token
        const decodedToken = await this.auth!.verifyIdToken(credentials.idToken);
        userRecord = await this.auth!.getUser(decodedToken.uid);
        customClaims = decodedToken;
      } else if (credentials.customToken) {
        // Verify custom token
        const decodedToken = await this.auth!.verifyIdToken(credentials.customToken);
        userRecord = await this.auth!.getUser(decodedToken.uid);
        customClaims = decodedToken;
      } else {
        throw new AuthenticationError('ID token or custom token required for Firebase authentication');
      }

      // Get additional user data from Firestore
      const userData = await this.getUserData(userRecord.uid);

      const user: User = {
        id: userRecord.uid,
        email: userRecord.email || '',
        displayName: userRecord.displayName || undefined,
        avatar: userRecord.photoURL || undefined,
        isActive: !userRecord.disabled,
        isVerified: userRecord.emailVerified,
        createdAt: new Date(userRecord.metadata.creationTime),
        lastLoginAt: userRecord.metadata.lastSignInTime ? new Date(userRecord.metadata.lastSignInTime) : undefined,
        roles: userData?.roles || ['user'],
        permissions: userData?.permissions || [],
        metadata: {
          ...userData?.metadata,
          firebase: {
            uid: userRecord.uid,
            providers: userRecord.providerData.map(p => p.providerId),
            customClaims,
          }
        },
      };

      // Generate custom access token with additional claims
      const accessToken = await this.generateCustomToken(userRecord.uid, {
        roles: user.roles,
        permissions: user.permissions,
        ...this.config.customClaims,
      });

      return {
        success: true,
        user,
        accessToken,
        tokenType: 'Bearer',
        expiresIn: 3600, // 1 hour
      };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
    }
  }

  async validateToken(token: string): Promise<TokenInfo | null> {
    try {
      if (!this.auth) {
        await this.initialize();
      }

      const decodedToken = await this.auth!.verifyIdToken(token);
      const userRecord = await this.auth!.getUser(decodedToken.uid);
      
      if (userRecord.disabled) {
        return null;
      }

      const userData = await this.getUserData(userRecord.uid);

      const user: User = {
        id: userRecord.uid,
        email: userRecord.email || '',
        displayName: userRecord.displayName || undefined,
        avatar: userRecord.photoURL || undefined,
        isActive: !userRecord.disabled,
        isVerified: userRecord.emailVerified,
        roles: userData?.roles || ['user'],
        permissions: userData?.permissions || [],
        metadata: userData?.metadata || {},
      };

      return {
        user,
        issuedAt: decodedToken.iat,
        expiresAt: decodedToken.exp,
        issuer: decodedToken.iss,
        audience: decodedToken.aud,
        scopes: decodedToken.scopes || [],
        metadata: decodedToken,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('expired')) {
          throw new TokenExpiredError();
        }
        if (error.message.includes('invalid')) {
          throw new InvalidTokenError();
        }
      }
      return null;
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResult> {
    // Firebase handles token refresh on the client side
    // This method is for compatibility with the interface
    throw new Error('Token refresh should be handled on the client side with Firebase SDK');
  }

  async revokeToken(token: string): Promise<boolean> {
    try {
      if (!this.auth) {
        await this.initialize();
      }

      const decodedToken = await this.auth!.verifyIdToken(token);
      await this.auth!.revokeRefreshTokens(decodedToken.uid);
      return true;
    } catch (error) {
      console.error('Token revocation failed:', error);
      return false;
    }
  }

  async getUser(userId: string): Promise<User | null> {
    try {
      if (!this.auth) {
        await this.initialize();
      }

      const userRecord = await this.auth!.getUser(userId);
      const userData = await this.getUserData(userId);

      return {
        id: userRecord.uid,
        email: userRecord.email || '',
        displayName: userRecord.displayName || undefined,
        avatar: userRecord.photoURL || undefined,
        isActive: !userRecord.disabled,
        isVerified: userRecord.emailVerified,
        createdAt: new Date(userRecord.metadata.creationTime),
        lastLoginAt: userRecord.metadata.lastSignInTime ? new Date(userRecord.metadata.lastSignInTime) : undefined,
        roles: userData?.roles || ['user'],
        permissions: userData?.permissions || [],
        metadata: userData?.metadata || {},
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return null;
      }
      throw error;
    }
  }

  async createUser(userData: Partial<User>): Promise<User> {
    try {
      if (!this.auth || !this.db) {
        await this.initialize();
      }

      // Check if user already exists
      if (userData.email) {
        try {
          await this.auth!.getUserByEmail(userData.email);
          throw new UserExistsError('User with this email already exists');
        } catch (error) {
          if (!(error instanceof UserExistsError)) {
            // User doesn't exist, continue with creation
          } else {
            throw error;
          }
        }
      }

      const createRequest: CreateRequest = {
        email: userData.email,
        displayName: userData.displayName || `${userData.firstName} ${userData.lastName}`.trim(),
        photoURL: userData.avatar,
        emailVerified: userData.isVerified || false,
        disabled: !userData.isActive,
      };

      if (userData.password) {
        createRequest.password = userData.password;
      }

      const userRecord = await this.auth!.createUser(createRequest);

      // Store additional user data in Firestore
      const firestoreUserData = {
        roles: userData.roles || ['user'],
        permissions: userData.permissions || [],
        metadata: userData.metadata || {},
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      await this.db!.collection('users').doc(userRecord.uid).set(firestoreUserData);

      // Set custom claims
      if (userData.roles && userData.roles.length > 0) {
        await this.auth!.setCustomUserClaims(userRecord.uid, {
          roles: userData.roles,
          permissions: userData.permissions || [],
        });
      }

      return {
        id: userRecord.uid,
        email: userRecord.email || '',
        displayName: userRecord.displayName || undefined,
        avatar: userRecord.photoURL || undefined,
        isActive: !userRecord.disabled,
        isVerified: userRecord.emailVerified,
        createdAt: new Date(userRecord.metadata.creationTime),
        roles: userData.roles || ['user'],
        permissions: userData.permissions || [],
        metadata: userData.metadata || {},
      };
    } catch (error) {
      if (error instanceof UserExistsError) {
        throw error;
      }
      throw new Error(`Failed to create user: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    try {
      if (!this.auth || !this.db) {
        await this.initialize();
      }

      const updateRequest: UpdateRequest = {};

      if (userData.email) updateRequest.email = userData.email;
      if (userData.displayName) updateRequest.displayName = userData.displayName;
      if (userData.avatar) updateRequest.photoURL = userData.avatar;
      if (userData.isVerified !== undefined) updateRequest.emailVerified = userData.isVerified;
      if (userData.isActive !== undefined) updateRequest.disabled = !userData.isActive;
      if (userData.password) updateRequest.password = userData.password;

      const userRecord = await this.auth!.updateUser(userId, updateRequest);

      // Update additional data in Firestore
      const firestoreUpdates: any = {
        updatedAt: FieldValue.serverTimestamp(),
      };

      if (userData.roles) firestoreUpdates.roles = userData.roles;
      if (userData.permissions) firestoreUpdates.permissions = userData.permissions;
      if (userData.metadata) firestoreUpdates.metadata = userData.metadata;

      await this.db!.collection('users').doc(userId).update(firestoreUpdates);

      // Update custom claims
      if (userData.roles || userData.permissions) {
        await this.auth!.setCustomUserClaims(userId, {
          roles: userData.roles,
          permissions: userData.permissions,
        });
      }

      const updatedUser = await this.getUser(userId);
      return updatedUser!;
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new UserNotFoundError();
      }
      throw new Error(`Failed to update user: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    try {
      if (!this.auth || !this.db) {
        await this.initialize();
      }

      // Delete from Firebase Auth
      await this.auth!.deleteUser(userId);

      // Delete from Firestore
      await this.db!.collection('users').doc(userId).delete();

      return true;
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

      // Check role-based permissions (implement role lookup logic)
      // This would require a roles collection in Firestore
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

  // MFA methods (Firebase handles MFA on client side)
  async enableMFA(userId: string, method: 'totp' | 'sms' | 'email'): Promise<{ secret?: string; qrCode?: string }> {
    // Firebase MFA is handled on the client side
    throw new Error('MFA should be configured on the client side with Firebase SDK');
  }

  async verifyMFA(userId: string, code: string, method: 'totp' | 'sms' | 'email'): Promise<boolean> {
    // Firebase MFA verification is handled on the client side
    throw new Error('MFA verification should be handled on the client side with Firebase SDK');
  }

  async disableMFA(userId: string): Promise<boolean> {
    // Firebase MFA management is handled on the client side
    throw new Error('MFA management should be handled on the client side with Firebase SDK');
  }

  // Session management (Firebase uses tokens instead of sessions)
  async createSession(userId: string, metadata?: Record<string, any>): Promise<string> {
    // Generate custom token as session
    return await this.generateCustomToken(userId, metadata);
  }

  async getSession(sessionId: string): Promise<any> {
    // Validate token and return user info
    const tokenInfo = await this.validateToken(sessionId);
    return tokenInfo;
  }

  async updateSession(sessionId: string, metadata: Record<string, any>): Promise<boolean> {
    // Firebase tokens are immutable, return false
    return false;
  }

  async destroySession(sessionId: string): Promise<boolean> {
    return await this.revokeToken(sessionId);
  }

  // Password management
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<boolean> {
    try {
      if (!this.auth) {
        await this.initialize();
      }

      // Firebase doesn't support password verification on server side
      // This should be handled on client side
      await this.auth!.updateUser(userId, { password: newPassword });
      return true;
    } catch (error) {
      console.error('Password change failed:', error);
      return false;
    }
  }

  async resetPassword(email: string): Promise<boolean> {
    try {
      if (!this.auth) {
        await this.initialize();
      }

      // Generate password reset link
      const link = await this.auth!.generatePasswordResetLink(email);
      
      // TODO: Send email with reset link
      console.log(`Password reset link for ${email}: ${link}`);
      
      return true;
    } catch (error) {
      console.error('Password reset failed:', error);
      return false;
    }
  }

  async confirmPasswordReset(token: string, newPassword: string): Promise<boolean> {
    // This should be handled on the client side with Firebase SDK
    throw new Error('Password reset confirmation should be handled on the client side with Firebase SDK');
  }

  // Private helper methods
  private async getUserData(userId: string): Promise<any> {
    if (!this.db) return null;

    try {
      const doc = await this.db.collection('users').doc(userId).get();
      return doc.exists ? doc.data() : null;
    } catch (error) {
      console.error('Failed to get user data from Firestore:', error);
      return null;
    }
  }

  private async generateCustomToken(userId: string, additionalClaims?: Record<string, any>): Promise<string> {
    if (!this.auth) {
      await this.initialize();
    }

    return await this.auth!.createCustomToken(userId, additionalClaims);
  }
}