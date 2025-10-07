'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting edits to a machine translation.
 *
 * The flow takes the original text and the machine translation as input, and uses an LLM to suggest edits
 * to improve the accuracy and fluency of the translated text.
 *
 * - suggestEditsToTranslation - A function that suggests edits to a translation.
 * - SuggestEditsToTranslationInput - The input type for the suggestEditsToTranslation function.
 * - SuggestEditsToTranslationOutput - The return type for the suggestEditsToTranslation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestEditsToTranslationInputSchema = z.object({
  originalText: z
    .string()
    .describe('The original text that was translated.'),
  machineTranslation: z
    .string()
    .describe('The machine translated text to be improved.'),
  sourceLanguage: z.string().describe('The source language of the original text.'),
  targetLanguage: z.string().describe('The target language of the translation.'),
});
export type SuggestEditsToTranslationInput = z.infer<
  typeof SuggestEditsToTranslationInputSchema
>;

const SuggestEditsToTranslationOutputSchema = z.object({
  suggestedEdits: z
    .string()
    .describe(
      'Suggested edits and improvements to the machine translation to enhance accuracy and fluency.'
    ),
});
export type SuggestEditsToTranslationOutput = z.infer<
  typeof SuggestEditsToTranslationOutputSchema
>;

export async function suggestEditsToTranslation(
  input: SuggestEditsToTranslationInput
): Promise<SuggestEditsToTranslationOutput> {
  return suggestEditsToTranslationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestEditsToTranslationPrompt',
  input: {schema: SuggestEditsToTranslationInputSchema},
  output: {schema: SuggestEditsToTranslationOutputSchema},
  prompt: `You are an expert translation editor. Given the original text in {{sourceLanguage}} and the machine translation in {{targetLanguage}}, suggest edits to improve the accuracy and fluency of the translated text.

Original Text:
{{originalText}}

Machine Translation:
{{machineTranslation}}

Suggested Edits:
`,
});

const suggestEditsToTranslationFlow = ai.defineFlow(
  {
    name: 'suggestEditsToTranslationFlow',
    inputSchema: SuggestEditsToTranslationInputSchema,
    outputSchema: SuggestEditsToTranslationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
