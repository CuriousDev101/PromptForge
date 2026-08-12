"use client";

import * as React from "react";
import {
  History,
  Clock,
  RotateCcw,
  Plus,
  Sliders,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  usePromptVersionsQuery,
  useCreateVersionMutation,
  useRestoreVersionMutation,
  PromptVersionItem,
} from "@/hooks/use-prompts";
import { usePlaygroundStore } from "@/store/use-playground-store";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { toast } from "sonner";

export interface VersionHistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VersionHistoryDrawer({
  open,
  onOpenChange,
}: VersionHistoryDrawerProps) {
  const { promptId, title, content, variableValues, modelA, setPrompt } =
    usePlaygroundStore();
  const [newLabel, setNewLabel] = React.useState("");
  const [selectedVersion, setSelectedVersion] =
    React.useState<PromptVersionItem | null>(null);

  const { data: versions = [], isLoading } = usePromptVersionsQuery(promptId);
  const createVersionMutation = useCreateVersionMutation();
  const restoreVersionMutation = useRestoreVersionMutation();

  const handleCreateSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptId) {
      toast.error("Please save the prompt before creating version snapshots");
      return;
    }

    try {
      await createVersionMutation.mutateAsync({
        promptId,
        label: newLabel.trim() || undefined,
        snapshot: {
          title,
          content,
          variableDefaults: variableValues,
          modelConfig: modelA,
        },
      });
      setNewLabel("");
    } catch {
      // Handled by mutation toast
    }
  };

  const handleRestore = async (version: PromptVersionItem) => {
    if (!promptId) return;
    try {
      const res = await restoreVersionMutation.mutateAsync({
        promptId,
        versionId: version.id,
      });

      if (res?.prompt) {
        setPrompt({
          id: res.prompt.id,
          title: res.prompt.title,
          content: res.prompt.content,
          variableDefaults: res.prompt.variableDefaults,
          modelConfig: res.prompt.modelConfig,
        });
      }
      onOpenChange(false);
    } catch {
      // Handled by mutation toast
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Prompt Version History"
      description="Inspect immutable snapshots and restore previous prompt configurations."
      maxWidth="max-w-4xl"
    >
      <div className="space-y-4">
        {/* Create Snapshot Bar */}
        <form
          onSubmit={handleCreateSnapshot}
          className="flex items-center gap-2 p-2.5 rounded border border-border bg-surface-elevated/40"
        >
          <Input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Snapshot label (e.g. 'Concise tone v2', 'Pre-refactor')..."
            className="h-8 text-xs font-sans"
          />
          <Button
            type="submit"
            size="sm"
            isLoading={createVersionMutation.isPending}
            disabled={!promptId}
            className="gap-1.5 h-8 text-xs shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Snapshot
          </Button>
        </form>

        {!promptId && (
          <div className="rounded border border-warning/30 bg-warning/10 p-2.5 text-xs text-warning">
            Save this prompt to the library first to enable version snapshots.
          </div>
        )}

        {/* Content Split: List on Left, Detail/Diff on Right */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 min-h-[360px] max-h-[500px]">
          {/* Version List (Left 5 cols) */}
          <div className="md:col-span-5 overflow-y-auto rounded border border-border bg-surface p-2 space-y-2">
            {isLoading ? (
              <LoadingState message="Loading snapshots..." />
            ) : versions.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                <History className="h-6 w-6 mx-auto mb-2 opacity-40" />
                <p>No snapshots created yet.</p>
                <p className="text-[11px] mt-1 text-muted-foreground/80">
                  Create a snapshot above to freeze an immutable version.
                </p>
              </div>
            ) : (
              versions.map((ver) => {
                const isSelected = selectedVersion?.id === ver.id;
                const dateStr = new Date(ver.createdAt).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={ver.id}
                    onClick={() => setSelectedVersion(ver)}
                    className={`p-3 rounded border transition-all cursor-pointer select-none ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-2xs"
                        : "border-border hover:bg-surface-elevated/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-foreground truncate">
                        {ver.label || "Untitled snapshot"}
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0 flex items-center gap-1 font-mono">
                        <Clock className="h-2.5 w-2.5" />
                        {dateStr}
                      </span>
                    </div>

                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                      <span>{ver.snapshot.modelConfig?.model || "default"}</span>
                      <span>{ver.snapshot.content?.length || 0} chars</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Version Inspection & Diff View (Right 7 cols) */}
          <div className="md:col-span-7 flex flex-col justify-between overflow-hidden rounded border border-border bg-surface p-4">
            {selectedVersion ? (
              <div className="flex flex-col h-full space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                  <div>
                    <h4 className="text-xs font-bold text-foreground">
                      {selectedVersion.label || "Snapshot Inspection"}
                    </h4>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                      Created: {new Date(selectedVersion.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleRestore(selectedVersion)}
                    isLoading={restoreVersionMutation.isPending}
                    className="gap-1.5 h-7 text-xs"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Restore this version
                  </Button>
                </div>

                {/* Model Configuration Snapshot */}
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground bg-surface-elevated/40 p-2 rounded border border-border/80 font-mono">
                  <span>
                    Provider: <strong>{selectedVersion.snapshot.modelConfig?.provider}</strong>
                  </span>
                  <span>
                    Model: <strong>{selectedVersion.snapshot.modelConfig?.model}</strong>
                  </span>
                  <span>
                    Temp: <strong>{selectedVersion.snapshot.modelConfig?.temperature}</strong>
                  </span>
                </div>

                {/* Content preview */}
                <div className="flex-1 overflow-auto rounded border border-border bg-editor-background p-3 text-xs font-mono whitespace-pre-wrap leading-relaxed select-text text-foreground">
                  {selectedVersion.snapshot.content}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-16">
                <FileText className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-xs">Select a snapshot on the left to inspect its contents.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
