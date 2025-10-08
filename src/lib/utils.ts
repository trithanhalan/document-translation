import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import React from "react";
import type { GlossaryTerm } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function highlightText(
  text: string,
  terms: GlossaryTerm[],
  className: string
): React.ReactNode {
  if (terms.length === 0) {
    return text;
  }

  const termRegex = new RegExp(`(${terms.map(t => t.source_term).join('|')})`, 'gi');
  const parts = text.split(termRegex);

  return React.createElement(
    React.Fragment,
    null,
    ...parts.map((part, index) =>
      termRegex.test(part)
        ? React.createElement('mark', { key: index, className: className }, part)
        : part
    )
  );
}
