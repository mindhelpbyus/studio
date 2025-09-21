import { verifyToken, generateToken, AuthError } from '../auth';
import jwt from 'jsonwebtoken';

// Mock environment variable
const mockJwtSecret = 'test-jwt-secret-for-testing-purposes-only';
process.env.JWT_SECRET = mockJwtSecret;

describe('Auth Utils', () => {
  const mockUser = {
    id: '123',
    email: 'test@example.com',
    role: 'patient' as const,
  };

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(mockUser);
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include user data in token payload', () => {
      const token = generateToken(mockUser);
      const decoded = jwt.verify(token, mockJwtSecret) as any;
      
      expect(decoded.userId).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.role).toBe(mockUser.role);
      expect(decoded.iss).toBe('vivale-app');
      expect(decoded.aud).toBe('vivale-users');
    });

    it('should throw error when JWT_SECRET is not set', () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      expect(() => generateToken(mockUser)).toThrow(AuthError);
      expect(() => generateToken(mockUser)).toThrow('JWT_SECRET not configured');

      process.env.JWT_SECRET = originalSecret;
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', async () => {
      const token = generateToken(mockUser);
      const user = await verifyToken(token);
      
      expect(user.id).toBe(mockUser.id);
      expect(user.email).toBe(mockUser.email);
      expect(user.role).toBe(mockUser.role);
    });

    it('should throw AuthError for invalid token', async () => {
      const invalidToken = 'invalid.token.here';
      
      await expect(verifyToken(invalidToken)).rejects.toThrow(AuthError);
      await expect(verifyToken(invalidToken)).rejects.toThrow('Invalid token');
    });

    it('should throw AuthError for expired token', async () => {
      const expiredToken = jwt.sign(
        { userId: mockUser.id, email: mockUser.email, role: mockUser.role },
        mockJwtSecret,
        { expiresIn: '-1h' } // Expired 1 hour ago
      );
      
      await expect(verifyToken(expiredToken)).rejects.toThrow(AuthError);
    });

    it('should throw error when JWT_SECRET is not set', async () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;
      
      const token = 'any.token.here';
      
      await expect(verifyToken(token)).rejects.toThrow(AuthError);
      await expect(verifyToken(token)).rejects.toThrow('JWT_SECRET not configured');

      process.env.JWT_SECRET = originalSecret;
    });
  });

  describe('AuthError', () => {
    it('should create AuthError with default status code', () => {
      const error = new AuthError('Test error');
      
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe('AuthError');
    });

    it('should create AuthError with custom status code', () => {
      const error = new AuthError('Forbidden', 403);
      
      expect(error.message).toBe('Forbidden');
      expect(error.statusCode).toBe(403);
    });
  });
});