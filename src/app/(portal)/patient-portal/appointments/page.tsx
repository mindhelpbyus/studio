import { Video } from 'lucide-react';
import Link from 'next/link';
import { PatientPortalHeader } from '@/components/patient-portal/header';
import { Button } from '@/components/ui/button';

// Mock data - in a real app, this would be fetched for the logged-in user
const upcomingAppointments = [
  { id: '1', providerName: 'Dr. Evelyn Reed', specialty: 'Cardiology', date: '2024-08-15', time: '10:30' },
  { id: '2', providerName: 'Dr. Maria Garcia', specialty: 'Dermatology', date: '2024-09-02', time: '14:00' },
];

export default function AppointmentsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PatientPortalHeader />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Your Appointments</h1>
        
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
            {upcomingAppointments.length > 0 ? (
                 <ul className="space-y-4">
                    {upcomingAppointments.map(apt => (
                        <li key={apt.id} className="p-4 border rounded-lg shadow-sm bg-card flex items-center justify-between">
                           <div>
                             <p className="font-bold">{apt.providerName} ({apt.specialty})</p>
                             <p className="text-muted-foreground">{new Date(apt.date).toDateString()} at {apt.time}</p>
                           </div>
                           <Link href={`/patient-portal/video-call/${apt.id}`}>
                             <Button>
                               <Video className="mr-2" />
                               Join Call
                             </Button>
                           </Link>
                        </li>
                    ))}
                 </ul>
            ): (
                <p>You have no upcoming appointments.</p>
            )}
        </div>
      </main>
    </div>
  );
}
