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
  type LucideIcon,
  BarChart,
  FileBarChart,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';

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
      { name: 'AI Mental Health Checker', icon: Bot },
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
  const [activeTab, setActiveTab] = useState('Patient Engagement');

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          A Feature for Every Need
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Explore the powerful tools that make Vivalé the perfect solution for modern healthcare.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap justify-center gap-2 p-2 bg-muted/20 rounded-lg">
        {featureData.map((category) => (
          <button
            key={category.title}
            onClick={() => setActiveTab(category.title)}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
              ${activeTab === category.title 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }
            `}
          >
            {category.title}
          </button>
        ))}
      </div>

      {/* Tab Content - Cards */}
      <div className="min-h-[400px]">
        {featureData.map((category) => (
          <div
            key={category.title}
            className={`${activeTab === category.title ? 'block' : 'hidden'}`}
          >
            {/* Card Container with Outline */}
            <div className="p-6 rounded-xl bg-card border border-border shadow-lg">
              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.features.map((feature) => (
                  <div
                    key={feature.name}
                    className="group relative p-6 rounded-lg bg-muted/20 border border-border/50 shadow-sm hover:shadow-md hover:border-primary/30 hover:bg-card transition-all duration-200 hover:-translate-y-1"
                  >
                    {/* Side Highlight Bar */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{background: 'linear-gradient(99deg, var(--accent-left) 2.09%, var(--accent-mid) 45.25%, var(--accent-right) 88.41%)'}}></div>
                    {/* Feature Icon */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex-shrink-0 p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-headline font-bold text-foreground hover-text-gradient transition-colors">
                          {feature.name}
                        </h4>
                      </div>
                    </div>

                    {/* Learn More Button */}
                    <div className="flex justify-end">
                      <button className="text-xs text-primary hover:text-primary/80 font-medium">
                        Learn More →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>


    </div>
  );
}
