"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, SlidersHorizontal, FolderCode } from "lucide-react";
import { PromptCard } from "./prompt-card";
import {
  usePromptsQuery,
  useCreatePromptMutation,
  useDeletePromptMutation,
} from "@/hooks/use-prompts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { usePlaygroundStore } from "@/store/use-playground-store";

export function PromptList() {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [sortBy, setSortBy] = React.useState("updated_at");

  // Confirm delete dialog state
  const [deleteTarget, setDeleteTarget] = React.useState<{
    id: string;
    title: string;
  } | null>(null);

  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(handler);
  }, [search]);

  const { data: prompts = [], isLoading } = usePromptsQuery(debouncedSearch, sortBy);
  const createMutation = useCreatePromptMutation();
  const deleteMutation = useDeletePromptMutation();
  const { setPrompt } = usePlaygroundStore();

  const handleCreateNew = async () => {
    try {
      const newPrompt = await createMutation.mutateAsync({
        title: "Untitled prompt",
        content: `You are an expert {{role}}.\n\nRespond to user inquiries in {{language}} with a {{tone}} tone.`,
        variableDefaults: {
          role: "assistant",
          language: "English",
          tone: "helpful and precise",
        },
      });

      setPrompt({
        id: newPrompt.id,
        title: newPrompt.title,
        content: newPrompt.content,
        variableDefaults: newPrompt.variableDefaults,
        modelConfig: newPrompt.modelConfig,
      });

      router.push(`/playground?id=${newPrompt.id}`);
    } catch {
      // Handled in mutation
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // Handled in mutation
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prompts by title or content..."
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="w-40">
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-9 text-xs"
            >
              <option value="updated_at">Recently Updated</option>
              <option value="created_at">Recently Created</option>
            </Select>
          </div>

          <Button
            size="sm"
            onClick={handleCreateNew}
            isLoading={createMutation.isPending}
            className="gap-1.5 h-9 text-xs font-semibold shrink-0"
          >
            <Plus className="h-4 w-4" />
            New Prompt
          </Button>
        </div>
      </div>

      {/* Prompts Grid */}
      {isLoading ? (
        <LoadingState message="Loading prompt library..." />
      ) : prompts.length === 0 ? (
        <EmptyState
          icon={<FolderCode className="h-8 w-8 text-primary/70" />}
          title={search ? "No matching prompts found" : "Your library is empty"}
          description={
            search
              ? "Try adjusting your search query or clear the filter."
              : "Create your first system prompt template to start engineering and testing."
          }
          actionLabel={search ? "Clear Search" : "Create First Prompt"}
          onAction={search ? () => setSearch("") : handleCreateNew}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prompts.map((p) => (
            <PromptCard
              key={p.id}
              prompt={p}
              onDelete={(id, title) => setDeleteTarget({ id, title })}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Prompt"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? All associated immutable version snapshots will also be permanently removed. This action cannot be undone.`}
        confirmLabel="Delete"
        isDestructive
        isLoading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
