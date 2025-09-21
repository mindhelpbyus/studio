import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, AuthError } from '@/lib/auth';

export async function withAuth(
  request: NextRequest,
  handler: (req: NextRequest & { user: any }) => Promise<NextResponse>
) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    
    // Add user to request object
    const authenticatedRequest = request as NextRequest & { user: any };
    authenticatedRequest.user = user;

    return await handler(authenticatedRequest);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message }, 
        { status: error.statusCode }
      );
    }
    
    console.error('Authentication middleware error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function withRole(
  allowedRoles: string[],
  request: NextRequest,
  handler: (req: NextRequest & { user: any }) => Promise<NextResponse>
) {
  return withAuth(request, async (req) => {
    if (!allowedRoles.includes(req.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' }, 
        { status: 403 }
      );
    }
    
    return await handler(req);
  });
}