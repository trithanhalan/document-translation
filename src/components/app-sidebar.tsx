'use client';

import React, { useState, useTransition } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import { Logo } from './logo';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { LANGUAGES } from '@/lib/constants';
import { Button } from './ui/button';
import { summarizeContext } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { sampleDocument, sampleGlossary } from '@/lib/data';
import { Loader2, FileText, Download, BookMarked, MessageSquareQuote } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';

export function AppSidebar() {
  const { toast } = useToast();
  const [isSummarizing, startSummarizeTransition] = useTransition();
  const [summary, setSummary] = useState('');

  const handleSummarize = async () => {
    startSummarizeTransition(async () => {
      const fullText = sampleDocument.segments
        .map((s) => s.sourceText)
        .join(' ');
      const result = await summarizeContext(fullText, fullText);
      if (result.startsWith('Error:')) {
        toast({
          variant: 'destructive',
          title: 'Summarization Failed',
          description: result,
        });
      } else {
        setSummary(result);
      }
    });
  };

  const handleExport = () => {
    const translatedText = sampleDocument.segments
      .map(
        (s) =>
          `<div style="margin-bottom: 20px; padding: 10px; border: 1px solid #eee; border-radius: 5px;">
             <p><strong>Source:</strong> ${s.sourceText}</p>
             <p><strong>Translation:</strong> ${
               (document.getElementById(`segment-${s.id}-translation`) as HTMLTextAreaElement)
                 ?.value || '[Not Translated]'
             }</p>
           </div>`
      )
      .join('');

    const htmlContent = `
      <html>
        <head>
          <title>Translation: ${sampleDocument.title}</title>
          <style>
            body { font-family: sans-serif; line-height: 1.6; padding: 20px; }
            h1 { color: #333; }
          </style>
        </head>
        <body>
          <h1>${sampleDocument.title}</h1>
          ${translatedText}
        </body>
      </html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${sampleDocument.title.replace(/\s+/g, '_')}_translation.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
        title: "Export Successful",
        description: "Your translation has been exported as an HTML file."
    })
  };

  return (
    <Sidebar
      variant="floating"
      collapsible="icon"
      className="hidden border-r-0 md:flex"
    >
      <SidebarHeader className="h-14 items-center gap-2 border-b lg:h-16">
        <Logo className="h-7 w-7 text-primary" />
        <span className={cn('text-xl font-semibold tracking-tight font-headline')}>
          LinguaFlow
        </span>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-full">
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2">
              <FileText className="size-4" />
              <span>Document</span>
            </SidebarGroupLabel>
            <SidebarGroupContent className="space-y-4 p-2">
              <p className="font-medium text-sm text-foreground">{sampleDocument.title}</p>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Source Language
                </label>
                <Select defaultValue="en">
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
                <Select defaultValue="de">
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
            </SidebarGroupContent>
          </SidebarGroup>
          <Separator className="my-2" />
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2">
                <MessageSquareQuote className="size-4" />
                <span>Context</span>
            </SidebarGroupLabel>
            <SidebarGroupContent className="p-2">
              <Button
                onClick={handleSummarize}
                disabled={isSummarizing}
                className="w-full"
                size="sm"
              >
                {isSummarizing && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Summarize Context
              </Button>
              {summary && (
                <p className="mt-4 text-sm text-muted-foreground italic">
                  {summary}
                </p>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
          <Separator className="my-2" />
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2">
                <BookMarked className="size-4" />
                <span>Glossary</span>
            </SidebarGroupLabel>
            <SidebarGroupContent className="p-2">
                <ul className="space-y-2 text-sm">
                    {sampleGlossary.map((term, i) => (
                        <li key={i} className="text-muted-foreground">
                            <span className="font-semibold text-foreground">{term.term}</span>: {term.translation}
                        </li>
                    ))}
                </ul>
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter>
        <Button onClick={handleExport} className="w-full">
            <Download className="mr-2"/>
          Export to HTML
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
