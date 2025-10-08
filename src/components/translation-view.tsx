
"use client";

import React from "react";
import { Card, CardTitle, CardDescription } from './ui/card';
import { FileText } from 'lucide-react';
import { sampleGlossary } from '@/lib/data';
import { TranslationCard } from "./translation-card";

export function TranslationView() {
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
                Live Translation
              </CardTitle>
              <CardDescription className="mt-2 text-base text-muted-foreground max-w-2xl">
                Enter text in the source panel, select languages, and get an instant AI translation.
              </CardDescription>
            </div>
          </div>
        </div>
      </Card>
      
      <TranslationCard 
        sourceText=""
        initialTranslation=""
        sourceLang="en"
        targetLang="de"
        glossary={sampleGlossary}
        showLanguageSelector={true}
        isSourceTextarea={true}
      />
    </div>
  );
}
