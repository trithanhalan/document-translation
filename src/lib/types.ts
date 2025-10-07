
export type Segment = {
  id: number;
  sourceText: string;
  translation: string;
};

export type GlossaryTerm = {
  term: string;
  translation: string;
};

export type Document = {
  title: string;
  segments: Segment[];
};

export type TranslationTaskStatus =
  | 'pending'
  | 'uploading'
  | 'processing'
  | 'review'
  | 'completed'
  | 'failed';

export type TranslationTask = {
  id: string;
  fileName: string;
  status: TranslationTaskStatus;
  progress: number;
  createdAt: string; // Should be ISO string
  sourceLang: string;
  targetLang: string;
  ownerUid: string;
  errors?: string[];
  outputs?: Record<string, string>;
};
