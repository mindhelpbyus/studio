import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

export interface User {
  id: string;
  email: string;
  role: 'patient' | 'provider' | 'admin';
}

export interface AuthenticatedRequest extends NextRequest {
  user?: User;
}

export class AuthError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message);
    this.name = 'AuthError';
  }
}

export async function verifyToken(token: string): Promise<User> {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AuthError('JWT_SECRET not configured', 500);
  }

  try {
    const decoded = jwt.verify(token, secret) as any;
    return {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role || 'patient',
    };
  } catch (error) {
    throw new AuthError('Invalid token');
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return null;
    }

    return await verifyToken(token);
  } catch (error) {
    return null;
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthError('Authentication required');
  }
  return user;
}

export async function requireRole(allowedRoles: string[]): Promise<User> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new AuthError('Insufficient permissions', 403);
  }
  return user;
}

export function generateToken(user: User): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AuthError('JWT_SECRET not configured', 500);
  }

  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    }, 
    secret, 
    { 
      expiresIn: '24h',
      issuer: 'nexus-app',
      audience: 'nexus-users'
    }
  );
}