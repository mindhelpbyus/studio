
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { checkSymptoms, CheckSymptomsOutput } from '@/ai/flows/ai-mental-health-checker';

const SymptomSchema = z.object({
  symptoms: z.string().min(10, {
    message: 'Please provide a more detailed description of your symptoms (at least 10 characters).',
  }),
});

type SymptomCheckFormState = {
  error: string | null;
  data: CheckSymptomsOutput | null;
}

export async function getSymptomAnalysis(
  prevState: SymptomCheckFormState,
  formData: FormData
): Promise<SymptomCheckFormState> {
  const validatedFields = SymptomSchema.safeParse({
    symptoms: formData.get('symptoms'),
  });

  if (!validatedFields.success) {
    return {
      error:
        validatedFields.error.flatten().fieldErrors.symptoms?.[0] ||
        'Invalid input.',
      data: null,
    };
  }

  try {
    const result = await checkSymptoms({
      symptoms: validatedFields.data.symptoms,
    });
    return { error: null, data: result };
  } catch (error) {
    console.error('Symptom checker AI error:', error);
    return {
      error: 'An unexpected error occurred. Please try again later.',
      data: null,
    };
  }
}


// --- Login Action ---

const LoginSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormState = {
    error: string | null;
    message: string;
}

export async function login(prevState: LoginFormState, formData: FormData): Promise<LoginFormState> {
    const validatedFields = LoginSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        const errors = validatedFields.error.flatten().fieldErrors;
        return {
            error: errors.email?.[0] ?? errors.password?.[0] ?? 'Invalid input.',
            message: '',
        };
    }

    const { email, password } = validatedFields.data;

    try {
        // We need the full URL for server-side fetch
        const host = process.env.NEXT_PUBLIC_HOST_URL || 'http://localhost:9002';
        const response = await fetch(`${host}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            return { error: data.message || 'Invalid credentials.', message: '' };
        }

        // The API route sets the cookie, so we just need to redirect.
    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message, message: '' };
        }
        return { error: 'An unknown error occurred.', message: '' };
    }

    // Redirect to the provider portal.
    redirect('/provider-portal/calendar');
}
