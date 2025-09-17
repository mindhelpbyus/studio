
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { MentalHealthChecker } from '@/components/mental-health-checker';
import { Header } from '@/components/header';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { FeaturesList } from '@/components/features-list';

export default function Home() {

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <Header />
      <main className="flex-1 relative z-10">
        <section className="relative w-full pt-20 md:pt-32 lg:pt-40">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-1 lg:gap-16">
              <div className="flex flex-col items-center justify-center space-y-6 text-center">
                <div className="space-y-4">
                  <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                    Personalized Care,
                    <br />
                    Deeper Connections with{' '}
                    <span className="text-gradient">
                      Vivalé
                    </span>
                  </h1>
                  <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl">
                    Vivalé helps you manage your patient care journey, connect with your care team, and live fully. Your trusted partner in health and wellness software is here.
                  </p>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Button
                    size="lg"
                    className="rounded-full"
                  >
                    Get Started
                    <ArrowRight className="ml-2" />
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-full">
                    Learn More
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section id="features" className="w-full py-20 md:py-32 bg-transparent">
          <div className="container mx-auto px-4 md:px-6">
            <FeaturesList />
          </div>
        </section>

        <section id="mental-health-checker" className="w-full py-20 md:py-32 bg-page-gradient">
          <div className="container mx-auto px-4 md:px-6">
            <MentalHealthChecker />
          </div>
        </section>
      </main>

      <footer className="py-6 relative z-10">
        <div className="container mx-auto flex items-center justify-between px-4 md:px-6">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Vivalé. All rights
            reserved.
          </p>
          <div className="flex gap-4">
            <Button variant="link" size="sm" className="text-muted-foreground">
              Privacy Policy
            </Button>
            <Button variant="link" size="sm" className="text-muted-foreground">
              Terms of Service
            </Button>
            <Link href="/provider-portal/calendar">
              <Button variant="link" size="sm" className="text-muted-foreground">
                Provider Portal
              </Button>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
