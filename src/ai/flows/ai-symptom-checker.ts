'use server';

/**
 * @fileOverview An AI-powered symptom checker flow.
 *
 * - checkSymptoms - A function that accepts a description of symptoms and returns potential causes and next steps.
 * - CheckSymptomsInput - The input type for the checkSymptoms function.
 * - CheckSymptomsOutput - The return type for the checkSymptoms function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CheckSymptomsInputSchema = z.object({
  symptoms: z
    .string()
    .describe('A detailed description of the symptoms experienced by the patient.'),
});
export type CheckSymptomsInput = z.infer<typeof CheckSymptomsInputSchema>;

const CheckSymptomsOutputSchema = z.object({
  potentialCauses: z
    .string()
    .describe('A list of potential causes for the described symptoms.'),
  nextSteps: z
    .string()
    .describe('Recommended next steps for the patient to take based on the symptoms.'),
});
export type CheckSymptomsOutput = z.infer<typeof CheckSymptomsOutputSchema>;

export async function checkSymptoms(input: CheckSymptomsInput): Promise<CheckSymptomsOutput> {
  return checkSymptomsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'checkSymptomsPrompt',
  input: {schema: CheckSymptomsInputSchema},
  output: {schema: CheckSymptomsOutputSchema},
  prompt: `You are an AI-powered symptom checker. A patient will describe their symptoms, and you will provide potential causes and recommended next steps.

IMPORTANT: Always start your response with a clear disclaimer that you are an AI assistant and not a medical professional, and that the user should consult with a healthcare provider for any medical concerns.

Symptoms: {{{symptoms}}}

Respond in a professional and helpful tone, focusing on providing informative potential causes and practical next steps after the disclaimer.`,
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
