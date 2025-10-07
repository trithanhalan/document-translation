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
