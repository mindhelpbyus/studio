'use client';

import {
  CalendarDays,
  CreditCard,
  BookOpen,
  Zap,
  Smartphone,
  Users,
  MessagesSquare,
  Package,
  FileText,
  Gift,
  Bot,
  Megaphone,
  Percent,
  Sofa,
  ShoppingBag,
  UsersRound,
  BarChart,
  Building2,
  Landmark,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

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
    title: 'Scheduling & Payments',
    features: [
      { name: 'Calendar & Scheduling', icon: CalendarDays },
      { name: 'Payments & Point-of-Sale', icon: CreditCard },
      { name: 'Online Booking', icon: BookOpen },
      { name: 'Express Booking™', icon: Zap },
      { name: 'Mobile Apps', icon: Smartphone },
    ],
  },
  {
    title: 'Client Relationships',
    features: [
      { name: 'Client Management', icon: Users },
      { name: 'Two-Way Texting', icon: MessagesSquare },
      { name: 'Memberships & Packages', icon: Package },
      { name: 'Forms & Charting', icon: FileText },
      { name: 'Gift Cards', icon: Gift },
    ],
  },
  {
    title: 'Marketing & Automation',
    features: [
      { name: 'Automated Flows', icon: Bot },
      { name: 'Campaigns', icon: Megaphone },
      { name: 'Offers & Discounts', icon: Percent },
      { name: 'Virtual Waiting Room', icon: Sofa },
    ],
  },
  {
    title: 'Management',
    features: [
      { name: 'Retail & Inventory', icon: ShoppingBag },
      { name: 'Staff Management', icon: UsersRound },
      { name: 'Reporting', icon: BarChart },
      { name: 'Multi-Location', icon: Building2 },
      { name: 'Payroll Processing', icon: Landmark },
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
          Explore the powerful tools that make MediVision AI the perfect solution.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
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
