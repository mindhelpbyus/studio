import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  LayoutDashboard,
  Users,
  Receipt,
  BarChart,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navLinks = [
  { href: '/provider-portal/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/provider-portal/calendar', icon: Calendar, label: 'Calendar', active: true },
  { href: '/provider-portal/clients', icon: Users, label: 'Clients' },
  { href: '/provider-portal/billing', icon: Receipt, label: 'Billing' },
  { href: '/provider-portal/reports', icon: BarChart, label: 'Reports' },
];

const helpLinks = [
  { href: '/provider-portal/settings', icon: Settings, label: 'Settings' },
  { href: '/provider-portal/help', icon: HelpCircle, label: 'Help' },
];

export function ProviderSidebar() {
  return (
    <aside className="w-64 shrink-0 border-r bg-card">
      <div className="flex h-full flex-col justify-between p-4">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <Image
              src="https://picsum.photos/seed/therapist/100/100"
              alt="Dr. Amelia Reed"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div className="flex flex-col">
              <h1 className="text-sm font-semibold">Dr. Amelia Reed</h1>
              <p className="text-xs text-muted-foreground">Licensed Therapist</p>
            </div>
          </div>
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href}>
                <Button
                  variant={link.active ? 'secondary' : 'ghost'}
                  className="w-full justify-start gap-3 px-3"
                >
                  <link.icon className="h-5 w-5" />
                  <span>{link.label}</span>
                </Button>
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-col gap-4">
          <Button>New Appointment</Button>
          <div className="flex flex-col gap-1">
            {helpLinks.map((link) => (
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
        </div>
      </div>
    </aside>
  );
}
