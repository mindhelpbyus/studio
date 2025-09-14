import { VideoCall } from '@/components/patient-portal/video-call';
import { PatientPortalHeader } from '@/components/patient-portal/header';

// Mock data - in a real app, you would fetch appointment details
const mockAppointment = {
  id: '1',
  providerName: 'Dr. Evelyn Reed',
  specialty: 'Cardiology',
  date: new Date().toISOString(),
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
