import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const medicationService = {
  async prescribeMedication(recordId: string, medicationData: any, userId: string) {
    // Check for allergies (mock implementation)
    const allergies = await this.checkAllergies(recordId, medicationData.drugName);
    if (allergies.length > 0) {
      throw new Error(`Patient has allergy to ${allergies.join(', ')}`);
    }

    // Check interactions (mock implementation)
    const interactions = await this.checkInteractions(recordId, medicationData.drugName);
    const severeInteractions = interactions.filter(i => i.severity === 'major' || i.severity === 'moderate');

    return {
      id: Math.random().toString(),
      patientRecordId: recordId,
      status: 'active',
      prescribedBy: userId,
      prescriptionDate: new Date(),
      interactionsAlert: severeInteractions.length > 0,
      severeInteractions,
      ...medicationData,
    };
  },

  async getActiveMedications(recordId: string) {
    // Mock active medications
    return [
      {
        id: '1',
        drugName: 'Lisinopril',
        dosage: '10mg',
        frequency: 'once daily',
        startDate: '2024-01-15',
        status: 'active'
      },
      {
        id: '2',
        drugName: 'Metformin',
        dosage: '500mg',
        frequency: 'twice daily',
        startDate: '2024-01-20',
        status: 'active'
      }
    ];
  },

  async getInteractionAlerts(recordId: string) {
    return [
      {
        id: 'alert-1',
        severity: 'moderate',
        message: 'Potential interaction between Lisinopril and Metoprolol',
        drugs: ['Lisinopril', 'Metoprolol'],
        recommendation: 'Monitor blood pressure closely'
      }
    ];
  },

  async checkAllergies(recordId: string, drugName: string): Promise<string[]> {
    // Mock allergy check - in real app would query allergy database
    const dangerousDrugs = ['Penicillin', 'Sulfa'];
    return dangerousDrugs.filter(drug =>
      drugName.toLowerCase().includes(drug.toLowerCase())
    );
  },

  async checkInteractions(recordId: string, drugName: string): Promise<any[]> {
    // Mock interaction check
    const interactions = [];
    if (drugName.toLowerCase().includes('metformin')) {
      interactions.push({
        drug: 'Insulin',
        severity: 'moderate',
        description: 'May increase risk of hypoglycemia'
      });
    }
    if (drugName.toLowerCase().includes('lisinopril')) {
      interactions.push({
        drug: 'NSAIDs',
        severity: 'major',
        description: 'May decrease antihypertensive effect'
      });
    }
    return interactions;
  }
};

const medicationSchema = z.object({
  drugName: z.string().min(1, 'Drug name is required'),
  genericName: z.string().optional(),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  route: z.string().default('oral'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  indication: z.string().optional(),
  instructions: z.string().optional(),
  sideEffects: z.array(z.string()).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const validation = medicationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: validation.error.errors },
        { status: 400 }
      );
    }

    const userId = req.headers.get('x-user-id') || 'doctor-123';

    const medication = await medicationService.prescribeMedication(
      params.id,
      validation.data,
      userId
    );

    return NextResponse.json({
      success: true,
      data: medication,
      message: 'Medication prescribed successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error prescribing medication:', error);

    if (error instanceof Error && error.message.includes('allergy')) {
      return NextResponse.json({
        success: false,
        message: error.message,
        error: 'ALLERGY_CONFLICT'
      }, { status: 400 });
    }

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

    if (action === 'active') {
      const medications = await medicationService.getActiveMedications(params.id);
      return NextResponse.json({ success: true, data: medications });
    }

    if (action === 'alerts') {
      const alerts = await medicationService.getInteractionAlerts(params.id);
      return NextResponse.json({ success: true, data: alerts });
    }

    return NextResponse.json(
      { message: 'Invalid action parameter. Use ?action=active or ?action=alerts' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error getting medication data:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
