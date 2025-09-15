
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
    <div className="space-y-12">
      <div className="text-center">
        <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          A Feature for Every Need
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Explore the powerful tools that make MediVision AI the perfect
          solution.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
        {featureData.map((category) => (
          <div key={category.title} className="space-y-6">
            <h3 className="text-xl font-bold text-foreground">{category.title}</h3>
            <ul className="space-y-4">
              {category.features.map((feature) => (
                <li key={feature.name} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="font-medium text-muted-foreground">{feature.name}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
