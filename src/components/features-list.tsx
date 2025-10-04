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
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { useState } from 'react';
import { NexusCard, NexusButton } from '@/components/nexus-ui';
import { useNexusAnimations } from '@/hooks/useNexusAnimations';

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
  const { createHoverAnimation, getSlideUpClasses } = useNexusAnimations();

  return (
    <div className="mx-auto max-w-6xl space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 nexus-animate-fade-in">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-nexus-text-primary">
          A Feature for Every Need
        </h2>
        <p className="mt-4 text-lg text-nexus-text-secondary max-w-2xl mx-auto">
          Explore the powerful tools that make Nexus the perfect solution for modern healthcare CRM.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap justify-center gap-3 p-3 bg-nexus-bg-surface rounded-xl border border-nexus-border">
        {featureData.map((category) => (
          <button
            key={category.title}
            onClick={() => setActiveTab(category.title)}
            className={`
              px-6 py-3 rounded-lg font-semibold text-sm nexus-transition select-none
              ${activeTab === category.title 
                ? 'bg-gradient-to-r from-nexus-accent-primary to-nexus-accent-primary/80 text-primary-foreground shadow-lg' 
                : 'text-nexus-text-secondary hover:text-nexus-text-primary hover:bg-nexus-bg-elevated'
              }
            `}
          >
            {category.title}
          </button>
        ))}
      </div>

      {/* Tab Content - Cards */}
      <div className="min-h-[500px]">
        {featureData.map((category) => (
          <div
            key={category.title}
            className={`${activeTab === category.title ? 'block' : 'hidden'} ${getSlideUpClasses()}`}
          >
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.features.map((feature, index) => (
                <NexusCard
                  key={feature.name}
                  className="group relative overflow-hidden"
                  hover={true}
                  padding="lg"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Grok-style gradient accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-nexus-accent-primary to-nexus-accent-secondary opacity-0 group-hover:opacity-100 nexus-transition"></div>
                  
                  {/* Feature Icon */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0 p-3 rounded-xl bg-nexus-accent-primary/10 group-hover:bg-nexus-accent-primary/20 nexus-transition border border-nexus-accent-primary/20">
                      <feature.icon className="h-6 w-6 text-nexus-accent-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-nexus-text-primary group-hover:text-nexus-accent-primary nexus-transition">
                        {feature.name}
                      </h4>
                    </div>
                  </div>

                  {/* Feature Description Placeholder */}
                  <p className="text-sm text-nexus-text-secondary mb-6 leading-relaxed">
                    Streamline your healthcare operations with our advanced {feature.name.toLowerCase()} solution.
                  </p>

                  {/* Learn More Button */}
                  <div className="flex justify-end">
                    <NexusButton 
                      variant="ghost" 
                      size="sm"
                      icon={<ArrowRight className="h-4 w-4" />}
                      className="text-nexus-accent-primary hover:text-nexus-accent-secondary"
                    >
                      Learn More
                    </NexusButton>
                  </div>
                </NexusCard>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="text-center pt-8">
        <NexusButton size="lg" variant="primary">
          Explore All Features
        </NexusButton>
      </div>
    </div>
  );
}
