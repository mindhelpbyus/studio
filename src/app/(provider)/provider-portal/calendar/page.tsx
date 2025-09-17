
import { WeekViewCalendar } from '@/components/provider-portal/week-view-calendar';
import { AppointmentDetail } from '@/components/provider-portal/appointment-detail';
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const staff = [
  { name: 'Marcus', avatar: 'https://picsum.photos/seed/marcus/40/40' },
  { name: 'Natalie', avatar: 'https://picsum.photos/seed/natalie/40/40' },
  { name: 'Michael', avatar: 'https://picsum.photos/seed/michael/40/40' },
  { name: 'Chelsea', avatar: 'https://picsum.photos/seed/chelsea/40/40' },
];

export default function CalendarPage() {
  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b bg-card p-4">
        <div className="flex items-center gap-4">
          <button className="font-semibold uppercase">Today</button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className='h-8 w-8'>
                <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="text-base font-semibold">Tuesday, July 16</span>
             <Button variant="ghost" size="icon" className='h-8 w-8'>
                <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4">
            <Button variant="outline" className="gap-2">
                <SlidersHorizontal size={16} />
                Filters
            </Button>
          <div className="flex items-center rounded-md border bg-background text-sm font-medium">
            <button className="px-4 py-1.5 hover:bg-muted/50 rounded-l-md">Day</button>
            <button className="px-4 py-1.5 border-x bg-primary text-primary-foreground">Week</button>
          </div>
        </div>
      </header>
       <div className='flex items-center gap-6 border-b bg-card p-4'>
        {staff.map(member => (
            <div key={member.name} className='flex items-center gap-2'>
                <Image src={member.avatar} alt={member.name} width={32} height={32} className='rounded-full' />
                <span className='font-medium'>{member.name}</span>
            </div>
        ))}
       </div>
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-auto">
          <WeekViewCalendar />
        </main>
        <aside className="w-[380px] shrink-0 border-l bg-card">
          <AppointmentDetail />
        </aside>
      </div>
    </div>
  );
}
