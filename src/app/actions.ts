
'use server';

import { checkSymptoms, CheckSymptomsOutput } from '@/ai/flows/ai-symptom-checker';
import { z } from 'zod';

const SymptomSchema = z.object({
  symptoms: z.string().min(10, {
    message: 'Please provide a more detailed description of your symptoms (at least 10 characters).',
  }),
});

type FormState = {
  error: string | null;
  data: CheckSymptomsOutput | null;
}

export async function getSymptomAnalysis(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
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
