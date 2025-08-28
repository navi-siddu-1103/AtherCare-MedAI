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
        { name: 'Bombay Hospital & Medical Research Centre', address: '12, Marine Lines, Mumbai', distance: '2.1 km', services: ['Cardiology', 'Neurology', 'Oncology'], emergencyDoctorAvailability: 'Available' },
        { name: 'Lilavati Hospital and Research Centre', address: 'Bandra Reclamation, Mumbai', distance: '5.5 km', services: ['Orthopedics', 'Pediatrics', 'Emergency'], emergencyDoctorAvailability: 'On-call' },
        { name: 'H. N. Reliance Foundation Hospital', address: 'Prarthana Samaj, Girgaon, Mumbai', distance: '3.8 km', services: ['Multi-specialty', 'Diagnostics', 'Wellness'], emergencyDoctorAvailability: 'Available' },
        { name: 'Kokilaben Dhirubhai Ambani Hospital', address: 'Four Bungalows, Andheri West, Mumbai', distance: '12 km', services: ['Robotic Surgery', 'Cancer Care', 'Neurosciences'], emergencyDoctorAvailability: 'Available' },
        { name: 'Wockhardt Hospital', address: 'Mumbai Central, Mumbai', distance: '4.2 km', services: ['Cardiac Care', 'Urology', 'Gastroenterology'], emergencyDoctorAvailability: 'Unavailable' },
    ],
    'Delhi': [
        { name: 'All India Institute of Medical Sciences (AIIMS)', address: 'Ansari Nagar, New Delhi', distance: '3.0 km', services: ['General Medicine', 'Surgery', 'Trauma'], emergencyDoctorAvailability: 'Available' },
        { name: 'Max Healthcare', address: 'Saket, New Delhi', distance: '8.2 km', services: ['Cardiology', 'Radiology', 'Emergency'], emergencyDoctorAvailability: 'Available' },
        { name: 'Indraprastha Apollo Hospitals', address: 'Sarita Vihar, Delhi Mathura Road, New Delhi', distance: '15 km', services: ['Transplants', 'Pediatrics', 'Oncology'], emergencyDoctorAvailability: 'On-call' },
        { name: 'Fortis Escorts Heart Institute', address: 'Okhla road, New Delhi', distance: '13 km', services: ['Cardiac Surgery', 'Interventional Cardiology'], emergencyDoctorAvailability: 'Available' },
        { name: 'Sir Ganga Ram Hospital', address: 'Rajinder Nagar, New Delhi', distance: '5.5 km', services: ['Multi-specialty', 'Research', 'Emergency'], emergencyDoctorAvailability: 'Unavailable' },
    ],
    'Bangalore': [
        { name: 'Manipal Hospital', address: 'HAL Airport Road, Bangalore', distance: '4.5 km', services: ['Multi-specialty', 'Emergency', 'Diagnostics'], emergencyDoctorAvailability: 'On-call' },
        { name: 'Fortis Hospital', address: 'Bannerghatta Road, Bangalore', distance: '10 km', services: ['Cardiac Care', 'Urology', 'Neurology'], emergencyDoctorAvailability: 'Unavailable' },
        { name: 'Narayana Health City', address: 'Bommasandra Industrial Area, Bangalore', distance: '22 km', services: ['Heart', 'Cancer', 'Multi-specialty'], emergencyDoctorAvailability: 'Available' },
        { name: 'Sakra World Hospital', address: 'Devarabisanahalli, Marathahalli, Bangalore', distance: '14 km', services: ['Orthopedics', 'Neurosciences', 'Rehabilitation'], emergencyDoctorAvailability: 'Available' },
        { name: 'Apollo Hospitals', address: 'Jayanagar, Bangalore', distance: '8 km', services: ['Multi-specialty', 'Emergency', 'Preventive Health'], emergencyDoctorAvailability: 'On-call' },
    ],
    'Hyderabad': [
        { name: 'Apollo Hospitals, Jubilee Hills', address: 'Jubilee Hills, Hyderabad', distance: '6 km', services: ['Multi-specialty', 'Emergency', 'Robotics'], emergencyDoctorAvailability: 'Available' },
        { name: 'Yashoda Hospitals', address: 'Somajiguda, Hyderabad', distance: '3 km', services: ['Cancer', 'Neuro', 'Cardiac'], emergencyDoctorAvailability: 'On-call' },
        { name: 'Continental Hospitals', address: 'Gachibowli, Hyderabad', distance: '15 km', services: ['Multi-specialty', 'Trauma', 'Wellness'], emergencyDoctorAvailability: 'Available' },
        { name: 'Care Hospitals', address: 'Banjara Hills, Hyderabad', distance: '5 km', services: ['Cardiac', 'Neurology', 'Orthopedics'], emergencyDoctorAvailability: 'Unavailable' },
        { name: 'Sunshine Hospitals', address: 'Secunderabad, Hyderabad', distance: '8 km', services: ['Orthopedics', 'Joint Replacement', 'Trauma'], emergencyDoctorAvailability: 'Available' },
    ],
    'Ahmedabad': [
        { name: 'Sterling Hospital', address: 'Memnagar, Ahmedabad', distance: '7 km', services: ['Multi-specialty', 'Critical Care', 'Diagnostics'], emergencyDoctorAvailability: 'Available' },
        { name: 'Shalby Hospitals', address: 'SG Highway, Ahmedabad', distance: '12 km', services: ['Orthopedics', 'Joint Replacement', 'Spine'], emergencyDoctorAvailability: 'On-call' },
        { name: 'CIMS Hospital', address: 'Science City Road, Ahmedabad', distance: '10 km', services: ['Cardiology', 'Oncology', 'Transplants'], emergencyDoctorAvailability: 'Available' },
        { name: 'Narayana Multispeciality Hospital', address: 'Rakhial, Ahmedabad', distance: '5 km', services: ['Heart', 'Neurology', 'Nephrology'], emergencyDoctorAvailability: 'Unavailable' },
        { name: 'Apollo Hospitals', address: 'Bhat, Gandhinagar, Ahmedabad', distance: '18 km', services: ['Multi-specialty', 'Emergency', 'Preventive Care'], emergencyDoctorAvailability: 'Available' },
    ],
    'Chennai': [
        { name: 'Apollo Hospitals, Greams Road', address: 'Greams Road, Chennai', distance: '2 km', services: ['Multi-specialty', 'Emergency', 'Cancer Care'], emergencyDoctorAvailability: 'Available' },
        { name: 'Fortis Malar Hospital', address: 'Adyar, Chennai', distance: '8 km', services: ['Cardiac', 'Transplants', 'Neurology'], emergencyDoctorAvailability: 'On-call' },
        { name: 'MIOT International', address: 'Manapakkam, Chennai', distance: '15 km', services: ['Orthopedics', 'Trauma', 'Nephrology'], emergencyDoctorAvailability: 'Available' },
        { name: 'Kauvery Hospital', address: 'Alwarpet, Chennai', distance: '5 km', services: ['Multi-specialty', 'Emergency', 'Diabetology'], emergencyDoctorAvailability: 'Unavailable' },
        { name: 'Global Hospitals', address: 'Perumbakkam, Chennai', distance: '20 km', services: ['Liver Transplant', 'Cardiac', 'Neuro'], emergencyDoctorAvailability: 'Available' },
    ],
    'Kolkata': [
        { name: 'Apollo Gleneagles Hospitals', address: 'Canal Circular Road, Kolkata', distance: '7 km', services: ['Multi-specialty', 'Robotics', 'Emergency'], emergencyDoctorAvailability: 'Available' },
        { name: 'Fortis Hospital, Anandapur', address: 'Anandapur, Kolkata', distance: '10 km', services: ['Cardiac', 'Neurology', 'Kidney'], emergencyDoctorAvailability: 'On-call' },
        { name: 'Peerless Hospital', address: 'Panchasayar, Kolkata', distance: '12 km', services: ['Multi-specialty', 'Cardiac', 'Gastroenterology'], emergencyDoctorAvailability: 'Available' },
        { name: 'AMRI Hospitals', address: 'Dhakuria, Kolkata', distance: '5 km', services: ['Trauma', 'Orthopedics', 'Oncology'], emergencyDoctorAvailability: 'Unavailable' },
        { name: 'Medica Superspecialty Hospital', address: 'Mukundapur, Kolkata', distance: '11 km', services: ['Heart', 'Neuro', 'Critical Care'], emergencyDoctorAvailability: 'Available' },
    ],
    'Pune': [
        { name: 'Ruby Hall Clinic', address: 'Sassoon Road, Pune', distance: '3 km', services: ['Multi-specialty', 'Cancer', 'Transplants'], emergencyDoctorAvailability: 'Available' },
        { name: 'Jehangir Hospital', address: 'Sassoon Road, Pune', distance: '3.5 km', services: ['Emergency', 'ICU', 'Multi-specialty'], emergencyDoctorAvailability: 'On-call' },
        { name: 'Deenanath Mangeshkar Hospital', address: 'Erandwane, Pune', distance: '6 km', services: ['Multi-specialty', 'Research', 'Critical Care'], emergencyDoctorAvailability: 'Available' },
        { name: 'Sahyadri Super Speciality Hospital', address: 'Deccan Gymkhana, Pune', distance: '5 km', services: ['Neurology', 'Orthopedics', 'Urology'], emergencyDoctorAvailability: 'Unavailable' },
        { name: 'Aditya Birla Memorial Hospital', address: 'Chinchwad, Pune', distance: '18 km', services: ['Multi-specialty', 'Wellness', 'Emergency'], emergencyDoctorAvailability: 'Available' },
    ],
    'Jaipur': [
        { name: 'Fortis Escorts Hospital', address: 'Malviya Nagar, Jaipur', distance: '8 km', services: ['Cardiac', 'Neuro', 'Orthopedics'], emergencyDoctorAvailability: 'Available' },
        { name: 'Narayana Multispeciality Hospital', address: 'Pratap Nagar, Jaipur', distance: '12 km', services: ['Multi-specialty', 'Heart', 'Cancer'], emergencyDoctorAvailability: 'On-call' },
        { name: 'Manipal Hospital', address: 'Vidhyadhar Nagar, Jaipur', distance: '7 km', services: ['Emergency', 'Multi-specialty', 'Diagnostics'], emergencyDoctorAvailability: 'Available' },
        { name: 'SMS Hospital', address: 'JLN Marg, Jaipur', distance: '4 km', services: ['Public Hospital', 'Trauma', 'General Medicine'], emergencyDoctorAvailability: 'Unavailable' },
        { name: 'Apex Hospital', address: 'Malviya Nagar, Jaipur', distance: '8.5 km', services: ['Multi-specialty', 'Critical Care', 'IVF'], emergencyDoctorAvailability: 'Available' },
    ],
    'Lucknow': [
        { name: 'Medanta Hospital', address: 'Amar Shaheed Path, Lucknow', distance: '15 km', services: ['Multi-specialty', 'Cardiac', 'Oncology'], emergencyDoctorAvailability: 'Available' },
        { name: 'Apollomedics Super Speciality Hospital', address: 'LDA Colony, Lucknow', distance: '10 km', services: ['Multi-specialty', 'Emergency', 'Robotics'], emergencyDoctorAvailability: 'On-call' },
        { name: 'Sahara Hospital', address: 'Gomti Nagar, Lucknow', distance: '8 km', services: ['Multi-specialty', 'Neuro', 'Critical Care'], emergencyDoctorAvailability: 'Available' },
        { name: 'SGPGI', address: 'Raebareli Road, Lucknow', distance: '12 km', services: ['Tertiary Care', 'Research', 'Endocrinology'], emergencyDoctorAvailability: 'Unavailable' },
        { name: 'Ram Manohar Lohia Institute of Medical Sciences', address: 'Gomti Nagar, Lucknow', distance: '7 km', services: ['Public Hospital', 'Cardiology', 'Neurology'], emergencyDoctorAvailability: 'Available' },
    ]
};

const getDefaultHospitals = (city: string) => [
    { name: `${city} Central Hospital`, address: `1 Civic Center Plaza, ${city}`, distance: '2.5 km', services: ['Emergency', 'General Surgery', 'Radiology'], emergencyDoctorAvailability: 'Available' },
    { name: `Riverside Medical Group`, address: `8 River St, ${city}`, distance: '4.8 km', services: ['Family Medicine', 'Pediatrics', 'Dermatology'], emergencyDoctorAvailability: 'On-call' },
    { name: `St. Mary's Health Center`, address: `900 Mercy Ave, ${city}`, distance: '6.2 km', services: ['Maternity', 'Cardiology', 'Oncology'], emergencyDoctorAvailability: 'Available' },
    { name: `Community General Hospital`, address: `33 Union Sq, ${city}`, distance: '8.0 km', services: ['Orthopedics', 'Neurology', 'Rehabilitation'], emergencyDoctorAvailability: 'Unavailable' },
    { name: `Lakeview Regional Clinic`, address: `15 Lake Rd, ${city}`, distance: '10.5 km', services: ['Preventive Care', 'Diagnostics', 'Urology'], emergencyDoctorAvailability: 'On-call' },
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
    
    Once you have the list, create a brief, one-sentence summary for the user. For example: "I found 5 hospitals for you in Mumbai."
    
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
