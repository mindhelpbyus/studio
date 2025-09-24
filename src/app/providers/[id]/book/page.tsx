import { notFound } from 'next/navigation';
import { AppointmentBooking } from '@/components/appointments/appointment-booking';
import { Header } from '@/components/header';
import { providersDb } from '@/lib/providers';
import type { Provider } from '@/lib/providers';

async function getProvider(id: string): Promise<Provider | undefined> {
  return providersDb.findById(id);
}

export default async function BookAppointmentPage({ params }: { params: { id: string } }) {
  const provider = await getProvider(params.id);

  if (!provider) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-muted/50">
        <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
          <AppointmentBooking provider={provider} />
        </div>
      </main>
      <footer className="bg-background py-6">
        <div className="container mx-auto flex items-center justify-between px-4 md:px-6">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Vivalé. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
