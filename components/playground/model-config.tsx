"use client";

import * as React from "react";
import { Sliders, KeyRound, Eye, EyeOff } from "lucide-react";
import { SUPPORTED_MODELS, SUPPORTED_PROVIDERS } from "@/lib/ai/models";
import { usePlaygroundStore } from "@/store/use-playground-store";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export interface ModelConfigProps {
  pane: "A" | "B";
  label?: string;
}

export function ModelConfig({ pane, label }: ModelConfigProps) {
  const {
    modelA,
    modelB,
    sessionApiKeys,
    updateModelA,
    updateModelB,
    setSessionApiKey,
  } = usePlaygroundStore();

  const model = pane === "A" ? modelA : modelB;
  const updateModel = pane === "A" ? updateModelA : updateModelB;

  const [showKey, setShowKey] = React.useState(false);

  const availableModels = SUPPORTED_MODELS.filter(
    (m) => m.provider === model.provider,
  );

  const activeApiKey = sessionApiKeys[model.provider] || "";

  return (
    <div className="rounded-(--radius-panel) border border-border bg-surface p-3.5 shadow-2xs space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div className="flex items-center gap-2">
          <Sliders className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold tracking-wide text-foreground uppercase">
            {label || `Model Configuration (${pane})`}
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground uppercase font-mono">
          {model.provider}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Provider */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground">
            Provider
          </label>
          <Select
            value={model.provider}
            onChange={(e) => {
              const newProvider = e.target.value as "openai" | "anthropic";
              const firstModel = SUPPORTED_MODELS.find(
                (m) => m.provider === newProvider,
              );
              updateModel({
                provider: newProvider,
                model: firstModel ? firstModel.id : "gpt-4o-mini",
              });
            }}
            className="h-8 text-xs"
          >
            {SUPPORTED_PROVIDERS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>

        {/* Model */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground">
            Model
          </label>
          <Select
            value={model.model}
            onChange={(e) => updateModel({ model: e.target.value })}
            className="h-8 text-xs font-mono"
          >
            {availableModels.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Temperature & Max Tokens */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground font-medium">
              Temperature
            </span>
            <span className="font-mono text-foreground">
              {model.temperature}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={model.temperature}
            onChange={(e) =>
              updateModel({ temperature: parseFloat(e.target.value) })
            }
            className="w-full accent-primary h-1.5 cursor-pointer bg-surface-elevated rounded"
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground font-medium">
              Max Tokens
            </span>
            <span className="font-mono text-foreground">{model.maxTokens}</span>
          </div>
          <Input
            type="number"
            min="50"
            max="8192"
            step="50"
            value={model.maxTokens}
            onChange={(e) =>
              updateModel({ maxTokens: parseInt(e.target.value) || 1000 })
            }
            className="h-7 text-xs font-mono"
          />
        </div>
      </div>

      {/* Session BYOK Key (Optional in-memory key) */}
      <div className="pt-1 border-t border-border/60">
        <div className="flex items-center justify-between mb-1">
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
            <KeyRound className="h-3 w-3" />
            Session API Key ({model.provider.toUpperCase()})
          </span>
          <span className="text-[10px] text-muted-foreground/80">
            In-memory only
          </span>
        </div>
        <div className="relative">
          <Input
            type={showKey ? "text" : "password"}
            value={activeApiKey}
            onChange={(e) => setSessionApiKey(model.provider, e.target.value)}
            placeholder={`Optional ${model.provider} key (defaults to simulation if empty)`}
            className="h-7.5 text-xs font-mono pr-8"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-2 top-2 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            {showKey ? (
              <EyeOff className="h-3.5 w-3.5" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
