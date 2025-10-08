import type { Timestamp } from 'firebase/firestore';

export type Segment = {
  id: number | string; // Can be number from old data or string from new
  sourceText: string;
  translation: string;
  isGlossary?: boolean; // Optional flag for glossary terms
};

export type GlossaryTerm = {
  term: string;
  translation: string;
};

export type TranslationTaskStatus =
  | 'pending' // File uploaded, waiting for backend to start processing
  | 'uploading' // File is currently being uploaded to storage
  | 'preprocessing' // Backend: Text extraction and segmentation
  | 'translating' // Backend: Segments are being translated
  | 'reassembling' // Backend: Creating final translated document
  | 'review' // AI processing is done, ready for human review
  | 'completed' // All steps are finished
  | 'failed'; // An error occurred

export type TranslationTask = {
  id: string;
  fileName: string;
  status: TranslationTaskStatus;
  progress: number;
  createdAt: Timestamp | string; // serverTimestamp can result in Timestamp
  updatedAt: Timestamp | string;
  srcLang: string;
  tgtLang: string;
  ownerUid: string;
  errors?: string[];
  outputs?: Record<string, string>; // e.g., { "docx": "path/to/file.docx" }
};

    