'use server';

/**
 * @fileOverview A document segment translation AI agent with LLM fallback.
 *
 * - translateWithLLMFallback - A function that handles the translation process with LLM fallback.
 * - TranslateWithLLMFallbackInput - The input type for the translateWithLLMFallback function.
 * - TranslateWithLLMFallbackOutput - The return type for the translateWithLLMFallback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateWithLLMFallbackInputSchema = z.object({
  src_lang: z.string().describe('The source language of the text.'),
  tgt_lang: z.string().describe('The target language for the translation.'),
  text: z.string().describe('The text to be translated.'),
});
export type TranslateWithLLMFallbackInput = z.infer<typeof TranslateWithLLMFallbackInputSchema>;

const TranslateWithLLMFallbackOutputSchema = z.object({
  translation: z.string().describe('The translated text.'),
});
export type TranslateWithLLMFallbackOutput = z.infer<typeof TranslateWithLLMFallbackOutputSchema>;

export async function translateWithLLMFallback(
  input: TranslateWithLLMFallbackInput
): Promise<TranslateWithLLMFallbackOutput> {
  return translateWithLLMFallbackFlow(input);
}

const translatePrompt = ai.definePrompt({
  name: 'translatePrompt',
  input: {schema: TranslateWithLLMFallbackInputSchema},
  output: {schema: TranslateWithLLMFallbackOutputSchema},
  prompt: `Translate the following sentence from {{src_lang}} to {{tgt_lang}}:\n\n{{{text}}}`,
});

const translateWithLLMFallbackFlow = ai.defineFlow(
  {
    name: 'translateWithLLMFallbackFlow',
    inputSchema: TranslateWithLLMFallbackInputSchema,
    outputSchema: TranslateWithLLMFallbackOutputSchema,
  },
  async input => {
    try {
      const {output} = await translatePrompt(input);
      return output!;
    } catch (error) {
      console.error('LLM translation failed:', error);
      // Consider returning a default translation or re-throwing the error
      return {translation: `Translation failed for: ${input.text}`};
    }
  }
);

