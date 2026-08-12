"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sparkles,
  Play,
  Columns2,
  Code2,
  History,
  CheckCircle2,
  Clock,
  AlertCircle,
  Save,
  LogOut,
  Sliders,
  FolderCode,
  SquareTerminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { usePlaygroundStore } from "@/store/use-playground-store";
import { useCreatePromptMutation, useUpdatePromptMutation } from "@/hooks/use-prompts";
import { authClient } from "@/lib/auth/client";
import { toast } from "sonner";

export interface TopbarProps {
  onOpenExport?: () => void;
  onOpenVersions?: () => void;
}

export function Topbar({ onOpenExport, onOpenVersions }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isPlayground = pathname.startsWith("/playground") || pathname.startsWith("/prompts/");

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
    setTitle,
    setComparisonMode,
    startExecution,
    cancelExecution,
    setPrompt,
    setSavingState,
    markClean,
  } = usePlaygroundStore();

  const createMutation = useCreatePromptMutation();
  const updateMutation = useUpdatePromptMutation();

  const isRunning = streamA.isRunning || streamB.isRunning;

  const handleSave = async () => {
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
        router.push(`/playground?id=${created.id}`);
      }
    } catch {
      // Error is toasted by mutation
    } finally {
      setSavingState(false);
    }
  };

  const handleRun = () => {
    if (isRunning) {
      cancelExecution("both");
    } else {
      startExecution("both");
    }
  };

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      toast.success("Signed out successfully");
      router.push("/sign-in");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border bg-surface px-4 shadow-2xs backdrop-blur-md">
      {/* Brand & Navigation */}
      <div className="flex items-center gap-6">
        <Link
          href="/playground"
          className="flex items-center gap-2 font-bold tracking-tight text-foreground hover:opacity-90 transition-opacity"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded bg-primary text-primary-foreground shadow-xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold tracking-wide">
            Prompt<span className="text-primary">Forge</span>
          </span>
        </Link>

        {/* Workspace Navigation Tabs */}
        <nav className="flex items-center gap-1">
          <Link
            href="/playground"
            className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              isPlayground
                ? "bg-surface-elevated text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated/50"
            }`}
          >
            <SquareTerminal className="h-3.5 w-3.5" />
            Playground
          </Link>
          <Link
            href="/prompts"
            className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              pathname === "/prompts"
                ? "bg-surface-elevated text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated/50"
            }`}
          >
            <FolderCode className="h-3.5 w-3.5" />
            Library
          </Link>
          <Link
            href="/settings"
            className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              pathname === "/settings"
                ? "bg-surface-elevated text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated/50"
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            Settings
          </Link>
        </nav>
      </div>

      {/* Center: Title & Persistence Status (Only in playground) */}
      {isPlayground && (
        <div className="hidden md:flex items-center gap-3 max-w-md w-full justify-center">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled prompt"
            aria-label="Prompt title"
            className="w-48 sm:w-64 truncate rounded border border-transparent bg-transparent px-2 py-0.5 text-center text-xs font-semibold text-foreground hover:border-border focus:border-primary focus:bg-surface-elevated focus:outline-none transition-colors"
          />

          <div className="flex items-center text-[11px] text-muted-foreground select-none shrink-0">
            {isSaving ? (
              <span className="flex items-center gap-1 text-primary">
                <Clock className="h-3 w-3 animate-spin" />
                Saving...
              </span>
            ) : isDirty ? (
              <span className="flex items-center gap-1 text-warning">
                <AlertCircle className="h-3 w-3" />
                Unsaved edits
              </span>
            ) : (
              <span className="flex items-center gap-1 text-success">
                <CheckCircle2 className="h-3 w-3" />
                Saved
              </span>
            )}
          </div>
        </div>
      )}

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {isPlayground && (
          <>
            {/* Compare Toggle */}
            <Button
              variant={isComparisonMode ? "secondary" : "outline"}
              size="sm"
              onClick={() => setComparisonMode(!isComparisonMode)}
              title="Toggle dual comparison view"
              className="hidden sm:inline-flex gap-1.5 text-xs h-8"
            >
              <Columns2 className="h-3.5 w-3.5" />
              Compare
            </Button>

            {/* Version History Button */}
            {onOpenVersions && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenVersions}
                title="Inspect prompt versions"
                className="gap-1.5 text-xs h-8"
              >
                <History className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Versions</span>
              </Button>
            )}

            {/* Export Code Button */}
            {onOpenExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenExport}
                title="Export integration code"
                className="gap-1.5 text-xs h-8"
              >
                <Code2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            )}

            {/* Manual Save Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              isLoading={isSaving}
              title="Save prompt changes (⌘S)"
              className="gap-1.5 text-xs h-8"
            >
              <Save className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Save</span>
            </Button>

            {/* Run / Stop Button */}
            <Button
              variant={isRunning ? "destructive" : "default"}
              size="sm"
              onClick={handleRun}
              title={isRunning ? "Cancel running execution" : "Run prompt (⌘+Enter)"}
              className="gap-1.5 text-xs font-semibold h-8"
            >
              <Play
                className={`h-3.5 w-3.5 ${
                  isRunning ? "animate-pulse fill-white" : "fill-white"
                }`}
              />
              {isRunning ? "Stop" : "Run"}
            </Button>
          </>
        )}

        <div className="h-4 w-px bg-border mx-1" />

        <ThemeToggle />

        <button
          onClick={handleSignOut}
          title="Sign out"
          className="inline-flex h-8 w-8 items-center justify-center rounded border border-border bg-surface text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="sr-only">Sign out</span>
        </button>
      </div>
    </header>
  );
}
