
'use client';

import { AlertCircle, Bot, HandHelping, Loader2, Sparkles, Stethoscope, Send } from 'lucide-react';
import Link from 'next/link';
import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { getSymptomAnalysis } from '@/app/actions';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Label, Textarea, Alert, AlertDescription, AlertTitle } from '@/components/nexus-ui';
import { NexusCard } from '@/components/nexus-ui/NexusCard';
import { NexusButton } from '@/components/nexus-ui/NexusButton';
import { NexusInput } from '@/components/nexus-ui/NexusInput';
import { NexusChatBubble } from '@/components/nexus-ui/NexusChatBubble';
import { NexusTypingIndicator } from '@/components/nexus-ui/NexusTypingIndicator';
import { useNexusAnimations } from '@/hooks/useNexusAnimations';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <NexusButton
      type="submit"
      disabled={pending}
      size="md"
      loading={pending}
      icon={pending ? undefined : <Send className="h-4 w-4" />}
    >
      {pending ? 'Analyzing...' : 'Send Message'}
    </NexusButton>
  );
}

export function MentalHealthChecker() {
  const initialState = { error: null, data: null };
  const [state, formAction] = useActionState(getSymptomAnalysis, initialState);
  const [userMessage, setUserMessage] = useState('');
  const [showTyping, setShowTyping] = useState(false);
  const { getSlideUpClasses } = useNexusAnimations();

  const handleSubmit = async (formData: FormData) => {
    const symptoms = formData.get('symptoms') as string;
    setUserMessage(symptoms);
    setShowTyping(true);
    
    // Simulate typing delay
    setTimeout(() => {
      setShowTyping(false);
      formAction(formData);
    }, 2000);
  };

  const AIAvatar = () => (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-nexus-accent-primary to-nexus-accent-secondary flex items-center justify-center">
      <Bot className="h-4 w-4 text-primary-foreground" />
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 nexus-animate-fade-in">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-nexus-text-primary">
          AI Mental Health Checker
        </h2>
        <p className="text-lg text-nexus-text-secondary max-w-2xl mx-auto">
          Have a conversation with our AI assistant about your mental health concerns. Get personalized insights based on WHO standards.
        </p>
      </div>

      {/* Chat Interface */}
      <NexusCard className="min-h-[600px] flex flex-col" padding="none">
        {/* Chat Header */}
        <div className="p-6 border-b border-nexus-border bg-nexus-bg-elevated rounded-t-lg">
          <div className="flex items-center gap-3">
            <AIAvatar />
            <div>
              <h3 className="font-semibold text-nexus-text-primary">Mental Health Assistant</h3>
              <p className="text-sm text-nexus-text-secondary">Here to help with your mental health questions</p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[400px] nexus-scrollbar">
          {/* Initial AI Message */}
          <NexusChatBubble
            message="Hello! I'm here to help you understand your mental health concerns. Please describe any symptoms or feelings you've been experiencing, and I'll provide insights and guidance based on professional standards."
            sender="ai"
            avatar={<AIAvatar />}
          />

          {/* User Message */}
          {userMessage && (
            <NexusChatBubble
              message={userMessage}
              sender="user"
              timestamp={new Date()}
            />
          )}

          {/* Typing Indicator */}
          {showTyping && (
            <NexusTypingIndicator
              avatar={<AIAvatar />}
              message="Analyzing your symptoms"
            />
          )}

          {/* AI Response - Analysis Results */}
          {state.data && !showTyping && (
            <>
              <NexusChatBubble
                message={`Based on your symptoms, here are some potential areas of concern:\n\n${state.data.potentialAreasOfConcern}`}
                sender="ai"
                avatar={<AIAvatar />}
                timestamp={new Date()}
              />

              <NexusChatBubble
                message={`Here are my recommended next steps:\n\n${state.data.nextSteps}`}
                sender="ai"
                avatar={<AIAvatar />}
                timestamp={new Date()}
              />

              {state.data.suggestedProviders && state.data.suggestedProviders.length > 0 && (
                <div className="space-y-4">
                  <NexusChatBubble
                    message={`I recommend connecting with these types of healthcare providers: ${state.data.suggestedProviders.join(', ')}`}
                    sender="ai"
                    avatar={<AIAvatar />}
                    timestamp={new Date()}
                  />
                  
                  <div className="flex justify-center">
                    <Link href="/providers">
                      <NexusButton size="lg" icon={<Stethoscope className="h-4 w-4" />}>
                        Book an Appointment
                      </NexusButton>
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Error Message */}
          {state.error && (
            <div className="p-4 bg-nexus-error/10 border border-nexus-error/20 rounded-lg">
              <div className="flex items-center gap-2 text-nexus-error">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Error</span>
              </div>
              <p className="text-sm text-nexus-error mt-1">{state.error}</p>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="p-6 border-t border-nexus-border bg-nexus-bg-surface rounded-b-lg">
          <form action={handleSubmit} className="flex gap-3">
            <div className="flex-1">
              <Textarea
                name="symptoms"
                placeholder="Describe your symptoms or feelings here... (e.g., 'For the past few weeks, I've felt persistently sad, have lost interest in hobbies, and struggle with sleep...')"
                className="min-h-[80px] resize-none bg-nexus-bg-primary border-nexus-border text-nexus-text-primary placeholder:text-nexus-text-muted focus:border-nexus-accent-primary"
                required
              />
            </div>
            <div className="flex items-end">
              <SubmitButton />
            </div>
          </form>
        </div>
      </NexusCard>

      {/* Disclaimer */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-nexus-bg-elevated border border-nexus-border rounded-lg text-sm text-nexus-text-secondary">
          <AlertCircle className="h-4 w-4 text-nexus-warning" />
          This tool is for informational purposes only and is not a substitute for professional medical advice.
        </div>
      </div>
    </div>
  );
}
