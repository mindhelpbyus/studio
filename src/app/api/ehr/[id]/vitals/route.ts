import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Basic EHR service instances (would be properly injected in a real app)
const vitalsService = {
  async recordVitalSigns(recordId: string, vitalsData: any, userId: string) {
    // Basic implementation - in reality would use the full use case classes
    return {
      id: Math.random().toString(),
      patientRecordId: recordId,
      ...vitalsData,
      recordedBy: userId,
      recordedAt: new Date(),
    };
  },

  async getVitalTrends(recordId: string, vitalType: string, days: number) {
    // Mock data for demonstration
    const trends = [];
    const now = new Date();
    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      trends.push({
        date: date.toISOString().split('T')[0],
        value: Math.random() * 100 + (vitalType === 'heartRate' ? 60 : 0),
      });
    }
    return trends;
  },

  async getVitalAlerts(recordId: string) {
    // Mock critical alerts
    return [
      {
        id: '1',
        type: 'vitals',
        severity: 'critical',
        message: 'Blood pressure critically high',
        date: new Date().toISOString(),
      }
    ];
  }
};

const vitalsSchema = z.object({
  bpSystolic: z.number().min(80).max(250),
  bpDiastolic: z.number().min(50).max(150),
  heartRate: z.number().min(30).max(200),
  temperature: z.number().min(35).max(45),
  temperatureUnit: z.enum(['C', 'F']).optional(),
  respiratoryRate: z.number().min(8).max(60),
  oxygenSaturation: z.number().min(70).max(100),
  weight: z.number().min(20).max(300),
  height: z.number().min(50).max(250),
  notes: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const validation = vitalsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: validation.error.errors },
        { status: 400 }
      );
    }

    // Mock user authentication - in real app would use auth middleware
    const userId = req.headers.get('x-user-id') || 'doctor-123';

    const vitals = await vitalsService.recordVitalSigns(
      params.id,
      validation.data,
      userId
    );

    return NextResponse.json({
      success: true,
      data: vitals,
      message: 'Vital signs recorded successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error recording vital signs:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const vitalType = searchParams.get('vitalType');
    const days = parseInt(searchParams.get('days') || '30');

    if (action === 'trends' && vitalType) {
      const trends = await vitalsService.getVitalTrends(params.id, vitalType, days);
      return NextResponse.json({ success: true, data: trends });
    }

    if (action === 'alerts') {
      const alerts = await vitalsService.getVitalAlerts(params.id);
      return NextResponse.json({ success: true, data: alerts });
    }

    return NextResponse.json(
      { message: 'Invalid action parameter' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error getting vital data:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
