'use client';

import { VentureHero } from '@/components/ui/venture-hero';
import { VentureDataTable } from '@/components/ui/venture-table';
import { VentureContentCard } from '@/components/ui/venture-card';

export default function TableDemo() {
  const patientColumns = [
    { key: 'id', label: 'Patient ID', width: '120px' },
    { key: 'name', label: 'Name', width: '200px' },
    { key: 'age', label: 'Age', width: '80px' },
    { key: 'condition', label: 'Condition', width: '180px' },
    { key: 'lastVisit', label: 'Last Visit', width: '150px' },
    { key: 'status', label: 'Status', width: '120px' },
  ];

  const patientData = [
    {
      id: 'P-001',
      name: 'John Doe',
      age: '45',
      condition: 'Hypertension',
      lastVisit: '2024-03-15',
      status: 'Active',
    },
    {
      id: 'P-002',
      name: 'Jane Smith',
      age: '32',
      condition: 'Diabetes Type 2',
      lastVisit: '2024-03-14',
      status: 'Active',
    },
    {
      id: 'P-003',
      name: 'Bob Johnson',
      age: '58',
      condition: 'Cardiac Arrhythmia',
      lastVisit: '2024-03-10',
      status: 'Follow-up',
    },
    {
      id: 'P-004',
      name: 'Alice Williams',
      age: '41',
      condition: 'Asthma',
      lastVisit: '2024-03-08',
      status: 'Active',
    },
    {
      id: 'P-005',
      name: 'Charlie Brown',
      age: '67',
      condition: 'Arthritis',
      lastVisit: '2024-03-05',
      status: 'Inactive',
    },
  ];

  const appointmentColumns = [
    { key: 'time', label: 'Time', width: '120px' },
    { key: 'patient', label: 'Patient', width: '200px' },
    { key: 'provider', label: 'Provider', width: '180px' },
    { key: 'type', label: 'Type', width: '150px' },
    { key: 'status', label: 'Status', width: '120px' },
  ];

  const appointmentData = [
    {
      time: '09:00 AM',
      patient: 'John Doe',
      provider: 'Dr. Sarah Smith',
      type: 'Check-up',
      status: 'Confirmed',
    },
    {
      time: '10:00 AM',
      patient: 'Jane Smith',
      provider: 'Dr. Michael Johnson',
      type: 'Follow-up',
      status: 'Confirmed',
    },
    {
      time: '11:00 AM',
      patient: 'Bob Johnson',
      provider: 'Dr. Sarah Smith',
      type: 'Consultation',
      status: 'Pending',
    },
    {
      time: '02:00 PM',
      patient: 'Alice Williams',
      provider: 'Dr. Emily Williams',
      type: 'Annual Physical',
      status: 'Confirmed',
    },
  ];

  const medicationColumns = [
    { key: 'medication', label: 'Medication', width: '200px' },
    { key: 'dosage', label: 'Dosage', width: '120px' },
    { key: 'frequency', label: 'Frequency', width: '150px' },
    { key: 'prescribedBy', label: 'Prescribed By', width: '180px' },
    { key: 'startDate', label: 'Start Date', width: '120px' },
  ];

  const medicationData = [
    {
      medication: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      prescribedBy: 'Dr. Sarah Smith',
      startDate: '2024-01-15',
    },
    {
      medication: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      prescribedBy: 'Dr. Michael Johnson',
      startDate: '2024-02-01',
    },
    {
      medication: 'Atorvastatin',
      dosage: '20mg',
      frequency: 'Once daily',
      prescribedBy: 'Dr. Sarah Smith',
      startDate: '2024-01-20',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <VentureHero
        title="Table Demo"
        subtitle="Data Tables"
        description="Comprehensive data table components for displaying structured information with sorting, filtering, and actions. Built with semantic color tokens for consistent theming."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
        <div className="space-y-8">
          {/* Patient Records Table */}
          <VentureDataTable
            title="Patient Records"
            description="View and manage patient information"
            columns={patientColumns}
            data={patientData}
            actions={
              <>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                  Add Patient
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium">
                  Export
                </button>
              </>
            }
          />

          {/* Appointments Table */}
          <VentureDataTable
            title="Today's Appointments"
            description="Scheduled appointments for March 15, 2024"
            columns={appointmentColumns}
            data={appointmentData}
            actions={
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                Schedule New
              </button>
            }
          />

          {/* Medications Table */}
          <VentureDataTable
            title="Active Medications"
            description="Current prescriptions for patient"
            columns={medicationColumns}
            data={medicationData}
            actions={
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                Add Medication
              </button>
            }
          />

          {/* Simple Table in Card */}
          <VentureContentCard>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Lab Results</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-Color-Tokens-Border-Secondary">
                    <th className="px-4 py-3 text-left text-Color-Tokens-Content-Dark-Primary text-sm font-medium">
                      Test Name
                    </th>
                    <th className="px-4 py-3 text-left text-Color-Tokens-Content-Dark-Primary text-sm font-medium">
                      Result
                    </th>
                    <th className="px-4 py-3 text-left text-Color-Tokens-Content-Dark-Primary text-sm font-medium">
                      Range
                    </th>
                    <th className="px-4 py-3 text-left text-Color-Tokens-Content-Dark-Primary text-sm font-medium">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-Color-Tokens-Border-Secondary hover:bg-Color-Tokens-Interaction-Secondary-Hover">
                    <td className="px-4 py-3 text-sm">Blood Glucose</td>
                    <td className="px-4 py-3 text-sm">95 mg/dL</td>
                    <td className="px-4 py-3 text-sm">70-100 mg/dL</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Normal
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-Color-Tokens-Border-Secondary hover:bg-Color-Tokens-Interaction-Secondary-Hover">
                    <td className="px-4 py-3 text-sm">Cholesterol</td>
                    <td className="px-4 py-3 text-sm">185 mg/dL</td>
                    <td className="px-4 py-3 text-sm">&lt;200 mg/dL</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Normal
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-Color-Tokens-Interaction-Secondary-Hover">
                    <td className="px-4 py-3 text-sm">Blood Pressure</td>
                    <td className="px-4 py-3 text-sm">145/92 mmHg</td>
                    <td className="px-4 py-3 text-sm">&lt;120/80 mmHg</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Elevated
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </VentureContentCard>
        </div>
      </div>
    </div>
  );
}
