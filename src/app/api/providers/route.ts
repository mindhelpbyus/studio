import { NextResponse } from 'next/server';
import { providersDb } from '@/lib/providers';

export async function GET() {
  try {
    const providers = await providersDb.findAll();
    return NextResponse.json(providers);
  } catch (error) {
    console.error('Error fetching providers:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
