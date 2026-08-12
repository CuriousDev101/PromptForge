import { create } from "zustand";
import { extractVariables, renderPrompt } from "@/lib/prompt/variables";
import { estimateTokens, estimateCost } from "@/lib/prompt/tokens";

export interface ModelSettings {
  provider: "openai" | "anthropic";
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface StreamState {
  isRunning: boolean;
  output: string;
  error: string | null;
  elapsedMs: number;
  tokens: {
    input: number;
    output: number;
    total: number;
    estimatedCost: number;
  };
  abortController: AbortController | null;
}

const DEFAULT_MODEL_A: ModelSettings = {
  provider: "openai",
  model: "gpt-4o-mini",
  temperature: 0.7,
  maxTokens: 1000,
};

const DEFAULT_MODEL_B: ModelSettings = {
  provider: "anthropic",
  model: "claude-3-5-haiku-20241022",
  temperature: 0.7,
  maxTokens: 1000,
};

const INITIAL_STREAM_STATE: StreamState = {
  isRunning: false,
  output: "",
  error: null,
  elapsedMs: 0,
  tokens: {
    input: 0,
    output: 0,
    total: 0,
    estimatedCost: 0,
  },
  abortController: null,
};

export interface PlaygroundStore {
  // Active Prompt State
  promptId: string | null;
  title: string;
  content: string;
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: Date | null;

  // Variables State
  variables: string[];
  variableValues: Record<string, string>;

  // Model & Comparison State
  isComparisonMode: boolean;
  modelA: ModelSettings;
  modelB: ModelSettings;

  // Execution Streams
  streamA: StreamState;
  streamB: StreamState;

  // Session-Only BYOK Keys (In memory only, never stored in localStorage)
  sessionApiKeys: {
    openai?: string;
    anthropic?: string;
  };

  // Actions
  setPrompt: (data: {
    id: string | null;
    title: string;
    content: string;
    variableDefaults?: Record<string, string>;
    modelConfig?: Partial<ModelSettings>;
  }) => void;
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
  setVariableValue: (key: string, value: string) => void;
  resetVariableValues: () => void;
  setComparisonMode: (enabled: boolean) => void;
  updateModelA: (settings: Partial<ModelSettings>) => void;
  updateModelB: (settings: Partial<ModelSettings>) => void;
  setSessionApiKey: (provider: "openai" | "anthropic", key: string) => void;

  // Streaming Actions
  startExecution: (pane: "A" | "B" | "both", userMessage?: string) => Promise<void>;
  cancelExecution: (pane: "A" | "B" | "both") => void;
  clearOutput: (pane: "A" | "B" | "both") => void;
  setSavingState: (saving: boolean, lastSaved?: Date) => void;
  markClean: () => void;
}

export const usePlaygroundStore = create<PlaygroundStore>((set, get) => ({
  promptId: null,
  title: "Untitled prompt",
  content: `You are an expert {{role}} assistant.\n\nYour task is to provide clean, production-ready solutions in {{language}}.\n\nAlways maintain a {{tone}} tone. Explain your architectural decisions concisely.`,
  isDirty: false,
  isSaving: false,
  lastSavedAt: null,

  variables: ["role", "language", "tone"],
  variableValues: {
    role: "Full-Stack Software Architect",
    language: "TypeScript",
    tone: "professional and concise",
  },

  isComparisonMode: false,
  modelA: DEFAULT_MODEL_A,
  modelB: DEFAULT_MODEL_B,

  streamA: { ...INITIAL_STREAM_STATE },
  streamB: { ...INITIAL_STREAM_STATE },

  sessionApiKeys: {},

  setPrompt: ({ id, title, content, variableDefaults = {}, modelConfig = {} }) => {
    const extracted = extractVariables(content);
    // Merge extracted variables with defaults
    const newValues: Record<string, string> = {};
    for (const v of extracted) {
      newValues[v] = variableDefaults[v] || "";
    }

    set({
      promptId: id,
      title: title || "Untitled prompt",
      content: content || "",
      variables: extracted,
      variableValues: newValues,
      modelA: {
        ...get().modelA,
        ...modelConfig,
      },
      isDirty: false,
      lastSavedAt: id ? new Date() : null,
    });
  },

  setTitle: (title: string) => {
    set({ title, isDirty: true });
  },

  setContent: (content: string) => {
    const extracted = extractVariables(content);
    const existingValues = get().variableValues;
    const updatedValues: Record<string, string> = {};

    // Preserve values for existing variables, initialize new ones with empty string
    for (const v of extracted) {
      updatedValues[v] = existingValues[v] ?? "";
    }

    set({
      content,
      variables: extracted,
      variableValues: updatedValues,
      isDirty: true,
    });
  },

  setVariableValue: (key: string, value: string) => {
    set((state) => ({
      variableValues: {
        ...state.variableValues,
        [key]: value,
      },
      isDirty: true,
    }));
  },

  resetVariableValues: () => {
    const vars = get().variables;
    const resetVals: Record<string, string> = {};
    for (const v of vars) {
      resetVals[v] = "";
    }
    set({ variableValues: resetVals, isDirty: true });
  },

  setComparisonMode: (isComparisonMode: boolean) => {
    set({ isComparisonMode });
  },

  updateModelA: (settings: Partial<ModelSettings>) => {
    set((state) => ({
      modelA: { ...state.modelA, ...settings },
      isDirty: true,
    }));
  },

  updateModelB: (settings: Partial<ModelSettings>) => {
    set((state) => ({
      modelB: { ...state.modelB, ...settings },
      isDirty: true,
    }));
  },

  setSessionApiKey: (provider: "openai" | "anthropic", key: string) => {
    set((state) => ({
      sessionApiKeys: {
        ...state.sessionApiKeys,
        [provider]: key.trim() || undefined,
      },
    }));
  },

  setSavingState: (isSaving: boolean, lastSaved?: Date) => {
    set({
      isSaving,
      lastSavedAt: lastSaved || get().lastSavedAt,
    });
  },

  markClean: () => {
    set({ isDirty: false, lastSavedAt: new Date() });
  },

  clearOutput: (pane: "A" | "B" | "both") => {
    set((state) => ({
      streamA: pane === "A" || pane === "both" ? { ...INITIAL_STREAM_STATE } : state.streamA,
      streamB: pane === "B" || pane === "both" ? { ...INITIAL_STREAM_STATE } : state.streamB,
    }));
  },

  cancelExecution: (pane: "A" | "B" | "both") => {
    const { streamA, streamB } = get();

    if ((pane === "A" || pane === "both") && streamA.abortController) {
      streamA.abortController.abort();
      set((state) => ({
        streamA: {
          ...state.streamA,
          isRunning: false,
          error: "Execution cancelled by user.",
          abortController: null,
        },
      }));
    }

    if ((pane === "B" || pane === "both") && streamB.abortController) {
      streamB.abortController.abort();
      set((state) => ({
        streamB: {
          ...state.streamB,
          isRunning: false,
          error: "Execution cancelled by user.",
          abortController: null,
        },
      }));
    }
  },

  startExecution: async (pane: "A" | "B" | "both", userMessage?: string) => {
    const state = get();
    const { rendered } = renderPrompt(state.content, state.variableValues);
    const runA = pane === "A" || pane === "both";
    const runB = (pane === "B" || pane === "both") && state.isComparisonMode;

    const executePane = async (paneTarget: "A" | "B") => {
      const modelConfig = paneTarget === "A" ? state.modelA : state.modelB;
      const apiKey = state.sessionApiKeys[modelConfig.provider];
      const controller = new AbortController();

      const inputTokens = estimateTokens(rendered) + estimateTokens(userMessage || "");

      const updateStream = (updater: Partial<StreamState>) => {
        set((s) => ({
          [paneTarget === "A" ? "streamA" : "streamB"]: {
            ...(paneTarget === "A" ? s.streamA : s.streamB),
            ...updater,
          },
        }));
      };

      updateStream({
        isRunning: true,
        output: "",
        error: null,
        elapsedMs: 0,
        abortController: controller,
        tokens: {
          input: inputTokens,
          output: 0,
          total: inputTokens,
          estimatedCost: estimateCost(modelConfig.model, inputTokens, 0),
        },
      });

      const startTime = Date.now();
      const interval = setInterval(() => {
        updateStream({ elapsedMs: Date.now() - startTime });
      }, 100);

      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            promptId: state.promptId,
            provider: modelConfig.provider,
            model: modelConfig.model,
            systemPrompt: rendered,
            userMessage: userMessage || "Follow the instructions in the system prompt.",
            temperature: modelConfig.temperature,
            maxTokens: modelConfig.maxTokens,
            apiKey,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({ error: "Execution failed" }));
          throw new Error(errData.error || `HTTP ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No readable response stream");

        const decoder = new TextDecoder();
        let accumulatedText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });

          // Detect metadata trailer if simulated or structured
          if (chunk.includes("__PROMPTFORGE_META__:")) {
            const [cleanChunk, metaStr] = chunk.split("__PROMPTFORGE_META__:");
            accumulatedText += cleanChunk;
            try {
              const metaObj = JSON.parse(metaStr.trim());
              const meta = metaObj.promptforge_meta;
              if (meta) {
                updateStream({
                  output: accumulatedText,
                  tokens: {
                    input: meta.inputTokens,
                    output: meta.outputTokens,
                    total: meta.totalTokens,
                    estimatedCost: meta.cost,
                  },
                });
              }
            } catch {
              updateStream({ output: accumulatedText });
            }
          } else {
            accumulatedText += chunk;
            const currentOutputTokens = estimateTokens(accumulatedText);
            const totalTokens = inputTokens + currentOutputTokens;
            updateStream({
              output: accumulatedText,
              tokens: {
                input: inputTokens,
                output: currentOutputTokens,
                total: totalTokens,
                estimatedCost: estimateCost(modelConfig.model, inputTokens, currentOutputTokens),
              },
            });
          }
        }

        clearInterval(interval);
        updateStream({
          isRunning: false,
          elapsedMs: Date.now() - startTime,
          abortController: null,
        });
      } catch (err: unknown) {
        clearInterval(interval);
        if ((err as Error)?.name === "AbortError") {
          // Handled in cancelExecution
          return;
        }
        const message = err instanceof Error ? err.message : "Execution failed";
        updateStream({
          isRunning: false,
          error: message,
          elapsedMs: Date.now() - startTime,
          abortController: null,
        });
      }
    };

    const promises: Promise<void>[] = [];
    if (runA) promises.push(executePane("A"));
    if (runB) promises.push(executePane("B"));

    await Promise.all(promises);
  },
}));
