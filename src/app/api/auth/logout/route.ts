import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { handleApiError, logError } from '@/lib/errors/error-handler';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // Clear the authentication cookie
    cookieStore.delete('token');

    return NextResponse.json({
      success: true,
      message: 'Logout successful',
    });

  } catch (error) {
    logError(error, 'POST /api/auth/logout');
    return handleApiError(error);
  }
}