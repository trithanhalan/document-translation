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
  createdAt: string;
  sourceLang: string;
  targetLang: string;
};
