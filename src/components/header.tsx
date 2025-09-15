import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/#features">
            <Button variant="ghost">Features</Button>
          </Link>
          <Link href="/providers">
            <Button variant="ghost">For Providers</Button>
          </Link>
          <Button variant="ghost">Pricing</Button>
          <Button>Sign In</Button>
        </nav>
        <div className="md:hidden">
            <Button>Menu</Button>
        </div>
      </div>
    </header>
  );
}
