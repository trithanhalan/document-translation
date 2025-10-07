import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-edits-to-translation.ts';
import '@/ai/flows/summarize-document-context.ts';
import '@/ai/flows/translate-with-llm-fallback.ts';