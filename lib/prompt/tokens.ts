import { getEncoding, Tiktoken } from "js-tiktoken";

let encoderInstance: Tiktoken | null = null;

function getEncoder(): Tiktoken | null {
  if (typeof window !== "undefined") {
    // In browser, create on-demand if supported or fallback to character heuristics
    if (!encoderInstance) {
      try {
        encoderInstance = getEncoding("cl100k_base");
      } catch {
        return null;
      }
    }
    return encoderInstance;
  }

  // Server-side
  if (!encoderInstance) {
    try {
      encoderInstance = getEncoding("cl100k_base");
    } catch {
      return null;
    }
  }
  return encoderInstance;
}

/**
 * Estimates token count for a given text.
 * Uses cl100k_base encoding with fallback to ~4 characters per token if tokenizer is unavailable.
 */
export function estimateTokens(text: string): number {
  if (!text || text.length === 0) return 0;

  try {
    const enc = getEncoder();
    if (enc) {
      return enc.encode(text).length;
    }
  } catch {
    // Fallback heuristic
  }

  // Fallback: rule of thumb 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

export interface ModelPricing {
  inputPer1k: number;
  outputPer1k: number;
}

export const MODEL_PRICING: Record<string, ModelPricing> = {
  // OpenAI
  "gpt-4o-mini": { inputPer1k: 0.00015, outputPer1k: 0.0006 },
  "gpt-4o": { inputPer1k: 0.0025, outputPer1k: 0.01 },
  "gpt-4-turbo": { inputPer1k: 0.01, outputPer1k: 0.03 },
  "gpt-3.5-turbo": { inputPer1k: 0.0005, outputPer1k: 0.0015 },
  // Anthropic
  "claude-3-5-sonnet-20241022": { inputPer1k: 0.003, outputPer1k: 0.015 },
  "claude-3-5-haiku-20241022": { inputPer1k: 0.0008, outputPer1k: 0.004 },
  "claude-3-opus-20240229": { inputPer1k: 0.015, outputPer1k: 0.075 },
};

/**
 * Calculates estimated cost for input & output tokens.
 */
export function estimateCost(
  model: string,
  inputTokens: number,
  outputTokens: number = 0
): number {
  const pricing = MODEL_PRICING[model] || {
    inputPer1k: 0.0005,
    outputPer1k: 0.0015,
  };
  const inputCost = (inputTokens / 1000) * pricing.inputPer1k;
  const outputCost = (outputTokens / 1000) * pricing.outputPer1k;
  return Number((inputCost + outputCost).toFixed(6));
}
