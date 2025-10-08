
"use client";

import React from "react";
import { Card, CardTitle, CardDescription } from '../ui/card';
import { FileText } from 'lucide-react';
import type { TranslationTask, Segment } from '@/lib/types';
import { SegmentEditor } from "./segment-editor";

interface TranslationViewProps {
    task: TranslationTask;
    segments: Segment[];
    isLoading: boolean;
}

export function TranslationView({ task, segments, isLoading }: TranslationViewProps) {
    if (isLoading) {
        return <div>Loading segments...</div>;
    }

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
                                Review: {task.fileName}
                            </CardTitle>
                            <CardDescription className="mt-2 text-base text-muted-foreground max-w-2xl">
                                Review the machine translation segment by segment. Make edits and use AI suggestions to improve accuracy.
                            </CardDescription>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="space-y-6">
                {segments && segments.map((segment) => (
                    <SegmentEditor
                        key={segment.id}
                        segment={segment}
                        sourceLang={task.srcLang}
                        targetLang={task.tgtLang}
                    />
                ))}
            </div>
        </div>
    );
}
