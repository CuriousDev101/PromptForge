"use client";

import * as React from "react";
import Link from "next/link";
import { Clock, Trash2, ArrowUpRight, Variable, Hash } from "lucide-react";
import { PromptItem } from "@/hooks/use-prompts";
import { estimateTokens } from "@/lib/prompt/tokens";
import { extractVariables } from "@/lib/prompt/variables";
import { Badge } from "@/components/ui/badge";

export interface PromptCardProps {
  prompt: PromptItem;
  onDelete: (id: string, title: string) => void;
}

export function PromptCard({ prompt, onDelete }: PromptCardProps) {
  const tokenCount = React.useMemo(() => estimateTokens(prompt.content), [prompt.content]);
  const variables = React.useMemo(() => extractVariables(prompt.content), [prompt.content]);

  const dateStr = new Date(prompt.updatedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="group relative flex flex-col justify-between rounded-[var(--radius-panel)] border border-border bg-surface p-4 shadow-2xs hover:border-primary/50 hover:shadow-sm transition-all">
      <div>
        {/* Top bar */}
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/playground?id=${prompt.id}`}
            className="flex-1 font-semibold text-sm text-foreground hover:text-primary transition-colors line-clamp-1"
          >
            {prompt.title || "Untitled prompt"}
          </Link>

          <button
            onClick={() => onDelete(prompt.id, prompt.title)}
            title="Delete prompt"
            className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Content Preview */}
        <Link href={`/playground?id=${prompt.id}`}>
          <p className="mt-2 line-clamp-3 font-mono text-xs text-muted-foreground leading-relaxed cursor-pointer">
            {prompt.content || "Empty prompt content."}
          </p>
        </Link>
      </div>

      {/* Badges & Meta Footer */}
      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
        <div className="flex items-center gap-2">
          {variables.length > 0 && (
            <span className="flex items-center gap-1 font-mono">
              <Variable className="h-3 w-3 text-primary" />
              {variables.length} vars
            </span>
          )}

          <span className="flex items-center gap-1 font-mono">
            <Hash className="h-3 w-3" />
            {tokenCount} tokens
          </span>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[10px]">
          <Clock className="h-2.5 w-2.5" />
          {dateStr}
        </div>
      </div>
    </div>
  );
}
