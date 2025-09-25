'use client';

import { TooltipProvider } from '@/components/ui/tooltip';
import ErrorBoundary from '@/components/error-boundary-new';
import { Toaster } from '@/components/ui/toaster';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <TooltipProvider>
        <div className="relative flex min-h-screen flex-col">
          <main className="flex-1">
            {children}
          </main>
        </div>
        <Toaster />
      </TooltipProvider>
    </ErrorBoundary>
  );
}