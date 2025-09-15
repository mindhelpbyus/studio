
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import {
  CalendarDays,
  CreditCard,
  BookOpen,
  Video,
  Smartphone,
  Users,
  MessagesSquare,
  Clipboard,
  FileText,
  HeartHandshake,
  Bot,
  BellRing,
  Pill,
  BarChart,
  Stethoscope,
  FlaskConical,
  FileBarChart,
  type LucideIcon,
  User,
  Hospital,
} from 'lucide-react';
import React from 'react';

const features: { title: string; href: string; description: string, icon: LucideIcon }[] = [
    { title: 'Appointment Scheduling', href: '#', description: 'Manage patient appointments with an intuitive calendar.', icon: CalendarDays },
    { title: 'Telehealth Video Calls', href: '#', description: 'Conduct secure video consultations with patients.', icon: Video },
    { title: 'Patient Records (EHR)', href: '#', description: 'Access and manage comprehensive electronic health records.', icon: Clipboard },
    { title: 'Secure Messaging', href: '#', description: 'Communicate securely with patients and colleagues.', icon: MessagesSquare },
    { title: 'Online Booking Portal', href: '#', description: 'Allow patients to book their appointments online 24/7.', icon: BookOpen },
    { title: 'Patient Mobile App', href: '#', description: 'Engage patients with a dedicated mobile application.', icon: Smartphone },
    { title: 'Customizable Intake Forms', href: '#', description: 'Create and manage digital forms for patient intake.', icon: FileText },
    { title: 'e-Prescribing', href: '#', description: 'Send prescriptions directly to pharmacies.', icon: Pill },
    { title: 'Lab Results', href: '#', description: 'Receive and manage lab results within the CRM.', icon: FlaskConical },
    { title: 'Billing & Payments', href: '#', 'description': 'Handle patient billing and process payments seamlessly.', icon: CreditCard },
    { title: 'AI Symptom Checker', href: '#', description: 'Provide patients with an initial AI-powered symptom analysis.', icon: Bot },
    { title: 'Automated Reminders', href: '#', description: 'Reduce no-shows with automated appointment reminders.', icon: BellRing },
    { title: 'Practice Performance', href: '#', description: 'Get insights into your practice with advanced analytics.', icon: BarChart },
    { title: 'Patient Demographics', href: '#', description: 'Understand your patient population better.', icon: Users },
    { title: 'Provider Management', href: '#', description: 'Manage provider schedules and profiles.', icon: Stethoscope },
];

const whoWeServe: { title: string; href: string; description: string, icon: LucideIcon }[] = [
    { title: 'Individual Therapist', href: '/providers', description: 'Tools for solo practitioners to manage their practice.', icon: User },
    { title: 'Wellness & Counseling Center', href: '/providers', description: 'Solutions for clinics and centers to streamline operations.', icon: Hospital },
    { title: 'Patient', href: '/patient-portal', description: 'Access your health records, appointments, and care team.', icon: HeartHandshake },
];


export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="font-bold">Features</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[800px] md:grid-cols-4 lg:w-[1000px] ">
                      {features.map((feature) => (
                        <ListItem
                          key={feature.title}
                          title={feature.title}
                          href={feature.href}
                          icon={feature.icon}
                        >
                          {feature.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="font-bold">Who We Serve</NavigationMenuTrigger>
                   <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] lg:w-[600px] lg:grid-cols-[.75fr_1fr]">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <a
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                            href="/"
                          >
                            <Logo />
                            <p className="mt-4 text-sm leading-tight text-muted-foreground">
                              A complete platform for modern healthcare providers and patients.
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                       {whoWeServe.map((item) => (
                        <ListItem
                          key={item.title}
                          title={item.title}
                          href={item.href}
                          icon={item.icon}
                        >
                          {item.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                   <NavigationMenuLink asChild>
                    <Link href="#" className={cn(navigationMenuTriggerStyle(), "font-bold")}>Pricing</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </nav>
        </div>
        
        <div className="hidden items-center gap-4 md:flex">
          <Button variant="ghost" className="font-bold text-base">Log In</Button>
          <Button variant="outline" className="border-2 border-primary font-bold text-primary rounded-full relative overflow-hidden bg-gradient-button">Book a Demo</Button>
          <Button className="rounded-full font-bold">Try it now</Button>
        </div>
        
        <div className="md:hidden">
            <Button>Menu</Button>
        </div>
      </div>
    </header>
  );
}


const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'> & { icon: LucideIcon, title: string }
>(({ className, title, children, icon: Icon, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            'group/item relative flex select-none items-center gap-4 rounded-md p-3 leading-none no-underline outline-none transition-all duration-200 ease-in-out hover:bg-accent/50 focus:shadow-md',
            className
          )}
          {...props}
        >
          <div className="absolute left-0 top-0 h-full w-1.5 origin-left scale-y-0 rounded-r-full bg-gradient-to-b from-accent-left via-accent-mid to-accent-right transition-transform duration-300 ease-in-out group-hover/item:scale-y-100" />
          <div className="text-muted-foreground transition-colors group-hover/item:text-primary">
            <Icon className="h-6 w-6" />
          </div>
          <div className="transition-transform duration-200 ease-in-out group-hover/item:translate-x-1">
            <div className="text-base font-medium leading-tight text-foreground">{title}</div>
            <p className="mt-1 line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          </div>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = 'ListItem';
