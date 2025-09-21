/**
 * Firestore Database Adapter
 * Implements the DatabaseAdapter interface for Google Cloud Firestore
 */

import { 
  initializeApp, 
  getApps, 
  FirebaseApp,
  cert,
  ServiceAccount 
} from 'firebase-admin/app';
import { 
  getFirestore, 
  Firestore, 
  CollectionReference, 
  DocumentReference,
  Transaction as FirestoreTransaction,
  WriteBatch,
  FieldValue,
  Timestamp,
  Filter
} from 'firebase-admin/firestore';
import {
  DatabaseAdapter,
  DatabaseConfig,
  QueryResult,
  Transaction,
  ConnectionError,
  QueryError,
  TransactionError,
} from '../interfaces';

export class FirestoreAdapter implements DatabaseAdapter {
  private app: FirebaseApp | null = null;
  private db: Firestore | null = null;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      // Check if Firebase app is already initialized
      const existingApps = getApps();
      
      if (existingApps.length > 0) {
        this.app = existingApps[0];
      } else {
        // Initialize Firebase Admin SDK
        const firebaseConfig: any = {
          projectId: this.config.options?.projectId || process.env.FIREBASE_PROJECT_ID,
        };

        // Add service account credentials if provided
        if (this.config.credentials) {
          firebaseConfig.credential = cert(this.config.credentials as ServiceAccount);
        } else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
          const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
          firebaseConfig.credential = cert(serviceAccount);
        }

        this.app = initializeApp(firebaseConfig);
      }

      this.db = getFirestore(this.app);
      
      // Test connection by reading a dummy document
      await this.db.doc('_health/check').get();
      
      console.log('Firestore connection established');
    } catch (error) {
      throw new ConnectionError(
        `Failed to connect to Firestore: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  async disconnect(): Promise<void> {
    if (this.app) {
      await this.app.delete();
      this.app = null;
      this.db = null;
      console.log('Firestore connection closed');
    }
  }

  isConnected(): boolean {
    return this.db !== null;
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this.db) return false;
      
      // Try to read from Firestore
      await this.db.doc('_health/check').get();
      return true;
    } catch (error) {
      return false;
    }
  }

  // SQL operations (not applicable for Firestore, but required by interface)
  async query(sql: string, params?: any[]): Promise<QueryResult> {
    throw new QueryError('SQL queries are not supported in Firestore. Use document operations instead.');
  }

  async execute(sql: string, params?: any[]): Promise<QueryResult> {
    throw new QueryError('SQL execution is not supported in Firestore. Use document operations instead.');
  }

  async transaction<T>(callback: (tx: Transaction) => Promise<T>): Promise<T> {
    if (!this.db) {
      throw new ConnectionError('Firestore not connected');
    }

    try {
      return await this.db.runTransaction(async (firestoreTransaction) => {
        const transaction = new FirestoreTransactionWrapper(firestoreTransaction, this.db!);
        return await callback(transaction);
      });
    } catch (error) {
      throw new TransactionError(
        `Firestore transaction failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  // Document operations
  async findOne(collection: string, filter: any): Promise<any> {
    if (!this.db) {
      throw new ConnectionError('Firestore not connected');
    }

    try {
      const collectionRef = this.db.collection(collection);
      
      if (filter.id) {
        // Direct document lookup by ID
        const doc = await collectionRef.doc(filter.id).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
      }

      // Query by fields
      let query: any = collectionRef;
      
      for (const [field, value] of Object.entries(filter)) {
        if (field !== 'id') {
          query = query.where(field, '==', value);
        }
      }

      const snapshot = await query.limit(1).get();
      
      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new QueryError(
        `Firestore findOne failed: ${error instanceof Error ? error.message : String(error)}`,
        JSON.stringify(filter),
        undefined,
        error instanceof Error ? error : undefined
      );
    }
  }

  async findMany(collection: string, filter: any = {}, options?: any): Promise<any[]> {
    if (!this.db) {
      throw new ConnectionError('Firestore not connected');
    }

    try {
      const collectionRef = this.db.collection(collection);
      let query: any = collectionRef;

      // Apply filters
      for (const [field, value] of Object.entries(filter)) {
        if (field !== 'id') {
          if (Array.isArray(value)) {
            query = query.where(field, 'in', value);
          } else {
            query = query.where(field, '==', value);
          }
        }
      }

      // Apply options
      if (options?.orderBy) {
        for (const order of options.orderBy) {
          query = query.orderBy(order.field, order.direction?.toLowerCase() || 'asc');
        }
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.offset(options.offset);
      }

      const snapshot = await query.get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new QueryError(
        `Firestore findMany failed: ${error instanceof Error ? error.message : String(error)}`,
        JSON.stringify({ collection, filter, options }),
        undefined,
        error instanceof Error ? error : undefined
      );
    }
  }

  async insertOne(collection: string, document: any): Promise<any> {
    if (!this.db) {
      throw new ConnectionError('Firestore not connected');
    }

    try {
      const collectionRef = this.db.collection(collection);
      const docData = { ...document };
      
      // Add timestamps
      docData.createdAt = FieldValue.serverTimestamp();
      docData.updatedAt = FieldValue.serverTimestamp();

      let docRef: DocumentReference;
      
      if (document.id) {
        // Use provided ID
        docRef = collectionRef.doc(document.id);
        delete docData.id;
        await docRef.set(docData);
      } else {
        // Auto-generate ID
        docRef = await collectionRef.add(docData);
      }

      // Return the created document
      const createdDoc = await docRef.get();
      return { id: createdDoc.id, ...createdDoc.data() };
    } catch (error) {
      throw new QueryError(
        `Firestore insertOne failed: ${error instanceof Error ? error.message : String(error)}`,
        JSON.stringify(document),
        undefined,
        error instanceof Error ? error : undefined
      );
    }
  }

  async insertMany(collection: string, documents: any[]): Promise<any[]> {
    if (!this.db) {
      throw new ConnectionError('Firestore not connected');
    }

    try {
      const batch = this.db.batch();
      const collectionRef = this.db.collection(collection);
      const results: any[] = [];

      for (const document of documents) {
        const docData = { ...document };
        docData.createdAt = FieldValue.serverTimestamp();
        docData.updatedAt = FieldValue.serverTimestamp();

        let docRef: DocumentReference;
        
        if (document.id) {
          docRef = collectionRef.doc(document.id);
          delete docData.id;
        } else {
          docRef = collectionRef.doc(); // Auto-generate ID
        }

        batch.set(docRef, docData);
        results.push({ id: docRef.id, ...docData });
      }

      await batch.commit();
      return results;
    } catch (error) {
      throw new QueryError(
        `Firestore insertMany failed: ${error instanceof Error ? error.message : String(error)}`,
        JSON.stringify(documents),
        undefined,
        error instanceof Error ? error : undefined
      );
    }
  }

  async updateOne(collection: string, filter: any, update: any): Promise<any> {
    if (!this.db) {
      throw new ConnectionError('Firestore not connected');
    }

    try {
      const collectionRef = this.db.collection(collection);
      const updateData = { ...update };
      updateData.updatedAt = FieldValue.serverTimestamp();

      if (filter.id) {
        // Direct document update by ID
        const docRef = collectionRef.doc(filter.id);
        await docRef.update(updateData);
        
        const updatedDoc = await docRef.get();
        return updatedDoc.exists ? { id: updatedDoc.id, ...updatedDoc.data() } : null;
      }

      // Find document first, then update
      const existingDoc = await this.findOne(collection, filter);
      if (!existingDoc) {
        return null;
      }

      const docRef = collectionRef.doc(existingDoc.id);
      await docRef.update(updateData);
      
      const updatedDoc = await docRef.get();
      return { id: updatedDoc.id, ...updatedDoc.data() };
    } catch (error) {
      throw new QueryError(
        `Firestore updateOne failed: ${error instanceof Error ? error.message : String(error)}`,
        JSON.stringify({ filter, update }),
        undefined,
        error instanceof Error ? error : undefined
      );
    }
  }

  async updateMany(collection: string, filter: any, update: any): Promise<any> {
    if (!this.db) {
      throw new ConnectionError('Firestore not connected');
    }

    try {
      // Find all matching documents
      const documents = await this.findMany(collection, filter);
      
      if (documents.length === 0) {
        return { modifiedCount: 0 };
      }

      const batch = this.db.batch();
      const collectionRef = this.db.collection(collection);
      const updateData = { ...update };
      updateData.updatedAt = FieldValue.serverTimestamp();

      for (const doc of documents) {
        const docRef = collectionRef.doc(doc.id);
        batch.update(docRef, updateData);
      }

      await batch.commit();
      return { modifiedCount: documents.length };
    } catch (error) {
      throw new QueryError(
        `Firestore updateMany failed: ${error instanceof Error ? error.message : String(error)}`,
        JSON.stringify({ filter, update }),
        undefined,
        error instanceof Error ? error : undefined
      );
    }
  }

  async deleteOne(collection: string, filter: any): Promise<any> {
    if (!this.db) {
      throw new ConnectionError('Firestore not connected');
    }

    try {
      const collectionRef = this.db.collection(collection);

      if (filter.id) {
        // Direct document deletion by ID
        const docRef = collectionRef.doc(filter.id);
        const doc = await docRef.get();
        
        if (!doc.exists) {
          return null;
        }

        const docData = { id: doc.id, ...doc.data() };
        await docRef.delete();
        return docData;
      }

      // Find document first, then delete
      const existingDoc = await this.findOne(collection, filter);
      if (!existingDoc) {
        return null;
      }

      const docRef = collectionRef.doc(existingDoc.id);
      await docRef.delete();
      return existingDoc;
    } catch (error) {
      throw new QueryError(
        `Firestore deleteOne failed: ${error instanceof Error ? error.message : String(error)}`,
        JSON.stringify(filter),
        undefined,
        error instanceof Error ? error : undefined
      );
    }
  }

  async deleteMany(collection: string, filter: any): Promise<any> {
    if (!this.db) {
      throw new ConnectionError('Firestore not connected');
    }

    try {
      // Find all matching documents
      const documents = await this.findMany(collection, filter);
      
      if (documents.length === 0) {
        return { deletedCount: 0 };
      }

      const batch = this.db.batch();
      const collectionRef = this.db.collection(collection);

      for (const doc of documents) {
        const docRef = collectionRef.doc(doc.id);
        batch.delete(docRef);
      }

      await batch.commit();
      return { deletedCount: documents.length };
    } catch (error) {
      throw new QueryError(
        `Firestore deleteMany failed: ${error instanceof Error ? error.message : String(error)}`,
        JSON.stringify(filter),
        undefined,
        error instanceof Error ? error : undefined
      );
    }
  }

  // Firestore-specific methods
  async createIndex(collection: string, fields: string[]): Promise<void> {
    // Firestore indexes are created through the Firebase console or CLI
    // This is a placeholder for documentation purposes
    console.log(`Create composite index for collection '${collection}' with fields: ${fields.join(', ')}`);
    console.log('Note: Firestore indexes must be created through Firebase console or CLI');
  }

  async getCollectionGroup(collectionId: string): Promise<any[]> {
    if (!this.db) {
      throw new ConnectionError('Firestore not connected');
    }

    try {
      const snapshot = await this.db.collectionGroup(collectionId).get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        path: doc.ref.path,
        ...doc.data()
      }));
    } catch (error) {
      throw new QueryError(
        `Firestore collectionGroup query failed: ${error instanceof Error ? error.message : String(error)}`,
        collectionId,
        undefined,
        error instanceof Error ? error : undefined
      );
    }
  }
}

class FirestoreTransactionWrapper implements Transaction {
  constructor(
    private firestoreTransaction: FirestoreTransaction,
    private db: Firestore
  ) {}

  async query(sql: string, params?: any[]): Promise<QueryResult> {
    throw new QueryError('SQL queries are not supported in Firestore transactions');
  }

  async execute(sql: string, params?: any[]): Promise<QueryResult> {
    throw new QueryError('SQL execution is not supported in Firestore transactions');
  }

  async commit(): Promise<void> {
    // Firestore transactions are automatically committed
    console.log('Firestore transaction will be committed automatically');
  }

  async rollback(): Promise<void> {
    // Firestore transactions are automatically rolled back on error
    throw new Error('Manual rollback not supported in Firestore. Throw an error to rollback.');
  }

  async findOne(collection: string, filter: any): Promise<any> {
    const collectionRef = this.db.collection(collection);
    
    if (filter.id) {
      const doc = await this.firestoreTransaction.get(collectionRef.doc(filter.id));
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    }

    // For complex queries in transactions, we need to get the document reference first
    // This is a simplified implementation
    throw new Error('Complex queries in transactions require document references');
  }

  async findMany(collection: string, filter: any, options?: any): Promise<any[]> {
    // Firestore transactions have limitations on queries
    // This is a simplified implementation
    throw new Error('Complex queries in transactions are limited in Firestore');
  }

  async insertOne(collection: string, document: any): Promise<any> {
    const collectionRef = this.db.collection(collection);
    const docData = { ...document };
    
    docData.createdAt = FieldValue.serverTimestamp();
    docData.updatedAt = FieldValue.serverTimestamp();

    let docRef: DocumentReference;
    
    if (document.id) {
      docRef = collectionRef.doc(document.id);
      delete docData.id;
    } else {
      docRef = collectionRef.doc();
    }

    this.firestoreTransaction.set(docRef, docData);
    return { id: docRef.id, ...docData };
  }

  async insertMany(collection: string, documents: any[]): Promise<any[]> {
    const results: any[] = [];
    
    for (const document of documents) {
      const result = await this.insertOne(collection, document);
      results.push(result);
    }
    
    return results;
  }

  async updateOne(collection: string, filter: any, update: any): Promise<any> {
    const collectionRef = this.db.collection(collection);
    const updateData = { ...update };
    updateData.updatedAt = FieldValue.serverTimestamp();

    if (filter.id) {
      const docRef = collectionRef.doc(filter.id);
      this.firestoreTransaction.update(docRef, updateData);
      return { id: filter.id, ...updateData };
    }

    throw new Error('Update operations in transactions require document ID');
  }

  async updateMany(collection: string, filter: any, update: any): Promise<any> {
    throw new Error('Batch updates in transactions are complex in Firestore');
  }

  async deleteOne(collection: string, filter: any): Promise<any> {
    const collectionRef = this.db.collection(collection);

    if (filter.id) {
      const docRef = collectionRef.doc(filter.id);
      this.firestoreTransaction.delete(docRef);
      return { id: filter.id };
    }

    throw new Error('Delete operations in transactions require document ID');
  }

  async deleteMany(collection: string, filter: any): Promise<any> {
    throw new Error('Batch deletes in transactions are complex in Firestore');
  }
}