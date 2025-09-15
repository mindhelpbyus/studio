'use server';

/**
 * @fileOverview An AI-powered mental health symptom checker flow.
 *
 * - checkSymptoms - A function that accepts a description of symptoms and returns potential areas of concern and next steps.
 * - CheckSymptomsInput - The input type for the checkSymptoms function.
 * - CheckSymptomsOutput - The return type for the checkSymptoms function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CheckSymptomsInputSchema = z.object({
  symptoms: z
    .string()
    .describe('A detailed description of the mental and emotional symptoms experienced by the patient.'),
});
export type CheckSymptomsInput = z.infer<typeof CheckSymptomsInputSchema>;

const CheckSymptomsOutputSchema = z.object({
  potentialAreasOfConcern: z
    .string()
    .describe('A list of potential areas of concern based on the described symptoms, framed in a non-diagnostic manner.'),
  nextSteps: z
    .string()
    .describe('Recommended next steps for the user to take, such as consulting a therapist or psychiatrist.'),
  suggestedProviders: z.array(z.string()).describe("A list of suggested provider specialties (e.g., 'Therapist', 'Psychiatrist') based on the symptoms. This should not be an exhaustive list, but tailored to the user's input."),
});
export type CheckSymptomsOutput = z.infer<typeof CheckSymptomsOutputSchema>;

export async function checkSymptoms(input: CheckSymptomsInput): Promise<CheckSymptomsOutput> {
  return checkSymptomsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'checkSymptomsPrompt',
  input: {schema: CheckSymptomsInputSchema},
  output: {schema: CheckSymptomsOutputSchema},
  prompt: `You are an AI-powered mental health symptom checker, designed to provide preliminary insights for users seeking information about therapy and psychiatry. Your guidance should be aligned with World Health Organization (WHO) standards and classifications (like ICD-11 for Mental, Behavioural or Neurodevelopmental Disorders) where applicable, but you must not provide a diagnosis.

A user will describe their symptoms, and you will provide potential areas of concern, recommended next steps, and a list of suggested provider types.

IMPORTANT: Always start your response with a clear disclaimer that you are an AI assistant and not a medical professional, and that the user should consult with a qualified healthcare provider (like a therapist or psychiatrist) for any medical or mental health concerns. This is not a substitute for professional medical advice, diagnosis, or treatment.

Symptoms: {{{symptoms}}}

After the disclaimer, respond in a professional, empathetic, and helpful tone. Focus on providing informative potential areas of concern in a non-diagnostic manner and give practical next steps, such as seeking professional help. Finally, populate the suggestedProviders array with relevant specialties.`,
});

const checkSymptomsFlow = ai.defineFlow(
  {
    name: 'checkSymptomsFlow',
    inputSchema: CheckSymptomsInputSchema,
    outputSchema: CheckSymptomsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
