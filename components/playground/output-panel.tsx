"use client";

import * as React from "react";
import {
  Copy,
  Check,
  Trash2,
  Square,
  Clock,
  Hash,
  Coins,
  Bot,
  AlertCircle,
  FileText,
  Code,
} from "lucide-react";
import { usePlaygroundStore } from "@/store/use-playground-store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface OutputPanelProps {
  pane: "A" | "B";
  title?: string;
}

export function OutputPanel({ pane, title }: OutputPanelProps) {
  const {
    modelA,
    modelB,
    streamA,
    streamB,
    clearOutput,
    cancelExecution,
  } = usePlaygroundStore();

  const [copied, setCopied] = React.useState(false);
  const [viewRaw, setViewRaw] = React.useState(false);

  const model = pane === "A" ? modelA : modelB;
  const stream = pane === "A" ? streamA : streamB;

  const handleCopy = async () => {
    if (!stream.output) return;
    try {
      await navigator.clipboard.writeText(stream.output);
      setCopied(true);
      toast.success("Output copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy output");
    }
  };

  const statusColor = stream.isRunning
    ? "text-primary border-primary/30 bg-primary/10"
    : stream.error
    ? "text-destructive border-destructive/30 bg-destructive/10"
    : stream.output
    ? "text-success border-success/30 bg-success/10"
    : "text-muted-foreground border-border bg-surface-elevated/40";

  const statusText = stream.isRunning
    ? "Streaming..."
    : stream.error
    ? "Failed"
    : stream.output
    ? "Completed"
    : "Idle";

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[var(--radius-panel)] border border-border bg-surface shadow-2xs">
      {/* Header */}
      <div className="flex h-10 items-center justify-between border-b border-border px-3.5 bg-surface-elevated/40">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold tracking-wide text-foreground">
            {title || `Output (${pane})`}
          </span>
          <span className="font-mono text-[11px] text-muted-foreground">
            [{model.model}]
          </span>
          <span
            className={`rounded-full px-2 py-0.2 text-[10px] font-medium border ${statusColor}`}
          >
            {statusText}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          {stream.output && (
            <>
              {/* Toggle Raw/Markdown */}
              <button
                onClick={() => setViewRaw(!viewRaw)}
                title={viewRaw ? "Switch to formatted view" : "Switch to raw text view"}
                className="rounded p-1 text-muted-foreground hover:bg-surface hover:text-foreground transition-colors cursor-pointer"
              >
                {viewRaw ? <FileText className="h-3.5 w-3.5" /> : <Code className="h-3.5 w-3.5" />}
              </button>

              {/* Copy */}
              <button
                onClick={handleCopy}
                title="Copy generated output"
                className="rounded p-1 text-muted-foreground hover:bg-surface hover:text-foreground transition-colors cursor-pointer"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-success" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>

              {/* Clear */}
              <button
                onClick={() => clearOutput(pane)}
                title="Clear output"
                className="rounded p-1 text-muted-foreground hover:bg-surface hover:text-foreground transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          )}

          {stream.isRunning && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => cancelExecution(pane)}
              className="h-6 px-2 text-[11px] gap-1 text-destructive hover:bg-destructive/10 border-destructive/30"
            >
              <Square className="h-2.5 w-2.5 fill-current" />
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Output Content Area */}
      <div className="flex-1 overflow-y-auto p-4 font-sans text-xs sm:text-sm leading-relaxed text-foreground select-text">
        {stream.error ? (
          <div className="flex items-start gap-2.5 rounded border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Execution encountered an error</p>
              <p className="mt-0.5 text-muted-foreground">{stream.error}</p>
            </div>
          </div>
        ) : stream.output ? (
          viewRaw ? (
            <pre className="font-mono text-xs whitespace-pre-wrap break-words text-foreground">
              {stream.output}
            </pre>
          ) : (
            <div className="prose prose-invert prose-xs max-w-none whitespace-pre-wrap break-words leading-relaxed">
              {stream.output}
            </div>
          )
        ) : stream.isRunning ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-primary animate-ping mb-2" />
            <p className="text-xs">Connecting to model stream...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground/70">
            <Bot className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-xs">Generated output will appear here in real-time.</p>
            <p className="text-[11px] mt-1 text-muted-foreground/50">
              Press Run or <kbd className="font-mono bg-surface-elevated px-1 rounded">⌘+Enter</kbd> to stream
            </p>
          </div>
        )}
      </div>

      {/* Metadata Metrics Footer */}
      {(stream.output || stream.isRunning) && (
        <div className="flex flex-wrap items-center justify-between border-t border-border px-3.5 py-1.5 bg-surface-elevated/30 text-[11px] text-muted-foreground font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1" title="Elapsed execution time">
              <Clock className="h-3 w-3 text-primary" />
              {(stream.elapsedMs / 1000).toFixed(2)}s
            </span>

            <span className="flex items-center gap-1" title="Tokens: Input / Output / Total">
              <Hash className="h-3 w-3 text-primary" />
              {stream.tokens.input} in / {stream.tokens.output} out ({stream.tokens.total} total)
            </span>
          </div>

          <div className="flex items-center gap-1" title="Estimated execution cost">
            <Coins className="h-3 w-3 text-warning" />
            ${stream.tokens.estimatedCost.toFixed(5)}
          </div>
        </div>
      )}
    </div>
  );
}
