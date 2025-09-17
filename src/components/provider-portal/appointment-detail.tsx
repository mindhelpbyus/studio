'use client';

import * as React from 'react';
import {
  MoreHorizontal,
  Pencil,
  MessageSquare,
  Crown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export function AppointmentDetail() {
  return (
    <div className="flex h-full flex-col p-6">
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

      <button className='mt-2 text-sm font-semibold text-primary text-left'>
        Show additional client info
      </button>

      <Separator className="my-6" />

      <div>
        <div className='flex justify-between items-start'>
            <div>
                <p className='text-sm text-muted-foreground'>50-Minute Facial</p>
                <p className='text-sm mt-2'>with Natalie</p>
                <p className='text-sm'>at 1:00 PM</p>
            </div>
            <div>
                <p className='text-lg font-bold'>$90</p>
                <p className='text-sm text-muted-foreground text-right'>request: none</p>
                <p className='text-sm text-muted-foreground text-right'>for: 1 hour</p>
            </div>
        </div>
      </div>

       <div className='mt-auto pt-6'>
            <h4 className='font-semibold mb-3'>Booking Details</h4>
            <div className='space-y-2'>
                <div className='h-3 w-4/5 bg-muted rounded'></div>
                <div className='h-3 w-3/5 bg-muted rounded'></div>
            </div>
       </div>

    </div>
  );
}
