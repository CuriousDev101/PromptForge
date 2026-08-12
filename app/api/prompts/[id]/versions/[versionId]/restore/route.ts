import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getServerSession } from "@/lib/auth/session";
import { db, schema } from "@/lib/db";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, versionId } = await params;

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

    // Retrieve the immutable version snapshot
    const [version] = await db
      .select()
      .from(schema.promptVersions)
      .where(
        and(
          eq(schema.promptVersions.id, versionId),
          eq(schema.promptVersions.promptId, id)
        )
      )
      .limit(1);

    if (!version) {
      return NextResponse.json({ error: "Version snapshot not found" }, { status: 404 });
    }

    // Restore the snapshot into the prompt's working state without altering history
    const snapshot = version.snapshot;
    const [restored] = await db
      .update(schema.prompts)
      .set({
        title: snapshot.title ?? prompt.title,
        content: snapshot.content ?? prompt.content,
        variableDefaults: snapshot.variableDefaults ?? prompt.variableDefaults,
        modelConfig: snapshot.modelConfig ?? prompt.modelConfig,
        updatedAt: new Date(),
      })
      .where(
        and(eq(schema.prompts.id, id), eq(schema.prompts.ownerId, session.user.id))
      )
      .returning();

    return NextResponse.json({
      success: true,
      restoredFromVersionId: versionId,
      prompt: restored,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to restore version";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
