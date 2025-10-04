'use client';

import { TooltipProvider, Toaster } from '@/components/nexus-ui';
import ErrorBoundary from '@/components/error-boundary-new';

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