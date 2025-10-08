
"use client";

import React, { useState, useTransition } from "react";
import { highlightText } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { suggestEdits, translateSegment } from "@/lib/actions";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Skeleton } from "../ui/skeleton";
import type { GlossaryTerm } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { LANGUAGES } from "@/lib/constants";

interface TranslationCardProps {
  sourceText: string;
  initialTranslation: string;
  sourceLang: string;
  targetLang: string;
  glossary: GlossaryTerm[];
  showLanguageSelector: boolean;
  sourceTextTitle?: string;
  targetTextTitle?: string;
  translationId?: string;
  isSourceTextarea?: boolean;
}

export function TranslationCard({
  sourceText: initialSourceText,
  initialTranslation,
  sourceLang: initialSourceLang,
  targetLang: initialTargetLang,
  glossary,
  showLanguageSelector,
  sourceTextTitle,
  targetTextTitle,
  translationId,
  isSourceTextarea = false,
}: TranslationCardProps) {
  const { toast } = useToast();
  
  const [sourceText, setSourceText] = useState(initialSourceText);
  const [translation, setTranslation] = useState(initialTranslation);
  const [suggestions, setSuggestions] = useState("");
  const [sourceLang, setSourceLang] = useState(initialSourceLang);
  const [targetLang, setTargetLang] = useState(initialTargetLang);

  const [isTranslating, startTranslateTransition] = useTransition();
  const [isSuggesting, startSuggestTransition] = useTransition();

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
      const result = await translateSegment(
        sourceText,
        sourceLang,
        targetLang
      );
      if (result.startsWith("Error:")) {
        toast({
          variant: "destructive",
          title: "Translation Failed",
          description: result,
        });
      } else {
        setTranslation(result);
        toast({
          title: "Translation Complete",
        });
      }
    });
  };

  const handleSuggest = () => {
    if (!translation.trim()) {
        toast({
          variant: "destructive",
          title: "Translation Required",
          description: "Please translate the text before asking for suggestions.",
        });
        return;
      }
    startSuggestTransition(async () => {
      const result = await suggestEdits(
        sourceText,
        translation,
        sourceLang,
        targetLang
      );
      if (result.startsWith("Error:")) {
        toast({
          variant: "destructive",
          title: "Suggestion Failed",
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
    "bg-primary/10 text-primary font-semibold rounded px-1"
  );

  return (
    <>
    {showLanguageSelector && (
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
                    </Trigger>
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
    )}
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          {/* Source Text */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary">{sourceTextTitle || `Source (${sourceLang.toUpperCase()})`}</Badge>
            </div>
            <div className="rounded-md border bg-muted/50 p-4 min-h-[200px] text-sm text-muted-foreground prose prose-sm max-w-none">
                {isSourceTextarea ? (
                    <Textarea
                        value={sourceText}
                        onChange={(e) => setSourceText(e.target.value)}
                        placeholder="Enter or paste text to translate..."
                        className="min-h-[200px] text-base bg-transparent border-0 focus-visible:ring-0 p-0"
                    />
                ) : (
                    highlightedSource
                )}
            </div>
          </div>

          {/* Target Text (Translation) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary">{targetTextTitle || `Target (${targetLang.toUpperCase()})`}</Badge>
            </div>
            {isTranslating ? (
              <div className="space-y-2">
                <Skeleton className="h-[200px] w-full" />
                <Skeleton className="h-10 w-full max-w-xs" />
              </div>
            ) : (
            <>
              <Textarea
                id={translationId}
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                placeholder="Translation will appear here..."
                className="min-h-[200px] text-base"
              />
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <Button onClick={handleTranslate} disabled={isTranslating || !sourceText} size="sm">
                  {isTranslating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="mr-2" />
                  )}
                  Translate
                </Button>
                <Button onClick={handleSuggest} disabled={isSuggesting || !translation} variant="outline" size="sm">
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
                <Skeleton className="h-4 w-48"/>
                <Skeleton className="h-12 w-full"/>
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
    </>
  );
}
