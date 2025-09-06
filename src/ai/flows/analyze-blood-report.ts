
'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing blood report PDFs.
 *
 * - analyzeBloodReport - Analyzes a blood report PDF and provides a summary of key findings and potential implications.
 * - AnalyzeBloodReportInput - The input type for the analyzeBloodReport function, which is a data URI of the blood report PDF.
 * - AnalyzeBloodReportOutput - The return type for the analyzeBloodReport function, which is a string containing the analysis result.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { PDFLoader } from "langchain/document_loaders/fs/pdf";

const AnalyzeBloodReportInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A blood report PDF, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
    pdfText: z.string().optional(),
});
export type AnalyzeBloodReportInput = z.infer<typeof AnalyzeBloodReportInputSchema>;

const AnalyzeBloodReportOutputSchema = z.object({
  analysisResult: z
    .string()
    .describe("A structured, AI-powered analysis summarizing key findings, health implications, and next steps. Each section is a heading followed by bullet points starting with '*'. Example: 'Results Interpretation\\n* Point 1\\n* Point 2'"),
});
export type AnalyzeBloodReportOutput = z.infer<typeof AnalyzeBloodReportOutputSchema>;

export async function analyzeBloodReport(input: AnalyzeBloodReportInput): Promise<AnalyzeBloodReportOutput> {
  return analyzeBloodReportFlow(input);
}

const analyzeBloodReportPrompt = ai.definePrompt({
  name: 'analyzeBloodReportPrompt',
  input: { schema: AnalyzeBloodReportInputSchema },
  output: { schema: AnalyzeBloodReportOutputSchema },
  prompt: `You are a medical expert skilled in analyzing blood reports. Provide a well-structured analysis of these CBC results with clear sections.

  **CRITICAL INSTRUCTIONS:**
  1.  Provide three distinct sections with these exact headings: "Results Interpretation", "What It Means for Health", and "Next Steps/Questions for Provider".
  2.  Each heading must be on its own line.
  3.  Under each heading, provide a list of bullet points starting with '*'.
  4.  DO NOT use any other markdown (like '##' or bolding with '**').
  5.  Keep the language simple and easy to understand.
  6.  Be concise.

  Here is the blood report:
  {{{pdfText}}}`,
});

const analyzeBloodReportFlow = ai.defineFlow(
  {
    name: 'analyzeBloodReportFlow',
    inputSchema: AnalyzeBloodReportInputSchema,
    outputSchema: AnalyzeBloodReportOutputSchema,
  },
  async input => {
    // Extract the PDF data from the data URI.
    const pdfData = Buffer.from(input.pdfDataUri.split(',')[1], 'base64');

    // Use PDFLoader to load the PDF data.
    const loader = new PDFLoader(new Blob([pdfData]));
    const docs = await loader.load();

    // Extract text content from the PDF documents.
    const pdfText = docs.map(doc => doc.pageContent).join('\n');

    // Call the prompt to analyze the blood report.
    const { output } = await analyzeBloodReportPrompt({
      pdfDataUri: input.pdfDataUri,
      pdfText: pdfText,
    });

    return output!;
  }
);
