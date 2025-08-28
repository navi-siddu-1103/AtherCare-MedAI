'use server';

/**
 * @fileOverview A conversational AI flow for the MediAI chatbot.
 *
 * - chat - A function that handles the chatbot conversation.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatInputSchema = z.object({
  message: z.string().describe('The user\'s message to the chatbot.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe('The chatbot\'s response to the user.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const chatPrompt = ai.definePrompt({
  name: 'chatPrompt',
  input: { schema: ChatInputSchema },
  output: { schema: ChatOutputSchema },
  prompt: `You are MediAI, a friendly and helpful AI health assistant.

  Your capabilities include:
  - Analyzing skin images for conditions like acne.
  - Summarizing blood report PDFs.
  - Finding nearby hospitals in major Indian cities.
  - Answering general health-related questions.

  Engage in a helpful conversation with the user. 
  
  IMPORTANT: When providing any explanation or information, you MUST use bullet points or a numbered list. DO NOT write long paragraphs. Your responses must be concise, easy to read, and structured as a list. Be encouraging and always remind them to consult a qualified healthcare professional for any medical advice or diagnosis. Do not provide medical advice yourself.

  User message: {{{message}}}
  `,
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const { output } = await chatPrompt(input);
    return output!;
  }
);
