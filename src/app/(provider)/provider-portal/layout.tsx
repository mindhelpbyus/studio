import type { ReactNode } from 'react';
import { ProviderSidebar } from '@/components/provider-portal/sidebar';

export default function ProviderPortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-muted/40">
      <ProviderSidebar />
      <div className="flex flex-1 flex-col">
        {children}
      </div>
    </div>
  );
}
