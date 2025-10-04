'use client';

import { useState, useEffect } from 'react';

interface PatientSummary {
  patientId: string;
  status: 'active' | 'inactive' | 'archived';
  lastUpdated: string;
  activeProblems: number;
  activeMedications: number;
  allergies: number;
  recentVitals: {
    bpSystolic: number;
    bpDiastolic: number;
    heartRate: number;
    recordedAt: string;
  };
  upcomingAppointments: number;
  alerts: Array<{
    id: string;
    type: 'vitals' | 'medication';
    severity: 'critical' | 'moderate' | 'mild';
    message: string;
    date: string;
    actionable: boolean;
  }>;
}

interface VitalSigns {
  id: string;
  patientRecordId: string;
  bpSystolic: number;
  bpDiastolic: number;
  heartRate: number;
  temperature: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  weight: number;
  height: number;
  recordedBy: string;
  recordedAt: string;
}

export default function EHRDemo() {
  const [summaryData, setSummaryData] = useState<PatientSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');
  const [vitalForm, setVitalForm] = useState({
    bpSystolic: '',
    bpDiastolic: '',
    heartRate: '',
    temperature: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    weight: '',
    height: ''
  });

  const patientId = 'patient-123';

  useEffect(() => {
    loadPatientSummary();
  }, []);

  const loadPatientSummary = async () => {
    try {
      const response = await fetch(`/api/ehr/${patientId}/summary`);
      const data = await response.json();
      if (data.success) {
        setSummaryData(data.data);
      }
    } catch (error) {
      console.error('Error loading patient summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVitalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const vitalsData = Object.fromEntries(
      Object.entries(vitalForm).map(([key, value]) => [key, parseFloat(value)])
    );

    try {
      const response = await fetch(`/api/ehr/${patientId}/vitals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vitalsData),
      });

      const data = await response.json();

      if (data.success) {
        alert('Vital signs recorded successfully!');
        // Reset form and reload data
        setVitalForm({
          bpSystolic: '',
          bpDiastolic: '',
          heartRate: '',
          temperature: '',
          respiratoryRate: '',
          oxygenSaturation: '',
          weight: '',
          height: ''
        });
        loadPatientSummary();
      } else {
        alert('Error: ' + JSON.stringify(data.errors, null, 2));
      }
    } catch (error) {
      console.error('Error recording vitals:', error);
      alert('Failed to record vital signs');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Electronic Health Records (EHR) Demo</h1>
          <div className="text-center py-12">Loading patient data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🏥 Electronic Health Records (EHR) System</h1>
          <p className="text-gray-600">Complete healthcare record management with clinical decision support</p>
          <div className="mt-4 text-sm text-gray-500">
            Patient ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{patientId}</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { id: 'summary', label: 'Patient Summary', icon: '📊' },
                { id: 'vitals', label: 'Record Vitals', icon: '❤️' },
                { id: 'alerts', label: 'Clinical Alerts', icon: '🚨' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {/* Patient Summary Tab */}
          {activeTab === 'summary' && summaryData && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Patient Clinical Summary</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{summaryData.activeProblems}</div>
                  <div className="text-sm text-gray-600">Active Problems</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{summaryData.activeMedications}</div>
                  <div className="text-sm text-gray-600">Active Medications</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{summaryData.allergies}</div>
                  <div className="text-sm text-gray-600">Known Allergies</div>
                </div>
              </div>

              {/* Recent Vitals */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Vital Signs</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Blood Pressure</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {summaryData.recentVitals.bpSystolic}/{summaryData.recentVitals.bpDiastolic} mmHg
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Heart Rate</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {summaryData.recentVitals.heartRate} bpm
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Status</div>
                      <div className="text-lg font-semibold text-green-600">{summaryData.status}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Last Updated</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {new Date(summaryData.lastUpdated).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Vital Signs Form Tab */}
          {activeTab === 'vitals' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Record Vital Signs</h2>

              <form onSubmit={handleVitalSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blood Pressure (mmHg)
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        placeholder="Systolic"
                        value={vitalForm.bpSystolic}
                        onChange={(e) => setVitalForm({ ...vitalForm, bpSystolic: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <span className="flex items-center text-gray-500">/</span>
                      <input
                        type="number"
                        placeholder="Diastolic"
                        value={vitalForm.bpDiastolic}
                        onChange={(e) => setVitalForm({ ...vitalForm, bpDiastolic: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Heart Rate (bpm)
                    </label>
                    <input
                      type="number"
                      value={vitalForm.heartRate}
                      onChange={(e) => setVitalForm({ ...vitalForm, heartRate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Temperature (°C)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={vitalForm.temperature}
                      onChange={(e) => setVitalForm({ ...vitalForm, temperature: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Respiratory Rate (breaths/min)
                    </label>
                    <input
                      type="number"
                      value={vitalForm.respiratoryRate}
                      onChange={(e) => setVitalForm({ ...vitalForm, respiratoryRate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Oxygen Saturation (%)
                    </label>
                    <input
                      type="number"
                      value={vitalForm.oxygenSaturation}
                      onChange={(e) => setVitalForm({ ...vitalForm, oxygenSaturation: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (kg) & Height (cm)
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        placeholder="Weight"
                        value={vitalForm.weight}
                        onChange={(e) => setVitalForm({ ...vitalForm, weight: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Height"
                        value={vitalForm.height}
                        onChange={(e) => setVitalForm({ ...vitalForm, height: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
                >
                  Record Vital Signs
                </button>
              </form>
            </div>
          )}

          {/* Clinical Alerts Tab */}
          {activeTab === 'alerts' && summaryData && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Clinical Alerts & Warnings</h2>

              {summaryData.alerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No clinical alerts at this time
                </div>
              ) : (
                <div className="space-y-4">
                  {summaryData.alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border-l-4 ${
                        alert.severity === 'critical'
                          ? 'border-red-500 bg-red-50'
                          : alert.severity === 'moderate'
                          ? 'border-yellow-500 bg-yellow-50'
                          : 'border-blue-500 bg-blue-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium text-gray-900 capitalize">
                              {alert.severity} Alert
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              alert.severity === 'critical'
                                ? 'bg-red-100 text-red-800'
                                : alert.severity === 'moderate'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {alert.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 mb-2">{alert.message}</p>
                          <p className="text-xs text-gray-600">
                            {new Date(alert.date).toLocaleString()}
                          </p>
                        </div>
                        {alert.actionable && (
                          <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                            Action Required
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6 text-center text-gray-600">
          <h3 className="font-semibold text-gray-900 mb-2">🏥 Vivalé Healthcare Platform - EHR System Demo</h3>
          <p className="text-sm">
            Enterprise-grade Electronic Health Records with HIPAA compliance, clinical decision support,
            and comprehensive healthcare data management.
          </p>
          <div className="mt-4 flex justify-center space-x-4 text-xs">
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">✅ Clean Architecture</span>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">🔒 HIPAA Compliant</span>
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">🩺 Clinical Decision Support</span>
            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">📊 Analytics Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}
