import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { SymptomChecker } from '@/components/symptom-checker';
import { Header } from '@/components/header';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-image');

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="relative w-full py-20 md:py-32 lg:py-40">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
              <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-4">
                  <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                    Smarter Health,
                    <br />
                    Instantly with{' '}
                    <span className="bg-gradient-to-r from-accent-left via-accent-mid to-accent-right bg-clip-text text-transparent">
                      MediVision AI
                    </span>
                  </h1>
                  <p className="max-w-[600px] text-lg text-muted-foreground md:text-xl">
                    Get instant, AI-powered insights into your health symptoms.
                    Your personal health companion is here to guide you.
                  </p>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-accent-left via-primary to-accent-mid text-primary-foreground transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg"
                  >
                    Get Started
                    <ArrowRight className="ml-2" />
                  </Button>
                  <Button size="lg" variant="outline">
                    Learn More
                  </Button>
                </div>
              </div>
              <div className="relative flex items-center justify-center">
                {heroImage && (
                  <Image
                    src={heroImage.imageUrl}
                    alt={heroImage.description}
                    width={600}
                    height={400}
                    className="rounded-lg object-cover shadow-card"
                    data-ai-hint={heroImage.imageHint}
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        <section id="symptom-checker" className="w-full bg-muted/50 py-20 md:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <SymptomChecker />
          </div>
        </section>
      </main>

      <footer className="bg-background py-6">
        <div className="container mx-auto flex items-center justify-between px-4 md:px-6">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} MediVision AI. All rights
            reserved.
          </p>
          <div className="flex gap-4">
            <Button variant="link" size="sm" className="text-muted-foreground">
              Privacy Policy
            </Button>
            <Button variant="link" size="sm" className="text-muted-foreground">
              Terms of Service
            </Button>
             <Link href="/patient-portal">
              <Button variant="link" size="sm" className="text-muted-foreground">
                Patient Portal
              </Button>
            </Link>
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
