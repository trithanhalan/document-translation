
"use client";

import React from "react";
import type { Segment, GlossaryTerm } from "@/lib/types";
import { TranslationCard } from "./translation-card";

interface SegmentEditorProps {
  segment: Segment;
  glossary: GlossaryTerm[];
  sourceLang: string;
  targetLang: string;
}

export function SegmentEditor({
  segment,
  glossary,
  sourceLang,
  targetLang,
}: SegmentEditorProps) {

  return (
    <TranslationCard
      sourceText={segment.sourceText}
      initialTranslation={segment.translation}
      sourceLang={sourceLang}
      targetLang={targetLang}
      glossary={glossary}
      showLanguageSelector={false}
      sourceTextTitle={`Source (${sourceLang.toUpperCase()}) - Segment ${segment.id}`}
      targetTextTitle={`Target (${targetLang.toUpperCase()})`}
      translationId={`segment-${segment.id}-translation`}
      isSourceTextarea={false}
    />
  );
}
