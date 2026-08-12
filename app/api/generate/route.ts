import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { getServerSession } from "@/lib/auth/session";
import { executeStream } from "@/lib/ai/executor";
import { db, schema } from "@/lib/db";
import { getModelDefinition } from "@/lib/ai/models";

export async function POST(req: NextRequest) {
  try {
    const sessionResult = await getServerSession();
    if (!sessionResult) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Sign in required to execute prompts" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const {
      promptId,
      provider = "openai",
      model = "gpt-4o-mini",
      systemPrompt,
      userMessage = "Follow the system prompt instructions.",
      temperature = 0.7,
      maxTokens = 1000,
      apiKey,
    } = body;

    if (!systemPrompt || typeof systemPrompt !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid request: systemPrompt is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const modelDef = getModelDefinition(model);
    if (!modelDef) {
      return new Response(
        JSON.stringify({ error: `Unsupported model identifier: ${model}` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Record execution attempt in database
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const startTime = Date.now();

    try {
      await db.insert(schema.executions).values({
        id: executionId,
        ownerId: sessionResult.user.id,
        promptId: promptId || null,
        provider,
        model,
        status: "streaming",
        createdAt: new Date(),
      });
    } catch {
      // Non-blocking if table write has transient delay
    }

    // Execute the stream
    const rawStream = await executeStream({
      provider,
      model,
      systemPrompt,
      userMessage,
      temperature: Number(temperature),
      maxTokens: Number(maxTokens),
      apiKey,
    });

    // Create an intercepting transform stream to update execution record upon completion
    let fullOutput = "";
    const transformStream = new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        fullOutput += new TextDecoder().decode(chunk);
        controller.enqueue(chunk);
      },
      async flush() {
        const duration = Date.now() - startTime;
        try {
          await db
            .update(schema.executions)
            .set({
              status: "completed",
              durationMs: duration,
            })
            .where(eq(schema.executions.id, executionId));
        } catch {
          // ignore flush error
        }
      },
    });

    const stream = rawStream.pipeThrough(transformStream);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Execution-Id": executionId,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to execute prompt";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
