"use client";

import * as React from "react";
import { Copy, Check, Terminal, FileCode } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePlaygroundStore } from "@/store/use-playground-store";
import { exportTypeScript, exportPython, exportCurl } from "@/lib/prompt/export";
import { toast } from "sonner";

export interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ExportLang = "typescript" | "python" | "curl";

export function ExportDialog({ open, onOpenChange }: ExportDialogProps) {
  const { content, variableValues, modelA } = usePlaygroundStore();
  const [selectedLang, setSelectedLang] = React.useState<ExportLang>("typescript");
  const [copied, setCopied] = React.useState(false);

  const code = React.useMemo(() => {
    const config = {
      promptContent: content,
      variableDefaults: variableValues,
      provider: modelA.provider,
      model: modelA.model,
      temperature: modelA.temperature,
      maxTokens: modelA.maxTokens,
    };

    switch (selectedLang) {
      case "typescript":
        return exportTypeScript(config);
      case "python":
        return exportPython(config);
      case "curl":
        return exportCurl(config);
    }
  }, [content, variableValues, modelA, selectedLang]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Integration code copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy code");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Export Integration Code"
      description="Ready-to-use production integration code with safe parameterization and credential placeholders."
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4">
        {/* Language Tabs */}
        <div className="flex items-center gap-1.5 border-b border-border pb-2.5">
          <button
            onClick={() => setSelectedLang("typescript")}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              selectedLang === "typescript"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
            }`}
          >
            <FileCode className="h-3.5 w-3.5" />
            TypeScript / Node.js
          </button>

          <button
            onClick={() => setSelectedLang("python")}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              selectedLang === "python"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
            }`}
          >
            <FileCode className="h-3.5 w-3.5" />
            Python
          </button>

          <button
            onClick={() => setSelectedLang("curl")}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              selectedLang === "curl"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            cURL
          </button>
        </div>

        {/* Code Preview Box */}
        <div className="relative">
          <pre className="max-h-[380px] overflow-auto rounded border border-border bg-[#0B0D12] p-4 text-xs font-mono leading-relaxed text-[#F2F4FA] select-text">
            <code>{code}</code>
          </pre>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-muted-foreground">
            Model: <code className="text-primary font-mono">{modelA.model}</code> ({modelA.provider})
          </span>

          <div className="flex items-center gap-2">
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
                <Check className="h-3.5 w-3.5 text-white" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? "Copied" : "Copy Code"}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
