import { NextResponse, type NextRequest } from 'next/server';
import { providersDb } from '@/lib/providers';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const provider = await providersDb.findById(params.id);

    if (!provider) {
      return NextResponse.json({ message: 'Provider not found' }, { status: 404 });
    }

    return NextResponse.json(provider);
  } catch (error) {
    console.error(`Error fetching provider ${params.id}:`, error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
