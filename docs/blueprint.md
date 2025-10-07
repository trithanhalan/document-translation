# **App Name**: LinguaFlow

## Core Features:

- Document Ingestion: Upload documents (PDF, DOCX, TXT) for translation.
- OCR Fallback: If text extraction fails, use OCR via pytesseract to extract text.
- Preprocessing: Clean and segment the text for optimal translation, including handling figure/table anchors.
- Glossary Service: Utilize a SQLite database for termbase with CLI for bulk CSV import; exact match phrase replacement.
- Translation Engine: Translate segments using Hugging Face Marian models and a fallback to LLM prompt engineering, manage API caching. The LLM uses reasoning, using a 'translate this sentence from en to de' prompt.
- Evaluation: Evaluate translation quality using sacreBLEU scoring.
- Post-Edit UI: Review and edit translations in a simple Streamlit UI, save edits, and export to DOCX/HTML.

## Style Guidelines:

- Primary color: Deep sky blue (#00BFFF), conveying trust and efficiency.
- Background color: Very light gray (#F0F0F0), ensuring readability and clean aesthetics.
- Accent color: Sea green (#2E8B57), providing highlights for calls to action and interactive elements.
- Headline font: 'Space Grotesk', sans-serif for modern, tech-forward headlines; body font: 'Inter', sans-serif for clear readability.
- Use flat, minimalist icons for actions (upload, translate, download). Consistent style.
- Clean, responsive layout with a clear separation of source and translated text. Streamlined workflow.
- Subtle transition effects during the translation process, providing a smooth user experience.