
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { getSymptomAnalysis } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle, Bot, Loader2, Sparkles, User } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

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
          Check Symptoms
        </>
      )}
    </Button>
  );
}

export function SymptomChecker() {
  const initialState = { error: null, data: null };
  const [state, formAction] = useActionState(getSymptomAnalysis, initialState);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="text-center">
        <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          AI Symptom Checker
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Describe your symptoms below, and our AI will provide potential causes
          and recommended next steps.
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
                placeholder="e.g., 'I have a persistent headache, slight fever, and a sore throat...'"
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
                <CardTitle>Potential Causes</CardTitle>
                <CardDescription>
                  Based on the symptoms you provided.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-base text-muted-foreground">
                {state.data.potentialCauses}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-lg shadow-card bg-white/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center gap-4">
               <div className="rounded-full bg-primary/10 p-3">
                <User className="h-6 w-6 text-primary" />
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
        </div>
      )}
    </div>
  );
}
