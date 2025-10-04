
'use client';

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
  Stethoscope,
  BarChart,
  type LucideIcon,
  User,
  Hospital,
  Menu,
  Moon,
  Sun,
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import NexusLogo from '@/components/ui/nexus-logo';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger,
  Button,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
  Sheet, 
  SheetContent, 
  SheetTrigger, 
  SheetClose 
} from '@/components/nexus-ui';
import { NexusButton } from '@/components/nexus-ui';
import { useNexusTheme } from '@/hooks/useNexusTheme';
import { useNexusAnimations } from '@/hooks/useNexusAnimations';
import { cn } from '@/lib/utils';


const featureCategories: {
  title: string;
  features: { title: string; href: string; description: string, icon: LucideIcon }[];
}[] = [
  {
    title: 'Patient Engagement',
    features: [
      { title: 'Appointment Scheduling', href: '#', description: 'Manage patient appointments with an intuitive calendar.', icon: CalendarDays },
      { title: 'Telehealth Video Calls', href: '#', description: 'Conduct secure video consultations with patients.', icon: Video },
      { title: 'Secure Messaging', href: '#', description: 'Communicate securely with patients and colleagues.', icon: MessagesSquare },
      { title: 'Online Booking Portal', href: '#', description: 'Allow patients to book their appointments online 24/7.', icon: BookOpen },
      { title: 'Patient Mobile App', href: '#', description: 'Engage patients with a dedicated mobile application.', icon: Smartphone },
    ],
  },
  {
    title: 'Clinical Operations',
    features: [
      { title: 'Patient Records (EHR)', href: '#', description: 'Access and manage comprehensive electronic health records.', icon: Clipboard },
      { title: 'Customizable Intake Forms', href: '#', description: 'Create and manage digital forms for patient intake.', icon: FileText },
      { title: 'Billing & Payments', href: '#', 'description': 'Handle patient billing and process payments seamlessly.', icon: CreditCard },
    ],
  },
  {
    title: 'Practice & Analytics',
    features: [
      { title: 'AI Mental Health Checker', href: '#mental-health-checker', description: 'Provide patients with an initial AI-powered symptom analysis.', icon: Bot },
      { title: 'Automated Reminders', href: '#', description: 'Reduce no-shows with automated appointment reminders.', icon: BellRing },
      { title: 'Practice Performance', href: '#', description: 'Get insights into your practice with advanced analytics.', icon: BarChart },
      { title: 'Provider Management', href: '#', description: 'Manage provider schedules and profiles.', icon: Stethoscope },
      { title: 'Patient Demographics', href: '#', description: 'Understand your patient population better.', icon: Users },
    ],
  }
];


const whoWeServe: { title: string; href: string; description: string, icon: LucideIcon }[] = [
    { title: 'Individual Therapist', href: '/providers', description: 'Tools for solo practitioners to manage their practice.', icon: User },
    { title: 'Wellness & Counseling Center', href: '/providers', description: 'Solutions for clinics and centers to streamline operations.', icon: Hospital },
];


export function Header() {
  const { theme, toggleTheme, isDark } = useNexusTheme();
  const { createHoverAnimation } = useNexusAnimations();
  const logoHoverProps = createHoverAnimation({ duration: 'fast' });

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md border-b border-nexus-border transition-all duration-200">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 nexus-transition" {...logoHoverProps}>
            <NexusLogo variant="full" size="md" />
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="font-semibold text-nexus-text-primary hover:text-nexus-accent-primary transition-colors bg-transparent">
                    Features
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[400px] gap-3 p-4 md:w-[600px] md:grid-cols-[1fr_1fr] lg:w-[800px] bg-nexus-bg-surface border border-nexus-border rounded-xl shadow-lg">
                      <div className="flex h-full flex-col justify-between rounded-lg bg-gradient-to-br from-nexus-accent-primary/10 to-nexus-accent-secondary/10 p-6 no-underline outline-none focus:shadow-md border border-nexus-border/50">
                        <div>
                          <NexusLogo variant="horizontal" size="lg" />
                          <p className="mt-4 text-sm leading-tight text-nexus-text-secondary">
                            A modern CRM platform for healthcare providers and patients.
                          </p>
                        </div>
                        <NexusButton asChild className="mt-6 w-full" size="sm">
                          <Link href="#features">Explore All Features</Link>
                        </NexusButton>
                      </div>
                      <div>
                        <Accordion type="single" collapsible className="w-full">
                          {featureCategories.map((category) => (
                            <AccordionItem value={category.title} key={category.title} className="border-nexus-border">
                              <AccordionTrigger className="px-3 text-base font-semibold hover:no-underline text-nexus-text-primary hover:text-nexus-accent-primary nexus-transition">
                                {category.title}
                              </AccordionTrigger>
                              <AccordionContent>
                                <ul className="grid gap-3 p-3">
                                  {category.features.map((feature) => (
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
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="font-semibold text-nexus-text-primary hover:text-nexus-accent-primary transition-colors bg-transparent">
                    Who We Serve
                  </NavigationMenuTrigger>
                   <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] lg:w-[600px] lg:grid-cols-[.75fr_1fr] bg-nexus-bg-surface border border-nexus-border rounded-xl shadow-lg">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <a
                            className="flex h-full w-full select-none flex-col justify-end rounded-lg bg-gradient-to-br from-nexus-accent-primary/10 to-nexus-accent-secondary/10 p-6 no-underline outline-none focus:shadow-md border border-nexus-border/50 nexus-transition hover:border-nexus-accent-primary/50"
                            href="/"
                          >
                            <NexusLogo variant="horizontal" size="lg" />
                            <p className="mt-4 text-sm leading-tight text-nexus-text-secondary">
                              A modern CRM platform for healthcare providers and patients.
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
                    <Link 
                      href="#" 
                      className={cn(
                        navigationMenuTriggerStyle(), 
                        "font-semibold text-nexus-text-primary hover:text-nexus-accent-primary transition-colors bg-transparent"
                      )}
                    >
                      Pricing
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </nav>
        </div>
        
        <div className="hidden items-center gap-4 md:flex">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-nexus-text-muted hover:text-nexus-text-primary hover:bg-nexus-bg-elevated rounded-lg transition-colors"
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <NexusButton asChild variant="ghost" size="sm">
            <Link href="/login">Provider Log In</Link>
          </NexusButton>
          
          <NexusButton variant="secondary" size="sm">
            Book a Demo
          </NexusButton>
          
          <NexusButton variant="primary" size="sm">
            Try it now
          </NexusButton>
        </div>
        
        <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <NexusButton variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </NexusButton>
              </SheetTrigger>
              <SheetContent side="right" className="bg-nexus-bg-surface border-nexus-border">
                <div className="grid gap-4 py-6">
                  {/* Mobile Theme Toggle */}
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-3 p-3 text-nexus-text-secondary hover:text-nexus-text-primary hover:bg-nexus-bg-elevated rounded-lg nexus-transition"
                  >
                    {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                  </button>
                  
                  <Link href="/login">
                     <SheetClose asChild>
                        <NexusButton variant="ghost" fullWidth>Provider Log In</NexusButton>
                     </SheetClose>
                  </Link>
                  <Link href="#">
                    <SheetClose asChild>
                        <NexusButton variant="primary" fullWidth>Try it now</NexusButton>
                    </SheetClose>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
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
            'group/item relative flex select-none items-center gap-4 rounded-lg p-3 leading-none no-underline outline-none nexus-transition hover:bg-nexus-bg-elevated focus:shadow-md border border-transparent hover:border-nexus-border',
            className
          )}
          {...props}
        >
          <div className="absolute left-0 top-0 h-full w-1 origin-left scale-y-0 rounded-r-full bg-gradient-to-b from-nexus-accent-primary to-nexus-accent-secondary transition-transform duration-300 ease-in-out group-hover/item:scale-y-100" />
          <div className="text-nexus-text-muted transition-colors group-hover/item:text-nexus-accent-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div className="transition-transform duration-200 ease-in-out group-hover/item:translate-x-1">
            <div className="text-sm font-semibold leading-tight text-nexus-text-primary">{title}</div>
            <p className="mt-1 line-clamp-2 text-xs leading-snug text-nexus-text-secondary">
              {children}
            </p>
          </div>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = 'ListItem';
