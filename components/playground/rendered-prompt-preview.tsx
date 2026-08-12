"use client";

import * as React from "react";
import { Copy, Check, AlertTriangle, FileText } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { renderPrompt } from "@/lib/prompt/variables";
import { estimateTokens } from "@/lib/prompt/tokens";
import { usePlaygroundStore } from "@/store/use-playground-store";
import { toast } from "sonner";

export interface RenderedPromptPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RenderedPromptPreview({
  open,
  onOpenChange,
}: RenderedPromptPreviewProps) {
  const { content, variableValues } = usePlaygroundStore();
  const [copied, setCopied] = React.useState(false);

  const { rendered, missing, extracted } = React.useMemo(
    () => renderPrompt(content, variableValues),
    [content, variableValues]
  );

  const tokens = React.useMemo(() => estimateTokens(rendered), [rendered]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rendered);
      setCopied(true);
      toast.success("Rendered prompt copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Rendered Prompt Preview"
      description="Preview the final system prompt with all current variable substitutions applied."
      maxWidth="max-w-2xl"
    >
      <div className="space-y-3.5">
        {/* Warning if missing variables */}
        {missing.length > 0 && (
          <div className="flex items-center gap-2 rounded border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <div>
              <span className="font-semibold">Unresolved variables: </span>
              <span>{missing.map((m) => `{{${m}}}`).join(", ")} have no values assigned.</span>
            </div>
          </div>
        )}

        {/* Metadata summary bar */}
        <div className="flex items-center justify-between text-xs text-muted-foreground font-mono bg-surface-elevated/40 p-2 rounded border border-border">
          <div className="flex items-center gap-3">
            <span>Variables: {extracted.length}</span>
            <span>Unresolved: {missing.length}</span>
          </div>
          <span>Estimated Tokens: {tokens}</span>
        </div>

        {/* Rendered prompt text container */}
        <div className="max-h-[380px] overflow-y-auto rounded border border-border bg-editor-background p-4 text-xs font-mono leading-relaxed text-foreground whitespace-pre-wrap select-text">
          {rendered || (
            <span className="text-muted-foreground italic">Prompt is currently empty.</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleCopy}
            className="gap-1.5"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? "Copied" : "Copy Rendered Prompt"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
