"use client";

import * as React from "react";
import { PromptList } from "@/components/library/prompt-list";

export default function PromptsLibraryPage() {
  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Prompt Library
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Browse, organize, version, and manage all your saved system prompt templates.
        </p>
      </div>

      <PromptList />
    </div>
  );
}
