'use server';

/**
 * @fileOverview Summarizes the context of a document segment for translation review.
 *
 * - summarizeDocumentContext - A function that summarizes the context of a document segment.
 * - SummarizeDocumentContextInput - The input type for the summarizeDocumentContext function.
 * - SummarizeDocumentContextOutput - The return type for the summarizeDocumentContext function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeDocumentContextInputSchema = z.object({
  documentContext: z
    .string()
    .describe('The surrounding context of the document segment to be translated.'),
  segmentText: z.string().describe('The text of the document segment being translated.'),
});
export type SummarizeDocumentContextInput = z.infer<
  typeof SummarizeDocumentContextInputSchema
>;

const SummarizeDocumentContextOutputSchema = z.object({
  summary: z.string().describe('A short summary of the document segment context.'),
});
export type SummarizeDocumentContextOutput = z.infer<
  typeof SummarizeDocumentContextOutputSchema
>;

export async function summarizeDocumentContext(
  input: SummarizeDocumentContextInput
): Promise<SummarizeDocumentContextOutput> {
  return summarizeDocumentContextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeDocumentContextPrompt',
  input: {schema: SummarizeDocumentContextInputSchema},
  output: {schema: SummarizeDocumentContextOutputSchema},
  prompt: `You are an expert summarizer specializing in providing context for document translation.

  Given the following document context and segment text, provide a short summary of the context that will aid in translation.

  Document Context: {{{documentContext}}}
  Segment Text: {{{segmentText}}}

  Summary: `,
});

const summarizeDocumentContextFlow = ai.defineFlow(
  {
    name: 'summarizeDocumentContextFlow',
    inputSchema: SummarizeDocumentContextInputSchema,
    outputSchema: SummarizeDocumentContextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
