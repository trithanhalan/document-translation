"use server";

import { suggestEditsToTranslation } from "@/ai/flows/suggest-edits-to-translation";
import { summarizeDocumentContext } from "@/ai/flows/summarize-document-context";
import { translateWithLLMFallback } from "@/ai/flows/translate-with-llm-fallback";

export async function translateSegment(
  text: string,
  src_lang: string,
  tgt_lang: string
): Promise<string> {
  try {
    const result = await translateWithLLMFallback({ text, src_lang, tgt_lang });
    return result.translation;
  } catch (error) {
    console.error("Translation failed:", error);
    return "Error: Could not translate text.";
  }
}

export async function suggestEdits(
  originalText: string,
  machineTranslation: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string> {
  if (!machineTranslation.trim()) {
    return "Please translate the text before asking for suggestions.";
  }
  try {
    const result = await suggestEditsToTranslation({
      originalText,
      machineTranslation,
      sourceLanguage,
      targetLanguage,
    });
    return result.suggestedEdits;
  } catch (error) {
    console.error("Suggestion failed:", error);
    return "Error: Could not get suggestions.";
  }
}

export async function summarizeContext(
  documentContext: string,
  segmentText: string
): Promise<string> {
  try {
    const result = await summarizeDocumentContext({
      documentContext,
      segmentText,
    });
    return result.summary;
  } catch (error) {
    console.error("Summarization failed:", error);
    return "Error: Could not summarize context.";
  }
}
