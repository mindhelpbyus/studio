
'use client';

import {
  MoreHorizontal,
  Pencil,
  MessageSquare,
  Crown,
  ChevronDown,
  Video,
} from 'lucide-react';
import * as React from 'react';
import { Avatar, AvatarFallback } from '@/components/nexus-ui/avatar';
import { Badge } from '@/components/nexus-ui/badge';
import { Button } from '@/components/nexus-ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/nexus-ui/collapsible';
import { Separator } from '@/components/nexus-ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/nexus-ui';

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
    <div className="flex h-full flex-col overflow-hidden">
      <header className="flex items-center justify-between p-6 border-b bg-card/50">
        <h2 className="text-xl font-semibold">Appointment Details</h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal size={18} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Pencil size={18} />
          </Button>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        <div className="flex items-center justify-between rounded-lg bg-green-50 border border-green-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
            <span className="font-semibold text-green-800">Checked In</span>
          </div>
          <Button variant="outline" size="sm" className="border-green-300 text-green-700 hover:bg-green-100">
            Checkout
          </Button>
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Date</span>
              <p className="font-semibold text-foreground">Tue, Jul 16</p>
            </div>
            <div>
              <span className="text-muted-foreground">Time</span>
              <p className="font-semibold text-foreground">1:00 PM</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="bg-pink-100 text-pink-700 font-bold text-lg">LC</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-xl">Lucy Carmichael</h3>
              <p className="text-sm text-muted-foreground">Client since April 2022</p>
            </div>
          </div>
          <Button variant="outline" size="icon" className="h-10 w-10">
            <MessageSquare size={20} />
          </Button>
        </div>

        <div className="rounded-lg border bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 p-4">
          <div className="flex items-center gap-3">
            <Crown size={20} className="text-yellow-600" />
            <span className="font-semibold text-yellow-800">Premium Facial Membership</span>
          </div>
          <p className="text-sm text-yellow-700 mt-2 flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
            Active • Next billing: July 25
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


        <div className="bg-card border rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h4 className="font-semibold text-lg">50-Minute Facial</h4>
              <p className="text-sm text-muted-foreground">with Natalie</p>
              <p className="text-sm text-muted-foreground">1:00 PM - 2:00 PM</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">$90</p>
              <p className="text-sm text-muted-foreground">1 hour session</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Session Details</h4>
          <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div>
              <p className="font-semibold text-blue-800">Telehealth Appointment</p>
              <p className="text-sm text-blue-600">Ready to join</p>
            </div>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Video className="mr-2 h-4 w-4" />
              Join Call
            </Button>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration:</span>
              <span className="font-medium">60 minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service Type:</span>
              <span className="font-medium">Premium Facial</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">Confirmed</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
