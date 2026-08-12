import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface PromptItem {
  id: string;
  ownerId: string;
  title: string;
  content: string;
  variableDefaults: Record<string, string>;
  modelConfig: {
    provider?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PromptVersionItem {
  id: string;
  promptId: string;
  label: string | null;
  snapshot: {
    title: string;
    content: string;
    variableDefaults: Record<string, string>;
    modelConfig: {
      provider?: string;
      model?: string;
      temperature?: number;
      maxTokens?: number;
    };
  };
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Prompts Queries
// ---------------------------------------------------------------------------

export function usePromptsQuery(search: string = "", sort: string = "updated_at") {
  return useQuery<PromptItem[]>({
    queryKey: ["prompts", search, sort],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (sort) params.set("sort", sort);
      const res = await fetch(`/api/prompts?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch prompts: ${res.statusText}`);
      }
      return res.json();
    },
  });
}

export function usePromptQuery(id: string | null) {
  return useQuery<PromptItem>({
    queryKey: ["prompt", id],
    queryFn: async () => {
      if (!id) throw new Error("No prompt ID provided");
      const res = await fetch(`/api/prompts/${id}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch prompt: ${res.statusText}`);
      }
      return res.json();
    },
    enabled: Boolean(id),
  });
}

// ---------------------------------------------------------------------------
// Prompts Mutations
// ---------------------------------------------------------------------------

export function useCreatePromptMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title?: string;
      content?: string;
      variableDefaults?: Record<string, string>;
      modelConfig?: unknown;
    }) => {
      const res = await fetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create prompt");
      return res.json();
    },
    onSuccess: (newPrompt) => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      toast.success("Prompt saved to library");
      return newPrompt;
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create prompt");
    },
  });
}

export function useUpdatePromptMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      title?: string;
      content?: string;
      variableDefaults?: Record<string, string>;
      modelConfig?: unknown;
    }) => {
      const res = await fetch(`/api/prompts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save prompt changes");
      return res.json();
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      queryClient.invalidateQueries({ queryKey: ["prompt", updated.id] });
      toast.success("All changes saved");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save changes");
    },
  });
}

export function useDeletePromptMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/prompts/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete prompt");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      toast.success("Prompt deleted");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete prompt");
    },
  });
}

// ---------------------------------------------------------------------------
// Versions Queries & Mutations
// ---------------------------------------------------------------------------

export function usePromptVersionsQuery(promptId: string | null) {
  return useQuery<PromptVersionItem[]>({
    queryKey: ["prompt-versions", promptId],
    queryFn: async () => {
      if (!promptId) return [];
      const res = await fetch(`/api/prompts/${promptId}/versions`);
      if (!res.ok) throw new Error("Failed to load version history");
      return res.json();
    },
    enabled: Boolean(promptId),
  });
}

export function useCreateVersionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      promptId,
      label,
      snapshot,
    }: {
      promptId: string;
      label?: string;
      snapshot?: Record<string, unknown>;
    }) => {
      const res = await fetch(`/api/prompts/${promptId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, snapshot }),
      });
      if (!res.ok) throw new Error("Failed to create snapshot");
      return res.json();
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["prompt-versions", vars.promptId] });
      toast.success("Snapshot created successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create snapshot");
    },
  });
}

export function useRestoreVersionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      promptId,
      versionId,
    }: {
      promptId: string;
      versionId: string;
    }) => {
      const res = await fetch(`/api/prompts/${promptId}/versions/${versionId}/restore`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to restore snapshot");
      return res.json();
    },
    onSuccess: (data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["prompt", vars.promptId] });
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      toast.success("Version restored to active workspace");
      return data;
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to restore version");
    },
  });
}
