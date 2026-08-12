"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { PromptEditor } from "@/components/playground/prompt-editor";
import { VariablesPanel } from "@/components/playground/variables-panel";
import { OutputPanel } from "@/components/playground/output-panel";
import { ModelConfig } from "@/components/playground/model-config";
import { ComparisonView } from "@/components/playground/comparison-view";
import { RenderedPromptPreview } from "@/components/playground/rendered-prompt-preview";
import { usePlaygroundStore, ModelSettings } from "@/store/use-playground-store";
import { usePromptQuery, useUpdatePromptMutation, useCreatePromptMutation } from "@/hooks/use-prompts";

export default function PlaygroundClient() {
  const searchParams = useSearchParams();
  const idFromUrl = searchParams.get("id");

  const [previewOpen, setPreviewOpen] = React.useState(false);

  const {
    promptId,
    title,
    content,
    variableValues,
    modelA,
    isDirty,
    isSaving,
    isComparisonMode,
    streamA,
    streamB,
    setPrompt,
    startExecution,
    cancelExecution,
    setSavingState,
    markClean,
  } = usePlaygroundStore();

  const { data: serverPrompt, isLoading: isLoadingServerPrompt } =
    usePromptQuery(idFromUrl);

  const updateMutation = useUpdatePromptMutation();
  const createMutation = useCreatePromptMutation();

  // Load prompt data into store when selected
  React.useEffect(() => {
    if (serverPrompt && serverPrompt.id !== promptId) {
      setPrompt({
        id: serverPrompt.id,
        title: serverPrompt.title,
        content: serverPrompt.content,
        variableDefaults: serverPrompt.variableDefaults || {},
        modelConfig: (serverPrompt.modelConfig || {}) as unknown as Partial<ModelSettings>,
      });
    }
  }, [serverPrompt, promptId, setPrompt]);

  // Keyboard shortcut listener: Cmd/Ctrl+Enter -> Run; Cmd/Ctrl+S -> Save
  React.useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key === "Enter") {
        e.preventDefault();
        const isRunning = streamA.isRunning || streamB.isRunning;
        if (isRunning) {
          cancelExecution("both");
        } else {
          startExecution("both");
        }
      }

      if (isMod && e.key === "s") {
        e.preventDefault();
        if (isSaving) return;
        setSavingState(true);
        try {
          if (promptId) {
            await updateMutation.mutateAsync({
              id: promptId,
              title,
              content,
              variableDefaults: variableValues,
              modelConfig: modelA,
            });
            markClean();
          } else {
            const created = await createMutation.mutateAsync({
              title,
              content,
              variableDefaults: variableValues,
              modelConfig: modelA,
            });
            setPrompt({
              id: created.id,
              title: created.title,
              content: created.content,
              variableDefaults: created.variableDefaults,
              modelConfig: created.modelConfig,
            });
          }
        } finally {
          setSavingState(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    promptId,
    title,
    content,
    variableValues,
    modelA,
    isSaving,
    streamA.isRunning,
    streamB.isRunning,
    startExecution,
    cancelExecution,
    updateMutation,
    createMutation,
    setSavingState,
    markClean,
    setPrompt,
  ]);

  return (
    <div className="flex-1 flex flex-col p-3 sm:p-4 gap-4 h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-3 overflow-hidden">
        {/* Left Panel: Variables (Responsive sidebar) */}
        <div className="w-full lg:w-72 xl:w-80 shrink-0 h-48 lg:h-full">
          <VariablesPanel onOpenPreview={() => setPreviewOpen(true)} />
        </div>

        {/* Center Panel: Prompt Editor */}
        <div className="flex-1 min-w-0 h-64 lg:h-full flex flex-col">
          <PromptEditor onOpenPreview={() => setPreviewOpen(true)} />
        </div>

        {/* Right Panel: Output Streams (Single or Dual Comparison) */}
        <div className="w-full lg:w-[420px] xl:w-[480px] shrink-0 h-96 lg:h-full flex flex-col overflow-hidden">
          {isComparisonMode ? (
            <ComparisonView />
          ) : (
            <div className="flex flex-col h-full gap-3 overflow-hidden">
              <ModelConfig pane="A" label="Model Configuration" />
              <div className="flex-1 min-h-[300px] overflow-hidden">
                <OutputPanel pane="A" title="Model Stream" />
              </div>
            </div>
          )}
        </div>
      </div>

      <RenderedPromptPreview open={previewOpen} onOpenChange={setPreviewOpen} />
    </div>
  );
}
