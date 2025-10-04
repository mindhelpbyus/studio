'use client';

import { format, addDays } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { Button } from '@/components/nexus-ui/button';
import { Card, CardContent } from '@/components/nexus-ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/nexus-ui/carousel';
import { useToast } from '@/hooks/use-toast';
import { availableTimeSlots, Appointment } from '@/lib/appointments';
import type { Provider } from '@/lib/providers';
import { Input, Label } from '@/components/nexus-ui';

async function getBookedSlots(providerId: string, date: string): Promise<string[]> {
    // This is a placeholder. In a real app, you would fetch this from your API.
    // For now, we simulate an API call that could fail or be slow.
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    // const res = await fetch(`/api/appointments/booked?providerId=${providerId}&date=${date}`);
    // if (!res.ok) return [];
    // const appointments: Appointment[] = await res.json();
    // return appointments.map(a => a.time);
    
    // For demo purposes, we'll just return an empty array
    return [];
}


export function AppointmentBooking({ provider }: { provider: Provider }) {
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = React.useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [patientName, setPatientName] = React.useState('');
  const { toast } = useToast();
  const router = useRouter();

  const dates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));
  const formattedSelectedDate = format(selectedDate, 'yyyy-MM-dd');

  React.useEffect(() => {
    setIsLoadingSlots(true);
    getBookedSlots(provider.id, formattedSelectedDate).then(slots => {
      setBookedSlots(slots);
      setIsLoadingSlots(false);
      setSelectedTime(null); // Reset time selection when date changes
    });
  }, [selectedDate, provider.id, formattedSelectedDate]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTime || !patientName) {
      toast({
        title: 'Missing Information',
        description: 'Please enter your name and select a time slot.',
        variant: 'destructive',
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/appointments/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: provider.id,
          date: formattedSelectedDate,
          time: selectedTime,
          patientName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to book appointment.');
      }

      toast({
        title: 'Appointment Booked!',
        description: `Your appointment with ${provider.name} on ${format(selectedDate, 'MMMM do')} at ${selectedTime} is confirmed.`,
      });
      // In a real app, you might redirect to a confirmation page
      router.push('/patient-portal/appointments');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({
        title: 'Booking Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="mx-auto max-w-4xl">
       <div className="mb-10 text-center">
        <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Book an Appointment
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground md:text-xl">
          with {provider.name} - {provider.specialty}
        </p>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">1. Select a Date</h2>
            <Carousel
                opts={{
                align: 'start',
                dragFree: true,
                }}
                className="w-full"
            >
                <CarouselContent>
                {dates.map((date, index) => (
                    <CarouselItem key={index} className="basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/7">
                        <Button
                            variant={format(date, 'yyyy-MM-dd') === formattedSelectedDate ? 'default' : 'outline'}
                            className="flex h-24 w-full flex-col items-center justify-center gap-1"
                            onClick={() => setSelectedDate(date)}
                        >
                            <span className="text-sm font-medium uppercase">{format(date, 'EEE')}</span>
                            <span className="text-2xl font-bold">{format(date, 'd')}</span>
                            <span className="text-sm font-medium uppercase">{format(date, 'MMM')}</span>
                        </Button>
                    </CarouselItem>
                ))}
                </CarouselContent>
                <CarouselPrevious className="hidden sm:flex" />
                <CarouselNext className="hidden sm:flex" />
            </Carousel>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">2. Select a Time</h2>
           {isLoadingSlots ? (
            <div className='flex justify-center items-center h-24'>
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
                {availableTimeSlots.map(time => {
                const isBooked = bookedSlots.includes(time);
                return (
                    <Button
                    key={time}
                    variant={selectedTime === time ? 'default' : 'outline'}
                    disabled={isBooked}
                    onClick={() => !isBooked && setSelectedTime(time)}
                    >
                    {time}
                    </Button>
                );
                })}
            </div>
           )}
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
             <h2 className="text-xl font-bold mb-4">3. Your Information</h2>
             <form onSubmit={handleBooking} className='space-y-6'>
                <div className="space-y-2">
                    <Label htmlFor="patientName">Full Name</Label>
                    <Input 
                        id="patientName" 
                        placeholder="e.g., Jane Doe"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        required
                    />
                </div>
                 <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Confirm Appointment
                </Button>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}
