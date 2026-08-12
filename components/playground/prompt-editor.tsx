"use client";

import * as React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { useTheme } from "next-themes";
import { AlertCircle, Hash, Eye } from "lucide-react";
import { usePlaygroundStore } from "@/store/use-playground-store";
import { estimateTokens } from "@/lib/prompt/tokens";
import { validatePromptSyntax } from "@/lib/prompt/variables";
import { Button } from "@/components/ui/button";

export interface PromptEditorProps {
  onOpenPreview: () => void;
}

export function PromptEditor({ onOpenPreview }: PromptEditorProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { content, setContent } = usePlaygroundStore();
  const { resolvedTheme } = useTheme();

  const tokenCount = React.useMemo(() => estimateTokens(content), [content]);
  const validation = React.useMemo(
    () => validatePromptSyntax(content),
    [content],
  );

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[var(--radius-panel)] border border-border bg-surface shadow-2xs">
      {/* Editor Header */}
      <div className="flex h-10 items-center justify-between border-b border-border px-3.5 bg-surface-elevated/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-wide text-foreground uppercase">
            System Prompt
          </span>
          <span className="text-[11px] text-muted-foreground">
            Use{" "}
            <code className="rounded bg-surface px-1 py-0.5 text-primary font-mono text-[11px]">
              &#123;&#123;variable&#125;&#125;
            </code>{" "}
            for placeholders
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Token count */}
          <div
            title="Estimated prompt tokens (cl100k_base)"
            className="flex items-center gap-1 rounded bg-surface px-2 py-0.5 text-[11px] font-mono text-muted-foreground border border-border"
          >
            <Hash className="h-3 w-3 text-primary" />
            <span>{tokenCount} tokens</span>
          </div>

          {/* Render Preview Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenPreview}
            className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
          >
            <Eye className="h-3.5 w-3.5" />
            Preview
          </Button>
        </div>
      </div>

      {/* Syntax Warning Banner if mismatched braces */}
      {!validation.isValid && (
        <div className="flex items-center gap-2 border-b border-warning/30 bg-warning/10 px-3.5 py-1.5 text-xs text-warning">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{validation.warnings[0]}</span>
        </div>
      )}

      {/* CodeMirror Surface */}
      <div className="relative flex-1 overflow-auto bg-editor-background text-sm">
        <CodeMirror
          value={content}
          height="100%"
          theme={resolvedTheme === "dark" ? oneDark : "light"}
          onChange={(val) => setContent(val)}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightSpecialChars: true,
            history: true,
            foldGutter: false,
            drawSelection: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            syntaxHighlighting: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: true,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            searchKeymap: true,
          }}
          className="h-full text-xs sm:text-sm font-mono leading-relaxed"
        />
      </div>
    </div>
  );
}
