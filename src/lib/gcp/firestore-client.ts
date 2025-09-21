/**
 * Firestore Client Configuration for Frontend
 * Handles client-side Firebase initialization and authentication
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  sendPasswordResetEmail,
  confirmPasswordReset,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { 
  getFirestore, 
  Firestore,
  connectFirestoreEmulator,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore';
import { 
  getStorage, 
  Storage,
  connectStorageEmulator 
} from 'firebase/storage';

// Firebase configuration interface
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

// Client-side Firebase service
export class FirebaseClientService {
  private static instance: FirebaseClientService;
  private app: FirebaseApp | null = null;
  private auth: Auth | null = null;
  private db: Firestore | null = null;
  private storage: Storage | null = null;
  private config: FirebaseConfig | null = null;

  private constructor() {}

  static getInstance(): FirebaseClientService {
    if (!FirebaseClientService.instance) {
      FirebaseClientService.instance = new FirebaseClientService();
    }
    return FirebaseClientService.instance;
  }

  initialize(config: FirebaseConfig): void {
    try {
      this.config = config;

      // Check if Firebase app is already initialized
      const existingApps = getApps();
      
      if (existingApps.length > 0) {
        this.app = existingApps[0];
      } else {
        this.app = initializeApp(config);
      }

      // Initialize services
      this.auth = getAuth(this.app);
      this.db = getFirestore(this.app);
      this.storage = getStorage(this.app);

      // Connect to emulators in development
      if (process.env.NODE_ENV === 'development') {
        this.connectToEmulators();
      }

      console.log('Firebase client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Firebase client:', error);
      throw error;
    }
  }

  private connectToEmulators(): void {
    try {
      // Connect to Firestore emulator
      if (this.db && !this.db._delegate._databaseId.database.includes('(default)')) {
        connectFirestoreEmulator(this.db, 'localhost', 8080);
      }

      // Connect to Storage emulator
      if (this.storage) {
        connectStorageEmulator(this.storage, 'localhost', 9199);
      }

      console.log('Connected to Firebase emulators');
    } catch (error) {
      console.warn('Failed to connect to emulators (they may already be connected):', error);
    }
  }

  // Authentication methods
  async signInWithEmail(email: string, password: string): Promise<FirebaseUser> {
    if (!this.auth) throw new Error('Firebase Auth not initialized');
    
    const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
    return userCredential.user;
  }

  async signUpWithEmail(email: string, password: string): Promise<FirebaseUser> {
    if (!this.auth) throw new Error('Firebase Auth not initialized');
    
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    return userCredential.user;
  }

  async signInWithGoogle(): Promise<FirebaseUser> {
    if (!this.auth) throw new Error('Firebase Auth not initialized');
    
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    
    const userCredential = await signInWithPopup(this.auth, provider);
    return userCredential.user;
  }

  async signInWithGitHub(): Promise<FirebaseUser> {
    if (!this.auth) throw new Error('Firebase Auth not initialized');
    
    const provider = new GithubAuthProvider();
    provider.addScope('user:email');
    
    const userCredential = await signInWithPopup(this.auth, provider);
    return userCredential.user;
  }

  async signOut(): Promise<void> {
    if (!this.auth) throw new Error('Firebase Auth not initialized');
    
    await signOut(this.auth);
  }

  async sendPasswordReset(email: string): Promise<void> {
    if (!this.auth) throw new Error('Firebase Auth not initialized');
    
    await sendPasswordResetEmail(this.auth, email);
  }

  async confirmPasswordReset(code: string, newPassword: string): Promise<void> {
    if (!this.auth) throw new Error('Firebase Auth not initialized');
    
    await confirmPasswordReset(this.auth, code, newPassword);
  }

  async updateUserProfile(displayName?: string, photoURL?: string): Promise<void> {
    if (!this.auth?.currentUser) throw new Error('No authenticated user');
    
    await updateProfile(this.auth.currentUser, {
      displayName: displayName || undefined,
      photoURL: photoURL || undefined,
    });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (!this.auth?.currentUser) throw new Error('No authenticated user');
    
    const user = this.auth.currentUser;
    
    // Re-authenticate user before changing password
    const credential = EmailAuthProvider.credential(user.email!, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    // Update password
    await updatePassword(user, newPassword);
  }

  // Auth state observer
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    if (!this.auth) throw new Error('Firebase Auth not initialized');
    
    return onAuthStateChanged(this.auth, callback);
  }

  // Get current user
  getCurrentUser(): FirebaseUser | null {
    return this.auth?.currentUser || null;
  }

  // Get ID token
  async getIdToken(forceRefresh: boolean = false): Promise<string | null> {
    const user = this.getCurrentUser();
    if (!user) return null;
    
    return await user.getIdToken(forceRefresh);
  }

  // Firestore methods
  getFirestore(): Firestore {
    if (!this.db) throw new Error('Firestore not initialized');
    return this.db;
  }

  // Storage methods
  getStorage(): Storage {
    if (!this.storage) throw new Error('Firebase Storage not initialized');
    return this.storage;
  }

  // Network management
  async enableOfflineSupport(): Promise<void> {
    if (!this.db) throw new Error('Firestore not initialized');
    await enableNetwork(this.db);
  }

  async disableOfflineSupport(): Promise<void> {
    if (!this.db) throw new Error('Firestore not initialized');
    await disableNetwork(this.db);
  }

  // Utility methods
  isInitialized(): boolean {
    return this.app !== null && this.auth !== null && this.db !== null;
  }

  getConfig(): FirebaseConfig | null {
    return this.config;
  }
}

// Singleton access
export const firebaseClient = FirebaseClientService.getInstance();

// React hook for Firebase auth state (import React in your components)
export function useFirebaseAuth() {
  // Note: Import useState and useEffect from 'react' in your components
  // This is a utility function - implement the hook in your React components
  return {
    user: firebaseClient.getCurrentUser(),
    loading: false,
  };
}

// Default Firebase configuration (replace with your actual config)
export const defaultFirebaseConfig: FirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Auto-initialize if config is available
if (typeof window !== 'undefined' && defaultFirebaseConfig.apiKey) {
  firebaseClient.initialize(defaultFirebaseConfig);
}