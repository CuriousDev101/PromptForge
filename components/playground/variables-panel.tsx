"use client";

import * as React from "react";
import { RotateCcw, Variable, AlertCircle, Copy, Check } from "lucide-react";
import { usePlaygroundStore } from "@/store/use-playground-store";
import { renderPrompt } from "@/lib/prompt/variables";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export interface VariablesPanelProps {
  onOpenPreview: () => void;
}

export function VariablesPanel({ onOpenPreview }: VariablesPanelProps) {
  const { content, variables, variableValues, setVariableValue, resetVariableValues } =
    usePlaygroundStore();
  const [copied, setCopied] = React.useState(false);

  const { rendered, missing } = React.useMemo(
    () => renderPrompt(content, variableValues),
    [content, variableValues]
  );

  const handleCopyRendered = async () => {
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
    <div className="flex h-full flex-col overflow-hidden rounded-[var(--radius-panel)] border border-border bg-surface shadow-2xs">
      {/* Header */}
      <div className="flex h-10 items-center justify-between border-b border-border px-3.5 bg-surface-elevated/40">
        <div className="flex items-center gap-2">
          <Variable className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold tracking-wide text-foreground uppercase">
            Variables
          </span>
          <span className="rounded-full bg-primary/10 px-1.5 py-0.2 text-[10px] font-semibold text-primary">
            {variables.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {variables.length > 0 && (
            <button
              onClick={resetVariableValues}
              title="Clear all variable values"
              className="rounded p-1 text-muted-foreground hover:bg-surface hover:text-foreground transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            onClick={handleCopyRendered}
            title="Copy fully rendered prompt"
            className="rounded p-1 text-muted-foreground hover:bg-surface hover:text-foreground transition-colors cursor-pointer"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-success" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Variables List */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
        {variables.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-xs text-muted-foreground">
              No variables detected in prompt.
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground/80 max-w-[180px]">
              Type <code className="text-primary font-mono">&#123;&#123;name&#125;&#125;</code> in the editor to define a dynamic variable.
            </p>
          </div>
        ) : (
          variables.map((variable) => {
            const value = variableValues[variable] ?? "";
            const isMissing = !value || value.trim() === "";

            return (
              <div key={variable} className="space-y-1">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor={`var-${variable}`}
                    className="flex items-center gap-1 text-[11px] font-mono font-medium text-foreground tracking-tight"
                  >
                    <span>&#123;&#123;{variable}&#125;&#125;</span>
                    {isMissing && (
                      <span
                        title="Value missing"
                        className="text-warning text-[10px]"
                      >
                        *
                      </span>
                    )}
                  </label>
                  {isMissing && (
                    <span className="text-[10px] text-warning flex items-center gap-0.5">
                      <AlertCircle className="h-2.5 w-2.5" />
                      required
                    </span>
                  )}
                </div>
                <Input
                  id={`var-${variable}`}
                  value={value}
                  onChange={(e) => setVariableValue(variable, e.target.value)}
                  placeholder={`Value for ${variable}...`}
                  className="h-8 text-xs font-sans"
                />
              </div>
            );
          })
        )}
      </div>

      {/* Footer Quick Summary */}
      {variables.length > 0 && (
        <div className="border-t border-border p-2.5 bg-surface-elevated/30">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenPreview}
            className="w-full text-xs h-7.5 gap-1.5"
          >
            <span>Preview Rendered ({missing.length} missing)</span>
          </Button>
        </div>
      )}
    </div>
  );
}
