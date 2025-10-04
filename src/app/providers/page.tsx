
import { Header } from '@/components/header';
import { ProviderCard } from '@/components/providers/provider-card';
import { providersDb, type Provider } from '@/lib/providers';

async function getProviders(): Promise<Provider[]> {
  // In a real app, you'd fetch this from your API
  // const res = await fetch('/api/providers');
  // if (!res.ok) {
  //   throw new Error('Failed to fetch providers');
  // }
  // return res.json();
  
  // For now, we'll just use the mock data directly
  return providersDb.findAll();
}

export default async function ProvidersPage() {
  const providers = await getProviders();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-muted/50">
        <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
          <div className="mb-10 text-center">
            <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Our Network of Providers
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground md:text-xl">
              Meet the experts dedicated to your health and well-being.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {providers.map((provider, index) => (
              <ProviderCard key={provider.id} provider={provider} priority={index < 2} />
            ))}
          </div>
        </div>
      </main>
      <footer className="bg-background py-6">
        <div className="container mx-auto flex items-center justify-between px-4 md:px-6">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Nexus. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
