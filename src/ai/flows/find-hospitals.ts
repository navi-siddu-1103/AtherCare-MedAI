'use server';

/**
 * @fileOverview This file defines a Genkit flow for finding nearby hospitals.
 *
 * - findHospitals - A flow that uses a tool to find hospitals based on a location query.
 * - findHospitalsTool - A tool that returns a list of mock hospitals for a given location in India.
 * - FindHospitalsInput - The input type for the findHospitals function.
 * - FindHospitalsOutput - The return type for the findHospitals function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const indianCities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Lucknow'
];

const mockHospitalsByCity: Record<string, any[]> = {
    'Mumbai': [
        { name: 'Bombay Hospital', address: '12, Marine Lines, Mumbai', distance: '2.1 km', services: ['Cardiology', 'Neurology', 'Oncology'], emergencyDoctorAvailability: 'Available' },
        { name: 'Lilavati Hospital', address: 'Bandra Reclamation, Mumbai', distance: '5.5 km', services: ['Orthopedics', 'Pediatrics', 'Emergency'], emergencyDoctorAvailability: 'On-call' },
    ],
    'Delhi': [
        { name: 'AIIMS', address: 'Ansari Nagar, New Delhi', distance: '3.0 km', services: ['General Medicine', 'Surgery', 'Trauma'], emergencyDoctorAvailability: 'Available' },
        { name: 'Max Healthcare', address: 'Saket, New Delhi', distance: '8.2 km', services: ['Cardiology', 'Radiology', 'Emergency'], emergencyDoctorAvailability: 'Available' },
    ],
    'Bangalore': [
        { name: 'Manipal Hospital', address: 'HAL Airport Road, Bangalore', distance: '4.5 km', services: ['Multi-specialty', 'Emergency', 'Diagnostics'], emergencyDoctorAvailability: 'On-call' },
        { name: 'Fortis Hospital', address: 'Bannerghatta Road, Bangalore', distance: '10 km', services: ['Cardiac Care', 'Urology', 'Neurology'], emergencyDoctorAvailability: 'Unavailable' },
    ],
    // Add more cities and hospitals as needed
};

const getDefaultHospitals = (city: string) => [
    { name: `${city} General Hospital`, address: `123 Health St, ${city}`, distance: '1.2 mi', services: ['Emergency', 'Cardiology', 'Pediatrics'], emergencyDoctorAvailability: 'Available' },
    { name: `Unity Medical Center`, address: `456 Wellness Ave, ${city}`, distance: '2.5 mi', services: ['Surgery', 'Oncology', 'Orthopedics'], emergencyDoctorAvailability: 'On-call' },
    { name: `St. Jude's Clinic`, address: `789 Care Blvd, ${city}`, distance: '3.1 mi', services: ['Family Medicine', 'Dermatology', 'Radiology'], emergencyDoctorAvailability: 'Unavailable' },
];


const findHospitalsTool = ai.defineTool(
    {
      name: 'findHospitals',
      description: `Returns a list of hospitals for a given city in India. Supported cities are: ${indianCities.join(', ')}.`,
      inputSchema: z.object({
        city: z.string().describe('The city in India to search for hospitals in.'),
      }),
      outputSchema: z.array(z.object({
        name: z.string(),
        address: z.string(),
        distance: z.string(),
        services: z.array(z.string()),
        emergencyDoctorAvailability: z.string().describe("Current availability of doctors for emergencies. Can be 'Available', 'On-call', or 'Unavailable'."),
      })),
    },
    async (input) => {
        const city = input.city;
        console.log(`Finding hospitals in ${city}`);
        const hospitals = mockHospitalsByCity[city] || getDefaultHospitals(city);
        return hospitals;
    }
);

const FindHospitalsInputSchema = z.object({
  query: z.string().describe('The user\'s query, like "hospitals in Delhi"'),
});
export type FindHospitalsInput = z.infer<typeof FindHospitalsInputSchema>;

const FindHospitalsOutputSchema = z.object({
  summary: z.string().describe("A brief, helpful summary for the user about the hospital search results."),
  hospitals: z.array(z.object({
    name: z.string(),
    address: z.string(),
    distance: z.string(),
    services: z.array(z.string()),
    emergencyDoctorAvailability: z.string().describe("Current availability of doctors for emergencies. Can be 'Available', 'On-call', or 'Unavailable'."),
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
    prompt: `You are a helpful assistant for finding medical facilities in India. 
    
    A user has asked to find hospitals. Use the findHospitals tool to get a list of hospitals for the specified location.
    
    If the user asks for a city not in the supported list, inform them that you can only search in the supported cities: ${indianCities.join(', ')}.
    
    Once you have the list, create a brief, one-sentence summary for the user. For example: "I found 2 hospitals for you in Mumbai."
    
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
