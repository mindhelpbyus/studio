import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AuthError } from '@/lib/auth';

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor() {
    super('Too many requests', 429, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
  }
}

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);

  // Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      },
      { status: 400 }
    );
  }

  // Authentication errors
  if (error instanceof AuthError) {
    return NextResponse.json(
      {
        error: error.message,
        code: 'AUTH_ERROR',
      },
      { status: error.statusCode }
    );
  }

  // Application errors
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
      },
      { status: error.statusCode }
    );
  }

  // Database errors
  if (error instanceof Error && error.message.includes('UNIQUE constraint')) {
    return NextResponse.json(
      {
        error: 'Resource already exists',
        code: 'DUPLICATE_RESOURCE',
      },
      { status: 409 }
    );
  }

  // Generic errors
  return NextResponse.json(
    {
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      ...(process.env.NODE_ENV === 'development' && {
        details: error instanceof Error ? error.message : String(error),
      }),
    },
    { status: 500 }
  );
}

export function createErrorResponse(
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: any
) {
  return NextResponse.json(
    {
      error: message,
      code,
      details,
    },
    { status: statusCode }
  );
}

// Error logging utility
export function logError(error: unknown, context?: string) {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    context,
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error,
  };

  console.error('Application Error:', JSON.stringify(errorInfo, null, 2));

  // In production, you would send this to your logging service
  // e.g., Sentry, DataDog, CloudWatch, etc.
}