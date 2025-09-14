import { PatientPortalHeader } from '@/components/patient-portal/header';

export default function PatientPortal() {
  return (
    <div className="flex min-h-screen flex-col">
      <PatientPortalHeader />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold">Patient Portal</h1>
        <p>Welcome to your patient portal.</p>
      </main>
    </div>
  );
}
