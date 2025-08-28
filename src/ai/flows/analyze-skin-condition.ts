'use server';

/**
 * @fileOverview AI-powered skin condition analysis flow.
 *
 * - analyzeSkinCondition - Analyzes a skin image for potential conditions.
 * - AnalyzeSkinConditionInput - The input type for the analyzeSkinCondition function.
 * - AnalyzeSkinConditionOutput - The return type for the analyzeSkinCondition function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSkinConditionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the skin, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeSkinConditionInput = z.infer<typeof AnalyzeSkinConditionInputSchema>;

const AnalyzeSkinConditionOutputSchema = z.object({
  analysis: z.object({
    acneProbability: z.number().describe('Probability of acne being present (0-1).'),
    otherConditionProbability: z.number().describe('Probability of another skin condition being present (0-1).'),
    conditionName: z.string().describe('Name of the detected skin condition, if any.'),
    confidenceLevel: z.string().describe('Confidence level of the analysis (Low, Medium, High).'),
    recommendation: z.string().describe('Recommendation based on the analysis.'),
  }),
});
export type AnalyzeSkinConditionOutput = z.infer<typeof AnalyzeSkinConditionOutputSchema>;

export async function analyzeSkinCondition(input: AnalyzeSkinConditionInput): Promise<AnalyzeSkinConditionOutput> {
  return analyzeSkinConditionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeSkinConditionPrompt',
  input: {schema: AnalyzeSkinConditionInputSchema},
  output: {schema: AnalyzeSkinConditionOutputSchema},
  prompt: `You are a dermatology AI assistant. Analyze the provided skin image for potential skin conditions, providing probability measures and confidence levels. If results are uncertain, gently encourage the user to consult with a human doctor.

Image: {{media url=photoDataUri}}

Output the analysis in JSON format.
`,
});

const analyzeSkinConditionFlow = ai.defineFlow(
  {
    name: 'analyzeSkinConditionFlow',
    inputSchema: AnalyzeSkinConditionInputSchema,
    outputSchema: AnalyzeSkinConditionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
