import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { getServerSession } from "@/lib/auth/session";
import { db, schema } from "@/lib/db";

// GET /api/prompts - list user's prompts
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("q")?.trim();
    const sortBy = searchParams.get("sort") || "updated_at"; // 'updated_at' | 'created_at'

    let conditions = eq(schema.prompts.ownerId, session.user.id);

    if (search) {
      conditions = and(
        conditions,
        or(
          ilike(schema.prompts.title, `%${search}%`),
          ilike(schema.prompts.content, `%${search}%`)
        )
      )!;
    }

    const orderCol =
      sortBy === "created_at"
        ? desc(schema.prompts.createdAt)
        : desc(schema.prompts.updatedAt);

    const userPrompts = await db
      .select()
      .from(schema.prompts)
      .where(conditions)
      .orderBy(orderCol);

    return NextResponse.json(userPrompts);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch prompts";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/prompts - create a new prompt
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const {
      title = "Untitled prompt",
      content = "",
      variableDefaults = {},
      modelConfig = {
        provider: "openai",
        model: "gpt-4o-mini",
        temperature: 0.7,
        maxTokens: 1000,
      },
    } = body;

    const id = `prompt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date();

    const [created] = await db
      .insert(schema.prompts)
      .values({
        id,
        ownerId: session.user.id,
        title: title || "Untitled prompt",
        content: content || "",
        variableDefaults: variableDefaults || {},
        modelConfig: modelConfig || {},
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create prompt";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
