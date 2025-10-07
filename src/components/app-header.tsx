"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm lg:h-16 lg:px-8">
      <SidebarTrigger className="md:hidden" />
      <div className="flex items-center gap-2">
        <Logo className="h-7 w-7 text-primary" />
        <h1 className={cn("text-xl font-semibold tracking-tight font-headline")}>
          LinguaFlow
        </h1>
      </div>
    </header>
  );
}
