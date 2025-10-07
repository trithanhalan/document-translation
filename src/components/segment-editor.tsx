
"use client";

import React, { useState, useTransition } from "react";
import type { Segment, GlossaryTerm } from "@/lib/types";
import { highlightText } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { suggestEdits, translateSegment } from "@/lib/actions";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Skeleton } from "./ui/skeleton";

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
  const { toast } = useToast();
  const [translation, setTranslation] = useState(segment.translation);
  const [suggestions, setSuggestions] = useState("");
  const [isTranslating, startTranslateTransition] = useTransition();
  const [isSuggesting, startSuggestTransition] = useTransition();

  const handleTranslate = () => {
    startTranslateTransition(async () => {
      const result = await translateSegment(
        segment.sourceText,
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
          description: `Segment ${segment.id} translated successfully.`,
        });
      }
    });
  };

  const handleSuggest = () => {
    startSuggestTransition(async () => {
      const result = await suggestEdits(
        segment.sourceText,
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
    segment.sourceText,
    glossary,
    "bg-primary/10 text-primary font-semibold rounded px-1"
  );

  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          {/* Source Text */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary">Source ({sourceLang.toUpperCase()})</Badge>
              <span className="text-sm font-medium text-muted-foreground">Segment {segment.id}</span>
            </div>
            <div className="rounded-md border bg-muted/50 p-4 min-h-[120px] text-sm text-muted-foreground prose prose-sm max-w-none">
              {highlightedSource}
            </div>
          </div>

          {/* Target Text (Translation) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary">Target ({targetLang.toUpperCase()})</Badge>
            </div>
            {isTranslating ? (
              <div className="space-y-2">
                <Skeleton className="h-[120px] w-full" />
                <Skeleton className="h-10 w-32" />
              </div>
            ) : (
            <>
              <Textarea
                id={`segment-${segment.id}-translation`}
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                placeholder="Translation will appear here..."
                className="min-h-[120px] text-base"
              />
              <div className="mt-2 flex items-center gap-2">
                <Button onClick={handleTranslate} disabled={isTranslating} size="sm">
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
  );
}
