import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '@/lib/auth';
import { userRepository } from '@/lib/database/repositories/user-repository';
import { handleApiError, ValidationError, ConflictError, logError } from '@/lib/errors/error-handler';
import { registerSchema } from '@/lib/validation/schemas';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationError('Invalid input data', validationResult.error.errors);
    }

    const { email, password, firstName, lastName, role } = validationResult.data;

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await userRepository.create({
      email,
      passwordHash,
      firstName,
      lastName,
      role,
      isActive: true,
      emailVerified: false, // In production, send verification email
    });

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
    const { passwordHash: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: userWithoutPassword,
    }, { status: 201 });

  } catch (error) {
    logError(error, 'POST /api/auth/register');
    return handleApiError(error);
  }
}