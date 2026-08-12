export interface ModelDefinition {
  id: string;
  name: string;
  provider: "openai" | "anthropic";
  description: string;
  contextWindow: number;
  maxOutputTokens: number;
  defaultTemperature: number;
  supportsStreaming: boolean;
  pricing: {
    inputPer1k: number;
    outputPer1k: number;
  };
}

export const SUPPORTED_PROVIDERS = [
  { id: "openai", name: "OpenAI" },
  { id: "anthropic", name: "Anthropic" },
] as const;

export const SUPPORTED_MODELS: ModelDefinition[] = [
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai",
    description: "Fast, lightweight model for general prompt engineering and instruction testing.",
    contextWindow: 128000,
    maxOutputTokens: 4096,
    defaultTemperature: 0.7,
    supportsStreaming: true,
    pricing: {
      inputPer1k: 0.00015,
      outputPer1k: 0.0006,
    },
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    description: "Flagship omni model with advanced reasoning and precise instruction following.",
    contextWindow: 128000,
    maxOutputTokens: 4096,
    defaultTemperature: 0.7,
    supportsStreaming: true,
    pricing: {
      inputPer1k: 0.0025,
      outputPer1k: 0.01,
    },
  },
  {
    id: "claude-3-5-sonnet-20241022",
    name: "Claude 3.5 Sonnet",
    provider: "anthropic",
    description: "Anthropic's most intelligent model with superior coding and complex reasoning.",
    contextWindow: 200000,
    maxOutputTokens: 8192,
    defaultTemperature: 0.7,
    supportsStreaming: true,
    pricing: {
      inputPer1k: 0.003,
      outputPer1k: 0.015,
    },
  },
  {
    id: "claude-3-5-haiku-20241022",
    name: "Claude 3.5 Haiku",
    provider: "anthropic",
    description: "Ultra-fast, responsive Anthropic model with exceptional speed-to-intelligence.",
    contextWindow: 200000,
    maxOutputTokens: 8192,
    defaultTemperature: 0.7,
    supportsStreaming: true,
    pricing: {
      inputPer1k: 0.0008,
      outputPer1k: 0.004,
    },
  },
];

export function getModelDefinition(modelId: string): ModelDefinition | undefined {
  return SUPPORTED_MODELS.find((m) => m.id === modelId);
}
