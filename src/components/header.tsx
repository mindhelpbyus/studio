
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
  type LucideIcon,
} from 'lucide-react';
import React from 'react';

const features: { title: string; href: string; description: string, icon: LucideIcon }[] = [
    { title: 'Calendar & Scheduling', href: '#', description: 'Manage your appointments with an intuitive calendar.', icon: CalendarDays },
    { title: 'Payments & Point-of-Sale', href: '#', description: 'Process payments seamlessly.', icon: CreditCard },
    { title: 'Online Booking', href: '#', description: 'Allow clients to book appointments online 24/7.', icon: BookOpen },
    { title: 'Express Booking™', href: '#', description: 'Fast-track your booking process.', icon: Zap },
    { title: 'Mobile Apps', href: '#', description: 'Manage your business on the go.', icon: Smartphone },
    { title: 'Client Management', href: '#', description: 'Keep track of all your client information.', icon: Users },
    { title: 'Two-Way Texting', href: '#', description: 'Communicate with clients via text message.', icon: MessagesSquare },
    { title: 'Memberships & Packages', href: '#', description: 'Offer recurring memberships and packages.', icon: Package },
    { title: 'Forms & Charting', href: '#', description: 'Create and manage client forms and charts.', icon: FileText },
    { title: 'Gift Cards', href: '#', description: 'Sell and redeem gift cards.', icon: Gift },
    { title: 'Automated Flows', href: '#', description: 'Automate your marketing and client communication.', icon: Bot },
    { title: 'Campaigns', href: '#', description: 'Launch targeted marketing campaigns.', icon: Megaphone },
    { title: 'Offers & Discounts', href: '#', description: 'Create and manage promotional offers.', icon: Percent },
    { title: 'Virtual Waiting Room', href: '#', description: 'A virtual waiting room for your clients.', icon: Sofa },
    { title: 'Retail & Inventory', href: '#', description: 'Manage your retail products and inventory.', icon: ShoppingBag },
    { title: 'Staff Management', href: '#', description: 'Manage your staff and their schedules.', icon: UsersRound },
    { title: 'Reporting', href: '#', description: 'Get insights into your business performance.', icon: BarChart },
    { title: 'Multi-Location', href: '#', description: 'Manage multiple business locations.', icon: Building2 },
    { title: 'Payroll Processing', href: '#', description: 'Process payroll for your staff.', icon: Landmark },
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
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
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
                  <NavigationMenuLink asChild>
                    <Link href="/providers" className={cn(navigationMenuTriggerStyle(), "font-bold")}>For Providers</Link>
                  </NavigationMenuLink>
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
          <Button variant="ghost" className="font-bold">Log In</Button>
          <Button variant="outline" className="border-2 border-primary font-bold text-primary rounded-full">Book a Demo</Button>
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
