
"use client";

import React, { useState, useTransition } from 'react';
import type { GlossaryTerm } from '@/lib/types';
import { highlightText } from '@/lib/utils';
import { Card, CardTitle, CardDescription, CardContent } from './ui/card';
import { FileText, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { suggestEdits, translateSegment } from '@/lib/actions';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { LANGUAGES } from '@/lib/constants';
import { sampleGlossary } from '@/lib/data';

export function TranslationView() {
  const { toast } = useToast();
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('de');
  const [sourceText, setSourceText] = useState('');
  const [translation, setTranslation] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [isTranslating, startTranslateTransition] = useTransition();
  const [isSuggesting, startSuggestTransition] = useTransition();

  const glossary: GlossaryTerm[] = sampleGlossary;

  const handleTranslate = () => {
    if (!sourceText.trim()) {
      toast({
        variant: 'destructive',
        title: 'Input Required',
        description: 'Please enter some text to translate.',
      });
      return;
    }
    startTranslateTransition(async () => {
      const result = await translateSegment(sourceText, sourceLang, targetLang);
      if (result.startsWith('Error:')) {
        toast({
          variant: 'destructive',
          title: 'Translation Failed',
          description: result,
        });
      } else {
        setTranslation(result);
        toast({
          title: 'Translation Complete',
        });
      }
    });
  };

  const handleSuggest = () => {
    startSuggestTransition(async () => {
      const result = await suggestEdits(sourceText, translation, sourceLang, targetLang);
      if (result.startsWith('Error:')) {
        toast({
          variant: 'destructive',
          title: 'Suggestion Failed',
          description: result,
        });
      } else {
        setSuggestions(result);
      }
    });
  };

  const highlightedSource = highlightText(
    sourceText,
    glossary,
    'bg-primary/10 text-primary font-semibold rounded px-1'
  );

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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
                Source Language
            </label>
            <Select value={sourceLang} onValueChange={setSourceLang}>
                <SelectTrigger>
                <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
        </div>
        <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
                Target Language
            </label>
            <Select value={targetLang} onValueChange={setTargetLang}>
                <SelectTrigger>
                <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
            {/* Source Text */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary">Source ({sourceLang.toUpperCase()})</Badge>
              </div>
              <div className="rounded-md border bg-muted/50 p-4 min-h-[200px] text-sm text-muted-foreground prose prose-sm max-w-none">
                 <Textarea
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    placeholder="Enter or paste text to translate..."
                    className="min-h-[200px] text-base bg-transparent border-0 focus-visible:ring-0 p-0"
                />
              </div>
            </div>

            {/* Target Text (Translation) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary">Target ({targetLang.toUpperCase()})</Badge>
              </div>
              {isTranslating ? (
                <div className="space-y-2">
                  <Skeleton className="h-[200px] w-full" />
                  <Skeleton className="h-10 w-full max-w-xs" />
                </div>
              ) : (
                <>
                  <Textarea
                    value={translation}
                    onChange={(e) => setTranslation(e.target.value)}
                    placeholder="Translation will appear here..."
                    className="min-h-[200px] text-base"
                  />
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <Button onClick={handleTranslate} disabled={isTranslating || !sourceText}>
                      {isTranslating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Wand2 className="mr-2" />
                      )}
                      Translate
                    </Button>
                    <Button onClick={handleSuggest} disabled={isSuggesting || !translation} variant="outline">
                      {isSuggesting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="mr-2" />
                      )}
                      Suggest Edits
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Suggestions */}
          {isSuggesting && (
            <div className="mt-4 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-12 w-full" />
            </div>
          )}
          {suggestions && !isSuggesting && (
            <Alert className="mt-4">
              <Sparkles className="h-4 w-4" />
              <AlertTitle>AI Suggestions</AlertTitle>
              <AlertDescription>
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  {suggestions}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
