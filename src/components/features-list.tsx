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
  Pill,
  BarChart,
  Stethoscope,
  type LucideIcon,
  FlaskConical,
  FileBarChart
} from 'lucide-react';

type Feature = {
  name: string;
  icon: LucideIcon;
};

type FeatureCategory = {
  title: string;
  features: Feature[];
};

const featureData: FeatureCategory[] = [
  {
    title: 'Patient Engagement',
    features: [
      { name: 'Appointment Scheduling', icon: CalendarDays },
      { name: 'Online Booking Portal', icon: BookOpen },
      { name: 'Telehealth Video Calls', icon: Video },
      { name: 'Patient Mobile App', icon: Smartphone },
      { name: 'Secure Messaging', icon: MessagesSquare },
    ],
  },
  {
    title: 'Clinical Operations',
    features: [
      { name: 'Patient Records (EHR)', icon: Clipboard },
      { name: 'Customizable Intake Forms', icon: FileText },
      { name: 'Billing & Payments', icon: CreditCard },
    ],
  },
  {
    title: 'Practice Management',
    features: [
      { name: 'Provider Management', icon: Stethoscope },
      { name: 'Patient Relationship Mgmt', icon: HeartHandshake },
      { name: 'Automated Reminders', icon: BellRing },
      { name: 'AI Symptom Checker', icon: Bot },
    ],
  },
  {
    title: 'Analytics & Reporting',
    features: [
      { name: 'Custom Reports', icon: FileBarChart },
      { name: 'Patient Demographics', icon: Users },
      { name: 'Practice Performance', icon: BarChart },
    ],
  },
];

export function FeaturesList() {
  return (
    <div className="mx-auto max-w-6xl space-y-12">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          A Feature for Every Need
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Explore the powerful tools that make Vivalé the perfect solution for modern healthcare.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-4">
        {featureData.map((category) => (
          <div key={category.title} className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">{category.title}</h3>
            <ul className="space-y-2">
              {category.features.map((feature) => (
                <li
                  key={feature.name}
                  className="group relative flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200 hover:translate-x-1 hover:bg-accent/50"
                >
                  {/* Left accent bar */}
                  <span className="absolute left-0 top-1 bottom-1 w-1 rounded-full bg-gradient-to-b from-primary to-primary/80 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                  {/* Icon */}
                  <feature.icon className="h-5 w-5 flex-shrink-0 text-muted-foreground transition-colors duration-200 group-hover:text-primary" />
                  {/* Label */}
                  <span className="text-sm font-medium text-foreground transition-colors duration-200 group-hover:text-primary">
                    {feature.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
