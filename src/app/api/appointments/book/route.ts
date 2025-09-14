import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { appointmentsDb } from '@/lib/appointments';

const bookingSchema = z.object({
  providerId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  time: z.string(),
  patientName: z.string().min(1, 'Patient name is required'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = bookingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid input', errors: validation.error.errors }, { status: 400 });
    }

    const { providerId, date, time, patientName } = validation.data;
    
    // In a real app, you would check for user authentication here

    const newAppointment = await appointmentsDb.bookAppointment({
      providerId,
      date,
      time,
      patientName,
    });
    
    if (!newAppointment) {
        return NextResponse.json({ message: 'Time slot not available' }, { status: 409 });
    }

    return NextResponse.json({ message: 'Appointment booked successfully', appointment: newAppointment }, { status: 201 });

  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
