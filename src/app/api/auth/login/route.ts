import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';
import { loginSchema } from '@/lib/validation/schemas';
import { userRepository } from '@/lib/database/repositories/user-repository';
import { generateToken } from '@/lib/auth';
import { handleApiError, ValidationError, AuthError, logError } from '@/lib/errors/error-handler';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationError('Invalid input data', validationResult.error.errors);
    }

    const { email, password } = validationResult.data;

    // Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AuthError('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AuthError('Account is deactivated');
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      throw new AuthError('Invalid credentials');
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Set secure cookie
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60, // 24 hours
    });

    // Return user data (without password)
    const { passwordHash, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword,
    });

  } catch (error) {
    logError(error, 'POST /api/auth/login');
    return handleApiError(error);
  }
}
