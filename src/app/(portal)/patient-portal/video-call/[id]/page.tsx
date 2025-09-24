import { PatientPortalHeader } from '@/components/patient-portal/header';
import { VideoCall } from '@/components/patient-portal/video-call';

// Mock data - in a real app, you would fetch appointment details
const mockAppointment = {
  id: '1',
  providerName: 'Dr. Evelyn Reed',
  specialty: 'Cardiology',
  date: '2024-08-15T10:30:00.000Z', // Using a static date to prevent hydration errors
  time: '10:30',
};

export default function VideoCallPage({ params }: { params: { id: string } }) {
  // In a real app, you would use the `params.id` to fetch
  // the specific appointment and validate the user's access.
  const appointment = { ...mockAppointment, id: params.id };

  return (
    <div className="flex h-screen flex-col">
      <PatientPortalHeader />
      <main className="flex-1">
        <VideoCall appointment={appointment} />
      </main>
    </div>
  );
}
