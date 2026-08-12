"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import {
  Sliders,
  Palette,
  KeyRound,
  User,
  ShieldCheck,
  Check,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { usePlaygroundStore } from "@/store/use-playground-store";
import { SUPPORTED_MODELS, SUPPORTED_PROVIDERS } from "@/lib/ai/models";
import { authClient } from "@/lib/auth/client";
import { toast } from "sonner";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { sessionApiKeys, setSessionApiKey } = usePlaygroundStore();
  const session = authClient.useSession();

  const [openaiKey, setOpenaiKey] = React.useState(sessionApiKeys.openai || "");
  const [anthropicKey, setAnthropicKey] = React.useState(sessionApiKeys.anthropic || "");
  const [defaultProvider, setDefaultProvider] = React.useState("openai");
  const [defaultModel, setDefaultModel] = React.useState("gpt-4o-mini");
  const [isSaving, setIsSaving] = React.useState(false);

  // Load preferences from API
  React.useEffect(() => {
    fetch("/api/user/preferences")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          if (data.themePreference) setTheme(data.themePreference);
          if (data.defaultProvider) setDefaultProvider(data.defaultProvider);
          if (data.defaultModel) setDefaultModel(data.defaultModel);
        }
      })
      .catch(() => {});
  }, [setTheme]);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Save in-memory session keys in Zustand store
    setSessionApiKey("openai", openaiKey);
    setSessionApiKey("anthropic", anthropicKey);

    try {
      const res = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          themePreference: theme,
          defaultProvider,
          defaultModel,
        }),
      });

      if (!res.ok) throw new Error("Failed to save settings");
      toast.success("Settings updated successfully");
    } catch {
      toast.error("Failed to save preferences to server");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setTheme("system");
    setDefaultProvider("openai");
    setDefaultModel("gpt-4o-mini");
    setOpenaiKey("");
    setAnthropicKey("");
    setSessionApiKey("openai", "");
    setSessionApiKey("anthropic", "");
    toast.info("Preferences reset to defaults");
  };

  const availableModels = SUPPORTED_MODELS.filter(
    (m) => m.provider === defaultProvider
  );

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl w-full mx-auto space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Workspace Settings
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Configure application theming, default execution preferences, and BYOK credentials.
        </p>
      </div>

      <form onSubmit={handleSavePreferences} className="space-y-6">
        {/* User Account Info */}
        <div className="rounded-[var(--radius-panel)] border border-border bg-surface p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <User className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Account Profile</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">Name</span>
              <p className="font-medium text-foreground mt-0.5">
                {session?.data?.user?.name || "Authenticated User"}
              </p>
            </div>

            <div>
              <span className="text-muted-foreground">Email</span>
              <p className="font-mono text-foreground mt-0.5">
                {session?.data?.user?.email || "user@promptforge.dev"}
              </p>
            </div>
          </div>
        </div>

        {/* Theming Preferences */}
        <div className="rounded-[var(--radius-panel)] border border-border bg-surface p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Palette className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Theme & Appearance</h2>
          </div>

          <div className="max-w-xs space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Color Theme
            </label>
            <Select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="text-xs"
            >
              <option value="system">System Preference</option>
              <option value="dark">Dark Theme (Primary)</option>
              <option value="light">Light Theme</option>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              Themes use semantic tokens and automatically adjust editor syntax surfaces.
            </p>
          </div>
        </div>

        {/* Default Model Settings */}
        <div className="rounded-[var(--radius-panel)] border border-border bg-surface p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Sliders className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              Default Model Execution
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Default Provider
              </label>
              <Select
                value={defaultProvider}
                onChange={(e) => {
                  const p = e.target.value;
                  setDefaultProvider(p);
                  const first = SUPPORTED_MODELS.find((m) => m.provider === p);
                  if (first) setDefaultModel(first.id);
                }}
                className="text-xs"
              >
                {SUPPORTED_PROVIDERS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Default Model
              </label>
              <Select
                value={defaultModel}
                onChange={(e) => setDefaultModel(e.target.value)}
                className="text-xs font-mono"
              >
                {availableModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        {/* BYOK Session Credential Strategy */}
        <div className="rounded-[var(--radius-panel)] border border-border bg-surface p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">
                Session Provider Credentials (BYOK)
              </h2>
            </div>
            <span className="flex items-center gap-1 text-[11px] text-success">
              <ShieldCheck className="h-3.5 w-3.5" />
              In-Memory Session Only
            </span>
          </div>

          <p className="text-xs text-muted-foreground">
            Credentials entered here are maintained in memory only for
            the active session and transmitted over HTTPS solely for your model runs.
            They are never stored in localStorage, URLs, or backend database tables.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                OpenAI API Key
              </label>
              <Input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-..."
                className="text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Anthropic API Key
              </label>
              <Input
                type="password"
                value={anthropicKey}
                onChange={(e) => setAnthropicKey(e.target.value)}
                placeholder="sk-ant-..."
                className="text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetDefaults}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset to Defaults
          </Button>

          <Button
            type="submit"
            size="sm"
            isLoading={isSaving}
            className="gap-1.5 text-xs font-semibold px-5"
          >
            <Check className="h-3.5 w-3.5" />
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
