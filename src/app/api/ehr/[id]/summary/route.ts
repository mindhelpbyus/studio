import { NextRequest, NextResponse } from 'next/server';

// Mock EHR data for demonstration
const ehrService = {
  async getPatientSummary(patientId: string) {
    return {
      patientId,
      status: 'active',
      lastUpdated: new Date().toISOString(),
      activeProblems: 3,
      activeMedications: 2,
      allergies: 1,
      recentVitals: {
        bpSystolic: 140,
        bpDiastolic: 85,
        heartRate: 72,
        recordedAt: new Date().toISOString()
      },
      upcomingAppointments: 1,
      alerts: [
        {
          id: '1',
          type: 'vitals',
          severity: 'critical',
          message: 'Blood pressure critically high (140/85)',
          date: new Date().toISOString(),
          actionable: true
        },
        {
          id: '2',
          type: 'medication',
          severity: 'moderate',
          message: 'Drug interaction: Lisinopril with NSAID use',
          date: new Date().toISOString(),
          actionable: true
        }
      ]
    };
  },

  async getCompleteRecord(patientId: string) {
    return {
      id: `ehr-${patientId}`,
      patientId,
      status: 'active',
      medicalHistory: {
        id: 'hist-1',
        chiefComplaint: 'Hypertension management',
        historyOfPresentIllness: 'Patient presents with elevated blood pressure readings...',
        pastMedicalHistory: 'Hypertension (diagnosed 2 years ago), Type 2 Diabetes',
        surgicalHistory: 'Appendectomy (2015)',
        familyHistory: 'Mother: Hypertension, Father: Heart disease',
        medications: [
          { drugName: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' },
          { drugName: 'Metformin', dosage: '500mg', frequency: 'Twice daily' }
        ]
      },
      vitals: [
        {
          id: 'v1',
          bpSystolic: 140,
          bpDiastolic: 85,
          heartRate: 72,
          temperature: 36.8,
          recordedAt: new Date().toISOString()
        }
      ],
      allergies: [
        {
          id: 'a1',
          allergen: 'Penicillin',
          reaction: 'Rash',
          severity: 'moderate'
        }
      ],
      diagnoses: [
        {
          id: 'd1',
          diagnosisCode: 'I10',
          description: 'Essential hypertension',
          severity: 'chronic',
          status: 'active'
        }
      ]
    };
  }
};

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    if (type === 'complete') {
      const record = await ehrService.getCompleteRecord(params.id);
      return NextResponse.json({
        success: true,
        data: record,
        message: 'Complete EHR retrieved successfully'
      });
    }

    // Default to summary
    const summary = await ehrService.getPatientSummary(params.id);
    return NextResponse.json({
      success: true,
      data: summary,
      message: 'Patient summary retrieved successfully'
    });

  } catch (error) {
    console.error('Error getting EHR summary:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
