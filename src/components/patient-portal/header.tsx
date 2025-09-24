import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';

export function PatientPortalHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/patient-portal/appointments">
            <Button variant="ghost">Appointments</Button>
          </Link>
          <Link href="/patient-portal/messages">
            <Button variant="ghost">Messages</Button>
          </Link>
          <Link href="/patient-portal/records">
            <Button variant="ghost">Medical Records</Button>
          </Link>
           <Link href="/patient-portal/style-guide">
            <Button variant="ghost">Style Guide</Button>
          </Link>
          <Button>Sign Out</Button>
        </nav>
        <div className="md:hidden">
          <Button>Menu</Button>
        </div>
      </div>
    </header>
  );
}
