
'use client';

import * as React from 'react';
import {
  MoreHorizontal,
  Pencil,
  MessageSquare,
  Crown,
  ChevronDown,
  Video,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const pastAppointments = [
    { id: '1', date: '2024-06-18', service: '50-Minute Facial', status: 'Completed' },
    { id: '2', date: '2024-05-21', service: '50-Minute Facial', status: 'Completed' },
];

const visitSummaries = [
    { id: '1', date: '2024-06-18', summary: 'Client reported skin feeling refreshed. Discussed new serum...' },
];

export function AppointmentDetail() {
  const [isClientInfoOpen, setIsClientInfoOpen] = React.useState(false);

  return (
    <div className="flex h-full flex-col p-6 overflow-y-auto">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Appointment</h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal size={18} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Pencil size={18} />
          </Button>
        </div>
      </header>

      <div className="mt-6 flex items-center justify-between rounded-lg bg-muted p-3">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-pink-400" />
          <span className="font-medium">Checked In</span>
        </div>
        <Button variant="outline" size="sm">Checkout</Button>
      </div>

      <div className="mt-6 text-sm text-muted-foreground">
        <div className="flex justify-between">
          <span>On <span className="font-semibold text-foreground">Tue, Jul 16</span></span>
          <span>At <span className="font-semibold text-foreground">1:00 PM</span></span>
        </div>
      </div>
      
      <Separator className="my-6" />

       <div className="flex items-center justify-between">
         <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-pink-100 text-pink-700 font-bold">LC</AvatarFallback>
            </Avatar>
            <div>
                <h3 className="font-bold text-lg">Lucy Carmichael</h3>
                <p className="text-sm text-muted-foreground">Client since April 2022</p>
            </div>
         </div>
         <Button variant="outline" size="icon">
            <MessageSquare size={20} />
         </Button>
      </div>

       <div className='mt-4 rounded-lg border bg-accent/50 p-3'>
          <div className='flex items-center gap-2'>
            <Crown size={18} className='text-yellow-500' />
            <span className='font-semibold'>Premium Facial Membership</span>
          </div>
          <p className='text-sm text-muted-foreground mt-1 ml-1'>
            <span className='inline-block h-2 w-2 rounded-full bg-green-500 mr-2' />
            Active | Billing: July 25
          </p>
      </div>

       <Collapsible open={isClientInfoOpen} onOpenChange={setIsClientInfoOpen}>
        <CollapsibleTrigger asChild>
          <button className='mt-2 text-sm font-semibold text-primary text-left w-full flex items-center gap-1'>
            Show additional client info
            <ChevronDown size={16} className={`transition-transform ${isClientInfoOpen ? 'rotate-180' : ''}`} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-4 animate-accordion-down">
           <Card>
                <CardHeader>
                    <CardTitle className='text-base'>Past Appointments</CardTitle>
                </CardHeader>
                <CardContent className='text-sm space-y-2'>
                    {pastAppointments.map(apt => (
                        <div key={apt.id} className='flex justify-between'>
                            <span>{apt.date} - {apt.service}</span>
                            <Badge variant='secondary'>{apt.status}</Badge>
                        </div>
                    ))}
                </CardContent>
           </Card>
           <Card>
                <CardHeader>
                    <CardTitle className='text-base'>Visit Summaries</CardTitle>
                </CardHeader>
                <CardContent className='text-sm space-y-2'>
                    {visitSummaries.map(summary => (
                        <p key={summary.id}><strong>{summary.date}:</strong> {summary.summary}</p>
                    ))}
                </CardContent>
           </Card>
        </CollapsibleContent>
      </Collapsible>


      <Separator className="my-6" />

      <div>
        <div className='flex justify-between items-start'>
            <div>
                <p className='text-sm text-muted-foreground'>50-Minute Facial</p>
                <p className='text-sm mt-2'>with Natalie</p>
                <p className='text-sm'>at 1:00 PM</p>
            </div>
            <div className='text-right'>
                <p className='text-lg font-bold'>$90</p>
                <p className='text-sm text-muted-foreground'>for: 1 hour</p>
            </div>
        </div>
      </div>

       <div className='mt-auto pt-6'>
            <h4 className='font-semibold mb-3'>Booking Details</h4>
            <div className='space-y-4'>
                 <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                        <p className="font-semibold">Telehealth Appointment</p>
                        <p className="text-sm text-muted-foreground">Ready to join</p>
                    </div>
                    <Button size="sm">
                        <Video className="mr-2 h-4 w-4" />
                        Join Call
                    </Button>
                </div>
                {/* Placeholder for more details */}
                <div className='h-3 w-4/5 bg-muted rounded'></div>
                <div className='h-3 w-3/5 bg-muted rounded'></div>
            </div>
       </div>

    </div>
  );
}
