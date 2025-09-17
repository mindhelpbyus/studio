
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  Users,
  CreditCard,
  BarChart,
  Settings,
  HelpCircle,
  MessageSquare,
  Package,
  LayoutGrid
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '../ui/badge';
import { AnimatedLogoIcon } from '../animated-logo-icon';

const navLinks = [
  { href: '/provider-portal/calendar', icon: Calendar, label: 'Calendar', active: true, notification: 2 },
  { href: '/provider-portal/clients', icon: Users, label: 'Clients' },
  { href: '/provider-portal/sales', icon: CreditCard, label: 'Sales' },
  { href: '/provider-portal/messages', icon: MessageSquare, label: 'Messages' },
  { href: '/provider-portal/reports', icon: BarChart, label: 'Reports' },
  { href: '/provider-portal/products', icon: Package, label: 'Products' },
];

const bottomLinks = [
  { href: '/provider-portal/apps', icon: LayoutGrid, label: 'Apps' },
  { href: '/provider-portal/settings', icon: Settings, label: 'Settings' },
  { href: '/provider-portal/help', icon: HelpCircle, label: 'Help' },
];

export function ProviderSidebar() {
  return (
    <aside className="w-56 shrink-0 border-r bg-card text-card-foreground flex flex-col">
       <div className="flex h-16 shrink-0 items-center justify-center border-b px-4">
         <Link href="/" className="flex items-center gap-2">
            <div className='w-8 h-8'>
                <AnimatedLogoIcon />
            </div>
          </Link>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="flex flex-col gap-1 p-4">
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href}>
              <Button
                variant={link.active ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-3 px-3"
              >
                <link.icon className="h-5 w-5" />
                <span className='flex-1 text-left'>{link.label}</span>
                {link.notification && <Badge variant="destructive" className='h-5 w-5 justify-center p-0'>{link.notification}</Badge>}
              </Button>
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto border-t p-4">
         <div className="flex flex-col gap-1 mb-4">
            {bottomLinks.map((link) => (
              <Link key={link.label} href={link.href}>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 px-3"
                >
                  <link.icon className="h-5 w-5" />
                  <span>{link.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        <div className="flex items-center gap-3">
          <Image
            src="https://picsum.photos/seed/therapist/100/100"
            alt="Lisa Baker"
            width={40}
            height={40}
            className="rounded-full"
          />
          <div className="flex flex-col">
            <h1 className="text-sm font-semibold">Lisa Baker</h1>
            <p className="text-xs text-muted-foreground">Jade Salon</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
