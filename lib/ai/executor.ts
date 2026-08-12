import "server-only";

import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { getModelDefinition } from "./models";
import { estimateTokens, estimateCost } from "../prompt/tokens";

export interface ExecutionOptions {
  provider: "openai" | "anthropic";
  model: string;
  systemPrompt: string;
  userMessage?: string;
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
}

export interface ExecutionStreamResult {
  stream: ReadableStream<Uint8Array>;
  model: string;
  provider: string;
}

/**
 * Creates an AI model instance based on provider and optional BYOK key.
 */
function getLanguageModel(provider: "openai" | "anthropic", modelId: string, apiKey?: string) {
  if (provider === "openai") {
    const key = apiKey || process.env.OPENAI_API_KEY;
    if (!key) return null;
    const client = createOpenAI({ apiKey: key });
    return client(modelId);
  } else if (provider === "anthropic") {
    const key = apiKey || process.env.ANTHROPIC_API_KEY;
    if (!key) return null;
    const client = createAnthropic({ apiKey: key });
    return client(modelId);
  }
  return null;
}

/**
 * Creates a simulated stream for local testing when no provider API keys are supplied.
 */
function createSimulationStream(
  systemPrompt: string,
  modelId: string,
  provider: string,
  userMessage: string
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const inputTokens = estimateTokens(systemPrompt) + estimateTokens(userMessage);

  const sampleResponses = [
    `Analyzing system prompt instructions:\n\n`,
    `System context configured: ${systemPrompt.slice(0, 80)}...\n\n`,
    `Here is the requested output following your parameters:\n\n`,
    `1. Target persona and guidelines have been strictly observed.\n`,
    `2. Variable substitutions were mapped cleanly without hallucinations.\n`,
    `3. Output formatting matches requested schema.\n\n`,
    `PromptForge execution completed successfully under model [${modelId}].`,
  ];

  return new ReadableStream({
    async start(controller) {
      let outputText = "";
      for (const chunk of sampleResponses) {
        outputText += chunk;
        controller.enqueue(encoder.encode(chunk));
        await new Promise((r) => setTimeout(r, 75));
      }

      // Final metadata payload line (encoded as JSON comment or end packet)
      const outputTokens = estimateTokens(outputText);
      const cost = estimateCost(modelId, inputTokens, outputTokens);
      const meta = JSON.stringify({
        promptforge_meta: {
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens,
          cost,
          simulated: true,
        },
      });

      // Send metadata header marker
      controller.enqueue(encoder.encode(`\n\n__PROMPTFORGE_META__:${meta}`));
      controller.close();
    },
  });
}

/**
 * Executes a streaming prompt run.
 * Handles both real API keys and simulation mode transparently.
 */
export async function executeStream(
  options: ExecutionOptions
): Promise<ReadableStream<Uint8Array>> {
  const { provider, model, systemPrompt, userMessage = "Follow the system prompt instructions.", temperature = 0.7, maxTokens = 1000, apiKey } = options;

  const modelDef = getModelDefinition(model);
  if (!modelDef) {
    throw new Error(`Unsupported model identifier: ${model}`);
  }

  const languageModel = getLanguageModel(provider, model, apiKey);

  // If no API key configured (neither user-supplied nor server env), provide simulated stream
  if (!languageModel) {
    return createSimulationStream(systemPrompt, model, provider, userMessage);
  }

  // Real LLM execution with Vercel AI SDK
  const result = streamText({
    model: languageModel,
    system: systemPrompt,
    prompt: userMessage,
    temperature,
    maxOutputTokens: maxTokens,
  });

  return result.textStream.pipeThrough(
    new TransformStream<string, Uint8Array>({
      transform(chunk, controller) {
        controller.enqueue(new TextEncoder().encode(chunk));
      },
    })
  );
}
