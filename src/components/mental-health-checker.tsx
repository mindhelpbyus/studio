
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { getSymptomAnalysis } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle, Bot, HandHelping, Loader2, Sparkles, Stethoscope } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import Link from 'next/link';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      size="lg"
      className="w-full sm:w-auto"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Analyzing...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Analyze Symptoms
        </>
      )}
    </Button>
  );
}

export function MentalHealthChecker() {
  const initialState = { error: null, data: null };
  const [state, formAction] = useFormState(getSymptomAnalysis, initialState);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="text-center">
        <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          AI Mental Health Checker
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Describe your symptoms, and our AI assistant will provide potential areas of concern and guide you toward the right professional help, based on WHO standards.
        </p>
      </div>

      <Card className="rounded-lg shadow-card bg-white/60 backdrop-blur-sm">
        <CardContent className="p-6">
          <form action={formAction} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="symptoms" className="text-base font-medium">
                Describe your symptoms
              </Label>
              <Textarea
                id="symptoms"
                name="symptoms"
                placeholder="e.g., 'For the past few weeks, I've felt persistently sad, have lost interest in hobbies, and struggle with sleep...'"
                className="min-h-[120px] rounded-md text-base bg-transparent"
                required
              />
            </div>
            {state.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{state.error}</AlertDescription>
                </Alert>
              )}
            <div className="flex justify-center">
              <SubmitButton />
            </div>
          </form>
        </CardContent>
      </Card>
      
      <div className="pt-4 text-center text-sm text-muted-foreground">
        <p className='flex items-center justify-center gap-2'><AlertCircle size={16} />This tool is for informational purposes only and is not a substitute for professional medical advice.</p>
      </div>

      {state.data && (
        <div className="space-y-8 pt-8">
          <h3 className="text-center font-headline text-2xl font-bold">
            Your Analysis Results
          </h3>
          <Card className="rounded-lg shadow-card bg-white/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Potential Areas of Concern</CardTitle>
                <CardDescription>
                  Based on the symptoms you provided.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-base text-muted-foreground">
                {state.data.potentialAreasOfConcern}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-lg shadow-card bg-white/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center gap-4">
               <div className="rounded-full bg-primary/10 p-3">
                <HandHelping className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Recommended Next Steps</CardTitle>
                <CardDescription>
                  Suggestions for what to do next.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-base text-muted-foreground">
                {state.data.nextSteps}
              </p>
            </CardContent>
          </Card>
          
          {state.data.suggestedProviders && state.data.suggestedProviders.length > 0 && (
             <Card className="rounded-lg shadow-card bg-accent/30 border-primary/50">
                <CardHeader className="flex flex-row items-center gap-4">
                <div className="rounded-full bg-primary/10 p-3">
                    <Stethoscope className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <CardTitle>Find the Right Professional</CardTitle>
                    <CardDescription>
                    We suggest connecting with the following types of providers:
                    </CardDescription>
                </div>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                    <div className='flex flex-wrap gap-2'>
                        {state.data.suggestedProviders.map(provider => (
                             <div key={provider} className="inline-block rounded-full bg-primary/20 px-3 py-1 text-sm font-semibold text-primary-foreground">{provider}</div>
                        ))}
                    </div>
                    <Link href="/providers">
                        <Button size="lg" className='w-full sm:w-auto'>
                           Book an Appointment
                        </Button>
                    </Link>
                </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
