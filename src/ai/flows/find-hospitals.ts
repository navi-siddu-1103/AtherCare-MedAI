'use server';

/**
 * @fileOverview This file defines a Genkit flow for finding nearby hospitals.
 *
 * - findHospitals - A flow that uses a tool to find hospitals based on a location query.
 * - findHospitalsTool - A tool that returns a list of mock hospitals for a given location.
 * - FindHospitalsInput - The input type for the findHospitals function.
 * - FindHospitalsOutput - The return type for the findHospitals function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const mockHospitals = [
    { name: 'City General Hospital', address: '123 Health St, Metropolis', distance: '1.2 mi', services: ['Emergency', 'Cardiology', 'Pediatrics'] },
    { name: 'Unity Medical Center', address: '456 Wellness Ave, Metropolis', distance: '2.5 mi', services: ['Surgery', 'Oncology', 'Orthopedics'] },
    { name: 'St. Jude\'s Clinic', address: '789 Care Blvd, Metropolis', distance: '3.1 mi', services: ['Family Medicine', 'Dermatology', 'Radiology'] },
    { name: 'County Health Services', address: '101 Healing Rd, Metropolis', distance: '4.8 mi', services: ['Emergency', 'General Surgery', 'Neurology'] },
    { name: 'Hopewell Emergency Care', address: '210 Rescue Run, Metropolis', distance: '5.2 mi', services: ['Emergency', 'Urgent Care'] },
    { name: 'Metropolis University Hospital', address: '555 University Dr, Metropolis', distance: '6.0 mi', services: ['Trauma Center', 'Research', 'Specialty Care'] },
];

const findHospitalsTool = ai.defineTool(
    {
      name: 'findHospitals',
      description: 'Returns a list of hospitals for a given city.',
      inputSchema: z.object({
        city: z.string().describe('The city to search for hospitals in.'),
      }),
      outputSchema: z.array(z.object({
        name: z.string(),
        address: z.string(),
        distance: z.string(),
        services: z.array(z.string()),
      })),
    },
    async (input) => {
        // In a real app, this would query a database or an external API.
        // We'll return mock data for any city for demonstration.
        console.log(`Finding hospitals in ${input.city}`);
        return mockHospitals;
    }
);

const FindHospitalsInputSchema = z.object({
  query: z.string().describe('The user\'s query, like "hospitals in Metropolis"'),
});
export type FindHospitalsInput = z.infer<typeof FindHospitalsInputSchema>;

const FindHospitalsOutputSchema = z.object({
  summary: z.string().describe("A brief, helpful summary for the user about the hospital search results."),
  hospitals: z.array(z.object({
    name: z.string(),
    address: z.string(),
    distance: z.string(),
    services: z.array(z.string()),
  })).describe("The list of hospitals found."),
});
export type FindHospitalsOutput = z.infer<typeof FindHospitalsOutputSchema>;

export async function findHospitals(input: FindHospitalsInput): Promise<FindHospitalsOutput> {
    return findHospitalsFlow(input);
}
  
const findHospitalsPrompt = ai.definePrompt({
    name: 'findHospitalsPrompt',
    input: { schema: FindHospitalsInputSchema },
    output: { schema: FindHospitalsOutputSchema },
    tools: [findHospitalsTool],
    prompt: `You are a helpful assistant for finding medical facilities. 
    
    A user has asked to find hospitals. Use the findHospitals tool to get a list of hospitals for the specified location.
    
    Once you have the list, create a brief, one-sentence summary for the user. For example: "I found 6 hospitals for you in Metropolis."
    
    Then, return the full list of hospitals you found.
    
    User query: {{{query}}}
    `,
});

const findHospitalsFlow = ai.defineFlow(
    {
        name: 'findHospitalsFlow',
        inputSchema: FindHospitalsInputSchema,
        outputSchema: FindHospitalsOutputSchema,
    },
    async (input) => {
        const { output } = await findHospitalsPrompt(input);
        return output!;
    }
);