'use client';

import { Mic, MicOff, Video, VideoOff, PhoneOff, CircleDot, Circle } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Badge } from '../ui/badge';

type Appointment = {
  id: string;
  providerName: string;
  specialty: string;
};

// --- Developer Instructions: Integrating a Video SDK ---
// This component is a placeholder UI for a video call. To make it functional,
// you will need to integrate a video SDK, such as Zoom's Video SDK.
//
// 1. HIPAA & BAA:
//    For healthcare applications, you MUST use a video SDK provider that will sign
//    a Business Associate Agreement (BAA) to ensure HIPAA compliance. Zoom for
//    Healthcare is one such option. Do not use standard SDKs without a BAA.
//
// 2. SDK Integration Steps:
//    - Install the SDK: `npm install @zoom/videosdk`
//    - API Keys: Store your Zoom Video SDK Key and Secret securely on your backend.
//      NEVER expose your SDK Secret on the client-side.
//    - Generate a Signature: Your backend will need an endpoint that uses your SDK
//      Key and Secret to generate a unique signature for each user joining a session.
//      This signature is required to initialize the SDK on the client.
//    - Initialize SDK: In a `useEffect` hook, fetch the signature from your backend
//      and use it to initialize the Zoom SDK client.
//    - Join Session: Use the client to join a session. You will need a session name/ID.
//    - Render Video: The SDK will provide methods to start rendering remote and local
//      video streams onto `<canvas>` elements. You would replace the placeholder
//      `div` with these canvas elements.
//
// 3. Switching Providers:
//    To switch to another provider (e.g., Twilio, Vonage), the core concepts are similar:
//    - Obtain API keys.
//    - Generate a client-side token/signature from your backend.
//    - Use the token to initialize the client-side SDK.
//    - Attach video streams to DOM elements.
//    - Always ensure the provider will sign a BAA for HIPAA compliance.

export function VideoCall({ appointment }: { appointment: Appointment }) {
  const [isMicMuted, setIsMicMuted] = React.useState(false);
  const [isVideoOff, setIsVideoOff] = React.useState(false);
  const [isRecording, setIsRecording] = React.useState(false);

  // In a real implementation, the SDK would be initialized here.
  // Example:
  // React.useEffect(() => {
  //   const initZoom = async () => {
  //     const zoomClient = ZoomVideo.createClient();
  //     const signature = await fetch('/api/zoom/signature', { method: 'POST', ... }).then(res => res.json());
  //     await zoomClient.init('en-US', 'CDN');
  //     await zoomClient.join('session-name', signature.token, 'user-name');
  //     // ... SDK event listeners and video rendering logic
  //   };
  //   initZoom();
  // }, []);

  return (
    <div className="flex h-full flex-col p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Video Call</h1>
          <p className="text-muted-foreground">
            with {appointment.providerName} ({appointment.specialty})
          </p>
        </div>
        <Badge variant="destructive" className="flex items-center gap-2">
            <Circle className="animate-ping h-2 w-2 fill-current" />
            <span>Live</span>
        </Badge>
      </div>

      <div className="relative flex-1 rounded-lg bg-card shadow-card overflow-hidden">
        {/* Main video stream (remote user) - Placeholder */}
        {/* In a real app, a <canvas> from the Zoom SDK would go here */}
        <div className="h-full w-full bg-black flex items-center justify-center text-card-foreground">
            <p>Remote video stream</p>
        </div>

        {/* Local user's video stream - Placeholder */}
        {/* In a real app, a <canvas> from the Zoom SDK would go here */}
        <div className="absolute bottom-4 right-4 h-32 w-48 rounded-md border-2 border-primary bg-black/50 shadow-lg flex items-center justify-center text-primary-foreground text-sm">
           <p>Local video</p>
        </div>

        {isVideoOff && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white">
                <VideoOff size={48} className="mb-4" />
                <p>Your video is off</p>
            </div>
        )}
      </div>

      <Card className="mt-4">
        <CardContent className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="record-switch" className="font-semibold">
              Record Session
            </Label>
            {/* Mocked recording toggle */}
            <Switch
              id="record-switch"
              checked={isRecording}
              onCheckedChange={setIsRecording}
              aria-label="Toggle session recording"
            />
             {isRecording && <CircleDot size={16} className="text-destructive animate-pulse" />}
          </div>
          <div className="flex items-center justify-center gap-2">
            <Button
              variant={isMicMuted ? 'destructive' : 'outline'}
              size="icon"
              onClick={() => setIsMicMuted(prev => !prev)}
              aria-label={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {isMicMuted ? <MicOff /> : <Mic />}
            </Button>
            <Button
              variant={isVideoOff ? 'destructive' : 'outline'}
              size="icon"
              onClick={() => setIsVideoOff(prev => !prev)}
              aria-label={isVideoOff ? 'Start video' : 'Stop video'}
            >
              {isVideoOff ? <VideoOff /> : <Video />}
            </Button>
            <Button variant="destructive" size="icon" aria-label="End call">
              <PhoneOff />
            </Button>
          </div>
          <div className='w-24 hidden sm:block' /> 
        </CardContent>
      </Card>

      <Alert variant="destructive" className="mt-4">
        <AlertTitle>HIPAA & BAA Notice</AlertTitle>
        <AlertDescription>
           For healthcare use, ensure your video provider signs a Business Associate Agreement (BAA) to comply with HIPAA regulations. This implementation uses placeholder UI and is not HIPAA compliant by default.
        </AlertDescription>
      </Alert>
    </div>
  );
}
