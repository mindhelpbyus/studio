import { User, UserRepository } from '../types';
import { NotFoundError, ConflictError } from '@/lib/errors/error-handler';
import { v4 as uuidv4 } from 'uuid';

// In-memory implementation for now - replace with actual database
class InMemoryUserRepository implements UserRepository {
  private users: Map<string, User> = new Map();
  private emailIndex: Map<string, string> = new Map();

  constructor() {
    // Initialize with some test data
    this.seedData();
  }

  private seedData() {
    const testUsers: User[] = [
      {
        id: '1',
        email: 'patient@example.com',
        passwordHash: '$2b$10$rQZ9QmjlQ8ZvQ8ZvQ8ZvQeJ8ZvQ8ZvQ8ZvQ8ZvQ8ZvQ8ZvQ8ZvQ8Z', // password123
        firstName: 'John',
        lastName: 'Doe',
        role: 'patient',
        isActive: true,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        email: 'provider@example.com',
        passwordHash: '$2b$10$rQZ9QmjlQ8ZvQ8ZvQ8ZvQeJ8ZvQ8ZvQ8ZvQ8ZvQ8ZvQ8ZvQ8ZvQ8Z', // password123
        firstName: 'Dr. Jane',
        lastName: 'Smith',
        role: 'provider',
        isActive: true,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    testUsers.forEach(user => {
      this.users.set(user.id, user);
      this.emailIndex.set(user.email.toLowerCase(), user.id);
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const userId = this.emailIndex.get(email.toLowerCase());
    if (!userId) return null;
    return this.users.get(userId) || null;
  }

  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    // Check if email already exists
    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    const user: User = {
      ...userData,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(user.id, user);
    this.emailIndex.set(user.email.toLowerCase(), user.id);

    return user;
  }

  async update(id: string, updates: Partial<User>): Promise<User> {
    const existingUser = await this.findById(id);
    if (!existingUser) {
      throw new NotFoundError('User');
    }

    // If email is being updated, check for conflicts
    if (updates.email && updates.email !== existingUser.email) {
      const emailExists = await this.findByEmail(updates.email);
      if (emailExists) {
        throw new ConflictError('User with this email already exists');
      }
      
      // Update email index
      this.emailIndex.delete(existingUser.email.toLowerCase());
      this.emailIndex.set(updates.email.toLowerCase(), id);
    }

    const updatedUser: User = {
      ...existingUser,
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date(),
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async delete(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundError('User');
    }

    this.users.delete(id);
    this.emailIndex.delete(user.email.toLowerCase());
  }

  // Additional utility methods
  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async findByRole(role: User['role']): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === role);
  }

  async count(): Promise<number> {
    return this.users.size;
  }

  async exists(id: string): Promise<boolean> {
    return this.users.has(id);
  }

  async emailExists(email: string): Promise<boolean> {
    return this.emailIndex.has(email.toLowerCase());
  }
}

// Export singleton instance
export const userRepository = new InMemoryUserRepository();

// Factory function for dependency injection
export function createUserRepository(): UserRepository {
  return new InMemoryUserRepository();
}