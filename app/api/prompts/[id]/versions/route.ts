import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { getServerSession } from "@/lib/auth/session";
import { db, schema } from "@/lib/db";

// GET /api/prompts/[id]/versions
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership of the parent prompt
    const [prompt] = await db
      .select()
      .from(schema.prompts)
      .where(
        and(eq(schema.prompts.id, id), eq(schema.prompts.ownerId, session.user.id))
      )
      .limit(1);

    if (!prompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    const versions = await db
      .select()
      .from(schema.promptVersions)
      .where(eq(schema.promptVersions.promptId, id))
      .orderBy(desc(schema.promptVersions.createdAt));

    return NextResponse.json(versions);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch versions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/prompts/[id]/versions - Create immutable snapshot
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    // Verify ownership of the prompt
    const [prompt] = await db
      .select()
      .from(schema.prompts)
      .where(
        and(eq(schema.prompts.id, id), eq(schema.prompts.ownerId, session.user.id))
      )
      .limit(1);

    if (!prompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    const label = body.label || `Snapshot ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const snapshot = body.snapshot || {
      title: prompt.title,
      content: prompt.content,
      variableDefaults: prompt.variableDefaults,
      modelConfig: prompt.modelConfig,
    };

    const versionId = `ver_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const [created] = await db
      .insert(schema.promptVersions)
      .values({
        id: versionId,
        promptId: id,
        label,
        snapshot,
        createdAt: new Date(),
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create version";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
