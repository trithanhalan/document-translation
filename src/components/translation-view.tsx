
"use client";

import React, { useState } from 'react';
import type { Document, GlossaryTerm } from '@/lib/types';
import { SegmentEditor } from './segment-editor';
import { Card, CardTitle, CardDescription } from './ui/card';
import { FileText } from 'lucide-react';

interface TranslationViewProps {
  document: Document;
  glossary: GlossaryTerm[];
}

export function TranslationView({ document, glossary }: TranslationViewProps) {
  const [sourceLang] = useState('en');
  const [targetLang] = useState('de');

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="bg-gradient-to-br from-primary/5 via-card to-card p-6 md:p-8">
          <div className="flex items-center gap-6">
            <div className="hidden sm:block bg-primary/10 p-4 rounded-xl">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="font-headline text-3xl tracking-tight text-foreground">
                {document.title}
              </CardTitle>
              <CardDescription className="mt-2 text-base text-muted-foreground max-w-2xl">
                Translate the document segment by segment. Use the AI-powered
                tools in the sidebar and editor to assist you.
              </CardDescription>
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {document.segments.map((segment) => (
          <SegmentEditor
            key={segment.id}
            segment={segment}
            glossary={glossary}
            sourceLang={sourceLang}
            targetLang={targetLang}
          />
        ))}
      </div>
    </div>
  );
}
