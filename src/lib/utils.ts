import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import React from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function highlightText(
  text: string,
  terms: { term: string }[],
  className: string
): React.ReactNode {
  if (terms.length === 0) {
    return text;
  }

  const termRegex = new RegExp(`(${terms.map(t => t.term).join('|')})`, 'gi');
  const parts = text.split(termRegex);

  return (
    <>
      {parts.map((part, index) =>
        termRegex.test(part) ? (
          <mark key={index} className={className}>
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}
