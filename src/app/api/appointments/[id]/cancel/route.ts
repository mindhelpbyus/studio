import { NextResponse, type NextRequest } from 'next/server';
import { appointmentsDb } from '@/lib/appointments';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const success = await appointmentsDb.cancelAppointment(params.id);

    if (!success) {
      return NextResponse.json({ message: 'Appointment not found or already cancelled' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error(`Error cancelling appointment ${params.id}:`, error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
