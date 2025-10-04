
'use client';

import { AlertCircle, Loader2, Video } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState } from 'react';
import React from 'react';
import { useFormStatus } from 'react-dom';
import { login } from '@/app/actions';
import Logo from '@/components/logo';
import { Alert, AlertDescription, AlertTitle } from '@/components/nexus-ui/alert';
import { Button } from '@/components/nexus-ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/nexus-ui/card';
import { Input } from '@/components/nexus-ui/input';
import { Label } from '@/components/nexus-ui/label';

function ProviderSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button 
        type="submit" 
        className="w-full" 
        disabled={pending}
    >
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Sign In
    </Button>
  );
}

function PatientJoinForm() {
    const router = useRouter();
    const [meetingId, setMeetingId] = React.useState('');
  
    const handleJoin = (e: React.FormEvent) => {
      e.preventDefault();
      if (meetingId) {
        router.push(`/patient-portal/video-call/${meetingId}`);
      }
    };

  return (
    <div className='px-6 pb-6'>
        <CardHeader className='p-0 mb-4'>
            <CardTitle className="text-2xl">Join Your Session</CardTitle>
            <CardDescription>
                Enter your meeting ID to join the telehealth call.
            </CardDescription>
        </CardHeader>
        <form onSubmit={handleJoin} className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="meetingId">Meeting ID</Label>
            <Input
            id="meetingId"
            name="meetingId"
            type="text"
            placeholder="Enter meeting ID"
            required
            value={meetingId}
            onChange={(e) => setMeetingId(e.target.value)}
            />
        </div>
        <Button 
            type="submit" 
            className="w-full"
        >
            <Video className="mr-2 h-4 w-4" />
            Join Call
        </Button>
        </form>
    </div>
  )
}


export default function LoginPage() {
  const initialState = { error: null, message: '' };
  const [state, formAction] = useActionState(login, initialState);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 bg-surface p-4">
      <Link href="/" className="absolute top-8 left-8">
        <Logo position="absolute" top="2rem" left="2rem" />
      </Link>

      <Card className="w-full max-w-md rounded-2xl shadow-lg border-border">
        <CardHeader>
          <CardTitle className="text-2xl">Provider Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                defaultValue="provider@example.com"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="ml-auto inline-block text-sm underline">
                  Forgot your password?
                </Link>
              </div>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
                defaultValue="password123"
              />
            </div>
            
            {state?.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Login Failed</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            <ProviderSubmitButton />
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have a provider account?{' '}
            <Link href="#" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>

        <div className="relative my-2 px-6">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                Or
                </span>
            </div>
        </div>

        <PatientJoinForm />
      </Card>
    </div>
  );
}
